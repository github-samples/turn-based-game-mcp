---
applyTo: "mcp-server/src/**/*.{ts,js}"
description: MCP server development patterns for the turn-based games platform
---

# MCP Server Development

## Purpose

Patterns for the Model Context Protocol server. Covers tool definitions, HTTP integration with the web API, AI algorithms, and error handling.


## Server Architecture

### Tool Definition Pattern
Each game operation should be exposed as a separate MCP tool:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_tic_tac_toe_game",
      description: "Create a new Tic-Tac-Toe game with optional custom game ID",
      inputSchema: {
        type: "object",
        properties: {
          gameId: { type: "string", description: "Optional custom game ID" },
          playerName: { type: "string", default: "Player" },
          aiDifficulty: { 
            type: "string", 
            enum: ["easy", "medium", "hard"],
            default: "medium"
          }
        }
      }
    },
    {
      name: "play_tic_tac_toe",
      description: "Make an AI move in Tic-Tac-Toe game",
      inputSchema: {
        type: "object",
        properties: {
          gameId: { type: "string", description: "The ID of the game to play" }
        },
        required: ["gameId"]
      }
    }
  ]
}))
```

### HTTP Integration Pattern
Use HTTP calls to communicate with the web API, not direct database access:

```typescript
// Helper functions for API communication
async function httpGet(url: string): Promise<any> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

async function httpPost(url: string, data: any): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}
```

## Game Integration Workflow

### Game State Retrieval
Always fetch the latest game state before making AI moves:

```typescript
async function getTicTacToeGameViaAPI(gameId: string) {
  try {
    const games = await httpGet(`${WEB_API_BASE}/api/games/tic-tac-toe/mcp`)
    return games.find((game: any) => game.gameState?.id === gameId)
  } catch (error) {
    console.error('Error fetching tic-tac-toe game via API:', error)
    return undefined
  }
}
```

### AI Move Processing
1. Validate game exists and it's AI's turn
2. Calculate AI move using appropriate difficulty
3. Submit move via API
4. Return updated game state

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === "play_tic_tac_toe") {
    const { gameId } = args as { gameId: string }
    
    // Get current game state
    const game = await getTicTacToeGameViaAPI(gameId)
    if (!game) {
      return { content: [{ type: "text", text: "Game not found" }], isError: true }
    }
    
    // Validate it's AI's turn
    if (game.gameState.currentPlayerId !== 'ai') {
      return { content: [{ type: "text", text: "Not AI's turn" }], isError: true }
    }
    
    // Calculate AI move
    const aiMove = calculateAIMove(game.gameState, game.aiDifficulty || 'medium')
    
    // Submit move via API
    const updatedGame = await httpPost(
      `${WEB_API_BASE}/api/games/tic-tac-toe/${gameId}/move`,
      { move: aiMove, playerId: 'ai' }
    )
    
    return {
      content: [{
        type: "text",
        text: `AI made move at row ${aiMove.row}, col ${aiMove.col}. Game status: ${updatedGame.gameState.status}`
      }]
    }
  }
})
```

## AI Algorithm Integration

### Difficulty Levels
Implement consistent difficulty levels across all games:

- **Easy**: Random valid moves
- **Medium**: Some strategy with occasional mistakes
- **Hard**: Optimal play (minimax, perfect strategy)

### AI Algorithm Structure
```typescript
export function calculateTicTacToeMove(
  gameState: TicTacToeGameState,
  difficulty: Difficulty = 'medium'
): TicTacToeMove {
  const validMoves = getValidMoves(gameState)
  
  switch (difficulty) {
    case 'easy':
      return validMoves[Math.floor(Math.random() * validMoves.length)]
    case 'medium':
      return calculateMediumMove(gameState, validMoves)
    case 'hard':
      return calculateOptimalMove(gameState, validMoves)
  }
}
```

## Error Handling and Logging

### Structured Error Responses
```typescript
// Success response
return {
  content: [{ type: "text", text: "Operation successful" }],
  isError: false
}

// Error response
return {
  content: [{ type: "text", text: "Error message with context" }],
  isError: true
}
```

### Logging Pattern
```typescript
// Log operations for debugging
console.log(`[MCP] Creating ${gameType} game for player: ${playerName}`)
console.error(`[MCP] Error in ${toolName}:`, error.message)
```

## Environment Configuration

### Environment Variables
```typescript
const WEB_API_BASE = process.env.WEB_API_BASE || 'http://localhost:3000'
const MCP_LOG_LEVEL = process.env.MCP_LOG_LEVEL || 'info'
```

### Configuration Validation
```typescript
function validateEnvironment() {
  if (!WEB_API_BASE) {
    throw new Error('WEB_API_BASE environment variable is required')
  }
  
  // Test API connectivity
  return httpGet(`${WEB_API_BASE}/api/health`)
}
```

## Security Considerations

### Input Validation
- Validate all tool arguments against schema
- Sanitize game IDs and player names
- Implement rate limiting for AI moves
- Validate game state before processing moves

### API Security
- Use HTTPS in production
- Implement proper authentication if needed
- Sanitize responses from web API
- Handle API errors gracefully

## Testing Strategy

### Integration Tests
Test MCP tools against real API endpoints:

```typescript
describe('MCP Tic-Tac-Toe Integration', () => {
  it('should create and play a complete game', async () => {
    // Create game via MCP
    const createResult = await callMCPTool('create_tic_tac_toe_game', {
      playerName: 'Test Player'
    })
    
    const gameId = extractGameId(createResult)
    
    // Make player move via API
    await makePlayerMove(gameId, { row: 0, col: 0 })
    
    // AI should respond via MCP
    const playResult = await callMCPTool('play_tic_tac_toe', { gameId })
    
    expect(playResult.isError).toBe(false)
  })
})
```

### AI Algorithm Tests
```typescript
describe('AI Algorithms', () => {
  it('should never lose on hard difficulty', () => {
    // Test optimal play scenarios
  })
  
  it('should make reasonable moves on medium difficulty', () => {
    // Test strategic but imperfect play
  })
})
```

## Performance Optimization

- Cache game states temporarily to reduce API calls
- Implement connection pooling for HTTP requests
- Use async/await consistently for better performance
- Batch multiple API operations when possible
- Monitor and log response times for optimization
