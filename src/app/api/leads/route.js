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

    // Filters - support all frontend filters
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const campaign = searchParams.get('campaign');
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const addedBy = searchParams.get('addedBy');
    const verified = searchParams.get('verified');
    const payment = searchParams.get('payment');
    const project = searchParams.get('project');
    const intakeYear = searchParams.get('intakeYear');
    const grade = searchParams.get('grade');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('API Request Filters:', {
      search, status, stage, campaign, source,
      startDate, endDate, addedBy, verified,
      payment, project, intakeYear, grade,
      page, limit, sortBy, sortOrder
    });

    // Build query
    let query = supabase
      .from("leads")
      .select(`
        *,
        children:children(id, name, grade)
      `, { count: 'exact' });

    // Apply search
    if (search) {
      query = query.or(`
        father_name.ilike.%${search}%,
        father_phone.ilike.%${search}%,
        application_no.ilike.%${search}%,
        father_email.ilike.%${search}%,
        mother_name.ilike.%${search}%,
        mother_phone.ilike.%${search}%
      `);
    }

    // Apply filters
    if (status) query = query.eq('status', status.toLowerCase());
    if (stage) query = query.eq('stage', stage);
    if (campaign) query = query.eq('campaign', campaign);
    if (source) query = query.eq('source', source);
    if (addedBy) query = query.eq('added_by', addedBy);
    if (payment) query = query.eq('payment_status', payment);
    if (project) query = query.eq('project', project);

    // Handle intake year - assuming it's stored in lead data
    if (intakeYear) {
      // You might need to adjust this based on how intake year is stored
      query = query.eq('intake_year', intakeYear);
    }

    // Handle grade filter - filter by children's grade
    if (grade) {
      query = query.contains('children', [{ grade: grade }]);
    }

    // Handle WhatsApp verified filter
    if (verified === 'true') {
      query = query.eq('whatsapp_verified', true);
    } else if (verified === 'false') {
      query = query.eq('whatsapp_verified', false);
    }

    // Date range
    if (startDate) {
      const startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);
      query = query.gte('created_at', startDateObj.toISOString());
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateObj.toISOString());
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Get total count
    const { data: allData, error: countError } = await query;

    if (countError) {
      console.error("Count error:", countError);
      throw countError;
    }

    const total = allData ? allData.length : 0;

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: leads, error } = await query;

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads", details: error.message },
        { status: 500 }
      );
    }

    console.log('API Response:', {
      count: leads?.length || 0,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      leads: leads || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
