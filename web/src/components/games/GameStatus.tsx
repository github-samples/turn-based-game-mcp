'use client'

import type { BaseGameState, Difficulty } from '@turn-based-mcp/shared'
import { DifficultyBadge } from '../shared'

interface GameStatusProps {
  gameState: BaseGameState
  aiDifficulty?: Difficulty
}

export function GameStatus({ gameState, aiDifficulty }: GameStatusProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Game Status
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Status:</span>
          <span className="font-medium capitalize">
            {gameState.status === 'playing' ? '🎮 Playing' : '🏁 Finished'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Players:</span>
          <span className="font-medium">
            {gameState.players.map(p => p.name).join(' vs ')}
          </span>
        </div>
        
        {aiDifficulty && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">AI Difficulty:</span>
            <DifficultyBadge difficulty={aiDifficulty} variant="compact" />
          </div>
        )}
        
        {gameState.status === 'playing' && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Current Turn:</span>
            <span className="font-medium">
              {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'Unknown'}
            </span>
          </div>
        )}

        {gameState.status === 'playing' && gameState.currentPlayerId === 'ai' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-2 mt-2">
            <div className="text-xs text-blue-800 dark:text-blue-200">
              ⏳ Waiting for AI move via MCP server
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Use your AI assistant to make the next move
            </div>
          </div>
        )}
        
        {gameState.winner && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Winner:</span>
            <span className="font-medium">
              {gameState.winner === 'draw' 
                ? '🤝 Draw' 
                : `🏆 ${gameState.players.find(p => p.id === gameState.winner)?.name || 'Unknown'}`
              }
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Started: {new Date(gameState.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
