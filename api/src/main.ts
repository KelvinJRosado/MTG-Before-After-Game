/**
 * Simple API server using native Node.js HTTP module.
 * Returns a sample JSON response at the root path.
 *
 * This structure allows for easy expansion in the future.
 */
import { createServer } from 'node:http';
import { getCardByName, getRandomCard } from './scryfall';
import {
  createGameSession,
  startNewRound,
  processGuess,
  endGame,
  getGameState,
} from './game-controller';
import { parseRequestBody } from './utils';

const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  // Set CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle GET /api/card?name=CardName
  if (req.method === 'GET' && req.url && req.url.startsWith('/api/card')) {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const name = urlObj.searchParams.get('name');
    if (!name) {
      res.writeHead(400);
      res.end(
        JSON.stringify({ error: 'Missing required query parameter: name' })
      );
      return;
    }
    const card = await getCardByName(name);
    if (card) {
      res.writeHead(200);
      res.end(JSON.stringify(card));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Card not found' }));
    }
    return;
  }

  // Handle GET /api/random-card
  if (req.method === 'GET' && req.url && req.url === '/api/random-card') {
    const card = await getRandomCard();
    if (card) {
      res.writeHead(200);
      res.end(JSON.stringify(card));
    } else {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to fetch random card' }));
    }
    return;
  }

  // Handle POST /api/game/start - Create new game session
  if (req.method === 'POST' && req.url && req.url === '/api/game/start') {
    try {
      const gameResponse = await createGameSession();
      res.writeHead(200);
      res.end(JSON.stringify(gameResponse));
    } catch (error) {
      console.error('Game start error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to start game session' }));
    }
    return;
  }

  // Handle POST /api/game/guess - Process a guess
  if (req.method === 'POST' && req.url && req.url === '/api/game/guess') {
    try {
      const body = await parseRequestBody(req);
      if (!body.sessionId || !body.guess) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing sessionId or guess' }));
        return;
      }

      const gameResponse = processGuess(body.sessionId, body.guess);
      res.writeHead(200);
      res.end(JSON.stringify(gameResponse));
    } catch (error) {
      console.error('Game guess error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process guess' }));
    }
    return;
  }

  // Handle POST /api/game/next-round - Start next round
  if (req.method === 'POST' && req.url && req.url === '/api/game/next-round') {
    try {
      const body = await parseRequestBody(req);
      if (!body.sessionId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing sessionId' }));
        return;
      }

      const gameResponse = await startNewRound(body.sessionId);
      res.writeHead(200);
      res.end(JSON.stringify(gameResponse));
    } catch (error) {
      console.error('Next round error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to start next round' }));
    }
    return;
  }

  // Handle POST /api/game/end - End game
  if (req.method === 'POST' && req.url && req.url === '/api/game/end') {
    try {
      const body = await parseRequestBody(req);
      if (!body.sessionId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing sessionId' }));
        return;
      }

      const gameResponse = endGame(body.sessionId);
      res.writeHead(200);
      res.end(JSON.stringify(gameResponse));
    } catch (error) {
      console.error('End game error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to end game' }));
    }
    return;
  }

  // Handle GET /api/game/state - Get current game state
  if (
    req.method === 'GET' &&
    req.url &&
    req.url.startsWith('/api/game/state')
  ) {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const sessionId = urlObj.searchParams.get('sessionId');

      if (!sessionId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing sessionId parameter' }));
        return;
      }

      const gameResponse = getGameState(sessionId);
      res.writeHead(200);
      res.end(JSON.stringify(gameResponse));
    } catch (error) {
      console.error('Game state error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to get game state' }));
    }
    return;
  }

  // Only handle GET /
  if (req.method === 'GET' && req.url === '/') {
    // Example response
    const response = {
      message: 'Hello from the API!',
      timestamp: new Date().toISOString(),
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
