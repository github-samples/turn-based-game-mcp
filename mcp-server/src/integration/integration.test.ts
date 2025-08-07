import { vi } from 'vitest'
import { handleToolCall } from '../handlers/tool-handlers.js'
import { listResources, readResource } from '../handlers/resource-handlers.js'
import { listPrompts, getPrompt } from '../handlers/prompt-handlers.js'
import * as httpClient from '../utils/http-client.js'

// Import the real constants from shared package
import { GAME_TYPES, DIFFICULTIES, isSupportedGameType, DEFAULT_PLAYER_NAME, DEFAULT_AI_DIFFICULTY } from '@turn-based-mcp/shared'

// Mock the web API calls for testing
vi.mock('../utils/http-client.js', () => ({
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  getGameViaAPI: vi.fn(),
  createGameViaAPI: vi.fn(),
  submitMoveViaAPI: vi.fn(),
  getGamesByType: vi.fn()
}))

// Mock only the game classes from shared library
vi.mock('@turn-based-mcp/shared', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    TicTacToeGame: vi.fn(() => ({
      getValidMoves: vi.fn(() => [{ row: 0, col: 0 }])
    })),
    RockPaperScissorsGame: vi.fn(() => ({}))
  }
})

// Mock AI modules
vi.mock('../ai/tic-tac-toe-ai.js', () => ({
  TicTacToeAI: vi.fn(() => ({
    makeMove: vi.fn(() => ({ row: 0, col: 0 }))
  }))
}))

vi.mock('../ai/rock-paper-scissors-ai.js', () => ({
  RockPaperScissorsAI: vi.fn(() => ({
    makeChoice: vi.fn(() => 'rock')
  }))
}))

describe('MCP Server Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Resource Handlers', () => {
    it('should list resources correctly', async () => {
      const mockGetGamesByType = vi.mocked(httpClient.getGamesByType)
      mockGetGamesByType.mockResolvedValue([
        {
          gameState: {
            id: 'test-game-1',
            status: 'playing',
            currentPlayerId: 'player1'
          }
        }
      ])

      const result = await listResources()
      
      expect(result.resources).toBeDefined()
      expect(result.resources.length).toBeGreaterThan(0)
      
      // Should include game type resources
      const gameTypeResources = result.resources.filter(r => 
        r.uri.match(/^game:\/\/[^\/]+$/)
      )
      expect(gameTypeResources.length).toBe(2) // tic-tac-toe, rock-paper-scissors
      
      // Should include individual game resources
      const individualGameResources = result.resources.filter(r => 
        r.uri.match(/^game:\/\/[^\/]+\/[^\/]+$/)
      )
      expect(individualGameResources.length).toBeGreaterThan(0)
    })

    it('should read game type resource correctly', async () => {
      const mockGetGamesByType = vi.mocked(httpClient.getGamesByType)
      mockGetGamesByType.mockResolvedValue([
        {
          gameState: {
            id: 'game-1',
            status: 'playing',
            currentPlayerId: 'player1',
            players: { player1: 'Human', ai: 'AI' }
          },
          aiDifficulty: 'medium'
        }
      ])

      const result = await readResource('game://tic-tac-toe')
      
      expect(result.contents).toBeDefined()
      expect(result.contents.length).toBe(1)
      
      const content = JSON.parse(result.contents[0].text)
      expect(content.gameType).toBe('tic-tac-toe')
      expect(content.games).toBeDefined()
      expect(content.totalGames).toBe(1)
    })

    it('should read individual game resource correctly', async () => {
      const mockGetGameViaAPI = vi.mocked(httpClient.getGameViaAPI)
      mockGetGameViaAPI.mockResolvedValue({
        gameState: {
          id: 'test-game-1',
          status: 'playing',
          currentPlayerId: 'player1'
        }
      })

      const result = await readResource('game://tic-tac-toe/test-game-1')
      
      expect(result.contents).toBeDefined()
      expect(result.contents.length).toBe(1)
      
      const content = JSON.parse(result.contents[0].text)
      expect(content.gameType).toBe('tic-tac-toe')
      expect(content.gameId).toBe('test-game-1')
      expect(content.gameSession).toBeDefined()
    })
  })

  describe('Tool Handlers', () => {
    it('should create tic-tac-toe game correctly', async () => {
      const mockCreateGameViaAPI = vi.mocked(httpClient.createGameViaAPI)
      mockCreateGameViaAPI.mockResolvedValue({
        gameState: {
          id: 'new-game-id',
          status: 'playing',
          players: { player1: 'Test Player', ai: 'AI' }
        }
      })

      const result = await handleToolCall('create_game', {
        gameType: 'tic-tac-toe'
      })
      
      expect(result.gameId).toBe('new-game-id')
      expect(result.message).toContain('Created new Tic-Tac-Toe game')
    })

    it('should handle play moves correctly', async () => {
      const mockGetGameViaAPI = vi.mocked(httpClient.getGameViaAPI)
      const mockSubmitMoveViaAPI = vi.mocked(httpClient.submitMoveViaAPI)
      
      mockGetGameViaAPI.mockResolvedValue({
        gameState: {
          id: 'test-game',
          status: 'playing',
          currentPlayerId: 'ai'
        },
        aiDifficulty: 'medium'
      })
      
      mockSubmitMoveViaAPI.mockResolvedValue({
        gameState: {
          id: 'test-game',
          status: 'playing',
          currentPlayerId: 'player1'
        }
      })

      const result = await handleToolCall('play_game', {
        gameId: 'test-game',
        gameType: 'tic-tac-toe'
      })
      
      expect(result.gameId).toBe('test-game')
      expect(result.aiMove).toBeDefined()
      expect(result.message).toContain('AI made move')
    })

    it('should handle invalid tool names', async () => {
      await expect(handleToolCall('invalid_tool', {}))
        .rejects.toThrow('Unknown tool: invalid_tool')
    })
  })

  describe('Prompt Handlers', () => {
    it('should list all prompts correctly', async () => {
      const result = await listPrompts()
      
      expect(result.prompts).toBeDefined()
      expect(Array.isArray(result.prompts)).toBe(true)
      expect(result.prompts.length).toBeGreaterThan(0)
      
      // Check for essential prompt categories
      const promptNames = result.prompts.map(p => p.name)
      expect(promptNames).toContain('tic_tac_toe_rules')
      expect(promptNames).toContain('getting_started')
      expect(promptNames).toContain('troubleshooting')
    })

    it('should get specific prompts correctly', async () => {
      const result = await getPrompt('tic_tac_toe_rules')
      
      expect(result.description).toBeDefined()
      expect(result.messages).toBeDefined()
      expect(Array.isArray(result.messages)).toBe(true)
      expect(result.messages.length).toBe(1)
      
      const message = result.messages[0]
      expect(message.role).toBe('user')
      expect(message.content.type).toBe('text')
      expect(message.content.text).toContain('Please explain how to play Tic-Tac-Toe')
    })

    it('should handle parameterized prompts', async () => {
      const result = await getPrompt('difficulty_strategy_guide', {
        gameType: 'tic-tac-toe',
        difficulty: 'hard'
      })
      
      expect(result.messages[0].content.text).toContain('Perfect play is required')
    })

    it('should handle invalid prompt names', async () => {
      await expect(getPrompt('invalid_prompt'))
        .rejects.toThrow('Prompt not found: invalid_prompt')
    })
  })
})
