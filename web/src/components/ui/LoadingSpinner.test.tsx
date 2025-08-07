import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    const message = 'Loading game data...'
    render(<LoadingSpinner message={message} />)
    
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')
    
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
  })

  it('should apply custom className', () => {
    const customClass = 'my-custom-class'
    render(<LoadingSpinner className={customClass} />)
    
    expect(screen.getByRole('status').parentElement).toHaveClass(customClass)
  })

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })
})