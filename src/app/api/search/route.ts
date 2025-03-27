import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const searchTerm = query.toLowerCase();

  try {
    // Search for recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          // { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        // type: "recipe",
      },
    });

    // Search for categories
    // const categories = await prisma.category.findMany({
    //   where: {
    //     name: { contains: searchTerm, mode: "insensitive" },
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     // type: "category",
    //   },
    // });

    // Search for ingredients
    // const ingredients = await prisma.ingredient.findMany({
    //   where: {
    //     name: { contains: searchTerm, mode: "insensitive" },
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     recipeId: true,
    //     // type: "ingredient",
    //   },
    // });

    // Combine and format results
    const recipeResults = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      type: "recipe",
    }));

    // const categoryResults = categories.map((category) => ({
    //   id: category.id,
    //   name: category.name,
    //   type: "category",
    // }));

    // const ingredientResults = ingredients.map((ingredient) => ({
    //   id: ingredient.id,
    //   name: ingredient.name,
    //   recipeId: ingredient.recipeId,
    //   type: "ingredient",
    // }));

    const results = [
      ...recipeResults,
      // ...categoryResults,
      // ...ingredientResults,
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
