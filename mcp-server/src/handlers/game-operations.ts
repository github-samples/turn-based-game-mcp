/**
 * Game operations for handling game-specific logic
 */

import { TicTacToeAI } from '../ai/tic-tac-toe-ai.js'
import { RockPaperScissorsAI } from '../ai/rock-paper-scissors-ai.js'
import { TicTacToeGame, RockPaperScissorsGame } from '@turn-based-mcp/shared'
import { getGameViaAPI, submitMoveViaAPI, createGameViaAPI } from '../utils/http-client.js'

// Initialize AI and game instances
const ticTacToeAI = new TicTacToeAI()
const rpsAI = new RockPaperScissorsAI()
const ticTacToeGame = new TicTacToeGame()
const rpsGame = new RockPaperScissorsGame()

/**
 * Helper function to read game resource
 */
export async function readGameResource(gameType: string, gameId: string) {
  const uri = `game://${gameType}/${gameId}`
  try {
    const gameSession = await getGameViaAPI(gameType, gameId)
    if (!gameSession) {
      throw new Error(`Game not found: ${uri}`)
    }
    return gameSession
  } catch (error) {
    throw new Error(`Failed to read game resource ${uri}: ${error}`)
  }
}

/**
 * Generic play game function
 */
export async function playGame(gameType: string, gameId: string) {
  // Get current game state via resource
  const gameSession = await readGameResource(gameType, gameId)
  
  // Use the difficulty stored in the game session, or fall back to medium
  const difficulty = gameSession.aiDifficulty || 'medium'
  
  // Check if it's AI's turn
  if (gameSession.gameState.currentPlayerId !== 'ai') {
    throw new Error(`It's not AI's turn. Current player: ${gameSession.gameState.currentPlayerId}`)
  }
  
  // Check if game is still playing
  if (gameSession.gameState.status !== 'playing') {
    throw new Error(`Game is not in playing state. Current status: ${gameSession.gameState.status}`)
  }
  
  let aiMove: any
  let moveDescription: string
  
  // Calculate AI move based on game type
  switch (gameType) {
    case 'tic-tac-toe':
      aiMove = await ticTacToeAI.makeMove(gameSession.gameState, difficulty as any)
      moveDescription = `AI made move at row ${aiMove.row + 1}, col ${aiMove.col + 1}`
      break
      
    case 'rock-paper-scissors':
      const aiChoice = await rpsAI.makeChoice(gameSession.gameState, difficulty as any)
      aiMove = { choice: aiChoice }
      moveDescription = `AI chose ${aiMove.choice}`
      break
      
    default:
      throw new Error(`Unsupported game type: ${gameType}`)
  }
  
  // Apply the move via API
  const updatedGameSession = await submitMoveViaAPI(gameType, gameId, aiMove, 'ai')
  
  // Format response based on game type
  const response: any = {
    gameId,
    gameType,
    difficulty,
    gameStatus: updatedGameSession.gameState.status,
    winner: updatedGameSession.gameState.winner || null,
    currentPlayer: updatedGameSession.gameState.currentPlayerId,
    message: moveDescription,
    gameState: updatedGameSession.gameState
  }
  
  // Add game-specific move details
  switch (gameType) {
    case 'tic-tac-toe':
      response.aiMove = { row: aiMove.row, col: aiMove.col }
      break
    case 'rock-paper-scissors':
      response.aiMove = aiMove
      break
  }
  
  // Add reminder if game is still playing
  if (updatedGameSession.gameState.status === 'playing') {
    response.message += '. REMINDER: Use wait_for_player_move tool to continue the game flow.'
  }
  
  return response
}

/**
 * Generic analyze game function
 */
export async function analyzeGame(gameType: string, gameId: string) {
  // Get current game state via resource
  const gameSession = await readGameResource(gameType, gameId)
  const gameState = gameSession.gameState
  const history = gameSession.history || []
  
  let analysis: any = {
    gameId,
    gameType,
    status: gameState.status,
    currentPlayer: gameState.currentPlayerId,
    winner: gameState.winner || null,
    totalMoves: history.length
  }
  
  let analysisText = `Game Analysis for ${gameType} (ID: ${gameId})\n\n`
  analysisText += `Status: ${gameState.status}\n`
  
  switch (gameType) {
    case 'tic-tac-toe':
      analysis.boardState = gameState.board
      analysis.playerSymbols = gameState.playerSymbols
      analysis.validMoves = gameState.status === 'playing' ? ticTacToeGame.getValidMoves(gameState, gameState.currentPlayerId) : []
      
      if (gameState.status === 'playing') {
        analysisText += `Current Turn: ${gameState.currentPlayerId} (${gameState.playerSymbols[gameState.currentPlayerId]})\n`
        analysisText += `Valid Moves: ${analysis.validMoves.length} available\n`
        
        // Board visualization
        analysisText += '\nCurrent Board:\n'
        for (let row = 0; row < 3; row++) {
          let rowStr = ''
          for (let col = 0; col < 3; col++) {
            const cell = gameState.board[row][col]
            rowStr += cell ? ` ${cell} ` : '   '
            if (col < 2) rowStr += '|'
          }
          analysisText += rowStr + '\n'
          if (row < 2) analysisText += '-----------\n'
        }
        
        analysisText += gameState.currentPlayerId === 'ai' 
          ? '\nIt\'s the AI\'s turn to move.' 
          : '\nWaiting for human player to make a move.'
      } else if (gameState.status === 'finished') {
        analysisText += `Winner: ${gameState.winner || 'Draw'}\n`
        analysisText += `Total moves played: ${history.length}\n`
      }
      break
      
    case 'rock-paper-scissors':
      analysis.currentRound = gameState.currentRound
      analysis.maxRounds = gameState.maxRounds
      analysis.scores = gameState.scores
      analysis.rounds = gameState.rounds
      
      analysisText += `Round: ${gameState.currentRound}/${gameState.maxRounds}\n`
      analysisText += `Scores: Player: ${gameState.scores.player1 || 0}, AI: ${gameState.scores.ai || 0}\n\n`
      
      if (gameState.status === 'playing') {
        analysisText += `Current Turn: ${gameState.currentPlayerId}\n`
        
        const currentRoundData = gameState.rounds[gameState.currentRound - 1]
        if (currentRoundData) {
          const player1HasChoice = !!currentRoundData.player1Choice
          const player2HasChoice = !!currentRoundData.player2Choice
          
          if (player1HasChoice && player2HasChoice) {
            analysisText += `Round ${gameState.currentRound} Choices:\n`
            analysisText += `- Player: ${currentRoundData.player1Choice}\n`
            analysisText += `- AI: ${currentRoundData.player2Choice}\n`
          } else {
            analysisText += `Round ${gameState.currentRound} Status:\n`
            if (player1HasChoice || player2HasChoice) {
              analysisText += `- Some players have made their choices\n`
            } else {
              analysisText += `- No choices made yet this round\n`
            }
          }
        }
        
        analysisText += gameState.currentPlayerId === 'ai'
          ? '\nIt\'s the AI\'s turn to make a choice.'
          : '\nWaiting for human player to make a choice.'
      } else if (gameState.status === 'finished') {
        analysisText += `Winner: ${gameState.winner || 'Draw'}\n`
        analysisText += `Total rounds played: ${gameState.rounds.length}\n`
        
        analysisText += `\nRound Results:\n`
        gameState.rounds.forEach((round: any, index: number) => {
          if (round.player1Choice && round.player2Choice) {
            analysisText += `Round ${index + 1}: Player (${round.player1Choice}) vs AI (${round.player2Choice}) - ${round.winner === 'draw' ? 'Draw' : `Winner: ${round.winner}`}\n`
          }
        })
      }
      break
      
    default:
      throw new Error(`Game type ${gameType} analysis not yet implemented`)
  }
  
  analysis.analysis = analysisText
  return analysis
}

/**
 * Wait for player move with polling
 */
export async function waitForPlayerMove(
  gameType: string, 
  gameId: string, 
  timeoutSeconds: number = 15, 
  pollInterval: number = 3
) {
  const gameTypeNames: { [key: string]: string } = {
    'tic-tac-toe': 'Tic-Tac-Toe',
    'rock-paper-scissors': 'Rock Paper Scissors'
  }
  
  const gameTypeName = gameTypeNames[gameType]
  if (!gameTypeName) {
    throw new Error(`Unsupported game type: ${gameType}`)
  }
  
  // Get initial game state via resource
  let currentGameSession = await readGameResource(gameType, gameId)
  
  // Check if game is finished
  if (currentGameSession.gameState.status === 'finished') {
    return {
      gameId,
      gameType,
      status: 'game_finished',
      message: `Game is already finished. Winner: ${currentGameSession.gameState.winner || 'Draw'}`,
      gameState: currentGameSession.gameState,
      winner: currentGameSession.gameState.winner || null
    }
  }
  
  // If it's not the human player's turn, no need to wait
  if (currentGameSession.gameState.currentPlayerId !== 'player1') {
    return {
      gameId,
      gameType,
      status: 'not_player_turn',
      message: `It's not the human player's turn. Current player: ${currentGameSession.gameState.currentPlayerId}`,
      gameState: currentGameSession.gameState,
      currentPlayer: currentGameSession.gameState.currentPlayerId
    }
  }
  
  // Store initial state for comparison
  const initialTimestamp = currentGameSession.gameState.updatedAt
  const startTime = Date.now()
  const maxWaitTime = timeoutSeconds * 1000
  const pollIntervalMs = pollInterval * 1000
  
  // Wait for human player move
  while (Date.now() - startTime < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
    
    // Check current game state via resource
    const updatedGameSession = await readGameResource(gameType, gameId)
    
    // Check if game state changed (human made a move)
    if (updatedGameSession.gameState.updatedAt !== initialTimestamp) {
      // Human made a move - return updated state
      return {
        gameId,
        gameType,
        status: 'move_detected',
        message: 'Human player made their move',
        gameState: updatedGameSession.gameState,
        currentPlayer: updatedGameSession.gameState.currentPlayerId,
        gameStatus: updatedGameSession.gameState.status,
        winner: updatedGameSession.gameState.winner || null,
        waitTime: (Date.now() - startTime) / 1000
      }
    }
    
    // Check if game was finished by external means
    if (updatedGameSession.gameState.status === 'finished') {
      return {
        gameId,
        gameType,
        status: 'game_finished',
        message: `Game finished during wait. Winner: ${updatedGameSession.gameState.winner || 'Draw'}`,
        gameState: updatedGameSession.gameState,
        winner: updatedGameSession.gameState.winner || null,
        waitTime: (Date.now() - startTime) / 1000
      }
    }
  }
  
  // Timeout occurred
  return {
    gameId,
    gameType,
    status: 'timeout',
    message: `Timed out waiting for human player move after ${timeoutSeconds} seconds`,
    gameState: currentGameSession.gameState,
    currentPlayer: currentGameSession.gameState.currentPlayerId,
    waitTime: timeoutSeconds
  }
}

/**
 * Create a new game
 */
export async function createGame(
  gameType: string, 
  playerName: string = 'Player', 
  gameId?: string, 
  aiDifficulty: string = 'medium'
) {
  // Check if game already exists (for games that support custom IDs)
  if (gameId && gameType === 'tic-tac-toe') {
    try {
      const existingGame = await readGameResource(gameType, gameId)
      if (existingGame) {
        const response: any = {
          gameId,
          gameType,
          message: `Found existing ${gameType} game with ID: ${gameId}`,
          gameState: existingGame.gameState,
          players: existingGame.gameState.players,
        }
        
        return response
      }
    } catch (error) {
      // Game doesn't exist, continue with creation
    }
  }
  
  // Create new game via API
  const gameSession = await createGameViaAPI(gameType, playerName, gameId, aiDifficulty)
  
  const response: any = {
    gameId: gameSession.gameState.id,
    gameType,
    gameState: gameSession.gameState,
    players: gameSession.gameState.players,
  }
  
  switch (gameType) {
    case 'tic-tac-toe':
      response.message = `Created new Tic-Tac-Toe game with ID: ${gameSession.gameState.id}`
      break
    case 'rock-paper-scissors':
      response.message = `Created new Rock Paper Scissors game with ID: ${gameSession.gameState.id}`
      break
  }
  
  return response
}
