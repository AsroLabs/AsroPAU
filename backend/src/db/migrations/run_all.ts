import pool from '../index';
import { runMigrations as runMigration001 } from './001_create_grados';
import { runMigrations as runMigration002 } from './002_create_examenes';

async function runAllMigrations(): Promise<void> {
  console.log('[DB] Starting all migrations...');
  try {
    await runMigration001(pool);
    await runMigration002(pool);
    console.log('[DB] All migrations completed successfully.');
  } catch (err) {
    console.error('[DB] Migration runner failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

runAllMigrations().catch(() => process.exit(1));
