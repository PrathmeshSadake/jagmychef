// app/shopping-list/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShoppingListClient } from "@/components/shopping-list-client";

export default function ShoppingListPage() {
  return (
    <div className='mx-auto container py-10'>
      <div className='mb-6'>
        <Link
          href='/recipes'
          className='flex items-center text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to Recipes
        </Link>
      </div>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Shopping List</h1>
          <p className='text-white mt-1'>
            Your consolidated ingredients from selected recipes.
          </p>
        </div>
      </div>

      <ShoppingListClient />
    </div>
  );
}
