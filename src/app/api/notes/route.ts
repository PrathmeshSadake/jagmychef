import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Fetch all notes sorted by order
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

// POST - Create a new note
export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Get the highest current order
    const highestOrder = await prisma.note.findFirst({
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Create the new note
    const note = await prisma.note.create({
      data: {
        content,
        order: newOrder,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// PUT - Update notes order (bulk update)
export async function PUT(request: Request) {
  try {
    const { notes } = await request.json();

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json(
        { error: "Invalid notes data" },
        { status: 400 }
      );
    }

    // Update all notes in a transaction
    const updates = await prisma.$transaction(
      notes.map((note) =>
        prisma.note.update({
          where: { id: note.id },
          data: { order: note.order },
        })
      )
    );

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error("Error updating notes order:", error);
    return NextResponse.json(
      { error: "Failed to update notes order" },
      { status: 500 }
    );
  }
}
