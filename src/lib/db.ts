/**
 * Database Client - PostgreSQL Connection
 *
 * Uses pg library to connect to PostgreSQL database
 * Can connect to:
 * - Local PostgreSQL (development)
 * - VPS PostgreSQL (production: egos-sinapi-postgres)
 * - Supabase (future)
 */

import { Pool, PoolClient } from 'pg';
import { logger } from '../telemetry/logger';

// Database configuration
const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'egos_arch',
  user: process.env.POSTGRES_USER || 'sinapi_user',
  password: process.env.POSTGRES_PASSWORD || 'sinapi_pass',
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Create connection pool
let pool: Pool | null = null;

/**
 * Get or create database pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(DB_CONFIG);

    pool.on('error', (err) => {
      logger.error('Unexpected database error', { error: err.message });
    });

    pool.on('connect', () => {
      logger.info('Database pool connected', {
        host: DB_CONFIG.host,
        database: DB_CONFIG.database,
      });
    });
  }

  return pool;
}

/**
 * Get a client from the pool
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a query
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const pool = getPool();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.log({
      eventName: 'db_query',
      duration,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    logger.error('Database query error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: text.substring(0, 100),
    });
    throw error;
  }
}

/**
 * Check database connection
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    logger.error('Database connection check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Close all database connections
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}

/**
 * Transaction helper
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    client.release();
  }
}

// Export types for convenience
export type { PoolClient } from 'pg';
