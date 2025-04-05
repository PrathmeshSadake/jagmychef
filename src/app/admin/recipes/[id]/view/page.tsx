import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Plus, Utensils } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRecipeByIdAdmin } from "@/lib/data";

interface RecipeParams {
  id: string;
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<RecipeParams>;
}) {
  const unwrappedParams = use(params);
  const recipe: any = use(getRecipeByIdAdmin(unwrappedParams.id));

  if (!recipe) {
    return (
      <div className='w-full mx-auto container py-10 text-center'>
        <h1 className='text-2xl font-bold'>Recipe not found</h1>
        <p className='mt-2 text-muted-foreground'>
          The recipe you're looking for doesn't exist or has been removed.
        </p>
        <Link href='/admin'>
          <Button className='mt-4'>Back to Recipes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='w-full mx-auto max-w-4xl container py-10'>
      <div className='mb-6'>
        <Link
          href='/admin'
          className='flex items-center text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Recipes
        </Link>
      </div>

      <div className='grid gap-8'>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>{recipe.name}</h1>
            <div className='flex items-center gap-2 mt-2'>
              <div className='flex space-x-2 items-center'>
                {recipe.categories?.map((i: any) => (
                  <Badge key={i.name}>{i.name}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className='relative rounded-lg overflow-hidden'>
            <Image
              src={recipe.image || "/placeholder.svg?height=400&width=800"}
              alt={recipe.name}
              width={800}
              height={400}
              className='object-cover w-full h-[300px] md:h-[400px]'
            />
          </div>

          <div>
            <h2 className='text-xl font-semibold mb-3'>Description</h2>
            <p className='text-muted-foreground'>
              {recipe.description ||
                "A delicious recipe with carefully selected ingredients that will delight your taste buds and impress your guests."}
            </p>
          </div>
          <div>
            <h2 className='text-xl font-semibold mb-3'>Prep Instructions</h2>
            <ol className='space-y-4 ml-5 list-decimal'>
              {recipe.instructions?.map((step: any, index: any) => (
                <li key={index} className='text-muted-foreground'>
                  {step}
                </li>
              )) || (
                <>
                  <li className='text-muted-foreground'>
                    Prepare all ingredients as listed.
                  </li>
                  <li className='text-muted-foreground'>
                    Mix the ingredients in a large bowl.
                  </li>
                  <li className='text-muted-foreground'>
                    Cook according to the specified temperature and time.
                  </li>
                  <li className='text-muted-foreground'>
                    Serve hot and enjoy your meal!
                  </li>
                </>
              )}
            </ol>
          </div>
          {recipe.chefInstructions.length > 0 && (
            <div>
              <h2 className='text-xl font-semibold mb-3'>Chef Instructions</h2>
              <ol className='space-y-4 ml-5 list-decimal'>
                {recipe.chefInstructions?.map((step: any, index: any) => (
                  <li key={index} className='text-muted-foreground'>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className='space-y-6'>
          <div className='bg-muted p-6 rounded-lg'>
            <h2 className='text-xl font-semibold mb-4 flex items-center'>
              <Utensils className='mr-2 h-5 w-5' />
              Ingredients
            </h2>
            <Separator className='mb-4' />
            <ul className='space-y-3'>
              {recipe.ingredients?.map((ingredient: any, index: any) => (
                <li key={index} className='flex justify-between text-sm'>
                  <span>{ingredient.name}</span>
                  <span className='text-muted-foreground'>
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              )) || (
                <>
                  <li className='flex justify-between text-sm'>
                    <span>Ingredient 1</span>
                    <span className='text-muted-foreground'>200g</span>
                  </li>
                  <li className='flex justify-between text-sm'>
                    <span>Ingredient 2</span>
                    <span className='text-muted-foreground'>3 tbsp</span>
                  </li>
                  <li className='flex justify-between text-sm'>
                    <span>Ingredient 3</span>
                    <span className='text-muted-foreground'>1 cup</span>
                  </li>
                  <li className='flex justify-between text-sm'>
                    <span>Ingredient 4</span>
                    <span className='text-muted-foreground'>2 pcs</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
