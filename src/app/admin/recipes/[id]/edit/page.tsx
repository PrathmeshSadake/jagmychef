"use client";

import { RecipeForm } from "@/components/recipe-form";
import { useState, useEffect } from "react";

// Define the types to match your existing types
interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Category {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  image?: string;
  ingredients: Ingredient[];
  chefInstructions: string[];
  instructions: string[];
  categories?: Category[];
}

export default function RecipeEditPage({ params }: { params: any }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await fetch(`/api/recipes?id=${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch recipe");
        }

        const data = await response.json();
        setRecipe(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setIsLoading(false);
      }
    }

    fetchRecipe();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 text-center mt-10'>{error}</div>;
  }

  if (!recipe) {
    return <div className='text-center mt-10'>No recipe found</div>;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Edit Recipe</h1>
      <RecipeForm recipe={recipe} />
    </div>
  );
}
