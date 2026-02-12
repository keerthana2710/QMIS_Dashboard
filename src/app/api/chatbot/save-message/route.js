import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { phone, message, response } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert([{
        phone: phone.replace(/\D/g, ''),
        message,
        response: response || '',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving chatbot message:', error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message saved successfully',
      data,
    });
  } catch (error) {
    console.error('Error in POST /api/chatbot/save-message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
