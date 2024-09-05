import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

export async function GET(request, { params }) {
  const { userId, cycleId } = params;

  const cycle = db
    .prepare("SELECT * FROM cycles WHERE id = ? AND user_id = ?")
    .get(cycleId, userId);

  if (!cycle) {
    return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
  }

  return NextResponse.json(cycle);
}

export async function PATCH(request, { params }) {
  const { userId, cycleId } = params;
  const { reflection } = await request.json();

  try {
    const updateCycle = db.prepare(
      "UPDATE cycles SET reflection = ? WHERE id = ? AND user_id = ?"
    );
    const result = updateCycle.run(reflection, cycleId, userId);

    if (result.changes > 0) {
      const updatedCycle = db
        .prepare("SELECT * FROM cycles WHERE id = ?")
        .get(cycleId);
      return NextResponse.json(updatedCycle);
    } else {
      return NextResponse.json(
        { error: "Cycle not found or no changes made" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating cycle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
