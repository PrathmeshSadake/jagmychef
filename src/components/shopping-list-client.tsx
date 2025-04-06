"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  adminNotesAtom,
} from "@/lib/atoms";
import { ShoppingListActions } from "./shopping-list-actions";
import { GeneralNotes } from "./general-notes";

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
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [listId, setListId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create a memoized map of item names to their category and index
  // to optimize checkbox lookups without triggering re-renders
  const createItemLookupMap = useCallback(() => {
    const lookupMap = new Map();

    Object.entries(shoppingList).forEach(([category, items]) => {
      items.forEach((item, index) => {
        // Use lowercase item name as key for case-insensitive comparison
        const key = item.name.toLowerCase();
        lookupMap.set(key, { category, index });
      });
    });

    return lookupMap;
  }, [shoppingList]);

  // Memoize the lookup map
  const itemLookupMap = useMemo(
    () => createItemLookupMap(),
    [createItemLookupMap]
  );

  // Find checkbox status for an item using the lookup map
  const getItemCheckStatus = useCallback(
    (itemName: string) => {
      const key = itemName.toLowerCase();
      const itemInfo = itemLookupMap.get(key);

      if (itemInfo) {
        const { category, index } = itemInfo;
        return {
          isChecked: checkedItems[category]?.[index] || false,
          categoryKey: category,
          originalIndex: index,
        };
      }

      return { isChecked: false, categoryKey: "", originalIndex: -1 };
    },
    [itemLookupMap, checkedItems]
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

  // Save shopping list to database
  const saveShoppingList = useCallback(async () => {
    if (!generatedList || !listId) return;

    try {
      setIsSaving(true);

      // Prepare items for saving
      const items = generatedList.categories.flatMap((category: any) =>
        category.items.map((item: any) => {
          const { isChecked } = getItemCheckStatus(item.name);
          return {
            name: item.name,
            quantity: item.quantity || "",
            unit: item.unit || "",
            category: category.name,
            isChecked: isChecked,
          };
        })
      );

      // Save to database
      const response = await fetch("/api/shopping-list-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: listId,
          items: items,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save shopping list items");
      }

      console.log("Shopping list saved successfully");
    } catch (error) {
      console.error("Error saving shopping list:", error);
    } finally {
      setIsSaving(false);
    }
  }, [generatedList, listId, getItemCheckStatus]);

  // Create initial list record if none exists
  const createShoppingListRecord = useCallback(async () => {
    if (selectedRecipeIds.length === 0 || listId) return;

    try {
      // Create a basic list record
      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Shopping List",
          email: "user@example.com", // You might want to get this from user context
          date: new Date().toISOString(),
          time: "12:00",
          recipeIds: selectedRecipeIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create shopping list");
      }

      const data = await response.json();
      setListId(data.list.id);
    } catch (error) {
      console.error("Error creating shopping list:", error);
    }
  }, [selectedRecipeIds, listId]);

  // Fetch ingredients when selected recipes change
  useEffect(() => {
    // Skip if we've already fetched and there's no change to recipe IDs
    if (
      hasInitiallyFetched &&
      !haveRecipesChanged(previousRecipeIds, selectedRecipeIds)
    ) {
      return;
    }

    const fetchIngredients = async () => {
      if (selectedRecipeIds.length === 0) {
        if (Object.keys(shoppingList).length !== 0) {
          setShoppingList({});
        }
        if (generatedList !== null) {
          setGeneratedList(null); // Clear generated list
        }
        if (generatedInstructions.length !== 0) {
          setGeneratedInstructions([]); // Clear generated instructions
        }
        return;
      }

      try {
        // Create a list record if needed
        await createShoppingListRecord();

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

        // Mark as initially fetched
        setHasInitiallyFetched(true);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [
    selectedRecipeIds,
    hasInitiallyFetched,
    haveRecipesChanged,
    generateOrganizedList,
    previousRecipeIds,
    generatedList,
    shoppingList,
    createShoppingListRecord,
  ]);

  // Save shopping list when checkboxes change
  useEffect(() => {
    if (hasInitiallyFetched && generatedList && listId) {
      const saveTimeout = setTimeout(() => {
        saveShoppingList();
      }, 1000); // Debounce to avoid too many requests

      return () => clearTimeout(saveTimeout);
    }
  }, [
    checkedItems,
    generatedList,
    listId,
    hasInitiallyFetched,
    saveShoppingList,
  ]);

  // Remove recipe from selection
  const handleRemoveRecipe = (recipeId: string): void => {
    setSelectedRecipeIds((prev: any) =>
      prev.filter((id: any) => id !== recipeId)
    );
  };

  // Handle checkbox toggle with memoization to prevent unnecessary re-renders
  const handleCheckboxChange = useCallback(
    (category: string, index: number) => {
      setCheckedItems((prev) => {
        // Only update if there's an actual change
        if (prev[category]?.[index] === undefined) {
          const updatedCategory = [...(prev[category] || [])];
          updatedCategory[index] = true;
          return {
            ...prev,
            [category]: updatedCategory,
          };
        }

        // Create a new array to ensure reference changes for React to detect the update
        const updatedCategory = [...(prev[category] || [])];
        updatedCategory[index] = !updatedCategory[index];

        return {
          ...prev,
          [category]: updatedCategory,
        };
      });
    },
    []
  );

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
            {/* Remove Ingredients section and only keep Organized Shopping List with checkboxes */}
            {generatedList && selectedRecipeIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Organized Shopping List</CardTitle>
                  <CardDescription>
                    Check items you already have in your pantry or fridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedList.categories.map(
                    (category: any, catIndex: any) => (
                      <div key={`gen-${catIndex}`} className='mb-6'>
                        <h3 className='font-medium text-lg mb-2'>
                          {category.name}
                        </h3>
                        <Separator className='mb-3' />
                        <ul className='space-y-2'>
                          {category.items.map((item: any, itemIdx: any) => {
                            const { isChecked, categoryKey, originalIndex } =
                              getItemCheckStatus(item.name);

                            return (
                              <li
                                key={`gen-item-${catIndex}-${itemIdx}`}
                                className='flex items-center justify-between'
                              >
                                <div className='flex items-center gap-2'>
                                  <Checkbox
                                    id={`item-${category.name}-${itemIdx}`}
                                    checked={isChecked}
                                    onCheckedChange={() => {
                                      if (categoryKey && originalIndex !== -1) {
                                        handleCheckboxChange(
                                          categoryKey,
                                          originalIndex
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`item-${category.name}-${itemIdx}`}
                                    className={`text-sm cursor-pointer ${
                                      isChecked
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    }`}
                                  >
                                    {item.name}
                                  </label>
                                </div>
                                <span className='text-sm text-muted-foreground'>
                                  {item.quantity} {item.unit || ""}
                                </span>
                              </li>
                            );
                          })}
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

            {/* General Notes from Admin */}
            {selectedRecipeIds.length !== 0 && !isLoading && <GeneralNotes />}
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
