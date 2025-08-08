/**
 * MCP Tool handlers for game operations
 */

import { playGame, analyzeGame, waitForPlayerMove, createGame } from './game-operations.js'
import { elicitGameCreationPreferences } from './elicitation-handlers.js'
import { GAME_TYPES, DIFFICULTIES, isSupportedGameType, DEFAULT_PLAYER_NAME, DEFAULT_AI_DIFFICULTY } from '@turn-based-mcp/shared'

export const TOOL_DEFINITIONS = [
  {
    name: 'play_game',
    description: 'Make an AI move in a game. IMPORTANT: After calling this tool when the game is still playing, you MUST call wait_for_player_move to continue the game flow.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'The ID of the game to play',
        },
        gameType: {
          type: 'string',
          enum: GAME_TYPES,
          description: 'Type of game to play',
        },
      },
      required: ['gameId', 'gameType'],
    },
  },
  {
    name: 'analyze_game',
    description: 'Analyze the current game state and provide insights',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'The ID of the game to analyze',
        },
        gameType: {
          type: 'string',
          enum: GAME_TYPES,
          description: 'Type of game to analyze',
        },
      },
      required: ['gameId', 'gameType'],
    },
  },
  {
    name: 'wait_for_player_move',
    description: 'Wait for human player to make their move after AI has played. This tool should be called after the play_game tool when the game is still ongoing.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'The ID of the game to monitor',
        },
        gameType: {
          type: 'string',
          enum: GAME_TYPES,
          description: 'Type of game to monitor',
        },
        timeoutSeconds: {
          type: 'number',
          description: 'Maximum time to wait for player move in seconds',
          default: 15,
        },
        pollInterval: {
          type: 'number',
          description: 'How often to check for moves in seconds',
          default: 3,
        },
      },
      required: ['gameId', 'gameType'],
    },
  },
  {
    name: 'create_game',
    description: 'Create a new game with interactive setup. This will ask you for preferences like difficulty, player options, and other game-specific settings. IMPORTANT: Only provide parameters that the user explicitly specified. DO NOT provide default values for optional parameters - missing parameters will trigger interactive elicitation.',
    inputSchema: {
      type: 'object',
      properties: {
        gameType: {
          type: 'string',
          enum: GAME_TYPES,
          description: 'Type of game to create'
        },
        gameId: {
          type: 'string',
          description: 'Optional custom game ID. If not provided, a random UUID will be generated.'
        },
        difficulty: {
          type: 'string',
          enum: DIFFICULTIES,
          description: 'AI difficulty level (easy, medium, hard). If not provided, will be asked during setup.'
        },
        playerName: {
          type: 'string',
          description: 'Your name in the game. LEAVE EMPTY to trigger interactive setup - do not provide defaults like "Player" or "User".'
        },
        playerSymbol: {
          type: 'string',
          enum: ['X', 'O'],
          description: 'For tic-tac-toe: your symbol (X goes first, O goes second). LEAVE EMPTY to trigger interactive setup - do not auto-select X.'
        },
        maxRounds: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'For rock-paper-scissors: number of rounds to play. If not provided, will be asked during setup.'
        }
      },
      required: ['gameType']
    }
  },
]

/**
 * Handle tool execution
 */
// Match the SDK server's elicitInput signature loosely to avoid incompatibility issues.
export interface ServerWithElicit {
  // Allow extra properties on args to accommodate SDK's added metadata fields.
  elicitInput: (args: { message: string; requestedSchema: unknown; [k: string]: unknown }) => Promise<{ action: 'accept' | 'decline' | 'cancel'; content?: Record<string, unknown> }>
}

export async function handleToolCall(name: string, args: Record<string, unknown>, server?: ServerWithElicit): Promise<unknown> {
    switch (name) {
      case 'play_game': {
        const { gameId: playGameId, gameType: playGameType } = args as { gameId?: string; gameType?: string }
        if (!playGameId) {
          throw new Error('gameId is required')
        }
        if (!playGameType) {
          throw new Error('gameType is required')
        }
        if (!isSupportedGameType(playGameType)) {
          throw new Error(`Unsupported game type: ${playGameType}`)
        }
        return await playGame(playGameType, playGameId)
      }
      case 'analyze_game': {
        const { gameId: analyzeGameId, gameType: analyzeGameType } = args as { gameId?: string; gameType?: string }
        if (!analyzeGameId) {
          throw new Error('gameId is required')
        }
        if (!analyzeGameType) {
          throw new Error('gameType is required')
        }
        return await analyzeGame(analyzeGameType, analyzeGameId)
      }
      case 'wait_for_player_move': {
        const { 
          gameId: waitGameId, 
          gameType: waitGameType, 
          timeoutSeconds = 15, 
          pollInterval = 3 
        } = args as { gameId?: string; gameType?: string; timeoutSeconds?: number; pollInterval?: number }
        if (!waitGameId) {
          throw new Error('gameId is required')
        }
        if (!waitGameType) {
          throw new Error('gameType is required')
        }
        return await waitForPlayerMove(waitGameType, waitGameId, timeoutSeconds, pollInterval)
      }
      case 'create_game': {
        const { gameType: genericGameType, gameId: genericGameId } = args as { gameType?: string; gameId?: string }
        if (!genericGameType) {
          throw new Error('gameType is required')
        }
        if (!isSupportedGameType(genericGameType)) {
          throw new Error(`Unsupported game type: ${genericGameType}`)
        }
        return await createGameWithElicitation(genericGameType, genericGameId, server, args)
      }
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
}

/**
 * Create game with interactive elicitation
 */
async function createGameWithElicitation(gameType: string, gameId?: string, server?: ServerWithElicit, toolArgs?: Record<string, unknown>): Promise<unknown> {
  if (!server) {
    // Fallback to regular creation if no server for elicitation
    return await createGame(gameType, DEFAULT_PLAYER_NAME, gameId, DEFAULT_AI_DIFFICULTY)
  }

  try {
  // Validate toolArgs properties before passing them
  const elicitationOptions: Record<string, unknown> = { gameId };
  if (toolArgs) {
    if (typeof toolArgs.playerName === 'string') {
      elicitationOptions.playerName = toolArgs.playerName;
    }
    if (typeof toolArgs.difficulty === 'string') {
      elicitationOptions.difficulty = toolArgs.difficulty;
    }
    if (typeof toolArgs.playerSymbol === 'string') {
      elicitationOptions.playerSymbol = toolArgs.playerSymbol;
    }
    if (typeof toolArgs.maxRounds === 'number') {
      elicitationOptions.maxRounds = toolArgs.maxRounds;
    }
  }
  const elicitationResult = await elicitGameCreationPreferences(server, gameType, elicitationOptions)

    if (elicitationResult.action === 'decline' || elicitationResult.action === 'cancel') {
      return {
        gameId: null,
        gameType,
        message: `🚫 Game creation ${elicitationResult.action}d by user`,
        status: 'cancelled',
        action: elicitationResult.action
      }
    }

    if (elicitationResult.action === 'accept' && elicitationResult.content) {
  const { difficulty, playerName, playerSymbol, maxRounds } = elicitationResult.content
      
      // Prepare game creation parameters
  const finalPlayerName = (playerName as string) || 'Player'
  const finalDifficulty = (difficulty as string) || 'medium'
      
      // Prepare game-specific options
  const gameSpecificOptions: Record<string, unknown> = {}
      if (gameType === 'tic-tac-toe' && playerSymbol) {
        gameSpecificOptions.playerSymbol = playerSymbol
      }
      if (gameType === 'rock-paper-scissors' && maxRounds) {
        gameSpecificOptions.maxRounds = maxRounds
      }
      
      // Create the game with elicited preferences
  const gameResult = await createGame(gameType, finalPlayerName, gameId, finalDifficulty, gameSpecificOptions)
      
      // Add elicitation information to the response
      gameResult.elicitation = {
        preferences: elicitationResult.content,
        message: '🎮 Game created with your custom preferences!'
      }
      
      // Add game-specific messages
      if (gameType === 'tic-tac-toe' && playerSymbol) {
        gameResult.message += ` You are playing as ${playerSymbol}.`
        if (playerSymbol === 'X') {
          gameResult.message += ' You go first!'
        } else {
          gameResult.message += ' AI goes first!'
        }
      }
      if (gameType === 'rock-paper-scissors' && maxRounds) {
        gameResult.message += ` Playing ${maxRounds} rounds.`
      }
      
      return gameResult
    }
  } catch (error) {
    console.warn('Interactive game creation failed, falling back to defaults:', error)
  }
  
  // Fallback to regular creation
  return await createGame(gameType, DEFAULT_PLAYER_NAME, gameId, DEFAULT_AI_DIFFICULTY)
}
