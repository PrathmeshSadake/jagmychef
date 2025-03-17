"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RecipeForm({ recipe }: { recipe?: any }) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState(recipe?.ingredients || [{ name: "", quantity: "", unit: "" }])
  const [instructions, setInstructions] = useState(recipe?.instructions || [""])

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Here we would normally submit the form data to the server
    // For now, we'll just simulate a successful submission
    console.log({
      ...recipe,
      ingredients,
      instructions,
    })

    // Redirect back to admin page after submission
    router.push("/admin")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Recipe Name</Label>
              <Input id="name" placeholder="Enter recipe name" defaultValue={recipe?.name || ""} required />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select defaultValue={recipe?.cuisine || ""}>
                <SelectTrigger id="cuisine">
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="thai">Thai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter recipe description"
                defaultValue={recipe?.description || ""}
                rows={3}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
              <Input id="prepTime" type="number" placeholder="30" defaultValue={recipe?.prepTime || ""} />
            </div>

            <div className="grid gap-3">
              <Label>Recipe Image</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Drag and drop an image here or click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 2MB)</p>
                <Input type="file" className="hidden" accept="image/*" id="recipe-image" />
                <Button type="button" variant="outline" size="sm" className="mt-4">
                  Select Image
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Ingredients</h3>
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`ingredient-${index}`}>Ingredient Name</Label>
                  <Input
                    id={`ingredient-${index}`}
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    placeholder="e.g. Flour"
                    required
                  />
                </div>
                <div className="grid gap-2 w-24">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                    placeholder="e.g. 200"
                    required
                  />
                </div>
                <div className="grid gap-2 w-24">
                  <Label htmlFor={`unit-${index}`}>Unit</Label>
                  <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(index, "unit", value)}>
                    <SelectTrigger id={`unit-${index}`}>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="tbsp">tbsp</SelectItem>
                      <SelectItem value="tsp">tsp</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeIngredient(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Instructions</h3>
          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-none pt-3 text-muted-foreground font-medium">{index + 1}.</div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`instruction-${index}`} className="sr-only">
                    Step {index + 1}
                  </Label>
                  <Textarea
                    id={`instruction-${index}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Enter step ${index + 1} instructions`}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-2"
                  onClick={() => removeInstruction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addInstruction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
          Cancel
        </Button>
        <Button type="submit">Save Recipe</Button>
      </div>
    </form>
  )
}

