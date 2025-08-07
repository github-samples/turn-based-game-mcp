/**
 * Vitest setup for shared package tests
 * 
 * Uses local test setup utilities since this is the package that defines them
 */

import { setupStandardTestDatabase } from './src/testing/vitest-setup'

// Setup standard test database using local utility
setupStandardTestDatabase()
