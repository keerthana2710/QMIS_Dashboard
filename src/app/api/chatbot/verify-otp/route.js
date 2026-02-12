import { NextResponse } from 'next/server';

// Dummy OTP — always "123456". Ready to swap with Firebase/Twilio later.
const DUMMY_OTP = '123456';

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    // Dummy validation — accept "123456" for any phone
    if (otp !== DUMMY_OTP) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/chatbot/verify-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
