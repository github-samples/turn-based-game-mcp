import { handleToolCall } from '../handlers/tool-handlers.js'
import { listResources, readResource } from '../handlers/resource-handlers.js'
import { listPrompts, getPrompt } from '../handlers/prompt-handlers.js'

// Mock the web API calls for testing
jest.mock('../utils/http-client.js', () => ({
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  getGameViaAPI: jest.fn(),
  createGameViaAPI: jest.fn(),
  submitMoveViaAPI: jest.fn(),
  getGamesByType: jest.fn()
}))

// Mock shared library
jest.mock('@turn-based-mcp/shared', () => ({
  TicTacToeGame: jest.fn(() => ({
    getValidMoves: jest.fn(() => [{ row: 0, col: 0 }])
  })),
  RockPaperScissorsGame: jest.fn(() => ({}))
}))

// Mock AI modules
jest.mock('../ai/tic-tac-toe-ai.js', () => ({
  TicTacToeAI: jest.fn(() => ({
    makeMove: jest.fn(() => ({ row: 0, col: 0 }))
  }))
}))

jest.mock('../ai/rock-paper-scissors-ai.js', () => ({
  RockPaperScissorsAI: jest.fn(() => ({
    makeChoice: jest.fn(() => 'rock')
  }))
}))

describe('MCP Server Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Resource Handlers', () => {
    it('should list resources correctly', async () => {
      const mockGetGamesByType = require('../utils/http-client.js').getGamesByType
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
      const mockGetGamesByType = require('../utils/http-client.js').getGamesByType
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
      const mockGetGameViaAPI = require('../utils/http-client.js').getGameViaAPI
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
      const mockCreateGameViaAPI = require('../utils/http-client.js').createGameViaAPI
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
      const mockGetGameViaAPI = require('../utils/http-client.js').getGameViaAPI
      const mockSubmitMoveViaAPI = require('../utils/http-client.js').submitMoveViaAPI
      
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
