export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  mastered: boolean;
  lastReviewed?: Date;
}

export interface FlashcardSession {
  cards: Flashcard[];
  currentIndex: number;
  showAnswer: boolean;
  score: { correct: number; incorrect: number };
}
