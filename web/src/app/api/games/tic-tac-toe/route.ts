import { NextRequest, NextResponse } from 'next/server'
import { TicTacToeGame } from '@turn-based-mcp/shared'
import type { GameSession, Player } from '@turn-based-mcp/shared'
import type { TicTacToeGameState } from '@turn-based-mcp/shared'
import { setTicTacToeGame, getAllTicTacToeGames, deleteTicTacToeGame } from '../../../../lib/game-storage'

const ticTacToeGame = new TicTacToeGame()

export async function POST(request: NextRequest) {
  try {
    const { playerName, gameId, aiDifficulty, playerSymbol } = await request.json()
    
    const players: Player[] = [
      { id: 'player1', name: playerName || 'Player', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ]
    
    // Determine who goes first based on symbol choice
    // X always goes first, O goes second
    let options: { firstPlayerId?: string } | undefined;
    if (playerSymbol === 'O') {
      // Player chose O, so AI (who gets X) goes first
      options = { firstPlayerId: 'ai' };
    } else {
      // Player chose X (default) or no preference, so player goes first
      options = { firstPlayerId: 'player1' };
    }
    
    const gameState = ticTacToeGame.getInitialState(players, options)
    
    // Use custom gameId if provided
    if (gameId) {
      gameState.id = gameId
    }
    
    const gameSession: GameSession<TicTacToeGameState> = {
      gameState,
      gameType: 'tic-tac-toe',
      history: [],
      aiDifficulty: aiDifficulty || 'medium'
    }
    
    await setTicTacToeGame(gameState.id, gameSession)
    
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
  return NextResponse.json(await getAllTicTacToeGames())
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
    
    const deleted = await deleteTicTacToeGame(gameId)
    
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
