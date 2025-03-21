"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define proper types
interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

interface Recipe {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  ingredients: Ingredient[];
  instructions: string[];
  categories?: Category[];
}

interface RecipeFormProps {
  recipe?: Recipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || [{ name: "", quantity: "", unit: "" }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions || [""]
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(recipe?.image || "");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    recipe?.categories || []
  );
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Units state
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState<boolean>(true);
  const [newUnitName, setNewUnitName] = useState<string>("");
  const [newUnitSymbol, setNewUnitSymbol] = useState<string>("");
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState<boolean>(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
        setCategoryLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch units from API
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch("/api/units");
        if (!response.ok) {
          throw new Error("Failed to fetch units");
        }
        const data = await response.json();
        setUnits(data);
        setUnitsLoading(false);
      } catch (error) {
        console.error("Error fetching units:", error);
        setUnitsLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addCategory = () => {
    if (!selectedCategoryId) return;

    const categoryToAdd = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    if (
      categoryToAdd &&
      !selectedCategories.some((cat) => cat.id === categoryToAdd.id)
    ) {
      setSelectedCategories([...selectedCategories, categoryToAdd]);
    }
    setSelectedCategoryId("");
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.filter((cat) => cat.id !== categoryId)
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitName.trim() || !newUnitSymbol.trim()) return;

    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUnitName.trim(),
          symbol: newUnitSymbol.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add unit");
      }

      const newUnit = await response.json();
      setUnits([...units, newUnit]);
      setNewUnitName("");
      setNewUnitSymbol("");
      setIsUnitDialogOpen(false);
    } catch (error) {
      console.error("Error adding unit:", error);
    }
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit || !newUnitName.trim() || !newUnitSymbol.trim()) return;

    try {
      const response = await fetch("/api/units", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUnit.id,
          name: newUnitName.trim(),
          symbol: newUnitSymbol.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update unit");
      }

      const updatedUnit = await response.json();
      setUnits(
        units.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
      );
      setEditingUnit(null);
      setNewUnitName("");
      setNewUnitSymbol("");
      setIsUnitDialogOpen(false);
    } catch (error) {
      console.error("Error updating unit:", error);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const response = await fetch(`/api/units?id=${unitId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete unit");
      }

      setUnits(units.filter((unit) => unit.id !== unitId));
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };

  const openAddUnitDialog = () => {
    setEditingUnit(null);
    setNewUnitName("");
    setNewUnitSymbol("");
    setIsUnitDialogOpen(true);
  };

  const openEditUnitDialog = (unit: Unit) => {
    setEditingUnit(unit);
    setNewUnitName(unit.name);
    setNewUnitSymbol(unit.symbol);
    setIsUnitDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Add ingredients to formData
    ingredients.forEach((ingredient) => {
      formData.append(`ingredientName`, ingredient.name);
      formData.append(`ingredientQuantity`, ingredient.quantity);
      formData.append(`ingredientUnit`, ingredient.unit);
    });

    // Add instructions to formData
    instructions.forEach((instruction) => {
      formData.append("instruction", instruction);
    });

    // Add categories to formData
    selectedCategories.forEach((category) => {
      formData.append("categoryIds", category.id);
    });

    // Handle image upload if there's a new image
    if (imageFile) {
      formData.set("image", imageFile);
    } else if (imagePreview) {
      formData.set("image", imagePreview);
    }

    try {
      // Submit the form data to the server
      const response = await fetch("/api/recipes", {
        method: recipe ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      // Redirect back to admin page after submission
      router.push("/admin");
    } catch (error) {
      console.error("Error saving recipe:", error);
      // Handle error state here
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='name'>Recipe Name</Label>
              <Input
                id='name'
                name='name'
                placeholder='Enter recipe name'
                defaultValue={recipe?.name || ""}
                required
              />
            </div>

            <div className='grid gap-3'>
              <Label>Categories</Label>
              <div className='flex flex-wrap gap-2 mb-2'>
                {selectedCategories.map((category) => (
                  <Badge
                    key={category.id}
                    variant='secondary'
                    className='px-3 py-1 flex items-center gap-1'
                  >
                    {category.name}
                    <button
                      type='button'
                      onClick={() => removeCategory(category.id)}
                      className='ml-1 rounded-full'
                      aria-label={`Remove ${category.name} category`}
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className='flex gap-2'>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                  disabled={categoryLoading}
                >
                  <SelectTrigger id='category-select'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={addCategory}
                  disabled={!selectedCategoryId}
                  aria-label='Add category'
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='grid gap-3'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Enter recipe description'
                defaultValue={recipe?.description || ""}
                rows={3}
              />
            </div>

            <div className='grid gap-3'>
              <Label htmlFor='recipe-image'>Recipe Image</Label>
              <div className='border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center relative'>
                {imagePreview ? (
                  <div className='mb-4 w-full max-w-md'>
                    <img
                      src={imagePreview}
                      alt='Recipe preview'
                      className='w-full rounded-md'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='mt-2'
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className='h-8 w-8 text-muted-foreground mb-2' />
                    <p className='text-sm text-muted-foreground mb-1'>
                      Drag and drop an image here or click to upload
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      PNG, JPG or WEBP (max. 2MB)
                    </p>
                  </>
                )}
                <Input
                  type='file'
                  className={
                    imagePreview
                      ? "hidden"
                      : "opacity-0 absolute inset-0 cursor-pointer"
                  }
                  accept='image/png,image/jpeg,image/webp'
                  id='recipe-image'
                  onChange={handleImageChange}
                />
                {!imagePreview && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='mt-4'
                    onClick={() =>
                      document.getElementById("recipe-image")?.click()
                    }
                  >
                    Select Image
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='pt-6'>
          <h3 className='text-lg font-medium mb-4'>Ingredients</h3>
          <div className='space-y-4'>
            {ingredients.map((ingredient, index) => (
              <div key={index} className='flex gap-3 items-start'>
                <div className='grid gap-2 flex-1'>
                  <Label htmlFor={`ingredient-${index}`}>Ingredient Name</Label>
                  <Input
                    id={`ingredient-${index}`}
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    placeholder='e.g. Flour'
                    required
                  />
                </div>
                <div className='grid gap-2 w-24'>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(index, "quantity", e.target.value)
                    }
                    placeholder='e.g. 200'
                    required
                  />
                </div>
                <div className='grid gap-2 w-24'>
                  <Label htmlFor={`unit-${index}`}>Unit</Label>
                  <Select
                    value={ingredient.unit}
                    onValueChange={(value) =>
                      updateIngredient(index, "unit", value)
                    }
                  >
                    <SelectTrigger id={`unit-${index}`}>
                      <SelectValue placeholder='Unit' />
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
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='mt-8'
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                  aria-label='Remove ingredient'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={addIngredient}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Ingredient
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Units Management Section */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium'>Unit Management</h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={openAddUnitDialog}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Unit
            </Button>
          </div>

          {unitsLoading ? (
            <p>Loading units...</p>
          ) : units.length === 0 ? (
            <p className='text-muted-foreground'>
              No units available. Add your first unit.
            </p>
          ) : (
            <div className='grid gap-2'>
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className='flex items-center justify-between border p-3 rounded-md'
                >
                  <div>
                    <span className='font-medium'>{unit.name}</span>
                    <span className='text-muted-foreground ml-2'>
                      ({unit.symbol})
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => openEditUnitDialog(unit)}
                    >
                      Edit
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-red-500'
                      onClick={() => handleDeleteUnit(unit.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unit Dialog */}
      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Edit Unit" : "Add New Unit"}
            </DialogTitle>
            <DialogDescription>
              {editingUnit
                ? "Update the unit name and symbol."
                : "Enter a name and symbol for the new unit."}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='unit-name'>Name</Label>
              <Input
                id='unit-name'
                placeholder='e.g. Gram'
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='unit-symbol'>Symbol</Label>
              <Input
                id='unit-symbol'
                placeholder='e.g. g'
                value={newUnitSymbol}
                onChange={(e) => setNewUnitSymbol(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsUnitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={editingUnit ? handleUpdateUnit : handleAddUnit}
            >
              {editingUnit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className='pt-6'>
          <h3 className='text-lg font-medium mb-4'>Prep Instructions</h3>
          <div className='space-y-4'>
            {instructions.map((instruction, index) => (
              <div key={index} className='flex gap-3 items-start'>
                <div className='flex-none pt-3 text-muted-foreground font-medium'>
                  {index + 1}.
                </div>
                <div className='grid gap-2 flex-1'>
                  <Label htmlFor={`instruction-${index}`} className='sr-only'>
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
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='mt-2'
                  onClick={() => removeInstruction(index)}
                  disabled={instructions.length === 1}
                  aria-label='Remove instruction'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={addInstruction}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Step
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push("/admin")}
        >
          Cancel
        </Button>
        <Button type='submit'>Save Recipe</Button>
      </div>
    </form>
  );
}
