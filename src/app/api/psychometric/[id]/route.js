export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/psychometric/[id] — get full test record with sub-assessments
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const { data: test, error } = await supabase
      .from('psychometric_tests')
      .select(
        `
        *,
        child:children(id, name, date_of_birth, gender, grade, previous_school, reason_for_quitting, intake_year),
        lead:leads!psychometric_tests_lead_id_fkey(id, father_name, father_email, father_phone, status),
        emotional_analysis(*),
        cognitive_skills(*),
        academic_assessment(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Psychometric GET [id] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, test });
  } catch (err) {
    console.error('Psychometric get-by-id error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/psychometric/[id] — update top-level test fields (stage, counselor, etc.)
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('psychometric_tests')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, test: data });
  } catch (err) {
    console.error('Psychometric PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/psychometric/[id] — delete test and all sub-assessments
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Delete sub-assessments first
    await supabase.from('emotional_analysis').delete().eq('test_id', id);
    await supabase.from('cognitive_skills').delete().eq('test_id', id);
    await supabase.from('academic_assessment').delete().eq('test_id', id);

    const { error } = await supabase.from('psychometric_tests').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Psychometric test deleted successfully' });
  } catch (err) {
    console.error('Delete psychometric error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
