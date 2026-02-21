import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Fetch lead with related data
    const { data: lead, error } = await supabase
      .from("leads")
      .select(`
        *,
        children (*),
        lead_status_history (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
      return NextResponse.json(
        { error: "Failed to fetch lead details" },
        { status: 500 }
      );
    }

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Sort history in JS since Supabase simple join doesn't support deep ordering easily without RPC or complex query
    // or we can just return them and sort on frontend. But let's sort here for convenience.
    
    if (lead.lead_status_history) {
        lead.lead_status_history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }


    return NextResponse.json({
      success: true,
      lead
    });

  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const data = await request.json();
    const { leadData, children = [], addedBy = "System" } = data;

    // Prepare lead update payload
    const leadPayload = {
      father_name: leadData.father_name,
      father_phone: leadData.father_phone,
      father_email: leadData.father_email,
      father_occupation: leadData.father_occupation,
      father_annual_income: leadData.father_annual_income,

      mother_name: leadData.mother_name,
      mother_phone: leadData.mother_phone,
      mother_email: leadData.mother_email,
      mother_occupation: leadData.mother_occupation,
      mother_annual_income: leadData.mother_annual_income,

      guardian_name: leadData.guardian_name,
      guardian_phone: leadData.guardian_phone,
      guardian_email: leadData.guardian_email,
      guardian_relationship: leadData.guardian_relationship,
      guardian_occupation: leadData.guardian_occupation,
      guardian_annual_income: leadData.guardian_annual_income,

      campaign: leadData.campaign,
      source: leadData.source,
      sub_source: leadData.sub_source,
      project: leadData.campaign,
      
      status: leadData.status,
      stage: leadData.stage
    };

    // Update lead
    const { data: updatedLead, error: leadError } = await supabase
      .from("leads")
      .update(leadPayload)
      .eq("id", id)
      .select()
      .single();

    if (leadError) {
      console.error("Error updating lead:", leadError);
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 }
      );
    }

    // Sync children: Delete and re-insert
    await supabase.from("children").delete().eq("lead_id", id);
    
    if (children.length > 0) {
      const childrenPayload = children.map(child => ({
        lead_id: id,
        name: child.name,
        intake_year: child.intake_year,
        grade: child.grade,
        date_of_birth: child.date_of_birth,
        gender: child.gender,
        address: child.address,
        blood_group: child.blood_group,
        previous_school: child.previous_school,
        reason_for_quitting: child.reason_for_quitting
      }));

      const { error: childrenError } = await supabase
        .from("children")
        .insert(childrenPayload);

      if (childrenError) {
        console.error("Error syncing children:", childrenError);
      }
    }

    // Log history
    await supabase
      .from("lead_status_history")
      .insert({
        lead_id: id,
        new_status: updatedLead.status,
        changed_by: addedBy,
        notes: "Lead updated via Dashboard inline edit"
      });

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead
    });

  } catch (error) {
    console.error("Patch lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
