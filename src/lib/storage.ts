import { VideoNote, Timestamp } from "@/types/note";

const STORAGE_KEY = "lecturermate_notes";

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const getStoredNotes = (): VideoNote[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const notes = JSON.parse(stored);
    return notes.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  } catch {
    return [];
  }
};

export const saveNote = (note: VideoNote): void => {
  const notes = getStoredNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = { ...note, updatedAt: new Date() };
  } else {
    notes.push(note);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const deleteNote = (id: string): void => {
  const notes = getStoredNotes().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const getNoteByVideoId = (videoId: string): VideoNote | undefined => {
  return getStoredNotes().find((n) => n.videoId === videoId);
};

export const createNewNote = (videoId: string, videoTitle: string, videoUrl: string): VideoNote => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  return {
    id: generateId(),
    videoId,
    videoTitle,
    videoUrl,
    thumbnailUrl,
    content: "",
    timestamps: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  };
};

export const addTimestamp = (note: VideoNote, time: number, label: string): VideoNote => {
  const timestamp: Timestamp = {
    id: generateId(),
    time,
    label,
  };
  
  return {
    ...note,
    timestamps: [...note.timestamps, timestamp].sort((a, b) => a.time - b.time),
    updatedAt: new Date(),
  };
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const parseYoutubeUrl = (url: string): { videoId: string | null; timestamp: number } => {
  let videoId: string | null = null;
  let timestamp = 0;

  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
      const t = urlObj.searchParams.get("t");
      if (t) {
        timestamp = parseInt(t.replace("s", ""), 10) || 0;
      }
    } else if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
      const t = urlObj.searchParams.get("t");
      if (t) {
        timestamp = parseInt(t.replace("s", ""), 10) || 0;
      }
    }
  } catch {
    // Invalid URL
  }

  return { videoId, timestamp };
};

export const exportToMarkdown = (note: VideoNote): string => {
  let md = `# ${note.videoTitle}\n\n`;
  md += `**Video:** [Watch on YouTube](${note.videoUrl})\n\n`;
  md += `**Date:** ${note.updatedAt.toLocaleDateString()}\n\n`;
  
  if (note.timestamps.length > 0) {
    md += `## Timestamps\n\n`;
    note.timestamps.forEach((ts) => {
      md += `- **${formatTime(ts.time)}** - ${ts.label}\n`;
    });
    md += `\n`;
  }
  
  if (note.tags.length > 0) {
    md += `**Tags:** ${note.tags.join(", ")}\n\n`;
  }
  
  md += `## Notes\n\n${note.content}`;
  
  return md;
};
