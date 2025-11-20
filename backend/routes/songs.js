const express = require('express');
const fs = require('fs');
const path = require('path');
const { optionalAuth } = require('../middleware/auth');

function createSongRoutes(db) {
    const router = express.Router();

    // Get all songs with optional pagination and filtering
    router.get('/', optionalAuth, (req, res) => {
        try {
            const { page = 1, limit = 100, album, artist, search } = req.query;
            const offset = (page - 1) * limit;

            let query = 'SELECT * FROM songs';
            let countQuery = 'SELECT COUNT(*) as total FROM songs';
            const params = [];
            const conditions = [];

            if (album) {
                conditions.push('album = ?');
                params.push(album);
            }

            if (artist) {
                conditions.push('artist LIKE ?');
                params.push(`%${artist}%`);
            }

            if (search) {
                conditions.push('(title LIKE ? OR artist LIKE ? OR album LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (conditions.length > 0) {
                const whereClause = ' WHERE ' + conditions.join(' AND ');
                query += whereClause;
                countQuery += whereClause;
            }

            query += ' ORDER BY title LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const songs = db.prepare(query).all(...params);
            const { total } = db.prepare(countQuery).get(...params.slice(0, -2));

            res.json({
                songs,
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

    // Get single song
    router.get('/:id', (req, res) => {
        try {
            const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);

            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
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

            if (!fs.existsSync(musicDir)) {
                return res.status(404).json({ error: 'Music directory not found' });
            }

            let scannedCount = 0;
            const errors = [];

            function scanDirectory(dir, album = '') {
                const items = fs.readdirSync(dir, { withFileTypes: true });

                for (const item of items) {
                    const fullPath = path.join(dir, item.name);

                    if (item.isDirectory()) {
                        // Treat subdirectories as albums
                        scanDirectory(fullPath, item.name);
                    } else if (item.isFile()) {
                        const ext = path.extname(item.name).toLowerCase();
                        if (['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) {
                            try {
                                const relativePath = path.relative(musicDir, fullPath);
                                const urlPath = '/music/' + relativePath.replace(/\\/g, '/');
                                const title = path.basename(item.name, ext);

                                // Insert or update song
                                const stmt = db.prepare(`
                  INSERT INTO songs (title, album, file_path, duration)
                  VALUES (?, ?, ?, ?)
                  ON CONFLICT(file_path) DO UPDATE SET
                    title = excluded.title,
                    album = excluded.album
                `);

                                stmt.run(title, album || 'Unknown Album', urlPath, 0);
                                scannedCount++;
                            } catch (error) {
                                errors.push({ file: item.name, error: error.message });
                            }
                        }
                    }
                }
            }

            scanDirectory(musicDir);

            const totalSongs = db.prepare('SELECT COUNT(*) as count FROM songs').get().count;

            res.json({
                message: 'Scan complete',
                scannedCount,
                totalSongs,
                errors: errors.length > 0 ? errors : undefined
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

            const songs = db.prepare(`
        SELECT * FROM songs
        WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
        ORDER BY play_count DESC
        LIMIT 50
      `).all(`%${q}%`, `%${q}%`, `%${q}%`);

            res.json({ results: songs, query: q });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Search failed' });
        }
    });

    return router;
}

module.exports = createSongRoutes;
