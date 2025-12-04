// Public Access Middleware (T020)
// Allows routes to be accessed without authentication
// Useful for public profile viewing, vCard downloads, etc.

/**
 * Public access middleware - no authentication required
 * This is a no-op middleware that simply passes through to the next handler
 * Used to explicitly mark routes as public in the route definitions
 */
const publicAccess = (req, res, next) => {
  // No authentication check - allow all requests
  next();
};

/**
 * Optional authentication middleware
 * Attaches user info if JWT token is present, but doesn't reject if missing
 * Useful for routes that have different behavior for authenticated vs guest users
 */
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // No token provided - proceed as guest
    req.user = null;
    return next();
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info if valid
    next();
  } catch (error) {
    // Invalid token - proceed as guest
    req.user = null;
    next();
  }
};

module.exports = { publicAccess, optionalAuth };
