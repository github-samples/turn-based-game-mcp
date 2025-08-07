import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay } from '../ui/ErrorDisplay'

describe('ErrorDisplay', () => {
  const mockMessage = 'Something went wrong'

  it('should render error message', () => {
    render(<ErrorDisplay message={mockMessage} />)
    
    expect(screen.getByText(mockMessage)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should render correct icon for error type', () => {
    const { rerender } = render(<ErrorDisplay message={mockMessage} type="error" />)
    expect(screen.getByText('❌')).toBeInTheDocument()
    
    rerender(<ErrorDisplay message={mockMessage} type="warning" />)
    expect(screen.getByText('⚠️')).toBeInTheDocument()
    
    rerender(<ErrorDisplay message={mockMessage} type="info" />)
    expect(screen.getByText('ℹ️')).toBeInTheDocument()
  })

  it('should apply correct styling for different types', () => {
    const { rerender } = render(<ErrorDisplay message={mockMessage} type="error" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-red-100', 'border-red-400', 'text-red-700')
    
    rerender(<ErrorDisplay message={mockMessage} type="warning" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-100', 'border-yellow-400', 'text-yellow-700')
    
    rerender(<ErrorDisplay message={mockMessage} type="info" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-100', 'border-blue-400', 'text-blue-700')
  })

  it('should render dismiss button when onDismiss is provided', () => {
    const mockOnDismiss = vi.fn()
    render(<ErrorDisplay message={mockMessage} onDismiss={mockOnDismiss} />)
    
    const dismissButton = screen.getByLabelText('Dismiss error')
    expect(dismissButton).toBeInTheDocument()
    
    fireEvent.click(dismissButton)
    expect(mockOnDismiss).toHaveBeenCalledTimes(1)
  })

  it('should not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorDisplay message={mockMessage} />)
    
    expect(screen.queryByLabelText('Dismiss error')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const customClass = 'my-custom-class'
    render(<ErrorDisplay message={mockMessage} className={customClass} />)
    
    expect(screen.getByRole('alert')).toHaveClass(customClass)
  })

  it('should have proper accessibility attributes', () => {
    render(<ErrorDisplay message={mockMessage} />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})