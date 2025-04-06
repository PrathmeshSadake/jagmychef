"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipe-card";
import { useAtom } from "jotai";
import {
  recipesDataAtom,
  selectedRecipeIdsAtom,
  selectedRecipesAtom,
} from "@/lib/atoms";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export default function CategoryRecipesPage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name as string);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipesData, setRecipesData] = useAtom(recipesDataAtom);
  const [selectedRecipeIds] = useAtom(selectedRecipeIdsAtom);
  const [selectedRecipes] = useAtom(selectedRecipesAtom);

  useEffect(() => {
    async function fetchRecipes() {
      const response = await fetch(
        `/api/categories/recipies/name?name=${encodeURIComponent(
          name as string
        )}`
      );
      const data = await response.json();
      setRecipes(data || []);
    }

    fetchRecipes();
  }, [name]);

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Link
          href='/'
          className='flex items-center text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Categories
        </Link>
      </div>
      <h1 className='text-2xl font-bold mb-4'>Recipes in {decodedName}</h1>
      <div className='grid gap-4'>
        {recipes.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <p className='text-lg text-muted-foreground mb-4'>
              No recipes found in this category
            </p>
            <Link href='/' className={cn(buttonVariants(), "cursor-pointer")}>
              Back to Categories
            </Link>
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe as any}
              isSelected={selectedRecipeIds.includes(recipe.id)}
              currentSelections={selectedRecipes.length}
              maxSelections={4}
            />
          ))
        )}
      </div>
    </div>
  );
}
