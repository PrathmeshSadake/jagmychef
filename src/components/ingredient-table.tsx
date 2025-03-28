// components/ingredient-table.tsx
"use client";

import { useState } from "react";
import { Trash2, MoreHorizontal, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isCreated?: boolean;
}

interface IngredientTableProps {
  ingredients: Ingredient[];
}

export function IngredientTable({ ingredients }: IngredientTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(
    null
  );

  const handleDelete = async () => {
    if (!ingredientToDelete) return;

    try {
      const response = await fetch(`/api/ingredients/${ingredientToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      } else {
        console.error("Failed to delete ingredient");
      }
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setIngredientToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setIngredientToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Default Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-6'>
                  No ingredients found.
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className='font-medium'>
                    {ingredient.name}
                  </TableCell>
                  <TableCell>{ingredient.quantity}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>
                    <Button onClick={() => {}}>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </Button>
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
              This action cannot be undone. This will permanently delete this
              ingredient from your database.
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
