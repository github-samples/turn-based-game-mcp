import { NextRequest, NextResponse } from 'next/server'
import { RockPaperScissorsGame } from '@turn-based-mcp/shared'
import type { GameMove } from '@turn-based-mcp/shared'
import type { RPSMove } from '@turn-based-mcp/shared'
import { getRPSGame, setRPSGame } from '../../../../../../lib/game-storage'

const rpsGame = new RockPaperScissorsGame()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { move, playerId } = await request.json()
    const { id: gameId } = await params
    
    const gameSession = await getRPSGame(gameId)
    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    
    // Validate and apply the move
    if (!rpsGame.validateMove(gameSession.gameState, move, playerId)) {
      return NextResponse.json(
        { error: 'Invalid move' },
        { status: 400 }
      )
    }
    
    // Apply player move
    let updatedGameState = rpsGame.applyMove(gameSession.gameState, move, playerId)
    
    // Add move to history
    const playerMove: GameMove<RPSMove> = {
      playerId,
      move,
      timestamp: new Date()
    }
    gameSession.history.push(playerMove)

    // Note: AI moves are now handled externally via MCP server
    // The game will wait for the AI move to be made through a separate API call    // Check if game ended
    const gameResult = rpsGame.checkGameEnd(updatedGameState)
    if (gameResult) {
      updatedGameState = {
        ...updatedGameState,
        status: 'finished',
        winner: gameResult.winner
      }
    }
    
    // Update the stored game session
    gameSession.gameState = updatedGameState
    await setRPSGame(gameId, gameSession)
    
    return NextResponse.json(gameSession)
  } catch (error) {
    console.error('Error processing move:', error)
    return NextResponse.json(
      { error: 'Failed to process move' },
      { status: 500 }
    )
  }
}
