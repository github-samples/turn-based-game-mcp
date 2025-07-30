import * as gamesIndex from './index';
import { TicTacToeGame } from './tic-tac-toe';
import { RockPaperScissorsGame } from './rock-paper-scissors';

describe('Games Index', () => {
  it('should export TicTacToeGame', () => {
    expect(gamesIndex.TicTacToeGame).toBe(TicTacToeGame);
    expect(gamesIndex.TicTacToeGame).toBeDefined();
  });

  it('should export RockPaperScissorsGame', () => {
    expect(gamesIndex.RockPaperScissorsGame).toBe(RockPaperScissorsGame);
    expect(gamesIndex.RockPaperScissorsGame).toBeDefined();
  });

  it('should have correct number of exports', () => {
    const exports = Object.keys(gamesIndex);
    expect(exports).toHaveLength(2);
    expect(exports).toContain('TicTacToeGame');
    expect(exports).toContain('RockPaperScissorsGame');
  });
});
