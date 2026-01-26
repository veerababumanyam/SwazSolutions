const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Get current visitor count
    router.get('/', (req, res) => {
        try {
            const result = db.prepare('SELECT count FROM visitors WHERE id = 1').get();
            if (result) {
                res.json({ count: result.count });
            } else {
                // Should not happen if initialized correctly, but handle gracefully
                res.json({ count: 0 });
            }
        } catch (error) {
            console.error('Error fetching visitor count:', error);
            res.status(500).json({ error: 'Failed to fetch visitor count' });
        }
    });

    // Increment visitor count
    router.post('/increment', (req, res) => {
        try {
            // Atomic increment
            db.prepare('UPDATE visitors SET count = count + 1, last_updated = CURRENT_TIMESTAMP WHERE id = 1').run();

            const result = db.prepare('SELECT count FROM visitors WHERE id = 1').get();
            
            if (!result) {
                // Row doesn't exist, initialize it
                db.prepare('INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 1)').run();
                const newResult = db.prepare('SELECT count FROM visitors WHERE id = 1').get();
                return res.json({ count: newResult ? newResult.count : 1 });
            }
            
            res.json({ count: result.count });
        } catch (error) {
            console.error('Error incrementing visitor count:', error);
            res.status(500).json({ error: 'Failed to increment visitor count' });
        }
    });

    return router;
};
