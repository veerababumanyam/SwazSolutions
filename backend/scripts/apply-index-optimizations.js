/**
 * Apply Index Optimizations
 * Executes the optimize-indexes.sql script against the database
 *
 * Usage: node backend/scripts/apply-index-optimizations.js
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function applyIndexOptimizations() {
    console.log('🔍 Starting database index optimization...\n');

    try {
        // Wait for database to be ready
        await db.ready;

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'optimize-indexes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon and filter out comments and empty lines
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => {
                return stmt &&
                    !stmt.startsWith('--') &&
                    stmt.toUpperCase().startsWith('CREATE');
            });

        console.log(`📝 Found ${statements.length} index creation statements\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Execute each CREATE INDEX statement
        for (const statement of statements) {
            try {
                // Extract index name for logging
                const indexNameMatch = statement.match(/idx_\w+/);
                const indexName = indexNameMatch ? indexNameMatch[0] : 'unknown';

                // Check if index already exists by trying to query sqlite_master
                const exists = db.prepare(`
                    SELECT name FROM sqlite_master
                    WHERE type = 'index' AND name = ?
                `).get(indexName);

                if (exists) {
                    console.log(`⏭️  SKIP: ${indexName} (already exists)`);
                    skipCount++;
                    continue;
                }

                // Execute the CREATE INDEX statement
                db.prepare(statement + ';').run();
                console.log(`✅ CREATE: ${indexName}`);
                successCount++;

            } catch (error) {
                console.error(`❌ ERROR: ${error.message}`);
                console.error(`   Statement: ${statement.substring(0, 100)}...`);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Index Optimization Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Successfully created: ${successCount}`);
        console.log(`⏭️  Skipped (existing):  ${skipCount}`);
        console.log(`❌ Errors:              ${errorCount}`);
        console.log('='.repeat(60));

        if (successCount > 0) {
            console.log('\n✨ Database indexes optimized successfully!');
            console.log('💡 Run ANALYZE to update query planner statistics:');
            console.log('   sqlite3 backend/music.db "ANALYZE;"');
        } else {
            console.log('\n✨ All indexes already exist - no changes made.');
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Fatal error during index optimization:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    applyIndexOptimizations();
}

module.exports = { applyIndexOptimizations };
