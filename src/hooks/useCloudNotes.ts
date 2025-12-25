import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoNote, Folder } from '@/types/note';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useCloudNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentNote, setCurrentNote] = useState<VideoNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setNotes(
        (data || []).map((note) => ({
          id: note.id,
          videoId: note.video_id,
          videoTitle: note.video_title,
          videoUrl: note.video_url,
          thumbnailUrl: `https://img.youtube.com/vi/${note.video_id}/maxresdefault.jpg`,
          content: note.content || '',
          timestamps: (note.timestamps as any[]) || [],
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          tags: note.tags || [],
          folderId: note.folder_id || undefined,
          isPublic: note.is_public,
          views: note.views,
        }))
      );
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error loading notes',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      setFolders(
        (data || []).map((folder) => ({
          id: folder.id,
          name: folder.name,
          color: folder.color || '#6366f1',
          createdAt: new Date(folder.created_at),
          updatedAt: new Date(folder.updated_at),
        }))
      );
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, [fetchNotes, fetchFolders]);

  const createNote = useCallback(
    async (videoId: string, videoTitle: string, videoUrl: string) => {
      if (!user) return null;

      const newNote: VideoNote = {
        id: generateId(),
        videoId,
        videoTitle,
        videoUrl,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        content: '',
        timestamps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        folderId: selectedFolder || undefined,
      };

      try {
        const { data, error } = await supabase.from('notes').insert({
          user_id: user.id,
          video_id: videoId,
          video_title: videoTitle,
          video_url: videoUrl,
          folder_id: selectedFolder,
        }).select().single();

        if (error) throw error;

        const createdNote = {
          ...newNote,
          id: data.id,
        };

        setNotes((prev) => [createdNote, ...prev]);
        setCurrentNote(createdNote);
        return createdNote;
      } catch (error) {
        console.error('Error creating note:', error);
        toast({
          title: 'Error creating note',
          description: 'Please try again.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, selectedFolder, toast]
  );

  const updateNote = useCallback(
    async (note: VideoNote) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('notes')
          .update({
            content: note.content,
            tags: note.tags,
            timestamps: JSON.parse(JSON.stringify(note.timestamps)),
            folder_id: note.folderId,
            is_public: note.isPublic,
          })
          .eq('id', note.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...note, updatedAt: new Date() } : n))
        );
        setCurrentNote({ ...note, updatedAt: new Date() });
      } catch (error) {
        console.error('Error updating note:', error);
        toast({
          title: 'Error saving note',
          description: 'Changes may not be saved.',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  const removeNote = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (currentNote?.id === id) {
          setCurrentNote(null);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        toast({
          title: 'Error deleting note',
          variant: 'destructive',
        });
      }
    },
    [user, currentNote, toast]
  );

  const createFolder = useCallback(
    async (name: string, color?: string) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name,
            color: color || '#6366f1',
          })
          .select()
          .single();

        if (error) throw error;

        const newFolder: Folder = {
          id: data.id,
          name: data.name,
          color: data.color,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setFolders((prev) => [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
        return newFolder;
      } catch (error) {
        console.error('Error creating folder:', error);
        toast({
          title: 'Error creating folder',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, toast]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('folders')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setFolders((prev) => prev.filter((f) => f.id !== id));
        if (selectedFolder === id) {
          setSelectedFolder(null);
        }
      } catch (error) {
        console.error('Error deleting folder:', error);
        toast({
          title: 'Error deleting folder',
          variant: 'destructive',
        });
      }
    },
    [user, selectedFolder, toast]
  );

  const addTimestamp = useCallback(
    (time: number, label: string) => {
      if (!currentNote) return;

      const timestamp = {
        id: generateId(),
        time,
        label,
      };

      const updatedNote = {
        ...currentNote,
        timestamps: [...currentNote.timestamps, timestamp].sort((a, b) => a.time - b.time),
      };

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
      };

      updateNote(updatedNote);
    },
    [currentNote, updateNote]
  );

  const filteredNotes = notes.filter((note) => {
    const matchesFolder = !selectedFolder || note.folderId === selectedFolder;
    const matchesSearch = !searchQuery || 
      note.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return {
    notes: filteredNotes,
    allNotes: notes,
    folders,
    currentNote,
    setCurrentNote,
    createNote,
    updateNote,
    removeNote,
    createFolder,
    deleteFolder,
    addTimestamp,
    removeTimestamp,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    setSelectedFolder,
    isLoading,
    refreshNotes: fetchNotes,
  };
};
