import type { RPSGameState, RPSChoice, Difficulty } from '@turn-based-mcp/shared'
import { RockPaperScissorsGame } from '@turn-based-mcp/shared'

export type Strategy = 'random' | 'adaptive' | 'pattern'

/**
 * AI opponent for Rock Paper Scissors with multiple strategic approaches
 * 
 * Provides three difficulty levels:
 * - Easy: Random choices (unpredictable)
 * - Medium: Adaptive strategy (counters opponent's most frequent choice)
 * - Hard: Pattern detection (attempts to detect and counter opponent patterns)
 * 
 * @example
 * ```typescript
 * const ai = new RockPaperScissorsAI();
 * const choice = await ai.makeChoice(gameState, 'hard');
 * const analysis = ai.analyzeGameState(gameState);
 * ```
 */
export class RockPaperScissorsAI {
  private game = new RockPaperScissorsGame()
  private opponentHistory: RPSChoice[] = []

  /**
   * Makes an AI choice based on the specified difficulty level
   * 
   * @param gameState - Current game state
   * @param difficulty - AI difficulty level ('easy' | 'medium' | 'hard')
   * @returns Promise resolving to the AI's choice
   * 
   * @description
   * - Easy: Equal probability for all choices (random)
   * - Medium: Counters opponent's most frequent historical choice (adaptive)
   * - Hard: Attempts to detect patterns in opponent play and counter predicted next move (pattern)
   */
  async makeChoice(gameState: RPSGameState, difficulty: Difficulty = 'medium'): Promise<RPSChoice> {
    // Update opponent history from game state
    this.updateOpponentHistory(gameState)

    // Map difficulty to strategy
    const strategy = this.difficultyToStrategy(difficulty)
    
    switch (strategy) {
      case 'random':
        return this.makeRandomChoice()
      case 'adaptive':
        return this.makeAdaptiveChoice()
      case 'pattern':
        return this.makePatternBasedChoice()
      default:
        return this.makeRandomChoice()
    }
  }

  /**
   * Maps difficulty levels to internal strategies
   * 
   * @param difficulty - The difficulty level
   * @returns The corresponding strategy
   * @private
   */
  private difficultyToStrategy(difficulty: Difficulty): Strategy {
    switch (difficulty) {
      case 'easy':
        return 'random'
      case 'medium':
        return 'adaptive'
      case 'hard':
        return 'pattern'
      default:
        return 'adaptive'
    }
  }

  /**
   * Makes a completely random choice among rock, paper, scissors
   * 
   * @returns Random RPSChoice with equal probability
   * @private
   */
  private makeRandomChoice(): RPSChoice {
    const choices: RPSChoice[] = ['rock', 'paper', 'scissors']
    return choices[Math.floor(Math.random() * choices.length)]
  }

  /**
   * Makes choices based on countering opponent's most frequent historical choice
   * 
   * @returns Choice that beats opponent's most frequent choice, or random if no history
   * @private
   * 
   * @description
   * Analyzes all of opponent's previous choices, finds the most frequent one,
   * and returns the choice that would beat it. Falls back to random if no history.
   */
  private makeAdaptiveChoice(): RPSChoice {
    if (this.opponentHistory.length === 0) {
      return this.makeRandomChoice()
    }

    // Count opponent's choice frequency
    const counts = { rock: 0, paper: 0, scissors: 0 }
    this.opponentHistory.forEach(choice => counts[choice]++)

    // Find most frequent choice
    let mostFrequent: RPSChoice = 'rock'
    let maxCount = 0
    for (const [choice, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count
        mostFrequent = choice as RPSChoice
      }
    }

    // Counter the most frequent choice
    return this.getCounterChoice(mostFrequent)
  }

  /**
   * Attempts to detect patterns in recent opponent moves and counter them
   * 
   * @returns Choice based on pattern prediction, or adaptive fallback
   * @private
   * 
   * @description
   * Looks for patterns in the last few moves:
   * - Alternating pattern detection (A-B-A suggests next is B)
   * - Repeated choice detection (A-A suggests opponent might switch)
   * Falls back to adaptive strategy if patterns are unclear.
   */
  private makePatternBasedChoice(): RPSChoice {
    if (this.opponentHistory.length < 2) {
      return this.makeAdaptiveChoice()
    }

    // Look for patterns in recent moves
    const recent = this.opponentHistory.slice(-3)
    
    // If opponent is alternating between two choices
    if (recent.length >= 2) {
      const last = recent[recent.length - 1]
      const secondLast = recent[recent.length - 2]
      
      // If there's a pattern of alternation
      if (recent.length >= 3) {
        const thirdLast = recent[recent.length - 3]
        if (thirdLast === last && thirdLast !== secondLast) {
          // Predict they'll play the alternating choice
          return this.getCounterChoice(secondLast)
        }
      }
      
      // If they played the same thing twice, predict they might switch
      if (last === secondLast) {
        const choices: RPSChoice[] = ['rock', 'paper', 'scissors']
        const others = choices.filter(c => c !== last)
        const predicted = others[Math.floor(Math.random() * others.length)]
        return this.getCounterChoice(predicted)
      }
    }

    // Fallback to adaptive strategy
    return this.makeAdaptiveChoice()
  }

  /**
   * Returns the choice that beats the given choice in RPS rules
   * 
   * @param choice - The choice to counter
   * @returns The choice that beats the input choice
   * @private
   * 
   * @description
   * RPS counter rules:
   * - Rock is beaten by Paper
   * - Paper is beaten by Scissors  
   * - Scissors is beaten by Rock
   */
  private getCounterChoice(choice: RPSChoice): RPSChoice {
    switch (choice) {
      case 'rock': return 'paper'
      case 'paper': return 'scissors'
      case 'scissors': return 'rock'
    }
  }

  /**
   * Updates internal opponent history by extracting moves from completed rounds
   * 
   * @param gameState - Current game state to extract history from
   * @private
   * 
   * @description
   * Rebuilds the opponent history array from the game state's completed rounds.
   * Assumes player1 is the human opponent whose patterns we want to learn.
   */
  private updateOpponentHistory(gameState: RPSGameState): void {
    // Extract opponent moves from completed rounds
    this.opponentHistory = []
    
    for (let i = 0; i < gameState.currentRound; i++) {
      const round = gameState.rounds[i]
      if (round.player1Choice) {
        // Assuming player1 is the human opponent
        this.opponentHistory.push(round.player1Choice)
      }
    }
  }

  /**
   * Provides comprehensive analysis of the current RPS game state
   * 
   * @param gameState - Game state to analyze
   * @returns Detailed analysis string with game status, history, and patterns
   * 
   * @description
   * Analyzes:
   * - Current game status and round progress
   * - Score breakdown between players
   * - Complete round history with winners
   * - Opponent choice patterns and frequency analysis
   */
  analyzeGameState(gameState: RPSGameState): string {
    const analysis: string[] = []
    
    // Game status
    analysis.push(`Game Status: ${gameState.status}`)
    analysis.push(`Current Round: ${gameState.currentRound + 1}/${gameState.maxRounds}`)
    
    // Score analysis
    const player1Score = gameState.scores[gameState.players[0].id] || 0
    const player2Score = gameState.scores[gameState.players[1].id] || 0
    analysis.push(`Score: ${gameState.players[0].name} ${player1Score} - ${player2Score} ${gameState.players[1].name}`)
    
    // Round history
    if (gameState.currentRound > 0) {
      analysis.push('\nRound History:')
      for (let i = 0; i < gameState.currentRound; i++) {
        const round = gameState.rounds[i]
        const p1Choice = round.player1Choice || '?'
        const p2Choice = round.player2Choice || '?'
        const winner = round.winner === 'draw' ? 'Draw' : 
                      round.winner === 'player1' ? gameState.players[0].name : 
                      gameState.players[1].name
        analysis.push(`Round ${i + 1}: ${p1Choice} vs ${p2Choice} - Winner: ${winner}`)
      }
    }
    
    // Strategy insights
    if (this.opponentHistory.length > 0) {
      const counts = { rock: 0, paper: 0, scissors: 0 }
      this.opponentHistory.forEach(choice => counts[choice]++)
      
      analysis.push('\nOpponent Patterns:')
      analysis.push(`Rock: ${counts.rock} times (${(counts.rock / this.opponentHistory.length * 100).toFixed(1)}%)`)
      analysis.push(`Paper: ${counts.paper} times (${(counts.paper / this.opponentHistory.length * 100).toFixed(1)}%)`)
      analysis.push(`Scissors: ${counts.scissors} times (${(counts.scissors / this.opponentHistory.length * 100).toFixed(1)}%)`)
    }
    
    return analysis.join('\n')
  }
}
