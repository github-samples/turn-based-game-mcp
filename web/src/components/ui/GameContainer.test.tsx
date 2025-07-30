import { render, screen } from '@testing-library/react'
import { GameContainer } from '../ui/GameContainer'

describe('GameContainer', () => {
  const defaultProps = {
    title: 'Test Game',
    description: 'A test game description',
    gameBoard: <div>Game Board</div>,
    sidebar: <div>Sidebar Content</div>
  }

  it('should render title and description', () => {
    render(<GameContainer {...defaultProps} />)
    
    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByText('A test game description')).toBeInTheDocument()
  })

  it('should render game board and sidebar', () => {
    render(<GameContainer {...defaultProps} />)
    
    expect(screen.getByText('Game Board')).toBeInTheDocument()
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
  })

  it('should render error when provided', () => {
    const errorMessage = 'Something went wrong'
    render(<GameContainer {...defaultProps} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should not render error when error is null', () => {
    render(<GameContainer {...defaultProps} error={null} />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should call onErrorDismiss when error is dismissed', () => {
    const mockOnErrorDismiss = jest.fn()
    const errorMessage = 'Something went wrong'
    render(
      <GameContainer 
        {...defaultProps} 
        error={errorMessage} 
        onErrorDismiss={mockOnErrorDismiss} 
      />
    )
    
    const dismissButton = screen.getByLabelText('Dismiss error')
    expect(dismissButton).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const customClass = 'my-custom-class'
    render(<GameContainer {...defaultProps} className={customClass} />)
    
    // Check if the main container has the custom class
    const container = screen.getByText('Test Game').closest('.max-w-7xl')
    expect(container).toHaveClass(customClass)
  })

  it('should have proper responsive grid layout', () => {
    render(<GameContainer {...defaultProps} />)
    
    // Find the grid container
    const gridContainer = screen.getByText('Game Board').closest('.grid')
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'xl:grid-cols-5', 'gap-6')
    
    // Check game board column span
    const gameBoardCol = screen.getByText('Game Board').closest('.xl\\:col-span-3')
    expect(gameBoardCol).toBeInTheDocument()
  })

  it('should render with proper heading hierarchy', () => {
    render(<GameContainer {...defaultProps} />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Test Game')
  })
})