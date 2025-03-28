"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X, Loader2, Search } from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define proper types
interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface SavedIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isCreated: boolean;
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
  chefInstructions: string[];
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

  // Loading and submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Saved ingredients state
  const [savedIngredients, setSavedIngredients] = useState<SavedIngredient[]>(
    []
  );
  const [filteredIngredients, setFilteredIngredients] = useState<
    SavedIngredient[]
  >([]);
  const [ingredientSearch, setIngredientSearch] = useState<string>("");
  const [ingredientsLoading, setIngredientsLoading] = useState<boolean>(true);

  const [chefInstructions, setChefInstructions] = useState<string[]>(
    recipe?.chefInstructions || [""]
  );

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

  // Fetch saved ingredients from API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredients/admin?isCreated=true");
        if (!response.ok) {
          throw new Error("Failed to fetch ingredients");
        }
        const data = await response.json();
        setSavedIngredients(data);
        setFilteredIngredients(data);
        setIngredientsLoading(false);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        setIngredientsLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // Filter ingredients based on search
  useEffect(() => {
    if (ingredientSearch.trim() === "") {
      setFilteredIngredients(savedIngredients);
    } else {
      setFilteredIngredients(
        savedIngredients.filter((ingredient) =>
          ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
        )
      );
    }
  }, [ingredientSearch, savedIngredients]);

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

  const selectSavedIngredient = (
    index: number,
    savedIngredient: SavedIngredient
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      name: savedIngredient.name,
      quantity: savedIngredient.quantity,
      unit: savedIngredient.unit,
    };
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

  // New methods for chef instructions
  const addChefInstruction = () => {
    setChefInstructions([...chefInstructions, ""]);
  };

  const removeChefInstruction = (index: number) => {
    setChefInstructions(chefInstructions.filter((_, i) => i !== index));
  };

  const updateChefInstruction = (index: number, value: string) => {
    const newChefInstructions = [...chefInstructions];
    newChefInstructions[index] = value;
    setChefInstructions(newChefInstructions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

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
    // Add chef instructions to formData
    chefInstructions.forEach((chefInstruction) => {
      formData.append("chefInstruction", chefInstruction);
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
      const response = await fetch(
        recipe ? `/api/recipes?id=${recipe.id}` : "/api/recipes",
        {
          method: recipe ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save recipe");
      }

      // Redirect back to admin page after successful submission
      router.push("/admin");
    } catch (error) {
      console.error("Error saving recipe:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsSubmitting(false);
    }
  };

  // Determine if the form can be submitted
  const isFormValid =
    ingredients.every((ing) => ing.name && ing.quantity && ing.unit) &&
    instructions.every((inst) => inst.trim() !== "") &&
    chefInstructions.every((inst) => inst.trim() !== "");

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {submitError && (
        <div className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-md'>
          {submitError}
        </div>
      )}

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
                disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                  disabled={categoryLoading || isSubmitting}
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
                  disabled={!selectedCategoryId || isSubmitting}
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
                disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
              <div key={index} className='flex gap-3 items-center'>
                <div className='grid gap-2 flex-1'>
                  <div className='flex gap-2 items-center'>
                    <Label htmlFor={`ingredient-${index}`}>
                      Ingredient Name
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Input
                      id={`ingredient-${index}`}
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      placeholder='e.g. Flour'
                      required
                      disabled={isSubmitting}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='ml-auto h-8 px-2'
                          disabled={isSubmitting || ingredientsLoading}
                        >
                          Select Ingredient
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-80 p-0' align='end'>
                        <div className='p-2 border-b'>
                          <div className='flex items-center gap-2'>
                            <Search className='h-4 w-4 text-muted-foreground' />
                            <Input
                              placeholder='Search ingredients...'
                              className='h-8 border-none focus-visible:ring-0'
                              value={ingredientSearch}
                              onChange={(e) =>
                                setIngredientSearch(e.target.value)
                              }
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                        <div className='max-h-60 overflow-y-auto'>
                          {ingredientsLoading ? (
                            <div className='p-4 text-center text-muted-foreground'>
                              <Loader2 className='h-4 w-4 animate-spin mx-auto mb-2' />
                              Loading ingredients...
                            </div>
                          ) : filteredIngredients.length === 0 ? (
                            <div className='p-4 text-center text-muted-foreground'>
                              No ingredients found
                            </div>
                          ) : (
                            filteredIngredients.map((item) => (
                              <button
                                key={item.id}
                                type='button'
                                className='w-full text-left px-3 py-2 hover:bg-muted/50 flex justify-between items-center'
                                onClick={() => {
                                  selectSavedIngredient(index, item);
                                }}
                                disabled={isSubmitting}
                              >
                                <span className='font-medium'>{item.name}</span>
                                <span className='text-sm text-muted-foreground'>
                                  {item.quantity} {item.unit}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(index, "quantity", e.target.value)
                    }
                    placeholder='e.g. 200'
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor={`unit-${index}`}>Unit</Label>
                  <Select
                    value={ingredient.unit}
                    onValueChange={(value) =>
                      updateIngredient(index, "unit", value)
                    }
                    disabled={unitsLoading || isSubmitting}
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
                  size='icon'
                  className='mt-5'
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1 || isSubmitting}
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
              disabled={isSubmitting}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Ingredient
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='mt-2'
                  onClick={() => removeInstruction(index)}
                  disabled={instructions.length === 1 || isSubmitting}
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
              disabled={isSubmitting}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Step
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='pt-6'>
          <h3 className='text-lg font-medium mb-4'>Chef Instructions</h3>
          <div className='space-y-4'>
            {chefInstructions.map((instruction, index) => (
              <div key={index} className='flex gap-3 items-start'>
                <div className='flex-none pt-3 text-muted-foreground font-medium'>
                  {index + 1}.
                </div>
                <div className='grid gap-2 flex-1'>
                  <Label
                    htmlFor={`chef-instruction-${index}`}
                    className='sr-only'
                  >
                    Chef Step {index + 1}
                  </Label>
                  <Textarea
                    id={`chef-instruction-${index}`}
                    value={instruction}
                    onChange={(e) =>
                      updateChefInstruction(index, e.target.value)
                    }
                    placeholder={`Enter chef's special tip or technique for step ${
                      index + 1
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='mt-2'
                  onClick={() => removeChefInstruction(index)}
                  disabled={chefInstructions.length === 1 || isSubmitting}
                  aria-label='Remove chef instruction'
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
              onClick={addChefInstruction}
              disabled={isSubmitting}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Chef Tip
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push("/admin")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            "Save Recipe"
          )}
        </Button>
      </div>
    </form>
  );
}
