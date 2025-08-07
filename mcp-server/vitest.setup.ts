/**
 * Vitest setup for mcp-server package tests
 * 
 * Uses shared test setup utilities to ensure consistent database setup
 */

import { setupStandardTestDatabase } from '@turn-based-mcp/shared'

// Setup standard test database using shared utility
setupStandardTestDatabase()
