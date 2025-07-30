import { render, screen, fireEvent } from '@testing-library/react'
import { GameControls } from '../ui/GameControls'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('GameControls', () => {
  it('should render with default props', () => {
    render(<GameControls />)
    
    expect(screen.getByText('Game Controls')).toBeInTheDocument()
    expect(screen.getByText('Back to Games')).toBeInTheDocument()
  })

  it('should render new game button when onNewGame is provided', () => {
    const mockOnNewGame = jest.fn()
    render(<GameControls onNewGame={mockOnNewGame} />)
    
    const newGameButton = screen.getByText('New Game')
    expect(newGameButton).toBeInTheDocument()
    
    fireEvent.click(newGameButton)
    expect(mockOnNewGame).toHaveBeenCalledTimes(1)
  })

  it('should render reset button when showReset and onReset are provided', () => {
    const mockOnReset = jest.fn()
    render(<GameControls showReset onReset={mockOnReset} />)
    
    const resetButton = screen.getByText('Reset Game')
    expect(resetButton).toBeInTheDocument()
    
    fireEvent.click(resetButton)
    expect(mockOnReset).toHaveBeenCalledTimes(1)
  })

  it('should not render reset button when showReset is false', () => {
    const mockOnReset = jest.fn()
    render(<GameControls showReset={false} onReset={mockOnReset} />)
    
    expect(screen.queryByText('Reset Game')).not.toBeInTheDocument()
  })

  it('should show loading state for new game button', () => {
    const mockOnNewGame = jest.fn()
    render(<GameControls isLoading onNewGame={mockOnNewGame} />)
    
    expect(screen.getByText('Starting...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /starting/i })).toBeDisabled()
  })

  it('should disable buttons when loading', () => {
    const mockOnNewGame = jest.fn()
    const mockOnReset = jest.fn()
    render(<GameControls isLoading onNewGame={mockOnNewGame} showReset onReset={mockOnReset} />)
    
    expect(screen.getByRole('button', { name: /starting/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /reset game/i })).toBeDisabled()
  })

  it('should render custom children', () => {
    const customChild = <button>Custom Button</button>
    render(<GameControls>{customChild}</GameControls>)
    
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const customClass = 'my-custom-class'
    render(<GameControls className={customClass} />)
    
    expect(screen.getByText('Game Controls').closest('.bg-white\\/60')).toHaveClass(customClass)
  })

  it('should render back to games link with correct href', () => {
    render(<GameControls />)
    
    const backLink = screen.getByText('Back to Games')
    expect(backLink.closest('a')).toHaveAttribute('href', '/')
  })
})