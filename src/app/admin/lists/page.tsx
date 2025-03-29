import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ListsAdminTable from "@/components/lists-admin-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ListsAdminPage() {
  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      <div className='flex flex-col items-start justify-between mb-6'>
        <div className='mb-6'>
          <Link
            href='/admin'
            className='flex items-center text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            Back to Admin Dashboard
          </Link>
        </div>
        <h1 className='text-3xl font-bold'>Lists Admin</h1>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-xl'>All Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading lists...</div>}>
            <ListsAdminTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
