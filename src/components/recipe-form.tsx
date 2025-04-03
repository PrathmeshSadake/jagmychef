"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Search,
  MoveUp,
  MoveDown,
} from "lucide-react";

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
import { Slider } from "@/components/ui/slider";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Switch } from "./ui/switch";

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

  // New category dialog state
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] =
    useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [addingCategory, setAddingCategory] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);

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

  // Image editing states
  const [brightness, setBrightness] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [imageSize, setImageSize] = useState(100);

  const [showImageTools, setShowImageTools] = useState<boolean>(false);

  // Refs
  const imageRef = useRef(null);

  // State for crop
  const [cropMode, setCropMode] = useState(false);
  const [cropActive, setCropActive] = useState(false);
  const [cropStartX, setCropStartX] = useState(0);
  const [cropStartY, setCropStartY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Functions for crop
  const startCrop = (e: any) => {
    if (isResizing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropStartX(x);
    setCropStartY(y);
    setCropWidth(0);
    setCropHeight(0);
    setCropActive(true);
    setIsDragging(true);
  };

  const updateCrop = (e: any) => {
    if (!isDragging && !isResizing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      // Update crop area while dragging
      setCropWidth(x - cropStartX);
      setCropHeight(y - cropStartY);
    } else if (isResizing) {
      // Update crop size while resizing
      setCropWidth(Math.max(10, x - cropStartX));
      setCropHeight(Math.max(10, y - cropStartY));
    }
  };

  const endCrop = () => {
    setIsDragging(false);
    setIsResizing(false);

    // Make sure we have positive width and height
    if (cropWidth < 0) {
      setCropStartX(cropStartX + cropWidth);
      setCropWidth(Math.abs(cropWidth));
    }

    if (cropHeight < 0) {
      setCropStartY(cropStartY + cropHeight);
      setCropHeight(Math.abs(cropHeight));
    }
  };

  const startResizeCrop = (e: any) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const applyCrop = () => {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx: any = canvas.getContext("2d");

    // Adjust crop coordinates for image size
    const sizeRatio = imageSize / 100;
    const actualWidth = cropWidth / sizeRatio;
    const actualHeight = cropHeight / sizeRatio;
    const actualX = cropStartX / sizeRatio;
    const actualY = cropStartY / sizeRatio;

    // Create a new image to get original dimensions
    const img = new Image();
    img.src = imagePreview;

    img.onload = () => {
      // Set canvas dimensions to the crop size
      canvas.width = actualWidth;
      canvas.height = actualHeight;

      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw the cropped portion of the image to the canvas
      ctx.drawImage(
        img,
        actualX,
        actualY,
        actualWidth,
        actualHeight,
        0,
        0,
        actualWidth,
        actualHeight
      );

      // Convert canvas to blob and update the image
      canvas.toBlob(
        (blob) => {
          // Create a new file from the blob
          const newFile = new File([blob!], "cropped-image.jpeg", {
            type: "image/jpeg",
          });

          // Create a new object URL for preview
          const newImagePreview = URL.createObjectURL(blob!);

          // Update state
          setImagePreview(newImagePreview);
          setImageFile(newFile);

          // Reset crop-related state
          setCropMode(false);
          setCropActive(false);
          setBrightness(100);
          setRotation(0);
          setImageSize(100);
        },
        "image/jpeg",
        0.95
      );
    };
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
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

  useEffect(() => {
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

  const moveIngredientUp = (index: number) => {
    if (index === 0) return;
    const newIngredients = [...ingredients];
    const temp = newIngredients[index];
    newIngredients[index] = newIngredients[index - 1];
    newIngredients[index - 1] = temp;
    setIngredients(newIngredients);
  };

  const moveIngredientDown = (index: number) => {
    if (index === ingredients.length - 1) return;
    const newIngredients = [...ingredients];
    const temp = newIngredients[index];
    newIngredients[index] = newIngredients[index + 1];
    newIngredients[index + 1] = temp;
    setIngredients(newIngredients);
  };

  const selectSavedIngredient = (
    index: number,
    savedIngredient: SavedIngredient
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      name: savedIngredient.name,
      // Don't auto-populate quantity as requested
      quantity: "",
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    try {
      setAddingCategory(true);
      setCategoryError(null);

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();

      // Update categories list
      setCategories([...categories, newCategory]);

      // Select the newly created category
      setSelectedCategories([...selectedCategories, newCategory]);

      // Reset form
      setNewCategoryName("");
      setCategorySuccess("Category created successfully");

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setNewCategoryDialogOpen(false);
        setCategorySuccess(null);
      }, 1500);
    } catch (error) {
      console.error("Error creating category:", error);
      setCategoryError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setAddingCategory(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setShowImageTools(true);
        // Reset image editing values
        setBrightness(100);
        setRotation(0);
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
      // Add image editing parameters if they were changed
      if (brightness !== 100) {
        formData.append("brightness", brightness.toString());
      }
      if (rotation !== 0) {
        formData.append("rotation", rotation.toString());
      }
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

                {/* New "Add New Category" Button */}
                <Dialog
                  open={newCategoryDialogOpen}
                  onOpenChange={setNewCategoryDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type='button'
                      variant='secondary'
                      disabled={isSubmitting}
                    >
                      Add New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Add a new category that will be available for all
                        recipes.
                      </DialogDescription>
                    </DialogHeader>

                    {categoryError && (
                      <Alert variant='destructive'>
                        <AlertTitle>{categoryError}</AlertTitle>
                      </Alert>
                    )}

                    {categorySuccess && (
                      <Alert>
                        <AlertTitle>{categorySuccess}</AlertTitle>
                      </Alert>
                    )}

                    <div className='grid gap-4 py-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='new-category-name'>Category Name</Label>
                        <Input
                          id='new-category-name'
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder='Enter category name'
                          disabled={addingCategory}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                          setNewCategoryDialogOpen(false);
                          setNewCategoryName("");
                          setCategoryError(null);
                          setCategorySuccess(null);
                        }}
                        disabled={addingCategory}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='button'
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim() || addingCategory}
                      >
                        {addingCategory ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Creating...
                          </>
                        ) : (
                          "Create Category"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                    <div className='relative'>
                      <img
                        src={imagePreview}
                        alt='Recipe preview'
                        className='w-full rounded-md'
                        style={{
                          filter: `brightness(${brightness}%)`,
                          transform: `rotate(${rotation}deg)`,
                          width: `${imageSize}%`,
                        }}
                        ref={imageRef}
                      />
                    </div>

                    {/* Image editing tools */}
                    {showImageTools && (
                      <div className='mt-4 space-y-4'>
                        <div>
                          <Label htmlFor='brightness'>Brightness</Label>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm'>0%</span>
                            <Slider
                              id='brightness'
                              min={0}
                              max={200}
                              step={5}
                              value={[brightness]}
                              onValueChange={(values) =>
                                setBrightness(values[0])
                              }
                              disabled={isSubmitting}
                              className='flex-1'
                            />
                            <span className='text-sm'>200%</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor='rotation'>Rotation</Label>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm'>-180°</span>
                            <Slider
                              id='rotation'
                              min={-180}
                              max={180}
                              step={90}
                              value={[rotation]}
                              onValueChange={(values) => setRotation(values[0])}
                              disabled={isSubmitting}
                              className='flex-1'
                            />
                            <span className='text-sm'>180°</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor='size'>Resize</Label>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm'>50%</span>
                            <Slider
                              id='size'
                              min={50}
                              max={150}
                              step={5}
                              value={[imageSize]}
                              onValueChange={(values) =>
                                setImageSize(values[0])
                              }
                              disabled={isSubmitting}
                              className='flex-1'
                            />
                            <span className='text-sm'>150%</span>
                          </div>
                        </div>

                        <div className='flex justify-between'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setBrightness(100);
                              setRotation(0);
                              setImageSize(100);
                              setCropMode(false);
                              setCropActive(false);
                            }}
                            disabled={isSubmitting}
                          >
                            Reset All
                          </Button>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setShowImageTools(false)}
                            disabled={isSubmitting}
                          >
                            Hide Tools
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className='flex justify-between mt-2'>
                      {!showImageTools && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => setShowImageTools(true)}
                          disabled={isSubmitting}
                        >
                          Edit Image
                        </Button>
                      )}
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          setShowImageTools(false);
                          setBrightness(100);
                          setRotation(0);
                          setImageSize(100);
                          setCropMode(false);
                          setCropActive(false);
                        }}
                        disabled={isSubmitting}
                      >
                        Remove Image
                      </Button>
                    </div>
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
                                  {item.unit}
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

                {/* Reordering buttons */}
                <div className='flex flex-col gap-1 mt-5'>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    onClick={() => moveIngredientUp(index)}
                    disabled={index === 0 || isSubmitting}
                    aria-label='Move ingredient up'
                    className='h-6 w-6'
                  >
                    <MoveUp className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    onClick={() => moveIngredientDown(index)}
                    disabled={index === ingredients.length - 1 || isSubmitting}
                    aria-label='Move ingredient down'
                    className='h-6 w-6'
                  >
                    <MoveDown className='h-4 w-4' />
                  </Button>
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
