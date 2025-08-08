/**
 * Tests for elicitation handlers
 * 
 * These tests ensure that elicitation is properly triggered when game creation
 * parameters are missing, and skipped when all required details are provided.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  elicitGameCreationPreferences,
  elicitMidGameDecision,
  elicitGameCompletionFeedback,
  elicitStrategyPreference,
  elicitErrorRecovery,
  type ElicitationResult
} from './elicitation-handlers'
import { DIFFICULTIES, DEFAULT_PLAYER_NAME, DEFAULT_AI_DIFFICULTY, GAME_TYPES } from '@turn-based-mcp/shared'

// Mock server for elicitInput calls
const mockServer = {
  elicitInput: vi.fn()
}

describe('Elicitation Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('elicitGameCreationPreferences', () => {
    describe('Tic-Tac-Toe Game', () => {
      const gameType = 'tic-tac-toe'

      it('should skip elicitation when all required details are provided', async () => {
        const existingArgs = {
          difficulty: 'medium' as const,
          playerSymbol: 'X' as const,
          playerName: 'TestPlayer'
        }

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).not.toHaveBeenCalled()
        expect(result.action).toBe('accept')
        expect(result.content).toEqual(existingArgs)
      })

      it('should trigger elicitation for optional parameters when only required difficulty is provided', async () => {
        const existingArgs = {
          difficulty: 'hard' as const
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { playerSymbol: 'O', playerName: 'OptionalPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        
        // Verify that the schema only includes missing optional properties
        const calledWith = mockServer.elicitInput.mock.calls[0][0]
        expect(calledWith.requestedSchema.properties).not.toHaveProperty('difficulty')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerSymbol')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerName')
        expect(calledWith.requestedSchema.required).toEqual([]) // No required properties left

        // Result should merge existing args with elicitation response
        expect(result.content).toEqual({
          difficulty: 'hard',
          playerSymbol: 'O',
          playerName: 'OptionalPlayer'
        })
      })

      it('should trigger elicitation when no details are provided', async () => {
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { difficulty: 'easy', playerSymbol: 'O', playerName: 'NewPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        expect(mockServer.elicitInput).toHaveBeenCalledWith({
          message: expect.stringContaining("Let's set up your tic tac-toe game!"),
          requestedSchema: expect.objectContaining({
            type: 'object',
            properties: expect.objectContaining({
              difficulty: expect.objectContaining({
                type: 'string',
                enum: DIFFICULTIES
              }),
              playerSymbol: expect.objectContaining({
                type: 'string',
                enum: ['X', 'O']
              }),
              playerName: expect.objectContaining({
                type: 'string'
              })
            }),
            required: ['difficulty']
          })
        })
        expect(result).toEqual(elicitationResponse)
      })

      it('should trigger elicitation when some optional details are missing', async () => {
        const existingArgs = {
          playerName: 'PartialPlayer'
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept', 
          content: { difficulty: 'medium' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        
        // Verify that the schema only includes missing properties
        const calledWith = mockServer.elicitInput.mock.calls[0][0]
        expect(calledWith.requestedSchema.properties).not.toHaveProperty('playerName')
        expect(calledWith.requestedSchema.properties).toHaveProperty('difficulty')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerSymbol')
        
        // Result should merge existing args with elicitation response
        expect(result.content).toEqual({
          playerName: 'PartialPlayer',
          difficulty: 'medium'
        })
      })

      it('should handle elicitation failure gracefully', async () => {
        const error = new Error('Elicitation failed')
        mockServer.elicitInput.mockRejectedValue(error)

        const result = await elicitGameCreationPreferences(mockServer, gameType)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        expect(result.action).toBe('accept')
        expect(result.content).toEqual({
          difficulty: DEFAULT_AI_DIFFICULTY,
          playerName: DEFAULT_PLAYER_NAME,
          playerSymbol: 'X'
        })
      })

      it('should filter out empty string values from existing args', async () => {
        const existingArgs = {
          difficulty: '',
          playerSymbol: 'X',
          playerName: ''
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { difficulty: 'hard', playerName: 'FilledPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        
        // Should elicit difficulty and playerName but not playerSymbol
        const calledWith = mockServer.elicitInput.mock.calls[0][0]
        expect(calledWith.requestedSchema.properties).toHaveProperty('difficulty')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerName')
        expect(calledWith.requestedSchema.properties).not.toHaveProperty('playerSymbol')

        expect(result.content).toEqual({
          difficulty: 'hard',
          playerSymbol: 'X',
          playerName: 'FilledPlayer'
        })
      })
    })

    describe('Rock-Paper-Scissors Game', () => {
      const gameType = 'rock-paper-scissors'

      it('should skip elicitation when all details are provided', async () => {
        const existingArgs = {
          difficulty: 'hard' as const,
          maxRounds: 5,
          playerName: 'RPSPlayer'
        }

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).not.toHaveBeenCalled()
        expect(result.action).toBe('accept')
        expect(result.content).toEqual(existingArgs)
      })

      it('should trigger elicitation for optional parameters when only required difficulty is provided', async () => {
        const existingArgs = {
          difficulty: 'easy' as const
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { maxRounds: 5, playerName: 'OptionalRPSPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        
        // Verify that the schema only includes missing optional properties
        const calledWith = mockServer.elicitInput.mock.calls[0][0]
        expect(calledWith.requestedSchema.properties).not.toHaveProperty('difficulty')
        expect(calledWith.requestedSchema.properties).toHaveProperty('maxRounds')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerName')
        expect(calledWith.requestedSchema.required).toEqual([]) // No required properties left

        // Result should merge existing args with elicitation response
        expect(result.content).toEqual({
          difficulty: 'easy',
          maxRounds: 5,
          playerName: 'OptionalRPSPlayer'
        })
      })

      it('should trigger elicitation when no details are provided', async () => {
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { difficulty: 'medium', maxRounds: 3, playerName: 'RPSNewPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        expect(mockServer.elicitInput).toHaveBeenCalledWith({
          message: expect.stringContaining("Let's set up your rock paper-scissors game!"),
          requestedSchema: expect.objectContaining({
            type: 'object',
            properties: expect.objectContaining({
              difficulty: expect.objectContaining({
                type: 'string',
                enum: DIFFICULTIES
              }),
              maxRounds: expect.objectContaining({
                type: 'number',
                minimum: 1,
                maximum: 10
              }),
              playerName: expect.objectContaining({
                type: 'string'
              })
            }),
            required: ['difficulty']
          })
        })
        expect(result).toEqual(elicitationResponse)
      })

      it('should trigger elicitation when some optional details are missing', async () => {
        const existingArgs = {
          maxRounds: 7
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { difficulty: 'hard', playerName: 'PartialRPSPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()

        // Verify that the schema only includes missing properties
        const calledWith = mockServer.elicitInput.mock.calls[0][0]
        expect(calledWith.requestedSchema.properties).not.toHaveProperty('maxRounds')
        expect(calledWith.requestedSchema.properties).toHaveProperty('difficulty')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerName')

        // Result should merge existing args with elicitation response
        expect(result.content).toEqual({
          maxRounds: 7,
          difficulty: 'hard',
          playerName: 'PartialRPSPlayer'
        })
      })

      it('should handle elicitation failure gracefully', async () => {
        const error = new Error('Network error')
        mockServer.elicitInput.mockRejectedValue(error)

        const result = await elicitGameCreationPreferences(mockServer, gameType)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        expect(result.action).toBe('accept')
        expect(result.content).toEqual({
          difficulty: DEFAULT_AI_DIFFICULTY,
          playerName: DEFAULT_PLAYER_NAME,
          maxRounds: 3
        })
      })

      it('should trigger elicitation for missing parameters when some args are null/undefined', async () => {
        const existingArgs = {
          difficulty: 'medium' as const,
          maxRounds: null,
          playerName: undefined
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { maxRounds: 4, playerName: 'FilledPlayer' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, gameType, existingArgs)

        expect(mockServer.elicitInput).toHaveBeenCalledOnce()
        
        // Should elicit maxRounds and playerName since they're null/undefined
        const calledWith = mockServer.elicitInput.mock.calls[0][0]
        expect(calledWith.requestedSchema.properties).not.toHaveProperty('difficulty')
        expect(calledWith.requestedSchema.properties).toHaveProperty('maxRounds')
        expect(calledWith.requestedSchema.properties).toHaveProperty('playerName')

        expect(result.content).toEqual({
          difficulty: 'medium',
          maxRounds: 4,
          playerName: 'FilledPlayer'
        })
      })
    })

    describe('Invalid Game Type', () => {
      it('should throw error for unsupported game type', async () => {
        const invalidGameType = 'checkers'

        await expect(
          elicitGameCreationPreferences(mockServer, invalidGameType)
        ).rejects.toThrow('No elicitation schema defined for game type: checkers')

        expect(mockServer.elicitInput).not.toHaveBeenCalled()
      })
    })

    describe('Edge Cases', () => {
      it('should handle user cancellation gracefully', async () => {
        const elicitationResponse: ElicitationResult = {
          action: 'cancel'
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, 'tic-tac-toe')

        expect(result.action).toBe('cancel')
        expect(result.content).toBeUndefined()
      })

      it('should handle user decline gracefully', async () => {
        const elicitationResponse: ElicitationResult = {
          action: 'decline'
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, 'rock-paper-scissors')

        expect(result.action).toBe('decline')
        expect(result.content).toBeUndefined()
      })

      it('should preserve existing args when user accepts partial input', async () => {
        const existingArgs = {
          playerName: 'ExistingPlayer',
          difficulty: undefined // This should be elicited
        }
        const elicitationResponse: ElicitationResult = {
          action: 'accept',
          content: { difficulty: 'easy' }
        }
        mockServer.elicitInput.mockResolvedValue(elicitationResponse)

        const result = await elicitGameCreationPreferences(mockServer, 'tic-tac-toe', existingArgs)

        expect(result.content).toEqual({
          playerName: 'ExistingPlayer',
          difficulty: 'easy'
        })
      })
    })
  })

  describe('elicitMidGameDecision', () => {
    it('should create proper schema for mid-game decisions', async () => {
      const context = {
        gameType: 'tic-tac-toe',
        gameId: 'game123',
        situation: 'The AI is about to win!',
        options: [
          { value: 'continue', label: 'Keep Playing' },
          { value: 'hint', label: 'Get a Hint', description: 'Show me the best move' },
          { value: 'restart', label: 'Restart Game' }
        ]
      }
      const elicitationResponse: ElicitationResult = {
        action: 'accept',
        content: { choice: 'hint', feedback: 'This is challenging!' }
      }
      mockServer.elicitInput.mockResolvedValue(elicitationResponse)

      const result = await elicitMidGameDecision(mockServer, context)

      expect(mockServer.elicitInput).toHaveBeenCalledWith({
        message: expect.stringContaining('tic tac-toe Game Decision'),
        requestedSchema: expect.objectContaining({
          type: 'object',
          properties: expect.objectContaining({
            choice: expect.objectContaining({
              type: 'string',
              enum: ['continue', 'hint', 'restart'],
              enumNames: ['Keep Playing', 'Get a Hint', 'Restart Game']
            }),
            feedback: expect.objectContaining({
              type: 'string'
            })
          }),
          required: ['choice']
        })
      })
      expect(result).toEqual(elicitationResponse)
    })

    it('should handle elicitation failure with default choice', async () => {
      const context = {
        gameType: 'rock-paper-scissors',
        gameId: 'rps456',
        situation: 'Choose your strategy',
        options: [
          { value: 'aggressive', label: 'Aggressive Play' },
          { value: 'defensive', label: 'Defensive Play' }
        ]
      }
      mockServer.elicitInput.mockRejectedValue(new Error('Failed'))

      const result = await elicitMidGameDecision(mockServer, context)

      expect(result.action).toBe('accept')
      expect(result.content).toEqual({ choice: 'aggressive' })
    })
  })

  describe('elicitGameCompletionFeedback', () => {
    it('should create proper schema for game completion feedback', async () => {
      const context = {
        gameType: 'tic-tac-toe',
        gameId: 'game789',
        result: 'win' as const,
        difficulty: 'hard'
      }
      const elicitationResponse: ElicitationResult = {
        action: 'accept',
        content: {
          difficultyFeedback: 'just_right',
          playAgain: true,
          gameTypeForNext: 'rock-paper-scissors',
          comments: 'Great game!'
        }
      }
      mockServer.elicitInput.mockResolvedValue(elicitationResponse)

      const result = await elicitGameCompletionFeedback(mockServer, context)

      expect(mockServer.elicitInput).toHaveBeenCalledWith({
        message: expect.stringContaining('🎉 Congratulations! You won!'),
        requestedSchema: expect.objectContaining({
          type: 'object',
          properties: expect.objectContaining({
            difficultyFeedback: expect.objectContaining({
              type: 'string',
              enum: ['too_easy', 'just_right', 'too_hard']
            }),
            playAgain: expect.objectContaining({
              type: 'boolean'
            }),
            gameTypeForNext: expect.objectContaining({
              type: 'string',
              enum: ['same', ...GAME_TYPES]
            })
          }),
          required: ['difficultyFeedback', 'playAgain']
        })
      })
      expect(result).toEqual(elicitationResponse)
    })

    it('should handle different result types with correct messages', async () => {
      const contexts = [
        { result: 'loss' as const, expectedMessage: '😅 Good game! The AI won this time.' },
        { result: 'draw' as const, expectedMessage: '🤝 It\'s a draw! Well played by both sides.' }
      ]

      for (const { result, expectedMessage } of contexts) {
        mockServer.elicitInput.mockResolvedValue({ action: 'accept', content: {} })

        await elicitGameCompletionFeedback(mockServer, {
          gameType: 'rock-paper-scissors',
          gameId: 'test',
          result,
          difficulty: 'medium'
        })

        expect(mockServer.elicitInput).toHaveBeenCalledWith({
          message: expect.stringContaining(expectedMessage),
          requestedSchema: expect.any(Object)
        })

        mockServer.elicitInput.mockClear()
      }
    })
  })

  describe('elicitStrategyPreference', () => {
    it('should create proper schema for strategy preferences', async () => {
      const context = {
        gameType: 'tic-tac-toe',
        gameId: 'strategy123',
        availableHints: ['basic', 'advanced'],
        currentSituation: 'You have a winning move available'
      }
      const elicitationResponse: ElicitationResult = {
        action: 'accept',
        content: { wantHint: true, hintType: 'intermediate', explainMoves: true }
      }
      mockServer.elicitInput.mockResolvedValue(elicitationResponse)

      const result = await elicitStrategyPreference(mockServer, context)

      expect(mockServer.elicitInput).toHaveBeenCalledWith({
        message: expect.stringContaining('Strategy Assistance Available'),
        requestedSchema: expect.objectContaining({
          properties: expect.objectContaining({
            wantHint: expect.objectContaining({ type: 'boolean' }),
            hintType: expect.objectContaining({
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced']
            })
          }),
          required: ['wantHint']
        })
      })
      expect(result).toEqual(elicitationResponse)
    })
  })

  describe('elicitErrorRecovery', () => {
    it('should create proper schema for error recovery', async () => {
      const context = {
        gameType: 'rock-paper-scissors',
        gameId: 'error123',
        error: 'Invalid move detected',
        recoveryOptions: [
          { value: 'retry', label: 'Try Again', description: 'Attempt the move again' },
          { value: 'reset', label: 'Reset Game', description: 'Start over from the beginning' }
        ]
      }
      const elicitationResponse: ElicitationResult = {
        action: 'accept',
        content: { action: 'retry', reportIssue: true }
      }
      mockServer.elicitInput.mockResolvedValue(elicitationResponse)

      const result = await elicitErrorRecovery(mockServer, context)

      expect(mockServer.elicitInput).toHaveBeenCalledWith({
        message: expect.stringContaining('⚠️ **rock paper-scissors Game Issue**'),
        requestedSchema: expect.objectContaining({
          properties: expect.objectContaining({
            action: expect.objectContaining({
              type: 'string',
              enum: ['retry', 'reset'],
              enumNames: ['Try Again', 'Reset Game']
            }),
            reportIssue: expect.objectContaining({ type: 'boolean' })
          }),
          required: ['action']
        })
      })
      expect(result).toEqual(elicitationResponse)
    })

    it('should handle elicitation failure with default recovery option', async () => {
      const context = {
        gameType: 'tic-tac-toe',
        gameId: 'error456',
        error: 'Network timeout',
        recoveryOptions: [
          { value: 'reconnect', label: 'Reconnect', description: 'Try to reconnect' }
        ]
      }
      mockServer.elicitInput.mockRejectedValue(new Error('Failed'))

      const result = await elicitErrorRecovery(mockServer, context)

      expect(result.action).toBe('accept')
      expect(result.content).toEqual({
        action: 'reconnect',
        reportIssue: false
      })
    })
  })
})
