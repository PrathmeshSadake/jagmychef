import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public endpoint to get all notes in order
export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
