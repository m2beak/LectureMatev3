import { useState } from 'react';
import { VideoNote } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileText, FileJson, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/storage';

interface ExportDialogProps {
  note: VideoNote;
}

export const ExportDialog = ({ note }: ExportDialogProps) => {
  const { isPremium } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const exportToMarkdown = () => {
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

  const exportToJSON = () => {
    return JSON.stringify({
      title: note.videoTitle,
      videoUrl: note.videoUrl,
      content: note.content,
      timestamps: note.timestamps,
      tags: note.tags,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }, null, 2);
  };

  const exportToAnki = () => {
    // Generate Anki-compatible cards from content
    const lines = note.content.split('\n').filter(line => line.trim());
    const cards: string[] = [];

    lines.forEach((line, index) => {
      if (line.includes('?')) {
        // Treat lines with ? as Q&A format
        const parts = line.split('?');
        if (parts.length >= 2) {
          cards.push(`${parts[0].trim()}?\t${parts.slice(1).join('?').trim()}`);
        }
      } else if (line.includes(':')) {
        // Treat lines with : as term/definition
        const parts = line.split(':');
        if (parts.length >= 2) {
          cards.push(`${parts[0].trim()}\t${parts.slice(1).join(':').trim()}`);
        }
      }
    });

    // Add timestamp-based cards
    note.timestamps.forEach((ts) => {
      cards.push(`What happens at ${formatTime(ts.time)} in "${note.videoTitle}"?\t${ts.label}`);
    });

    return cards.join('\n');
  };

  const handleExport = async (format: 'markdown' | 'json' | 'anki' | 'pdf') => {
    setIsExporting(format);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'markdown':
          content = exportToMarkdown();
          filename = `${note.videoTitle.replace(/[^a-z0-9]/gi, '_')}.md`;
          mimeType = 'text/markdown';
          break;
        case 'json':
          content = exportToJSON();
          filename = `${note.videoTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
          mimeType = 'application/json';
          break;
        case 'anki':
          content = exportToAnki();
          filename = `${note.videoTitle.replace(/[^a-z0-9]/gi, '_')}_anki.txt`;
          mimeType = 'text/plain';
          break;
        case 'pdf':
          toast({
            title: 'PDF export coming soon',
            description: 'This feature is under development.',
          });
          return;
        default:
          return;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exported successfully',
        description: `Your notes have been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Notes</DialogTitle>
          <DialogDescription>
            Choose a format to export your notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-4">
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => handleExport('markdown')}
            disabled={!!isExporting}
          >
            {isExporting === 'markdown' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5 text-blue-500" />
            )}
            <div className="text-left">
              <p className="font-medium">Markdown</p>
              <p className="text-xs text-muted-foreground">
                For Notion, Obsidian, or any markdown editor
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => handleExport('json')}
            disabled={!!isExporting}
          >
            {isExporting === 'json' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileJson className="w-5 h-5 text-green-500" />
            )}
            <div className="text-left">
              <p className="font-medium">JSON</p>
              <p className="text-xs text-muted-foreground">
                Full data export for developers
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className={`justify-start gap-3 h-auto py-4 ${!isPremium ? 'opacity-60' : ''}`}
            onClick={() => isPremium && handleExport('anki')}
            disabled={!!isExporting || !isPremium}
          >
            {isExporting === 'anki' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                A
              </div>
            )}
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Anki Flashcards</p>
                {!isPremium && (
                  <Badge variant="outline" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Import directly into Anki for spaced repetition
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className={`justify-start gap-3 h-auto py-4 ${!isPremium ? 'opacity-60' : ''}`}
            onClick={() => isPremium && handleExport('pdf')}
            disabled={!isPremium}
          >
            <div className="w-5 h-5 rounded bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
              PDF
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">PDF Document</p>
                {!isPremium && (
                  <Badge variant="outline" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Beautiful formatted PDF document
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
