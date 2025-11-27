---
applyTo: "web/src/app/api/**/*.{ts,js}"
description: Next.js API route development patterns for the turn-based games platform
---

# Next.js API Routes

## Purpose

Patterns for creating API routes in the web package. Covers request handling, game integration, error handling, and security.


## File Structure and Naming

- Use Next.js 13+ App Router conventions (`route.ts`)
- Group related routes by game type: `/api/games/[game-type]/`
- Use dynamic routes for game instances: `/api/games/[game-type]/[id]/`
- Include MCP-specific sanitized endpoints: `/api/games/[game-type]/mcp/`

## HTTP Method Handlers

Export named functions for each HTTP method:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // Handle GET requests
}

export async function POST(request: NextRequest) {
  // Handle POST requests with body
}

export async function DELETE(request: NextRequest) {
  // Handle DELETE requests
}
```

## Request/Response Patterns

### Request Handling
- Always use try-catch blocks for error handling
- Parse request bodies with `await request.json()`
- Extract URL parameters from dynamic routes: `{ params }: { params: Promise<{ id: string }> }`
- Validate required fields and return 400 for missing data

### Response Patterns
- Use `NextResponse.json()` for all responses
- Include appropriate HTTP status codes:
  - 200: Success
  - 400: Bad request (validation errors, invalid moves)
  - 404: Resource not found
  - 500: Server errors
- Return consistent error shapes: `{ error: 'Error message' }`

## Game Integration Patterns

### Game State Management
- Create game instances at module level: `const ticTacToeGame = new TicTacToeGame()`
- Use shared game storage functions from `@turn-based-mcp/shared`
- Always validate moves using game logic before applying
- Update game history with player moves and timestamps

### Move Processing Flow
```typescript
// 1. Validate game exists
const gameSession = await getGameFromStorage(gameId)
if (!gameSession) {
  return NextResponse.json({ error: 'Game not found' }, { status: 404 })
}

// 2. Validate move
if (!gameInstance.validateMove(gameSession.gameState, move, playerId)) {
  return NextResponse.json({ error: 'Invalid move' }, { status: 400 })
}

// 3. Apply move and update state
let updatedGameState = gameInstance.applyMove(gameSession.gameState, move, playerId)

// 4. Add to history
const playerMove = { playerId, move, timestamp: new Date() }
gameSession.history.push(playerMove)

// 5. Check for game end
const gameResult = gameInstance.checkGameEnd(updatedGameState)
if (gameResult) {
  updatedGameState = { ...updatedGameState, status: 'finished', winner: gameResult.winner }
}

// 6. Save and return
gameSession.gameState = updatedGameState
await saveGameToStorage(gameId, gameSession)
return NextResponse.json(gameSession)
```

## Error Handling

- Log errors with `console.error()` before returning responses
- Handle specific error types (validation, storage, parsing)
- Return generic error messages to avoid exposing internals
- Use 500 status for unexpected errors

## Security and Sanitization

### MCP Endpoints
- Create separate `/mcp/` endpoints for MCP server access
- Sanitize sensitive data (hide current player choices in RPS)
- Remove incomplete rounds and private information
- Validate all inputs from external MCP requests

### General Security
- Validate all input parameters
- Sanitize data before storage
- Use proper TypeScript types for request/response shapes
- Avoid exposing sensitive game state to clients

## Example Route Structure

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { GameClass } from '@turn-based-mcp/shared'
import { getGame, setGame } from '../../../lib/game-storage'

const gameInstance = new GameClass()

export async function POST(request: NextRequest) {
  try {
    const { playerName, gameId } = await request.json()
    
    const players = [
      { id: 'player1', name: playerName || 'Player', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ]
    
    const gameState = gameInstance.getInitialState(players)
    if (gameId) gameState.id = gameId
    
    const gameSession = {
      gameState,
      gameType: 'game-type',
      history: []
    }
    
    await setGame(gameState.id, gameSession)
    return NextResponse.json(gameSession)
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
```
