"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { userDetailsAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useUserFormDialog } from "@/hooks/user-user-form-hook";

interface Category {
  id: string;
  name: string;
  image: string;
  order: number;
}

export default function CategoriesPage() {
  const [userDetails] = useAtom(userDetailsAtom);
  const userFormDialog = useUserFormDialog();

  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userDetails) {
      userFormDialog.onOpen();
    } else {
      userFormDialog.onClose();
      async function fetchCategories() {
        const response = await fetch("/api/categories");
        const data = await response.json();
        // Sort categories by the order field
        const sortedCategories = data.sort(
          (a: Category, b: Category) => a.order - b.order
        );
        setCategories(sortedCategories);
      }

      fetchCategories();
    }
  }, [userDetails]);

  return (
    <div className='grid grid-cols-1 gap-4 p-6'>
      {categories.map((category) => (
        <Card
          key={category.id}
          className='cursor-pointer hover:shadow-lg transition relative overflow-hidden h-48'
          onClick={() => router.push(`/categories/${category.name}`)}
        >
          <div className='absolute inset-0'>
            <Image
              src={category.image}
              alt={category.name}
              fill
              style={{ objectFit: "cover" }}
            />
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <CardTitle className='text-white text-xl md:text-2xl font-bold'>
                {category.name}
              </CardTitle>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
