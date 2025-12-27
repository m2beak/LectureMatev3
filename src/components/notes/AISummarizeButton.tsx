
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { VideoNote } from "@/types/note";
import { toast } from "sonner";

interface AISummarizeButtonProps {
  note: VideoNote;
  selectedText?: string;
}

export const AISummarizeButton = ({ note, selectedText }: AISummarizeButtonProps) => {
  const handleSummarize = () => {
    toast.info("AI Summarize", {
      description: "This feature is currently being re-engineered."
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleSummarize} onMouseDown={(e) => e.preventDefault()}>
      <FileText className="w-4 h-4 mr-1" />
      Summarize
    </Button>
  );
};
