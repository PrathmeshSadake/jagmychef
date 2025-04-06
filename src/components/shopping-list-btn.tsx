"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Recipe, recipesDataAtom, selectedRecipeIdsAtom } from "@/lib/atoms";

interface ShoppingListButtonProps {
  recipe: Recipe;
}

export function ShoppingListButton({ recipe }: ShoppingListButtonProps) {
  const [selectedRecipeIds, setSelectedRecipeIds] = useAtom(
    selectedRecipeIdsAtom
  );
  const [recipesData, setRecipesData] = useAtom(recipesDataAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Check if recipe is already in selection
  useEffect(() => {
    setIsAdded(selectedRecipeIds.includes(recipe.id));
  }, [selectedRecipeIds, recipe.id]);

  const handleAddToShoppingList = async () => {
    if (isAdded || !recipe.ingredients || recipe.ingredients.length === 0)
      return;

    setIsLoading(true);
    try {
      // Add recipe to atoms
      setRecipesData((prev: any) => ({
        ...prev,
        [recipe.id]: recipe,
      }));

      setSelectedRecipeIds((prev: any) => {
        // Limit to maximum 4 recipes
        if (prev.length >= 4) {
          toast.error("You can only select up to 4 recipes at a time");
          return prev;
        }
        return [...prev, recipe.id];
      });

      toast.success("Ingredients added to your menu");
      setIsAdded(true);
    } catch (error) {
      console.error("Error adding to menu:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className='w-full gap-1 cursor-pointer'
      onClick={handleAddToShoppingList}
      disabled={isLoading || isAdded}
    >
      {isLoading ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className='h-4 w-4' />
          Added to Menu
        </>
      ) : (
        <>
          <Plus className='h-4 w-4' />
          Add to Menu
        </>
      )}
    </Button>
  );
}
