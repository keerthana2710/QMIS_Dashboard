import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp) {
      return { valid: false, error: "Verification token expired" };
    }

    // Check if token was issued within last 30 minutes
    const verifiedAt = new Date(decoded.verifiedAt);
    const now = new Date();
    const tokenAge = (now - verifiedAt) / (1000 * 60);

    if (tokenAge > 30) {
      return { valid: false, error: "Verification expired. Please verify again." };
    }

    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: "Invalid verification token" };
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      verificationToken,
      leadData,
      children = [],
      userId = null,
      addedBy = "System"
    } = data;

    // Verify token
    const tokenResult = verifyToken(verificationToken);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 401 }
      );
    }

    const verifiedPhone = tokenResult.data.phone;
    const leadPhone = leadData.father.phone.replace(/\D/g, '');

    if (verifiedPhone !== leadPhone) {
      return NextResponse.json(
        { error: "Phone number verification failed" },
        { status: 401 }
      );
    }

    // Check for duplicate lead
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id, application_no")
      .or(`father_phone.ilike.%${leadPhone}%`)
      .eq("status", "Active")
      .maybeSingle();

    if (existingLead) {
      return NextResponse.json({
        success: false,
        error: "A lead with this phone number already exists",
        existingLead: existingLead
      }, { status: 409 });
    }

    // Prepare lead data
    const leadPayload = {
      father_name: leadData.father.name,
      father_phone: leadData.father.phone,
      father_email: leadData.father.email,
      father_occupation: leadData.father.occupation,
      father_annual_income: leadData.father.annualIncome,

      mother_name: leadData.mother?.name,
      mother_phone: leadData.mother?.phone,
      mother_email: leadData.mother?.email,
      mother_occupation: leadData.mother?.occupation,
      mother_annual_income: leadData.mother?.annualIncome,

      guardian_name: leadData.guardian?.name,
      guardian_phone: leadData.guardian?.phone,
      guardian_email: leadData.guardian?.email,
      guardian_relationship: leadData.guardian?.relationship,
      guardian_occupation: leadData.guardian?.occupation,
      guardian_annual_income: leadData.guardian?.annualIncome,

      campaign: leadData.project?.campaign,
      source: leadData.project?.source,
      sub_source: leadData.project?.subSource,
      project: leadData.project?.campaign,

      whatsapp_no: leadData.father.phone,
      added_by: addedBy,
      created_by_user_id: userId,
      whatsapp_verified: true,
      verification_token: verificationToken,
      verified_at: new Date().toISOString(),
      status: "Active",
      stage: "New",
      payment_status: "Pending"
    };

    // Insert lead
    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert(leadPayload)
      .select(`
        id,
        application_no,
        father_name,
        father_phone,
        father_email,
        stage,
        status,
        campaign,
        source,
        sub_source,
        created_at,
        whatsapp_verified
      `)
      .single();

    if (leadError) {
      console.error("Error creating lead:", leadError);
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      );
    }

    // Insert children if any
    let createdChildren = [];
    if (children.length > 0) {
      const childrenPayload = children.map(child => ({
        lead_id: newLead.id,
        name: child.name,
        intake_year: child.intakeYear,
        grade: child.grade,
        date_of_birth: child.dateOfBirth,
        gender: child.gender,
        address: child.address,
        blood_group: child.bloodGroup,
        previous_school: child.previousSchool,
        reason_for_quitting: child.reasonForQuitting
      }));

      const { data: childrenData, error: childrenError } = await supabase
        .from("children")
        .insert(childrenPayload)
        .select();

      if (childrenError) {
        console.error("Error creating children:", childrenError);
        // Lead was created but children failed
      } else {
        createdChildren = childrenData;
      }
    }

    // Create status history
    await supabase
      .from("lead_status_history")
      .insert({
        lead_id: newLead.id,
        new_status: "New",
        changed_by: addedBy,
        notes: "Lead created with WhatsApp verification"
      });

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      lead: newLead,
      children: createdChildren,
      applicationNo: newLead.application_no
    });

  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
