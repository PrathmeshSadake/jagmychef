"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Loader2,
  Trash2,
  Pencil,
  X,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editImage, setEditImage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const router = useRouter();
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Auto-dismiss success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/categories/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      setError(error.message || "Error uploading image");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-primary");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-primary");
    }
  };

  const handleDrop = (e: React.DragEvent, isEdit: boolean = false) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-primary");
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match("image.*")) {
        setError("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (isEdit) {
          setEditImagePreview(result);
          if (editImageInputRef.current) {
            // Create a DataTransfer object to set files
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            editImageInputRef.current.files = dataTransfer.files;
          }
        } else {
          setNewImagePreview(result);
          if (newImageInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            newImageInputRef.current.files = dataTransfer.files;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      return setError("Category name is required");
    }

    try {
      setIsSubmitting(true);
      let imageUrl = "";
      const fileInput = newImageInputRef.current;
      const file = fileInput?.files?.[0];

      if (file) {
        imageUrl = await uploadImage(file);
      } else {
        imageUrl =
          "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      setNewCategoryName("");
      setNewImagePreview("");
      if (fileInput) fileInput.value = "";
      setSuccessMessage("Category created successfully");
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editName.trim()) return setError("Category name is required");

    try {
      setIsSubmitting(true);
      let imageUrl = editImage;
      const fileInput = editImageInputRef.current;
      const file = fileInput?.files?.[0];

      if (file) {
        imageUrl = await uploadImage(file);
      }

      const response = await fetch(`/api/categories/${id}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to update category");

      setEditingCategory(null);
      setEditImagePreview("");
      setSuccessMessage("Category updated successfully");
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/categories/${categoryToDelete}?id=${categoryToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete category");

      setSuccessMessage("Category deleted successfully");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold mb-1'>Category Management</h1>
          <p className='text-muted-foreground'>
            Create and manage product categories
          </p>
        </div>
        <Link href='/admin'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back to Admin</span>
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6 animate-in fade-in'>
          <AlertTitle className='font-semibold'>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-2 top-2'
            onClick={() => setError("")}
          >
            <X className='h-4 w-4' />
          </Button>
        </Alert>
      )}

      {successMessage && (
        <Alert className='mb-6 bg-green-50 border-green-200 animate-in fade-in'>
          <Check className='h-4 w-4 text-green-600' />
          <AlertTitle className='font-semibold text-green-800'>
            {successMessage}
          </AlertTitle>
        </Alert>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new product category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className='space-y-6'>
              <div className='space-y-2'>
                <label htmlFor='category-name' className='text-sm font-medium'>
                  Category Name
                </label>
                <Input
                  id='category-name'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder='Enter category name'
                  className={!newCategoryName.trim() ? "border-red-300" : ""}
                />
                {!newCategoryName.trim() && (
                  <p className='text-red-500 text-xs mt-1'>
                    Category name is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <label htmlFor='new-image' className='text-sm font-medium'>
                  Category Image
                </label>

                <div
                  ref={dropZoneRef}
                  className='border-2 border-dashed rounded-md p-6 transition-colors duration-200 hover:border-primary cursor-pointer'
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e)}
                  onClick={() => newImageInputRef.current?.click()}
                >
                  <div className='flex flex-col items-center justify-center text-center'>
                    <Upload className='h-10 w-10 text-muted-foreground mb-2' />
                    <p className='text-sm font-medium'>
                      Drag and drop an image, or click to browse
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      SVG, PNG, JPG or GIF (max. 2MB)
                    </p>
                  </div>
                  <Input
                    id='new-image'
                    ref={newImageInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleNewImageChange}
                    className='hidden'
                  />
                </div>

                {newImagePreview && (
                  <div className='relative mt-4'>
                    <div className='relative h-32 w-32 rounded-md overflow-hidden border'>
                      <img
                        src={newImagePreview}
                        alt='Preview'
                        className='object-cover h-full w-full'
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200'
                      onClick={() => {
                        setNewImagePreview("");
                        if (newImageInputRef.current)
                          newImageInputRef.current.value = "";
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type='submit'
                className='w-full'
                disabled={isSubmitting || !newCategoryName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Category</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage existing categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex justify-center items-center py-10'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : categories.length === 0 ? (
              <div className='text-center py-10 text-muted-foreground'>
                <p>No categories found.</p>
                <p className='text-sm mt-2'>
                  Create your first category to get started.
                </p>
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {editingCategory === category.id ? (
                            <div className='space-y-3 w-full'>
                              <div
                                className='border-2 border-dashed rounded-md p-4 transition-colors duration-200 hover:border-primary cursor-pointer'
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, true)}
                                onClick={() =>
                                  editImageInputRef.current?.click()
                                }
                              >
                                <div className='flex flex-col items-center text-center'>
                                  <Upload className='h-6 w-6 text-muted-foreground mb-1' />
                                  <p className='text-xs'>Change image</p>
                                </div>
                                <Input
                                  type='file'
                                  accept='image/*'
                                  ref={editImageInputRef}
                                  onChange={handleEditImageChange}
                                  className='hidden'
                                />
                              </div>
                              <div className='relative h-16 w-16 overflow-hidden rounded-md border'>
                                <img
                                  src={editImagePreview || category.image}
                                  alt={category.name}
                                  className='object-cover h-full w-full'
                                />
                              </div>
                            </div>
                          ) : (
                            <div className='relative h-16 w-16 overflow-hidden rounded-md border'>
                              <img
                                src={category.image}
                                alt={category.name}
                                className='object-cover h-full w-full'
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCategory === category.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={
                                !editName.trim() ? "border-red-300" : ""
                              }
                            />
                          ) : (
                            <span className='font-medium'>{category.name}</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {editingCategory === category.id ? (
                            <div className='flex gap-2 justify-end'>
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleUpdateCategory(category.id)
                                }
                                disabled={isSubmitting || !editName.trim()}
                              >
                                {isSubmitting ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <span>Save</span>
                                )}
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setEditingCategory(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className='flex gap-2 justify-end'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='flex items-center gap-1'
                                onClick={() => {
                                  setEditingCategory(category.id);
                                  setEditName(category.name);
                                  setEditImage(category.image);
                                  setEditImagePreview("");
                                }}
                              >
                                <Pencil className='h-4 w-4' />
                                <span className='hidden sm:inline'>Edit</span>
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                className='flex items-center gap-1'
                                onClick={() => openDeleteDialog(category.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                                <span className='hidden sm:inline'>Delete</span>
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className='bg-red-500 hover:bg-red-600'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
