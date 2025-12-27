
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AIExplainButtonProps {
  selectedText: string;
  noteContext?: string;
}

export const AIExplainButton = ({ selectedText, noteContext }: AIExplainButtonProps) => {
  const handleExplain = () => {
    toast.info("AI Explain", {
      description: "This feature is currently being re-engineered."
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExplain}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Sparkles className="w-4 h-4 mr-1" />
      AI Explain
    </Button>
  );
};
