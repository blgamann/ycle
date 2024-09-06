import { NextResponse } from "next/server";
import supabase from "../../lib/db";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, why, medium");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userData = await request.json();
    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
