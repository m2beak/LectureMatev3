import { VideoNote } from "@/types/note";
import { NoteCard } from "./NoteCard";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NotesListProps {
  notes: VideoNote[];
  currentNote: VideoNote | null;
  onSelectNote: (note: VideoNote) => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NotesList = ({
  notes,
  currentNote,
  onSelectNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}: NotesListProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No notes yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {searchQuery
              ? "No notes match your search. Try a different query."
              : "Add a YouTube video URL above to start taking notes!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={currentNote?.id === note.id}
              onSelect={onSelectNote}
              onDelete={onDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};
