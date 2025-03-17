import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { getSelectedRecipes, getShoppingList } from "@/lib/data"
import { ShoppingListActions } from "@/components/shopping-list-actions"

export default async function ShoppingListPage() {
  const selectedRecipes = await getSelectedRecipes()
  const shoppingList = await getShoppingList()

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/recipes" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Recipes
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping List</h1>
          <p className="text-muted-foreground mt-1">Your consolidated ingredients from selected recipes.</p>
        </div>
        <ShoppingListActions shoppingList={shoppingList} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(shoppingList).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No ingredients in your shopping list yet</p>
                  <Link href="/recipes">
                    <Button>Browse Recipes</Button>
                  </Link>
                </div>
              ) : (
                Object.entries(shoppingList).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-medium text-lg mb-2">{category}</h3>
                    <Separator className="mb-3" />
                    <ul className="space-y-2">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox id={`item-${category}-${index}`} />
                            <label htmlFor={`item-${category}-${index}`} className="text-sm cursor-pointer">
                              {item.name}
                            </label>
                          </div>
                          <span className="text-sm text-muted-foreground">
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Selected Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedRecipes.map((recipe) => (
                  <li key={recipe.id} className="flex justify-between items-center">
                    <Link href={`/recipes/${recipe.id}`} className="text-sm hover:underline">
                      {recipe.name}
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              {selectedRecipes.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm mb-4">No recipes selected yet</p>
                  <Link href="/recipes">
                    <Button variant="outline" size="sm">
                      Browse Recipes
                    </Button>
                  </Link>
                </div>
              )}
              {selectedRecipes.length > 0 && selectedRecipes.length < 4 && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    You can select up to 4 recipes. Currently selected: {selectedRecipes.length}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

