import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react';
import { TicTacToeBoard } from './TicTacToeBoard';
import type { TicTacToeGameState } from '@turn-based-mcp/shared';

const createMockGameState = (overrides: Partial<TicTacToeGameState> = {}): TicTacToeGameState => ({
  id: 'test-game-1',
  players: [
    { id: 'player1', name: 'Player', isAI: false },
    { id: 'ai', name: 'AI', isAI: true }
  ],
  currentPlayerId: 'player1',
  status: 'playing',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:05:00Z'),
  board: [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ],
  playerSymbols: {
    player1: 'X',
    ai: 'O'
  },
  ...overrides
});

describe('TicTacToeBoard', () => {
  const mockOnMove = vi.fn();

  beforeEach(() => {
    mockOnMove.mockClear();
  });

  describe('rendering', () => {
    it('should render empty board correctly', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      // Should render 9 cells
      const cells = screen.getAllByRole('button');
      expect(cells).toHaveLength(9);

      // All cells should be empty
      cells.forEach(cell => {
        expect(cell).toHaveTextContent('');
      });
    });

    it('should render board with existing moves', () => {
      const gameState = createMockGameState({
        board: [
          ['X', 'O', null],
          [null, 'X', null],
          ['O', null, null]
        ]
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      // Check X positions
      expect(screen.getAllByText('X')).toHaveLength(2);

      // Check O positions  
      expect(screen.getAllByText('O')).toHaveLength(2);
    });

    it('should display current turn information', () => {
      const gameState = createMockGameState({ currentPlayerId: 'player1' });
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      expect(screen.getByText('Your turn (X)')).toBeInTheDocument();
    });

    it('should display AI turn information', () => {
      const gameState = createMockGameState({ currentPlayerId: 'ai' });
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      expect(screen.getByText('AI thinking... (O)')).toBeInTheDocument();
    });

    it('should display winner information for player victory', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'player1'
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);
      expect(screen.getByText('You won! 🎉')).toBeInTheDocument();
    });

    it('should display winner information for AI victory', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'ai'
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);
      expect(screen.getByText('AI won! 🤖')).toBeInTheDocument();
    });

    it('should display draw information', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'draw'
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);
      expect(screen.getByText("It's a draw! 🤝")).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onMove when clicking empty cell', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      fireEvent.click(cells[0]); // Click top-left cell

      expect(mockOnMove).toHaveBeenCalledWith({ row: 0, col: 0 });
    });

    it('should not call onMove when clicking occupied cell', () => {
      const gameState = createMockGameState({
        board: [
          ['X', null, null],
          [null, null, null],
          [null, null, null]
        ]
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      fireEvent.click(cells[0]); // Click occupied cell

      expect(mockOnMove).not.toHaveBeenCalled();
    });

    it('should not call onMove when disabled', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} disabled />);

      const cells = screen.getAllByRole('button');
      fireEvent.click(cells[0]);

      expect(mockOnMove).not.toHaveBeenCalled();
    });

    it('should not call onMove when game is finished', () => {
      const gameState = createMockGameState({
        status: 'finished',
        winner: 'player1'
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      fireEvent.click(cells[0]);

      expect(mockOnMove).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks correctly', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      fireEvent.click(cells[0]); // (0,0)
      fireEvent.click(cells[4]); // (1,1)
      fireEvent.click(cells[8]); // (2,2)

      expect(mockOnMove).toHaveBeenCalledTimes(3);
      expect(mockOnMove).toHaveBeenNthCalledWith(1, { row: 0, col: 0 });
      expect(mockOnMove).toHaveBeenNthCalledWith(2, { row: 1, col: 1 });
      expect(mockOnMove).toHaveBeenNthCalledWith(3, { row: 2, col: 2 });
    });
  });

  describe('visual states', () => {
    it('should show AI overlay when disabled and AI turn', () => {
      const gameState = createMockGameState({ currentPlayerId: 'ai' });
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} disabled />);

      expect(screen.getByText("🤖 AI's Turn - Board Locked")).toBeInTheDocument();
    });

    it('should not show AI overlay when not AI turn', () => {
      const gameState = createMockGameState({ currentPlayerId: 'player1' });
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} disabled />);

      expect(screen.queryByText("🤖 AI's Turn - Board Locked")).not.toBeInTheDocument();
    });

    it('should not show AI overlay when not disabled', () => {
      const gameState = createMockGameState({ currentPlayerId: 'ai' });
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      expect(screen.queryByText("🤖 AI's Turn - Board Locked")).not.toBeInTheDocument();
    });

    it('should apply correct cell styling for X', () => {
      const gameState = createMockGameState({
        board: [
          ['X', null, null],
          [null, null, null],
          [null, null, null]
        ]
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);
      
      const xCell = screen.getByText('X');
      expect(xCell).toHaveClass('text-blue-500');
    });

    it('should apply correct cell styling for O', () => {
      const gameState = createMockGameState({
        board: [
          ['O', null, null],
          [null, null, null],
          [null, null, null]
        ]
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);
      
      const oCell = screen.getByText('O');
      expect(oCell).toHaveClass('text-red-500');
    });
  });

  describe('accessibility', () => {
    it('should have accessible button elements', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      expect(cells).toHaveLength(9);
      
      // All cells should be buttons
      cells.forEach(cell => {
        expect(cell.tagName).toBe('BUTTON');
      });
    });

    it('should disable buttons appropriately', () => {
      const gameState = createMockGameState({
        board: [
          ['X', null, null],
          [null, 'O', null],
          [null, null, null]
        ]
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} disabled />);

      const cells = screen.getAllByRole('button');
      
      // All buttons should be disabled when component is disabled
      cells.forEach(cell => {
        expect(cell).toBeDisabled();
      });
    });

    it('should enable empty cells when not disabled', () => {
      const gameState = createMockGameState({
        board: [
          ['X', null, null],
          [null, 'O', null],
          [null, null, null]
        ]
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      
      // Check first cell (occupied) - should be disabled
      expect(cells[0]).toBeDisabled();
      
      // Check second cell (empty) - should be enabled
      expect(cells[1]).not.toBeDisabled();
      
      // Check center cell (occupied) - should be disabled
      expect(cells[4]).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty board state', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      // Should render without errors
      expect(screen.getAllByRole('button')).toHaveLength(9);
    });

    it('should handle full board state', () => {
      const gameState = createMockGameState({
        board: [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['O', 'X', 'O']
        ],
        status: 'finished',
        winner: 'draw'
      });

      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      // Should render all symbols
      expect(screen.getAllByText('X')).toHaveLength(4);
      expect(screen.getAllByText('O')).toHaveLength(5);
      expect(screen.getByText("It's a draw! 🤝")).toBeInTheDocument();
    });

    it('should handle rapid consecutive clicks', () => {
      const gameState = createMockGameState();
      render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />);

      const cells = screen.getAllByRole('button');
      
      // Rapidly click the same cell multiple times
      fireEvent.click(cells[0]);
      fireEvent.click(cells[0]);
      fireEvent.click(cells[0]);

      // Should only register the valid clicks (depends on cell state)
      expect(mockOnMove).toHaveBeenCalled();
    });
  });
});