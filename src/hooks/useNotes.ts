import { useState, useEffect, useCallback } from "react";
import { VideoNote } from "@/types/note";
import {
  getStoredNotes,
  saveNote,
  deleteNote,
  createNewNote,
  addTimestamp as addTimestampToNote,
} from "@/lib/storage";

export const useNotes = () => {
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [currentNote, setCurrentNote] = useState<VideoNote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedNotes = getStoredNotes();
    setNotes(storedNotes);
  }, []);

  const refreshNotes = useCallback(() => {
    setNotes(getStoredNotes());
  }, []);

  const createNote = useCallback(
    (videoId: string, videoTitle: string, videoUrl: string) => {
      const newNote = createNewNote(videoId, videoTitle, videoUrl);
      saveNote(newNote);
      setNotes((prev) => [...prev, newNote]);
      setCurrentNote(newNote);
      return newNote;
    },
    []
  );

  const updateNote = useCallback((note: VideoNote) => {
    saveNote(note);
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? note : n))
    );
    setCurrentNote(note);
  }, []);

  const removeNote = useCallback((id: string) => {
    deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  }, [currentNote]);

  const addTimestamp = useCallback(
    (time: number, label: string) => {
      if (!currentNote) return;
      const updatedNote = addTimestampToNote(currentNote, time, label);
      updateNote(updatedNote);
    },
    [currentNote, updateNote]
  );

  const removeTimestamp = useCallback(
    (timestampId: string) => {
      if (!currentNote) return;
      const updatedNote = {
        ...currentNote,
        timestamps: currentNote.timestamps.filter((t) => t.id !== timestampId),
        updatedAt: new Date(),
      };
      updateNote(updatedNote);
    },
    [currentNote, updateNote]
  );

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.videoTitle.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return {
    notes: filteredNotes,
    allNotes: notes,
    currentNote,
    setCurrentNote,
    createNote,
    updateNote,
    removeNote,
    addTimestamp,
    removeTimestamp,
    searchQuery,
    setSearchQuery,
    refreshNotes,
  };
};
