import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { phone } = await params;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('chatbot_users')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching chatbot messages:', msgError);
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error in GET /api/chatbot/get-conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
