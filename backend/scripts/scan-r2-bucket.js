const db = require('../config/database');
const { scanMusicDirectory } = require('../services/musicScanner');

/**
 * Scan R2 bucket and populate database
 */

async function scanR2Bucket() {
    console.log('🔄 Starting R2 bucket scan...');
    console.log('');

    try {
        await db.ready;
        console.log('✅ Database connected');

        // musicDir parameter is deprecated but kept for compatibility
        const musicDir = process.env.MUSIC_DIR || require('path').join(__dirname, '../../data/MusicFiles');

        const result = await scanMusicDirectory(db, musicDir, {
            recursive: true,
            saveExtended: true,
        });

        console.log('');
        console.log('════════════════════════════════════════');
        console.log('📊 Scan Summary');
        console.log('════════════════════════════════════════');
        console.log(`   Scanned: ${result.scannedCount} files`);
        console.log(`   New: ${result.newCount} songs`);
        console.log(`   Updated: ${result.updatedCount} songs`);
        console.log(`   Total in database: ${result.totalSongs} songs`);
        console.log(`   Duration: ${result.scanDuration}s`);

        if (result.errors && result.errors.length > 0) {
            console.log(`   Errors: ${result.errors.length}`);
            console.log('');
            console.log('⚠️  Errors encountered:');
            result.errors.slice(0, 10).forEach(err => {
                console.log(`      - ${err.file}: ${err.error}`);
            });
            if (result.errors.length > 10) {
                console.log(`      ... and ${result.errors.length - 10} more errors`);
            }
        }

        console.log('');
        console.log('✅ R2 bucket scan completed!');

    } catch (error) {
        console.error('❌ Scan failed:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run scan
scanR2Bucket()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
