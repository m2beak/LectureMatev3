import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuizModal, QuizQuestion } from "./QuizModal";

interface QuizMeButtonProps {
    content: string;
}

export const QuizMeButton = ({ content }: QuizMeButtonProps) => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    const handleQuiz = async () => {
        if (!content.trim()) {
            toast({
                title: "No content",
                description: "Add some notes first to generate a quiz.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("ai-explain", {
                body: {
                    text: content,
                    type: "quiz",
                },
            });

            if (error) throw error;

            console.log("Quiz data:", data.content);

            let parsedQuestions: QuizQuestion[] = [];
            try {
                parsedQuestions = JSON.parse(data.content);
                if (!Array.isArray(parsedQuestions)) throw new Error("Response is not an array");
            } catch (parseError) {
                console.error("Failed to parse quiz JSON:", data.content);
                throw new Error("Failed to parse quiz questions from AI response");
            }

            setQuestions(parsedQuestions);
            setIsOpen(true);
        } catch (error) {
            console.error("Quiz generation error:", error);
            toast({
                title: "Quiz generation failed",
                description: error instanceof Error ? error.message : "Failed to generate quiz",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleQuiz}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                    <BrainCircuit className="w-4 h-4 mr-1" />
                )}
                Quiz Me
            </Button>

            <QuizModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                questions={questions}
            />
        </>
    );
};
