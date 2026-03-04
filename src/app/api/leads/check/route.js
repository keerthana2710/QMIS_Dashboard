import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();
    console.log("Incoming lead check request for phoneNumber:", phoneNumber);

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const searchPattern = `%${cleanPhone.split('').join('%')}%`;
    console.log("Cleaned phone:", cleanPhone, "Search pattern:", searchPattern);

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
      .or(`father_phone.ilike.${searchPattern},mother_phone.ilike.${searchPattern},guardian_phone.ilike.${searchPattern}`)
      .eq("status", "Active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("Query result for existingLead:", existingLead ? `Found: ${existingLead.id}` : "Not found");

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
