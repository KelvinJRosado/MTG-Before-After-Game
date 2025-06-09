import {
  sql,
  createCorsResponse,
  handleOptions,
  createErrorResponse,
  parseRequestBody,
} from '../utils/api-helpers.js';
import type { CardInfo } from '../types/game.js';

export async function POST(request: Request) {
  console.log('POST request received at /api/game/guess');

  try {
    // Parse the request body
    const body = await parseRequestBody<{
      sessionId: string;
      guess: 'before' | 'after';
    }>(request);

    // Validate request body
    if (!body.sessionId) {
      return createErrorResponse('Missing sessionId', 400);
    }

    if (!body.guess || (body.guess !== 'before' && body.guess !== 'after')) {
      return createErrorResponse('Invalid guess value', 400);
    }

    // Get the current game session from database
    const sessionResult = await sql`
      SELECT * FROM public.games 
      WHERE session_id = ${body.sessionId} AND active = true
    `;

    if (sessionResult.length === 0) {
      return createErrorResponse('Invalid or inactive session', 400);
    }

    const gameRecord = sessionResult[0];

    // Check if there's a current card
    if (!gameRecord.current_card) {
      return createErrorResponse('No active game round', 400);
    }

    const currentCard = gameRecord.current_card as CardInfo;
    const cardYear = currentCard.yearReleased;
    const randomYear = gameRecord.random_year;
    let isCorrect = false;

    // Check if guess is correct
    if (body.guess === 'after' && cardYear >= randomYear) {
      isCorrect = true;
    } else if (body.guess === 'before' && cardYear < randomYear) {
      isCorrect = true;
    }

    if (isCorrect) {
      // Increase score for correct guess
      const updatedScore = gameRecord.score + 1;

      // Update session in the database
      await sql`
        UPDATE public.games
        SET 
          score = ${updatedScore},
          updated_at = ${new Date().toISOString()}
        WHERE session_id = ${body.sessionId}
      `;

      return createCorsResponse({
        sessionId: body.sessionId,
        score: updatedScore,
        active: true,
        message: 'Correct guess!',
      });
    } else {
      // End the game on incorrect guess
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
        card: currentCard, // Now we can reveal the full card info including yearReleased
        randomYear: randomYear,
        active: false,
        gameOver: true,
        message: `Game over! The card "${currentCard.name}" was released in ${currentCard.yearReleased}.`,
      });
    }
  } catch (error) {
    console.error('Error processing guess:', error);
    return createErrorResponse('Failed to process guess', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
