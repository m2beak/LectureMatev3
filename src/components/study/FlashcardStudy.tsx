
import { useEffect } from "react";
import { VideoNote } from "@/types/note";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FlashcardStudyProps {
  note: VideoNote;
  onClose: () => void;
}

export const FlashcardStudy = ({ note, onClose }: FlashcardStudyProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info("Flashcards", {
        description: "This feature is currently being re-engineered."
      });
      onClose();
    }, 500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Initializing...</p>
    </div>
  );
};
