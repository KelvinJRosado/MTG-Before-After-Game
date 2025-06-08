import {
  sql,
  createCorsResponse,
  handleOptions,
  createErrorResponse,
} from '../utils/api-helpers.js';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  console.log('GET request received at /api/game/start');

  const data = await sql`SELECT * FROM public.games;`;
  console.log('Data fetched from public.games:', data);

  return createCorsResponse({ message: 'Hello from Vercel!', data });
}

export async function POST(request: Request) {
  console.log('POST request received at /api/game/start');

  try {
    // Generate a new sessionId using UUID
    const sessionId = uuidv4();

    // Initialize the session with default values
    const gameSession = {
      sessionId: sessionId,
      score: 0,
      currentCard: null,
      randomYear: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
      ${gameSession.currentCard}, 
      ${gameSession.randomYear}, 
      ${gameSession.active}, 
      ${gameSession.createdAt.toISOString()}, 
      ${gameSession.updatedAt.toISOString()}
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
