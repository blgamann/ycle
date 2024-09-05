import { NextResponse } from "next/server";
import db from "../../../../../../lib/db";

export async function GET(request, { params }) {
  const { cycleId } = params;

  const comments = db
    .prepare(
      `
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id 
    WHERE cycle_id = ? 
    ORDER BY created_at DESC
  `
    )
    .all(cycleId);

  return NextResponse.json(comments);
}

export async function POST(request, { params }) {
  const { cycleId } = params;
  const body = await request.json();

  console.log("Received POST request for cycleId:", cycleId);
  console.log("Request body:", body);

  try {
    const { userId, content } = body;

    const insertComment = db.prepare(
      "INSERT INTO comments (cycle_id, user_id, content) VALUES (?, ?, ?)"
    );
    const result = insertComment.run(cycleId, userId, content);

    console.log("Insert result:", result);

    if (result.changes > 0) {
      const newComment = db
        .prepare(
          `
        SELECT comments.*, users.username 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.id = ?
      `
        )
        .get(result.lastInsertRowid);

      console.log("New comment:", newComment);
      return NextResponse.json(newComment);
    } else {
      console.error("Failed to insert comment");
      return NextResponse.json(
        { error: "Failed to insert comment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error inserting comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
