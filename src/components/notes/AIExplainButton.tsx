import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { generateAIContent } from "@/utils/gemini";
import { toast } from "sonner";

interface AIExplainButtonProps {
  selectedText: string;
  noteContext?: string;
}

export const AIExplainButton = ({ selectedText }: AIExplainButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleExplain = async () => {
    // Strict Requirement: Only run when the user has Highlighted Text
    const textToProcess = selectedText.trim();

    if (!textToProcess) {
      toast.error("Highlight text in your notes to explain", {
        description: "Please highlight specific text in your notes for the AI to explain.",
      });
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setExplanation("");

    const toastId = toast.loading("Thinking...");

    try {
      // Prompt uses ONLY the highlighted text, no video URL.
      const systemPrompt = "You are an expert educator. Return a short, 2-sentence definition of the concept. Be clear and concise.";
      const userPrompt = `${systemPrompt}\n\nExplain this text:\n\n"${textToProcess}"`;

      const content = await generateAIContent(userPrompt);
      setExplanation(content);
      toast.success("Success", { id: toastId });
    } catch (error) {
      console.error("AI explanation error:", error);
      toast.error("Explanation failed", {
        description: error instanceof Error ? error.message : "Failed to get explanation",
        id: toastId,
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExplain}
        onMouseDown={(e) => e.preventDefault()} // Prevent editor blur
      >
        <Sparkles className="w-4 h-4 mr-1" />
        AI Explain
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Explanation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Selected text:</p>
              <p className="text-sm italic">"{selectedText}"</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground animate-pulse">Consulting the knowledge base...</span>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-lg leading-relaxed">{explanation}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
