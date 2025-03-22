import { getRecipes } from "@/lib/data";
import RecipesPageClient from "@/components/recipes-page-client";

export default async function RecipesPage() {
  const recipes = await getRecipes();
  return <RecipesPageClient initialRecipes={recipes as any} />;
}
