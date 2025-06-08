import {
  sql,
  createCorsResponse,
  handleOptions,
  createErrorResponse,
  parseRequestBody,
  scry,
} from '../utils/api-helpers.js';
import type { CardInfo } from '../types/game.js';

/**
 * Fetches a random Magic: The Gathering card using scryfall-sdk.
 * Validates that the card has all required attributes (name, image_uris, released_at, and cmc)
 * and will retry fetching up to MAX_ATTEMPTS times if an invalid card is found.
 * @returns A Promise resolving to an object with the name, image URIs, released_at date, and cmc, or null if not found.
 */
async function getRandomCard() {
  const MAX_ATTEMPTS = 5;

  try {
    let attempts = 0;
    let validCard = null;

    while (!validCard && attempts < MAX_ATTEMPTS) {
      attempts++;
      console.log(`Attempt ${attempts}/${MAX_ATTEMPTS} to fetch a valid card`);

      const card = await scry.Cards.random();

      if (!card) {
        console.log('No card returned from API');
        continue;
      }

      // Check if all required attributes are present
      const hasName = !!card.name;
      const hasImage = !!(card.image_uris?.normal || card.image_uris?.large);
      const hasReleaseDate = !!card.released_at;
      const hasCMC = typeof card.cmc === 'number' && card.cmc >= 0;

      if (hasName && hasImage && hasReleaseDate && hasCMC) {
        console.log('Valid card found:', card.name);
        validCard = card;
      } else {
        console.log('Invalid card found, missing attributes:', {
          name: card.name || 'missing',
          hasImage: hasImage ? 'present' : 'missing',
          hasReleaseDate: hasReleaseDate ? 'present' : 'missing',
          hasCMC: hasCMC ? 'present' : 'missing',
        });
      }
    }

    if (!validCard) {
      console.log(`Failed to find a valid card after ${MAX_ATTEMPTS} attempts`);
      return null;
    }

    return {
      name: validCard.name,
      image_uris: validCard.image_uris,
      released_at: validCard.released_at,
      cmc: validCard.cmc,
    };
  } catch (error) {
    console.log('Error fetching random card:', error);
    return null;
  }
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
  if (!scryfallCard || !scryfallCard.released_at) {
    return null;
  }

  // Extract year from ISO date string (e.g., "2019-01-25" -> 2019)
  const yearReleased = new Date(scryfallCard.released_at).getFullYear();

  return {
    name: scryfallCard.name,
    // Use normal image if available, otherwise large, or null
    image:
      scryfallCard.image_uris?.normal || scryfallCard.image_uris?.large || null,
    yearReleased,
    cmc: typeof scryfallCard.cmc === 'number' ? scryfallCard.cmc : null,
  };
}

// Generate a random year between 1993 (first MTG set) and current year
function generateRandomYear(): number {
  const startYear = 1993;
  const currentYear = new Date().getFullYear();
  return Math.floor(Math.random() * (currentYear - startYear + 1)) + startYear;
}

// Prepare safe card info (without revealing the year during gameplay)
function prepareSafeCardInfo(card: CardInfo): Partial<CardInfo> {
  // Return everything except the year
  return {
    name: card.name,
    image: card.image,
    cmc: card.cmc,
  };
}

export async function POST(request: Request) {
  console.log('POST request received at /api/game/round');

  try {
    // Parse the request body
    const body = await parseRequestBody<{ sessionId: string }>(request);

    if (!body.sessionId) {
      return createErrorResponse('Missing sessionId', 400);
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

    try {
      // Fetch a random card from Scryfall
      const scryfallCard = await getRandomCard();

      if (!scryfallCard) {
        return createErrorResponse('Failed to fetch card', 500);
      }

      // Convert to our card format
      const cardInfo = convertToCardInfo(scryfallCard as ScryfallCard);

      if (!cardInfo) {
        return createErrorResponse('Failed to process card data', 500);
      }

      // Generate a random year that doesn't equal the card's year
      let randomYear;
      do {
        randomYear = generateRandomYear();
      } while (randomYear === cardInfo.yearReleased);

      // Update the session in the database
      await sql`
        UPDATE public.games
        SET 
          current_card = ${JSON.stringify(cardInfo)},
          random_year = ${randomYear},
          updated_at = ${new Date().toISOString()}
        WHERE session_id = ${body.sessionId}
        RETURNING *
      `;

      // Return the updated game info
      return createCorsResponse({
        sessionId: body.sessionId,
        score: gameRecord.score,
        card: cardInfo ? prepareSafeCardInfo(cardInfo) : undefined,
        randomYear: randomYear,
        active: true,
      });
    } catch (error) {
      console.error('Error in startNewRound:', error);
      return createErrorResponse('Server error', 500);
    }
  } catch (error) {
    console.error('Error processing next-round request:', error);
    return createErrorResponse('Failed to start next round', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
