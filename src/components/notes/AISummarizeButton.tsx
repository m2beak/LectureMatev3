import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { generateAIContent } from "@/utils/gemini";
import { toast } from "sonner";
import { VideoNote } from "@/types/note";

interface AISummarizeButtonProps {
  note: VideoNote;
  selectedText?: string;
}

export const AISummarizeButton = ({ note, selectedText }: AISummarizeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    const textToSummarize = selectedText?.trim() || note.content.trim();

    if (!textToSummarize && note.timestamps.length === 0) {
      toast.error("No content", {
        description: "Add some notes or keywords first to summarize.",
      });
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setSummary("");

    // Show loading toast
    const toastId = toast.loading("Thinking...");

    try {
      // If we have selected text, just summarize that.
      // If not, we summarize the note context + timestamps + tags.
      let promptContent = "";

      if (selectedText?.trim()) {
        promptContent = `Selected Text: ${selectedText}`;
      } else {
        promptContent = `
Video: ${note.videoTitle}
Notes: ${note.content}
Timestamps: ${note.timestamps.map((t) => `[${t.label}]`).join(", ")}
Tags: ${note.tags.join(", ")}
        `.trim();
      }

      const systemPrompt = "You are an expert at summarizing content. Create a clean HTML bulleted list (<ul> with <li>) of the key points. Do not include markdown code blocks, just the HTML.";
      const userPrompt = `${systemPrompt}\n\nSummarize the following into key bullet points:\n\n${promptContent}`;

      const content = await generateAIContent(userPrompt);
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```html|```/g, "").trim();

      setSummary(cleanContent);
      toast.success("Success", { id: toastId });
    } catch (error) {
      console.error("AI summarize error:", error);
      toast.error("Summarization failed", {
        description: error instanceof Error ? error.message : "Failed to summarize",
        id: toastId,
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleSummarize} onMouseDown={(e) => e.preventDefault()}>
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
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground animate-pulse">Generating summary...</span>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
