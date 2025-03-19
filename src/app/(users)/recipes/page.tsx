import { Filter } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getRecipes, getSelectedRecipes } from "@/lib/data";
import { RecipeCard } from "@/components/recipe-card";

export default async function RecipesPage() {
  const recipes = await getRecipes();
  const selectedRecipes = await getSelectedRecipes();

  // Create a map of selected recipe IDs for quick lookup
  const selectedRecipeIds = new Set(selectedRecipes.map((recipe) => recipe.id));

  return (
    <div className='w-full container py-10 mx-auto'>
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
              View Selected ({selectedRecipes.length})
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe as any}
            isSelected={selectedRecipeIds.has(recipe.id)}
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
