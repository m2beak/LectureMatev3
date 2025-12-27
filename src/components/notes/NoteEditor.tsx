import { useState, useRef, useEffect } from "react";
import { VideoNote, Timestamp } from "@/types/note";
import { VideoPlayer, VideoPlayerRef } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Plus,
  X,
  Download,
  Copy,
  Tag,
  BookOpen,
  ArrowLeft,
  Play,
  Trash2,
  ChevronDown,
  Save,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatTime, exportToMarkdown } from "@/lib/storage";
import { exportToPDF } from "@/lib/pdf-export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DictionaryPopup } from "./DictionaryPopup";

interface NoteEditorProps {
  note: VideoNote;
  onUpdate: (note: VideoNote) => void;
  onClose: () => void;
  onAddTimestamp: (time: number, label: string) => void;
  onRemoveTimestamp: (id: string) => void;
}

export const NoteEditor = ({
  note,
  onUpdate,
  onClose,
  onAddTimestamp,
  onRemoveTimestamp,
}: NoteEditorProps) => {
  const { toast } = useToast();
  const playerRef = useRef<VideoPlayerRef>(null);
  const [content, setContent] = useState(note.content);
  const [newTag, setNewTag] = useState("");
  const [timestampLabel, setTimestampLabel] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [showDictionary, setShowDictionary] = useState(false);

  // Sync local state when note changes
  useEffect(() => {
    setContent(note.content);
  }, [note.id, note.content]);

  // Debounce the onUpdate call for content changes
  useEffect(() => {
    if (content === note.content) return;

    const handler = setTimeout(() => {
      onUpdate({ ...note, content });
    }, 800);

    return () => clearTimeout(handler);
  }, [content, note, onUpdate]);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleAddTimestamp = () => {
    if (!playerRef.current) return;
    const time = playerRef.current.getCurrentTime();
    const label = timestampLabel || `Timestamp at ${formatTime(time)}`;
    onAddTimestamp(time, label);
    setTimestampLabel("");
    toast({
      title: "Timestamp added",
      description: `Added timestamp at ${formatTime(time)}`,
    });
  };

  const handleTimestampClick = (timestamp: Timestamp) => {
    playerRef.current?.seekTo(timestamp.time);
    playerRef.current?.play();
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (note.tags.includes(newTag.trim())) {
      toast({
        title: "Tag exists",
        description: "This tag is already added.",
        variant: "destructive",
      });
      return;
    }
    onUpdate({ ...note, tags: [...note.tags, newTag.trim()], content });
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    onUpdate({ ...note, tags: note.tags.filter((t) => t !== tag), content });
  };

  const handleExportMarkdown = () => {
    const markdown = exportToMarkdown(note);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.videoTitle.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported Markdown",
      description: "Notes exported to Markdown file.",
    });
  };

  const handleExportPDF = () => {
    exportToPDF(note);
    toast({
      title: "Exported PDF",
      description: "Notes exported to PDF file.",
    });
  };

  const handleCopyToClipboard = async () => {
    const markdown = exportToMarkdown(note);
    await navigator.clipboard.writeText(markdown);
    toast({
      title: "Copied",
      description: "Notes copied to clipboard.",
    });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#32CD32', '#1E90FF']
    });

    onUpdate({ ...note, content });

    toast({
      title: "Saved!",
      description: "Your notes have been saved.",
    });
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{note.videoTitle}</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {note.updatedAt.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportMarkdown}>
                Export to Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export to PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video + Timestamps Column */}
        <div className="space-y-4">
          <VideoPlayer
            ref={playerRef}
            videoId={note.videoId}
          />

          {/* Add Timestamp */}
          <Card className="glass-panel bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Add Timestamp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Label (optional)"
                  value={timestampLabel}
                  onChange={(e) => setTimestampLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTimestamp()}
                  className="flex-1"
                />
                <Button onClick={handleAddTimestamp}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps List */}
          {note.timestamps.length > 0 && (
            <Card className="glass-panel bg-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-accent" />
                  Timestamps ({note.timestamps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {note.timestamps.map((ts) => (
                    <div
                      key={ts.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer group transition-colors"
                      onClick={() => handleTimestampClick(ts)}
                    >
                      <Badge variant="secondary" className="font-mono shrink-0">
                        {formatTime(ts.time)}
                      </Badge>
                      <span className="flex-1 text-sm truncate">{ts.label}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTimestamp(ts.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notes Column */}
        <div className="space-y-4">
          {/* Tags */}
          <Card className="glass-panel bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes Editor */}
          <Card className="flex-1 glass-panel bg-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Notes
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedText) {
                        setShowDictionary(true);
                      } else {
                        toast({
                          title: "Select text first",
                          description: "Highlight some text to look it up in the dictionary.",
                        });
                      }
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Dictionary
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Start taking notes..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onMouseUp={handleTextSelection}
                className="min-h-[300px] resize-none font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dictionary Popup */}
      {showDictionary && (
        <DictionaryPopup
          word={selectedText}
          onClose={() => {
            setShowDictionary(false);
            setSelectedText("");
          }}
        />
      )}
    </div>
  );
};
