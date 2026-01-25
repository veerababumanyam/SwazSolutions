const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let parseFile;

// Supported audio file extensions
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma', '.aiff', '.alac'];

// Dynamic import for music-metadata (it's an ESM module)
async function loadMusicMetadata() {
    if (!parseFile) {
        const mod = await import('music-metadata');
        parseFile = mod.parseFile;
    }
}

/**
 * Extract extended metadata from parsed music file
 * @param {Object} metadata - Parsed metadata from music-metadata
 * @param {string} filePath - Absolute path to the file
 * @returns {Object} - Extended metadata object
 */
function extractExtendedMetadata(metadata, filePath) {
    const common = metadata.common || {};
    const format = metadata.format || {};

    // Get file stats for size
    let fileSize = 0;
    try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
    } catch (err) {
        console.warn(`⚠️ Could not get file stats for ${filePath}`);
    }

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
        composer: common.composer ? common.composer.join(', ') : null,
        lyrics: common.lyrics ? common.lyrics[0] : null,
        comment: common.comment ? common.comment[0] : null,
        bpm: common.bpm || null,
        isrc: common.isrc ? common.isrc[0] : null,

        // Copyright info
        copyright: common.copyright || null,
        label: common.label ? common.label[0] : null,

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
 * Find cover image in a directory
 * Looks for common cover image filenames
 * @param {string} dir - Directory to search in
 * @returns {string|null} - Absolute path to cover image or null
 */
function findCoverImage(dir) {
    const coverNames = [
        'cover.jpg', 'cover.jpeg', 'cover.png',
        'folder.jpg', 'folder.jpeg', 'folder.png',
        'album.jpg', 'album.jpeg', 'album.png',
        'artwork.jpg', 'artwork.jpeg', 'artwork.png'
    ];

    for (const name of coverNames) {
        const coverPath = path.join(dir, name);
        if (fs.existsSync(coverPath)) {
            return coverPath;
        }
    }
    return null;
}

/**
 * Process cover art from metadata or folder
 * @param {Object} extendedMeta - Extended metadata with picture info
 * @param {string} dir - Current directory
 * @param {string} musicDir - Root music directory
 * @param {string} coversDir - Directory to save covers
 * @returns {string|null} - Cover path or null
 */
function processCoverArt(extendedMeta, dir, musicDir, coversDir) {
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

    // Priority 2: If no embedded cover, look for cover image in album folder
    if (!coverPath) {
        const albumCoverPath = findCoverImage(dir);
        if (albumCoverPath) {
            try {
                const buffer = fs.readFileSync(albumCoverPath);
                const hash = crypto.createHash('md5').update(buffer).digest('hex');
                const imageExt = path.extname(albumCoverPath).toLowerCase();
                const coverFilename = `${hash}${imageExt}`;
                const coverAbsPath = path.join(coversDir, coverFilename);

                if (!fs.existsSync(coverAbsPath)) {
                    fs.copyFileSync(albumCoverPath, coverAbsPath);
                }
                coverPath = `/covers/${coverFilename}`;
            } catch (err) {
                console.warn(`⚠️ Failed to copy album cover: ${err.message}`);
            }
        }
    }

    // Priority 3: If still no cover, use default cover from MusicFiles folder
    if (!coverPath) {
        const defaultCoverPath = findCoverImage(musicDir);
        if (defaultCoverPath) {
            try {
                const buffer = fs.readFileSync(defaultCoverPath);
                const hash = crypto.createHash('md5').update(buffer).digest('hex');
                const imageExt = path.extname(defaultCoverPath).toLowerCase();
                const coverFilename = `${hash}${imageExt}`;
                const coverAbsPath = path.join(coversDir, coverFilename);

                if (!fs.existsSync(coverAbsPath)) {
                    fs.copyFileSync(defaultCoverPath, coverAbsPath);
                }
                coverPath = `/covers/${coverFilename}`;
            } catch (err) {
                console.warn(`⚠️ Failed to copy default cover: ${err.message}`);
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

        stmt.run(
            songId,
            extendedMeta.trackNumber,
            extendedMeta.discNumber,
            extendedMeta.bpm,
            extendedMeta.isrc,
            extendedMeta.lyrics,
            extendedMeta.composer,
            extendedMeta.copyright,
            extendedMeta.label,
            extendedMeta.comment,
            extendedMeta.bitRate,
            extendedMeta.sampleRate,
            extendedMeta.channels,
            extendedMeta.codec,
            extendedMeta.fileSize
        );
    } catch (err) {
        console.warn(`⚠️ Failed to save extended metadata for song ${songId}: ${err.message}`);
    }
}

/**
 * Scans the music directory and updates the database
 * @param {Object} db - The database instance
 * @param {string} musicDir - The absolute path to the music directory
 * @param {Object} options - Scan options
 * @param {boolean} options.recursive - Scan subdirectories (default: true)
 * @param {boolean} options.saveExtended - Save extended metadata (default: true)
 * @returns {Promise<Object>} - Statistics about the scan
 */
async function scanMusicDirectory(db, musicDir, options = {}) {
    const { recursive = true, saveExtended = true } = options;

    await loadMusicMetadata();

    if (!fs.existsSync(musicDir)) {
        throw new Error(`Music directory not found: ${musicDir}`);
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

    console.log(`🎵 Starting music scan in: ${musicDir}`);

    async function scanDirectory(dir, folderAlbum = '') {
        let items;
        try {
            items = fs.readdirSync(dir, { withFileTypes: true });
        } catch (err) {
            console.error(`❌ Cannot read directory ${dir}: ${err.message}`);
            errors.push({ file: dir, error: `Cannot read directory: ${err.message}` });
            return;
        }

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory() && recursive) {
                // Treat subdirectories as potential albums
                await scanDirectory(fullPath, item.name);
            } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    try {
                        const relativePath = path.relative(musicDir, fullPath);
                        const urlPath = '/music/' + relativePath.replace(/\\/g, '/');

                        // Check if song already exists
                        const existingSong = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(urlPath);

                        // Default values from filename
                        let title = path.basename(item.name, ext);
                        let artist = null;
                        let album = folderAlbum;
                        let genre = null;
                        let duration = 0;
                        let extendedMeta = null;

                        // Extract metadata using music-metadata
                        try {
                            const metadata = await parseFile(fullPath);
                            extendedMeta = extractExtendedMetadata(metadata, fullPath);

                            // Use extracted values
                            if (extendedMeta.title) title = extendedMeta.title;
                            if (extendedMeta.artist) artist = extendedMeta.artist;
                            if (extendedMeta.album) album = extendedMeta.album;
                            if (extendedMeta.genre) genre = extendedMeta.genre;
                            if (extendedMeta.duration) duration = extendedMeta.duration;

                        } catch (err) {
                            console.warn(`⚠️ Failed to parse metadata for ${item.name}: ${err.message}`);
                            // Create minimal extended metadata with file info
                            extendedMeta = { hasPicture: false, picture: null };
                        }

                        // Process cover art
                        const coverPath = processCoverArt(extendedMeta, dir, musicDir, coversDir);

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
                            album || 'Unknown Album',
                            urlPath,
                            duration,
                            coverPath,
                            genre
                        );

                        // Get the song ID for extended metadata
                        const song = db.prepare('SELECT id FROM songs WHERE file_path = ?').get(urlPath);

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
                        console.error(`❌ Error processing ${item.name}: ${error.message}`);
                        errors.push({ file: item.name, error: error.message });
                    }
                }
            }
        }
    }

    await scanDirectory(musicDir);

    const totalSongs = db.prepare('SELECT COUNT(*) as count FROM songs').get().count;
    const scanDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Scan complete: ${scannedCount} files processed (${newCount} new, ${updatedCount} updated) in ${scanDuration}s`);
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
