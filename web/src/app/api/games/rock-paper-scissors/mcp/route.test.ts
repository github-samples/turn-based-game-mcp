import { vi } from 'vitest'
import { GET } from './route'
import { getAllRPSGames } from '../../../../../lib/game-storage'
import type { GameSession } from '@turn-based-mcp/shared'
import type { RPSGameState } from '@turn-based-mcp/shared'

// Mock the game storage
vi.mock('../../../../../lib/game-storage')

const mockGetAllRPSGames = getAllRPSGames as vi.MockedFunction<typeof getAllRPSGames>

describe('/api/games/rock-paper-scissors/mcp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sanitize current round player choices when round is in progress', async () => {
    // Create a mock game with a player choice but no AI choice yet
    const mockGame: GameSession<RPSGameState> = {
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
            // Current round - player1 has chosen but AI hasn't
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
    }

    mockGetAllRPSGames.mockResolvedValue([mockGame])

    const response = await GET()
    const data = await response.json()

    expect(data).toHaveLength(1)
    const sanitizedGame = data[0]
    
    // Verify that current round choices are hidden
    expect(sanitizedGame.gameState.rounds[0].player1Choice).toBeUndefined()
    expect(sanitizedGame.gameState.rounds[0].player2Choice).toBeUndefined()
    expect(sanitizedGame.gameState.rounds[0].winner).toBeUndefined()
    
    // Other game data should remain intact
    expect(sanitizedGame.gameState.id).toBe('test-game-1')
    expect(sanitizedGame.gameState.status).toBe('playing')
    expect(sanitizedGame.gameState.currentPlayerId).toBe('ai')
  })

  it('should preserve completed round data with winners', async () => {
    const mockGame: GameSession<RPSGameState> = {
      gameState: {
        id: 'test-game-2',
        status: 'playing',
        currentPlayerId: 'player1',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          {
            // Completed round - both players have chosen
            player1Choice: 'rock',
            player2Choice: 'scissors',
            winner: 'player1'
          },
          {
            // Current round - player1 has chosen but AI hasn't
            player1Choice: 'paper',
            player2Choice: undefined,
            winner: undefined
          }
        ],
        currentRound: 1,
        scores: { player1: 1, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }

    mockGetAllRPSGames.mockResolvedValue([mockGame])

    const response = await GET()
    const data = await response.json()

    const sanitizedGame = data[0]
    
    // First round (completed) should preserve all data
    expect(sanitizedGame.gameState.rounds[0].player1Choice).toBe('rock')
    expect(sanitizedGame.gameState.rounds[0].player2Choice).toBe('scissors')
    expect(sanitizedGame.gameState.rounds[0].winner).toBe('player1')
    
    // Current round (in progress) should be sanitized
    expect(sanitizedGame.gameState.rounds[1].player1Choice).toBeUndefined()
    expect(sanitizedGame.gameState.rounds[1].player2Choice).toBeUndefined()
    expect(sanitizedGame.gameState.rounds[1].winner).toBeUndefined()
  })

  it('should not sanitize when no rounds exist', async () => {
    const mockGame: GameSession<RPSGameState> = {
      gameState: {
        id: 'test-game-3',
        status: 'playing',
        currentPlayerId: 'player1',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [],
        currentRound: 0,
        scores: { player1: 0, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }

    mockGetAllRPSGames.mockResolvedValue([mockGame])

    const response = await GET()
    const data = await response.json()

    const sanitizedGame = data[0]
    
    // Should preserve empty rounds array
    expect(sanitizedGame.gameState.rounds).toEqual([])
  })

  it('should preserve all data when current round index exceeds rounds array', async () => {
    const mockGame: GameSession<RPSGameState> = {
      gameState: {
        id: 'test-game-4',
        status: 'finished',
        currentPlayerId: 'player1',
        players: [
          { id: 'player1', name: 'Human Player', isAI: false },
          { id: 'ai', name: 'AI Player', isAI: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        rounds: [
          {
            player1Choice: 'rock',
            player2Choice: 'scissors',
            winner: 'player1'
          }
        ],
        currentRound: 1, // Beyond the rounds array
        scores: { player1: 1, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    }

    mockGetAllRPSGames.mockResolvedValue([mockGame])

    const response = await GET()
    const data = await response.json()

    const sanitizedGame = data[0]
    
    // Should preserve completed round data
    expect(sanitizedGame.gameState.rounds[0].player1Choice).toBe('rock')
    expect(sanitizedGame.gameState.rounds[0].player2Choice).toBe('scissors')
    expect(sanitizedGame.gameState.rounds[0].winner).toBe('player1')
  })

  it('should handle multiple games with different states', async () => {
    const mockGames: GameSession<RPSGameState>[] = [
      {
        gameState: {
          id: 'finished-game',
          status: 'finished',
          currentPlayerId: 'player1',
          players: [
            { id: 'player1', name: 'Human Player', isAI: false },
            { id: 'ai', name: 'AI Player', isAI: true }
          ],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          rounds: [
            { player1Choice: 'rock', player2Choice: 'scissors', winner: 'player1' }
          ],
          currentRound: 1,
          scores: { player1: 1, ai: 0 },
          maxRounds: 3
        },
        gameType: 'rock-paper-scissors',
        history: []
      },
      {
        gameState: {
          id: 'active-game',
          status: 'playing',
          currentPlayerId: 'ai',
          players: [
            { id: 'player1', name: 'Human Player', isAI: false },
            { id: 'ai', name: 'AI Player', isAI: true }
          ],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          rounds: [
            { player1Choice: 'paper', player2Choice: undefined, winner: undefined }
          ],
          currentRound: 0,
          scores: { player1: 0, ai: 0 },
          maxRounds: 3
        },
        gameType: 'rock-paper-scissors',
        history: []
      }
    ]

    mockGetAllRPSGames.mockResolvedValue(mockGames)

    const response = await GET()
    const data = await response.json()

    expect(data).toHaveLength(2)
    
    // Finished game should preserve all data
    const finishedGame = data.find((g: GameSession<RPSGameState>) => g.gameState.id === 'finished-game')
    expect(finishedGame.gameState.rounds[0].player1Choice).toBe('rock')
    
    // Active game should sanitize current round
    const activeGame = data.find((g: GameSession<RPSGameState>) => g.gameState.id === 'active-game')
    expect(activeGame.gameState.rounds[0].player1Choice).toBeUndefined()
  })

  it('should handle errors gracefully', async () => {
    mockGetAllRPSGames.mockRejectedValue(new Error('Database connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch games')
  })

  it('should verify the endpoint returns sanitized data different from regular endpoint', async () => {
    // This test ensures that the MCP endpoint actually sanitizes data
    // while the regular endpoint would return unsanitized data
    const mockGame: GameSession<RPSGameState> = {
      gameState: {
        id: 'test-sanitization',
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
            player1Choice: 'rock', // This should be hidden
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
    }

    mockGetAllRPSGames.mockResolvedValue([mockGame])

    const response = await GET()
    const sanitizedData = await response.json()

    // Verify that sensitive information is removed
    expect(sanitizedData[0].gameState.rounds[0].player1Choice).toBeUndefined()
    
    // But verify that the original mock still has the data (proving sanitization occurred)
    expect(mockGame.gameState.rounds[0].player1Choice).toBe('rock')
  })
})
