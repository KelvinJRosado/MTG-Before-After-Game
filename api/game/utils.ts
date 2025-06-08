import { GameSession, CardInfo, GameResponse } from '../types/game.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new game session
export async function createGameSession() {
  const sessionId = uuidv4();

  // Initialize the session with score 0 and null card
  const session: GameSession = {
    sessionId: sessionId,
    score: 0,
    currentCard: null,
    randomYear: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return session;
}
