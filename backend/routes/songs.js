const express = require('express');
const fs = require('fs');
const path = require('path');
const validator = require('validator');
const { optionalAuth } = require('../middleware/auth');

/**
 * Find cover image in album directory
 * Supports: jpg, jpeg, png, webp
 * Priority: cover > folder > album > any image
 */
function findCoverImage(albumPath, musicDir) {
    if (!fs.existsSync(albumPath)) {
        return null;
    }

    const coverNames = ['cover', 'folder', 'album'];
    const formats = ['jpg', 'jpeg', 'png', 'webp'];

    // Try priority names first
    for (const name of coverNames) {
        for (const fmt of formats) {
            const coverPath = path.join(albumPath, `${name}.${fmt}`);
            if (fs.existsSync(coverPath)) {
                const relativePath = path.relative(musicDir, coverPath);
                return '/music/' + relativePath.replace(/\\/g, '/');
            }
        }
    }

    // Fallback: any image file in the directory
    try {
        const files = fs.readdirSync(albumPath);
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                const coverPath = path.join(albumPath, file);
                const relativePath = path.relative(musicDir, coverPath);
                return '/music/' + relativePath.replace(/\\/g, '/');
            }
        }
    } catch (error) {
        console.warn('Error reading album directory:', error);
    }

    // Final fallback: check for default cover in MusicFiles root
    const defaultCovers = ['default-cover.png', 'default-cover.jpg', 'cover.png', 'cover.jpg'];
    for (const coverFile of defaultCovers) {
        const defaultCoverPath = path.join(musicDir, coverFile);
        if (fs.existsSync(defaultCoverPath)) {
            return `/music/${coverFile}`;
        }
    }

    // Ultimate fallback: placeholder image
    return '/placeholder-album.png';
}

function createSongRoutes(db) {
    const router = express.Router();

    // Get all songs with optional pagination and filtering
    router.get('/', optionalAuth, (req, res) => {
        try {
            const { page = 1, limit = 100, album, artist, search } = req.query;
            const offset = (page - 1) * limit;

            // Join with music_metadata to include extended metadata (bitrate, sample rate, etc.)
            let query = `
                SELECT
                    s.*,
                    m.bit_rate,
                    m.sample_rate,
                    m.channels,
                    m.codec,
                    m.track_number,
                    m.disc_number,
                    m.bpm,
                    m.file_size,
                    m.lyrics,
                    m.composer
                FROM songs s
                LEFT JOIN music_metadata m ON s.id = m.song_id
            `;
            let countQuery = 'SELECT COUNT(*) as total FROM songs';
            const params = [];
            const conditions = [];

            if (album) {
                conditions.push('s.album = ?');
                params.push(album);
            }

            if (artist) {
                conditions.push('s.artist LIKE ?');
                params.push(`%${artist}%`);
            }

            if (search) {
                conditions.push('(s.title LIKE ? OR s.artist LIKE ? OR s.album LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (conditions.length > 0) {
                const whereClause = ' WHERE ' + conditions.join(' AND ');
                query += whereClause;
                countQuery += whereClause;
            }

            query += ' ORDER BY s.title LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const songs = db.prepare(query).all(...params);
            const { total } = db.prepare(countQuery).get(...params.slice(0, -2));

            // Enhance songs with cover_path using three-tier fallback:
            // 1. Metadata embedded cover (from DB)
            // 2. Folder image (cover.jpg, folder.jpg, etc.)
            // 3. Default placeholder
            const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../../data/MusicFiles');
            const enhancedSongs = songs.map(song => {
                let coverPath = null;
                
                // Priority 1: Metadata embedded cover from database
                if (song.cover_path) {
                    coverPath = song.cover_path;
                } else {
                    // Priority 2: Look for cover in album folder
                    const filePath = song.file_path.replace('/music/', '');
                    const albumPath = path.join(musicDir, path.dirname(filePath));
                    coverPath = findCoverImage(albumPath, musicDir);
                }

                return {
                    ...song,
                    cover_path: coverPath
                };
            });

            res.json({
                songs: enhancedSongs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get songs error:', error);
            res.status(500).json({ error: 'Failed to fetch songs' });
        }
    });

    // Get single song with extended metadata
    router.get('/:id', (req, res) => {
        try {
            const song = db.prepare(`
                SELECT
                    s.*,
                    m.bit_rate,
                    m.sample_rate,
                    m.channels,
                    m.codec,
                    m.track_number,
                    m.disc_number,
                    m.bpm,
                    m.file_size,
                    m.lyrics,
                    m.composer
                FROM songs s
                LEFT JOIN music_metadata m ON s.id = m.song_id
                WHERE s.id = ?
            `).get(req.params.id);

            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
            }

            // Enhance with cover_path fallback
            const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../../data/MusicFiles');
            if (!song.cover_path) {
                const filePath = song.file_path.replace('/music/', '');
                const albumPath = path.join(musicDir, path.dirname(filePath));
                song.cover_path = findCoverImage(albumPath, musicDir);
            }

            res.json(song);
        } catch (error) {
            console.error('Get song error:', error);
            res.status(500).json({ error: 'Failed to fetch song' });
        }
    });

    // Get all albums
    router.get('/albums/list', (req, res) => {
        try {
            const albums = db.prepare(`
        SELECT 
          album as title,
          artist,
          COUNT(*) as song_count,
          GROUP_CONCAT(id) as song_ids
        FROM songs
        WHERE album IS NOT NULL AND album != ''
        GROUP BY album, artist
        ORDER BY album
      `).all();

            res.json(albums);
        } catch (error) {
            console.error('Get albums error:', error);
            res.status(500).json({ error: 'Failed to fetch albums' });
        }
    });

    // Scan music folder and update database
    router.post('/scan', async (req, res) => {
        try {
            const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../../data/MusicFiles');
            const { scanMusicDirectory } = require('../services/musicScanner');

            const result = await scanMusicDirectory(db, musicDir);

            res.json({
                message: 'Scan complete',
                ...result
            });
        } catch (error) {
            console.error('Scan error:', error);
            res.status(500).json({ error: 'Scan failed', details: error.message });
        }
    });

    // Increment play count
    router.post('/:id/play', (req, res) => {
        try {
            const stmt = db.prepare('UPDATE songs SET play_count = play_count + 1 WHERE id = ?');
            const result = stmt.run(req.params.id);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Song not found' });
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Update play count error:', error);
            res.status(500).json({ error: 'Failed to update play count' });
        }
    });

    // Search songs
    router.get('/search/query', (req, res) => {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({ error: 'Search query required' });
            }

            // Sanitize and validate search query
            const sanitizedQuery = validator.trim(validator.escape(q.toString()));
            if (sanitizedQuery.length > 100) {
                return res.status(400).json({ error: 'Search query too long' });
            }

            const songs = db.prepare(`
        SELECT * FROM songs
        WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
        ORDER BY play_count DESC
        LIMIT 50
      `).all(`%${sanitizedQuery}%`, `%${sanitizedQuery}%`, `%${sanitizedQuery}%`);

            res.json({ results: songs, query: q });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Search failed' });
        }
    });

    return router;
}

module.exports = createSongRoutes;
