---
applyTo: "shared/src/**/*.{ts,tsx}"
description: Shared library development patterns for the turn-based games platform
---

# Shared Library Instructions

Follow these patterns when developing the shared library (`@turn-based-mcp/shared`):

## Library Architecture

### Module Organization
- Group related functionality in logical modules (`games/`, `storage/`, `utils/`, `types/`)
- Use barrel exports (`index.ts`) for clean external API
- Keep internal implementation details private
- Expose only necessary types and functions

### Game Implementation Pattern
All games must implement the `Game<TGameState, TMove>` interface:

```typescript
export class GameClass implements Game<GameState, MoveType> {
  validateMove(state: GameState, move: MoveType, playerId: string): boolean {
    // Validate move logic
  }
  
  applyMove(state: GameState, move: MoveType, playerId: string): GameState {
    // Apply move and return new state (immutable)
  }
  
  checkGameEnd(state: GameState): GameResult | null {
    // Check for win/draw conditions
  }
  
  getValidMoves(state: GameState): MoveType[] {
    // Return all possible moves
  }
  
  getInitialState(players: Player[]): GameState {
    // Create initial game state
  }
}
```

## Storage Abstraction

### Dual Storage Pattern
Provide both direct SQLite access and HTTP API client functions:

```typescript
// Direct database access (web app)
export async function getGame(id: string): Promise<GameSession | undefined>
export async function setGame(id: string, session: GameSession): Promise<void>

// HTTP API client (MCP server)
export async function getGameForMCP(id: string): Promise<GameSession | undefined>
export async function createGameForMCP(playerName: string): Promise<GameSession>
```

### Storage Interface
```typescript
interface GameStorage {
  // CRUD operations
  get<T>(id: string): Promise<GameSession<T> | undefined>
  set<T>(id: string, session: GameSession<T>): Promise<void>
  getAll<T>(): Promise<GameSession<T>[]>
  delete(id: string): Promise<boolean>
}
```

## Type System Design

### Base Types
Define core types that all games extend:

```typescript
interface BaseGameState {
  id: string
  players: Player[]
  currentPlayerId: string
  status: 'playing' | 'finished'
  winner?: string | 'draw' | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface Game<TGameState extends BaseGameState, TMove> {
  validateMove(state: TGameState, move: TMove, playerId: string): boolean
  applyMove(state: TGameState, move: TMove, playerId: string): TGameState
  checkGameEnd(state: TGameState): GameResult | null
  getValidMoves(state: TGameState): TMove[]
  getInitialState(players: Player[]): TGameState
}
```

### Game-Specific Types
Extend base types for each game:

```typescript
interface TicTacToeGameState extends BaseGameState {
  board: Board
  playerSymbols: Record<string, 'X' | 'O'>
}

interface TicTacToeMove {
  row: number
  col: number
}
```

## Utility Functions

### Pure Functions
Create reusable, testable utility functions:

```typescript
// ID generation
export function generateGameId(): string {
  return crypto.randomUUID()
}

// Date formatting
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Game type utilities
export function getGameDisplayName(type: GameType): string {
  const names: Record<GameType, string> = {
    'tic-tac-toe': 'Tic-Tac-Toe',
    'rock-paper-scissors': 'Rock Paper Scissors'
  }
  return names[type] || 'Unknown Game'
}
```

## Testing Infrastructure

### Test Database Utilities
Provide centralized test setup for all packages:

```typescript
export async function setupTestDatabase(inMemory = true): Promise<void>
export async function teardownTestDatabase(): Promise<void>
export async function clearTestDatabase(): Promise<void>
export function getTestDatabase(): Database
```

### Mock Factories
Export factory functions for test data:

```typescript
export function createMockGameState<T extends BaseGameState>(
  overrides: Partial<T> = {}
): T {
  return {
    id: generateGameId(),
    players: [
      { id: 'player1', name: 'Player 1', isAI: false },
      { id: 'ai', name: 'AI Player', isAI: true }
    ],
    currentPlayerId: 'player1',
    status: 'playing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  } as T
}
```

## Error Handling

### Storage Errors
Define specific error types for different failure modes:

```typescript
export class GameNotFoundError extends Error {
  constructor(gameId: string) {
    super(`Game not found: ${gameId}`)
    this.name = 'GameNotFoundError'
  }
}

export class InvalidMoveError extends Error {
  constructor(move: any, reason: string) {
    super(`Invalid move: ${JSON.stringify(move)} - ${reason}`)
    this.name = 'InvalidMoveError'
  }
}
```

## Immutability Patterns

### State Updates
Always return new state objects instead of mutating:

```typescript
applyMove(state: GameState, move: Move, playerId: string): GameState {
  return {
    ...state,
    board: updateBoard(state.board, move),
    currentPlayerId: getNextPlayer(state, playerId),
    updatedAt: new Date().toISOString()
  }
}
```

### Deep Updates
Use spread operators and helper functions for nested updates:

```typescript
function updateBoard(board: Board, move: Move): Board {
  return board.map((row, rowIndex) =>
    rowIndex === move.row
      ? row.map((cell, colIndex) =>
          colIndex === move.col ? move.symbol : cell
        )
      : row
  )
}
```

## Build and Export Strategy

### Package.json Configuration
```json
{
  "name": "@turn-based-mcp/shared",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

### Build Process
- Build TypeScript to CommonJS for Node.js compatibility
- Generate declaration files for TypeScript support
- Use proper module resolution for monorepo structure
- Test library in isolation before publishing changes
