import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data: existingLead, error } = await supabase
      .from("leads")
      .select(`
        id,
        application_no,
        father_name,
        father_phone,
        father_email,
        stage,
        status,
        created_at,
        campaign,
        children:children(id, name, grade)
      `)
      .or(`father_phone.ilike.%${cleanPhone}%,mother_phone.ilike.%${cleanPhone}%,guardian_phone.ilike.%${cleanPhone}%`)
      .eq("status", "Active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking lead:", error);
      return NextResponse.json(
        { error: "Failed to check lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: !!existingLead,
      lead: existingLead || null
    });

  } catch (error) {
    console.error("Check lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
