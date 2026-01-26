/**
 * Digital Invitation Analytics API Routes
 * Analytics tracking and reporting for digital invitations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');

// Middleware
const { authenticateToken } = require('../middleware/auth');

const createInviteAnalyticsRoutes = (db) => {
  const router = express.Router();

  /**
   * Helper: Parse user agent and extract device info
   */
  const parseDeviceInfo = (userAgent) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    return {
      device: result.device.type || 'desktop', // mobile|tablet|desktop
      browser: result.browser.name || 'unknown',
      os: result.os.name || 'unknown'
    };
  };

  /**
   * Helper: Get location from IP (simplified - in production use ipinfo.io)
   */
  const getLocationFromIP = async (ip) => {
    // For now, return generic data. In production:
    // const response = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
    // const data = await response.json();
    // return { city: data.city, country: data.country, region: data.region };

    return { city: 'Unknown', country: 'Unknown', region: 'Unknown' };
  };

  /**
   * @route   GET /api/invites/:id/analytics
   * @desc    Get overall analytics for an invitation
   * @access  Private
   */
  router.get('/:id/analytics', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get total analytics
      const stats = await db.get(
        `SELECT
          COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views,
          COUNT(CASE WHEN event_type = 'open' THEN 1 END) as total_opens,
          COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
          COUNT(CASE WHEN event_type = 'rsvp' THEN 1 END) as total_rsvps
         FROM invite_analytics WHERE invite_id = ?`,
        [id]
      );

      // Get guest count
      const guestStats = await db.get(
        `SELECT COUNT(*) as total_guests,
          SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) as declined,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
         FROM invite_guests WHERE invite_id = ?`,
        [id]
      );

      // Calculate rates
      const totalSent = guestStats.total_guests || 0;
      const openRate = totalSent > 0 ? ((stats.total_opens / totalSent) * 100).toFixed(1) : 0;
      const clickRate = stats.total_opens > 0 ? ((stats.total_clicks / stats.total_opens) * 100).toFixed(1) : 0;
      const rsvpRate = totalSent > 0 ? ((stats.total_rsvps / totalSent) * 100).toFixed(1) : 0;

      // Timeline data (last 30 days)
      const timeline = await db.all(
        `SELECT
          DATE(created_at) as date,
          event_type,
          COUNT(*) as count
         FROM invite_analytics
         WHERE invite_id = ? AND created_at >= datetime('now', '-30 days')
         GROUP BY DATE(created_at), event_type
         ORDER BY date DESC`,
        [id]
      );

      // RSVP distribution
      const rsvpDistribution = [
        { name: 'Accepted', value: guestStats.accepted || 0, color: '#10B981' },
        { name: 'Declined', value: guestStats.declined || 0, color: '#EF4444' },
        { name: 'Pending', value: guestStats.pending || 0, color: '#F59E0B' }
      ];

      res.json({
        success: true,
        data: {
          totalSent,
          totalOpened: stats.total_opens || 0,
          totalClicked: stats.total_clicks || 0,
          totalRsvped: stats.total_rsvps || 0,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          rsvpRate: parseFloat(rsvpRate),
          timeline,
          rsvpDistribution
        }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/analytics/guests
   * @desc    Get guest activity tracking
   * @access  Private
   */
  router.get('/:id/analytics/guests', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status, search } = req.query;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Build query for guest activity
      let query = `
        SELECT
          g.id as guest_id,
          g.name,
          g.email,
          g.status,
          COUNT(a.id) as open_count,
          MAX(a.created_at) as last_open,
          json_extract(a.metadata, '$.device') as device,
          json_extract(a.metadata, '$.location') as location
        FROM invite_guests g
        LEFT JOIN invite_analytics a ON g.id = a.guest_id
        WHERE g.invite_id = ?
      `;
      const params = [id];

      if (status) {
        query += ' AND g.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (g.name LIKE ? OR g.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' GROUP BY g.id ORDER BY open_count DESC, g.name';

      const guests = await db.all(query, params);

      res.json({
        success: true,
        data: guests
      });

    } catch (error) {
      console.error('Error fetching guest activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch guest activity'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/analytics/geo
   * @desc    Get geographic distribution
   * @access  Private
   */
  router.get('/:id/analytics/geo', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get geo data from analytics metadata
      const analytics = await db.all(
        'SELECT metadata FROM invite_analytics WHERE invite_id = ? AND metadata IS NOT NULL',
        [id]
      );

      // Aggregate locations
      const locationMap = new Map();

      for (const row of analytics) {
        try {
          const metadata = JSON.parse(row.metadata || '{}');
          if (metadata.location && metadata.location.city) {
            const key = `${metadata.location.city}, ${metadata.location.country}`;
            locationMap.set(key, (locationMap.get(key) || 0) + 1);
          }
        } catch (e) {
          // Skip invalid metadata
        }
      }

      // Convert to array and sort by count
      const geoData = Array.from(locationMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 cities

      res.json({
        success: true,
        data: geoData
      });

    } catch (error) {
      console.error('Error fetching geo data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch geographic data'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/analytics/devices
   * @desc    Get device breakdown
   * @access  Private
   */
  router.get('/:id/analytics/devices', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get device data from analytics
      const analytics = await db.all(
        'SELECT metadata FROM invite_analytics WHERE invite_id = ? AND event_type = "view" AND metadata IS NOT NULL',
        [id]
      );

      // Aggregate devices
      const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };

      for (const row of analytics) {
        try {
          const metadata = JSON.parse(row.metadata || '{}');
          if (metadata.device) {
            deviceCounts[metadata.device] = (deviceCounts[metadata.device] || 0) + 1;
          }
        } catch (e) {
          // Skip invalid metadata
        }
      }

      // Convert to array
      const deviceData = Object.entries(deviceCounts)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0);

      res.json({
        success: true,
        data: deviceData
      });

    } catch (error) {
      console.error('Error fetching device breakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch device breakdown'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/analytics/timeline
   * @desc    Get timeline data for charts
   * @access  Private
   */
  router.get('/:id/analytics/timeline', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { days = 30 } = req.query;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get timeline data
      const timeline = await db.all(
        `SELECT
          DATE(created_at) as date,
          event_type,
          COUNT(*) as count
         FROM invite_analytics
         WHERE invite_id = ? AND created_at >= datetime('now', '-${days} days')
         GROUP BY DATE(created_at), event_type
         ORDER BY date ASC`,
        [id]
      );

      res.json({
        success: true,
        data: timeline
      });

    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch timeline data'
      });
    }
  });

  /**
   * @route   POST /api/invites/:id/analytics/track
   * @desc    Track analytics event (public endpoint)
   * @access  Public
   */
  router.post('/:id/analytics/track', async (req, res) => {
    try {
      const { id } = req.params;
      const { eventType, guestId, metadata = {} } = req.body;

      // Verify invite exists and is published
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND status = ?',
        [id, 'published']
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Parse device info from user agent
      const deviceInfo = parseDeviceInfo(req.headers['user-agent'] || '');

      // Get location from IP
      const location = await getLocationFromIP(req.ip || req.connection.remoteAddress);

      // Combine metadata
      const combinedMetadata = {
        ...metadata,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        location: {
          city: location.city,
          country: location.country,
          region: location.region
        },
        referrer: req.headers.referer || '',
        userAgent: req.headers['user-agent'] || ''
      };

      // Create analytics event
      const eventId = uuidv4();

      await db.run(
        `INSERT INTO invite_analytics (id, invite_id, guest_id, event_type, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [eventId, id, guestId || null, eventType || 'view', JSON.stringify(combinedMetadata)]
      );

      res.json({
        success: true
      });

    } catch (error) {
      console.error('Error tracking analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track event'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/analytics/export
   * @desc    Export analytics as CSV
   * @access  Private
   */
  router.get('/:id/analytics/export', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      // Get all analytics data
      const analytics = await db.all(
        `SELECT
          ia.event_type,
          ia.created_at,
          json_extract(ia.metadata, '$.device') as device,
          json_extract(ia.metadata, '$.browser') as browser,
          json_extract(ia.metadata, '$.os') as os,
          json_extract(ia.metadata, '$.location') as location,
          g.name as guest_name,
          g.email as guest_email
         FROM invite_analytics ia
         LEFT JOIN invite_guests g ON ia.guest_id = g.id
         WHERE ia.invite_id = ?
         ORDER BY ia.created_at DESC`,
        [id]
      );

      // Generate CSV
      const headers = 'Event Type,Date,Guest Name,Guest Email,Device,Browser,OS,Location';
      const rows = analytics.map(a =>
        `"${a.event_type}","${a.created_at}","${a.guest_name || ''}","${a.guest_email || ''}","${a.device || ''}","${a.browser || ''}","${a.os || ''}","${a.location || ''}"`
      );

      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics_${id}.csv"`);

      res.send(csv);

    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics'
      });
    }
  });

  /**
   * @route   GET /api/invites/:id/analytics/all
   * @desc    Get all analytics records (for debugging)
   * @access  Private
   */
  router.get('/:id/analytics/all', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Verify ownership
      const invite = await db.get(
        'SELECT * FROM digital_invites WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!invite) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found'
        });
      }

      const analytics = await db.all(
        'SELECT * FROM invite_analytics WHERE invite_id = ? ORDER BY created_at DESC LIMIT 1000',
        [id]
      );

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  });

  return router;
};

module.exports = createInviteAnalyticsRoutes;
