'use client'

import type { BaseGameState } from '@turn-based-mcp/shared'

/**
 * Props for the MCPAssistantPanel component
 */
interface MCPAssistantPanelProps {
  /** Current game state */
  gameState: BaseGameState
  /** Game-specific instructions for AI interaction */
  gameInstructions?: {
    /** Instructions on how to make AI move */
    steps: string[]
  }
  /** Additional CSS classes */
  className?: string
}

/**
 * MCP Assistant Panel component
 * 
 * Shows AI turn instructions and MCP server integration guidance.
 * Only appears when it's the AI's turn, providing contextual information
 * for interacting with the AI via MCP server tools.
 * 
 * @param props - Component props
 * @returns JSX element representing the MCP assistant panel
 */
export function MCPAssistantPanel({ 
  gameState, 
  gameInstructions,
  className = '' 
}: MCPAssistantPanelProps) {
  // Only show when it's playing and AI's turn
  if (gameState.status !== 'playing' || gameState.currentPlayerId !== 'ai') {
    return null
  }

  const defaultSteps = [
    'Ask your AI assistant to analyze the game',
    'Use the MCP server tools to get the optimal move', 
    'The AI will make the move automatically'
  ]

  const steps = gameInstructions?.steps || defaultSteps

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
        🤖 AI Assistant - MCP Integration
      </h3>
      
      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
        <div className="bg-blue-100 dark:bg-blue-800/30 rounded-md p-2">
          <p className="font-medium text-blue-800 dark:text-blue-200">
            ⏳ Waiting for AI move via MCP server
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            The game is paused while waiting for the AI to make a move
          </p>
        </div>
        
        <div>
          <p className="font-medium mb-2">To make the AI move:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            {steps.map((step, index) => (
              <li key={index} className="text-xs">{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}