"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const ingredients = [
  {
    id: "1",
    name: "Flour",
    category: "Baking",
    defaultUnit: "g",
    usedInRecipes: 24,
  },
  {
    id: "2",
    name: "Olive Oil",
    category: "Oils",
    defaultUnit: "ml",
    usedInRecipes: 42,
  },
  {
    id: "3",
    name: "Chicken Breast",
    category: "Meat",
    defaultUnit: "g",
    usedInRecipes: 18,
  },
  {
    id: "4",
    name: "Garlic",
    category: "Vegetables",
    defaultUnit: "cloves",
    usedInRecipes: 56,
  },
  {
    id: "5",
    name: "Salt",
    category: "Spices",
    defaultUnit: "g",
    usedInRecipes: 78,
  },
]

export function IngredientTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredIngredients = ingredients.filter(
    (ingredient) =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Default Unit</TableHead>
              <TableHead>Used In</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ingredient.category}</Badge>
                </TableCell>
                <TableCell>{ingredient.defaultUnit}</TableCell>
                <TableCell>{ingredient.usedInRecipes} recipes</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

