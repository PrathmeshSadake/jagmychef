import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }
    const note = await prisma.note.findUnique({
      where: {
        id: id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error(`Error fetching note`, error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

// PATCH - Update a note
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }
    const { content, order } = await request.json();
    const updateData: any = {};

    if (content !== undefined) updateData.content = content;
    if (order !== undefined) updateData.order = order;

    const note = await prisma.note.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error(`Error updating note`, error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }
    await prisma.note.delete({
      where: {
        id: id,
      },
    });

    // Reorder remaining notes
    const remainingNotes = await prisma.note.findMany({
      orderBy: {
        order: "asc",
      },
    });

    // Update order for all remaining notes
    await prisma.$transaction(
      remainingNotes.map((note, index) =>
        prisma.note.update({
          where: { id: note.id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting note`, error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
