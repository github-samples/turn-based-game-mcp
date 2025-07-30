import { NextRequest, NextResponse } from 'next/server'
import { TicTacToeGame } from '@turn-based-mcp/shared'
import type { GameMove } from '@turn-based-mcp/shared'
import type { TicTacToeMove } from '@turn-based-mcp/shared'
import { getTicTacToeGame, setTicTacToeGame } from '@turn-based-mcp/shared'

const ticTacToeGame = new TicTacToeGame()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { move, playerId } = await request.json()
    const { id: gameId } = await params
    
    const gameSession = await getTicTacToeGame(gameId)
    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    
    // Validate and apply the move
    if (!ticTacToeGame.validateMove(gameSession.gameState, move, playerId)) {
      return NextResponse.json(
        { error: 'Invalid move' },
        { status: 400 }
      )
    }
    
    // Apply player move
    let updatedGameState = ticTacToeGame.applyMove(gameSession.gameState, move, playerId)
    
    // Add move to history
    const playerMove: GameMove<TicTacToeMove> = {
      playerId,
      move,
      timestamp: new Date()
    }
    gameSession.history.push(playerMove)

    // Check if game ended
    const gameResult = ticTacToeGame.checkGameEnd(updatedGameState)
    if (gameResult) {
      updatedGameState = {
        ...updatedGameState,
        status: 'finished',
        winner: gameResult.winner
      }
    }
    
    // Note: AI moves are now handled externally via MCP server
    // The game will wait for the AI move to be made through a separate API call    // Update the stored game session
    gameSession.gameState = updatedGameState
    await setTicTacToeGame(gameId, gameSession)
    
    return NextResponse.json(gameSession)
  } catch (error) {
    console.error('Error processing move:', error)
    return NextResponse.json(
      { error: 'Failed to process move' },
      { status: 500 }
    )
  }
}
