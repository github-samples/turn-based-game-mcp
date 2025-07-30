import { RockPaperScissorsAI } from './rock-paper-scissors-ai'
import { RockPaperScissorsGame } from '@turn-based-mcp/shared'
import type { RPSGameState, RPSChoice } from '@turn-based-mcp/shared'

describe('RockPaperScissorsAI - Current Move Security', () => {
  let ai: RockPaperScissorsAI
  let game: RockPaperScissorsGame

  const createMockGameState = (
    rounds: Array<{
      player1Choice?: RPSChoice
      player2Choice?: RPSChoice  
      winner?: string
    }>,
    currentRound: number
  ): RPSGameState => ({
    id: 'test-game',
    status: 'playing',
    currentPlayerId: 'ai',
    players: [
      { id: 'player1', name: 'Human Player', isAI: false },
      { id: 'ai', name: 'AI Player', isAI: true }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    rounds,
    currentRound,
    scores: { player1: 0, ai: 0 },
    maxRounds: 3
  })

  beforeEach(() => {
    ai = new RockPaperScissorsAI()
    game = new RockPaperScissorsGame()
  })

  describe('Current Round Security Tests', () => {
    it('should not be able to access current round player choice (sanitized input)', async () => {
      // Simulate what the MCP server receives - sanitized data with no current player choice
      const gameStateFromAPI = createMockGameState([
        {
          // Current round - choices should be undefined from sanitized API
          player1Choice: undefined,
          player2Choice: undefined,
          winner: undefined
        }
      ], 0)

      // AI should make a choice without knowing the player's current choice
      const aiChoice = await ai.makeChoice(gameStateFromAPI, 'hard')
      
      // Verify AI made a valid choice
      expect(['rock', 'paper', 'scissors']).toContain(aiChoice)
      
      // Since there's no opponent history (no completed rounds), 
      // AI should fall back to random choice regardless of difficulty
      const choices = []
      for (let i = 0; i < 100; i++) {
        choices.push(await ai.makeChoice(gameStateFromAPI, 'hard'))
      }
      
      // Should have some variation in choices (not always the same)
      const uniqueChoices = new Set(choices)
      expect(uniqueChoices.size).toBeGreaterThan(1)
    })

    it('should only analyze completed rounds, ignoring current round', async () => {
      // Create a game state where:
      // - Round 0: completed (both choices visible)
      // - Round 1: current (player choice hidden by sanitization)  
      const gameStateFromAPI = createMockGameState([
        {
          // Completed round - AI can see this
          player1Choice: 'rock',
          player2Choice: 'scissors',
          winner: 'player1'
        },
        {
          // Current round - sanitized, no choices visible
          player1Choice: undefined,
          player2Choice: undefined,
          winner: undefined
        }
      ], 1)

      // AI should make a choice based only on completed round history
      await ai.makeChoice(gameStateFromAPI, 'medium') // This updates the opponent history
      const analysis = ai.analyzeGameState(gameStateFromAPI)
      
      // Analysis should only reference the completed round
      expect(analysis).toContain('Opponent Patterns:')
      expect(analysis).toContain('Rock: 1 times (100.0%)')
      expect(analysis).not.toContain('Rock: 2 times') // Would only be 2 if current round was visible
      
      // Current round should not be included in round history analysis
      expect(analysis).toContain('Round 1: rock vs scissors - Winner: Human Player')
      expect(analysis).not.toContain('Round 2:') // Current round shouldn't appear
    })

    it('should work with historical pattern detection without current move', async () => {
      // Create game state with completed rounds to establish pattern
      const gameStateFromAPI = createMockGameState([
        {
          player1Choice: 'rock',
          player2Choice: 'paper',
          winner: 'ai'
        },
        {
          player1Choice: 'rock',
          player2Choice: 'paper',
          winner: 'ai'
        },
        {
          // Current round - player choice hidden
          player1Choice: undefined,
          player2Choice: undefined,
          winner: undefined
        }
      ], 2)

      // AI should detect pattern from completed rounds only
      const aiChoice = await ai.makeChoice(gameStateFromAPI, 'medium')
      
      // AI should counter the historical pattern (rock appears twice)
      // So AI should choose paper to beat rock
      expect(aiChoice).toBe('paper')
      
      // Verify opponent history only includes completed rounds
      const analysis = ai.analyzeGameState(gameStateFromAPI)
      expect(analysis).toContain('Rock: 2 times (100.0%)')
      expect(analysis).not.toContain('Rock: 3 times') // Current round not included
    })

    it('should behave consistently when current round data is absent vs present', async () => {
      // This test simulates the difference between regular API (has current data) 
      // vs MCP API (sanitized, no current data)
      
      const completedRounds = [
        { player1Choice: 'paper' as RPSChoice, player2Choice: 'rock' as RPSChoice, winner: 'player1' }
      ]

      // Sanitized state (what MCP server receives)
      const sanitizedState = createMockGameState([
        ...completedRounds,
        { player1Choice: undefined, player2Choice: undefined, winner: undefined }
      ], 1)

      // Unsanitized state (what regular API might have - but MCP server shouldn't see this)
      const unsanitizedState = createMockGameState([
        ...completedRounds,
        { player1Choice: 'scissors' as RPSChoice, player2Choice: undefined, winner: undefined }
      ], 1)

      // Both should produce the same AI choice since AI should only use completed rounds
      const sanitizedChoice = await ai.makeChoice(sanitizedState, 'medium')
      
      // Create new AI instance to avoid state contamination
      const ai2 = new RockPaperScissorsAI()
      const unsanitizedChoice = await ai2.makeChoice(unsanitizedState, 'medium')

      // Both should choose scissors (to counter historical paper)
      expect(sanitizedChoice).toBe('scissors')
      expect(unsanitizedChoice).toBe('scissors')
      
      // This proves that even if unsanitized data were available,
      // the AI logic only uses completed rounds
    })

    it('should make random choice when no completed rounds exist', async () => {
      // Game state with only current round (no history)
      const gameStateFromAPI = createMockGameState([
        {
          player1Choice: undefined, // Sanitized - no access to current choice
          player2Choice: undefined,
          winner: undefined
        }
      ], 0)

      // AI should make random choices since no history exists
      const choices = []
      for (let i = 0; i < 50; i++) {
        choices.push(await ai.makeChoice(gameStateFromAPI, 'hard'))
      }
      
      // Should have variation in choices
      const uniqueChoices = new Set(choices)
      expect(uniqueChoices.size).toBeGreaterThanOrEqual(2)
      
      // All choices should be valid
      choices.forEach(choice => {
        expect(['rock', 'paper', 'scissors']).toContain(choice)
      })
    })
  })

  describe('Historical Data Only Tests', () => {
    it('should only learn from rounds where both players have chosen', async () => {
      const gameStateFromAPI = createMockGameState([
        {
          // Complete round - AI can learn from this  
          player1Choice: 'rock',
          player2Choice: 'scissors',
          winner: 'player1'
        },
        {
          // Incomplete round - player chose but AI hasn't, this should be sanitized
          player1Choice: undefined, // Sanitized by MCP API
          player2Choice: undefined,
          winner: undefined
        }
      ], 1)

      await ai.makeChoice(gameStateFromAPI, 'medium') // This updates the opponent history
      const analysis = ai.analyzeGameState(gameStateFromAPI)
      
      // Should only show pattern from completed round
      expect(analysis).toContain('Rock: 1 times (100.0%)')
      expect(analysis).toContain('Paper: 0 times (0.0%)')
      expect(analysis).toContain('Scissors: 0 times (0.0%)')
      
      // Should not include incomplete round in pattern analysis
      expect(analysis).not.toContain('Rock: 2 times')
    })

    it('should demonstrate that AI cannot cheat even with adaptive strategy', async () => {
      // Set up a scenario where knowing the current move would give significant advantage
      const gameStateFromAPI = createMockGameState([
        // Establish a pattern of player always choosing rock
        { player1Choice: 'rock', player2Choice: 'scissors', winner: 'player1' },
        { player1Choice: 'rock', player2Choice: 'scissors', winner: 'player1' },
        { player1Choice: 'rock', player2Choice: 'scissors', winner: 'player1' },
        // Current round - if player breaks pattern and chooses paper, AI shouldn't know
        { player1Choice: undefined, player2Choice: undefined, winner: undefined }
      ], 3)

      // AI with adaptive strategy should choose paper (to beat expected rock)
      const aiChoice = await ai.makeChoice(gameStateFromAPI, 'medium')
      expect(aiChoice).toBe('paper') // Countering historical pattern
      
      // AI is predicting based on history, not current move
      // If player actually chose 'paper' this round, AI would lose (paper vs paper = draw)
      // This proves AI cannot see current move to adjust strategy  
    })
  })
})
