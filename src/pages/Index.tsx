import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusMode } from "@/contexts/FocusContext";
import { useCloudNotes } from "@/hooks/useCloudNotes";
import { Header } from "@/components/layout/Header";
import { NotesList } from "@/components/notes/NotesList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { AddVideoDialog } from "@/components/notes/AddVideoDialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FlashcardStudy } from "@/components/study/FlashcardStudy";
import { FolderSidebar } from "@/components/folders/FolderSidebar";
import { StudyAnalytics } from "@/components/analytics/StudyAnalytics";
import { PremiumBanner } from "@/components/premium/PremiumBanner";
import { VideoNote } from "@/types/note";
import {
  BookOpen, Clock, Tag, Play, Youtube, Zap, Shield, Brain, LogIn, Crown, Loader2, Minimize2
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isPremium, profile } = useAuth();

  // Get all data from the hook
  const {
    notes, allNotes, folders, currentNote, setCurrentNote, createNote,
    updateNote, removeNote, createFolder, deleteFolder, addTimestamp,
    removeTimestamp, searchQuery, setSearchQuery, selectedFolder, setSelectedFolder, isLoading
  } = useCloudNotes();

  const [isEditing, setIsEditing] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  // FIXED: Initialize with a hardcoded string to prevent "undefined" errors
  const [activeTab, setActiveTab] = useState("notes");
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  const handleSelectNote = (note: VideoNote) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const handleAddVideo = async (videoId: string, title: string, url: string) => {
    const existingNote = allNotes?.find((n) => n.videoId === videoId);
    if (existingNote) {
      setCurrentNote(existingNote);
      setIsEditing(true);
      return;
    }
    const newNote = await createNote(videoId, title, url);
    if (newNote) setIsEditing(true);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setIsStudyMode(false);
    setCurrentNote(null);
  };

  // 1. Loading State Guard
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Safe Calculation Guard (prevents crash if allNotes is undefined)
  const safeNotes = allNotes || [];
  const totalTimestamps = safeNotes.reduce((acc, note) => acc + (note.timestamps?.length || 0), 0);