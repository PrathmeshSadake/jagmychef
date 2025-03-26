"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useAtom } from "jotai";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  selectedRecipeIdsAtom,
  selectedRecipesAtom,
  shoppingListAtom,
} from "@/lib/atoms";
import { ShoppingListActions } from "./shopping-list-actions";

export function ShoppingListClient() {
  // Use Jotai atoms
  const [selectedRecipeIds, setSelectedRecipeIds] = useAtom(
    selectedRecipeIdsAtom
  );
  const [selectedRecipes] = useAtom(selectedRecipesAtom);
  const [shoppingList, setShoppingList] = useState<{
    [category: string]: any[];
  }>({});
  const [checkedItems, setCheckedItems] = useState<{
    [category: string]: boolean[];
  }>({});

  // Fetch ingredients when selected recipes change
  useEffect(() => {
    const fetchIngredients = async () => {
      if (selectedRecipeIds.length === 0) {
        setShoppingList({});
        return;
      }

      try {
        const response = await fetch("/api/ingredients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeIds: selectedRecipeIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ingredients");
        }

        const ingredientsByCategory = await response.json();

        // Initialize checked items state
        const initialCheckedItems: { [category: string]: boolean[] } = {};
        Object.entries(ingredientsByCategory).forEach(
          ([category, items]: [any, any]) => {
            initialCheckedItems[category] = new Array(items.length).fill(false);
          }
        );

        setShoppingList(ingredientsByCategory);
        setCheckedItems(initialCheckedItems);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [selectedRecipeIds]);

  // Remove recipe from selection
  const handleRemoveRecipe = (recipeId: string): void => {
    setSelectedRecipeIds((prev: any) =>
      prev.filter((id: any) => id !== recipeId)
    );
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (category: string, index: number) => {
    setCheckedItems((prev) => {
      const updatedCategory = [...(prev[category] || [])];
      updatedCategory[index] = !updatedCategory[index];
      return {
        ...prev,
        [category]: updatedCategory,
      };
    });
  };

  return (
    <>
      <div className='grid gap-8'>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Selected Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-3'>
                {selectedRecipes.map((recipe: any) => (
                  <li
                    key={recipe.id}
                    className='flex justify-between items-center'
                  >
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className='text-sm hover:underline'
                    >
                      {recipe.name}
                    </Link>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() => handleRemoveRecipe(recipe.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </li>
                ))}
              </ul>
              {selectedRecipes.length === 0 && (
                <div className='text-center py-6'>
                  <p className='text-muted-foreground text-sm mb-4'>
                    No recipes selected yet
                  </p>
                  <Link href='/recipes'>
                    <Button variant='outline' size='sm'>
                      Browse Recipes
                    </Button>
                  </Link>
                </div>
              )}
              {selectedRecipes.length > 0 && selectedRecipes.length < 4 && (
                <div className='mt-4 p-3 bg-muted rounded-md'>
                  <p className='text-sm text-white'>
                    You can select up to 4 recipes. Currently selected:{" "}
                    {selectedRecipes.length}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Please check your pantry and fridge for available ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(shoppingList).length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-muted-foreground mb-4'>
                    No ingredients in your shopping list yet
                  </p>
                  <Link href='/recipes'>
                    <Button>Browse Recipes</Button>
                  </Link>
                </div>
              ) : (
                Object.entries(shoppingList).map(([category, items]) => (
                  <div key={category} className='mb-6'>
                    <h3 className='font-medium text-lg mb-2'>{category}</h3>
                    <Separator className='mb-3' />
                    <ul className='space-y-2'>
                      {items.map((item: any, index: number) => (
                        <li
                          key={`${item.name}-${item.recipeId}`}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <Checkbox
                              id={`item-${category}-${index}`}
                              checked={checkedItems[category]?.[index] || false}
                              onCheckedChange={() =>
                                handleCheckboxChange(category, index)
                              }
                            />
                            <label
                              htmlFor={`item-${category}-${index}`}
                              className='text-sm cursor-pointer'
                            >
                              {item.name}
                            </label>
                            <span className='text-xs text-muted-foreground ml-2'>
                              (from {item.recipeName})
                            </span>
                          </div>
                          <span className='text-sm text-muted-foreground'>
                            {item.quantity} {item.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='my-6'>
        <ShoppingListActions
          shoppingList={shoppingList}
          selectedRecipeIds={selectedRecipeIds}
        />
      </div>
    </>
  );
}
