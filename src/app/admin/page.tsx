// app/admin/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeTable } from "@/components/recipe-table";
import { IngredientTable } from "@/components/ingredient-table";
import prisma from "@/lib/db";

export default async function AdminPage() {
  // Fetch all recipes with ingredients count
  const allRecipes = await prisma.recipe.findMany({
    include: {
      _count: {
        select: { ingredients: true },
      },
      ingredients: true,
      categories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Separate published and draft recipes
  const publishedRecipes = allRecipes.filter(
    (recipe) => recipe.status === "published" || !recipe.status
  );

  const draftRecipes = allRecipes.filter((recipe) => recipe.status === "draft");

  // Fetch ingredients with their recipe names
  const ingredients = await prisma.ingredient.findMany({
    include: {
      recipe: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const listsCount = await prisma.list.count();

  // Calculate stats
  const totalRecipes = allRecipes.length;
  const totalIngredients = ingredients.length;
  const totalDrafts = draftRecipes.length;

  // Calculate recipes added this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const recipesThisMonth = allRecipes.filter(
    (recipe) => new Date(recipe.createdAt) >= firstDayOfMonth
  ).length;

  // Calculate ingredients added this month
  const ingredientsThisMonth = ingredients.filter(
    (ingredient) => new Date(ingredient.createdAt) >= firstDayOfMonth
  ).length;

  // Get total user selections
  const totalSelections = await prisma.selection.count();

  // Get selections from last month for percentage calculation
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const selectionsLastMonth = await prisma.selection.count({
    where: {
      createdAt: {
        gte: lastMonth,
        lt: firstDayOfMonth,
      },
    },
  });

  // Calculate percentage change
  const selectionsThisMonth = await prisma.selection.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });

  const selectionPercentChange =
    selectionsLastMonth > 0
      ? Math.round(
          ((selectionsThisMonth - selectionsLastMonth) / selectionsLastMonth) *
            100
        )
      : 0;

  return (
    <div className='mx-auto container py-10'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Manage your recipes and ingredients database.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/admin/recipes/new'>
            <Button className='gap-1'>
              <Plus className='h-4 w-4' />
              Add New Recipe
            </Button>
          </Link>
          <Link href='/admin/categories'>
            <Button className='gap-1'>
              <Plus className='h-4 w-4' />
              Manage Categories
            </Button>
          </Link>
          <Link href='/admin/units'>
            <Button className='gap-1'>
              <Plus className='h-4 w-4' />
              Manage Units
            </Button>
          </Link>
          <Link href='/admin/manage-ingredients'>
            <Button className='gap-1'>
              <Plus className='h-4 w-4' />
              Manage Ingredients
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalRecipes}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              +{recipesThisMonth} added this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Published Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{publishedRecipes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Draft Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{draftRecipes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalIngredients}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              +{ingredientsThisMonth} added this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-8'>
        <Tabs defaultValue='recipes'>
          <TabsList>
            <TabsTrigger value='recipes'>Published Recipes</TabsTrigger>
            <TabsTrigger value='drafts'>Draft Recipes</TabsTrigger>
            <TabsTrigger value='ingredients'>Ingredients</TabsTrigger>
          </TabsList>
          <TabsContent value='recipes' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Published Recipes</CardTitle>
                <CardDescription>
                  View and manage all published recipes in your database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecipeTable recipes={publishedRecipes} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='drafts' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Draft Recipes</CardTitle>
                <CardDescription>
                  View and manage your draft recipes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecipeTable recipes={draftRecipes} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='ingredients' className='mt-4'>
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Management</CardTitle>
                <CardDescription>
                  View and manage all ingredients in your database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IngredientTable ingredients={ingredients} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
