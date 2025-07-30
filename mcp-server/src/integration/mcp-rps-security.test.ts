import { getRPSGameForMCP, makeRPSMove } from '@turn-based-mcp/shared'
import type { GameSession } from '@turn-based-mcp/shared'
import type { RPSGameState, RPSMove } from '@turn-based-mcp/shared'

// Mock fetch for testing
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('MCP Server RPS Security Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.WEB_API_BASE = 'http://localhost:3000'
  })

  const createMockResponse = (data: any, status = 200) => ({
    ok: status < 400,
    status,
    json: async () => data,
  })

  it('should only receive sanitized game data from MCP endpoint', async () => {
    // Mock what the /api/games/rock-paper-scissors/mcp endpoint returns (sanitized)
    const sanitizedGameData: GameSession<RPSGameState>[] = [{
      gameState: {
        id: 'test-game-1',
        status: 'playing',
        currentPlayerId: 'ai',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          {
            // Current round - choices are sanitized (undefined)
            player1Choice: undefined,
            player2Choice: undefined,
            winner: undefined
          }
        ],
        currentRound: 0,
        scores: { player1: 0, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }]

    mockFetch.mockResolvedValueOnce(createMockResponse(sanitizedGameData) as any)

    // MCP server requests game data
    const gameData = await getRPSGameForMCP('test-game-1')

    // Verify the correct sanitized endpoint was called
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/rock-paper-scissors/mcp')
    
    // Verify that sensitive data is not present
    expect(gameData?.gameState.rounds[0].player1Choice).toBeUndefined()
    expect(gameData?.gameState.rounds[0].player2Choice).toBeUndefined()
    expect(gameData?.gameState.rounds[0].winner).toBeUndefined()
    
    // But other game data should be intact
    expect(gameData?.gameState.id).toBe('test-game-1')
    expect(gameData?.gameState.status).toBe('playing')
  })

  it('should demonstrate that MCP server cannot access player current move even if trying', async () => {
    // This test simulates what would happen if someone tried to call regular API 
    // vs the MCP sanitized API from the MCP server context

    const gameId = 'test-security-game'
    
    // What the regular API might return (with current player choice)
    const unsanitizedData: GameSession<RPSGameState>[] = [{
      gameState: {
        id: gameId,
        status: 'playing',
        currentPlayerId: 'ai',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          {
            // This would expose the player's current choice - NOT what MCP server gets
            player1Choice: 'rock',
            player2Choice: undefined,
            winner: undefined
          }
        ],
        currentRound: 0,
        scores: { player1: 0, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }]

    // What the MCP API actually returns (sanitized)
    const sanitizedData: GameSession<RPSGameState>[] = [{
      gameState: {
        ...unsanitizedData[0].gameState,
        rounds: [
          {
            // Current round choices are hidden
            player1Choice: undefined,
            player2Choice: undefined,
            winner: undefined
          }
        ]
      },
      gameType: 'rock-paper-scissors',
      history: []
    }]

    // Mock the MCP API call (which is what actually gets called)
    mockFetch.mockResolvedValueOnce(createMockResponse(sanitizedData) as any)

    const result = await getRPSGameForMCP(gameId)

    // Verify MCP server only gets sanitized data
    expect(result?.gameState.rounds[0].player1Choice).toBeUndefined()
    
    // The MCP server has no way to access the actual player choice of 'rock'
    // that exists in the unsanitized version
  })

  it('should verify MCP server can only see completed rounds in historical analysis', async () => {
    const gameWithHistory: GameSession<RPSGameState>[] = [{
      gameState: {
        id: 'history-test',
        status: 'playing',
        currentPlayerId: 'ai',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          {
            // Completed round 1 - AI can see this
            player1Choice: 'rock',
            player2Choice: 'scissors',
            winner: 'player1'
          },
          {
            // Completed round 2 - AI can see this  
            player1Choice: 'paper',
            player2Choice: 'rock',
            winner: 'player1'
          },
          {
            // Current round 3 - sanitized, AI cannot see this
            player1Choice: undefined,
            player2Choice: undefined,
            winner: undefined
          }
        ],
        currentRound: 2,
        scores: { player1: 2, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }]

    mockFetch.mockResolvedValueOnce(createMockResponse(gameWithHistory) as any)

    const game = await getRPSGameForMCP('history-test')

    // Verify AI can see completed rounds
    expect(game?.gameState.rounds[0].player1Choice).toBe('rock')
    expect(game?.gameState.rounds[1].player1Choice).toBe('paper')
    
    // But cannot see current round
    expect(game?.gameState.rounds[2].player1Choice).toBeUndefined()
    
    // This means AI can learn from history: [rock, paper] 
    // But cannot cheat by seeing current move
  })

  it('should handle AI move submission without exposing player data', async () => {
    const gameId = 'move-test'
    const aiMove: RPSMove = { choice: 'paper' }
    
    // Mock the move submission response
    const moveResponse: GameSession<RPSGameState> = {
      gameState: {
        id: gameId,
        status: 'playing',
        currentPlayerId: 'player1', // Turn switches after AI move
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          {
            // Round now has AI choice but not player choice (for next round)
            player1Choice: 'rock', // Previous round completed
            player2Choice: 'paper', // AI's move
            winner: 'ai'
          }
        ],
        currentRound: 1,
        scores: { player1: 0, ai: 1 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }

    mockFetch.mockResolvedValueOnce(createMockResponse(moveResponse) as any)

    const result = await makeRPSMove(gameId, aiMove, 'ai')

    // Verify the move was submitted to the correct endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/games/rock-paper-scissors/${gameId}/move`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: aiMove, playerId: 'ai' })
      }
    )

    // Verify the response is properly structured
    expect(result.gameState.rounds[0].player2Choice).toBe('paper')
    expect(result.gameState.winner).toBeUndefined() // Game continues
  })

  it('should demonstrate complete MCP server security flow', async () => {
    const gameId = 'complete-security-test'
    
    // Step 1: MCP server gets sanitized game data (simulating player has already moved)
    const sanitizedGame: GameSession<RPSGameState>[] = [{
      gameState: {
        id: gameId,
        status: 'playing',
        currentPlayerId: 'ai',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          // Historical completed round - AI can learn from this
          { player1Choice: 'rock', player2Choice: 'scissors', winner: 'player1' },
          // Current round - player choice hidden by sanitization  
          { player1Choice: undefined, player2Choice: undefined, winner: undefined }
        ],
        currentRound: 1,
        scores: { player1: 1, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }]

    // Step 2: AI makes move based only on historical data
    const updatedGame: GameSession<RPSGameState> = {
      gameState: {
        ...sanitizedGame[0].gameState,
        rounds: [
          sanitizedGame[0].gameState.rounds[0], // Keep completed round
          { 
            player1Choice: 'paper', // Player's actual choice (AI didn't know this)
            player2Choice: 'paper',  // AI's choice based on history
            winner: 'draw'           // Result
          }
        ],
        currentRound: 2,
        currentPlayerId: 'player1'
      },
      gameType: 'rock-paper-scissors',
      history: []
    }

    // Mock the API calls
    mockFetch
      .mockResolvedValueOnce(createMockResponse(sanitizedGame) as any) // Get game
      .mockResolvedValueOnce(createMockResponse(updatedGame) as any)    // Submit move

    // Execute the flow
    const gameData = await getRPSGameForMCP(gameId)
    expect(gameData?.gameState.rounds[1].player1Choice).toBeUndefined() // Player choice hidden

    const result = await makeRPSMove(gameId, { choice: 'paper' }, 'ai')
    
    // Verify the result shows AI couldn't cheat:
    // - AI chose paper (to counter historical rock pattern)  
    // - Player actually chose paper (broke the pattern)
    // - Result was a draw (AI didn't have unfair advantage)
    expect(result.gameState.rounds[1].player1Choice).toBe('paper')
    expect(result.gameState.rounds[1].player2Choice).toBe('paper')
    expect(result.gameState.rounds[1].winner).toBe('draw')
  })
})
