import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET() {
  const users = db.prepare("SELECT id, username, why, medium FROM users").all();
  return NextResponse.json(users);
}
