import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Get all form fields
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const position = formData.get('position');
    const educationQualification = formData.get('education_qualification');
    const gender = formData.get('gender');
    const address = formData.get('address');
    const resumeFile = formData.get('resume');

    console.log('📝 Received career application');

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'position', 'resume'];
    const missingFields = requiredFields.filter(field => {
      const value = field === 'resume' ? resumeFile : formData.get(field);
      return !value || (typeof value === 'string' && !value.trim());
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Format phone (ensure +91)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+91')) {
      const digits = formattedPhone.replace(/\D/g, '');
      formattedPhone = digits.length === 10 ? `+91${digits}` : `+91${digits.slice(-10)}`;
    }

    // Validate phone has 10 digits after +91
    if (!/^\+91[0-9]{10}$/.test(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 10 digits after +91' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];

    if (!allowedTypes.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, RTF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (resumeFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Upload resume
    console.log('📤 Uploading resume...');
    const timestamp = Date.now();
    const cleanName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `careers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resumeFile);

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload resume' },
        { status: 500 }
      );
    }

    // Get file URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    // Save to database
    console.log('💾 Saving to database...');
    const { data, error: dbError } = await supabase
      .from('careers_applications')
      .insert([{
        name: name.trim(),
        email: email.trim(),
        phone: formattedPhone,
        position: position.trim(),
        education_qualification: educationQualification?.trim() || null,
        gender: gender || null,
        address: address?.trim() || null,
        resume_url: urlData.publicUrl,
        resume_file_name: resumeFile.name,
        resume_file_size: resumeFile.size,
        resume_file_type: resumeFile.type
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('resumes').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save application' },
        { status: 500 }
      );
    }

    console.log('✅ Application saved successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully!',
        application: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const position = searchParams.get('position') || '';
    const gender = searchParams.get('gender') || '';
    const dateFilter = searchParams.get('dateFilter') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('careers_applications')
      .select('*', { count: 'exact' });

    // Search
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,position.ilike.%${search}%`);
    }

    // Position filter
    if (position) {
      query = query.eq('position', position);
    }

    // Gender filter
    if (gender) {
      query = query.eq('gender', gender);
    }

    // Date filters
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

    // Custom date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query = query.gte('created_at', start.toISOString());
      query = query.lte('created_at', end.toISOString());
    }

    // Get data with pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applications: data,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit: limit
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
