const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimit');

module.exports = (db) => {
  // POST /api/newsletter/subscribe
  router.post('/subscribe', apiLimiter, async (req, res) => {
    try {
      const { email, name, honeypot } = req.body;

      // Honeypot spam protection
      if (honeypot) {
        return res.status(400).json({ error: 'Invalid submission' });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Insert subscription
      const result = db.prepare(
        'INSERT INTO newsletter_subscriptions (email, name, source) VALUES (?, ?, ?)'
      ).run(email, name || '', 'landing-page');

      res.json({ message: 'Subscribed successfully', id: result.lastInsertRowid });
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        res.status(400).json({ error: 'Email already subscribed' });
      } else {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ error: 'Subscription failed' });
      }
    }
  });

  return router;
};
