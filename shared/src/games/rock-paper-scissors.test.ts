import { RockPaperScissorsGame } from './rock-paper-scissors';
import type { RPSGameState, RPSMove } from '../types/games';
import type { Player } from '../types/game';

describe('RockPaperScissorsGame', () => {
  let game: RockPaperScissorsGame;
  let players: Player[];
  let initialState: RPSGameState;

  beforeEach(() => {
    game = new RockPaperScissorsGame();
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
      expect(initialState.currentRound).toBe(0);
      expect(initialState.maxRounds).toBe(3);
      expect(initialState.rounds).toHaveLength(3);
      expect(initialState.rounds[0]).toEqual({});
      expect(initialState.scores).toEqual({
        player1: 0,
        player2: 0
      });
      expect(initialState.createdAt).toBeInstanceOf(Date);
      expect(initialState.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('validateMove', () => {
    it('should return true for valid choices', () => {
      const validChoices: RPSMove[] = [
        { choice: 'rock' },
        { choice: 'paper' },
        { choice: 'scissors' }
      ];

      validChoices.forEach(move => {
        expect(game.validateMove(initialState, move, 'player1')).toBe(true);
      });
    });

    it('should return false for invalid choice', () => {
      const invalidMove = { choice: 'invalid' } as any;
      expect(game.validateMove(initialState, invalidMove, 'player1')).toBe(false);
    });

    it('should return false for finished game', () => {
      const finishedState = { ...initialState, status: 'finished' as const };
      const move: RPSMove = { choice: 'rock' };
      expect(game.validateMove(finishedState, move, 'player1')).toBe(false);
    });

    it('should return false if player already made choice in current round', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      
      // Player 1 tries again in same round
      expect(game.validateMove(state, { choice: 'paper' }, 'player1')).toBe(false);
    });

    it('should return false if all rounds completed', () => {
      const completedState = { ...initialState, currentRound: 3 };
      const move: RPSMove = { choice: 'rock' };
      expect(game.validateMove(completedState, move, 'player1')).toBe(false);
    });
  });

  describe('applyMove', () => {
    it('should apply first player choice and switch turns', () => {
      const move: RPSMove = { choice: 'rock' };
      const newState = game.applyMove(initialState, move, 'player1');

      expect(newState.rounds[0].player1Choice).toBe('rock');
      expect(newState.rounds[0].player2Choice).toBeUndefined();
      expect(newState.currentPlayerId).toBe('player2');
      expect(newState.currentRound).toBe(0);
      expect(newState.updatedAt.getTime()).toBeGreaterThanOrEqual(initialState.updatedAt.getTime());
    });

    it('should resolve round when both players choose', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'player2');

      expect(state.rounds[0].player1Choice).toBe('rock');
      expect(state.rounds[0].player2Choice).toBe('scissors');
      expect(state.rounds[0].winner).toBe('player1');
      expect(state.scores.player1).toBe(1);
      expect(state.scores.player2).toBe(0);
      expect(state.currentRound).toBe(1);
      expect(state.currentPlayerId).toBe('player1');
    });

    it('should handle draw round', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');

      expect(state.rounds[0].winner).toBe('draw');
      expect(state.scores.player1).toBe(0);
      expect(state.scores.player2).toBe(0);
      expect(state.currentRound).toBe(1);
    });

    it('should throw error for invalid move', () => {
      const invalidMove = { choice: 'invalid' } as any;
      expect(() => game.applyMove(initialState, invalidMove, 'player1')).toThrow('Invalid move');
    });
  });

  describe('getValidMoves', () => {
    it('should return all choices for valid player in new round', () => {
      const validMoves = game.getValidMoves(initialState, 'player1');
      expect(validMoves).toEqual([
        { choice: 'rock' },
        { choice: 'paper' },
        { choice: 'scissors' }
      ]);
    });

    it('should return empty array if player already made choice', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      
      const validMoves = game.getValidMoves(state, 'player1');
      expect(validMoves).toHaveLength(0);
    });

    it('should return empty array for finished game', () => {
      const finishedState = { ...initialState, status: 'finished' as const };
      const validMoves = game.getValidMoves(finishedState, 'player1');
      expect(validMoves).toHaveLength(0);
    });

    it('should return empty array when all rounds completed', () => {
      const completedState = { ...initialState, currentRound: 3 };
      const validMoves = game.getValidMoves(completedState, 'player1');
      expect(validMoves).toHaveLength(0);
    });
  });

  describe('checkGameEnd', () => {
    it('should return null for ongoing game', () => {
      expect(game.checkGameEnd(initialState)).toBeNull();
    });

    it('should return null until all rounds complete', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'player2');
      
      expect(game.checkGameEnd(state)).toBeNull();
    });

    it('should detect player 1 victory', () => {
      let state = initialState;
      
      // Round 1: Player 1 wins
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'player2');
      
      // Round 2: Player 1 wins
      state = game.applyMove(state, { choice: 'paper' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');
      
      // Round 3: Player 2 wins (but Player 1 still has more wins)
      state = game.applyMove(state, { choice: 'scissors' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'player1',
        reason: 'Won 2-1'
      });
    });

    it('should detect player 2 victory', () => {
      let state = initialState;
      
      // Round 1: Player 2 wins
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'player2');
      
      // Round 2: Player 2 wins
      state = game.applyMove(state, { choice: 'scissors' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');
      
      // Round 3: Player 2 wins
      state = game.applyMove(state, { choice: 'paper' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'player2');

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'player2',
        reason: 'Won 3-0'
      });
    });

    it('should detect draw game', () => {
      let state = initialState;
      
      // Round 1: Draw
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');
      
      // Round 2: Draw
      state = game.applyMove(state, { choice: 'paper' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'player2');
      
      // Round 3: Draw
      state = game.applyMove(state, { choice: 'scissors' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'player2');

      const result = game.checkGameEnd(state);
      expect(result).toEqual({
        winner: 'draw',
        reason: 'Tied 0-0'
      });
    });
  });

  describe('round determination logic', () => {
    it('should correctly determine rock vs scissors', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'player2');
      
      expect(state.rounds[0].winner).toBe('player1');
    });

    it('should correctly determine paper vs rock', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'paper' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');
      
      expect(state.rounds[0].winner).toBe('player1');
    });

    it('should correctly determine scissors vs paper', () => {
      let state = initialState;
      state = game.applyMove(state, { choice: 'scissors' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'player2');
      
      expect(state.rounds[0].winner).toBe('player1');
    });

    it('should handle all winning combinations for player2', () => {
      const testCases = [
        { p1: 'rock', p2: 'paper', expected: 'player2' },
        { p1: 'paper', p2: 'scissors', expected: 'player2' },
        { p1: 'scissors', p2: 'rock', expected: 'player2' }
      ];

      testCases.forEach(({ p1, p2, expected }) => {
        let state = game.getInitialState(players);
        state = game.applyMove(state, { choice: p1 as any }, 'player1');
        state = game.applyMove(state, { choice: p2 as any }, 'player2');
        
        expect(state.rounds[0].winner).toBe(expected);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle AI player correctly', () => {
      const aiPlayers: Player[] = [
        { id: 'player1', name: 'Human', isAI: false },
        { id: 'ai', name: 'AI', isAI: true }
      ];
      const aiState = game.getInitialState(aiPlayers);
      
      expect(aiState.scores).toEqual({
        player1: 0,
        ai: 0
      });
    });

    it('should maintain state immutability', () => {
      const move: RPSMove = { choice: 'rock' };
      const originalRounds = initialState.rounds.map(round => ({ ...round }));
      
      game.applyMove(initialState, move, 'player1');
      
      expect(initialState.rounds).toEqual(originalRounds);
    });

    it('should handle multiple sequential rounds correctly', () => {
      let state = initialState;
      
      // Play all 3 rounds
      for (let round = 0; round < 3; round++) {
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'scissors' }, 'player2');
        
        expect(state.currentRound).toBe(round + 1);
        expect(state.scores.player1).toBe(round + 1);
      }
      
      expect(state.currentRound).toBe(3);
      const result = game.checkGameEnd(state);
      expect(result?.winner).toBe('player1');
    });
  });
});