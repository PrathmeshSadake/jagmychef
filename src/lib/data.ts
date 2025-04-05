import prisma from "@/lib/db";
import type { Recipe, Ingredient } from "@prisma/client";

export type RecipeWithIngredients = Recipe & {
  ingredients: Ingredient[];
};

export async function getRecipes(): Promise<RecipeWithIngredients[]> {
  return prisma.recipe.findMany({
    where: {
      status: "published",
    },
    include: {
      ingredients: true,
      categories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRecipeById(
  id: string
): Promise<RecipeWithIngredients | null> {
  return prisma.recipe.findUnique({
    where: {
      id,
      status: "published",
    },
    include: {
      ingredients: true,
      categories: true,
    },
  });
}

export async function getRecipeByIdAdmin(
  id: string
): Promise<RecipeWithIngredients | null> {
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      categories: true,
    },
  });
}

// export async function getSelectedRecipes(
//   userId = "default-user"
// ): Promise<RecipeWithIngredients[]> {
//   const selections = await prisma.selection.findMany({
//     where: { userId },
//     include: {
//       recipe: {
//         include: {
//           ingredients: true,
//           categories: true,
//         },
//         where: {
//           status: "published",
//         },
//       },
//     },
//   });

//   return selections.map((selection) => selection.recipe);
// }

// export async function getShoppingList(userId = "default-user") {
//   // Get all selected recipes with their ingredients
//   const selections = await prisma.selection.findMany({
//     where: { userId },
//     include: {
//       recipe: {
//         include: {
//           ingredients: true,
//           categories: true,
//         },
//         where: {
//           status: "published",
//         },
//       },
//     },
//   });

//   // Consolidate ingredients
//   const ingredientsByCategory: Record<string, Ingredient[]> = {};

//   // Simple categorization function - in a real app, you might have a more sophisticated system
//   const getCategory = (ingredient: Ingredient): string => {
//     const name = ingredient.name.toLowerCase();

//     if (
//       name.includes("chicken") ||
//       name.includes("beef") ||
//       name.includes("pork") ||
//       name.includes("fish")
//     ) {
//       return "Proteins";
//     } else if (
//       name.includes("cheese") ||
//       name.includes("milk") ||
//       name.includes("cream") ||
//       name.includes("yogurt") ||
//       name.includes("egg")
//     ) {
//       return "Dairy";
//     } else if (
//       name.includes("pasta") ||
//       name.includes("rice") ||
//       name.includes("flour") ||
//       name.includes("bread")
//     ) {
//       return "Grains";
//     } else if (
//       name.includes("pepper") ||
//       name.includes("salt") ||
//       name.includes("spice") ||
//       name.includes("sauce") ||
//       name.includes("oil")
//     ) {
//       return "Spices & Condiments";
//     } else if (
//       name.includes("onion") ||
//       name.includes("garlic") ||
//       name.includes("tomato") ||
//       name.includes("lettuce") ||
//       name.includes("carrot")
//     ) {
//       return "Vegetables";
//     } else {
//       return "Other";
//     }
//   };

//   // Group ingredients by name and unit
//   const consolidatedIngredients: Record<
//     string,
//     { quantity: number; unit: string; name: string }
//   > = {};

//   selections.forEach((selection) => {
//     selection.recipe.ingredients.forEach((ingredient) => {
//       const key = `${ingredient.name}-${ingredient.unit}`;

//       if (consolidatedIngredients[key]) {
//         consolidatedIngredients[key].quantity += Number.parseFloat(
//           ingredient.quantity
//         );
//       } else {
//         consolidatedIngredients[key] = {
//           quantity: Number.parseFloat(ingredient.quantity),
//           unit: ingredient.unit,
//           name: ingredient.name,
//         };
//       }
//     });
//   });

//   // Organize by category
//   Object.values(consolidatedIngredients).forEach((item) => {
//     const category = getCategory({
//       name: item.name,
//       quantity: item.quantity.toString(),
//       unit: item.unit,
//     } as Ingredient);

//     if (!ingredientsByCategory[category]) {
//       ingredientsByCategory[category] = [];
//     }

//     ingredientsByCategory[category].push({
//       name: item.name,
//       quantity: item.quantity.toString(),
//       unit: item.unit,
//     } as Ingredient);
//   });

//   return ingredientsByCategory;
// }
