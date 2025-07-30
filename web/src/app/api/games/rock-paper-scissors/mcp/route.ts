import { NextResponse } from 'next/server'
import { getAllRPSGames } from '../../../../../lib/game-storage'
import type { GameSession } from '@turn-based-mcp/shared'
import type { RPSGameState } from '@turn-based-mcp/shared'

/**
 * Sanitized API endpoint for MCP server access
 * Returns game data without exposing sensitive information like current player choices
 */
export async function GET() {
  try {
    const games = await getAllRPSGames()
    
    // Sanitize RPS games to hide current round player choices
    const sanitizedGames = games.map((game: GameSession<RPSGameState>) => {
      const sanitizedGameState = { ...game.gameState }
      
      // Hide current round's player choices if the round is in progress
      if (sanitizedGameState.rounds && sanitizedGameState.currentRound < sanitizedGameState.rounds.length) {
        const sanitizedRounds = [...sanitizedGameState.rounds]
        const currentRound = sanitizedRounds[sanitizedGameState.currentRound]
        
        if (currentRound) {
          // Only hide choices if round is not complete (both players haven't chosen)
          if (!currentRound.winner) {
            sanitizedRounds[sanitizedGameState.currentRound] = {
              ...currentRound,
              // Hide individual player choices, but keep round result if completed
              player1Choice: undefined,
              player2Choice: undefined,
            }
          }
        }
        
        sanitizedGameState.rounds = sanitizedRounds
      }
      
      return {
        ...game,
        gameState: sanitizedGameState
      }
    })
    
    return NextResponse.json(sanitizedGames)
  } catch (error) {
    console.error('Error fetching games for MCP:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
