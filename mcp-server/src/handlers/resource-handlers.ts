/**
 * MCP Resource handlers for game resources
 */

import { getGamesByType, getGameViaAPI } from '../utils/http-client.js'

const SUPPORTED_GAME_TYPES = ['tic-tac-toe', 'rock-paper-scissors']

/**
 * List all available game resources
 */
export async function listResources() {
  try {
    const resources = []
    
    for (const gameType of SUPPORTED_GAME_TYPES) {
      try {
        // Get all games of this type
        const games = await getGamesByType(gameType)
        
        // Add a resource for the game type itself (lists all games of that type)
        resources.push({
          uri: `game://${gameType}`,
          name: `${gameType} games`,
          description: `List all active ${gameType} games`,
          mimeType: 'application/json'
        })
        
        // Add individual game resources
        for (const game of games) {
          if (game.gameState?.id) {
            resources.push({
              uri: `game://${gameType}/${game.gameState.id}`,
              name: `${gameType} game ${game.gameState.id}`,
              description: `${gameType} game (Status: ${game.gameState.status}, Current Player: ${game.gameState.currentPlayerId})`,
              mimeType: 'application/json'
            })
          }
        }
      } catch (error) {
        console.error(`Error listing ${gameType} games:`, error)
        // Continue with other game types even if one fails
      }
    }
    
    return { resources }
  } catch (error) {
    console.error('Error listing resources:', error)
    return { resources: [] }
  }
}

/**
 * Read a specific game resource
 */
export async function readResource(uri: string) {
  // Parse game resource URI: game://{gameType} or game://{gameType}/{gameId}
  const match = uri.match(/^game:\/\/([^\/]+)(?:\/([^\/]+))?$/)
  if (!match) {
    throw new Error(`Invalid game resource URI: ${uri}`)
  }
  
  const [, gameType, gameId] = match
  
  // Validate game type
  if (!SUPPORTED_GAME_TYPES.includes(gameType)) {
    throw new Error(`Invalid game type: ${gameType}`)
  }
  
  if (gameId) {
    // Individual game resource: game://{gameType}/{gameId}
    const gameSession = await getGameViaAPI(gameType, gameId)
    if (!gameSession) {
      throw new Error(`Game not found: ${uri}`)
    }
    
    // Return individual game session as resource content
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            gameType,
            gameId,
            gameSession,
            timestamp: new Date().toISOString()
          })
        }
      ]
    }
  } else {
    // Game type list resource: game://{gameType}
    try {
      const games = await getGamesByType(gameType)
      
      // Return list of games of this type
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              gameType,
              games: games.map((game: any) => ({
                gameId: game.gameState?.id,
                status: game.gameState?.status,
                currentPlayer: game.gameState?.currentPlayerId,
                winner: game.gameState?.winner || null,
                createdAt: game.gameState?.createdAt,
                updatedAt: game.gameState?.updatedAt,
                playerCount: Object.keys(game.gameState?.players || {}).length,
                aiDifficulty: game.aiDifficulty
              })),
              totalGames: games.length,
              timestamp: new Date().toISOString()
            })
          }
        ]
      }
    } catch (error) {
      throw new Error(`Failed to fetch ${gameType} games: ${error}`)
    }
  }
}
