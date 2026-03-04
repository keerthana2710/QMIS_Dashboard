export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/dashboard
// Returns stats, monthly leads, status breakdown, campaign breakdown, grade breakdown.
// Accepts optional query params: startDate, endDate, campaign, project, intakeYear, grade
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const campaign = searchParams.get('campaign');
    const project = searchParams.get('project');
    const intakeYear = searchParams.get('intakeYear');

    // ── 1. Fetch leads with filters ────────────────────────────────────────────
    let leadsQuery = supabase.from('leads').select('id, status, campaign, created_at');
    if (startDate) leadsQuery = leadsQuery.gte('created_at', startDate);
    if (endDate) leadsQuery = leadsQuery.lte('created_at', endDate + 'T23:59:59');
    if (campaign) leadsQuery = leadsQuery.eq('campaign', campaign);
    if (project) leadsQuery = leadsQuery.eq('project', project);

    const { data: leads, error: leadsError } = await leadsQuery;
    if (leadsError) throw leadsError;

    // ── 2. Status counts ───────────────────────────────────────────────────────
    const statusMap = {};
    for (const lead of leads || []) {
      const s = lead.status || 'Unknown';
      statusMap[s] = (statusMap[s] || 0) + 1;
    }
    const STATUS_ORDER = [
      'Enquiry',
      'Application Purchased',
      'Interview Scheduled',
      'Interview Conducted',
      'Admitted',
    ];
    const statusCounts = STATUS_ORDER.map((stage) => ({
      stage,
      count: statusMap[stage] || 0,
    }));
    // append any statuses not in the order list
    for (const [stage, count] of Object.entries(statusMap)) {
      if (!STATUS_ORDER.includes(stage)) statusCounts.push({ stage, count });
    }

    // ── 3. Monthly data (last 6 months) ───────────────────────────────────────
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        leads: 0,
        admitted: 0,
      };
    });

    for (const lead of leads || []) {
      const key = (lead.created_at || '').substring(0, 7);
      const m = months.find((x) => x.key === key);
      if (m) {
        m.leads++;
        if (lead.status === 'Admitted') m.admitted++;
      }
    }

    // ── 4. Campaign breakdown ──────────────────────────────────────────────────
    const campaignMap = {};
    for (const lead of leads || []) {
      const c = lead.campaign || 'Unknown';
      if (!campaignMap[c]) campaignMap[c] = {};
      campaignMap[c][lead.status] = (campaignMap[c][lead.status] || 0) + 1;
    }
    const campaigns = Object.entries(campaignMap).map(([name, statuses]) => ({
      name,
      statuses: STATUS_ORDER.map((stage) => ({
        stage,
        count: statuses[stage] || 0,
      })),
      total: Object.values(statuses).reduce((a, b) => a + b, 0),
    }));

    // ── 5. Children by grade ───────────────────────────────────────────────────
    let childrenQuery = supabase.from('children').select('grade');
    if (intakeYear) childrenQuery = childrenQuery.eq('intake_year', intakeYear);

    const { data: children } = await childrenQuery;

    const GRADE_ORDER = [
      'Pre KG', 'KG 1', 'KG 2',
      'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
      'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9',
      'Grade 10', 'Grade 11', 'Grade 12',
    ];
    const gradeMap = {};
    for (const child of children || []) {
      if (child.grade) gradeMap[child.grade] = (gradeMap[child.grade] || 0) + 1;
    }
    const gradeCounts = GRADE_ORDER
      .filter((g) => gradeMap[g] !== undefined)
      .map((grade) => ({ grade, count: gradeMap[grade] }));
    // Append unknown grades
    for (const [grade, count] of Object.entries(gradeMap)) {
      if (!GRADE_ORDER.includes(grade)) gradeCounts.push({ grade, count });
    }

    // ── 6. Scalar stats ────────────────────────────────────────────────────────
    const { count: testsCompleted } = await supabase
      .from('psychometric_tests')
      .select('id', { count: 'exact', head: true })
      .eq('test_conducted', true);

    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads: (leads || []).length,
        admitted: statusMap['Admitted'] || 0,
        testsCompleted: testsCompleted || 0,
        contacts: contactsCount || 0,
      },
      statusCounts,
      monthlyData: months.map(({ month, leads, admitted }) => ({
        month,
        leads,
        admitted,
      })),
      campaigns,
      gradeCounts,
      totalCount: (leads || []).length,
      childCount: (children || []).length,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
