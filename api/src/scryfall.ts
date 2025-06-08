// Initializes the scryfall-sdk and exposes a function to fetch a card by name.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: No type definitions for scryfall-sdk
import * as Scry from 'scryfall-sdk';

Scry.setAgent('kelvin-mtg-ui', '1.0.0');

/**
 * Fetches a Magic: The Gathering card by name using scryfall-sdk.
 * @param name - The name of the card to fetch.
 * @returns A Promise resolving to the card object or null if not found.
 */
export async function getCardByName(name: string) {
  try {
    const card = await Scry.Cards.byName(name);

    if (card) {
      return {
        name: card.name,
        text: card.getText(),
        image: card.image_uris?.normal || card.image_uris?.large || null,
      };
    }
    return null;
  } catch (error) {
    console.log(`Error fetching card "${name}":`, error);
    return null;
  }
}

/**
 * Fetches a random Magic: The Gathering card using scryfall-sdk.
 * Validates that the card has all required attributes (name, image_uris, released_at, and cmc)
 * and will retry fetching up to MAX_ATTEMPTS times if an invalid card is found.
 * @returns A Promise resolving to an object with the name, image URIs, released_at date, and cmc, or null if not found.
 */
export async function getRandomCard() {
  const MAX_ATTEMPTS = 5;

  try {
    let attempts = 0;
    let validCard = null;

    while (!validCard && attempts < MAX_ATTEMPTS) {
      attempts++;
      console.log(`Attempt ${attempts}/${MAX_ATTEMPTS} to fetch a valid card`);

      const card = await Scry.Cards.random();

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
