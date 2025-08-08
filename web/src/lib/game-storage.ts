/**
 * Game Storage Re-export Module
 * 
 * This module provides backward compatibility by re-exporting all storage 
 * functions from the shared library. This allows existing web application
 * code to continue using storage functions via this path while the actual
 * implementation is centralized in the shared package.
 * 
 * Purpose: Maintains API stability during the monorepo consolidation process.
 * Future: Consider migrating imports to use @turn-based-mcp/shared directly.
 */

// Re-export from shared package for backward compatibility
export * from '@turn-based-mcp/shared';
