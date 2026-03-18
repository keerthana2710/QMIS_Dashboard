export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/careers/[id]
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const { data, error } = await supabase
      .from('careers_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/careers/[id] — also removes the resume file from storage
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Fetch record first to get the resume path
    const { data: app } = await supabase
      .from('careers_applications')
      .select('resume_url, resume_file_name')
      .eq('id', id)
      .single();

    // Delete from DB
    const { error } = await supabase
      .from('careers_applications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Try to remove the stored resume file (best-effort — don't fail if missing)
    if (app?.resume_url) {
      try {
        const url   = new URL(app.resume_url);
        const parts = url.pathname.split('/resumes/');
        if (parts[1]) {
          await supabase.storage.from('resumes').remove([decodeURIComponent(parts[1])]);
        }
      } catch { /* ignore storage cleanup errors */ }
    }

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Delete career application error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
