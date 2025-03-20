"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Edit, RefreshCw, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UnitsAdminPanel = () => {
  // State for units
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitSymbol, setNewUnitSymbol] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);

  // Fetch all units
  const fetchUnits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/units");
      if (!response.ok) {
        throw new Error("Failed to fetch units");
      }
      const data = await response.json();
      setUnits(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new unit
  const addUnit = async () => {
    if (!newUnitName.trim() || !newUnitSymbol.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUnitName,
          symbol: newUnitSymbol,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add unit");
      }

      // Refresh units list
      fetchUnits();

      // Clear form
      setNewUnitName("");
      setNewUnitSymbol("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a unit
  const deleteUnit = async (id: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/units?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete unit");
      }

      // Refresh units list
      fetchUnits();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit a unit
  const startEditing = (unit: any) => {
    setIsEditing(true);
    setEditingUnitId(unit.id);
    setNewUnitName(unit.name);
    setNewUnitSymbol(unit.symbol);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingUnitId(null);
    setNewUnitName("");
    setNewUnitSymbol("");
  };

  const saveUnitEdit = async () => {
    if (!newUnitName.trim() || !newUnitSymbol.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUnitId,
          name: newUnitName,
          symbol: newUnitSymbol,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update unit");
      }

      // Refresh units list
      fetchUnits();

      // Exit edit mode
      cancelEditing();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch units on initial load
  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle>Units Management</CardTitle>
          <Button
            size='sm'
            variant='outline'
            onClick={fetchUnits}
            disabled={isLoading}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Error message */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {/* Form for adding/editing units */}
        <div className='mb-6 space-y-4'>
          <div className='text-lg font-medium'>
            {isEditing ? "Edit Unit" : "Add New Unit"}
          </div>
          <div className='flex items-center gap-4'>
            <Input
              placeholder='Unit name (e.g., Tablespoon)'
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              className='flex-1'
            />
            <Input
              placeholder='Symbol (e.g., tbsp)'
              value={newUnitSymbol}
              onChange={(e) => setNewUnitSymbol(e.target.value)}
              className='flex-1'
            />
            {isEditing ? (
              <div className='flex gap-2'>
                <Button
                  onClick={saveUnitEdit}
                  disabled={isLoading || !newUnitName || !newUnitSymbol}
                >
                  <Check className='h-4 w-4 mr-2' />
                  Save
                </Button>
                <Button variant='outline' onClick={cancelEditing}>
                  <X className='h-4 w-4 mr-2' />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={addUnit}
                disabled={isLoading || !newUnitName || !newUnitSymbol}
              >
                Add Unit
              </Button>
            )}
          </div>
        </div>

        {/* Units table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !units.length ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-8'>
                    Loading units...
                  </TableCell>
                </TableRow>
              ) : units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-8'>
                    No units found. Add your first unit above.
                  </TableCell>
                </TableRow>
              ) : (
                units.map((unit: any) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.symbol}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => startEditing(unit)}
                          disabled={isLoading || isEditing}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-red-500 hover:text-red-700'
                          onClick={() => deleteUnit(unit.id)}
                          disabled={isLoading || isEditing}
                        >
                          <Trash className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitsAdminPanel;
