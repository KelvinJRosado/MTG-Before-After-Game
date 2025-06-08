// Game session types for Higher-or-Lower game

export interface GameSession {
  id: string;
  score: number;
  currentCard: CardInfo | null;
  randomYear: number;
  active: boolean;
}

export interface CardInfo {
  name: string;
  image: string | null;
  yearReleased: number;
  cmc: number | null;
}

export interface GameResponse {
  sessionId: string;
  score: number;
  card?: Partial<CardInfo>;
  randomYear?: number;
  active: boolean;
  gameOver?: boolean;
  message?: string;
}
