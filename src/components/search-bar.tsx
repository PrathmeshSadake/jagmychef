"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useAtom } from "jotai";
import { recipesDataAtom, selectedRecipeIdsAtom } from "@/lib/atoms";
import Link from "next/link";
import RecipeRequestButton from "./recipe-request-btn";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  name: string;
  type: "recipe" | "category" | "ingredient";
  recipeId?: string;
};

export default function SearchBar({ recipeCount }: { recipeCount: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useAtom(
    selectedRecipeIdsAtom
  );
  const [recipesData, setRecipesData] = useAtom(recipesDataAtom);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const router = useRouter();
  const pathname = usePathname();

  // Close results when route changes or an item is clicked
  const closeResults = () => {
    setResults([]);
    setSearchTerm("");
  };

  useEffect(() => {
    // Close results when pathname changes
    closeResults();
  }, [pathname]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.trim() === "") {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`
        );
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  const handleAddToShoppingList = async (recipe: any) => {
    if (selectedRecipeIds.includes(recipe.id)) return;

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

      // Close results after adding to menu
      closeResults();
    } catch (error) {
      console.error("Error adding to menu:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (item: SearchResult) => {
    console.log("Action clicked for:", item.name, "ID:", item.id);

    if (item.type === "category") {
      router.push(`/categories/${item.name}`);
    } else {
      handleAddToShoppingList(item);
    }

    // Close results after action
    closeResults();
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='flex space-x-2 items-center'>
        <div className='relative flex-1'>
          <SearchIcon className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search recipes'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-2'
          />
        </div>
        <Link
          href={"/recipes"}
          className={cn(
            buttonVariants({
              variant: "default",
            }),
            "max-w-fit"
          )}
        >
          {`View all Recipes (${recipeCount || 0})`}
        </Link>
      </div>

      {isLoading && (
        <div className='mt-2 text-center text-sm text-gray-500'>Loading...</div>
      )}

      {results.length > 0 && (
        <Card className='mt-2'>
          <CardContent className='p-0'>
            <ul className='divide-y'>
              {results.map((item) => (
                <li
                  key={item.id}
                  className='flex items-center justify-between p-3'
                >
                  <div>
                    <span className='font-medium'>
                      <Link
                        href={
                          item.type === "category"
                            ? `/categories/${item.name}`
                            : `/recipes/${item.id}`
                        }
                        onClick={closeResults}
                      >
                        {item.name}
                      </Link>
                    </span>
                    <span className='ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                      {item.type}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleActionClick(item)}
                  >
                    {item.type === "category" ? "View" : "Add to Menu"}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <div className='flex space-x-4 items-center my-4 justify-center w-full'>
        <RecipeRequestButton />
      </div>
      <Toaster />
    </div>
  );
}
