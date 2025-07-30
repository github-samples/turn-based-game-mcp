'use client'

/**
 * Props for the ErrorDisplay component
 */
interface ErrorDisplayProps {
  /** Error message to display */
  message: string
  /** Type of error for styling */
  type?: 'error' | 'warning' | 'info'
  /** Optional callback when error is dismissed */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Standardized error display component
 * 
 * Shows error messages with consistent styling across the application.
 * Supports different error types and optional dismiss functionality.
 * 
 * @param props - Component props
 * @returns JSX element representing the error display
 */
export function ErrorDisplay({ message, type = 'error', onDismiss, className = '' }: ErrorDisplayProps) {
  const typeStyles = {
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  }
  
  const iconMap = {
    error: '❌',
    warning: '⚠️', 
    info: 'ℹ️'
  }
  
  return (
    <div 
      className={`${typeStyles[type]} border px-4 py-3 rounded-md ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">{iconMap[type]}</span>
          <span>{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-sm hover:opacity-75 focus:outline-none"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}