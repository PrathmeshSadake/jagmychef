import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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
