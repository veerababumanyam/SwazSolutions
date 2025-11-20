const express = require('express');
const { authenticateToken } = require('../middleware/auth');

function createPlaylistRoutes(db) {
    const router = express.Router();

    // Get all public playlists (no auth required for open access)
    router.get('/', (req, res) => {
        try {
            const playlists = db.prepare(`
        SELECT 
          p.*,
          COUNT(ps.song_id) as song_count
        FROM playlists p
        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `).all();

            res.json(playlists);
        } catch (error) {
            console.error('Get playlists error:', error);
            res.status(500).json({ error: 'Failed to fetch playlists' });
        }
    });

    // Get single playlist with songs
    router.get('/:id', (req, res) => {
        try {
            const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);

            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }

            const songs = db.prepare(`
        SELECT s.*, ps.position
        FROM songs s
        JOIN playlist_songs ps ON s.id = ps.song_id
        WHERE ps.playlist_id = ?
        ORDER BY ps.position
      `).all(req.params.id);

            res.json({ ...playlist, songs });
        } catch (error) {
            console.error('Get playlist error:', error);
            res.status(500).json({ error: 'Failed to fetch playlist' });
        }
    });

    // Create new playlist (open access, user_id = 0)
    router.post('/', (req, res) => {
        try {
            const { name, description, is_public = true } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Playlist name required' });
            }

            const stmt = db.prepare(`
        INSERT INTO playlists (user_id, name, description, is_public)
        VALUES (?, ?, ?, ?)
      `);

            const result = stmt.run(0, name, description || null, is_public ? 1 : 0);

            const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(result.lastInsertRowid);

            res.status(201).json(playlist);
        } catch (error) {
            console.error('Create playlist error:', error);
            res.status(500).json({ error: 'Failed to create playlist' });
        }
    });

    // Update playlist
    router.put('/:id', (req, res) => {
        try {
            const { name, description, is_public } = req.body;

            const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?')
                .get(req.params.id);

            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }

            const stmt = db.prepare(`
        UPDATE playlists 
        SET name = ?, description = ?, is_public = ?
        WHERE id = ?
      `);

            stmt.run(
                name || playlist.name,
                description !== undefined ? description : playlist.description,
                is_public !== undefined ? (is_public ? 1 : 0) : playlist.is_public,
                req.params.id
            );

            const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
            res.json(updated);
        } catch (error) {
            console.error('Update playlist error:', error);
            res.status(500).json({ error: 'Failed to update playlist' });
        }
    });

    // Delete playlist
    router.delete('/:id', (req, res) => {
        try {
            const stmt = db.prepare('DELETE FROM playlists WHERE id = ?');
            const result = stmt.run(req.params.id);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Playlist not found' });
            }

            res.json({ message: 'Playlist deleted successfully' });
        } catch (error) {
            console.error('Delete playlist error:', error);
            res.status(500).json({ error: 'Failed to delete playlist' });
        }
    });

    // Add song to playlist
    router.post('/:id/songs', (req, res) => {
        try {
            const { song_id } = req.body;

            if (!song_id) {
                return res.status(400).json({ error: 'Song ID required' });
            }

            // Verify playlist exists
            const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);

            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }

            // Get next position
            const { max_position } = db.prepare(`
        SELECT COALESCE(MAX(position), 0) as max_position 
        FROM playlist_songs 
        WHERE playlist_id = ?
      `).get(req.params.id);

            const stmt = db.prepare(`
        INSERT INTO playlist_songs (playlist_id, song_id, position)
        VALUES (?, ?, ?)
      `);

            stmt.run(req.params.id, song_id, max_position + 1);

            res.status(201).json({ message: 'Song added to playlist' });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint')) {
                res.status(409).json({ error: 'Song already in playlist' });
            } else {
                console.error('Add song error:', error);
                res.status(500).json({ error: 'Failed to add song' });
            }
        }
    });

    // Remove song from playlist
    router.delete('/:id/songs/:songId', (req, res) => {
        try {
            const stmt = db.prepare(`
        DELETE FROM playlist_songs 
        WHERE playlist_id = ? AND song_id = ?
      `);

            const result = stmt.run(req.params.id, req.params.songId);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Song not in playlist' });
            }

            res.json({ message: 'Song removed from playlist' });
        } catch (error) {
            console.error('Remove song error:', error);
            res.status(500).json({ error: 'Failed to remove song' });
        }
    });

    return router;
}

module.exports = createPlaylistRoutes;
