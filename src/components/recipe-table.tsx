"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, EyeIcon, Loader2, Search, Copy, EyeOff, Eye } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecipeTableProps {
  recipes: Recipe[];
}

export function RecipeTable({ recipes }: RecipeTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingStatusIds, setProcessingStatusIds] = useState<string[]>([]);

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    setIsDeleting(true);
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
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setRecipeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Function to handle duplicating a recipe
  const handleDuplicate = (id: string) => {
    router.push(`/admin/recipes/${id}/duplicate`);
  };

  // Function to toggle recipe status (publish/unpublish)
  const toggleRecipeStatus = async (id: string) => {
    // Add recipe to processing state to show loading indicator
    setProcessingStatusIds(prev => [...prev, id]);
    
    try {
      const response = await fetch(`/api/recipes/${id}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      } else {
        console.error("Failed to toggle recipe status");
      }
    } catch (error) {
      console.error("Error toggling recipe status:", error);
    } finally {
      // Remove recipe from processing state
      setProcessingStatusIds(prev => prev.filter(recipeId => recipeId !== id));
    }
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className='space-y-4'>
        <div className='flex items-center gap-2 relative'>
          <Search className='absolute left-3 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Search recipes...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-9'
          />
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[250px] text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-6'>
                    {searchTerm
                      ? "No recipes found matching your search."
                      : "No recipes found. Add your first recipe!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className='font-medium'>{recipe.name}</TableCell>
                    <TableCell>
                      {recipe.status === "draft" ? (
                        <Badge
                          variant='outline'
                          className='bg-yellow-50 text-yellow-800 border-yellow-200'
                        >
                          Draft
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-800 border-green-200'
                        >
                          Published
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center gap-2'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/admin/recipes/${recipe.id}/view`}>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                              >
                                <EyeIcon className='h-4 w-4' />
                                <span className='sr-only'>View recipe</span>
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>View recipe</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/admin/recipes/${recipe.id}/edit`}>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                              >
                                <Edit className='h-4 w-4' />
                                <span className='sr-only'>Edit recipe</span>
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Edit recipe</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={() => handleDuplicate(recipe.id)}
                            >
                              <Copy className='h-4 w-4' />
                              <span className='sr-only'>Duplicate recipe</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate recipe</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className={`h-8 w-8 ${
                                recipe.status === "published"
                                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                              onClick={() => toggleRecipeStatus(recipe.id)}
                              disabled={processingStatusIds.includes(recipe.id)}
                            >
                              {processingStatusIds.includes(recipe.id) ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : recipe.status === "published" ? (
                                <EyeOff className='h-4 w-4' />
                              ) : (
                                <Eye className='h-4 w-4' />
                              )}
                              <span className='sr-only'>
                                {recipe.status === "published"
                                  ? "Unpublish recipe"
                                  : "Publish recipe"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {recipe.status === "published"
                              ? "Unpublish recipe"
                              : "Publish recipe"}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50'
                              onClick={() => confirmDelete(recipe.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                              <span className='sr-only'>Delete recipe</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete recipe</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
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
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
