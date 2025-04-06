"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useAtom } from "jotai";
import { adminNotesAtom, Note } from "@/lib/atoms";

export function GeneralNotes() {
  const [notes, setNotes] = useAtom(adminNotesAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch notes from API
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notes/all");

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Failed to load general notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [setNotes]);

  // Don't render anything if there are no notes
  if (!loading && (!notes || notes.length === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Notes</CardTitle>
      </CardHeader>
      <CardContent className=''>
        {loading ? (
          <div className='flex justify-center py-4'>
            <Loader className='h-6 w-6 animate-spin' />
          </div>
        ) : error ? (
          <div className='text-center py-4 text-red-500'>{error}</div>
        ) : (
          <ol className='space-y-2 list-decimal pl-5'>
            {notes.map((note) => (
              <li key={note.id} className='p-2 rounded-sm'>
                <div className='whitespace-pre-wrap'>{note.content}</div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
