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
      dateFilter = 'AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND date >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND date <= ?';
      params.push(endDate);
    }

    // T265: Fetch analytics summary with time series
    const summaryStmt = db.prepare(`
      SELECT
        date as summary_date,
        total_views,
        unique_visitors,
        vcard_downloads,
        share_count
      FROM analytics_summary
      WHERE profile_id = ? ${dateFilter}
      ORDER BY date DESC
      LIMIT 90
    `);
    const summaries = summaryStmt.all(...params);

    // Parse JSON fields
    const parsed = summaries.map(s => ({
      date: s.summary_date,
      views: s.total_views || 0,
      uniqueVisitors: s.unique_visitors || 0,
      downloads: s.vcard_downloads || 0,
      shares: s.share_count || 0,
      topReferrers: [],
      topDevices: []
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
      SELECT COUNT(*) as views, COUNT(DISTINCT viewer_ip_hash) as unique_count
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
      WHERE profile_id = ? AND DATE(created_at) = DATE('now')
    `);
    const shares = sharesStmt.get(profile.id);

    res.json({
      today: {
        views: views?.views || 0,
        uniqueVisitors: views?.unique_count || 0,
        downloads: downloads?.downloads || 0,
        shares: shares?.shares || 0
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
      dateFilter = 'AND DATE(created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND DATE(created_at) >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    // Get share method breakdown
    const channelStmt = db.prepare(`
      SELECT
        share_method as channel,
        COUNT(*) as count
      FROM share_events
      WHERE profile_id = ? ${dateFilter}
      GROUP BY share_method
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

// ============================================================================
// Get Device Breakdown Analytics
// ============================================================================
router.get('/me/analytics/devices', auth, (req, res) => {
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
      dateFilter = 'AND DATE(viewed_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND DATE(viewed_at) >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND DATE(viewed_at) <= ?';
      params.push(endDate);
    }

    // Get device breakdown
    const deviceStmt = db.prepare(`
      SELECT
        COALESCE(device_type, 'unknown') as device,
        COUNT(*) as count
      FROM profile_views
      WHERE profile_id = ? ${dateFilter}
      GROUP BY device_type
      ORDER BY count DESC
    `);
    const devices = deviceStmt.all(...params);

    // Calculate total
    const total = devices.reduce((sum, d) => sum + d.count, 0);

    // Add percentages
    const breakdown = devices.map(d => ({
      device: d.device,
      count: d.count,
      percentage: total > 0 ? parseFloat(((d.count / total) * 100).toFixed(2)) : 0
    }));

    res.json({
      breakdown,
      total
    });

  } catch (error) {
    console.error('Error fetching device breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch device breakdown' });
  }
});

// ============================================================================
// Get Referrer Analytics
// ============================================================================
router.get('/me/analytics/referrers', auth, (req, res) => {
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
      dateFilter = 'AND DATE(viewed_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND DATE(viewed_at) >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND DATE(viewed_at) <= ?';
      params.push(endDate);
    }

    // Get referrer breakdown
    const referrerStmt = db.prepare(`
      SELECT
        COALESCE(referrer, 'Direct') as source,
        COUNT(*) as count
      FROM profile_views
      WHERE profile_id = ? ${dateFilter}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `);
    const referrers = referrerStmt.all(...params);

    // Calculate total
    const total = referrers.reduce((sum, r) => sum + r.count, 0);

    // Add percentages and clean up referrer names
    const breakdown = referrers.map(r => {
      let sourceName = r.source;
      if (sourceName && sourceName !== 'Direct') {
        try {
          const url = new URL(sourceName);
          sourceName = url.hostname.replace('www.', '');
        } catch {
          // Keep original if not a valid URL
        }
      }
      return {
        source: sourceName,
        count: r.count,
        percentage: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(2)) : 0
      };
    });

    res.json({
      breakdown,
      total
    });

  } catch (error) {
    console.error('Error fetching referrer breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch referrer breakdown' });
  }
});

// ============================================================================
// Get Trends and Comparisons
// ============================================================================
router.get('/me/analytics/trends', auth, (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's profile
    const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const profile = profileStmt.get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get current week stats (last 7 days)
    const currentWeekStmt = db.prepare(`
      SELECT
        COALESCE(SUM(total_views), 0) as views,
        COALESCE(SUM(unique_visitors), 0) as visitors,
        COALESCE(SUM(vcard_downloads), 0) as downloads,
        COALESCE(SUM(share_count), 0) as shares
      FROM analytics_summary
      WHERE profile_id = ? AND date >= DATE('now', '-7 days')
    `);
    const currentWeek = currentWeekStmt.get(profile.id);

    // Get previous week stats (8-14 days ago)
    const previousWeekStmt = db.prepare(`
      SELECT
        COALESCE(SUM(total_views), 0) as views,
        COALESCE(SUM(unique_visitors), 0) as visitors,
        COALESCE(SUM(vcard_downloads), 0) as downloads,
        COALESCE(SUM(share_count), 0) as shares
      FROM analytics_summary
      WHERE profile_id = ? AND date >= DATE('now', '-14 days') AND date < DATE('now', '-7 days')
    `);
    const previousWeek = previousWeekStmt.get(profile.id);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const trends = {
      views: {
        current: currentWeek.views,
        previous: previousWeek.views,
        change: calculateChange(currentWeek.views, previousWeek.views)
      },
      visitors: {
        current: currentWeek.visitors,
        previous: previousWeek.visitors,
        change: calculateChange(currentWeek.visitors, previousWeek.visitors)
      },
      downloads: {
        current: currentWeek.downloads,
        previous: previousWeek.downloads,
        change: calculateChange(currentWeek.downloads, previousWeek.downloads)
      },
      shares: {
        current: currentWeek.shares,
        previous: previousWeek.shares,
        change: calculateChange(currentWeek.shares, previousWeek.shares)
      }
    };

    res.json({ trends });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;
