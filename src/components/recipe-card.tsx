"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check, Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { recipesDataAtom, selectedRecipeIdsAtom } from "@/lib/atoms";

interface RecipeCardProps {
  recipe: {
    id: string;
    name: string;
    cuisine: string;
    description?: string | null;
    image?: string | null;
    prepTime?: string | null;
  };
  isSelected?: boolean;
  maxSelections?: number;
  currentSelections?: number;
}

export function RecipeCard({
  recipe,
  isSelected = false,
  maxSelections = 4,
  currentSelections = 0,
}: RecipeCardProps) {
  const [selected, setSelected] = useState<any>(isSelected);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useAtom(
    selectedRecipeIdsAtom
  );
  const [recipesData, setRecipesData] = useAtom(recipesDataAtom);

  // Update local state when prop changes
  useEffect(() => {
    setSelected(isSelected);
  }, [isSelected]);

  // Also check atoms to ensure consistency
  useEffect(() => {
    setSelected(selectedRecipeIds.includes(recipe.id));
  }, [selectedRecipeIds, recipe.id]);

  const handleSelection = async () => {
    setIsLoading(true);

    try {
      if (selected) {
        // Remove from selection
        setSelectedRecipeIds((prev: any) =>
          prev.filter((id: any) => id !== recipe.id)
        );
        toast.success(`${recipe.name} has been removed from your selection.`);
        setSelected(false);
      } else {
        // Check if we've reached the maximum number of selections
        if (selectedRecipeIds.length >= maxSelections) {
          toast.error(
            `You can only select up to ${maxSelections} recipes. Please remove a recipe before adding another.`
          );
          setIsLoading(false);
          return;
        }

        // Add to selection
        setRecipesData((prev: any) => ({
          ...prev,
          [recipe.id]: recipe,
        }));

        setSelectedRecipeIds((prev: any) => [...prev, recipe.id]);
        toast.success(`${recipe.name} has been added to your selection.`);
        setSelected(true);
      }
    } catch (error) {
      console.error("Error updating selection:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='overflow-hidden h-full flex flex-col pt-0'>
      <div className='relative h-44 w-full'>
        <Image
          src={recipe.image || "/placeholder.svg?height=200&width=400"}
          alt={recipe.name}
          fill
          className='h-full w-full object-cover'
          priority={false}
        />
      </div>

      <CardHeader className='my-0'>
        <CardTitle className='text-lg line-clamp-1 my-0'>
          {recipe.name}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-grow'>
        <p className='text-sm text-black line-clamp-2'>
          {recipe.description ||
            "A delicious recipe with carefully selected ingredients."}
        </p>
      </CardContent>
      <CardFooter className='px-4 pt-0 flex justify-between'>
        <Link href={`/recipes/${recipe.id}`}>
          <Button variant='outline' size='sm' className='cursor-pointer'>
            View Details
          </Button>
        </Link>
        <Button
          variant={selected ? "secondary" : "ghost"}
          size='sm'
          className='gap-1 cursor-pointer'
          onClick={handleSelection}
          disabled={
            isLoading ||
            (!selected && selectedRecipeIds.length >= maxSelections)
          }
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              {selected ? "Removing..." : "Adding..."}
            </>
          ) : selected ? (
            <>
              <Check className='h-4 w-4' />
              Added
            </>
          ) : (
            <>
              <Plus className='h-4 w-4' />
              Add
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
