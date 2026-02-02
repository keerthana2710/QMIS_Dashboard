import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching contact:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contact: data
    });

  } catch (error) {
    console.error('Error in GET /api/contacts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
