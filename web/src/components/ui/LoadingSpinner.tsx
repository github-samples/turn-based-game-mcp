'use client'

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Optional loading message to display */
  message?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable loading spinner component
 * 
 * Displays an animated spinner with optional loading message.
 * Used throughout the application for indicating loading states.
 * 
 * @param props - Component props
 * @returns JSX element representing the loading spinner
 */
export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  )
}