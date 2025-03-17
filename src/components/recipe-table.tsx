"use client"

import { useState } from "react"
import Link from "next/link"
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

const recipes = [
  {
    id: "1",
    name: "Spaghetti Carbonara",
    cuisine: "Italian",
    ingredients: 6,
    createdAt: "2023-10-15",
  },
  {
    id: "2",
    name: "Chicken Tikka Masala",
    cuisine: "Indian",
    ingredients: 12,
    createdAt: "2023-10-12",
  },
  {
    id: "3",
    name: "Beef Tacos",
    cuisine: "Mexican",
    ingredients: 8,
    createdAt: "2023-10-10",
  },
  {
    id: "4",
    name: "Pad Thai",
    cuisine: "Thai",
    ingredients: 10,
    createdAt: "2023-10-08",
  },
  {
    id: "5",
    name: "Caesar Salad",
    cuisine: "American",
    ingredients: 7,
    createdAt: "2023-10-05",
  },
]

export function RecipeTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search recipes..."
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
              <TableHead>Cuisine</TableHead>
              <TableHead>Ingredients</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/recipes/${recipe.id}`} className="font-medium hover:underline">
                    {recipe.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{recipe.cuisine}</Badge>
                </TableCell>
                <TableCell>{recipe.ingredients}</TableCell>
                <TableCell>{recipe.createdAt}</TableCell>
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

