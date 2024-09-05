import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function POST(request) {
  const { username, password } = await request.json();

  const user = db
    .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .get(username, password);

  if (user) {
    return NextResponse.json({ success: true, userId: user.id });
  } else {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }
}
