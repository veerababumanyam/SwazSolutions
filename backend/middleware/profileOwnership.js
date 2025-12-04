// Profile Ownership Middleware (T021)
// Verifies that the authenticated user owns the profile being accessed/modified

const db = require('../config/database');

/**
 * Verify profile ownership
 * Checks that req.user.id matches the user_id of the profile being accessed
 * Expects profile identifier in req.params.profileId or req.params.username
 * Attaches profile to req.profile if found and owned by user
 */
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

    try {
      // Get user's profile ID
      const profileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
      const profile = profileStmt.get(userId);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Check resource ownership
      const resourceStmt = db.prepare(
        `SELECT * FROM ${tableName} WHERE id = ? AND profile_id = ?`
      );
      const resource = resourceStmt.get(resourceId, profile.id);

      if (!resource) {
        return res.status(404).json({ 
          error: `Resource not found or access denied`,
          resourceId: parseInt(resourceId)
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
