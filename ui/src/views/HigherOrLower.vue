<template>
  <div class="higher-lower-container">
    <h2>Higher or Lower</h2>

    <!-- Score display -->
    <div v-if="gameActive || gameOver" class="score-display">
      Score: {{ score }}
    </div>

    <p v-if="!gameActive && !gameOver">
      Welcome to the Higher or Lower MTG game!
    </p>

    <div v-if="loading" class="loading-message">Loading card...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Game over screen -->
    <div v-else-if="gameOver" class="game-over">
      <h3>Game Over!</h3>
      <p>Your final score: {{ score }}</p>
      <p>The card "{{ card.name }}" was released in {{ card.yearReleased }}.</p>
      <button @click="startNewGame" class="new-game-button">Play Again</button>
    </div>

    <!-- Active game -->
    <div v-else-if="card && gameActive" class="game-container">
      <!-- Card display with top half of the image -->
      <div class="card-preview">
        <div class="card-image-container">
          <img
            v-if="card.image"
            :src="card.image"
            alt="Card preview"
            class="card-image"
          />
          <div v-else class="no-image">No image available</div>
        </div>
      </div>

      <!-- Random year and guess buttons -->
      <div class="game-question">
        <p>
          Was this card printed before or after <strong>{{ randomYear }}</strong
          >?
        </p>
        <div class="guess-buttons">
          <button @click="makeGuess('before')" class="guess-button lower">
            Before
          </button>
          <button @click="makeGuess('after')" class="guess-button higher">
            After
          </button>
        </div>
      </div>

      <!-- End game button -->
      <div class="end-game-container">
        <button @click="endGame" class="end-game-button">End Game</button>
      </div>
    </div>

    <!-- Start game button -->
    <button
      v-if="!loading && !gameActive && !gameOver"
      @click="startNewGame"
      class="new-card-button"
    >
      Start Game
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const card = ref<any>(null);
const loading = ref(false);
const error = ref('');
const gameActive = ref(false);
const gameOver = ref(false);
const score = ref(0);
const randomYear = ref(0);
const sessionId = ref('');

// API base URL
const API_BASE_URL = '/api';

async function startNewGame() {
  error.value = '';
  loading.value = true;

  try {
    // Start a new game session
    const response = await fetch(`${API_BASE_URL}/game/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json();
      error.value = data.error || 'Error starting new game.';
      return;
    }

    const gameData = await response.json();

    // Set game state from API response
    sessionId.value = gameData.sessionId;
    score.value = gameData.score;
    card.value = gameData.card;
    randomYear.value = gameData.randomYear;
    gameActive.value = gameData.active;
    gameOver.value = gameData.gameOver || false;
  } catch (e) {
    console.error('Network error:', e);
    error.value = 'Network error. Is the API running?';
  } finally {
    loading.value = false;
  }
}

async function fetchNextRound() {
  console.log('Fetching next round...');

  if (!sessionId.value) {
    error.value = 'No active game session';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    // Get the next round card from the updated round API
    const response = await fetch(`${API_BASE_URL}/game/round`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId.value,
      }),
    });

    console.log('Response:', JSON.stringify(response, null, 2));

    if (!response.ok) {
      const data = await response.json();
      error.value = data.error || 'Error fetching next round.';
      return;
    }

    const gameData = await response.json();

    // Update game state from API response
    score.value = gameData.score;
    card.value = gameData.card;
    randomYear.value = gameData.randomYear;
    gameActive.value = gameData.active;
    gameOver.value = gameData.gameOver || false;

    if (gameData.message) {
      console.log(gameData.message);
    }
  } catch (e) {
    console.error('Network error:', e);
    error.value = 'Network error. Is the API running?';
  } finally {
    loading.value = false;
  }
}

async function makeGuess(guess: 'before' | 'after') {
  if (!sessionId.value || !gameActive.value) {
    return;
  }

  loading.value = true;

  try {
    // Submit guess to the API
    const response = await fetch(`${API_BASE_URL}/game/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId.value,
        guess,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      error.value = data.error || 'Error processing guess.';
      return;
    }

    const gameData = await response.json();

    // Update game state from API response
    score.value = gameData.score;
    gameActive.value = gameData.active;
    gameOver.value = gameData.gameOver || false;

    if (gameData.message) {
      console.log(gameData.message);
    }

    if (gameData.active) {
      // If the game is still active, get the next card
      fetchNextRound();
    } else if (gameData.gameOver) {
      // If game is over, update card with full info that includes the release year
      card.value = gameData.card;
    }
  } catch (e) {
    console.error('Network error:', e);
    error.value = 'Network error. Is the API running?';
  } finally {
    loading.value = false;
  }
}

// Function to manually end the game
async function endGame() {
  if (!sessionId.value) {
    return;
  }

  loading.value = true;

  try {
    // End the game via API
    const response = await fetch(`${API_BASE_URL}/game/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      error.value = data.error || 'Error ending game.';
      return;
    }

    const gameData = await response.json();

    // Update game state from API response
    score.value = gameData.score;
    gameActive.value = false;
    gameOver.value = true;

    // Update card with full info that includes the release year
    if (gameData.card) {
      card.value = gameData.card;
    }
  } catch (e) {
    console.error('Network error:', e);
    error.value = 'Network error. Is the API running?';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // No automatic card fetch on mount, user needs to click the button to start
});
</script>

<style scoped>
.higher-lower-container {
  padding: 2rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #2563eb;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.score-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 1rem;
}

.loading-message,
.error-message {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.card-preview {
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 210px; /* Half of a typical card height */
  overflow: hidden;
  border-radius: 4.75% 4.75% 0 0; /* Rounded corners on top only */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  object-fit: cover;
  object-position: top; /* Show only the top half */
  margin-bottom: -100%; /* Hide the bottom half */
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e5e7eb;
  color: #6b7280;
}

.game-question {
  width: 100%;
  max-width: 300px;
  margin-top: 1rem;
}

.guess-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.guess-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.lower {
  background-color: #ef4444;
  color: white;
}

.lower:hover {
  background-color: #dc2626;
}

.higher {
  background-color: #10b981;
  color: white;
}

.higher:hover {
  background-color: #059669;
}

.submit-button,
.new-card-button,
.new-game-button {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.submit-button:hover,
.new-card-button:hover,
.new-game-button:hover {
  background-color: #1d4ed8;
}

.new-card-button,
.new-game-button {
  margin-top: 1rem;
}

.game-over {
  margin: 2rem 0;
  padding: 2rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.game-over h3 {
  font-size: 1.8rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

.end-game-container {
  margin-top: 2rem;
  width: 100%;
  max-width: 300px;
  display: flex;
  justify-content: center;
}

.end-game-button {
  padding: 0.5rem 1rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.end-game-button:hover {
  background-color: #4b5563;
}
</style>
