// FILE: app/shopping-list/shopping-list-client.tsx (Client Component)
"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingListActions } from "@/components/shopping-list-actions";

// Define types for our data
interface Recipe {
  id: string;
  name: string;
}

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}

interface ShoppingListClientProps {
  initialSelectedRecipes: Recipe[];
  initialShoppingList: ShoppingListByCategory;
}

export function ShoppingListClient({
  initialSelectedRecipes,
  initialShoppingList,
}: ShoppingListClientProps) {
  const [selectedRecipes] = useState<Recipe[]>(initialSelectedRecipes);
  const [shoppingList] = useState<ShoppingListByCategory>(initialShoppingList);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean[]>>(
    () => {
      // Initialize checked state for all items
      const initialCheckedState: Record<string, boolean[]> = {};
      Object.entries(initialShoppingList).forEach(([category, items]) => {
        initialCheckedState[category] = items.map(() => false);
      });
      return initialCheckedState;
    }
  );

  // Handle checkbox change
  const handleCheckboxChange = (category: string, index: number): void => {
    setCheckedItems((prev) => {
      const updatedCategory = [...(prev[category] || [])];
      updatedCategory[index] = !updatedCategory[index];
      return { ...prev, [category]: updatedCategory };
    });
  };

  // Filter shopping list to only include unchecked items
  const getUncheckedItems = (): ShoppingListByCategory => {
    const uncheckedList: ShoppingListByCategory = {};

    Object.entries(shoppingList).forEach(([category, items]) => {
      const uncheckedItems = items.filter(
        (_, index) => !checkedItems[category] || !checkedItems[category][index]
      );

      if (uncheckedItems.length > 0) {
        uncheckedList[category] = uncheckedItems;
      }
    });

    return uncheckedList;
  };

  return (
    <>
      <div className='mb-3'>
        {/* Pass only unchecked items to ShoppingListActions */}
        <ShoppingListActions shoppingList={getUncheckedItems()} />
      </div>
      <div className='grid gap-8'>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Selected Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-3'>
                {selectedRecipes.map((recipe) => (
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
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
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
        <div className=''>
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(shoppingList).length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-white mb-4'>
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
                      {items.map((item, index) => (
                        <li
                          key={index}
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
    </>
  );
}
