"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addToSelection } from "@/lib/actions";

interface ShoppingListButtonProps {
  recipeId: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
}

export function ShoppingListButton({
  recipeId,
  ingredients,
}: ShoppingListButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToShoppingList = async () => {
    if (isAdded || !ingredients || ingredients.length === 0) return;

    setIsLoading(true);
    try {
      // We'll use a userId of "default-user" for now
      // In a real app, you'd get the current user's ID
      const result = await addToSelection(recipeId, "default-user");

      if (result.success) {
        setIsAdded(true);
        toast.success("Ingredients added to your shopping list");
      } else {
        toast.error(
          result.error || "Failed to add ingredients to shopping list"
        );
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className='w-full gap-1'
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
          Added to Shopping List
        </>
      ) : (
        <>
          <Plus className='h-4 w-4' />
          Add to Shopping List
        </>
      )}
    </Button>
  );
}
