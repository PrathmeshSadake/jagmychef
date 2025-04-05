"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  GripVertical,
  Plus,
  Check,
  X,
  Loader,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function NotesAdmin() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      toast.error("Error loading notes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return toast.error("Note content is required");

    try {
      setSubmitting(true);
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent }),
      });

      if (!response.ok) throw new Error("Failed to create note");

      setNewNoteContent("");
      toast.success("Note created successfully");
      fetchNotes();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNote = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/notes/${id}?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error("Failed to update note");

      setEditingNoteId(null);
      toast.success("Note updated successfully");
      fetchNotes();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setNotes(updatedItems);

    // Send the updated order to the server
    try {
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedItems }),
      });

      if (!response.ok) throw new Error("Failed to update note order");
    } catch (error: any) {
      toast.error(error.message);
      fetchNotes(); // Reset to server state
    }
  };

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
        <h1 className='text-3xl font-bold mb-6'>Manage General Notes</h1>

        <Card className='w-full mb-8'>
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateNote} className='flex flex-col gap-4'>
              <Textarea
                placeholder='Enter note content...'
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className='min-h-32'
              />
              <Button
                type='submit'
                disabled={submitting || !newNoteContent.trim()}
              >
                {submitting ? (
                  <Loader className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Plus className='h-4 w-4 mr-2' />
                )}
                Add Note
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex justify-center p-6'>
                <Loader className='h-6 w-6 animate-spin' />
              </div>
            ) : notes.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No notes added yet
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId='notes'>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className='space-y-3'
                    >
                      {notes.map((note, index) => (
                        <Draggable
                          key={note.id}
                          draggableId={note.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className='border rounded-md p-4 bg-card'
                            >
                              <div className='flex items-start gap-3'>
                                <div
                                  {...provided.dragHandleProps}
                                  className='cursor-grab mt-1'
                                >
                                  <GripVertical className='h-5 w-5 text-muted-foreground' />
                                </div>

                                <div className='flex-1'>
                                  {editingNoteId === note.id ? (
                                    <div className='flex flex-col gap-2'>
                                      <Textarea
                                        value={editContent}
                                        onChange={(e) =>
                                          setEditContent(e.target.value)
                                        }
                                        className='min-h-24'
                                      />
                                      <div className='flex gap-2'>
                                        <Button
                                          size='sm'
                                          onClick={() =>
                                            handleEditNote(note.id)
                                          }
                                          disabled={submitting}
                                        >
                                          <Check className='h-4 w-4 mr-1' />
                                          Save
                                        </Button>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={() => setEditingNoteId(null)}
                                        >
                                          <X className='h-4 w-4 mr-1' />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className='whitespace-pre-wrap'>
                                      {note.content}
                                    </div>
                                  )}
                                </div>

                                <div className='flex gap-2'>
                                  {editingNoteId !== note.id && (
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() => {
                                        setEditingNoteId(note.id);
                                        setEditContent(note.content);
                                      }}
                                    >
                                      <Pencil className='h-4 w-4' />
                                    </Button>
                                  )}
                                  <Button
                                    size='sm'
                                    variant='destructive'
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
