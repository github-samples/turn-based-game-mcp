import type { GameSession } from '../types/game'
import type { TicTacToeGameState, RPSGameState } from '../types/games'

// Web app base URL for API calls (when called from MCP server)
const WEB_API_BASE = process.env.WEB_API_BASE || 'http://localhost:3000'

// HTTP client functions for MCP server
async function httpGet(url: string): Promise<any> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

async function httpPost(url: string, data: any): Promise<any> {
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

// MCP-specific API functions that make HTTP calls to web app
export async function getTicTacToeGameForMCP(gameId: string): Promise<GameSession<TicTacToeGameState> | undefined> {
  try {
    // Get all games and find the one we want
    const games = await httpGet(`${WEB_API_BASE}/api/games/tic-tac-toe`)
    return games.find((game: any) => game.gameState?.id === gameId)
  } catch (error) {
    console.error('Error fetching tic-tac-toe game via API:', error)
    return undefined
  }
}

export async function createTicTacToeGameForMCP(players: any[]): Promise<GameSession<TicTacToeGameState>> {
  try {
    const playerName = players.find(p => !p.isAI)?.name || 'Player'
    return await httpPost(`${WEB_API_BASE}/api/games/tic-tac-toe`, { playerName })
  } catch (error) {
    console.error('Error creating tic-tac-toe game via API:', error)
    throw error
  }
}

export async function makeTicTacToeMove(gameId: string, move: any, playerId: string): Promise<GameSession<TicTacToeGameState>> {
  try {
    return await httpPost(`${WEB_API_BASE}/api/games/tic-tac-toe/${gameId}/move`, { move, playerId })
  } catch (error) {
    console.error('Error making tic-tac-toe move via API:', error)
    throw error
  }
}

export async function getRPSGameForMCP(gameId: string): Promise<GameSession<RPSGameState> | undefined> {
  try {
    const games = await httpGet(`${WEB_API_BASE}/api/games/rock-paper-scissors/mcp`)
    return games.find((game: any) => game.gameState?.id === gameId)
  } catch (error) {
    console.error('Error fetching RPS game via API:', error)
    return undefined
  }
}

export async function makeRPSMove(gameId: string, move: any, playerId: string): Promise<GameSession<RPSGameState>> {
  try {
    return await httpPost(`${WEB_API_BASE}/api/games/rock-paper-scissors/${gameId}/move`, { move, playerId })
  } catch (error) {
    console.error('Error making RPS move via API:', error)
    throw error
  }
}
