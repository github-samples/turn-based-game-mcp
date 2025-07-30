'use client'

import React, { ReactNode } from 'react'
import { ErrorDisplay } from './ErrorDisplay'

/**
 * Props for the GameContainer component
 */
interface GameContainerProps {
  /** Game title */
  title: string
  /** Game description */
  description: string
  /** Main game board component */
  gameBoard: ReactNode
  /** Game status and controls sidebar */
  sidebar: ReactNode
  /** Error message to display */
  error?: string | null
  /** Callback to dismiss error */
  onErrorDismiss?: () => void
  /** Additional CSS classes */
  className?: string
  /** Whether this is a game setup screen (centers content) */
  isSetupScreen?: boolean
}

/**
 * Generic game board container component
 * 
 * Provides consistent layout structure for all games with:
 * - Game title and description header
 * - Error display handling
 * - Responsive grid layout with game board and sidebar
 * - Consistent spacing and styling
 * 
 * @param props - Component props
 * @returns JSX element representing the game container
 */
export function GameContainer({
  title,
  description, 
  gameBoard,
  sidebar,
  error,
  onErrorDismiss,
  className = '',
  isSetupScreen = false
}: GameContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto space-y-8 ${className}`}>
      {/* Game Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          message={error} 
          onDismiss={onErrorDismiss}
        />
      )}

      {/* Game Layout */}
      {isSetupScreen ? (
        /* Centered layout for setup screens */
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 lg:p-8">
              {gameBoard}
            </div>
          </div>
        </div>
      ) : (
        /* Grid layout for active games */
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Game Board - Takes up more space on larger screens */}
          <div className="xl:col-span-3">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 lg:p-8">
              {gameBoard}
            </div>
          </div>
          
          {/* Sidebar - Optimized spacing */}
          <div className="xl:col-span-2 space-y-4">
            {sidebar}
          </div>
        </div>
      )}
    </div>
  )
}