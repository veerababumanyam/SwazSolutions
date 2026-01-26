const path = require('path');
const db = require('../config/database');
const { getObjectUrl, isConfigured, r2Config } = require('../config/r2Config');

/**
 * Migration script to convert local file paths to R2 URLs
 * Converts: /music/album/song.mp3 -> https://{account_id}.r2.cloudflarestorage.com/{bucket}/album/song.mp3
 */

async function migrateToR2(dryRun = true) {
    console.log('🔄 Starting migration to R2...');
    console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be saved)'}`);
    console.log('');

    if (!isConfigured()) {
        console.error('❌ R2 is not configured. Please check your R2 environment variables.');
        process.exit(1);
    }

    try {
        await db.ready;
        console.log('✅ Database connected');

        // Get all songs with local file paths
        const songs = db.prepare(`
            SELECT id, file_path, title, album
            FROM songs
            WHERE file_path LIKE '/music/%'
            ORDER BY id
        `).all();

        console.log(`📊 Found ${songs.length} songs with local file paths`);
        console.log('');

        if (songs.length === 0) {
            console.log('✅ No songs to migrate. All paths are already using R2 URLs.');
            return;
        }

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const song of songs) {
            try {
                // Convert /music/album/song.mp3 to R2 key format
                // Remove /music/ prefix
                const localPath = song.file_path.replace(/^\/music\//, '');
                
                // Construct R2 key (assuming files are in bucket root or subfolders)
                // If bucket name is in path, remove it
                let r2Key = localPath;
                if (r2Key.startsWith(`${r2Config.bucketName}/`)) {
                    r2Key = r2Key.replace(`${r2Config.bucketName}/`, '');
                }

                // Generate R2 URL
                const r2Url = await getObjectUrl(r2Key, false);

                console.log(`   [${song.id}] ${song.title}`);
                console.log(`      Old: ${song.file_path}`);
                console.log(`      New: ${r2Url}`);

                if (!dryRun) {
                    // Update the database
                    const stmt = db.prepare(`
                        UPDATE songs
                        SET file_path = ?
                        WHERE id = ?
                    `);
                    stmt.run(r2Url, song.id);
                    migratedCount++;
                    console.log(`      ✅ Migrated`);
                } else {
                    migratedCount++;
                    console.log(`      ⚠️  Would migrate (dry run)`);
                }
                console.log('');

            } catch (error) {
                errorCount++;
                errors.push({
                    songId: song.id,
                    title: song.title,
                    oldPath: song.file_path,
                    error: error.message,
                });
                console.error(`   ❌ Error migrating song ${song.id} (${song.title}): ${error.message}`);
                console.log('');
            }
        }

        console.log('');
        console.log('════════════════════════════════════════');
        console.log('📊 Migration Summary');
        console.log('════════════════════════════════════════');
        console.log(`   Total songs: ${songs.length}`);
        console.log(`   ${dryRun ? 'Would migrate' : 'Migrated'}: ${migratedCount}`);
        console.log(`   Skipped: ${skippedCount}`);
        console.log(`   Errors: ${errorCount}`);

        if (errors.length > 0) {
            console.log('');
            console.log('❌ Errors encountered:');
            errors.forEach(err => {
                console.log(`   Song ID ${err.songId} (${err.title}): ${err.error}`);
            });
        }

        if (dryRun) {
            console.log('');
            console.log('💡 This was a DRY RUN. No changes were made.');
            console.log('   Run with --live flag to apply changes:');
            console.log('   node backend/scripts/migrate-to-r2.js --live');
        } else {
            console.log('');
            console.log('✅ Migration completed!');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--live');

// Run migration
migrateToR2(dryRun)
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
