"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface Recipe {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export default function CategoryRecipesPage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name as string);
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      const response = await fetch(
        `/api/categories/recipies/${name}?name=${encodeURIComponent(
          name as string
        )}`
      );
      const data = await response.json();
      setRecipes(data || []);
    }

    fetchRecipes();
  }, [name]);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Recipes in {decodedName}</h1>
      <div className='grid gap-4'>
        {recipes.map((recipe) => (
          <Card key={recipe.id} className='hover:shadow-lg transition'>
            <CardContent className='p-6 space-y-2'>
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className='w-full h-40 object-cover rounded-lg mb-4'
                />
              )}
              <CardTitle>{recipe.name}</CardTitle>

              <div className='flex space-x-2 items-center'>
                {recipe.categories?.map((i: any) => (
                  <Badge key={i.name}>{i.name}</Badge>
                ))}
              </div>

              {recipe.description && (
                <p className='text-sm text-gray-600'>{recipe.description}</p>
              )}
              <Link
                href={`/recipes/${recipe.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                })}
              >
                View
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
