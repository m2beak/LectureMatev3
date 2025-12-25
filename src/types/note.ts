export interface VideoNote {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  content: string;
  timestamps: Timestamp[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  folderId?: string;
  isPublic?: boolean;
  views?: number;
}

export interface Timestamp {
  id: string;
  time: number;
  label: string;
  note?: string;
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms: string[];
    }>;
  }>;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  aiCallsToday: number;
  aiCallsResetAt: Date;
}

export interface StudySession {
  id: string;
  noteId: string;
  cardsStudied: number;
  correctAnswers: number;
  durationSeconds: number;
  createdAt: Date;
}

export interface SharedNote {
  id: string;
  noteId: string;
  sharedWithEmail: string;
  canEdit: boolean;
  createdAt: Date;
}
