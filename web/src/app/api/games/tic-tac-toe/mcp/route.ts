import { NextResponse } from 'next/server'
import { getAllTicTacToeGames } from '../../../../../lib/game-storage'

/**
 * Sanitized API endpoint for MCP server access
 * Returns game data without exposing sensitive information like player choices
 */
export async function GET() {
  try {
    const games = await getAllTicTacToeGames()
    
    // Return games without any sanitization needed for tic-tac-toe
    // (board state is always visible to both players)
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching games for MCP:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
