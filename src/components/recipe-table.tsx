// components/recipe-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Recipe } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecipeTableProps {
  recipes: Recipe[];
}

export function RecipeTable({ recipes }: RecipeTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    try {
      const response = await fetch(
        `/api/recipes/${recipeToDelete}?id=${recipeToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      } else {
        console.error("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    console.log(id);
    setRecipeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {/* <TableHead>Cuisine</TableHead> */}
              <TableHead>Created</TableHead>
              {/* <TableHead>Ingredients</TableHead> */}
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-6'>
                  No recipes found. Add your first recipe!
                </TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className='font-medium'>{recipe.name}</TableCell>
                  {/* <TableCell>{recipe.cuisine}</TableCell> */}
                  <TableCell>
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </TableCell>
                  {/* <TableCell>{recipe.ingredients.length}</TableCell> */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/admin/recipes/${recipe.id}`}>
                          <DropdownMenuItem>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(recipe.id)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              recipe and all its ingredients from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-600'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
