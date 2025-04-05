import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    // Try to get ID from URL query parameters
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");

    // Also try to get ID from URL path parameters

    // Use ID from query params first, then from path
    const id = idFromQuery;

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
