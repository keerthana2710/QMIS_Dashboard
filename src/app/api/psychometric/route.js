export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/psychometric — fetch leads with "Interview Scheduled" status
// and merge with any existing psychometric_tests records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const testConducted = searchParams.get('testConducted'); // 'true' | 'false'
    const grade = searchParams.get('grade');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Query from leads table — Interview Scheduled status
    let query = supabase
      .from('leads')
      .select(
        `
        id,
        application_no,
        father_name,
        father_email,
        father_phone,
        status,
        created_at,
        children(id, name, date_of_birth, gender, grade, previous_school, reason_for_quitting),
        psychometric_tests!psychometric_tests_lead_id_fkey(id, stage, test_conducted, counselor_name, grade, name, email, whatsapp_no, child_id)
      `,
        { count: 'exact' }
      )
      .in('status', ['Interview Scheduled', 'Interview Conducted', 'Admitted'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      query = query.gte('created_at', s.toISOString());
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      query = query.lte('created_at', e.toISOString());
    }

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Psychometric GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten: one row per child (or one row per lead if no children)
    const rows = [];
    for (const lead of leads || []) {
      const children = lead.children || [];

      if (children.length === 0) {
        // no child yet — show lead row without child
        const existingTest = (lead.psychometric_tests || []).find(t => !t.child_id) || null;

        // Apply grade filter
        if (grade && existingTest?.grade !== grade) continue;
        // Apply testConducted filter
        if (testConducted === 'true' && !existingTest?.test_conducted) continue;
        if (testConducted === 'false' && existingTest?.test_conducted) continue;

        rows.push({
          lead_id: lead.id,
          child_id: null,
          application_no: lead.application_no,
          name: lead.father_name || '—',
          grade: existingTest?.grade || null,
          email: lead.father_email || null,
          whatsapp_no: lead.father_phone || null,
          counselor_name: existingTest?.counselor_name || null,
          stage: existingTest?.stage || 'Test Pending',
          test_conducted: existingTest?.test_conducted || false,
          test_id: existingTest?.id || null,
        });
      } else {
        for (const child of children) {
          const existingTest = (lead.psychometric_tests || []).find(t => t.child_id === child.id) || null;

          // Apply grade filter
          const childGrade = child.grade || existingTest?.grade;
          if (grade && childGrade !== grade) continue;
          // Apply testConducted filter
          if (testConducted === 'true' && !existingTest?.test_conducted) continue;
          if (testConducted === 'false' && existingTest?.test_conducted) continue;

          rows.push({
            lead_id: lead.id,
            child_id: child.id,
            application_no: lead.application_no,
            name: child.name || lead.father_name || '—',
            grade: child.grade || null,
            email: lead.father_email || null,
            whatsapp_no: lead.father_phone || null,
            counselor_name: existingTest?.counselor_name || null,
            stage: existingTest?.stage || 'Test Pending',
            test_conducted: existingTest?.test_conducted || false,
            test_id: existingTest?.id || null,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      tests: rows,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('Psychometric list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/psychometric — get-or-create a psychometric_tests record
export async function POST(request) {
  try {
    const body = await request.json();
    const { lead_id, child_id, application_no, grade, name, email, whatsapp_no } = body;

    if (!lead_id || !application_no || !name) {
      return NextResponse.json(
        { error: 'lead_id, application_no and name are required' },
        { status: 400 }
      );
    }

    // Check if a record already exists
    let existingQuery = supabase
      .from('psychometric_tests')
      .select('id')
      .eq('lead_id', lead_id);

    if (child_id) {
      existingQuery = existingQuery.eq('child_id', child_id);
    } else {
      existingQuery = existingQuery.is('child_id', null);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ success: true, test: existing });
    }

    // Create new record
    const { data, error } = await supabase
      .from('psychometric_tests')
      .insert({
        lead_id,
        child_id: child_id || null,
        application_no,
        grade: grade || null,
        name,
        email: email || null,
        whatsapp_no: whatsapp_no || null,
        stage: 'Test Pending',
        test_conducted: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Psychometric POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, test: data }, { status: 201 });
  } catch (err) {
    console.error('Psychometric create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
