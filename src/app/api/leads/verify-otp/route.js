import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Find valid OTP
    const { data: otpRecord, error } = await supabase
      .from("whatsapp_otps")
      .select("*")
      .eq("phone_number", cleanPhone)
      .eq("otp", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpRecord) {
      // Increment attempts for failed verification
      if (!otpRecord) {
        await supabase
          .from("whatsapp_otps")
          .update({ attempts: (otpRecord?.attempts || 0) + 1 })
          .eq("phone_number", cleanPhone)
          .eq("verified", false)
          .gte("expires_at", new Date().toISOString());
      }

      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from("whatsapp_otps")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        status: 'verified'
      })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("Error updating OTP:", updateError);
      return NextResponse.json(
        { error: "Failed to verify OTP" },
        { status: 500 }
      );
    }

    // Create verification token
    const verificationToken = Buffer.from(
      JSON.stringify({
        phone: cleanPhone,
        verifiedAt: new Date().toISOString(),
        otpId: otpRecord.id,
        exp: Date.now() + 30 * 60 * 1000 // 30 minutes expiry
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      phoneNumber: cleanPhone,
      token: verificationToken,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
