import { vi } from 'vitest'
import { render, screen } from '@testing-library/react';
import { GameStatus } from './GameStatus';
import type { BaseGameState, PlayerId } from '@turn-based-mcp/shared';

const createMockGameState = (overrides: Partial<BaseGameState> = {}): BaseGameState => ({
  id: 'test-game-1',
  players: [
    { id: 'player1', name: 'Player', isAI: false },
    { id: 'ai', name: 'AI Assistant', isAI: true }
  ],
  currentPlayerId: 'player1',
  status: 'playing',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:05:00Z'),
  ...overrides
});

describe('GameStatus', () => {
  describe('basic rendering', () => {
    it('should render game status component', () => {
      const gameState = createMockGameState();
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Game Status')).toBeInTheDocument();
    });

    it('should display playing status', () => {
      const gameState = createMockGameState({ status: 'playing' });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('🎮 Playing')).toBeInTheDocument();
    });

    it('should display finished status', () => {
      const gameState = createMockGameState({ status: 'finished' });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('🏁 Finished')).toBeInTheDocument();
    });

    it('should display player names', () => {
      const gameState = createMockGameState();
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Player vs AI Assistant')).toBeInTheDocument();
    });

    it('should display creation time', () => {
      const gameState = createMockGameState({
        createdAt: new Date('2024-01-01T14:30:00Z')
      });
      render(<GameStatus gameState={gameState} />);

      // Should display time (format may vary by locale)
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
    });
  });

  describe('current turn display', () => {
    it('should show current turn for playing game', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'player1'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Current Turn:')).toBeInTheDocument();
      expect(screen.getByText('Player')).toBeInTheDocument();
    });

    it('should show AI turn', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'ai'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Current Turn:')).toBeInTheDocument();
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('should not show current turn for finished game', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'player1'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.queryByText('Current Turn:')).not.toBeInTheDocument();
    });

    it('should handle unknown player ID gracefully', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'unknown-player' as PlayerId
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('AI turn indicator', () => {
    it('should show AI waiting indicator when AI turn', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'ai'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('⏳ Waiting for AI move via MCP server')).toBeInTheDocument();
      expect(screen.getByText('Use your AI assistant to make the next move')).toBeInTheDocument();
    });

    it('should not show AI indicator when human turn', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'player1'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.queryByText('⏳ Waiting for AI move via MCP server')).not.toBeInTheDocument();
    });

    it('should not show AI indicator when game finished', () => {
      const gameState = createMockGameState({
        status: 'finished',
        currentPlayerId: 'ai',
        winner: 'player1'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.queryByText('⏳ Waiting for AI move via MCP server')).not.toBeInTheDocument();
    });
  });

  describe('winner display', () => {
    it('should show winner for finished game', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'player1'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Winner:')).toBeInTheDocument();
      expect(screen.getByText('🏆 Player')).toBeInTheDocument();
    });

    it('should show AI winner', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'ai'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('🏆 AI Assistant')).toBeInTheDocument();
    });

    it('should show draw result', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'draw'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('🤝 Draw')).toBeInTheDocument();
    });

    it('should not show winner for playing game', () => {
      const gameState = createMockGameState({
        status: 'playing'
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.queryByText('Winner:')).not.toBeInTheDocument();
    });

    it('should handle unknown winner gracefully', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'unknown-player' as PlayerId
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('🏆 Unknown')).toBeInTheDocument();
    });
  });

  describe('different player configurations', () => {
    it('should handle single player', () => {
      const gameState = createMockGameState({
        players: [{ id: 'player1', name: 'Solo Player', isAI: false }]
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getAllByText('Solo Player')).toHaveLength(2); // Appears in players list and current turn
    });

    it('should handle multiple players', () => {
      const gameState = createMockGameState({
        players: [
          { id: 'player1', name: 'Alice', isAI: false },
          { id: 'player2', name: 'Bob', isAI: false },
          { id: 'ai' as PlayerId, name: 'Charlie', isAI: false }
        ]
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText('Alice vs Bob vs Charlie')).toBeInTheDocument();
    });

    it('should handle empty player names', () => {
      const gameState = createMockGameState({
        players: [
          { id: 'player1', name: '', isAI: false },
          { id: 'player2', name: 'Player 2', isAI: true }
        ]
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText(/vs Player 2/)).toBeInTheDocument();
    });

    it('should handle long player names', () => {
      const gameState = createMockGameState({
        players: [
          { id: 'player1', name: 'Very Long Player Name That Might Overflow', isAI: false },
          { id: 'player2', name: 'Another Very Long Name', isAI: true }
        ]
      });
      render(<GameStatus gameState={gameState} />);

      expect(screen.getByText(/Very Long Player Name.*Another Very Long Name/)).toBeInTheDocument();
    });
  });

  describe('time display', () => {
    it('should format time correctly', () => {
      const testDate = new Date('2024-01-01T15:30:45Z');
      const gameState = createMockGameState({
        createdAt: testDate
      });
      render(<GameStatus gameState={gameState} />);

      const timeElement = screen.getByText(/Started:/);
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.textContent).toContain('Started:');
    });

    it('should handle different timezones', () => {
      const gameState = createMockGameState({
        createdAt: new Date('2024-12-25T00:00:00Z')
      });
      render(<GameStatus gameState={gameState} />);

      // Should render without error regardless of timezone
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
    });
  });

  describe('responsive design elements', () => {
    it('should have proper CSS classes for styling', () => {
      const gameState = createMockGameState();
      const { container } = render(<GameStatus gameState={gameState} />);

      // Check main container classes
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-lg', 'shadow-md', 'p-4');
    });

    it('should style AI indicator properly', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'ai'
      });
      render(<GameStatus gameState={gameState} />);

      const aiIndicator = screen.getByText('⏳ Waiting for AI move via MCP server').closest('div')?.parentElement;
      expect(aiIndicator).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20', 'border');
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const gameState = createMockGameState();
      render(<GameStatus gameState={gameState} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Game Status');
    });

    it('should be readable by screen readers', () => {
      const gameState = createMockGameState({
        status: 'playing',
        currentPlayerId: 'player1'
      });
      render(<GameStatus gameState={gameState} />);

      // All important information should be text content
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Players:')).toBeInTheDocument();
      expect(screen.getByText('Current Turn:')).toBeInTheDocument();
    });

    it('should handle screen reader friendly time format', () => {
      const gameState = createMockGameState();
      render(<GameStatus gameState={gameState} />);

      const timeText = screen.getByText(/Started:/);
      expect(timeText.textContent).toMatch(/Started: \d+:\d+:\d+ (AM|PM)/);
    });
  });

  describe('edge cases', () => {
    it('should handle missing game data gracefully', () => {
      const gameState = createMockGameState({
        players: []
      });
      render(<GameStatus gameState={gameState} />);

      // Should not crash
      expect(screen.getByText('Game Status')).toBeInTheDocument();
    });

    it('should handle undefined winner', () => {
      const gameState = createMockGameState({
        status: 'finished'
        // winner is undefined
      });
      render(<GameStatus gameState={gameState} />);

      // Should not show winner section
      expect(screen.queryByText('Winner:')).not.toBeInTheDocument();
    });

    it('should handle future dates gracefully', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const gameState = createMockGameState({
        createdAt: futureDate
      });
      render(<GameStatus gameState={gameState} />);

      // Should render without errors
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
    });

    it('should handle very old dates', () => {
      const gameState = createMockGameState({
        createdAt: new Date('1970-01-01T00:00:00Z')
      });
      render(<GameStatus gameState={gameState} />);

      // Should render without errors
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
    });
  });
});