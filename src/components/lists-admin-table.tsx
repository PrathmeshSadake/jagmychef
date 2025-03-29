"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  Eye,
  Trash2,
  ListIcon,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { deleteList, deleteBulkLists, getLists } from "@/lib/admin.actions";

export default function ListsAdminTable() {
  const router = useRouter();
  const [lists, setLists] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLists, setSelectedLists] = useState<any>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch lists on component mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await getLists();
        setLists(data);
      } catch (error) {
        console.error("Error fetching lists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  // Handle single delete
  const handleDelete = async (listId: any) => {
    try {
      await deleteList(listId);
      setLists(lists.filter((list: any) => list.id !== listId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedLists.length === 0) return;

    try {
      await deleteBulkLists(selectedLists);
      setLists(lists.filter((list: any) => !selectedLists.includes(list.id)));
      setSelectedLists([]);
      setShowBulkDeleteDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error bulk deleting lists:", error);
    }
  };

  // Toggle selection of a list
  const toggleSelectList = (listId: any) => {
    if (selectedLists.includes(listId)) {
      setSelectedLists(selectedLists.filter((id: any) => id !== listId));
    } else {
      setSelectedLists([...selectedLists, listId]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedLists.length === filteredLists.length) {
      setSelectedLists([]);
    } else {
      setSelectedLists(filteredLists.map((list: any) => list.id));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setDateFilter(null);
  };

  // Apply filters
  const filteredLists = lists.filter((list: any) => {
    const nameMatch =
      !nameFilter || list.name.toLowerCase().includes(nameFilter.toLowerCase());
    const emailMatch =
      !emailFilter ||
      list.email.toLowerCase().includes(emailFilter.toLowerCase());
    const dateMatch =
      !dateFilter ||
      format(new Date(list.Date), "yyyy-MM-dd") ===
        format(new Date(dateFilter), "yyyy-MM-dd");

    return nameMatch && emailMatch && dateMatch;
  });

  if (loading) {
    return <div>Loading lists...</div>;
  }

  return (
    <div>
      {/* Filters and Bulk Actions */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-1'
          >
            <Filter className='h-4 w-4' />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {(nameFilter || emailFilter || dateFilter) && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='flex items-center gap-1'
            >
              <X className='h-4 w-4' />
              Clear Filters
            </Button>
          )}
        </div>

        {selectedLists.length > 0 && (
          <AlertDialog
            open={showBulkDeleteDialog}
            onOpenChange={setShowBulkDeleteDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='sm'
                className='flex items-center gap-1'
              >
                <Trash2 className='h-4 w-4' />
                Delete Selected ({selectedLists.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  selected {selectedLists.length} list
                  {selectedLists.length > 1 ? "s" : ""} and remove all
                  associated recipes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-muted/20 rounded-md'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Name</label>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Filter by name...'
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Email</label>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Filter by email...'
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Appointment Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-start text-left font-normal'
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateFilter ? (
                    format(dateFilter, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={dateFilter!}
                  onSelect={setDateFilter as any}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Lists Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    filteredLists.length > 0 &&
                    selectedLists.length === filteredLists.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label='Select all'
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Appointment Day</TableHead>
              <TableHead>Recipes</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLists.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center py-8 text-muted-foreground'
                >
                  No lists found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredLists.map((list: any) => (
                <TableRow key={list.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLists.includes(list.id)}
                      onCheckedChange={() => toggleSelectList(list.id)}
                      aria-label={`Select ${list.name}`}
                    />
                  </TableCell>
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
                            This action cannot be undone. This will permanently
                            delete this list and remove all associated recipes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(list.id)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
