import {
  sql,
  createCorsResponse,
  handleOptions,
  createErrorResponse,
} from '../utils/api-helpers.js';
import { createGameSession } from './utils.js';

export async function GET(request: Request) {
  console.log('GET request received at /api/game/start');

  const data = await sql`SELECT * FROM public.games;`;
  console.log('Data fetched from public.games:', data);

  return createCorsResponse({ message: 'Hello from Vercel!', data });
}

export async function POST(request: Request) {
  console.log('POST request received at /api/game/start');

  try {
    // Create a new game session
    const gameSession = await createGameSession();
    console.log('New game session created:', gameSession);

    // Insert the game session into the database
    const result = await sql`
      INSERT INTO public.games (
      sessionId, 
      score, 
      currentCard, 
      randomYear, 
      active, 
      createdAt, 
      updatedAt
      ) 
      VALUES (
      ${gameSession.sessionId}, 
      ${gameSession.score}, 
      ${gameSession.currentCard ? JSON.stringify(gameSession.currentCard) : null}, 
      ${gameSession.randomYear}, 
      ${gameSession.active}, 
      ${gameSession.createdAt}, 
      ${gameSession.updatedAt}
      )
      RETURNING *
    `;

    console.log('Game session stored in database:', result);

    // Return the created game session to the client
    return createCorsResponse({
      message: 'Game session created successfully',
      sessionId: gameSession.sessionId,
      score: gameSession.score,
      active: gameSession.active,
    });
  } catch (error) {
    console.error('Error creating game session:', error);
    return createErrorResponse('Failed to create game session', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
