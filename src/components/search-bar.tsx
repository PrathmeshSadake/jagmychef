// components/SearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchIcon } from "lucide-react";

type SearchResult = {
  id: string;
  name: string;
  type: "recipe" | "category" | "ingredient";
  recipeId?: string;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const handleActionClick = (item: SearchResult) => {
    console.log("Action clicked for:", item.name, "ID:", item.id);
    // Implement your action logic here
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='relative'>
        <SearchIcon className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
        <Input
          type='text'
          placeholder='Search recipes, categories, ingredients...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10 pr-4 py-2'
        />
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
                    <span className='font-medium'>{item.name}</span>
                    <span className='ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                      {item.type}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleActionClick(item)}
                  >
                    Action
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
