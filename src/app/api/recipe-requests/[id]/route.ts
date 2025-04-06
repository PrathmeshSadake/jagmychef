import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }
    const { status } = await request.json();

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the recipe request
    const updatedRequest = await prisma.recipeRequest.update({
      where: { id },
      data: { status },
    });

    // Send notification email if status is approved

    return NextResponse.json({ success: true, recipeRequest: updatedRequest });
  } catch (error) {
    console.error("Error updating recipe request:", error);
    return NextResponse.json(
      { error: "Failed to update recipe request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }

    await prisma.recipeRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe request:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe request" },
      { status: 500 }
    );
  }
}
