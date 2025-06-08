# MTG-UI: Higher or Lower Card Game

This project is a Magic: The Gathering "Higher or Lower" card game built using [Nx](https://nx.dev) for monorepo management. It consists of a Vue 3 frontend (Composition API) and a Node.js API backend.

## Game Description

In this game, players are shown partial information about a Magic: The Gathering card and asked to guess whether the card was printed before or after a randomly selected year. Players earn points for correct guesses and the game ends when they make an incorrect guess.

## Deployment

### Vercel Deployment (UI Only)

The UI part of this application is configured to be deployed on Vercel. To deploy:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration in `vercel.json`
3. The UI will be built using the `vercel-build` script defined in package.json
4. The built files will be served from the `dist/ui` directory

**Note:** The current deployment only includes the UI. The API needs to be deployed separately.

## Project Structure

- `ui/`: Vue 3 frontend using Composition API
  - Features a responsive UI for the Higher or Lower game
  - Handles game state and user interactions
- `api/`: Node.js API backend (native HTTP server)
  - Provides game session management
  - Interacts with the Scryfall API to fetch random MTG cards
  - Implements game logic and scoring
- `examples/`: Example data for development and testing
- `tmp/`: Build artifacts and temporary files

## Technologies Used

- **Frontend**: Vue 3 with Composition API, Vite, TypeScript
- **Backend**: Node.js, TypeScript, Native HTTP module
- **External APIs**: Scryfall SDK for Magic card data
- **Project Management**: Nx monorepo tools

## Game Features

- Session-based gameplay with persistent scores
- Random card selection from the entire MTG card database
- Year-based guessing mechanic
- Score tracking and game over state management
- Clean, responsive UI

## Usage

### Install dependencies

```sh
npm install
```

### Build all apps

```sh
npm run build:all
```

### Build API only

```sh
npm run build:api
```

### Build UI only

```sh
npm run build:ui
```

### Serve API (dev)

```sh
npm run serve:api
```

### Serve UI (dev)

```sh
npm run serve:ui
```

### Serve all (dev)

```sh
npm run serve:all
```

### Lint all projects

```sh
npm run lint
```

### Clean Nx cache and reset

```sh
npm run clean
```

### Clean install (remove node_modules and reinstall)

```sh
npm run clean-install
```

## API Endpoints

The API provides the following endpoints:

- `GET /api/card?name={cardName}`: Fetch a specific card by name
- `POST /api/game/start`: Start a new game session
- `POST /api/game/round`: Start a new round in an existing session
- `POST /api/game/guess`: Submit a guess (before/after)
- `POST /api/game/end`: End a game session manually
- `GET /api/game/state`: Get the current state of a game session

## Future Improvements

- User authentication and persistent player profiles
- Leaderboards and high scores
- Additional game modes and card filtering options
- Performance optimizations and improved caching
- Deployment configurations for production environments

---

For more information about Nx commands, see the [Nx documentation](https://nx.dev/getting-started/intro).
