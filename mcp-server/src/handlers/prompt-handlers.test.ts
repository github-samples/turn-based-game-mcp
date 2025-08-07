/**
 * Tests for prompt handlers
 */

import { listPrompts, getPrompt } from '../handlers/prompt-handlers'

describe('Prompt Handlers', () => {
  describe('listPrompts', () => {
    it('should return all available prompts', async () => {
      const result = await listPrompts()
      
      expect(result.prompts).toBeDefined()
      expect(Array.isArray(result.prompts)).toBe(true)
      expect(result.prompts.length).toBeGreaterThan(0)
      
      // Check for expected prompt categories
      const promptNames = result.prompts.map(p => p.name)
      
      // Game rules prompts
      expect(promptNames).toContain('tic_tac_toe_rules')
      expect(promptNames).toContain('rock_paper_scissors_rules')
      
      // Strategy prompts
      expect(promptNames).toContain('difficulty_strategy_guide')
      expect(promptNames).toContain('beating_hard_ai')
      
      // Workflow prompts
      expect(promptNames).toContain('getting_started')
      expect(promptNames).toContain('mcp_game_workflow')
      
      // Help prompts
      expect(promptNames).toContain('troubleshooting')
    })

    it('should return prompts with proper structure', async () => {
      const result = await listPrompts()
      
      result.prompts.forEach(prompt => {
        expect(prompt.name).toBeDefined()
        expect(typeof prompt.name).toBe('string')
        expect(prompt.description).toBeDefined()
        expect(typeof prompt.description).toBe('string')
        
        if (prompt.arguments) {
          expect(Array.isArray(prompt.arguments)).toBe(true)
          prompt.arguments.forEach(arg => {
            expect(arg.name).toBeDefined()
            expect(arg.description).toBeDefined()
            expect(typeof arg.name).toBe('string')
            expect(typeof arg.description).toBe('string')
          })
        }
      })
    })
  })

  describe('getPrompt', () => {
    describe('Game Rules Prompts', () => {
      it('should return tic-tac-toe rules', async () => {
        const result = await getPrompt('tic_tac_toe_rules')
        
        expect(result.description).toBeDefined()
        expect(result.messages).toBeDefined()
        expect(Array.isArray(result.messages)).toBe(true)
        expect(result.messages.length).toBe(1)
        
        const message = result.messages[0]
        expect(message.role).toBe('user')
        expect(message.content.type).toBe('text')
        expect(message.content.text).toContain('Please explain how to play Tic-Tac-Toe')
        expect(message.content.text).toContain('objective of the game')
        expect(message.content.text).toContain("create_game with gameType: 'tic-tac-toe'")
      })

      it('should return rock-paper-scissors rules', async () => {
        const result = await getPrompt('rock_paper_scissors_rules')
        
        expect(result.messages[0].role).toBe('user')
        expect(result.messages[0].content.text).toContain('Please explain how to play Rock Paper Scissors')
        expect(result.messages[0].content.text).toContain('what beats what')
        expect(result.messages[0].content.text).toContain("create_game with gameType: 'rock-paper-scissors'")
      })
    })

    describe('Strategy Prompts', () => {
      it('should return general strategy guide', async () => {
        const result = await getPrompt('difficulty_strategy_guide')
        
        expect(result.messages[0].content.text).toContain('Please provide a complete strategy guide')
        expect(result.messages[0].content.text).toContain('Easy:')
        expect(result.messages[0].content.text).toContain('Medium:')
        expect(result.messages[0].content.text).toContain('Hard:')
      })

      it('should return specific game strategy guide', async () => {
        const result = await getPrompt('difficulty_strategy_guide', { 
          gameType: 'tic-tac-toe' 
        })
        
        const content = result.messages[0].content.text
        expect(content).toContain('comprehensive strategies for TIC-TAC-TOE')
        expect(content).toContain('EASY difficulty:')
        expect(content).toContain('MEDIUM difficulty:')
        expect(content).toContain('HARD difficulty:')
      })

      it('should return specific difficulty strategy guide', async () => {
        const result = await getPrompt('difficulty_strategy_guide', { 
          difficulty: 'hard' 
        })
        
        const content = result.messages[0].content.text
        expect(content).toContain('strategies for HARD difficulty')
        expect(content).toContain('For TIC TAC TOE:')
        expect(content).toContain('For ROCK PAPER SCISSORS:')
      })

      it('should return specific game and difficulty strategy', async () => {
        const result = await getPrompt('difficulty_strategy_guide', { 
          gameType: 'tic-tac-toe',
          difficulty: 'hard'
        })
        
        const content = result.messages[0].content.text
        expect(content).toContain('Perfect play is required')
        expect(content).toContain('optimal to achieve a draw')
      })

      it('should return beating hard AI guide', async () => {
        const result = await getPrompt('beating_hard_ai')
        
        const content = result.messages[0].content.text
        expect(content).toContain('beat the hardest AI opponents')
        expect(content).toContain('hard AI behaves')
        expect(content).toContain('algorithms and strategies')
        expect(content).toContain('advanced, expert-level advice')
      })
    })

    describe('Workflow Prompts', () => {
      it('should return getting started guide', async () => {
        const result = await getPrompt('getting_started')
        
        const content = result.messages[0].content.text
        expect(content).toContain("I'm new to this turn-based games MCP server")
        expect(content).toContain('What games are available')
        expect(content).toContain('How to create a new game')
        expect(content).toContain('game flow pattern')
        expect(content).toContain('example session')
      })

      it('should return MCP workflow guide', async () => {
        const result = await getPrompt('mcp_game_workflow')
        
        const content = result.messages[0].content.text
        expect(content).toContain('technical architecture of this Model Context Protocol')
        expect(content).toContain('system architecture')
        expect(content).toContain('How MCP tools work')
        expect(content).toContain('resource system')
        expect(content).toContain('Error handling patterns')
      })
    })

    describe('Help Prompts', () => {
      it('should return troubleshooting guide', async () => {
        const result = await getPrompt('troubleshooting')
        
        const content = result.messages[0].content.text
        expect(content).toContain("I'm having issues with the turn-based games MCP system")
        expect(content).toContain('Common errors and their solutions')
        expect(content).toContain('"Game Not Found"')
        expect(content).toContain('"Not AI\'s Turn"')
        expect(content).toContain('Network/API errors')
      })
    })

    describe('Error Handling', () => {
      it('should throw error for non-existent prompt', async () => {
        await expect(getPrompt('non_existent_prompt'))
          .rejects.toThrow('Prompt not found: non_existent_prompt')
      })

      it('should handle prompts with no arguments gracefully', async () => {
        const result = await getPrompt('tic_tac_toe_rules', undefined)
        expect(result.messages).toBeDefined()
      })

      it('should handle prompts with empty arguments', async () => {
        const result = await getPrompt('difficulty_strategy_guide', {})
        expect(result.messages[0].content.text).toContain('Please provide a complete strategy guide')
      })
    })

    describe('Content Quality', () => {
      it('should provide comprehensive game rules', async () => {
        const result = await getPrompt('tic_tac_toe_rules')
        const content = result.messages[0].content.text
        
        // Check for essential rule components
        expect(content).toContain('objective of the game')
        expect(content).toContain('Game setup and rules')
        expect(content).toContain('How to make moves')
        expect(content).toContain('winning conditions')
        expect(content).toContain('strategy tips')
        expect(content).toContain('MCP commands')
      })

      it('should provide actionable strategy advice', async () => {
        const result = await getPrompt('difficulty_strategy_guide', {
          gameType: 'tic-tac-toe',
          difficulty: 'medium'
        })
        
        const content = result.messages[0].content.text
        expect(content).toContain('corner-center-corner strategy')
        expect(content).toContain('block threats immediately')
        expect(content).toContain('create double threats')
      })

      it('should provide practical troubleshooting steps', async () => {
        const result = await getPrompt('troubleshooting')
        const content = result.messages[0].content.text
        
        // Check for solution structure
        expect(content).toContain('Common errors and their solutions')
        expect(content).toContain('Performance issues')
        expect(content).toContain('Environment setup problems')
        expect(content).toContain('debug information')
      })

      it('should include MCP-specific workflow information', async () => {
        const result = await getPrompt('mcp_game_workflow')
        const content = result.messages[0].content.text
        
        expect(content).toContain('Model Context Protocol')
        expect(content).toContain('system architecture')
        expect(content).toContain('MCP tools work')
        expect(content).toContain('resource system')
      })
    })

    describe('Cross-References', () => {
      it('should reference appropriate MCP tools in game rules', async () => {
        const games = ['tic_tac_toe_rules', 'rock_paper_scissors_rules']
        
        for (const gameName of games) {
          const result = await getPrompt(gameName)
          const content = result.messages[0].content.text
          
          const gameType = gameName.replace('_rules', '').replace(/_/g, '-')
          expect(content).toContain(`create_game with gameType: '${gameType}'`)
          expect(content).toContain(`play_${gameName.replace('_rules', '')}`)
        }
      })

      it('should reference other prompts appropriately', async () => {
        const result = await getPrompt('getting_started')
        const content = result.messages[0].content.text
        
        expect(content).toContain('comprehensive guide')
      })
    })
  })
})
