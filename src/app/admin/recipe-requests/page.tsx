"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function RecipeRequestsAdmin() {
  const [requests, setRequests] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    requestId: null,
    action: null,
    requestName: "",
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const url =
        statusFilter === "all"
          ? "/api/recipe-requests"
          : `/api/recipe-requests?status=${statusFilter}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch recipe requests");

      const data = await response.json();
      setRequests(data.recipeRequests);
    } catch (error) {
      console.error("Error fetching recipe requests:", error);
      toast.error("Failed to load recipe requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleStatusChange = async (requestId: any, status: any) => {
    setConfirmDialog({
      isOpen: true,
      requestId,
      action: status,
      requestName:
        requests.find((req: any) => req.id === requestId)?.name || "",
    });
  };

  const confirmStatusChange = async () => {
    const { requestId, action } = confirmDialog;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/recipe-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(
        `Recipe request ${action === "approved" ? "approved" : "rejected"} successfully`
      );
      fetchRequests();
    } catch (error) {
      console.error("Error updating recipe request:", error);
      toast.error(`Failed to ${action} recipe request`);
    } finally {
      setIsLoading(false);
      setConfirmDialog({
        isOpen: false,
        requestId: null,
        action: null,
        requestName: "",
      });
    }
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800'>
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant='outline' className='bg-green-100 text-green-800'>
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant='outline' className='bg-red-100 text-red-800'>
            Rejected
          </Badge>
        );
      default:
        return <Badge variant='outline'>Unknown</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Recipe Requests</CardTitle>
          <CardDescription>
            Manage pending recipe requests from users
          </CardDescription>
          <div className='flex items-center space-x-2'>
            <span className='text-sm'>Filter:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Requests</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='approved'>Approved</SelectItem>
                <SelectItem value='rejected'>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='text-center py-4'>Loading recipe requests...</div>
          ) : requests.length === 0 ? (
            <div className='text-center py-4 text-gray-500'>
              No recipe requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipe Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className='font-medium'>
                      {request.name}
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {request.description}
                    </TableCell>
                    <TableCell>
                      {request.link ? (
                        <a
                          href={request.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          Link
                        </a>
                      ) : (
                        <span className='text-gray-400'>None</span>
                      )}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className='flex space-x-2'>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant='outline'
                              size='sm'
                              className='bg-green-50 hover:bg-green-100 text-green-700'
                              onClick={() =>
                                handleStatusChange(request.id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              className='bg-red-50 hover:bg-red-100 text-red-700'
                              onClick={() =>
                                handleStatusChange(request.id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status !== "pending" && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleStatusChange(request.id, "pending")
                            }
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "approved"
                ? "Approve Recipe Request"
                : confirmDialog.action === "rejected"
                  ? "Reject Recipe Request"
                  : "Reset Recipe Request Status"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "approved" &&
                `Are you sure you want to approve the request for "${confirmDialog.requestName}"? An email will be sent to notify the requester.`}
              {confirmDialog.action === "rejected" &&
                `Are you sure you want to reject the request for "${confirmDialog.requestName}"?`}
              {confirmDialog.action === "pending" &&
                `Are you sure you want to reset the status of "${confirmDialog.requestName}" to pending?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() =>
                setConfirmDialog({
                  isOpen: false,
                  requestId: null,
                  action: null,
                  requestName: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.action === "approved"
                  ? "default"
                  : confirmDialog.action === "rejected"
                    ? "destructive"
                    : "outline"
              }
              onClick={confirmStatusChange}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
