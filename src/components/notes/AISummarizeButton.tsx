import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VideoNote } from "@/types/note";

interface AISummarizeButtonProps {
  note: VideoNote;
}

export const AISummarizeButton = ({ note }: AISummarizeButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    if (!note.content.trim() && note.timestamps.length === 0) {
      toast({
        title: "No content",
        description: "Add some notes or timestamps first to summarize.",
      });
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setSummary("");

    try {
      const contentForAI = `
Video: ${note.videoTitle}
Notes: ${note.content}
Timestamps: ${note.timestamps.map((t) => `[${t.label}]`).join(", ")}
Tags: ${note.tags.join(", ")}
      `.trim();

      const { data, error } = await supabase.functions.invoke("ai-explain", {
        body: {
          text: contentForAI,
          type: "summarize",
        },
      });

      if (error) throw error;
      setSummary(data.content);
    } catch (error) {
      console.error("AI summarize error:", error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "Failed to summarize notes",
        variant: "destructive",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleSummarize}>
        <FileText className="w-4 h-4 mr-1" />
        Summarize
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              AI Summary
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{summary}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
