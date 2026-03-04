import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/psychometric/[id]/emotional — upsert emotional analysis
export async function POST(request, { params }) {
  const { id } = params; // id = psychometric_test id

  try {
    const body = await request.json();

    const payload = {
      test_id: id,
      comfort_security: body.comfort_security ?? null,
      comfort_security_notes: body.comfort_security_notes ?? null,
      expressiveness: body.expressiveness ?? null,
      expressiveness_notes: body.expressiveness_notes ?? null,
      happiness: body.happiness ?? null,
      happiness_notes: body.happiness_notes ?? null,
      social_interaction: body.social_interaction ?? null,
      social_interaction_notes: body.social_interaction_notes ?? null,
      adaptability: body.adaptability ?? null,
      adaptability_notes: body.adaptability_notes ?? null,
      emotional_summary: body.emotional_summary ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('emotional_analysis')
      .upsert(payload, { onConflict: 'test_id' })
      .select()
      .single();

    if (error) {
      console.error('Emotional analysis save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the psychometric test stage
    await supabase
      .from('psychometric_tests')
      .update({ stage: 'Emotional Done', updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Emotional POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
