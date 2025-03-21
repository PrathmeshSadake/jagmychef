import prisma from "@/lib/db";
import Link from "next/link";
import { CalendarIcon, ClockIcon, Eye, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ListsAdminPage() {
  const lists = await prisma.list.findMany({
    include: {
      recipes: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Lists Admin</h1>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-xl'>All Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Recipes</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className='font-mono text-xs text-muted-foreground'>
                      {list.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className='font-medium'>{list.name}</TableCell>
                    <TableCell>{list.email}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                        <span>{list.Date}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <ClockIcon className='h-4 w-4 text-muted-foreground' />
                        <span>{list.Time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        <ListIcon className='h-3 w-3' />
                        <span>{list.recipes.length}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button variant='ghost' size='sm' asChild>
                        <Link
                          href={`/admin/lists/${list.id}`}
                          className='flex items-center gap-1'
                        >
                          <Eye className='h-4 w-4' />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
