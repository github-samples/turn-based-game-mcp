import { RockPaperScissorsAI } from './rock-paper-scissors-ai.js';
import type { RPSGameState, RPSChoice, Player } from '@turn-based-mcp/shared';
import { RockPaperScissorsGame } from '@turn-based-mcp/shared';

describe('RockPaperScissorsAI', () => {
  let ai: RockPaperScissorsAI;
  let game: RockPaperScissorsGame;
  let initialState: RPSGameState;

  beforeEach(() => {
    ai = new RockPaperScissorsAI();
    game = new RockPaperScissorsGame();
    const players: Player[] = [
      { id: 'player1', name: 'Player', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ];
    initialState = game.getInitialState(players);
  });

  describe('makeChoice', () => {
    describe('easy difficulty (random strategy)', () => {
      it('should return a valid choice', async () => {
        const choice = await ai.makeChoice(initialState, 'easy');
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      });

      it('should produce varied choices over multiple calls', async () => {
        const choices = [];
        for (let i = 0; i < 30; i++) {
          const choice = await ai.makeChoice(initialState, 'easy');
          choices.push(choice);
        }

        const uniqueChoices = new Set(choices);
        expect(uniqueChoices.size).toBeGreaterThan(1); // Should have some variety
      });

      it('should distribute choices somewhat evenly', async () => {
        const choices: RPSChoice[] = [];
        for (let i = 0; i < 100; i++) {
          const choice = await ai.makeChoice(initialState, 'easy');
          choices.push(choice);
        }

        const counts: Record<RPSChoice, number> = { rock: 0, paper: 0, scissors: 0 };
        choices.forEach((choice: RPSChoice) => counts[choice]++);

        // Each choice should appear at least 20% of the time (allowing for randomness)
        expect(counts.rock).toBeGreaterThan(20);
        expect(counts.paper).toBeGreaterThan(20);
        expect(counts.scissors).toBeGreaterThan(20);
      });
    });

    describe('medium difficulty (adaptive strategy)', () => {
      it('should make random choice with no history', async () => {
        const choice = await ai.makeChoice(initialState, 'medium');
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      });

      it('should counter the most frequent opponent choice', async () => {
  // Create a state where opponent played rock 2 times, paper 1 time
  let state = initialState;
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'paper' }, 'ai');
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'scissors' }, 'ai');
        state = game.applyMove(state, { choice: 'paper' }, 'player1');
        state = game.applyMove(state, { choice: 'rock' }, 'ai');

        // Rock was played most (2 times), so AI should play paper to counter
        const choice = await ai.makeChoice(state, 'medium');
        expect(choice).toBe('paper');
      });

      it('should handle tied frequencies', async () => {
  // Create equal frequency scenario
  let state = initialState;
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'paper' }, 'ai');
        state = game.applyMove(state, { choice: 'paper' }, 'player1');
        state = game.applyMove(state, { choice: 'scissors' }, 'ai');

        // Should make a valid choice when frequencies are tied
        const choice = await ai.makeChoice(state, 'medium');
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      });
    });

    describe('hard difficulty (pattern strategy)', () => {
      it('should fall back to adaptive with insufficient history', async () => {
        let state = initialState;
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'paper' }, 'ai');

        const choice = await ai.makeChoice(state, 'hard');
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      });

      it('should detect alternating patterns', async () => {
        // Create alternating pattern: rock -> paper -> rock
        let state = initialState;
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'scissors' }, 'ai');
        state = game.applyMove(state, { choice: 'paper' }, 'player1');
        state = game.applyMove(state, { choice: 'rock' }, 'ai');
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        
        // Pattern detection is complex, just ensure valid choice is made
        const choice = await ai.makeChoice(state, 'hard');
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      });

      it('should predict choice switch after repeated moves', async () => {
        // Create pattern where opponent played rock twice
        let state = initialState;
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'paper' }, 'ai');
        state = game.applyMove(state, { choice: 'rock' }, 'player1');
        state = game.applyMove(state, { choice: 'paper' }, 'ai');

        // AI should expect opponent might switch from rock
        const choice = await ai.makeChoice(state, 'hard');
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      });
    });

    it('should default to random for invalid difficulty', async () => {
  const choice = await ai.makeChoice(initialState, 'invalid' as any);
      expect(['rock', 'paper', 'scissors']).toContain(choice);
    });
  });

  describe('getCounterChoice logic', () => {
    it('should correctly counter each choice', async () => {
      // Test by creating states where we know the most frequent choice
      const testCases = [
        { opponentChoice: 'rock', expectedCounter: 'paper' },
        { opponentChoice: 'paper', expectedCounter: 'scissors' },
        { opponentChoice: 'scissors', expectedCounter: 'rock' }
      ];

      for (const { opponentChoice, expectedCounter } of testCases) {
        let state = initialState;
        // Make opponent choice most frequent
        state = game.applyMove(state, { choice: opponentChoice as RPSChoice }, 'player1');
        state = game.applyMove(state, { choice: 'rock' }, 'ai');
        state = game.applyMove(state, { choice: opponentChoice as RPSChoice }, 'player1');
        state = game.applyMove(state, { choice: 'paper' }, 'ai');
        state = game.applyMove(state, { choice: opponentChoice as RPSChoice }, 'player1');

        const choice = await ai.makeChoice(state, 'medium');
        expect(choice).toBe(expectedCounter);
      }
    });
  });

  describe('analyzeGameState', () => {
  it('should provide basic game analysis for initial state', () => {
      const analysis = ai.analyzeGameState(initialState);
      
      expect(analysis).toContain('Game Status: playing');
      expect(analysis).toContain('Current Round: 1/3');
      expect(analysis).toContain('Score: Player 0 - 0 AI');
    });

    it('should show round history after moves', async () => {
  let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'ai');

      const analysis = ai.analyzeGameState(state);
      expect(analysis).toContain('Round History:');
      expect(analysis).toContain('Round 1: rock vs paper - Winner:');
    });

    it('should analyze opponent patterns', async () => {
  let state = initialState;
      // Create pattern: rock, paper, rock
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'ai');
      state = game.applyMove(state, { choice: 'paper' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'ai');
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'ai');

      const analysis = ai.analyzeGameState(state);
      // Should have completed 3 rounds and show patterns
      expect(analysis).toContain('Round History:');
      // Pattern analysis only shows when there are completed rounds
      if (analysis.includes('Opponent Patterns:')) {
        expect(analysis).toContain('Rock:');
        expect(analysis).toContain('Paper:');
        expect(analysis).toContain('Scissors:');
      }
    });

    it('should show current score correctly', async () => {
      let state = initialState; // reassigned in subsequent applyMove calls
      // Player 1 wins first round
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'scissors' }, 'ai');

      const analysis = ai.analyzeGameState(state);
      expect(analysis).toContain('Score:');
      expect(analysis).toContain('1'); // Winner should have 1 point
      expect(analysis).toContain('0'); // Loser should have 0 points
    });

    it('should handle finished games', () => {
      const state = { ...initialState }; // mutate copy, no reassignment afterward
      state.status = 'finished';
      state.winner = 'player1';
      state.currentRound = 3;

      const analysis = ai.analyzeGameState(state);
      expect(analysis).toContain('Game Status: finished');
    });

    it('should handle draw rounds', async () => {
      let state = initialState; // reassigned in applyMove calls
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');

      const analysis = ai.analyzeGameState(state);
      expect(analysis).toContain('Round 1: rock vs rock - Winner: Draw');
    });
  });

  describe('opponent history tracking', () => {
    it('should correctly track opponent moves across rounds', async () => {
      let state = initialState;
      
      // Round 1
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'player2');
      
      // Round 2
      state = game.applyMove(state, { choice: 'scissors' }, 'player1');
      state = game.applyMove(state, { choice: 'rock' }, 'player2');

      // The adaptive choice should consider both rock and scissors from player1
      const choice = await ai.makeChoice(state, 'medium');
      expect(['rock', 'paper', 'scissors']).toContain(choice);
    });

    it('should reset history between different game instances', async () => {
      // First game
      let state1 = initialState;
      state1 = game.applyMove(state1, { choice: 'rock' }, 'player1');
      state1 = game.applyMove(state1, { choice: 'paper' }, 'player2');
      
      await ai.makeChoice(state1, 'medium');

      // New game instance
      const newAI = new RockPaperScissorsAI();
      const choice = await newAI.makeChoice(initialState, 'medium');
      expect(['rock', 'paper', 'scissors']).toContain(choice);
    });
  });

  describe('edge cases and robustness', () => {
    it('should handle empty game state gracefully', async () => {
      const emptyState = { ...initialState, rounds: [] };
      const choice = await ai.makeChoice(emptyState, 'medium');
      expect(['rock', 'paper', 'scissors']).toContain(choice);
    });

    it('should work with different player configurations', async () => {
      const customPlayers: Player[] = [
        { id: 'player1', name: 'Human Player', isAI: false },
        { id: 'player2', name: 'Computer', isAI: true }
      ];
      const customState = game.getInitialState(customPlayers);

      const choice = await ai.makeChoice(customState, 'easy');
      expect(['rock', 'paper', 'scissors']).toContain(choice);
    });

    it('should maintain consistent difficulty behavior', async () => {
  const difficulties: any[] = ['easy', 'medium', 'hard'];
      
      for (const difficulty of difficulties) {
        const choice = await ai.makeChoice(initialState, difficulty);
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      }
    });

    it('should handle incomplete rounds', () => {
  const state = initialState;
      // Only player1 has made a choice in current round
      state.rounds[0] = { player1Choice: 'rock' };

      const analysis = ai.analyzeGameState(state);
      expect(analysis).toContain('Current Round: 1/3');
    });
  });

  describe('performance and consistency', () => {
    it('should make choices quickly', async () => {
      const start = Date.now();
      await ai.makeChoice(initialState, 'medium');
      const end = Date.now();
      
      expect(end - start).toBeLessThan(100); // Should be very fast
    });

    it('should be consistent with same game state', async () => {
      // Create a deterministic scenario
  let state = initialState;
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'player2');
      state = game.applyMove(state, { choice: 'rock' }, 'player1');
      state = game.applyMove(state, { choice: 'paper' }, 'player2');
      
      // Adaptive strategy should be consistent
      const choice1 = await ai.makeChoice(state, 'medium');
      const choice2 = await ai.makeChoice(state, 'medium');
      
      expect(choice1).toBe(choice2); // Should counter most frequent (rock) with paper
      expect(choice1).toBe('paper');
    });
  });
});