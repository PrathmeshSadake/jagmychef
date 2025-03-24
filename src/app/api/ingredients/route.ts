import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get selected recipe IDs
    const { recipeIds } = await request.json();

    // Validate input
    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty recipe IDs" },
        { status: 400 }
      );
    }

    // Fetch ingredients grouped by category
    const ingredientsByCategory = await fetchIngredientsGroupedByCategory(
      recipeIds
    );

    console.log(ingredientsByCategory);

    return NextResponse.json(ingredientsByCategory);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

async function fetchIngredientsGroupedByCategory(recipeIds: string[]) {
  // Fetch ingredients with their recipes and categories
  const recipes = await prisma.recipe.findMany({
    where: {
      id: { in: recipeIds },
    },
    include: {
      ingredients: true,
      categories: true,
    },
  });

  // Group ingredients by category (or default to 'Uncategorized')
  const ingredientsByCategory: { [category: string]: any[] } = {};

  recipes.forEach((recipe) => {
    // Use recipe categories or default to 'Uncategorized'
    const categories =
      recipe.categories.length > 0
        ? recipe.categories.map((cat) => cat.name)
        : ["Uncategorized"];

    recipe.ingredients.forEach((ingredient) => {
      categories.forEach((category) => {
        if (!ingredientsByCategory[category]) {
          ingredientsByCategory[category] = [];
        }

        // Check if ingredient already exists in the category to prevent duplicates
        const existingIngredient = ingredientsByCategory[category].find(
          (existing) =>
            existing.name.toLowerCase() === ingredient.name.toLowerCase() &&
            existing.unit === ingredient.unit
        );

        if (existingIngredient) {
          // If ingredient exists, update quantity
          existingIngredient.quantity = combineQuantities(
            existingIngredient.quantity,
            ingredient.quantity
          );
        } else {
          // Add new ingredient
          ingredientsByCategory[category].push({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            recipeId: recipe.id,
            recipeName: recipe.name,
          });
        }
      });
    });
  });

  return ingredientsByCategory;
}

// Helper function to combine quantities (simple addition)
function combineQuantities(quantity1: string, quantity2: string): string {
  // Convert to numbers if possible
  const num1 = parseFloat(quantity1);
  const num2 = parseFloat(quantity2);

  if (!isNaN(num1) && !isNaN(num2)) {
    return (num1 + num2).toString();
  }

  // If cannot be parsed, return original quantities
  return `${quantity1} + ${quantity2}`;
}

// export const runtime = "nodejs"; // Ensure this runs on Node.js runtime
