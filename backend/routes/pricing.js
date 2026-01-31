const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET /api/pricing?service=data-recovery
  router.get('/', async (req, res) => {
    try {
      const { service } = req.query;
      const query = service
        ? 'SELECT * FROM pricing_plans WHERE is_active = 1 AND service_type = ? ORDER BY sort_order, price_inr'
        : 'SELECT * FROM pricing_plans WHERE is_active = 1 ORDER BY service_type, sort_order, price_inr';

      const params = service ? [service] : [];
      const plans = db.prepare(query).all(...params);

      res.json({
        plans: plans.map(p => ({
          ...p,
          features: JSON.parse(p.features || '[]')
        }))
      });
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      res.status(500).json({ error: 'Failed to fetch pricing plans' });
    }
  });

  return router;
};
