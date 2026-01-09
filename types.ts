
export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  context?: string;
  category?: string;
}

export interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

export enum AppView {
  CREATE = 'create',
  REVIEW = 'review',
  DASHBOARD = 'dashboard'
}
