import { v4 as uuidv4 } from 'uuid';
import { getRandomCard } from './scryfall';
import { GameSession, CardInfo, GameResponse } from './types/game';

// In-memory storage for active game sessions
const gameSessions = new Map<string, GameSession>();

// Clean up expired sessions every hour (in a production app, you'd use Redis or a database)
const SESSION_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Generate a random year between 1993 (first MTG set) and current year
function generateRandomYear(): number {
  const startYear = 1993;
  const currentYear = new Date().getFullYear();
  return Math.floor(Math.random() * (currentYear - startYear + 1)) + startYear;
}

// Convert Scryfall card data to our CardInfo format
interface ScryfallCard {
  name: string;
  image_uris?: {
    normal?: string;
    large?: string;
    [key: string]: string | undefined;
  };
  released_at?: string;
  cmc?: number;
  [key: string]: unknown;
}

function convertToCardInfo(scryfallCard: ScryfallCard): CardInfo | null {
  if (!scryfallCard) return null;

  return {
    name: scryfallCard.name,
    image:
      scryfallCard.image_uris?.normal || scryfallCard.image_uris?.large || null,
    yearReleased: scryfallCard.released_at
      ? new Date(scryfallCard.released_at).getFullYear()
      : 0,
    cmc: scryfallCard.cmc || null,
  };
}

// Prepare safe card info (without revealing the year during gameplay)
function prepareSafeCardInfo(card: CardInfo): Partial<CardInfo> {
  if (!card) return {};

  return {
    name: card.name,
    image: card.image,
    // We intentionally omit yearReleased here to prevent cheating
    cmc: card.cmc,
  };
}

// Create a new game session
export async function createGameSession(): Promise<GameResponse> {
  const sessionId = uuidv4();

  // Initialize the session with score 0 and null card
  const session: GameSession = {
    id: sessionId,
    score: 0,
    currentCard: null,
    randomYear: 0,
    active: true,
  };

  gameSessions.set(sessionId, session);

  // Start the first round for this session
  return await startNewRound(sessionId);
}

// Start a new round for an existing game session
export async function startNewRound(sessionId: string): Promise<GameResponse> {
  const session = gameSessions.get(sessionId);

  if (!session) {
    return {
      sessionId: '',
      score: 0,
      active: false,
      message: 'Invalid session',
    };
  }

  try {
    // Fetch a random card from Scryfall
    const scryfallCard = await getRandomCard();

    if (!scryfallCard) {
      return {
        sessionId,
        score: session.score,
        active: session.active,
        message: 'Failed to fetch card',
      };
    }

    // Convert to our card format
    const cardInfo = convertToCardInfo(scryfallCard);

    // Generate a random year that doesn't equal the card's year
    let randomYear;
    do {
      randomYear = generateRandomYear();
    } while (cardInfo && randomYear === cardInfo.yearReleased);

    // Update the session
    session.currentCard = cardInfo;
    session.randomYear = randomYear;

    return {
      sessionId,
      score: session.score,
      card: cardInfo ? prepareSafeCardInfo(cardInfo) : undefined,
      randomYear,
      active: session.active,
    };
  } catch (error) {
    console.error('Error in startNewRound:', error);
    return {
      sessionId,
      score: session.score,
      active: session.active,
      message: 'Server error',
    };
  }
}

// Process a guess
export function processGuess(
  sessionId: string,
  guess: 'before' | 'after'
): GameResponse {
  const session = gameSessions.get(sessionId);

  if (!session) {
    return {
      sessionId: '',
      score: 0,
      active: false,
      message: 'Invalid session',
    };
  }

  // If no current card or session is not active, return error
  if (!session.currentCard || !session.active) {
    return {
      sessionId,
      score: session.score,
      active: session.active,
      gameOver: !session.active,
      message: 'No active game round',
    };
  }

  const cardYear = session.currentCard.yearReleased;
  const randomYear = session.randomYear;
  let isCorrect = false;

  // Check if guess is correct
  if (guess === 'after' && cardYear >= randomYear) {
    isCorrect = true;
  } else if (guess === 'before' && cardYear < randomYear) {
    isCorrect = true;
  }

  if (isCorrect) {
    // Increase score
    session.score++;

    return {
      sessionId,
      score: session.score,
      active: true,
      message: 'Correct guess!',
    };
  } else {
    // End the game on incorrect guess
    session.active = false;

    return {
      sessionId,
      score: session.score,
      card: session.currentCard, // Now we can reveal the full card info
      randomYear: session.randomYear,
      active: false,
      gameOver: true,
      message: `Game over! The card "${session.currentCard.name}" was released in ${session.currentCard.yearReleased}.`,
    };
  }
}

// End a game manually
export function endGame(sessionId: string): GameResponse {
  const session = gameSessions.get(sessionId);

  if (!session) {
    return {
      sessionId: '',
      score: 0,
      active: false,
      message: 'Invalid session',
    };
  }

  session.active = false;

  return {
    sessionId,
    score: session.score,
    card: session.currentCard,
    randomYear: session.randomYear,
    active: false,
    gameOver: true,
    message: 'Game ended',
  };
}

// Get current game state
export function getGameState(sessionId: string): GameResponse {
  const session = gameSessions.get(sessionId);

  if (!session) {
    return {
      sessionId: '',
      score: 0,
      active: false,
      message: 'Invalid session',
    };
  }

  return {
    sessionId,
    score: session.score,
    card:
      session.active && session.currentCard
        ? prepareSafeCardInfo(session.currentCard)
        : session.currentCard,
    randomYear: session.randomYear,
    active: session.active,
    gameOver: !session.active,
  };
}

// Cleanup expired sessions
setInterval(() => {
  const now = Date.now();
  const expiredTime = now - SESSION_TTL;

  // In a real implementation, we would check lastAccessed timestamps
  // But for simplicity in this example, we're not implementing session expiry
}, SESSION_CLEANUP_INTERVAL);
