import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameInfoPanel } from './GameInfoPanel'
import type { BaseGameState } from '@turn-based-mcp/shared'

const mockGameState: BaseGameState = {
  id: 'test-game-123',
  status: 'playing',
  currentPlayerId: 'player1',
  players: [
    { id: 'player1', name: 'Player', isAI: false },
    { id: 'ai', name: 'AI', isAI: true }
  ],
  createdAt: new Date('2023-01-01T12:00:00Z'),
  updatedAt: new Date('2023-01-01T12:00:00Z')
}

const mockFinishedGameState: BaseGameState = {
  ...mockGameState,
  status: 'finished',
  winner: 'player1'
}

describe('GameInfoPanel', () => {
  it('renders game information correctly', () => {
    render(<GameInfoPanel gameState={mockGameState} aiDifficulty="medium" />)
    
    expect(screen.getByText('Game Information')).toBeInTheDocument()
    expect(screen.getByText('test-game-123')).toBeInTheDocument()
    expect(screen.getByText('Player')).toBeInTheDocument()
    expect(screen.getByText('🎮 Playing')).toBeInTheDocument()
    expect(screen.getByText('Player vs AI')).toBeInTheDocument()
    expect(screen.getByText('🎯 Medium')).toBeInTheDocument()
  })

  it('prominently displays Game ID for MCP integration', () => {
    render(<GameInfoPanel gameState={mockGameState} />)
    
    const gameIdLabel = screen.getByText('Game ID:')
    expect(gameIdLabel).toBeInTheDocument()
    
    const gameIdValue = screen.getByText('test-game-123')
    expect(gameIdValue).toHaveClass('font-mono')
    
    // Check that the Game ID container has blue gradient background styling
    const gameIdContainer = gameIdValue.closest('.bg-gradient-to-r')
    expect(gameIdContainer).toBeInTheDocument()
  })

  it('shows current turn with visual indicator', () => {
    render(<GameInfoPanel gameState={mockGameState} />)
    
    expect(screen.getByText('Current Turn:')).toBeInTheDocument()
    expect(screen.getByText('Player')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows AI indicator for AI turn', () => {
    const aiTurnState = {
      ...mockGameState,
      currentPlayerId: 'ai' as const
    }
    
    render(<GameInfoPanel gameState={aiTurnState} />)
    
    expect(screen.getByText('🤖 AI')).toBeInTheDocument()
  })

  it('displays winner information when game is finished', () => {
    render(<GameInfoPanel gameState={mockFinishedGameState} />)
    
    expect(screen.getByText('🏁 Finished')).toBeInTheDocument()
    expect(screen.getByText('🏆 Player')).toBeInTheDocument()
  })

  it('shows draw game correctly', () => {
    const drawGameState = {
      ...mockFinishedGameState,
      winner: 'draw' as const
    }
    
    render(<GameInfoPanel gameState={drawGameState} />)
    
    expect(screen.getByText('🤝 Draw')).toBeInTheDocument()
  })

  it('displays AI difficulty levels correctly', () => {
    const { rerender } = render(<GameInfoPanel gameState={mockGameState} aiDifficulty="easy" />)
    expect(screen.getByText('😌 Easy')).toBeInTheDocument()

    rerender(<GameInfoPanel gameState={mockGameState} aiDifficulty="medium" />)
    expect(screen.getByText('🎯 Medium')).toBeInTheDocument()

    rerender(<GameInfoPanel gameState={mockGameState} aiDifficulty="hard" />)
    expect(screen.getByText('🔥 Hard')).toBeInTheDocument()
  })

  it('does not show current turn for finished games', () => {
    render(<GameInfoPanel gameState={mockFinishedGameState} />)
    
    expect(screen.queryByText('Current Turn:')).not.toBeInTheDocument()
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
  })

  it('shows game start time', () => {
    render(<GameInfoPanel gameState={mockGameState} />)
    
    expect(screen.getByText(/Started:/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <GameInfoPanel gameState={mockGameState} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})