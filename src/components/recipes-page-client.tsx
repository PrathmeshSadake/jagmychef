"use client";

import { ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";

import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipe-card";
import {
  recipesDataAtom,
  selectedRecipeIdsAtom,
  selectedRecipesAtom,
} from "@/lib/atoms";

interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  description?: string | null;
  image?: string | null;
  prepTime?: string | null;
}

export default function RecipesPageClient({
  initialRecipes,
}: {
  initialRecipes: Recipe[];
}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [recipesData, setRecipesData] = useAtom(recipesDataAtom);
  const [selectedRecipeIds] = useAtom(selectedRecipeIdsAtom);
  const [selectedRecipes] = useAtom(selectedRecipesAtom);

  // Initialize recipes in the atom if not already there
  useEffect(() => {
    const recipeMap: Record<string, Recipe> = {};
    initialRecipes.forEach((recipe) => {
      recipeMap[recipe.id] = recipe;
    });

    setRecipesData((prev: any) => ({
      ...prev,
      ...recipeMap,
    }));
  }, [initialRecipes, setRecipesData]);

  return (
    <div className='w-full container py-10 mx-auto'>
      <div className='mb-6'>
        <Link
          href='/'
          className='flex items-center text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Categories
        </Link>
      </div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Recipes</h1>
          <p className='text-muted-foreground mt-1'>
            Browse and select recipes to add to your shopping list.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {/* <Button variant='outline' size='sm' className='gap-1'>
            <Filter className='h-4 w-4' />
            Filter
          </Button> */}
          <Link href='/shopping-list'>
            <Button size='sm' className='gap-1'>
              Selected ({selectedRecipes.length}/4)
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe as any}
            isSelected={selectedRecipeIds.includes(recipe.id)}
            currentSelections={selectedRecipes.length}
            maxSelections={4}
          />
        ))}
      </div>

      {recipes.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No recipes found</p>
          <Link href='/admin/recipes/new'>
            <Button>Add Your First Recipe</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
