import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(request, { params }) {
  const { userId } = params;

  const user = db
    .prepare("SELECT id, username, why, medium FROM users WHERE id = ?")
    .get(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const cycles = db
    .prepare("SELECT * FROM cycles WHERE user_id = ? ORDER BY date DESC")
    .all(userId);

  return NextResponse.json({ user, cycles });
}
