import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");

    // Try to get ID from body as a fallback
    let bodyId;
    try {
      const body = await request.json();
      bodyId = body.id;
    } catch (error) {
      // If parsing JSON fails, that's okay - we might have the ID from query params
    }

    // Use ID from query params first, then from body
    const id = idFromQuery || bodyId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    // Get the current recipe to check its status
    const currentRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!currentRecipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Toggle the status
    const newStatus =
      currentRecipe.status === "published" ? "draft" : "published";

    // Update the recipe
    await prisma.recipe.update({
      where: { id },
      data: { status: newStatus },
    });

    // Revalidate the admin page and recipes page
    revalidatePath("/admin");
    revalidatePath("/recipes");

    return NextResponse.json(
      {
        success: true,
        status: newStatus,
        message: `Recipe ${newStatus === "published" ? "published" : "unpublished"} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling recipe status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle recipe status" },
      { status: 500 }
    );
  }
}
