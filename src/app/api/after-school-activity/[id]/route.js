import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/after-school-activity/[id] - Get a specific activity enquiry by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('after_school_activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Activity enquiry not found' },
          { status: 404 },
        );
      }

      console.error('Error fetching activity enquiry:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity enquiry' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      activity: data,
    });
  } catch (error) {
    console.error('Error in GET /api/after-school-activity/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT /api/after-school-activity/[id] - Update a specific activity enquiry
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate allowed fields for update
    const allowedFields = [
      'status',
      'message',
      'name',
      'email',
      'phone',
      'activity_type',
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // If status is being updated, validate it
    if (updates.status) {
      const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 },
        );
      }
    }

    // If activity_type is being updated, validate it
    if (updates.activity_type) {
      const validActivityTypes = ['badminton', 'kidz-gym', 'school-activities'];
      if (!validActivityTypes.includes(updates.activity_type)) {
        return NextResponse.json(
          { error: 'Invalid activity type' },
          { status: 400 },
        );
      }
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('after_school_activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating activity enquiry:', error);
      return NextResponse.json(
        { error: 'Failed to update activity enquiry' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity enquiry updated successfully',
      activity: data,
    });
  } catch (error) {
    console.error('Error in PUT /api/after-school-activity/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE /api/after-school-activity/[id] - Delete a specific activity enquiry
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('after_school_activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity enquiry:', error);
      return NextResponse.json(
        { error: 'Failed to delete activity enquiry' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity enquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/after-school-activity/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
