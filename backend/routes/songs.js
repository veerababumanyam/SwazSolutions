const express = require('express');
const path = require('path');
const validator = require('validator');
const { optionalAuth } = require('../middleware/auth');
const fs = require('fs');

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

            // Enhance songs with cover_path fallback
            // Cover paths are now set during R2 scanning, but provide fallback for legacy data
            // SECURITY: Remove file_path from response - use secure streaming endpoint instead
            const enhancedSongs = songs.map(song => {
                // Use cover_path from database (set during scan)
                // Fallback to placeholder if not set
                const coverPath = song.cover_path || '/placeholder-album.png';

                // Create secure response without exposing R2 URLs
                const { file_path, ...songWithoutPath } = song;
                
                return {
                    ...songWithoutPath,
                    cover_path: coverPath,
                    // Use secure streaming endpoint instead of direct file_path
                    stream_url: `/api/songs/${song.id}/stream`
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
            // Cover paths are now set during R2 scanning
            if (!song.cover_path) {
                song.cover_path = '/placeholder-album.png';
            }

            // SECURITY: Remove file_path from response - use secure streaming endpoint instead
            const { file_path, ...songWithoutPath } = song;
            res.json({
                ...songWithoutPath,
                stream_url: `/api/songs/${song.id}/stream`
            });
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

    // Scan R2 bucket and update database
    router.post('/scan', async (req, res) => {
        try {
            const { scanMusicDirectory } = require('../services/musicScanner');
            // musicDir parameter is deprecated but kept for compatibility
            // Scanner now uses R2 directly
            const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../../data/MusicFiles');

            const result = await scanMusicDirectory(db, musicDir);

            res.json({
                message: 'R2 scan complete',
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

    // Secure audio streaming endpoint - returns presigned URL on-demand
    // This endpoint ensures users can only access audio through the music player
    // Presigned URLs expire after 1 hour, preventing long-term direct access
    router.get('/:id/stream', async (req, res) => {
        try {
            const { getObjectUrl } = require('../services/r2Service');
            const { r2Config } = require('../config/r2Config');
            
            const song = db.prepare('SELECT file_path FROM songs WHERE id = ?').get(req.params.id);
            
            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
            }

            // Extract R2 key from stored URL
            const filePath = song.file_path;
            let r2Key = null;
            
            // Try to extract key from URL
            const r2UrlPattern = /https?:\/\/[^\/]+\/[^\/]+\/(.+)$/;
            const match = filePath.match(r2UrlPattern);
            
            if (match) {
                let extractedKey = decodeURIComponent(match[1]);
                if (extractedKey.startsWith(`${r2Config.bucketName}/`)) {
                    extractedKey = extractedKey.replace(`${r2Config.bucketName}/`, '');
                }
                r2Key = extractedKey;
            } else {
                // If it's not a full URL, assume it's already a key
                r2Key = filePath.startsWith('/') ? filePath.slice(1) : filePath;
            }
            
            if (!r2Key) {
                return res.status(400).json({ error: 'Invalid song path' });
            }
            
            // Generate presigned URL (expires in 1 hour for security)
            // This URL is never logged or exposed in console
            const presignedUrl = await getObjectUrl(r2Key, true);
            
            // Set security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            
            // Return presigned URL in JSON (Howler.js can use this)
            // The URL expires, preventing long-term direct access
            res.json({ url: presignedUrl });
            
        } catch (error) {
            // Don't log R2 URLs or file paths in errors
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate stream URL' });
            }
        }
    });

    // Get presigned URL for a song (for private R2 buckets) - DEPRECATED, use /stream instead
    router.get('/:id/presigned-url', async (req, res) => {
        try {
            const { getObjectUrl } = require('../services/r2Service');
            const { r2Config } = require('../config/r2Config');
            
            const song = db.prepare('SELECT file_path FROM songs WHERE id = ?').get(req.params.id);
            
            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
            }

            // #region agent log
            const logPath = path.join(__dirname, '../../.cursor/debug.log');
            const logEntry = JSON.stringify({
                location: 'backend/routes/songs.js:189',
                message: 'Generating presigned URL',
                data: {
                    songId: req.params.id,
                    filePath: song.file_path,
                    bucketName: r2Config.bucketName
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

            // Extract R2 key from URL
            // URL format: https://{endpoint}/{bucket}/{key}
            const filePath = song.file_path;
            
            // Try to extract key from URL
            let r2Key = null;
            
            // Pattern 1: https://{endpoint}/{bucket}/{key}
            const r2UrlPattern = /https?:\/\/[^\/]+\/[^\/]+\/(.+)$/;
            const match = filePath.match(r2UrlPattern);
            
            if (match) {
                // Remove bucket name if it's in the path
                let extractedKey = decodeURIComponent(match[1]);
                if (extractedKey.startsWith(`${r2Config.bucketName}/`)) {
                    extractedKey = extractedKey.replace(`${r2Config.bucketName}/`, '');
                }
                r2Key = extractedKey;
            } else {
                // If it's not a full URL, assume it's already a key
                r2Key = filePath.startsWith('/') ? filePath.slice(1) : filePath;
            }
            
            if (!r2Key) {
                return res.status(400).json({ error: 'Invalid R2 URL format', filePath });
            }

            // #region agent log
            const logEntry2 = JSON.stringify({
                location: 'backend/routes/songs.js:230',
                message: 'Extracted R2 key',
                data: {
                    songId: req.params.id,
                    extractedKey: r2Key
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
            
            // Generate presigned URL
            const presignedUrl = await getObjectUrl(r2Key, true);
            
            // #region agent log
            const logEntry3 = JSON.stringify({
                location: 'backend/routes/songs.js:245',
                message: 'Generated presigned URL',
                data: {
                    songId: req.params.id,
                    presignedUrlLength: presignedUrl?.length
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'H1'
            }) + '\n';
            try {
                fs.appendFileSync(logPath, logEntry3);
            } catch (e) {}
            // #endregion
            
            res.json({ url: presignedUrl });
        } catch (error) {
            // #region agent log
            const logPath = path.join(__dirname, '../../.cursor/debug.log');
            const logEntry = JSON.stringify({
                location: 'backend/routes/songs.js:260',
                message: 'Presigned URL generation error',
                data: {
                    songId: req.params.id,
                    error: error.message,
                    stack: error.stack
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
            console.error('Get presigned URL error:', error);
            res.status(500).json({ error: 'Failed to generate presigned URL', details: error.message });
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

            // SECURITY: Remove file_path from search results
            const sanitizedSongs = songs.map(song => {
                const { file_path, ...songWithoutPath } = song;
                return {
                    ...songWithoutPath,
                    stream_url: `/api/songs/${song.id}/stream`
                };
            });

            res.json({ results: sanitizedSongs, query: q });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Search failed' });
        }
    });

    return router;
}

module.exports = createSongRoutes;
