import { NextResponse } from "next/server";
import supabase from "../../../lib/db";

export async function GET(request, { params }) {
  const { userId } = params;

  try {
    const { data, error } = await supabase
      .from("cycles")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching cycles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const { userId } = params;
  const cycleData = await request.json();

  try {
    const { data, error } = await supabase
      .from("cycles")
      .insert({ ...cycleData, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating cycle:", error);
    return NextResponse.json(
      { error: "Failed to create cycle" },
      { status: 500 }
    );
  }
}
