/**
 * Map Location Service
 * Handles map location display, geocoding, and analytics
 */

const db = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');

/**
 * Hash IP address for privacy
 */
function hashIP(ipAddress) {
  if (!ipAddress) return null;
  return crypto
    .createHash('sha256')
    .update(ipAddress)
    .digest('hex');
}

/**
 * Get device type from user agent
 */
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|windows phone/.test(ua)) {
    if (/ipad/.test(ua)) return 'tablet';
    if (/mobile|android|iphone|windows phone/.test(ua)) return 'mobile';
  }
  return 'desktop';
}

/**
 * Geocode address using Google Geocoding API
 * Returns { lat, lng, formattedAddress, placeId }
 */
async function geocodeAddress(address) {
  if (!address || !process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Address or Google Maps API key not configured');
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      },
      timeout: 5000
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        components: result.address_components
      };
    }

    throw new Error('Address not found');
  } catch (error) {
    console.error('Error geocoding address:', error.message);
    throw new Error('Failed to geocode address');
  }
}

/**
 * Get map static image URL from Google Maps Static API
 * Used for map preview/thumbnail
 */
function getMapStaticImage(lat, lng, zoom = 15, width = 600, height = 400) {
  if (!process.env.GOOGLE_MAPS_API_KEY || !lat || !lng) {
    return null;
  }

  // Build Google Static Maps URL
  const url = new URL('https://maps.googleapis.com/maps/api/staticmap');
  url.searchParams.append('center', `${lat},${lng}`);
  url.searchParams.append('zoom', zoom);
  url.searchParams.append('size', `${width}x${height}`);
  url.searchParams.append('markers', `color:blue|${lat},${lng}`);
  url.searchParams.append('key', process.env.GOOGLE_MAPS_API_KEY);
  url.searchParams.append('style', 'feature:all|element:labels|visibility:off');

  return url.toString();
}

/**
 * Create or update map location link metadata
 */
function updateMapLocationMetadata(linkId, address, lat, lng, zoom = 15) {
  try {
    // Get current metadata
    const link = db
      .prepare('SELECT metadata FROM link_items WHERE id = ?')
      .get(linkId);

    if (!link) {
      throw new Error('Link not found');
    }

    const metadata = link.metadata ? JSON.parse(link.metadata) : {};

    // Update map-specific metadata
    metadata.mapLocation = {
      address,
      lat,
      lng,
      zoom,
      staticImageUrl: getMapStaticImage(lat, lng, zoom),
      updatedAt: new Date().toISOString()
    };

    // Update database
    db.prepare('UPDATE link_items SET metadata = ? WHERE id = ?').run(JSON.stringify(metadata), linkId);

    return metadata.mapLocation;
  } catch (error) {
    console.error('Error updating map location metadata:', error);
    throw error;
  }
}

/**
 * Track map location view
 */
function trackMapView(linkId, profileId, ipAddress, userAgent) {
  try {
    const ipHash = hashIP(ipAddress);
    const deviceType = getDeviceType(userAgent);

    db.prepare(
      `
      INSERT INTO map_location_views (link_id, profile_id, ip_hash, device_type)
      VALUES (?, ?, ?, ?)
    `
    ).run(linkId, profileId, ipHash, deviceType);

    return true;
  } catch (error) {
    console.error('Error tracking map view:', error);
    // Don't throw - analytics shouldn't block functionality
    return false;
  }
}

/**
 * Get map location analytics
 */
function getMapAnalytics(linkId, profileId) {
  try {
    // Total views
    const totalViews = db
      .prepare('SELECT COUNT(*) as count FROM map_location_views WHERE link_id = ? AND profile_id = ?')
      .get(linkId, profileId)?.count || 0;

    // Unique visitors
    const uniqueVisitors = db
      .prepare('SELECT COUNT(DISTINCT ip_hash) as count FROM map_location_views WHERE link_id = ? AND profile_id = ?')
      .get(linkId, profileId)?.count || 0;

    // Views by device type
    const viewsByDevice = db
      .prepare(
        `
      SELECT device_type, COUNT(*) as count
      FROM map_location_views
      WHERE link_id = ? AND profile_id = ?
      GROUP BY device_type
    `
      )
      .all(linkId, profileId);

    // Views by date (last 7 days)
    const viewsByDate = db
      .prepare(
        `
      SELECT DATE(viewed_at) as date, COUNT(*) as count
      FROM map_location_views
      WHERE link_id = ? AND profile_id = ? AND viewed_at > datetime('now', '-7 days')
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
    `
      )
      .all(linkId, profileId);

    return {
      totalViews,
      uniqueVisitors,
      viewsByDevice,
      viewsByDate,
      engagementRate: totalViews > 0 ? Math.round((uniqueVisitors / totalViews) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching map analytics:', error);
    throw error;
  }
}

/**
 * Validate map location address
 * Checks if address is valid and geocodable
 */
async function validateAddress(address) {
  if (!address || address.trim().length === 0) {
    return { valid: false, error: 'Address is required' };
  }

  if (address.length > 500) {
    return { valid: false, error: 'Address too long (max 500 characters)' };
  }

  // Only validate with API if configured
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    // Basic validation without API
    return { valid: true, warning: 'Google Maps API not configured for address verification' };
  }

  try {
    const geocodeResult = await geocodeAddress(address);
    return {
      valid: true,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      formattedAddress: geocodeResult.formattedAddress
    };
  } catch (error) {
    return { valid: false, error: 'Address could not be verified' };
  }
}

/**
 * Get embedded map HTML
 * Returns responsive embed code for map display
 */
function getEmbeddedMapHTML(lat, lng, address = '', zoom = 15) {
  if (!lat || !lng) {
    return '';
  }

  // Use Google Maps Embed API with responsive styling
  const embedApiUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address || `${lat},${lng}`)}`;

  return `
<div style="width: 100%; height: 500px; border-radius: 8px; overflow: hidden;">
  <iframe
    style="border:0; width:100%; height:100%;"
    loading="lazy"
    allowfullscreen=""
    src="${embedApiUrl}">
  </iframe>
</div>
  `.trim();
}

/**
 * Get directions URL to location
 */
function getDirectionsURL(lat, lng, address = '') {
  const encodedAddress = encodeURIComponent(address || `${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
}

module.exports = {
  geocodeAddress,
  getMapStaticImage,
  updateMapLocationMetadata,
  trackMapView,
  getMapAnalytics,
  validateAddress,
  getEmbeddedMapHTML,
  getDirectionsURL,
  hashIP,
  getDeviceType
};
