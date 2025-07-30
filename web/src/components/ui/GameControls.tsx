'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

/**
 * Props for the GameControls component
 */
interface GameControlsProps {
  /** Whether controls are in loading state */
  isLoading?: boolean
  /** Callback for starting a new game */
  onNewGame?: () => void
  /** Callback for resetting current game */
  onReset?: () => void
  /** Whether to show the reset button */
  showReset?: boolean
  /** Callback for deleting current game */
  onDelete?: () => void
  /** Whether to show the delete button */
  showDelete?: boolean
  /** Additional custom controls */
  children?: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable game controls component
 * 
 * Provides standard game controls like New Game, Reset, and Back to Games.
 * Handles loading states and can include custom additional controls.
 * 
 * @param props - Component props
 * @returns JSX element representing the game controls
 */
export function GameControls({ 
  isLoading = false, 
  onNewGame, 
  onReset, 
  showReset = false,
  onDelete,
  showDelete = false,
  children,
  className = ''
}: GameControlsProps) {
  return (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Game Controls
        </h3>
      </div>
      
      <div className="space-y-3">
        {onNewGame && (
          <button
            onClick={onNewGame}
            disabled={isLoading}
            className="group w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                New Game
              </>
            )}
          </button>
        )}
        
        {showReset && onReset && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="group w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/>
            </svg>
            Reset Game
          </button>
        )}
        
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="group w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete Game
          </button>
        )}
        
        {children}
        
        <Link
          href="/"
          className="group block w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl text-center flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Games
        </Link>
      </div>
    </div>
  )
}