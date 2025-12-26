import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: QuizQuestion[];
}

export const QuizModal = ({ isOpen, onClose, questions }: QuizModalProps) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (questions.length > 0 && Object.keys(showResults).length === questions.length) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#FFD700', '#FFA500', '#FF4500', '#32CD32', '#1E90FF']
            });
        }
    }, [showResults, questions.length]);

    const handleOptionClick = (questionIndex: number, option: string) => {
        if (showResults[questionIndex]) return; // Prevent changing after revealing

        setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
        setShowResults((prev) => ({ ...prev, [questionIndex]: true }));
    };

    const getOptionStyle = (questionIndex: number, option: string) => {
        if (!showResults[questionIndex]) {
            return selectedAnswers[questionIndex] === option
                ? "border-primary bg-primary/10"
                : "hover:bg-muted";
        }

        const correctAnswer = questions[questionIndex].answer;
        const isSelected = selectedAnswers[questionIndex] === option;
        const isCorrect = option === correctAnswer;

        if (isCorrect) {
            return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
        }
        if (isSelected && !isCorrect) {
            return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
        }
        return "opacity-50";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Quiz Time
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="space-y-3 pb-4 border-b border-border last:border-0">
                            <p className="font-medium text-lg leading-snug">{q.question}</p>
                            <div className="grid gap-2">
                                {q.options.map((option, oIndex) => (
                                    <div
                                        key={oIndex}
                                        className={cn(
                                            "p-3 rounded-lg border border-border cursor-pointer transition-all flex items-center justify-between",
                                            getOptionStyle(qIndex, option)
                                        )}
                                        onClick={() => handleOptionClick(qIndex, option)}
                                    >
                                        <span>{option}</span>
                                        {showResults[qIndex] && option === q.answer && (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        )}
                                        {showResults[qIndex] && selectedAnswers[qIndex] === option && option !== q.answer && (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={onClose}>Close Quiz</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
