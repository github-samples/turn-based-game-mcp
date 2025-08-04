/**
 * MCP Tool handlers for game operations
 */

import { playGame, analyzeGame, waitForPlayerMove, createGame } from './game-operations.js'
import { elicitGameCreationPreferences } from './elicitation-handlers.js'

export const TOOL_DEFINITIONS = [
  {
    name: 'play_tic_tac_toe',
    description: 'Make an AI move in Tic-Tac-Toe game. IMPORTANT: After calling this tool when the game is still playing, you MUST call wait_for_player_move to continue the game flow.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'The ID of the Tic-Tac-Toe game to play',
        },
      },
      required: ['gameId'],
    },
  },
  {
    name: 'play_rock_paper_scissors',
    description: 'Make an AI choice in Rock Paper Scissors game. IMPORTANT: After calling this tool when the game is still playing, you MUST call wait_for_player_move to continue the game flow.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'The ID of the Rock Paper Scissors game to play',
        },
      },
      required: ['gameId'],
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
          enum: ['tic-tac-toe', 'rock-paper-scissors'],
          description: 'Type of game to analyze',
        },
      },
      required: ['gameId', 'gameType'],
    },
  },
  {
    name: 'wait_for_player_move',
    description: 'Wait for human player to make their move after AI has played. This tool should be called after any play_* tool when the game is still ongoing.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'The ID of the game to monitor',
        },
        gameType: {
          type: 'string',
          enum: ['tic-tac-toe', 'rock-paper-scissors'],
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
    name: 'create_tic_tac_toe_game',
    description: 'Create a new Tic-Tac-Toe game with optional custom game ID',
    inputSchema: {
      type: 'object',
      properties: {
        playerName: {
          type: 'string',
          description: 'Name of the human player',
          default: 'Player',
        },
        gameId: {
          type: 'string',
          description: 'Optional custom game ID. If not provided, a random UUID will be generated.',
        },
        aiDifficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          description: 'AI difficulty level',
          default: 'medium',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_rock_paper_scissors_game',
    description: 'Create a new Rock Paper Scissors game',
    inputSchema: {
      type: 'object',
      properties: {
        playerName: {
          type: 'string',
          description: 'Name of the human player',
          default: 'Player',
        },
        aiDifficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          description: 'AI difficulty level',
          default: 'medium',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_tic_tac_toe_game_interactive',
    description: 'Create a new Tic-Tac-Toe game with interactive setup. This will ask you for preferences like difficulty and symbol choice.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'Optional custom game ID. If not provided, a random UUID will be generated.',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_rock_paper_scissors_game_interactive',
    description: 'Create a new Rock Paper Scissors game with interactive setup. This will ask you for preferences like difficulty and number of rounds.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

/**
 * Handle tool execution
 */
export async function handleToolCall(name: string, args: any, server?: any) {
  try {
    switch (name) {
      case 'play_tic_tac_toe':
        const { gameId: ticTacToeGameId } = args
        if (!ticTacToeGameId) {
          throw new Error('gameId is required')
        }
        return await playGame('tic-tac-toe', ticTacToeGameId)

      case 'play_rock_paper_scissors':
        const { gameId: rpsGameId } = args
        if (!rpsGameId) {
          throw new Error('gameId is required')
        }
        return await playGame('rock-paper-scissors', rpsGameId)

      case 'analyze_game':
        const { gameId: analyzeGameId, gameType: analyzeGameType } = args
        if (!analyzeGameId) {
          throw new Error('gameId is required')
        }
        if (!analyzeGameType) {
          throw new Error('gameType is required')
        }
        return await analyzeGame(analyzeGameType, analyzeGameId)

      case 'wait_for_player_move':
        const { 
          gameId: waitGameId, 
          gameType: waitGameType, 
          timeoutSeconds = 15, 
          pollInterval = 3 
        } = args
        if (!waitGameId) {
          throw new Error('gameId is required')
        }
        if (!waitGameType) {
          throw new Error('gameType is required')
        }
        return await waitForPlayerMove(waitGameType, waitGameId, timeoutSeconds, pollInterval)

      case 'create_tic_tac_toe_game':
        const { 
          playerName: ticTacToePlayerName = 'Player', 
          gameId: ticTacToeNewGameId, 
          aiDifficulty: ticTacToeAiDifficulty = 'medium' 
        } = args
        return await createGame('tic-tac-toe', ticTacToePlayerName, ticTacToeNewGameId, ticTacToeAiDifficulty)

      case 'create_rock_paper_scissors_game':
        const { 
          playerName: rpsPlayerName = 'Player', 
          aiDifficulty: rpsAiDifficulty = 'medium' 
        } = args
        return await createGame('rock-paper-scissors', rpsPlayerName, undefined, rpsAiDifficulty)

      case 'create_tic_tac_toe_game_interactive':
        const { gameId: interactiveTTTGameId } = args
        return await createGameInteractive('tic-tac-toe', interactiveTTTGameId, server)

      case 'create_rock_paper_scissors_game_interactive':
        return await createGameInteractive('rock-paper-scissors', undefined, server)

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    throw error
  }
}

/**
 * Create game with interactive elicitation
 */
async function createGameInteractive(gameType: string, gameId?: string, server?: any) {
  if (!server) {
    // Fallback to regular creation if no server for elicitation
    return await createGame(gameType, 'Player', gameId, 'medium')
  }

  try {
    // Elicit user preferences
    const elicitationResult = await elicitGameCreationPreferences(server, gameType, {
      gameId,
      playerName: 'Player',
      aiDifficulty: 'medium'
    })

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
      const finalPlayerName = playerName || 'Player'
      const finalDifficulty = difficulty || 'medium'
      
      // Create the game with elicited preferences
      const gameResult = await createGame(gameType, finalPlayerName, gameId, finalDifficulty)
      
      // Add elicitation information to the response
      gameResult.elicitation = {
        preferences: elicitationResult.content,
        message: '🎮 Game created with your custom preferences!'
      }
      
      // Add game-specific messages
      if (gameType === 'tic-tac-toe' && playerSymbol) {
        gameResult.message += ` You are playing as ${playerSymbol}.`
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
  return await createGame(gameType, 'Player', gameId, 'medium')
}
