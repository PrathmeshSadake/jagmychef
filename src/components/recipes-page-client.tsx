"use client";

import { ArrowLeft, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 10;
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  // Get current recipes
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

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

  // Page change handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      <div className='flex flex-col justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Recipes</h1>
          <p className='text-muted-foreground mt-1'>
            Browse and select recipes to add to your shopping list.
            <span className='font-medium'>
              {" "}
              Showing {recipes.length} recipes.
            </span>
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='gap-1'>
            <Filter className='h-4 w-4' />
            Filter
          </Button>
          <Link href='/shopping-list'>
            <Button size='sm' className='gap-1'>
              Selected ({selectedRecipes.length}/4)
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {currentRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe as any}
            isSelected={selectedRecipeIds.includes(recipe.id)}
            currentSelections={selectedRecipes.length}
            maxSelections={4}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {recipes.length > 0 && (
        <div className='flex justify-between items-center mt-6 pt-6 border-t'>
          <div className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className='h-4 w-4 ml-1' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
