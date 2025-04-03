"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trash2, Loader } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [generatedList, setGeneratedList] = useState<any>(null);
  const [previousRecipeIds, setPreviousRecipeIds] = useState<string[]>([]);
  const [generatedInstructions, setGeneratedInstructions] = useState<string[]>(
    []
  );

  // Compare recipe arrays to detect changes
  const haveRecipesChanged = useCallback(
    (prevIds: string[], currentIds: string[]) => {
      if (prevIds.length !== currentIds.length) return true;
      const sortedPrev = [...prevIds].sort();
      const sortedCurrent = [...currentIds].sort();
      return sortedPrev.some((id, index) => id !== sortedCurrent[index]);
    },
    []
  );

  // Generate organized shopping list using OpenAI
  const generateOrganizedList = useCallback(async () => {
    if (selectedRecipeIds.length === 0) return null;

    setIsLoading(true);

    try {
      // Format items for the API
      const items = Object.entries(shoppingList)
        .flatMap(([category, items]) =>
          items.map((item) => `${item.quantity} ${item.unit} ${item.name}`)
        )
        .join(", ");

      const response = await fetch("/api/generate-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) throw new Error("Failed to generate organized list");

      const data = await response.json();

      // Extract and organize instructions from recipes
      const combinedInstructions = selectedRecipes
        .flatMap((recipe: any) =>
          (recipe.instructions || []).map((instruction: any) => instruction)
        )
        .filter(Boolean);

      setGeneratedInstructions(combinedInstructions);
      return data.groceryList;
    } catch (error) {
      console.error("Error generating list:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [shoppingList, selectedRecipeIds, selectedRecipes]);

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

        // Check if recipes have changed
        const recipesChanged = haveRecipesChanged(
          previousRecipeIds,
          selectedRecipeIds
        );

        if (recipesChanged || !generatedList) {
          // Only generate a new list if recipes have changed or there's no existing list
          const newList = await generateOrganizedList();
          setGeneratedList(newList);
          setPreviousRecipeIds([...selectedRecipeIds]);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [
    selectedRecipeIds,
    previousRecipeIds,
    // generatedList,
    // generateOrganizedList,
    haveRecipesChanged,
  ]);

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
                  <p className='text-sm text-gray-500'>
                    You can select up to 4 recipes. Currently selected:{" "}
                    {selectedRecipes.length}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className='py-8'>
              <div className='flex flex-col items-center justify-center space-y-4'>
                <Loader className='h-8 w-8 animate-spin text-primary' />
                <p className='text-center text-muted-foreground'>
                  Our AI is generating your shopping list...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* <div>
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>
                    Please check your pantry and fridge for available
                    ingredients
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
                                  checked={
                                    checkedItems[category]?.[index] || false
                                  }
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
            </div> */}

            {generatedList && selectedRecipeIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Organized Shopping List</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedList.categories.map(
                    (category: any, catIndex: any) => (
                      <div key={`gen-${catIndex}`} className='mb-6'>
                        <h3 className='font-medium text-lg mb-2'>
                          {category.name}
                        </h3>
                        <Separator className='mb-3' />
                        <ul className='space-y-1'>
                          {category.items.map((item: any, itemIndex: any) => (
                            <li
                              key={`gen-item-${catIndex}-${itemIndex}`}
                              className='text-sm flex justify-between'
                            >
                              <span>{item.name}</span>
                              <span className='text-muted-foreground'>
                                {item.quantity} {item.unit || ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {generatedInstructions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prep Instructions for Your Appointment:</CardTitle>
                  <CardDescription>
                    Steps to prepare before your appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className='list-decimal pl-5 space-y-2'>
                    {generatedInstructions.map((instruction, index) => (
                      <li key={`instruction-${index}`} className='text-sm'>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <div className='my-6'>
        {selectedRecipeIds.length !== 0 && !isLoading && (
          <ShoppingListActions
            shoppingList={shoppingList}
            selectedRecipeIds={selectedRecipeIds}
            selectedRecipes={selectedRecipes}
            checkedItems={checkedItems}
          />
        )}
      </div>
    </>
  );
}
