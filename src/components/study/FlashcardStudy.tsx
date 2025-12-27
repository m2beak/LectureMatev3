import { useState, useEffect } from "react";
import { Flashcard, FlashcardSession } from "@/types/flashcard";
import { VideoNote } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Brain,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { generateJSONContent } from "@/utils/gemini";
import { toast } from "sonner";
import { generateId } from "@/lib/storage";

interface FlashcardStudyProps {
  note: VideoNote;
  onClose: () => void;
}

export const FlashcardStudy = ({ note, onClose }: FlashcardStudyProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<FlashcardSession>({
    cards: [],
    currentIndex: 0,
    showAnswer: false,
    score: { correct: 0, incorrect: 0 },
  });
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    generateFlashcards();
  }, [note.id]);

  const generateFlashcards = async () => {
    if (!note.content.trim() && note.timestamps.length === 0) {
      toast.error("No content", {
        description: "Add some notes or timestamps first to generate flashcards.",
      });
      onClose();
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Thinking...");

    try {
      const contentForAI = `
Video: ${note.videoTitle}
Notes: ${note.content}
Timestamps: ${note.timestamps.map((t) => `${t.label}`).join(", ")}
Tags: ${note.tags.join(", ")}
      `.trim();

      const systemPrompt = "You are an expert educator who creates effective study flashcards. Generate exactly 3 distinct Question & Answer pairs in JSON format only.";
      const userPrompt = `${systemPrompt}\n\nBased on these notes, generate 3 unique and distinct flashcards for studying. Return ONLY a JSON array with objects containing "question" and "answer" fields.\n\nNotes:\n${contentForAI}`;

      const jsonStr = await generateJSONContent(userPrompt);

      // Parse the JSON response
      let flashcardsData: Array<{ question: string; answer: string }>;
      try {
        flashcardsData = JSON.parse(jsonStr.trim());
      } catch {
        console.error("Failed to parse flashcards:", jsonStr);
        throw new Error("Failed to parse AI response");
      }

      const cards: Flashcard[] = flashcardsData.map((fc) => ({
        id: generateId(),
        question: fc.question,
        answer: fc.answer,
        noteId: note.id,
        mastered: false,
      }));

      setSession({
        cards,
        currentIndex: 0,
        showAnswer: false,
        score: { correct: 0, incorrect: 0 },
      });

      toast.success("Success", { id: toastId });
      toast.info(`Generated ${cards.length} flashcards`);

    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate flashcards",
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = session.cards[session.currentIndex];
  // Calculate progress: completed cards / total cards
  const progress = session.cards.length > 0
    ? ((session.currentIndex + (session.score.correct + session.score.incorrect > session.currentIndex ? 1 : 0)) / session.cards.length) * 100
    : 0;
  // Actually, standard progress bar is usually simpler:
  const simpleProgress = session.cards.length > 0 ? ((session.currentIndex + 1) / session.cards.length) * 100 : 0;


  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setSession((prev) => ({ ...prev, showAnswer: !prev.showAnswer }));
  };

  const handleAnswer = (correct: boolean) => {
    setSession((prev) => ({
      ...prev,
      score: {
        correct: prev.score.correct + (correct ? 1 : 0),
        incorrect: prev.score.incorrect + (correct ? 0 : 1),
      },
    }));
    handleNext();
  };

  const handleNext = () => {
    if (session.currentIndex < session.cards.length - 1) {
      setSession((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showAnswer: false,
      }));
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (session.currentIndex > 0) {
      setSession((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        showAnswer: false,
      }));
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setSession((prev) => ({
      ...prev,
      currentIndex: 0,
      showAnswer: false,
      score: { correct: 0, incorrect: 0 },
    }));
    setIsFlipped(false);
  };

  const isComplete = session.currentIndex === session.cards.length - 1 && session.showAnswer && (session.score.correct + session.score.incorrect === session.cards.length);
  // Simpler complete check: if we've answered the last card?
  // Logic in original was: isComplete = session.currentIndex === session.cards.length - 1 && session.showAnswer;
  // But wait, if they just flipped the last card, they haven't answered "Correct/Incorrect" yet.
  // We want to show results after they answer the last card.
  // The original code shows "Incorrect/Correct" buttons when `showAnswer` is true.
  // So if they are on last card and showAnswer is true, they see buttons.
  // If they click a button, handleNext is called.
  // handleNext checks `currentIndex < length - 1`. If not, it does nothing?
  // Ideally, when they answer the last card, we move to a "complete" state.

  // Let's improve the state to handle "finished".
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswerImproved = (correct: boolean) => {
    setSession((prev) => ({
      ...prev,
      score: {
        correct: prev.score.correct + (correct ? 1 : 0),
        incorrect: prev.score.incorrect + (correct ? 0 : 1),
      },
    }));

    if (session.currentIndex < session.cards.length - 1) {
      handleNext();
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <Brain className="w-16 h-16 text-primary animate-pulse" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-bounce" />
        </div>
        <p className="text-lg font-medium">Generating flashcards with AI...</p>
        <p className="text-sm text-muted-foreground">Analyzing your notes</p>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (session.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Brain className="w-16 h-16 text-muted-foreground" />
        <p className="text-lg font-medium">No flashcards generated</p>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  // Use local isFinished state or derive it
  if (isFinished) {
    return (
      <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 animate-fade-in">
        <h3 className="text-xl font-bold mb-2">🎉 Study Session Complete!</h3>
        <p className="text-muted-foreground mb-4">
          You got {session.score.correct} out of {session.cards.length} correct
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => { setIsFinished(false); handleRestart(); }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Study Again
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-bold flex items-center gap-2 justify-center">
            <Brain className="w-5 h-5 text-primary" />
            Flashcard Study
          </h2>
          <p className="text-sm text-muted-foreground">{note.videoTitle}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={generateFlashcards}>
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Card {session.currentIndex + 1} of {session.cards.length}</span>
          <div className="flex gap-3">
            <Badge variant="secondary" className="bg-success/20 text-success">
              <Check className="w-3 h-3 mr-1" />
              {session.score.correct}
            </Badge>
            <Badge variant="secondary" className="bg-destructive/20 text-destructive">
              <X className="w-3 h-3 mr-1" />
              {session.score.incorrect}
            </Badge>
          </div>
        </div>
        <Progress value={simpleProgress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="perspective-1000">
        <Card
          className={`min-h-[300px] cursor-pointer transition-all duration-500 transform-style-preserve-3d relative ${isFlipped ? "rotate-y-180" : ""
            }`}
          onClick={handleFlip}
        >
          {/* Front */}
          <CardContent className={`absolute inset-0 flex items-center justify-center p-8 backface-hidden ${isFlipped ? "invisible" : ""}`}>
            <div className="text-center space-y-4">
              <Badge variant="outline" className="mb-4">Question</Badge>
              <p className="text-xl font-medium">{currentCard?.question}</p>
              <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
            </div>
          </CardContent>

          {/* Back */}
          <CardContent className={`absolute inset-0 flex items-center justify-center p-8 backface-hidden rotate-y-180 ${!isFlipped ? "invisible" : ""}`}>
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-4">Answer</Badge>
              <p className="text-lg">{currentCard?.answer}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={session.currentIndex === 0}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {session.showAnswer && (
          <>
            <Button
              variant="outline"
              size="lg"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => handleAnswerImproved(false)}
            >
              <X className="w-5 h-5 mr-2" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-success text-success hover:bg-success/10"
              onClick={() => handleAnswerImproved(true)}
            >
              <Check className="w-5 h-5 mr-2" />
              Correct
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (session.currentIndex < session.cards.length - 1) {
              handleNext();
            } else if (session.currentIndex === session.cards.length - 1 && !session.showAnswer) {
              // just flip if next clicked? Or disable? 
              // Usually right arrow skips card or next. 
              // Let's just keep next enabled if not last
            }
          }}
          disabled={session.currentIndex === session.cards.length - 1}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
