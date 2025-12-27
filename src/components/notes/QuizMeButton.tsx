
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";

interface QuizMeButtonProps {
    content: string;
}

export const QuizMeButton = ({ content }: QuizMeButtonProps) => {
    const handleQuiz = () => {
        toast.info("Quiz Me", {
            description: "This feature is currently being re-engineered."
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleQuiz}
            onMouseDown={(e) => e.preventDefault()}
        >
            <BrainCircuit className="w-4 h-4 mr-1" />
            Quiz Me
        </Button>
    );
};
