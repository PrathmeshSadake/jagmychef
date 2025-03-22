"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const router = useRouter();

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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return setError("Category name is required");
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!response.ok) throw new Error("Failed to create category");
      setNewCategoryName("");
      setSuccessMessage("Category created successfully");
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editName.trim()) return setError("Category name is required");
    try {
      const response = await fetch(`/api/categories/${id}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!response.ok) throw new Error("Failed to update category");
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await fetch(`/api/categories/${id}?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Category Management</h1>
        <Link href='/admin'>
          <Button variant='secondary'>Back to Admin</Button>
        </Link>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      {successMessage && (
        <Alert>
          <AlertTitle>{successMessage}</AlertTitle>
        </Alert>
      )}

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCategory} className='flex gap-4'>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder='Category Name'
            />
            <Button type='submit'>Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingCategory === category.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {editingCategory === category.id ? (
                        <div className='flex gap-2 justify-end'>
                          <Button
                            onClick={() => handleUpdateCategory(category.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant='secondary'
                            onClick={() => setEditingCategory(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className='flex gap-2 justify-end'>
                          <Button
                            variant='outline'
                            onClick={() => {
                              setEditingCategory(category.id);
                              setEditName(category.name);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant='destructive'
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
