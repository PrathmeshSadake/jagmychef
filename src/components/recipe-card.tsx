"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { addToSelection, removeFromSelection } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [selected, setSelected] = useState(isSelected);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelection = async () => {
    setIsLoading(true);

    try {
      if (selected) {
        // Remove from selection
        const result = await removeFromSelection(recipe.id, "default-user");
        if (result.success) {
          setSelected(false);
          toast.success(`${recipe.name} has been removed from your selection.`);
        } else {
          toast.success(
            result.error || "Failed to remove recipe from selection"
          );
        }
      } else {
        // Check if we've reached the maximum number of selections
        if (currentSelections >= maxSelections && !selected) {
          toast.success(
            `You can only select up to ${maxSelections} recipes. Please remove a recipe before adding another.`
          );
          setIsLoading(false);
          return;
        }

        // Add to selection
        const result = await addToSelection(recipe.id, "default-user");
        if (result.success) {
          setSelected(true);
          toast.success(`${recipe.name} has been added to your selection.`);
        } else {
          toast.success(result.error || "Failed to add recipe to selection");
        }
      }

      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error("Error updating selection:", error);
      toast.success("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='overflow-hidden h-full flex flex-col'>
      <div className='relative'>
        <div className='absolute top-2 right-2 z-10'>
          <Checkbox
            id={`recipe-${recipe.id}`}
            className='h-5 w-5 bg-white rounded-sm'
            checked={selected}
            onCheckedChange={handleSelection}
            disabled={
              isLoading || (!selected && currentSelections >= maxSelections)
            }
            aria-label={selected ? "Remove from selection" : "Add to selection"}
          />
        </div>
        <div className='relative h-36 w-full'>
          <Image
            src={recipe.image || "/placeholder.svg?height=200&width=400"}
            alt={recipe.name}
            fill
            className='h-full w-full object-cover'
            priority={false}
          />
        </div>
      </div>
      <CardHeader className='p-4 pb-0'>
        <div className='flex justify-between items-start'>
          <CardTitle className='text-lg line-clamp-1'>{recipe.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-2 flex-grow'>
        <p className='text-sm text-white line-clamp-2'>
          {recipe.description ||
            "A delicious recipe with carefully selected ingredients."}
        </p>
      </CardContent>
      <CardFooter className='p-4 pt-0 flex justify-between'>
        <Link href={`/recipes/${recipe.id}`}>
          <Button variant='outline' size='sm'>
            View Details
          </Button>
        </Link>
        <Button
          variant={selected ? "secondary" : "ghost"}
          size='sm'
          className='gap-1'
          onClick={handleSelection}
          disabled={
            isLoading || (!selected && currentSelections >= maxSelections)
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
