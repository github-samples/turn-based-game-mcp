import { TicTacToeGame } from './tic-tac-toe';
import type { TicTacToeGameState, TicTacToeMove } from '../types/games';
import type { Player } from '../types/game';

describe('TicTacToeGame', () => {
  let game: TicTacToeGame;
  let players: Player[];
  let initialState: TicTacToeGameState;

  beforeEach(() => {
    game = new TicTacToeGame();
    players = [
      { id: 'player1', name: 'Player 1', isAI: false },
      { id: 'player2', name: 'Player 2', isAI: true }
    ];
    initialState = game.getInitialState(players);
  });

  describe('getInitialState', () => {
    it('should create a valid initial game state', () => {
      expect(initialState.id).toBeDefined();
      expect(initialState.players).toEqual(players);
      expect(initialState.currentPlayerId).toBe('player1');
      expect(initialState.status).toBe('playing');
      expect(initialState.board).toEqual([
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]);
      expect(initialState.playerSymbols).toEqual({
        player1: 'X',
        player2: 'O'
      });
      expect(initialState.createdAt).toBeInstanceOf(Date);
      expect(initialState.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('validateMove', () => {
    it('should return true for valid move', () => {
      const move: TicTacToeMove = { row: 0, col: 0 };
      expect(game.validateMove(initialState, move, 'player1')).toBe(true);
    });

    it('should return false if not player\'s turn', () => {
      const move: TicTacToeMove = { row: 0, col: 0 };
      expect(game.validateMove(initialState, move, 'player2')).toBe(false);
    });

    it('should return false for out of bounds moves', () => {
      const outOfBoundsMoves: TicTacToeMove[] = [
        { row: -1, col: 0 },
        { row: 0, col: -1 },
        { row: 3, col: 0 },
        { row: 0, col: 3 },
        { row: -1, col: -1 },
        { row: 3, col: 3 }
      ];

      outOfBoundsMoves.forEach(move => {
        expect(game.validateMove(initialState, move, 'player1')).toBe(false);
      });
    });

    it('should return false for occupied cell', () => {
      const stateWithMove = game.applyMove(initialState, { row: 0, col: 0 }, 'player1');
      const move: TicTacToeMove = { row: 0, col: 0 };
      expect(game.validateMove(stateWithMove, move, 'player2')).toBe(false);
    });
  });

  describe('applyMove', () => {
    it('should apply valid move and switch players', () => {
      const move: TicTacToeMove = { row: 1, col: 1 };
      const newState = game.applyMove(initialState, move, 'player1');

      expect(newState.board[1][1]).toBe('X');
      expect(newState.currentPlayerId).toBe('player2');
      expect(newState.updatedAt.getTime()).toBeGreaterThanOrEqual(initialState.updatedAt.getTime());
    });

    it('should throw error for invalid move', () => {
      const invalidMove: TicTacToeMove = { row: -1, col: 0 };
      expect(() => game.applyMove(initialState, invalidMove, 'player1')).toThrow('Invalid move');
    });

    it('should not modify original state', () => {
      const move: TicTacToeMove = { row: 0, col: 0 };
      const originalBoard = initialState.board.map(row => [...row]);
      
      game.applyMove(initialState, move, 'player1');
      
      expect(initialState.board).toEqual(originalBoard);
    });
  });

  describe('getValidMoves', () => {
    it('should return all empty cells for valid player', () => {
      const validMoves = game.getValidMoves(initialState, 'player1');
      expect(validMoves).toHaveLength(9);
      
      // Check all cells are included
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          expect(validMoves).toContainEqual({ row, col });
        }
      }
    });

    it('should return empty array for wrong player', () => {
      const validMoves = game.getValidMoves(initialState, 'player2');
      expect(validMoves).toHaveLength(0);
    });

    it('should exclude occupied cells', () => {
      const stateWithMove = game.applyMove(initialState, { row: 1, col: 1 }, 'player1');
      const validMoves = game.getValidMoves(stateWithMove, 'player2');
      
      expect(validMoves).toHaveLength(8);
      expect(validMoves).not.toContainEqual({ row: 1, col: 1 });
    });
  });

  describe('checkGameEnd', () => {
    it('should return null for ongoing game', () => {
      expect(game.checkGameEnd(initialState)).toBeNull();
    });

    it('should detect row wins', () => {
      let state = initialState;
      // Player 1 wins top row
      state = game.applyMove(state, { row: 0, col: 0 }, 'player1'); // X
      state = game.applyMove(state, { row: 1, col: 0 }, 'player2'); // O
      state = game.applyMove(state, { row: 0, col: 1 }, 'player1'); // X
      state = game.applyMove(state, { row: 1, col: 1 }, 'player2'); // O
      state = game.applyMove(state, { row: 0, col: 2 }, 'player1'); // X - wins

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'player1',
        reason: 'Three in a row (row 1)'
      });
    });

    it('should detect column wins', () => {
      let state = initialState;
      // Player 2 wins first column
      state = game.applyMove(state, { row: 1, col: 1 }, 'player1'); // X
      state = game.applyMove(state, { row: 0, col: 0 }, 'player2'); // O
      state = game.applyMove(state, { row: 0, col: 1 }, 'player1'); // X
      state = game.applyMove(state, { row: 1, col: 0 }, 'player2'); // O
      state = game.applyMove(state, { row: 0, col: 2 }, 'player1'); // X
      state = game.applyMove(state, { row: 2, col: 0 }, 'player2'); // O - wins

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'player2',
        reason: 'Three in a column (column 1)'
      });
    });

    it('should detect diagonal wins', () => {
      let state = initialState;
      // Player 1 wins main diagonal
      state = game.applyMove(state, { row: 0, col: 0 }, 'player1'); // X
      state = game.applyMove(state, { row: 0, col: 1 }, 'player2'); // O
      state = game.applyMove(state, { row: 1, col: 1 }, 'player1'); // X
      state = game.applyMove(state, { row: 0, col: 2 }, 'player2'); // O
      state = game.applyMove(state, { row: 2, col: 2 }, 'player1'); // X - wins

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'player1',
        reason: 'Three in a diagonal'
      });
    });

    it('should detect anti-diagonal wins', () => {
      let state = initialState;
      // Player 2 wins anti-diagonal
      state = game.applyMove(state, { row: 0, col: 0 }, 'player1'); // X
      state = game.applyMove(state, { row: 0, col: 2 }, 'player2'); // O
      state = game.applyMove(state, { row: 0, col: 1 }, 'player1'); // X
      state = game.applyMove(state, { row: 1, col: 1 }, 'player2'); // O
      state = game.applyMove(state, { row: 1, col: 0 }, 'player1'); // X
      state = game.applyMove(state, { row: 2, col: 0 }, 'player2'); // O - wins

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'player2',
        reason: 'Three in a diagonal'
      });
    });

    it('should detect draw game', () => {
      let state = initialState;
      // Fill board with no winner
      const moves = [
        { player: 'player1', move: { row: 0, col: 0 } }, // X
        { player: 'player2', move: { row: 0, col: 1 } }, // O
        { player: 'player1', move: { row: 0, col: 2 } }, // X
        { player: 'player2', move: { row: 1, col: 0 } }, // O
        { player: 'player1', move: { row: 1, col: 1 } }, // X
        { player: 'player2', move: { row: 2, col: 0 } }, // O
        { player: 'player1', move: { row: 1, col: 2 } }, // X
        { player: 'player2', move: { row: 2, col: 2 } }, // O
        { player: 'player1', move: { row: 2, col: 1 } }  // X
      ];

      moves.forEach(({ player, move }) => {
        state = game.applyMove(state, move, player as any);
      });

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'draw',
        reason: 'Board is full'
      });
    });

    it('should continue game when not finished', () => {
      let state = initialState;
      state = game.applyMove(state, { row: 0, col: 0 }, 'player1');
      state = game.applyMove(state, { row: 1, col: 1 }, 'player2');

      expect(game.checkGameEnd(state)).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle AI player correctly', () => {
      const aiPlayers: Player[] = [
        { id: 'player1', name: 'Human', isAI: false },
        { id: 'ai', name: 'AI', isAI: true }
      ];
      const aiState = game.getInitialState(aiPlayers);
      
      expect(aiState.playerSymbols).toEqual({
        player1: 'X',
        ai: 'O'
      });
    });

    it('should handle game state with different player names', () => {
      const customPlayers: Player[] = [
        { id: 'player1', name: 'Alice', isAI: false },
        { id: 'player2', name: 'Bob', isAI: false }
      ];
      const customState = game.getInitialState(customPlayers);
      
      expect(customState.playerSymbols).toEqual({
        player1: 'X',
        player2: 'O'
      });
      expect(customState.currentPlayerId).toBe('player1');
    });
  });
});