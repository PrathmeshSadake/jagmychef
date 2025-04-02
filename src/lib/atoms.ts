import { atomWithStorage } from "jotai/utils";

export interface UserDetails {
  name: string;
  email: string;
  date: any;
}

// Using atomWithStorage to persist the state in localStorage
// The first parameter is the key used in localStorage
export const userDetailsAtom = atomWithStorage<any>("userDetails", null);

// Types
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  prepTime?: string;
  image?: string;
  instructions?: string[];
  ingredients: Ingredient[];
}

export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}

// Store selected recipe IDs
export const selectedRecipeIdsAtom = atomWithStorage<any>(
  "selectedRecipeIds",
  []
);

// Atom for recipes data
export const recipesDataAtom = atomWithStorage<any>("recipesData", {});

// Derived atom that gets the full recipe objects from IDs
export const selectedRecipesAtom = atomWithStorage<any>(
  "selectedRecipes",
  (get: any) => {
    const ids = get(selectedRecipeIdsAtom);
    const recipesData = get(recipesDataAtom);

    return ids
      .map((id: any) => recipesData[id])
      .filter((recipe: any) => recipe !== undefined);
  }
);

// Helper function to categorize ingredients
const categorizeIngredients = (recipes: Recipe[]): ShoppingListByCategory => {
  const categorizedItems: ShoppingListByCategory = {};

  // Function to determine category based on ingredient name
  const getCategory = (name: string): string => {
    const lowerName = name.toLowerCase();

    if (
      lowerName.includes("milk") ||
      lowerName.includes("cheese") ||
      lowerName.includes("yogurt")
    ) {
      return "Dairy";
    } else if (
      lowerName.includes("chicken") ||
      lowerName.includes("beef") ||
      lowerName.includes("pork")
    ) {
      return "Meat";
    } else if (
      lowerName.includes("apple") ||
      lowerName.includes("banana") ||
      lowerName.includes("orange")
    ) {
      return "Fruits";
    } else if (
      lowerName.includes("carrot") ||
      lowerName.includes("onion") ||
      lowerName.includes("potato")
    ) {
      return "Vegetables";
    } else {
      return "Other";
    }
  };

  // Process all recipes and their ingredients
  recipes.forEach((recipe) => {
    if (!recipe.ingredients) return;

    recipe.ingredients.forEach((ingredient) => {
      const category = getCategory(ingredient.name);

      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }

      // Try to find existing item to combine quantities
      const existingItemIndex = categorizedItems[category].findIndex(
        (item) => item.name === ingredient.name && item.unit === ingredient.unit
      );

      if (existingItemIndex >= 0) {
        // Combine quantities for same ingredient
        categorizedItems[category][existingItemIndex].quantity +=
          parseFloat(ingredient.quantity) || 1;
      } else {
        // Add new ingredient
        categorizedItems[category].push({
          name: ingredient.name,
          quantity: parseFloat(ingredient.quantity) || 1,
          unit: ingredient.unit,
        });
      }
    });
  });

  return categorizedItems;
};

// Derived atom for shopping list based on selected recipes
export const shoppingListAtom = atomWithStorage("shoppingList", (get: any) => {
  const selectedRecipes = get(selectedRecipesAtom);
  return categorizeIngredients(selectedRecipes);
});
