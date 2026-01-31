const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET /api/testimonials?service=data-recovery&limit=6
  router.get('/', async (req, res) => {
    try {
      const { service, limit = 6 } = req.query;
      const query = service
        ? 'SELECT * FROM testimonials WHERE approved = 1 AND service_type = ? ORDER BY featured DESC, created_at DESC LIMIT ?'
        : 'SELECT * FROM testimonials WHERE approved = 1 ORDER BY featured DESC, created_at DESC LIMIT ?';

      const params = service ? [service, parseInt(limit)] : [parseInt(limit)];
      const testimonials = db.prepare(query).all(...params);
      res.json({ testimonials });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
  });

  return router;
};
