import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIExplainButtonProps {
  selectedText: string;
  noteContext?: string;
}

export const AIExplainButton = ({ selectedText, noteContext }: AIExplainButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleExplain = async () => {
    // Smart fallback: Use selected text OR full note context
    const textToProcess = selectedText.trim() || noteContext?.trim();

    if (!textToProcess) {
      toast({
        title: "No content",
        description: "Add some notes first to get an AI explanation.",
      });
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setExplanation("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-explain", {
        body: {
          text: textToProcess,
          context: selectedText ? noteContext : undefined, // Send context only if explaining a specific selection
          type: "explain",
        },
      });

      if (error) throw error;
      setExplanation(data.content);
    } catch (error) {
      console.error("AI explanation error:", error);
      toast({
        title: "Explanation failed",
        description: error instanceof Error ? error.message : "Failed to get explanation",
        variant: "destructive",
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{explanation}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
