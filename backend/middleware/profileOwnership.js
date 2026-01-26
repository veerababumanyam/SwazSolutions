// Profile Ownership Middleware (T021)
// Verifies that the authenticated user owns the profile being accessed/modified

const db = require('../config/database');

/**
 * Pre-defined prepared statements for resource ownership checks
 * This approach eliminates SQL injection risk by avoiding dynamic SQL
 * Map table names to their prepared statements
 */
const RESOURCE_QUERIES = Object.freeze({
    social_profiles: 'SELECT * FROM social_profiles WHERE id = ? AND profile_id = ?',
    custom_links: 'SELECT * FROM custom_links WHERE id = ? AND profile_id = ?',
    themes: 'SELECT * FROM themes WHERE id = ? AND profile_id = ?',
    profile_appearance: 'SELECT * FROM profile_appearance WHERE id = ? AND profile_id = ?',
    fonts: 'SELECT * FROM fonts WHERE id = ? AND profile_id = ?',
    profile_views: 'SELECT * FROM profile_views WHERE id = ? AND profile_id = ?',
    share_events: 'SELECT * FROM share_events WHERE id = ? AND profile_id = ?',
    vcard_downloads: 'SELECT * FROM vcard_downloads WHERE id = ? AND profile_id = ?'
});

/**
 * Get safe query for table name
 * @param {string} tableName - Table name to get query for
 * @returns {string|null} - SQL query string or null if table not allowed
 */
function getSafeResourceQuery(tableName) {
    if (!tableName || typeof tableName !== 'string') {
        return null;
    }
    return RESOURCE_QUERIES[tableName] || null;
}
const profileOwnership = (req, res, next) => {
  const userId = req.user?.id;
  const { profileId, username } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    let profile;

    if (profileId) {
      // Lookup by profile ID
      const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
      profile = stmt.get(profileId);
    } else if (username) {
      // Lookup by username
      const stmt = db.prepare('SELECT * FROM profiles WHERE username = ?');
      profile = stmt.get(username);
    } else {
      return res.status(400).json({ error: 'Profile identifier required (profileId or username)' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Access denied. You do not own this profile.',
        profileId: profile.id,
        username: profile.username
      });
    }

    // Attach profile to request for use in route handler
    req.profile = profile;
    next();

  } catch (error) {
    console.error('Error verifying profile ownership:', error);
    res.status(500).json({ error: 'Failed to verify profile ownership' });
  }
};

/**
 * Verify ownership of related resources (social links, themes, etc.)
 * Generic middleware that checks if a resource belongs to user's profile
 * @param {string} tableName - Name of the table to query (MUST be in RESOURCE_QUERIES)
 * @param {string} resourceIdParam - Name of the route parameter containing the resource ID
 */
const resourceOwnership = (tableName, resourceIdParam = 'id') => {
    return (req, res, next) => {
        const userId = req.user?.id;
        const resourceId = req.params[resourceIdParam];

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!resourceId) {
            return res.status(400).json({ error: `${resourceIdParam} is required` });
        }

        // Get safe pre-defined query for this table
        const safeQuery = getSafeResourceQuery(tableName);

        if (!safeQuery) {
            console.error(`Security Alert: Invalid table name attempted: "${tableName}" by user ${userId}`);
            return res.status(400).json({
                error: 'Invalid resource type',
                code: 'INVALID_RESOURCE_TYPE'
            });
        }

        try {
            // Get user's profile ID
            const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
            const profile = profileStmt.get(userId);

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Check resource ownership using safe pre-defined query
            const resourceStmt = db.prepare(safeQuery);
            const resource = resourceStmt.get(resourceId, profile.id);

            if (!resource) {
                return res.status(404).json({
                    error: `Resource not found or access denied`,
                    code: 'RESOURCE_NOT_FOUND'
                });
            }

            // Attach resource to request
            req.resource = resource;
            req.profile = profile;
            next();

        } catch (error) {
            console.error(`Error verifying ${tableName} ownership:`, error);
            res.status(500).json({ error: 'Failed to verify resource ownership' });
        }
    };
};

module.exports = { profileOwnership, resourceOwnership };
