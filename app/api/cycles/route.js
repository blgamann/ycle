import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function POST(request) {
  const { userId, date, activity, participants, reflection } =
    await request.json();

  try {
    const insertCycle = db.prepare(
      "INSERT INTO cycles (user_id, date, activity, participants, reflection) VALUES (?, ?, ?, ?, ?)"
    );
    const result = insertCycle.run(
      userId,
      date,
      activity,
      participants,
      reflection
    );

    if (result.changes > 0) {
      return NextResponse.json({ success: true, id: result.lastInsertRowid });
    } else {
      return NextResponse.json(
        { error: "Failed to insert cycle" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error inserting cycle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
