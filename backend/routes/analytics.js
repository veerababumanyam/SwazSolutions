// Analytics Routes (T019)
// Handles profile analytics retrieval and aggregation

const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const db = require('../config/database');

// ============================================================================
// T264: Get Profile Analytics (GET /api/profiles/me/analytics)
// ============================================================================
router.get('/me/analytics', auth, (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.user.id;

  try {
    // Get user's profile
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Build date filter
    let dateFilter = '';
    const params = [profile.id];

    if (startDate && endDate) {
      dateFilter = 'AND summary_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND summary_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND summary_date <= ?';
      params.push(endDate);
    }

    // T265: Fetch analytics summary with time series
    const summaryStmt = db.prepare(`
      SELECT 
        summary_date,
        total_views,
        unique_visitors,
        vcard_downloads,
        share_events,
        top_referrers,
        top_devices
      FROM analytics_summary
      WHERE profile_id = ? ${dateFilter}
      ORDER BY summary_date DESC
      LIMIT 90
    `);
    const summaries = summaryStmt.all(...params);

    // Parse JSON fields
    const parsed = summaries.map(s => ({
      date: s.summary_date,
      views: s.total_views,
      uniqueVisitors: s.unique_visitors,
      downloads: s.vcard_downloads,
      shares: s.share_events,
      topReferrers: s.top_referrers ? JSON.parse(s.top_referrers) : [],
      topDevices: s.top_devices ? JSON.parse(s.top_devices) : []
    }));

    // Calculate totals
    const totals = {
      totalViews: parsed.reduce((sum, d) => sum + d.views, 0),
      totalUniqueVisitors: parsed.reduce((sum, d) => sum + d.uniqueVisitors, 0),
      totalDownloads: parsed.reduce((sum, d) => sum + d.downloads, 0),
      totalShares: parsed.reduce((sum, d) => sum + d.shares, 0)
    };

    // T267: Calculate conversion metrics
    const conversionRate = totals.totalViews > 0 
      ? ((totals.totalDownloads / totals.totalViews) * 100).toFixed(2)
      : '0.00';

    // Get last update timestamp
    const lastUpdateStmt = db.prepare(`
      SELECT MAX(summary_date) as lastUpdate FROM analytics_summary WHERE profile_id = ?
    `);
    const { lastUpdate } = lastUpdateStmt.get(profile.id);

    res.json({
      totals: {
        ...totals,
        conversionRate: parseFloat(conversionRate)
      },
      timeSeries: parsed,
      lastUpdated: lastUpdate,
      dateRange: {
        start: startDate || parsed[parsed.length - 1]?.date,
        end: endDate || parsed[0]?.date
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================================================
// Get Real-Time Stats (current day, not yet aggregated)
// ============================================================================
router.get('/me/analytics/realtime', auth, (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's profile
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get today's views (not yet aggregated)
    const viewsStmt = db.prepare(`
      SELECT COUNT(*) as views, COUNT(DISTINCT ip_hash) as unique
      FROM profile_views
      WHERE profile_id = ? AND DATE(viewed_at) = DATE('now')
    `);
    const views = viewsStmt.get(profile.id);

    // Get today's downloads
    const downloadsStmt = db.prepare(`
      SELECT COUNT(*) as downloads
      FROM vcard_downloads
      WHERE profile_id = ? AND DATE(downloaded_at) = DATE('now')
    `);
    const downloads = downloadsStmt.get(profile.id);

    // Get today's shares
    const sharesStmt = db.prepare(`
      SELECT COUNT(*) as shares
      FROM share_events
      WHERE profile_id = ? AND DATE(shared_at) = DATE('now')
    `);
    const shares = sharesStmt.get(profile.id);

    res.json({
      today: {
        views: views.views,
        uniqueVisitors: views.unique,
        downloads: downloads.downloads,
        shares: shares.shares
      },
      note: 'Real-time stats for current day. Historical data is aggregated daily at 2-4 AM UTC.'
    });

  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
});

// ============================================================================
// Get Share Channel Breakdown
// ============================================================================
router.get('/me/analytics/shares', auth, (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.user.id;

  try {
    // Get user's profile
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Build date filter
    let dateFilter = '';
    const params = [profile.id];

    if (startDate && endDate) {
      dateFilter = 'AND DATE(shared_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND DATE(shared_at) >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND DATE(shared_at) <= ?';
      params.push(endDate);
    }

    // Get share channel breakdown
    const channelStmt = db.prepare(`
      SELECT 
        channel,
        COUNT(*) as count
      FROM share_events
      WHERE profile_id = ? ${dateFilter}
      GROUP BY channel
      ORDER BY count DESC
    `);
    const channels = channelStmt.all(...params);

    // Calculate total
    const total = channels.reduce((sum, c) => sum + c.count, 0);

    // Add percentages
    const breakdown = channels.map(c => ({
      channel: c.channel,
      count: c.count,
      percentage: total > 0 ? ((c.count / total) * 100).toFixed(2) : '0.00'
    }));

    res.json({
      breakdown,
      total
    });

  } catch (error) {
    console.error('Error fetching share breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch share breakdown' });
  }
});

module.exports = router;
