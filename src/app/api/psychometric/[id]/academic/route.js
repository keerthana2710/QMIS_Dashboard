export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/psychometric/[id]/academic — upsert academic assessment
// Also marks test_conducted = true and updates lead status to "Interview Conducted"
export async function POST(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();

    const payload = {
      test_id: id,
      // Gross Motor
      walk_on_floor: body.walk_on_floor ?? null,
      walk_on_floor_notes: body.walk_on_floor_notes ?? 'Taking the kid around',
      able_to_jump: body.able_to_jump ?? null,
      able_to_jump_notes: body.able_to_jump_notes ?? 'Taking the kid around',
      climbs_stairs: body.climbs_stairs ?? null,
      climbs_stairs_notes: body.climbs_stairs_notes ?? 'Taking the kid around',
      // Fine Motor
      pincer_grip: body.pincer_grip ?? null,
      pincer_grip_notes: body.pincer_grip_notes ?? 'Coloring and writing',
      coloring: body.coloring ?? null,
      coloring_notes: body.coloring_notes ?? 'Coloring and writing',
      // Eye-Hand
      string_boards: body.string_boards ?? null,
      string_boards_notes: body.string_boards_notes ?? null,
      // Language
      communication: body.communication ?? null,
      communication_notes: body.communication_notes ?? 'Interaction with the admission team staff/KG teacher',
      // Socio-Emotional
      comfortable_in_new_environment: body.comfortable_in_new_environment ?? null,
      comfortable_notes: body.comfortable_notes ?? 'Interaction with the admission team staff/KG teacher',
      // Writing
      identification: body.identification ?? null,
      identification_notes: body.identification_notes ?? 'Coloring and Writing',
      sequencing: body.sequencing ?? null,
      sequencing_notes: body.sequencing_notes ?? 'Coloring and Writing',
      academic_summary: body.academic_summary ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('academic_assessment')
      .upsert(payload, { onConflict: 'test_id' })
      .select()
      .single();

    if (error) {
      console.error('Academic assessment save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark test as conducted
    const { data: updatedTest, error: testError } = await supabase
      .from('psychometric_tests')
      .update({
        test_conducted: true,
        test_conducted_date: new Date().toISOString(),
        stage: 'Test Conducted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('lead_id')
      .single();

    if (testError) {
      console.error('Test update error:', testError);
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }

    // Update lead status to "Interview Conducted" and record history
    if (updatedTest?.lead_id) {
      // Fetch current status before updating
      const { data: currentLead } = await supabase
        .from('leads')
        .select('status')
        .eq('id', updatedTest.lead_id)
        .single();

      const { error: leadError } = await supabase
        .from('leads')
        .update({
          status: 'Interview Conducted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedTest.lead_id);

      if (leadError) {
        console.error('Lead status update error:', leadError);
        // Non-fatal: still return success since academic data was saved
      } else {
        // Record status history
        await supabase.from('lead_status_history').insert({
          lead_id: updatedTest.lead_id,
          old_status: currentLead?.status || null,
          new_status: 'Interview Conducted',
          changed_by: 'Psychometric Assessment',
          notes: `Psychometric test completed (test id: ${id})`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Assessment complete. Test marked as conducted and lead status updated.',
    });
  } catch (err) {
    console.error('Academic POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
