import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/psychometric/[id]/cognitive — upsert cognitive skills
export async function POST(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();

    const payload = {
      test_id: id,
      attention_to_detail: body.attention_to_detail ?? null,
      attention_to_detail_notes: body.attention_to_detail_notes ?? null,
      creative_thinking: body.creative_thinking ?? null,
      creative_thinking_notes: body.creative_thinking_notes ?? null,
      problem_solving: body.problem_solving ?? null,
      problem_solving_notes: body.problem_solving_notes ?? null,
      memory: body.memory ?? null,
      memory_notes: body.memory_notes ?? null,
      cognitive_summary: body.cognitive_summary ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cognitive_skills')
      .upsert(payload, { onConflict: 'test_id' })
      .select()
      .single();

    if (error) {
      console.error('Cognitive skills save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the psychometric test stage
    await supabase
      .from('psychometric_tests')
      .update({ stage: 'Cognitive Done', updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Cognitive POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
