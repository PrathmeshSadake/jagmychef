import { createRecipe, updateRecipe } from "@/lib/actions";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log(formData);
    const result = await createRecipe(formData);

    if (result && !result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    const result = await updateRecipe(id, formData);

    if (result && !result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }
    const recipe = await prisma.recipe.findUnique({
      where: { id: id },
      include: {
        ingredients: true,
        categories: true,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}
