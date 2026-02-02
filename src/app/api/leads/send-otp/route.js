import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWhatsAppOTP, generateOTP } from "@/lib/whatsappOtp";

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

    // Check for recent OTP (prevent spam)
    const { data: recentOtp } = await supabase
      .from("whatsapp_otps")
      .select("created_at")
      .eq("phone_number", cleanPhone)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const lastSent = new Date(recentOtp.created_at);
      const now = new Date();
      const diffSeconds = (now - lastSent) / 1000;

      if (diffSeconds < 30) {
        return NextResponse.json(
          { error: "Please wait 30 seconds before requesting new OTP" },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send WhatsApp OTP
    const whatsappResult = await sendWhatsAppOTP(phoneNumber, otp);

    if (!whatsappResult.success) {
      return NextResponse.json(
        { error: whatsappResult.error },
        { status: 400 }
      );
    }

    // Store OTP in database
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
      message: "WhatsApp OTP sent successfully",
      phoneNumber: cleanPhone,
      otpId: otpRecord.id,
      expiresAt: expiresAt.toISOString(),
      // For development only
      ...(process.env.NODE_ENV === 'development' && { demoOtp: otp })
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
