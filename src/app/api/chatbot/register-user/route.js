import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Dummy OTP — always "123456". Ready to swap with Firebase/Twilio later.
const DUMMY_OTP = '123456';

export async function POST(request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Please provide a valid 10-digit phone number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('chatbot_users')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (existingUser) {
      // User already registered — skip OTP, auto-verify
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'User already registered',
      });
    }

    // Insert new user
    const { data, error } = await supabase
      .from('chatbot_users')
      .insert([{ name: name.trim(), phone: cleanPhone }])
      .select()
      .single();

    if (error) {
      console.error('Error registering chatbot user:', error);
      return NextResponse.json(
        { error: 'Failed to register user' },
        { status: 500 }
      );
    }

    // In production, send real OTP here (Firebase / Twilio / WhatsApp)
    // For now, we just return success and the frontend knows OTP is "123456"
    return NextResponse.json({
      success: true,
      verified: false,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/chatbot/register-user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
