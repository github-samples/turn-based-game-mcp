import { GameType } from '../types/game';

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return crypto.randomUUID();
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get game display name
 */
export function getGameDisplayName(gameType: GameType): string {
  switch (gameType) {
    case 'tic-tac-toe':
      return 'Tic-Tac-Toe';
    case 'rock-paper-scissors':
      return 'Rock Paper Scissors';
    default:
      return 'Unknown Game';
  }
}


