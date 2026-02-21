import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Search
    const search = searchParams.get('search') || '';

    // Filters
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const campaign = searchParams.get('campaign');
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const addedBy = searchParams.get('addedBy');
    const verified = searchParams.get('verified');
    const project = searchParams.get('project');
    const intakeYear = searchParams.get('intakeYear');
    const grade = searchParams.get('grade');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('API Request Filters:', {
      search, status, stage, campaign, source,
      startDate, endDate, addedBy, verified,
      project, intakeYear, grade,
      page, limit, sortBy, sortOrder
    });

    // 1. Build Query
    // Use !inner for children if filtering by grade or intakeYear to ensure we only get leads with matching children
    let selectString = '*, children:children(id, name, grade, intake_year)';
    if (grade || intakeYear) {
      selectString = '*, children:children!inner(id, name, grade, intake_year)';
    }

    let query = supabase
      .from("leads")
      .select(selectString, { count: 'exact' });

    // 2. Apply Filters
    
    // Search
    if (search) {
      query = query.or(`father_name.ilike.%${search}%,father_phone.ilike.%${search}%,application_no.ilike.%${search}%,father_email.ilike.%${search}%,mother_name.ilike.%${search}%,mother_phone.ilike.%${search}%`);
    }

    if (status) query = query.eq('status', status.toLowerCase());
    if (stage) query = query.eq('stage', stage);
    if (campaign) query = query.eq('campaign', campaign);
    if (source) query = query.eq('source', source);
    if (addedBy) query = query.eq('added_by', addedBy);
    if (project) query = query.eq('project', project);
    
    // Intake Year checks removed from here as it is on children table

    // WhatsApp verified
    if (verified === 'true') {
      query = query.eq('whatsapp_verified', true);
    } else if (verified === 'false') {
      query = query.eq('whatsapp_verified', false);
    }

    // Date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte('created_at', start.toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    // Children Filters (Grade & Intake Year)
    if (grade) {
      query = query.eq('children.grade', grade);
    }
    if (intakeYear) {
      query = query.eq('children.intake_year', intakeYear);
    }

    // 3. Apply Sorting & Pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // 4. Execute Query (Single Round Trip)
    const { data: leads, error, count } = await query;

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads", details: error.message },
        { status: 500 }
      );
    }

    console.log('API Response:', {
      count: leads?.length || 0,
      total: count,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      leads: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error("List leads error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
