import { NextResponse } from "next/server";
import supabase from "../../../../../../lib/db";

export async function GET(request, { params }) {
  const { userId, cycleId } = params;

  try {
    const { data, error } = await supabase
      .from("cycles")
      .select("*")
      .eq("id", cycleId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching cycle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { userId, cycleId } = params;
  const { reflection } = await request.json();

  try {
    const { data, error } = await supabase
      .from("cycles")
      .update({ reflection })
      .eq("id", cycleId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Cycle not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating cycle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
