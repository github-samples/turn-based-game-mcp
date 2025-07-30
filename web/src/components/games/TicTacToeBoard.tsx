'use client'

import type { TicTacToeGameState, TicTacToeMove, CellValue } from '@turn-based-mcp/shared'

/**
 * Props for the TicTacToeBoard component
 */
interface TicTacToeBoardProps {
  /** Current state of the tic-tac-toe game */
  gameState: TicTacToeGameState
  /** Callback function called when a player makes a move */
  onMove: (move: TicTacToeMove) => void
  /** Whether the board should be disabled (e.g., during AI turn) */
  disabled?: boolean
}

/**
 * Interactive Tic-Tac-Toe game board component
 * 
 * Renders a 3x3 grid of clickable cells that players can interact with.
 * Displays current game state, turn information, and winner announcements.
 * Includes visual feedback for AI turns and game completion.
 * 
 * @param props - Component props
 * @returns JSX element representing the game board
 */

export function TicTacToeBoard({ gameState, onMove, disabled }: TicTacToeBoardProps) {
  const handleCellClick = (row: number, col: number) => {
    if (disabled || gameState.board[row][col] !== null || gameState.status === 'finished') {
      return
    }
    
    onMove({ row, col })
  }

  const renderCell = (value: CellValue, row: number, col: number) => {
    const isClickable = !disabled && value === null && gameState.status === 'playing'
    
    let classes = 'aspect-square flex items-center justify-center text-4xl font-bold rounded-lg border-2 transition-all duration-200 '
    classes += 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 '
    
    if (isClickable) {
      classes += 'hover:border-blue-500 hover:scale-105 hover:shadow-md cursor-pointer '
    } else {
      classes += 'cursor-not-allowed '
    }
    
    if (value === 'X') {
      classes += 'text-blue-500 '
    } else if (value === 'O') {
      classes += 'text-red-500 '
    }
    
    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={!isClickable}
        className={classes}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 relative">
      {disabled && gameState.currentPlayerId === 'ai' && gameState.status === 'playing' && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🤖 AI&apos;s Turn - Board Locked
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {gameState.status === 'playing' && (
            <>
              Current turn: {' '}
              <span className="font-semibold">
                {gameState.currentPlayerId === 'player1' ? 'Your turn (X)' : 'AI thinking... (O)'}
              </span>
            </>
          )}
          {gameState.status === 'finished' && gameState.winner && (
            <span className="font-semibold text-lg">
              {gameState.winner === 'player1' && 'You won! 🎉'}
              {gameState.winner === 'ai' && 'AI won! 🤖'}
              {gameState.winner === 'draw' && "It's a draw! 🤝"}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
