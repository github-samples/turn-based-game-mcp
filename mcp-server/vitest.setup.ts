/**
 * Vitest setup for mcp-server package tests
 * 
 * Uses shared test setup utilities to ensure consistent database setup
 */

import { setupStandardTestDatabase } from '@turn-based-mcp/shared/testing'

// Setup standard test database using shared utility
setupStandardTestDatabase()

// Suppress expected console errors during tests
// These are typically from error handling scenarios that we're intentionally testing
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  const message = args[0]
  
  if (typeof message === 'string') {
    // Suppress expected error messages from elicitation handlers
    if (
      message.includes('Elicitation failed:') ||
      message.includes('Mid-game elicitation failed:') ||
      message.includes('Error recovery elicitation failed:') ||
      message.includes('Completion feedback elicitation failed:') ||
      message.includes('Strategy elicitation failed:')
    ) {
      return // Suppress these expected errors
    }
    
    // Suppress expected error messages from resource handlers
    if (
      message.includes('Error listing') && message.includes('games:') ||
      message.includes('Error listing resources:')
    ) {
      return // Suppress these expected errors
    }
    
    // Suppress expected error messages from HTTP client
    if (
      message.includes('Error fetching') && message.includes('game via API:') ||
      message.includes('Error creating') && message.includes('game via API:')
    ) {
      return // Suppress these expected errors
    }
    
    // Suppress expected server error messages (but not startup messages)
    if (
      message.includes('Server error:')
    ) {
      return // Suppress these expected errors
    }
  }
  
  // For all other errors, use the original console.error
  originalConsoleError(...args)
}
