// Seed Script: Populate System Themes
// This script seeds the database with 12 pre-built system themes

const THEME_DEFINITIONS = require('../data/theme-definitions');
const path = require('path');

// Set DB_PATH to use music.db
process.env.DB_PATH = path.join(__dirname, '../music.db');

const db = require('../config/database');

async function seedThemes() {
    try {
        // Wait for database to be ready
        await db.ready;

        console.log('🌱 Starting theme seeding process...\n');

        // Clear existing system themes
        const deleteStmt = db.prepare('DELETE FROM themes WHERE is_system = 1');
        const deleteResult = deleteStmt.run();
        console.log(`🗑️  Cleared ${deleteResult.changes || 0} existing system themes\n`);

        // Insert each theme
        const insertStmt = db.prepare(`
      INSERT INTO themes (
        profile_id, name, category, colors, typography, layout, avatar, is_system
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, 1)
    `);

        let successCount = 0;
        let errorCount = 0;

        for (const theme of THEME_DEFINITIONS) {
            try {
                insertStmt.run(
                    theme.name,
                    theme.category,
                    JSON.stringify(theme.colors),
                    JSON.stringify(theme.typography),
                    JSON.stringify(theme.layout),
                    JSON.stringify(theme.avatar)
                );
                console.log(`✅ Seeded: ${theme.name} (${theme.category})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to seed ${theme.name}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📊 Seeding Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📦 Total: ${THEME_DEFINITIONS.length}`);

        // Verify themes were seeded
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM themes WHERE is_system = 1');
        const { count } = countStmt.get();

        console.log(`\n✨ Database now has ${count} system themes`);

        // Show breakdown by category
        const categoryStmt = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM themes 
      WHERE is_system = 1 
      GROUP BY category
      ORDER BY category
    `);
        const categories = categoryStmt.all();

        console.log('\n📂 Themes by category:');
        categories.forEach(cat => {
            console.log(`   ${cat.category}: ${cat.count} themes`);
        });

        console.log('\n🎉 Theme seeding completed successfully!\n');

        // Close database connection
        db.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
seedThemes();
