import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isCreated = searchParams.get("isCreated");
    const search = searchParams.get("search");

    let whereClause: any = {};

    // Filter for isCreated ingredients
    if (isCreated === "true") {
      whereClause.isCreated = true;
    }

    // Search for ingredients by name
    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const ingredients = await prisma.ingredient.findMany({
      where: whereClause,
      include: {
        recipe: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate request
    if (!data.name || !data.unit) {
      return NextResponse.json(
        { error: "Name and unit are required" },
        { status: 400 }
      );
    }

    // Check if this name+unit combination already exists
    // const existingIngredient = await prisma.ingredient.findFirst({
    //   where: {
    //     name: {
    //       equals: data.name,
    //       mode: "insensitive",
    //     },
    //     unit: data.unit,
    //     isCreated: true,
    //   },
    // });

    // if (existingIngredient) {
    //   return NextResponse.json(
    //     { error: "An ingredient with this name and unit already exists" },
    //     { status: 409 }
    //   );
    // }

    // For global ingredients, we need to create a "dummy" recipe
    // The API will handle the association appropriately
    // let recipeId = data.recipeId;

    // if (data.isCreated && data.recipeId === "temporary") {
    //   // Create or find the "Ingredient Library" recipe
    //   const libraryRecipe = await prisma.recipe.findFirst({
    //     where: { name: "Ingredient Library" },
    //   });

    //   if (libraryRecipe) {
    //     recipeId = libraryRecipe.id;
    //   } else {
    //     const newLibraryRecipe = await prisma.recipe.create({
    //       data: {
    //         name: "Ingredient Library",
    //         description: "System recipe for storing global ingredients",
    //         instructions: [],
    //         chefInstructions: [],
    //       },
    //     });
    //     recipeId = newLibraryRecipe.id;
    //   }
    // }

    // Create the ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        quantity: data.quantity || "1",
        unit: data.unit,
        isCreated: data.isCreated || false,
      },
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }
    const body = await request.json();

    // Validate the request body
    if (!body.name && !body.quantity && !body.unit) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      );
    }

    // Update the ingredient in the database
    // Replace this with your actual database update logic
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name: body.name,
        quantity: body.quantity,
        unit: body.unit,
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
