// components/ingredient-table.tsx
"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export function IngredientTable({
  ingredients: initialIngredients,
}: IngredientTableProps) {
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEditClick = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    if (!currentIngredient) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/ingredients/admin?id=${currentIngredient.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: currentIngredient.name,
            quantity: currentIngredient.quantity,
            unit: currentIngredient.unit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ingredient");
      }

      const updatedIngredient = await response.json();

      // Update the ingredients list with the edited ingredient
      setIngredients(
        ingredients.map((ing) =>
          ing.id === updatedIngredient.id ? updatedIngredient : ing
        )
      );

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error updating ingredient:", error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
      setCurrentIngredient(null);
    }
  };

  const handleInputChange = (field: keyof Ingredient, value: string) => {
    if (currentIngredient) {
      setCurrentIngredient({
        ...currentIngredient,
        [field]: value,
      });
    }
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
                    <Button onClick={() => handleEditClick(ingredient)}>
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

      <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the ingredient details below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={currentIngredient?.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='quantity' className='text-right'>
                Quantity
              </Label>
              <Input
                id='quantity'
                value={currentIngredient?.quantity || ""}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='unit' className='text-right'>
                Unit
              </Label>
              <Input
                id='unit'
                value={currentIngredient?.unit || ""}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                className='col-span-3'
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
