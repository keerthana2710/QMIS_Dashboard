import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'message'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert contact into database
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || '',
        message: formData.message,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contact created successfully',
        contact: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/contacts - List all contacts with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const dateFilter = searchParams.get('dateFilter') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply date filters
    if (dateFilter) {
      const now = new Date();
      let startDateFilter;

      switch (dateFilter) {
        case 'today':
          startDateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'last7days':
          startDateFilter = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case 'last30days':
          startDateFilter = new Date(now.setDate(now.getDate() - 30)).toISOString();
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

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: data,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error in GET /api/contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
