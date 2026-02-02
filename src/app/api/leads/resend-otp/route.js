import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateOTP, sendWhatsAppOTP } from "@/lib/whatsappOtp";

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Check resend attempts in last hour
    const { count } = await supabase
      .from("whatsapp_otps")
      .select("*", { count: 'exact', head: true })
      .eq("phone_number", cleanPhone)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (count >= 5) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Send new WhatsApp OTP
    const whatsappResult = await sendWhatsAppOTP(phoneNumber, otp);

    if (!whatsappResult.success) {
      return NextResponse.json(
        { error: whatsappResult.error },
        { status: 400 }
      );
    }

    // Store new OTP
    const { data: otpRecord, error: dbError } = await supabase
      .from("whatsapp_otps")
      .insert({
        phone_number: cleanPhone,
        otp: otp,
        purpose: 'lead_verification',
        message_id: whatsappResult.messageId,
        status: 'sent',
        expires_at: expiresAt.toISOString(),
        verified: false
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to store OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP resent successfully",
      phoneNumber: cleanPhone,
      otpId: otpRecord.id,
      expiresAt: expiresAt.toISOString(),
      ...(process.env.NODE_ENV === 'development' && { demoOtp: otp })
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
