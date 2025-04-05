"use client";

import { RecipeForm } from "@/components/recipe-form";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

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

interface RecipeParams {
  id: string;
}

export default function RecipeDuplicatePage({
  params,
}: {
  params: Promise<RecipeParams>;
}) {
  const unwrappedParams = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await fetch(`/api/recipes?id=${unwrappedParams.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch recipe");
        }

        const data = await response.json();

        // Modify the recipe to make it a new one (no id)
        const duplicatedRecipe = {
          ...data,
          id: undefined,
          name: `Copy of ${data.name}`,
        };

        setRecipe(duplicatedRecipe);
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
  }, [unwrappedParams.id]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
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
    <div className='mx-auto container py-10'>
      <div className='mb-6'>
        <Link
          href='/admin'
          className='flex items-center text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Duplicate Recipe
          </h1>
          <p className='text-muted-foreground mt-1'>
            Create a new recipe based on an existing one.
          </p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto'>
        <RecipeForm recipe={recipe} isDuplicate={true} />
      </div>
    </div>
  );
}
