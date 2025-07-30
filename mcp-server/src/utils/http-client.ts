/**
 * HTTP client utilities for communicating with the web API
 */

const WEB_API_BASE = process.env.WEB_API_BASE || 'http://localhost:3000'

export async function httpGet(url: string): Promise<any> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export async function httpPost(url: string, data: any): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Generic game state fetcher for resources
 */
export async function getGameViaAPI(gameType: string, gameId: string) {
  try {
    const games = await httpGet(`${WEB_API_BASE}/api/games/${gameType}/mcp`)
    return games.find((game: any) => game.gameState?.id === gameId)
  } catch (error) {
    console.error(`Error fetching ${gameType} game via API:`, error)
    return undefined
  }
}

/**
 * Generic game creation function
 */
export async function createGameViaAPI(
  gameType: string, 
  playerName: string, 
  gameId?: string, 
  aiDifficulty?: string
) {
  try {
    const data: any = { playerName }
    if (gameId) {
      data.gameId = gameId
    }
    if (aiDifficulty) {
      data.aiDifficulty = aiDifficulty
    }
    return await httpPost(`${WEB_API_BASE}/api/games/${gameType}`, data)
  } catch (error) {
    console.error(`Error creating ${gameType} game via API:`, error)
    throw error
  }
}

/**
 * Submit a move to the API
 */
export async function submitMoveViaAPI(
  gameType: string,
  gameId: string,
  move: any,
  playerId: string
) {
  return await httpPost(`${WEB_API_BASE}/api/games/${gameType}/${gameId}/move`, {
    move,
    playerId
  })
}

/**
 * Get all games of a specific type
 */
export async function getGamesByType(gameType: string) {
  return await httpGet(`${WEB_API_BASE}/api/games/${gameType}/mcp`)
}

export { WEB_API_BASE }
