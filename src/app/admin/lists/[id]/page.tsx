import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeft,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default async function ListDetailPage({ params }: { params: any }) {
  const list = await prisma.list.findUnique({
    where: {
      id: params.id,
    },
    include: {
      recipes: {
        include: {
          ingredients: true,
          categories: true,
        },
      },
    },
  });

  if (!list) {
    notFound();
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      <div className='flex justify-between mb-6'>
        <Button
          variant='ghost'
          asChild
          className='pl-0 flex items-center gap-2'
        >
          <Link href='/admin/lists'>
            <ArrowLeft className='h-4 w-4' />
            Back to Lists
          </Link>
        </Button>
      </div>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='text-3xl'>{list.name}</CardTitle>
          <CardDescription>List details and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-1'>
              <p className='text-sm text-muted-foreground'>Email</p>
              <p className='font-medium'>{list.email}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm text-muted-foreground'>ID</p>
              <p className='font-medium text-sm font-mono'>{list.id}</p>
            </div>
            <div className='space-y-1 flex items-center gap-2'>
              <CalendarIcon className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Date</p>
                <p className='font-medium'>
                  {list.Date && format(list.Date, "dd-MMM-yyyy")}
                </p>
              </div>
            </div>
            <div className='space-y-1 flex items-center gap-2'>
              <ClockIcon className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Day</p>
                <p className='font-medium'>
                  {list.Date && format(list.Date, "EEEE")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle className='text-2xl flex items-center gap-2'>
              <UtensilsCrossed className='h-5 w-5' />
              Recipes
            </CardTitle>
            <CardDescription>
              {list.recipes.length} recipes in this list
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {list.recipes.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>No recipes in this list.</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {list.recipes.map((recipe, index) => (
                <Card key={recipe.id} className={index > 0 ? "mt-6" : ""}>
                  <CardHeader>
                    <CardTitle>{recipe.name}</CardTitle>
                    {recipe.description && (
                      <CardDescription>{recipe.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {recipe.prepTime && (
                      <div className='flex items-center gap-2'>
                        <ClockIcon className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{recipe.prepTime}</span>
                      </div>
                    )}

                    <div>
                      <h4 className='text-sm font-semibold mb-2'>Categories</h4>
                      {recipe.categories.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                          No categories
                        </p>
                      ) : (
                        <div className='flex flex-wrap gap-2'>
                          {recipe.categories.map((category) => (
                            <Badge key={category.id} variant='secondary'>
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className='text-sm font-semibold mb-2'>
                        Ingredients
                      </h4>
                      {recipe.ingredients.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                          No ingredients
                        </p>
                      ) : (
                        <ul className='list-disc pl-5 space-y-1'>
                          {recipe.ingredients.map((ingredient) => (
                            <li key={ingredient.id} className='text-sm'>
                              <span className='font-medium'>
                                {ingredient.quantity} {ingredient.unit}
                              </span>{" "}
                              {ingredient.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {recipe.instructions && recipe.instructions.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className='text-sm font-semibold mb-2'>
                            Instructions
                          </h4>
                          <ol className='list-decimal pl-5 space-y-2'>
                            {recipe.instructions.map((instruction, idx) => (
                              <li key={idx} className='text-sm'>
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
