import prisma from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarIcon,
  ClockIcon,
  Eye,
  ListIcon,
  Trash2,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

// Server action for deleting a list
async function deleteList(formData: FormData) {
  "use server";
  const listId = formData.get("listId") as string;

  try {
    // Delete the list and its associated recipes
    await prisma.list.delete({
      where: { id: listId },
    });

    // Revalidate the current path to refresh the data
    revalidatePath("/admin/lists");
  } catch (error) {
    console.error("Error deleting list:", error);
    // You might want to add error handling here
  }
}

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
    orderBy: {
      createdAt: "desc",
    },
  });

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
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Appointment Day</TableHead>
                  <TableHead>Recipes</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className='font-medium'>{list.name}</TableCell>
                    <TableCell>{list.email}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                        <span>{format(new Date(list.Date), "dd-MM-yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <ClockIcon className='h-4 w-4 text-muted-foreground' />
                        <span>{format(new Date(list.Date), "EEEE")}</span>
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
                    <TableCell className='text-right flex justify-end items-center space-x-2'>
                      <Button variant='ghost' size='sm' asChild>
                        <Link
                          href={`/admin/lists/${list.id}`}
                          className='flex items-center gap-1'
                        >
                          <Eye className='h-4 w-4' />
                          View
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='destructive'
                            size='sm'
                            className='flex items-center gap-1'
                          >
                            <Trash2 className='h-4 w-4' />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this list and remove all
                              associated recipes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <form action={deleteList}>
                              <input
                                type='hidden'
                                name='listId'
                                value={list.id}
                              />
                              <AlertDialogAction
                                type='submit'
                                className='w-full'
                              >
                                Continue
                              </AlertDialogAction>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
