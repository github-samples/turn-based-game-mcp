import { NextRequest, NextResponse } from 'next/server'
import { RockPaperScissorsGame } from '@turn-based-mcp/shared'
import type { GameSession, Player } from '@turn-based-mcp/shared'
import type { RPSGameState } from '@turn-based-mcp/shared'
import { setRPSGame, getAllRPSGames, deleteRPSGame } from '../../../../lib/game-storage'

const rpsGame = new RockPaperScissorsGame()

export async function POST(request: NextRequest) {
  try {
    const { playerName, gameId, aiDifficulty } = await request.json()
    
    const players: Player[] = [
      { id: 'player1', name: playerName || 'Player', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ]
    
    const gameState = rpsGame.getInitialState(players)
    
    // Use custom gameId if provided
    if (gameId) {
      gameState.id = gameId
    }
    
    const gameSession: GameSession<RPSGameState> = {
      gameState,
      gameType: 'rock-paper-scissors',
      history: [],
      aiDifficulty: aiDifficulty || 'medium'
    }
    
    await setRPSGame(gameState.id, gameSession)
    
    return NextResponse.json(gameSession)
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(await getAllRPSGames())
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    
    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }
    
    const deleted = await deleteRPSGame(gameId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    )
  }
}
