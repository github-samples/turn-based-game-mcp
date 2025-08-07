import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MCPAssistantPanel } from './MCPAssistantPanel'
import type { BaseGameState } from '@turn-based-mcp/shared'

const mockGameState: BaseGameState = {
  id: 'test-game-123',
  status: 'playing',
  currentPlayerId: 'ai',
  players: [
    { id: 'player1', name: 'Player', isAI: false },
    { id: 'ai', name: 'AI', isAI: true }
  ],
  createdAt: new Date('2023-01-01T12:00:00Z'),
  updatedAt: new Date('2023-01-01T12:00:00Z')
}

const mockPlayerTurnState: BaseGameState = {
  ...mockGameState,
  currentPlayerId: 'player1'
}

const mockFinishedGameState: BaseGameState = {
  ...mockGameState,
  status: 'finished'
}

const mockInstructions = {
  steps: [
    'Custom step 1',
    'Custom step 2',
    'Custom step 3'
  ]
}

describe('MCPAssistantPanel', () => {
  it('renders when it is AI turn and game is playing', () => {
    render(<MCPAssistantPanel gameState={mockGameState} />)
    
    expect(screen.getByText('🤖 AI Assistant - MCP Integration')).toBeInTheDocument()
    expect(screen.getByText('⏳ Waiting for AI move via MCP server')).toBeInTheDocument()
    expect(screen.getByText('To make the AI move:')).toBeInTheDocument()
  })

  it('does not render when it is player turn', () => {
    render(<MCPAssistantPanel gameState={mockPlayerTurnState} />)
    
    expect(screen.queryByText('🤖 AI Assistant - MCP Integration')).not.toBeInTheDocument()
  })

  it('does not render when game is finished', () => {
    render(<MCPAssistantPanel gameState={mockFinishedGameState} />)
    
    expect(screen.queryByText('🤖 AI Assistant - MCP Integration')).not.toBeInTheDocument()
  })

  it('displays default steps when no custom instructions provided', () => {
    render(<MCPAssistantPanel gameState={mockGameState} />)
    
    expect(screen.getByText('Ask your AI assistant to analyze the game')).toBeInTheDocument()
    expect(screen.getByText('Use the MCP server tools to get the optimal move')).toBeInTheDocument()
    expect(screen.getByText('The AI will make the move automatically')).toBeInTheDocument()
  })

  it('displays custom instructions when provided', () => {
    render(<MCPAssistantPanel gameState={mockGameState} gameInstructions={mockInstructions} />)
    
    expect(screen.getByText('Custom step 1')).toBeInTheDocument()
    expect(screen.getByText('Custom step 2')).toBeInTheDocument()
    expect(screen.getByText('Custom step 3')).toBeInTheDocument()
  })

  it('displays waiting status message', () => {
    render(<MCPAssistantPanel gameState={mockGameState} />)
    
    expect(screen.getByText('⏳ Waiting for AI move via MCP server')).toBeInTheDocument()
    expect(screen.getByText('The game is paused while waiting for the AI to make a move')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MCPAssistantPanel gameState={mockGameState} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders as ordered list for steps', () => {
    render(<MCPAssistantPanel gameState={mockGameState} gameInstructions={mockInstructions} />)
    
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.tagName).toBe('OL')
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  })
})