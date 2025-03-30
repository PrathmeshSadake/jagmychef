"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IngredientTable } from "@/components/ingredient-table";

// Interfaces
interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isCreated: boolean;
  recipe: { name: string };
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export default function IngredientManagement() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key state

  // Form state
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("1"); // Default quantity

  // Fetch ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/ingredients/admin?isCreated=true");
        if (!response.ok) {
          throw new Error("Failed to fetch ingredients");
        }
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [refreshKey]); // Depend on refreshKey

  // Fetch units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch("/api/units");
        if (!response.ok) {
          throw new Error("Failed to fetch units");
        }
        const data = await response.json();
        setUnits(data);
      } catch (error) {
        console.error("Error fetching units:", error);
      } finally {
        setUnitsLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const refreshIngredients = () => {
    setRefreshKey((prev) => prev + 1); // Increment to trigger refresh
  };

  const openAddDialog = () => {
    setEditingIngredient(null);
    setName("");
    setUnit("");
    setQuantity("1");
    setError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setName(ingredient.name);
    setUnit(ingredient.unit);
    setQuantity(ingredient.quantity);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      setIsSubmitting(false);
      return;
    }

    if (!unit) {
      setError("Unit is required");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if name and unit combination already exists
      const existingIngredient = ingredients.find(
        (ing) =>
          ing.name.toLowerCase() === name.toLowerCase() &&
          ing.unit === unit &&
          ing.id !== (editingIngredient?.id || "")
      );

      if (existingIngredient) {
        setError("An ingredient with this name and unit already exists");
        setIsSubmitting(false);
        return;
      }

      // Prepare data
      const ingredientData = {
        name,
        unit,
        quantity,
        isCreated: true,
        // For new ingredients, we need a temporary recipeId
        // This will be used in the API route to handle the case
        recipeId: editingIngredient?.id ? undefined : "temporary",
      };

      // Submit to API
      const url = editingIngredient
        ? `/api/ingredients/${editingIngredient.id}?id=${editingIngredient.id}`
        : "/api/ingredients/admin";

      const method = editingIngredient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ingredientData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save ingredient");
      }

      // Close dialog and reset form
      setIsDialogOpen(false);
      setName("");
      setUnit("");
      setQuantity("1");
      setEditingIngredient(null);

      // Refresh data after a short delay to ensure backend has processed
      setTimeout(() => {
        refreshIngredients();
        router.refresh();
      }, 300);
    } catch (error) {
      console.error("Error saving ingredient:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Ingredient Management</h2>
        <Button onClick={openAddDialog}>
          <Plus className='h-4 w-4 mr-2' />
          Add Ingredient
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : ingredients.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          No ingredients found. Click "Add Ingredient" to create your first
          ingredient.
        </div>
      ) : (
        <IngredientTable ingredients={ingredients} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4 py-4'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm'>
                {error}
              </div>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='name'>Ingredient Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. Flour'
                disabled={isSubmitting}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='unit'>Unit</Label>
              <Select
                value={unit}
                onValueChange={setUnit}
                disabled={unitsLoading || isSubmitting}
              >
                <SelectTrigger id='unit'>
                  <SelectValue placeholder='Select unit' />
                </SelectTrigger>
                <SelectContent>
                  {unitsLoading ? (
                    <SelectItem value='loading' disabled>
                      Loading...
                    </SelectItem>
                  ) : units.length === 0 ? (
                    <SelectItem value='none' disabled>
                      No units available
                    </SelectItem>
                  ) : (
                    units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.symbol}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='quantity'>Default Quantity</Label>
              <Input
                id='quantity'
                type='text'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder='e.g. 1'
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter className='pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  "Save Ingredient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
