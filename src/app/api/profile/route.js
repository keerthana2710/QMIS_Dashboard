import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function PUT(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      return NextResponse.json(
        { error: `Unauthorized - ${error}` },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const { username } = await request.json();

    // Validate username
    if (!username || username.trim() === "") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", trimmedUsername)
      .neq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Supabase check error:", checkError);
      return NextResponse.json(
        { error: "Error checking username availability" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        username: trimmedUsername,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, email, username, role, created_at, updated_at")
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update username" },
        { status: 500 }
      );
    }

    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET;

    const newToken = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Username updated successfully",
        user: updatedUser,
        token: newToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update username error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
