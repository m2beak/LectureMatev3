import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2 } from "lucide-react";
import { generateJSONContent } from "@/utils/gemini";
import { toast } from "sonner";
import { QuizModal, QuizQuestion } from "./QuizModal";

interface QuizMeButtonProps {
    content: string;
}

export const QuizMeButton = ({ content }: QuizMeButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    const handleQuiz = async () => {
        if (!content.trim()) {
            toast.error("No content", {
                description: "Add some notes first to generate a quiz.",
            });
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Thinking...");

        try {
            const systemPrompt = "You are an expert quiz creator. Generate multiple-choice questions in JSON format only.";
            const userPrompt = `${systemPrompt}\n\nBased on the following text, generate 3 multiple-choice questions. Return ONLY a JSON array with objects containing "question", "options" (array of 4 strings), and "answer" (the correct string from options) fields.\n\nText:\n${content}`;

            const jsonStr = await generateJSONContent(userPrompt);
            console.log("Quiz data:", jsonStr);

            let parsedQuestions: QuizQuestion[] = [];
            try {
                parsedQuestions = JSON.parse(jsonStr);
                if (!Array.isArray(parsedQuestions)) throw new Error("Response is not an array");
            } catch (parseError) {
                console.error("Failed to parse quiz JSON:", jsonStr);
                throw new Error("Failed to parse quiz questions from AI response");
            }

            setQuestions(parsedQuestions);
            setIsOpen(true);
            toast.success("Success", { id: toastId });
        } catch (error) {
            console.error("Quiz generation error:", error);
            toast.error("Quiz generation failed", {
                description: error instanceof Error ? error.message : "Failed to generate quiz",
                id: toastId,
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
