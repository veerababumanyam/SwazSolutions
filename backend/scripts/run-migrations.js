#!/usr/bin/env node
/**
 * Database Migration Runner
 * Executes SQL migration files in order
 * Usage: node backend/scripts/run-migrations.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Database setup
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../music.db');
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Import SQL.js
const initSqlJs = require('sql.js');
let db;
let SQL;

/**
 * Calculate checksum for migration file content
 */
function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Initialize database connection
 */
async function initDatabase() {
  try {
    SQL = await initSqlJs();

    // Load existing database or create new one
    let buffer;
    if (fs.existsSync(DB_PATH)) {
      buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log(`Connected to database: ${DB_PATH}`);
    } else {
      db = new SQL.Database();
      console.log('Created new database');
    }
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
}

/**
 * Save database to file
 */
function saveDatabase() {
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (error) {
    console.error('Failed to save database:', error.message);
    throw error;
  }
}

/**
 * Initialize migration tracker table
 */
function initMigrationTracker() {
  try {
    const trackerSQL = fs.readFileSync(
      path.join(MIGRATIONS_DIR, '000-migration-tracker.sql'),
      'utf8'
    );
    db.run(trackerSQL);
    saveDatabase();
    console.log('✓ Migration tracker initialized');
  } catch (error) {
    console.error('Failed to initialize migration tracker:', error.message);
    process.exit(1);
  }
}

/**
 * Get list of applied migrations
 */
function getAppliedMigrations() {
  try {
    const stmt = db.prepare('SELECT migration_name, checksum FROM migration_tracker');
    const results = new Map();

    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.set(row.migration_name, row.checksum);
    }
    stmt.free();

    return results;
  } catch (error) {
    return new Map();
  }
}

/**
 * Get list of migration files (sorted)
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && file !== '000-migration-tracker.sql')
    .sort();

  return files.map(file => ({
    name: file,
    path: path.join(MIGRATIONS_DIR, file)
  }));
}

/**
 * Run a migration file
 */
function runMigration(migration, content, checksum) {
  if (isDryRun) {
    console.log(`[DRY RUN] Would execute: ${migration.name}`);
    return;
  }

  try {
    // Run migration (SQL.js doesn't have transactions, but executes atomically per statement)
    db.run(content);

    // Record in tracker
    const stmt = db.prepare(`
      INSERT INTO migration_tracker (migration_name, checksum)
      VALUES (?, ?)
    `);
    stmt.bind([migration.name, checksum]);
    stmt.step();
    stmt.free();

    // Save database after each migration
    saveDatabase();

    console.log(`✓ Applied: ${migration.name}`);
  } catch (error) {
    console.error(`✗ Failed: ${migration.name}`);
    console.error(`  Error: ${error.message}`);
    throw error;
  }
}

/**
 * Main migration execution
 */
async function main() {
  console.log('=== Database Migration Runner ===\n');

  if (isDryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Initialize database
  await initDatabase();

  // Initialize migration tracker
  initMigrationTracker();

  // Get applied migrations
  const appliedMigrations = getAppliedMigrations();
  console.log(`Applied migrations: ${appliedMigrations.size}`);

  // Get migration files
  const migrationFiles = getMigrationFiles();
  console.log(`Migration files found: ${migrationFiles.length}\n`);

  if (migrationFiles.length === 0) {
    console.log('No migrations to run.');
    console.log('Migration infrastructure ready.');
    return;
  }

  // Process each migration
  let appliedCount = 0;
  let skippedCount = 0;

  for (const migration of migrationFiles) {
    const content = fs.readFileSync(migration.path, 'utf8');
    const checksum = calculateChecksum(content);

    // Check if already applied
    if (appliedMigrations.has(migration.name)) {
      const existingChecksum = appliedMigrations.get(migration.name);

      if (existingChecksum === checksum) {
        console.log(`- Skipped (already applied): ${migration.name}`);
        skippedCount++;
      } else {
        console.error(`✗ ERROR: Migration ${migration.name} has been modified!`);
        console.error('  Checksum mismatch detected.');
        console.error('  This is dangerous - migrations should be immutable.');
        process.exit(1);
      }
      continue;
    }

    // Run migration
    runMigration(migration, content, checksum);
    appliedCount++;
  }

  // Summary
  console.log('\n=== Migration Summary ===');
  console.log(`Applied: ${appliedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Total: ${migrationFiles.length}`);

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes were made to the database.');
  } else {
    console.log('\n✓ All migrations completed successfully!');
  }
}

// Run
(async () => {
  try {
    await main();
    if (db) {
      saveDatabase();
      db.close();
    }
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    if (db) {
      try {
        saveDatabase();
      } catch (saveError) {
        console.error('Failed to save database:', saveError.message);
      }
      db.close();
    }
    process.exit(1);
  }
})();
