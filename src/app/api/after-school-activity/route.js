import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST /api/after-school-activity - Create a new after school activity enquiry
export async function POST(request) {
  try {
    const formData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'activityType'];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 },
      );
    }

    // Validate activityType value
    const validActivityTypes = ['badminton', 'kidz-gym', 'school-activities'];
    if (!validActivityTypes.includes(formData.activityType)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 },
      );
    }

    // Insert activity enquiry into database
    const { data, error } = await supabase
      .from('after_school_activities')
      .insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          activity_type: formData.activityType,
          message: formData.message?.trim() || '',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating after school activity enquiry:', error);
      return NextResponse.json(
        { error: 'Failed to create enquiry' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Enquiry submitted successfully',
        activity: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error in POST /api/after-school-activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// GET /api/after-school-activity - List all activity enquiries with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const activityType = searchParams.get('activityType') || '';
    const status = searchParams.get('status') || '';
    const dateFilter = searchParams.get('dateFilter') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('after_school_activities')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`,
      );
    }

    // Apply activity type filter
    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply date filters
    if (dateFilter) {
      const now = new Date();
      let startDateFilter;

      switch (dateFilter) {
        case 'today':
          startDateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDateFilter = new Date(
            yesterday.setHours(0, 0, 0, 0),
          ).toISOString();
          const endOfYesterday = new Date(yesterday);
          endOfYesterday.setHours(23, 59, 59, 999);
          query = query.lte('created_at', endOfYesterday.toISOString());
          break;
        case 'last7days':
          startDateFilter = new Date(
            now.setDate(now.getDate() - 7),
          ).toISOString();
          break;
        case 'last30days':
          startDateFilter = new Date(
            now.setDate(now.getDate() - 30),
          ).toISOString();
          break;
        case 'thisMonth':
          startDateFilter = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          ).toISOString();
          break;
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          startDateFilter = lastMonth.toISOString();
          const endOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999,
          );
          query = query.lte('created_at', endOfLastMonth.toISOString());
          break;
      }

      if (startDateFilter) {
        query = query.gte('created_at', startDateFilter);
      }
    }

    // Apply custom date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query = query.gte('created_at', start.toISOString());
      query = query.lte('created_at', end.toISOString());
    }

    // Apply sorting
    const validSortFields = [
      'created_at',
      'updated_at',
      'name',
      'email',
      'activity_type',
      'status',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    query = query.order(sortField, { ascending: order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching after school activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch enquiries' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      activities: data,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/after-school-activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
