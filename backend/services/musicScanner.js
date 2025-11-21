const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let parseFile;

// Dynamic import for music-metadata (it's an ESM module)
async function loadMusicMetadata() {
    if (!parseFile) {
        const mod = await import('music-metadata');
        parseFile = mod.parseFile;
    }
}

/**
 * Scans the music directory and updates the database
 * @param {Object} db - The database instance
 * @param {string} musicDir - The absolute path to the music directory
 * @returns {Promise<Object>} - Statistics about the scan
 */
async function scanMusicDirectory(db, musicDir) {
    await loadMusicMetadata();

    if (!fs.existsSync(musicDir)) {
        throw new Error('Music directory not found');
    }

    const coversDir = path.join(__dirname, '../../data/covers');
    if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true });
    }

    let scannedCount = 0;
    const errors = [];

    async function scanDirectory(dir, album = '') {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Treat subdirectories as albums
                await scanDirectory(fullPath, item.name);
            } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) {
                    try {
                        const relativePath = path.relative(musicDir, fullPath);
                        const urlPath = '/music/' + relativePath.replace(/\\/g, '/');

                        // Default values
                        let title = path.basename(item.name, ext);
                        let artist = null;
                        let duration = 0;
                        let coverPath = null;
                        let metaAlbum = album;

                        // Extract metadata
                        try {
                            const metadata = await parseFile(fullPath);

                            if (metadata.common.title) title = metadata.common.title;
                            if (metadata.common.artist) artist = metadata.common.artist;
                            if (metadata.common.album) metaAlbum = metadata.common.album;
                            if (metadata.format.duration) duration = Math.round(metadata.format.duration);

                            // Extract cover art
                            if (metadata.common.picture && metadata.common.picture.length > 0) {
                                const picture = metadata.common.picture[0];
                                const buffer = picture.data;
                                const hash = crypto.createHash('md5').update(buffer).digest('hex');
                                const imageExt = picture.format === 'image/png' ? '.png' : '.jpg';
                                const coverFilename = `${hash}${imageExt}`;
                                const coverAbsPath = path.join(coversDir, coverFilename);

                                if (!fs.existsSync(coverAbsPath)) {
                                    fs.writeFileSync(coverAbsPath, buffer);
                                }
                                coverPath = `/covers/${coverFilename}`;
                            }

                        } catch (err) {
                            console.warn(`⚠️ Failed to parse metadata for ${item.name}: ${err.message}`);
                        }

                        // Insert or update song
                        const stmt = db.prepare(`
                            INSERT INTO songs (title, artist, album, file_path, duration, cover_path)
                            VALUES (?, ?, ?, ?, ?, ?)
                            ON CONFLICT(file_path) DO UPDATE SET
                                title = excluded.title,
                                artist = excluded.artist,
                                album = excluded.album,
                                duration = excluded.duration,
                                cover_path = excluded.cover_path
                        `);

                        stmt.run(title, artist, metaAlbum || 'Unknown Album', urlPath, duration, coverPath);
                        scannedCount++;
                    } catch (error) {
                        errors.push({ file: item.name, error: error.message });
                    }
                }
            }
        }
    }

    await scanDirectory(musicDir);

    const totalSongs = db.prepare('SELECT COUNT(*) as count FROM songs').get().count;

    return {
        scannedCount,
        totalSongs,
        errors: errors.length > 0 ? errors : undefined
    };
}

module.exports = {
    scanMusicDirectory
};
