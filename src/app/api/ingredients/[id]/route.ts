import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is missing" }, { status: 304 });
    }
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: id },
      include: {
        recipe: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is missing" }, { status: 304 });
    }

    // Validate request
    if (!data.name || !data.unit) {
      return NextResponse.json(
        { error: "Name and unit are required" },
        { status: 400 }
      );
    }

    // Check if this name+unit combination already exists (excluding this ingredient)
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
        unit: data.unit,
        isCreated: true,
        id: { not: id },
      },
    });

    if (existingIngredient) {
      return NextResponse.json(
        { error: "An ingredient with this name and unit already exists" },
        { status: 409 }
      );
    }

    // Update the ingredient
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name: data.name,
        quantity: data.quantity || "1",
        unit: data.unit,
      },
    });

    return NextResponse.json(updatedIngredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is missing" }, { status: 304 });
    }
    // Check if the ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: id },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Delete the ingredient
    await prisma.ingredient.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
}
