"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    }

    fetchCategories();
  }, []);

  return (
    <div className='grid grid-cols-1 gap-4 p-6'>
      {categories.map((category) => (
        <Card
          key={category.id}
          className='cursor-pointer hover:shadow-lg transition'
          onClick={() => router.push(`/categories/${category.name}`)}
        >
          <CardContent className='p-6 text-center'>
            <CardTitle>{category.name}</CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
