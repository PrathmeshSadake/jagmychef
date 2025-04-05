import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: any;
  }
) {
  try {
    // Try to get ID from URL query parameters
    const id = params.id;

    // Also try to get ID from URL path parameters

    // Use ID from query params first, then from path

    if (!id) {
      return new NextResponse("Id is required", { status: 500 });
    }

    // Delete the recipe (ingredients will be deleted automatically due to onDelete: Cascade)
    await prisma.selection.deleteMany({
      where: {
        recipeId: id,
      },
    });

    await prisma.recipe.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
