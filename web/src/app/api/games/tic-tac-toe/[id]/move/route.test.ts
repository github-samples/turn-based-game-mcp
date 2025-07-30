import { NextRequest } from 'next/server';
import type { GameSession, TicTacToeGameState, TicTacToeMove } from '@turn-based-mcp/shared';

// Mock dependencies BEFORE importing the route - use factory functions for proper setup
jest.mock('@turn-based-mcp/shared', () => {
  const mockGame = {
    getInitialState: jest.fn(),
    validateMove: jest.fn(),
    applyMove: jest.fn(),
    checkGameEnd: jest.fn(),
    getValidMoves: jest.fn()
  };
  
  return {
    ...jest.requireActual('@turn-based-mcp/shared'),
    TicTacToeGame: jest.fn(() => mockGame),
    getTicTacToeGame: jest.fn(),
    setTicTacToeGame: jest.fn(),
    __mockGameInstance: mockGame
  };
});

import { POST } from './route';
import { TicTacToeGame, getTicTacToeGame, setTicTacToeGame } from '@turn-based-mcp/shared';

const mockGetTicTacToeGame = getTicTacToeGame as jest.MockedFunction<typeof getTicTacToeGame>;
const mockSetTicTacToeGame = setTicTacToeGame as jest.MockedFunction<typeof setTicTacToeGame>;

// Get access to the mock game instance from the mocked module
const mockGame = (TicTacToeGame as jest.MockedClass<typeof TicTacToeGame>).mock.results[0]?.value || {
  getInitialState: jest.fn(),
  validateMove: jest.fn(),
  applyMove: jest.fn(),
  checkGameEnd: jest.fn(),
  getValidMoves: jest.fn()
};

describe('/api/games/tic-tac-toe/[id]/move', () => {

  const createMockGameState = (): TicTacToeGameState => ({
    id: 'test-game-1',
    players: [
      { id: 'player1' as const, name: 'Player', isAI: false },
      { id: 'ai' as const, name: 'AI', isAI: true }
    ],
    currentPlayerId: 'player1' as const,
    status: 'playing' as const,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    playerSymbols: {
      player1: 'X' as const,
      ai: 'O' as const
    }
  });

  let mockGameState: TicTacToeGameState;
  let mockGameSession: GameSession<TicTacToeGameState>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock state for each test
    mockGameState = createMockGameState();
    mockGameSession = {
      gameState: mockGameState,
      gameType: 'tic-tac-toe' as const,
      history: []
    };
  });

  describe('POST', () => {
    it('should successfully make a valid move', async () => {
      const move: TicTacToeMove = { row: 0, col: 0 };
      const updatedGameState: TicTacToeGameState = {
        ...mockGameState,
        board: [
          ['X', null, null],
          [null, null, null],
          [null, null, null]
        ],
        currentPlayerId: 'ai' as const,
        updatedAt: new Date('2024-01-01T10:05:00Z')
      };

      mockGetTicTacToeGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(true);
      mockGame.applyMove.mockReturnValue(updatedGameState);
      mockGame.checkGameEnd.mockReturnValue(null);
      mockSetTicTacToeGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockGetTicTacToeGame).toHaveBeenCalledWith('test-game-1');
      expect(mockGame.validateMove).toHaveBeenCalledWith(mockGameState, move, 'player1');
      expect(mockGame.applyMove).toHaveBeenCalledWith(mockGameState, move, 'player1');
      expect(mockGame.checkGameEnd).toHaveBeenCalledWith(updatedGameState);
      expect(mockSetTicTacToeGame).toHaveBeenCalledWith(
        'test-game-1',
        expect.objectContaining({
          gameState: updatedGameState,
          history: expect.arrayContaining([
            expect.objectContaining({
              playerId: 'player1',
              move,
              timestamp: expect.any(Date)
            })
          ])
        })
      );
      expect(responseData.gameState).toEqual(updatedGameState);
    });

    it('should handle game ending after move', async () => {
      const move: TicTacToeMove = { row: 0, col: 0 };
      const winningGameState: TicTacToeGameState = {
        ...mockGameState,
        board: [
          ['X', 'X', 'X'],
          [null, null, null],
          [null, null, null]
        ],
        status: 'finished' as const,
        winner: 'player1' as const,
        updatedAt: new Date('2024-01-01T10:05:00Z')
      };

      mockGetTicTacToeGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(true);
      mockGame.applyMove.mockReturnValue({ ...winningGameState, status: 'playing' as const, winner: undefined });
      mockGame.checkGameEnd.mockReturnValue({ winner: 'player1', reason: 'Three in a row' });
      mockSetTicTacToeGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.gameState.status).toBe('finished');
      expect(responseData.gameState.winner).toBe('player1');
    });

    it('should return 404 when game is not found', async () => {
      mockGetTicTacToeGame.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/non-existent/move', {
        method: 'POST',
        body: JSON.stringify({ move: { row: 0, col: 0 }, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'non-existent' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Game not found' });
      expect(mockGetTicTacToeGame).toHaveBeenCalledWith('non-existent');
    });

    it('should return 400 for invalid moves', async () => {
      const invalidMove: TicTacToeMove = { row: 0, col: 0 };

      mockGetTicTacToeGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: JSON.stringify({ move: invalidMove, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid move' });
      expect(mockGame.validateMove).toHaveBeenCalledWith(mockGameState, invalidMove, 'player1');
      expect(mockGame.applyMove).not.toHaveBeenCalled();
    });

    it('should handle moves when it\'s not player\'s turn', async () => {
      const move: TicTacToeMove = { row: 0, col: 0 };

      mockGetTicTacToeGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(false); // Not player's turn

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'ai' }) // Wrong player
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid move' });
    });

    it('should handle JSON parsing errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: 'invalid-json'
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to process move' });
      expect(consoleSpy).toHaveBeenCalledWith('Error processing move:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle storage errors', async () => {
      const move: TicTacToeMove = { row: 0, col: 0 };
      const storageError = new Error('Database connection failed');

      mockGetTicTacToeGame.mockRejectedValue(storageError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to process move' });
      expect(consoleSpy).toHaveBeenCalledWith('Error processing move:', storageError);
      
      consoleSpy.mockRestore();
    });

    it('should handle missing request body fields', async () => {
      mockGetTicTacToeGame.mockResolvedValue(mockGameSession);

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        body: JSON.stringify({}) // Missing move and playerId
      });

      const params = Promise.resolve({ id: 'test-game-1' });
      const response = await POST(request, { params });

      expect(response.status).toBe(400);
      expect(mockGame.validateMove).toHaveBeenCalledWith(mockGameState, undefined, undefined);
    });
  });
});
