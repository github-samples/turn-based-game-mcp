/**
 * MCP Tool handlers for game operations
 */

import { playGame, analyzeGame, waitForPlayerMove, createGame } from './game-operations.js'

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
]

/**
 * Handle tool execution
 */
export async function handleToolCall(name: string, args: any) {
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

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    throw error
  }
}
