import { vi } from 'vitest'
import { NextRequest } from 'next/server';
import type { GameSession, RPSGameState, RPSMove } from '@turn-based-mcp/shared';

// Mock dependencies BEFORE importing the route - use factory functions for proper setup
vi.mock('@turn-based-mcp/shared', () => {
  const mockGame = {
    getInitialState: vi.fn(),
    validateMove: vi.fn(),
    applyMove: vi.fn(),
    checkGameEnd: vi.fn(),
    getValidMoves: vi.fn()
  };
  
  return {
    ...vi.importActual('@turn-based-mcp/shared'),
    RockPaperScissorsGame: vi.fn(() => mockGame),
    __mockGameInstance: mockGame
  };
});

vi.mock('../../../../../../lib/game-storage', () => ({
  getRPSGame: vi.fn(),
  setRPSGame: vi.fn()
}));

import { POST } from './route';
import { RockPaperScissorsGame } from '@turn-based-mcp/shared';
import { getRPSGame, setRPSGame } from '../../../../../../lib/game-storage';

const mockGetRPSGame = getRPSGame as vi.MockedFunction<typeof getRPSGame>;
const mockSetRPSGame = setRPSGame as vi.MockedFunction<typeof setRPSGame>;

// Get access to the mock game instance from the mocked module
const mockGame = (RockPaperScissorsGame as vi.MockedClass<typeof RockPaperScissorsGame>).mock.results[0]?.value || {
  getInitialState: vi.fn(),
  validateMove: vi.fn(),
  applyMove: vi.fn(),
  checkGameEnd: vi.fn(),
  getValidMoves: vi.fn()
};

describe('/api/games/rock-paper-scissors/[id]/move', () => {

  const createMockGameState = (): RPSGameState => ({
    id: 'test-rps-1',
    players: [
      { id: 'player1' as const, name: 'Player', isAI: false },
      { id: 'ai' as const, name: 'AI', isAI: true }
    ],
    currentPlayerId: 'player1' as const,
    status: 'playing' as const,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    rounds: [],
    currentRound: 0,
    scores: {
      player1: 0,
      ai: 0
    },
    maxRounds: 3
  });

  let mockGameState: RPSGameState;
  let mockGameSession: GameSession<RPSGameState>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh mock state for each test
    mockGameState = createMockGameState();
    mockGameSession = {
      gameState: mockGameState,
      gameType: 'rock-paper-scissors' as const,
      history: []
    };
  });

  describe('POST', () => {
    it('should successfully make a valid RPS move', async () => {
      const move: RPSMove = { choice: 'rock' };
      const updatedGameState: RPSGameState = {
        ...mockGameState,
        rounds: [{ player1Choice: 'rock', player2Choice: undefined }],
        currentRound: 0,
        currentPlayerId: 'ai' as const,
        updatedAt: new Date('2024-01-01T10:05:00Z')
      };

      mockGetRPSGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(true);
      mockGame.applyMove.mockReturnValue(updatedGameState);
      mockGame.checkGameEnd.mockReturnValue(null);
      mockSetRPSGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-rps-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockGetRPSGame).toHaveBeenCalledWith('test-rps-1');
      expect(mockGame.validateMove).toHaveBeenCalledWith(mockGameState, move, 'player1');
      expect(mockGame.applyMove).toHaveBeenCalledWith(mockGameState, move, 'player1');
      expect(mockGame.checkGameEnd).toHaveBeenCalledWith(updatedGameState);
      expect(mockSetRPSGame).toHaveBeenCalledWith(
        'test-rps-1',
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
      const move: RPSMove = { choice: 'rock' };
      const finishedGameState: RPSGameState = {
        ...mockGameState,
        rounds: [
          { player1Choice: 'rock', player2Choice: 'scissors', winner: 'player1' },
          { player1Choice: 'paper', player2Choice: 'rock', winner: 'player1' },
          { player1Choice: 'scissors', player2Choice: 'paper', winner: 'player1' }
        ],
        currentRound: 3,
        status: 'finished' as const,
        winner: 'player1' as const,
        scores: { player1: 3, ai: 0 },
        updatedAt: new Date('2024-01-01T10:05:00Z')
      };

      mockGetRPSGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(true);
      mockGame.applyMove.mockReturnValue({ ...finishedGameState, status: 'playing' as const, winner: undefined });
      mockGame.checkGameEnd.mockReturnValue({ winner: 'player1', reason: 'Won best of 3' });
      mockSetRPSGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-rps-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.gameState.status).toBe('finished');
      expect(responseData.gameState.winner).toBe('player1');
    });

    it('should return 404 when game is not found', async () => {
      mockGetRPSGame.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/non-existent/move', {
        method: 'POST',
        body: JSON.stringify({ move: { choice: 'rock' }, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'non-existent' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Game not found' });
      expect(mockGetRPSGame).toHaveBeenCalledWith('non-existent');
    });

    it('should return 400 for invalid moves', async () => {
      const invalidMove: RPSMove = { choice: 'rock' };

      mockGetRPSGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        body: JSON.stringify({ move: invalidMove, playerId: 'player1' })
      });

      const params = Promise.resolve({ id: 'test-rps-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid move' });
      expect(mockGame.validateMove).toHaveBeenCalledWith(mockGameState, invalidMove, 'player1');
      expect(mockGame.applyMove).not.toHaveBeenCalled();
    });

    it('should handle moves when it\'s not player\'s turn', async () => {
      const move: RPSMove = { choice: 'rock' };

      mockGetRPSGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(false); // Not player's turn

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        body: JSON.stringify({ move, playerId: 'ai' }) // Wrong player
      });

      const params = Promise.resolve({ id: 'test-rps-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid move' });
    });

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        body: 'invalid-json'
      });

      const params = Promise.resolve({ id: 'test-rps-1' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to process move' });
    });

    it('should handle storage errors gracefully', async () => {
      mockGetRPSGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(true);
      mockGame.applyMove.mockReturnValue(mockGameState);
      mockGame.checkGameEnd.mockReturnValue(null);
      mockSetRPSGame.mockRejectedValue(new Error('Storage failed'));

      const request = new NextRequest('http://localhost/api/games/rock-paper-scissors/test-game/move', {
        method: 'POST',
        body: JSON.stringify({ 
          playerId: 'player1', 
          move: { choice: 'rock' }
        })
      });

      const params = Promise.resolve({ id: 'test-game' });
      const response = await POST(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to process move' });
    });

    it('should handle missing request body fields', async () => {
      mockGetRPSGame.mockResolvedValue(mockGameSession);
      mockGame.validateMove.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        body: JSON.stringify({}) // Missing move and playerId
      });

      const params = Promise.resolve({ id: 'test-rps-1' });
      const response = await POST(request, { params });

      expect(response.status).toBe(400);
      expect(mockGame.validateMove).toHaveBeenCalledWith(mockGameState, undefined, undefined);
    });

    it('should handle different RPS choices', async () => {
      const choices: Array<'rock' | 'paper' | 'scissors'> = ['rock', 'paper', 'scissors'];
      
      for (const choice of choices) {
        vi.clearAllMocks();
        
        // Create fresh state for each iteration to avoid mutation
        const freshMockGameState = createMockGameState();
        const freshMockGameSession = {
          gameState: freshMockGameState,
          gameType: 'rock-paper-scissors' as const,
          history: []
        };
        
        const move: RPSMove = { choice };
        const updatedGameState: RPSGameState = {
          ...freshMockGameState,
          rounds: [{ player1Choice: choice, player2Choice: undefined }],
          currentPlayerId: 'ai' as const
        };

        mockGetRPSGame.mockResolvedValue(freshMockGameSession);
        mockGame.validateMove.mockReturnValue(true);
        mockGame.applyMove.mockReturnValue(updatedGameState);
        mockGame.checkGameEnd.mockReturnValue(null);
        mockSetRPSGame.mockResolvedValue();

        const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
          method: 'POST',
          body: JSON.stringify({ move, playerId: 'player1' })
        });

        const params = Promise.resolve({ id: 'test-rps-1' });
        const response = await POST(request, { params });

        expect(response.status).toBe(200);
        expect(mockGame.validateMove).toHaveBeenCalledWith(freshMockGameState, move, 'player1');
      }
    });
  });
});
