const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { listObjectsByAlbum, getObjectStream, getObjectUrl, isConfigured } = require('./r2Service');
const { r2Config } = require('../config/r2Config');

let musicMetadata;

// Supported audio file extensions
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma', '.aiff', '.alac'];

// Dynamic import for music-metadata (it's an ESM module)
async function loadMusicMetadata() {
    if (!musicMetadata) {
        musicMetadata = await import('music-metadata');
    }
    return musicMetadata;
}

/**
 * Extract extended metadata from parsed music file
 * @param {Object} metadata - Parsed metadata from music-metadata
 * @param {number} fileSize - File size in bytes (from R2 or filesystem)
 * @returns {Object} - Extended metadata object
 */
function extractExtendedMetadata(metadata, fileSize = 0) {
    const common = metadata.common || {};
    const format = metadata.format || {};

    return {
        // Basic metadata
        title: common.title || null,
        artist: common.artist || null,
        album: common.album || null,
        genre: common.genre ? common.genre[0] : null,
        year: common.year || null,

        // Track info
        trackNumber: common.track?.no || null,
        trackTotal: common.track?.of || null,
        discNumber: common.disk?.no || 1,
        discTotal: common.disk?.of || null,

        // Duration
        duration: format.duration ? Math.round(format.duration) : 0,

        // Extended metadata
        albumArtist: common.albumartist || null,
        composer: common.composer ? (Array.isArray(common.composer) ? common.composer.join(', ') : common.composer) : null,
        lyrics: common.lyrics ? (Array.isArray(common.lyrics) ? common.lyrics[0] : common.lyrics) : null,
        comment: common.comment ? (
            Array.isArray(common.comment) 
                ? (typeof common.comment[0] === 'object' && common.comment[0]?.text 
                    ? common.comment[0].text 
                    : common.comment[0])
                : (typeof common.comment === 'object' && common.comment?.text 
                    ? common.comment.text 
                    : common.comment)
        ) : null,
        bpm: common.bpm || null,
        isrc: common.isrc ? (Array.isArray(common.isrc) ? common.isrc[0] : common.isrc) : null,

        // Copyright info
        copyright: common.copyright || null,
        label: common.label ? (Array.isArray(common.label) ? common.label[0] : common.label) : null,

        // Audio format info
        bitRate: format.bitrate ? Math.round(format.bitrate / 1000) : null, // Convert to kbps
        sampleRate: format.sampleRate || null,
        channels: format.numberOfChannels || null,
        codec: format.codec || null,
        lossless: format.lossless || false,

        // File info
        fileSize: fileSize,

        // Picture info (for cover detection)
        hasPicture: common.picture && common.picture.length > 0,
        picture: common.picture && common.picture.length > 0 ? common.picture[0] : null
    };
}

/**
 * Find cover image in R2 bucket for an album
 * Looks for common cover image filenames in the album folder
 * @param {string} albumPrefix - Album prefix in R2 (e.g., "album-name/")
 * @param {Array} r2Objects - List of R2 objects in the album
 * @returns {string|null} - R2 key of cover image or null
 */
function findCoverImageInR2(albumPrefix, r2Objects) {
    const coverNames = [
        'cover.jpg', 'cover.jpeg', 'cover.png',
        'folder.jpg', 'folder.jpeg', 'folder.png',
        'album.jpg', 'album.jpeg', 'album.png',
        'artwork.jpg', 'artwork.jpeg', 'artwork.png'
    ];

    // Look for cover images in the album folder
    for (const obj of r2Objects) {
        const fileName = obj.key.split('/').pop().toLowerCase();
        if (coverNames.some(name => fileName === name.toLowerCase())) {
            return obj.key;
        }
    }
    return null;
}

/**
 * Process cover art from metadata or R2
 * @param {Object} extendedMeta - Extended metadata with picture info
 * @param {string} albumPrefix - Album prefix in R2
 * @param {Array} albumObjects - R2 objects in the album folder
 * @param {string} coversDir - Directory to save covers locally
 * @returns {Promise<string|null>} - Cover path (R2 URL or local /covers/ path) or null
 */
async function processCoverArt(extendedMeta, albumPrefix, albumObjects, coversDir) {
    let coverPath = null;

    // Priority 1: Extract embedded cover art from metadata
    if (extendedMeta.hasPicture && extendedMeta.picture) {
        try {
            const picture = extendedMeta.picture;
            const buffer = picture.data;
            const hash = crypto.createHash('md5').update(buffer).digest('hex');
            const imageExt = picture.format === 'image/png' ? '.png' : '.jpg';
            const coverFilename = `${hash}${imageExt}`;
            const coverAbsPath = path.join(coversDir, coverFilename);

            if (!fs.existsSync(coverAbsPath)) {
                fs.writeFileSync(coverAbsPath, buffer);
            }
            coverPath = `/covers/${coverFilename}`;
        } catch (err) {
            console.warn(`⚠️ Failed to save embedded cover: ${err.message}`);
        }
    }

    // Priority 2: If no embedded cover, look for cover image in R2 album folder
    if (!coverPath && albumObjects) {
        const coverKey = findCoverImageInR2(albumPrefix, albumObjects);
        if (coverKey) {
            try {
                // Get cover from R2 and save locally
                const stream = await getObjectStream(coverKey);
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                const hash = crypto.createHash('md5').update(buffer).digest('hex');
                const imageExt = path.extname(coverKey).toLowerCase() || '.jpg';
                const coverFilename = `${hash}${imageExt}`;
                const coverAbsPath = path.join(coversDir, coverFilename);

                if (!fs.existsSync(coverAbsPath)) {
                    fs.writeFileSync(coverAbsPath, buffer);
                }
                coverPath = `/covers/${coverFilename}`;
            } catch (err) {
                console.warn(`⚠️ Failed to download album cover from R2: ${err.message}`);
            }
        }
    }

    return coverPath;
}

/**
 * Save extended metadata to music_metadata table
 * @param {Object} db - Database instance
 * @param {number} songId - Song ID
 * @param {Object} extendedMeta - Extended metadata
 */
function saveExtendedMetadata(db, songId, extendedMeta) {
    try {
        const stmt = db.prepare(`
            INSERT INTO music_metadata (
                song_id, track_number, disc_number, bpm, isrc, lyrics,
                composer, copyright, label, comment, bit_rate, sample_rate,
                channels, codec, file_size, last_scanned_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(song_id) DO UPDATE SET
                track_number = excluded.track_number,
                disc_number = excluded.disc_number,
                bpm = excluded.bpm,
                isrc = excluded.isrc,
                lyrics = excluded.lyrics,
                composer = excluded.composer,
                copyright = excluded.copyright,
                label = excluded.label,
                comment = excluded.comment,
                bit_rate = excluded.bit_rate,
                sample_rate = excluded.sample_rate,
                channels = excluded.channels,
                codec = excluded.codec,
                file_size = excluded.file_size,
                last_scanned_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        `);

        // Ensure all values are properly typed (SQL.js is strict about types)
        stmt.run(
            songId,
            extendedMeta.trackNumber ?? null,
            extendedMeta.discNumber ?? null,
            extendedMeta.bpm ?? null,
            extendedMeta.isrc ?? null,
            extendedMeta.lyrics ?? null,
            extendedMeta.composer ?? null,
            extendedMeta.copyright ?? null,
            extendedMeta.label ?? null,
            extendedMeta.comment ?? null,
            extendedMeta.bitRate ?? null,
            extendedMeta.sampleRate ?? null,
            extendedMeta.channels ?? null,
            extendedMeta.codec ?? null,
            extendedMeta.fileSize ?? null
        );
    } catch (err) {
        // Log full error details for debugging
        // SQL.js errors might not have standard .message property
        let errorMsg = 'Unknown error';
        if (err) {
            if (typeof err === 'string') {
                errorMsg = err;
            } else if (err.message) {
                errorMsg = err.message;
            } else if (err.toString) {
                errorMsg = err.toString();
            } else {
                errorMsg = JSON.stringify(err);
            }
        }
        
        console.warn(`⚠️ Failed to save extended metadata for song ${songId}: ${errorMsg}`);
        
        // Log parameter values for debugging (but not full objects to avoid clutter)
        if (extendedMeta) {
            const paramSummary = {
                trackNumber: extendedMeta.trackNumber,
                discNumber: extendedMeta.discNumber,
                bpm: extendedMeta.bpm,
                isrc: extendedMeta.isrc ? 'present' : null,
                lyrics: extendedMeta.lyrics ? 'present' : null,
                composer: extendedMeta.composer,
                copyright: extendedMeta.copyright,
                label: extendedMeta.label,
                comment: extendedMeta.comment,
                bitRate: extendedMeta.bitRate,
                sampleRate: extendedMeta.sampleRate,
                channels: extendedMeta.channels,
                codec: extendedMeta.codec,
                fileSize: extendedMeta.fileSize
            };
            console.warn(`   Parameters:`, paramSummary);
        }
    }
}

/**
 * Scans the R2 bucket and updates the database
 * @param {Object} db - The database instance
 * @param {string} musicDir - The absolute path to the music directory (deprecated, kept for compatibility)
 * @param {Object} options - Scan options
 * @param {boolean} options.recursive - Scan subdirectories (default: true, always true for R2)
 * @param {boolean} options.saveExtended - Save extended metadata (default: true)
 * @returns {Promise<Object>} - Statistics about the scan
 */
async function scanMusicDirectory(db, musicDir, options = {}) {
    const { recursive = true, saveExtended = true } = options;

    await loadMusicMetadata();

    // Check if R2 is configured
    if (!isConfigured()) {
        throw new Error('R2 is not configured. Please check your R2 environment variables.');
    }

    const coversDir = path.join(__dirname, '../../data/covers');
    if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true });
    }

    let scannedCount = 0;
    let newCount = 0;
    let updatedCount = 0;
    const errors = [];
    const startTime = Date.now();

    console.log(`🎵 Starting R2 music scan in bucket: ${r2Config.bucketName}`);

    try {
        // Get all objects grouped by album
        const albumsMap = await listObjectsByAlbum('');

        // Process each album
        for (const [albumName, albumObjects] of albumsMap.entries()) {
            // Filter to only audio files
            const audioFiles = albumObjects.filter(obj => {
                const ext = path.extname(obj.key).toLowerCase();
                return SUPPORTED_EXTENSIONS.includes(ext);
            });

            // Get cover images for this album
            const coverImages = albumObjects.filter(obj => {
                const ext = path.extname(obj.key).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
            });

            // Process each audio file
            for (const obj of audioFiles) {
                try {
                    const key = obj.key;
                    const fileName = obj.fileName || path.basename(key);
                    const ext = path.extname(fileName).toLowerCase();
                    
                    // Generate R2 URL for the file
                    const r2Url = await getObjectUrl(key, false);

                    // Check if song already exists (by R2 URL)
                    const existingSong = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(r2Url);

                    // Default values from filename
                    let title = path.basename(fileName, ext);
                    let artist = null;
                    let album = albumName || 'Unknown Album';
                    let genre = null;
                    let duration = 0;
                    let extendedMeta = null;
                    let fileSize = obj.size || 0;

                    // Extract metadata using music-metadata from R2 stream
                    try {
                        const stream = await getObjectStream(key);
                        // Convert stream to buffer for more reliable metadata extraction
                        // Some audio formats need random access which streams don't provide
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const buffer = Buffer.concat(chunks);
                        
                        // Use parseBuffer for more reliable extraction
                        // parseFile with streams can fail for some formats that need random access
                        const mm = await loadMusicMetadata();
                        const metadata = await mm.parseBuffer(buffer);
                        extendedMeta = extractExtendedMetadata(metadata, fileSize);

                        // #region agent log
                        const logPath = path.join(__dirname, '../../.cursor/debug.log');
                        const logEntry = JSON.stringify({
                            location: 'backend/services/musicScanner.js:294',
                            message: 'Metadata extracted',
                            data: {
                                key: key,
                                extractedTitle: extendedMeta.title,
                                extractedArtist: extendedMeta.artist,
                                extractedAlbum: extendedMeta.album,
                                extractedGenre: extendedMeta.genre,
                                hasPicture: extendedMeta.hasPicture,
                                filenameTitle: title
                            },
                            timestamp: Date.now(),
                            sessionId: 'debug-session',
                            runId: 'run1',
                            hypothesisId: 'H1'
                        }) + '\n';
                        try {
                            fs.appendFileSync(logPath, logEntry);
                        } catch (e) {}
                        // #endregion

                        // Use extracted values
                        if (extendedMeta.title) title = extendedMeta.title;
                        if (extendedMeta.artist) artist = extendedMeta.artist;
                        if (extendedMeta.album) album = extendedMeta.album;
                        if (extendedMeta.genre) genre = extendedMeta.genre;
                        if (extendedMeta.duration) duration = extendedMeta.duration;

                        // #region agent log
                        const logEntry2 = JSON.stringify({
                            location: 'backend/services/musicScanner.js:310',
                            message: 'Metadata applied',
                            data: {
                                key: key,
                                finalTitle: title,
                                finalArtist: artist,
                                finalAlbum: album,
                                finalGenre: genre
                            },
                            timestamp: Date.now(),
                            sessionId: 'debug-session',
                            runId: 'run1',
                            hypothesisId: 'H1'
                        }) + '\n';
                        try {
                            fs.appendFileSync(logPath, logEntry2);
                        } catch (e) {}
                        // #endregion

                    } catch (err) {
                        // #region agent log
                        const logPath = path.join(__dirname, '../../.cursor/debug.log');
                        const logEntry = JSON.stringify({
                            location: 'backend/services/musicScanner.js:333',
                            message: 'Metadata extraction failed',
                            data: {
                                key: key,
                                error: err.message,
                                stack: err.stack
                            },
                            timestamp: Date.now(),
                            sessionId: 'debug-session',
                            runId: 'run1',
                            hypothesisId: 'H1'
                        }) + '\n';
                        try {
                            fs.appendFileSync(logPath, logEntry);
                        } catch (e) {}
                        // #endregion
                        console.warn(`⚠️ Failed to parse metadata for ${key}: ${err.message}`);
                        // Create minimal extended metadata with file info
                        extendedMeta = { hasPicture: false, picture: null, fileSize };
                    }

                    // Process cover art
                    const albumPrefix = albumName !== 'Singles' ? `${albumName}/` : '';
                    const coverPath = await processCoverArt(extendedMeta, albumPrefix, coverImages, coversDir);

                    // #region agent log
                    const logPath = path.join(__dirname, '../../.cursor/debug.log');
                    const logEntry = JSON.stringify({
                        location: 'backend/services/musicScanner.js:358',
                        message: 'Saving song to database',
                        data: {
                            key: key,
                            title: title,
                            artist: artist,
                            album: album,
                            genre: genre,
                            coverPath: coverPath,
                            r2Url: r2Url
                        },
                        timestamp: Date.now(),
                        sessionId: 'debug-session',
                        runId: 'run1',
                        hypothesisId: 'H1'
                    }) + '\n';
                    try {
                        fs.appendFileSync(logPath, logEntry);
                    } catch (e) {}
                    // #endregion

                    // Insert or update song with genre
                    const stmt = db.prepare(`
                        INSERT INTO songs (title, artist, album, file_path, duration, cover_path, genre)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(file_path) DO UPDATE SET
                            title = excluded.title,
                            artist = excluded.artist,
                            album = excluded.album,
                            duration = excluded.duration,
                            cover_path = excluded.cover_path,
                            genre = excluded.genre
                    `);

                    stmt.run(
                        title,
                        artist,
                        album,
                        r2Url,
                        duration,
                        coverPath,
                        genre
                    );

                    // Get the song ID for extended metadata
                    const song = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(r2Url);

                    // #region agent log
                    const logPath2 = path.join(__dirname, '../../.cursor/debug.log');
                    const logEntry3 = JSON.stringify({
                        location: 'backend/services/musicScanner.js:375',
                        message: 'Song saved, checking database',
                        data: {
                            key: key,
                            songId: song?.id,
                            savedTitle: title,
                            savedArtist: artist,
                            savedAlbum: album,
                            savedCoverPath: coverPath
                        },
                        timestamp: Date.now(),
                        sessionId: 'debug-session',
                        runId: 'run1',
                        hypothesisId: 'H1'
                    }) + '\n';
                    try {
                        fs.appendFileSync(logPath2, logEntry3);
                    } catch (e) {}
                    // #endregion

                    // Save extended metadata if enabled
                    if (saveExtended && song && extendedMeta) {
                        saveExtendedMetadata(db, song.id, extendedMeta);
                    }

                    scannedCount++;
                    if (existingSong) {
                        updatedCount++;
                    } else {
                        newCount++;
                    }

                } catch (error) {
                    console.error(`❌ Error processing ${obj.key}: ${error.message}`);
                    errors.push({ file: obj.key, error: error.message });
                }
            }
        }
    } catch (error) {
        console.error('❌ Error scanning R2 bucket:', error);
        throw error;
    }

    const totalSongs = db.prepare('SELECT COUNT(*) as count FROM songs').get().count;
    const scanDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const finalAlbumCount = db.prepare('SELECT COUNT(DISTINCT album) as count FROM songs WHERE album IS NOT NULL AND album != \'\'').get();

    console.log(`✅ R2 scan complete: ${scannedCount} files processed (${newCount} new, ${updatedCount} updated) in ${scanDuration}s`);
    console.log(`   📁 Albums found: ${finalAlbumCount?.count || 0}`);
    if (errors.length > 0) {
        console.log(`⚠️ ${errors.length} errors encountered during scan`);
    }

    return {
        scannedCount,
        newCount,
        updatedCount,
        totalSongs,
        scanDuration: parseFloat(scanDuration),
        errors: errors.length > 0 ? errors : undefined
    };
}

/**
 * Get list of supported audio file extensions
 * @returns {string[]} - Array of supported extensions
 */
function getSupportedExtensions() {
    return [...SUPPORTED_EXTENSIONS];
}

module.exports = {
    scanMusicDirectory,
    getSupportedExtensions,
    extractExtendedMetadata
};
