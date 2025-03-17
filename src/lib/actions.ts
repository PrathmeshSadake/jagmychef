"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { z } from "zod";

import prisma from "@/lib/db";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
});

// Recipe schema for validation
const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  cuisine: z.string().min(1, "Cuisine is required"),
  description: z.string().optional(),
  prepTime: z.string().optional(),
  image: z.string().optional(),
  instructions: z.array(z.string().min(1, "Instruction is required")),
  ingredients: z.array(ingredientSchema),
  tags: z.array(z.string()).optional(),
});

// Function to upload image to Vercel Blob
export async function uploadImage(file: File) {
  try {
    // Check if it's an actual image
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Image size must be less than 2MB");
    }

    // Generate a unique filename using timestamp and original name
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/\s+/g, "-")}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Function to create a new recipe
export async function createRecipe(formData: FormData) {
  const name = formData.get("name") as string;
  const cuisine = formData.get("cuisine") as string;
  const description = formData.get("description") as string;
  const prepTime = formData.get("prepTime") as string;
  let image = formData.get("image") as string | File;

  // Parse ingredients and instructions from form data
  const ingredientNames = formData.getAll("ingredientName") as string[];
  const ingredientQuantities = formData.getAll(
    "ingredientQuantity"
  ) as string[];
  const ingredientUnits = formData.getAll("ingredientUnit") as string[];
  const instructions = formData.getAll("instruction") as string[];
  const tags = formData.getAll("tags") as string[];

  // Process image if it's a File
  let imageUrl = typeof image === "string" ? image : "";
  if (image instanceof File && image.size > 0) {
    imageUrl = await uploadImage(image);
  }

  const ingredients = ingredientNames.map((name, index) => ({
    name,
    quantity: ingredientQuantities[index],
    unit: ingredientUnits[index],
  }));

  try {
    // Validate data
    const validatedData = recipeSchema.parse({
      name,
      cuisine,
      description,
      prepTime,
      image: imageUrl,
      instructions,
      ingredients,
      tags,
    });

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: {
        name: validatedData.name,
        cuisine: validatedData.cuisine,
        description: validatedData.description,
        prepTime: validatedData.prepTime,
        image: validatedData.image,
        instructions: validatedData.instructions,
        ingredients: {
          create: validatedData.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
        },
        tags: {
          create: tags.map((tag) => ({
            name: tag,
          })),
        },
      },
    });

    // revalidatePath("/admin");
    // redirect("/admin");
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    return { success: false, error: "Failed to create recipe" };
  }
}

// Function to update an existing recipe
export async function updateRecipe(recipeId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const cuisine = formData.get("cuisine") as string;
  const description = formData.get("description") as string;
  const prepTime = formData.get("prepTime") as string;
  let image = formData.get("image") as string | File;

  // Parse ingredients and instructions from form data
  const ingredientNames = formData.getAll("ingredientName") as string[];
  const ingredientQuantities = formData.getAll(
    "ingredientQuantity"
  ) as string[];
  const ingredientUnits = formData.getAll("ingredientUnit") as string[];
  const instructions = formData.getAll("instruction") as string[];
  const tags = formData.getAll("tags") as string[];

  // Process image if it's a File
  let imageUrl = typeof image === "string" ? image : "";
  if (image instanceof File && image.size > 0) {
    imageUrl = await uploadImage(image);
  }

  const ingredients = ingredientNames.map((name, index) => ({
    name,
    quantity: ingredientQuantities[index],
    unit: ingredientUnits[index],
  }));

  try {
    // Validate data
    const validatedData = recipeSchema.parse({
      name,
      cuisine,
      description,
      prepTime,
      image: imageUrl,
      instructions,
      ingredients,
      tags,
    });

    // First delete existing ingredients and tags to avoid duplicates
    await prisma.ingredient.deleteMany({
      where: { recipeId },
    });

    await prisma.tags.deleteMany({
      where: { recipe: { some: { id: recipeId } } },
    });

    // Update recipe in database
    const recipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        name: validatedData.name,
        cuisine: validatedData.cuisine,
        description: validatedData.description,
        prepTime: validatedData.prepTime,
        image: validatedData.image,
        instructions: validatedData.instructions,
        ingredients: {
          create: validatedData.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
        },
        tags: {
          create: tags.map((tag) => ({
            name: tag,
          })),
        },
      },
    });

    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    return { success: false, error: "Failed to update recipe" };
  }
}

export async function deleteRecipe(id: string) {
  try {
    await prisma.recipe.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete recipe" };
  }
}

export async function addToSelection(recipeId: string, userId: string) {
  try {
    // Check if already selected
    const existingSelection = await prisma.selection.findFirst({
      where: {
        recipeId,
        userId,
      },
    });

    if (existingSelection) {
      return { success: true, message: "Recipe already in selection" };
    }

    // Count current selections
    const selectionCount = await prisma.selection.count({
      where: { userId },
    });

    if (selectionCount >= 4) {
      return { success: false, error: "Maximum of 4 recipes can be selected" };
    }

    // Add to selection
    await prisma.selection.create({
      data: {
        recipeId,
        userId,
      },
    });

    revalidatePath("/shopping-list");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add recipe to selection" };
  }
}

export async function removeFromSelection(recipeId: string, userId: string) {
  try {
    await prisma.selection.deleteMany({
      where: {
        recipeId,
        userId,
      },
    });

    revalidatePath("/shopping-list");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove recipe from selection" };
  }
}

export async function generateShoppingList(userId: string) {
  try {
    // Get all selected recipes with their ingredients
    const selections = await prisma.selection.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    // Consolidate ingredients
    const consolidatedIngredients: Record<
      string,
      { quantity: number; unit: string }
    > = {};

    selections.forEach((selection) => {
      selection.recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name}-${ingredient.unit}`;

        if (consolidatedIngredients[key]) {
          consolidatedIngredients[key].quantity += Number.parseFloat(
            ingredient.quantity
          );
        } else {
          consolidatedIngredients[key] = {
            quantity: Number.parseFloat(ingredient.quantity),
            unit: ingredient.unit,
          };
        }
      });
    });

    // Format the shopping list
    const shoppingList = Object.entries(consolidatedIngredients).map(
      ([key, value]) => {
        const name = key.split("-")[0];
        return {
          name,
          quantity: value.quantity.toString(),
          unit: value.unit,
        };
      }
    );

    return { success: true, shoppingList };
  } catch (error) {
    return { success: false, error: "Failed to generate shopping list" };
  }
}
