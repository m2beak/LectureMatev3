import { VideoNote } from "@/types/note";
import { formatTime } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: VideoNote;
  isActive?: boolean;
  onSelect: (note: VideoNote) => void;
  onDelete: (id: string) => void;
}

export const NoteCard = ({ note, isActive, onSelect, onDelete }: NoteCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this note?")) {
      onDelete(note.id);
    }
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isActive && "ring-2 ring-primary shadow-lg glow-primary"
      )}
      onClick={() => onSelect(note)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={note.thumbnailUrl}
          alt={note.videoTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${note.videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="glass"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(note);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="glass"
            size="icon-sm"
            onClick={handleDelete}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            {note.updatedAt.toLocaleDateString()}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {note.videoTitle}
        </h3>

        {note.timestamps.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Play className="w-3 h-3" />
            {note.timestamps.length} timestamp{note.timestamps.length !== 1 ? "s" : ""}
          </div>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
