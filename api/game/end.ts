import {
  sql,
  createCorsResponse,
  handleOptions,
  createErrorResponse,
  parseRequestBody,
} from '../utils/api-helpers.js';

export async function POST(request: Request) {
  console.log('POST request received at /api/game/end');

  try {
    // Parse the request body
    const body = await parseRequestBody<{ sessionId: string }>(request);

    if (!body.sessionId) {
      return createErrorResponse('Missing sessionId', 400);
    }

    // Get the current game session from database
    const sessionResult = await sql`
      SELECT * FROM public.games 
      WHERE session_id = ${body.sessionId}
    `;

    if (sessionResult.length === 0) {
      return createErrorResponse('Invalid session', 400);
    }

    const gameRecord = sessionResult[0];

    // Update the session to mark it as inactive
    await sql`
      UPDATE public.games
      SET 
        active = false,
        updated_at = ${new Date().toISOString()}
      WHERE session_id = ${body.sessionId}
    `;

    return createCorsResponse({
      sessionId: body.sessionId,
      score: gameRecord.score,
      card: gameRecord.current_card,
      randomYear: gameRecord.random_year,
      active: false,
      gameOver: true,
      message: 'Game ended',
    });
  } catch (error) {
    console.error('Error ending game:', error);
    return createErrorResponse('Failed to end game', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
