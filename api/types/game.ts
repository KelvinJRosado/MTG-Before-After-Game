// Game session types for Higher-or-Lower game
export interface GameSession {
  sessionId: string;
  score: number;
  currentCard: CardInfo | null;
  randomYear: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// Database schema type
export interface GameRecord {
  id: string;
  score: number;
  current_card: object | null;
  random_year: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
