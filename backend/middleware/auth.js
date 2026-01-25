const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT_SECRET is optional - auth system is disabled for open access
// Keeping code structure for future use if authentication is needed
const JWT_SECRET = process.env.JWT_SECRET || 'placeholder-not-used';

// Refresh token secret (separate from access token for extra security)
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET + '_refresh';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';  // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 30; // 30 days default
const TOKEN_REFRESH_THRESHOLD = 24 * 60 * 60; // Refresh if less than 24 hours remaining

if (process.env.ENABLE_AUTH === 'true' && (!JWT_SECRET || JWT_SECRET.length < 32)) {
    console.error('❌ CRITICAL: JWT_SECRET not set or too weak. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

/**
 * Error codes for JWT authentication failures
 * These provide specific error types for frontend handling
 */
const AUTH_ERRORS = {
    TOKEN_MISSING: {
        code: 'TOKEN_MISSING',
        message: 'Access token required',
        status: 401
    },
    TOKEN_EXPIRED: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired. Please login again.',
        status: 401
    },
    TOKEN_INVALID: {
        code: 'TOKEN_INVALID',
        message: 'Invalid token. Please login again.',
        status: 401
    },
    TOKEN_MALFORMED: {
        code: 'TOKEN_MALFORMED',
        message: 'Token format is invalid.',
        status: 401
    },
    TOKEN_NOT_ACTIVE: {
        code: 'TOKEN_NOT_ACTIVE',
        message: 'Token is not yet active.',
        status: 401
    }
};

/**
 * Extract token from request (Authorization header or cookie)
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token or null
 */
function extractToken(req) {
    const authHeader = req.headers['authorization'];

    // Check Authorization header first (Bearer TOKEN)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // Fallback to cookie
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    return null;
}

/**
 * Map JWT error to appropriate auth error
 * @param {Error} err - JWT verification error
 * @returns {Object} - Auth error object with code, message, status
 */
function mapJwtError(err) {
    switch (err.name) {
        case 'TokenExpiredError':
            return AUTH_ERRORS.TOKEN_EXPIRED;
        case 'JsonWebTokenError':
            if (err.message === 'jwt malformed') {
                return AUTH_ERRORS.TOKEN_MALFORMED;
            }
            return AUTH_ERRORS.TOKEN_INVALID;
        case 'NotBeforeError':
            return AUTH_ERRORS.TOKEN_NOT_ACTIVE;
        default:
            return AUTH_ERRORS.TOKEN_INVALID;
    }
}

// Generate a secure random refresh token
function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

// Hash refresh token for secure storage
function hashRefreshToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Authenticate JWT token middleware
 * Validates the token and attaches decoded user to req.user
 *
 * Error responses include specific error codes:
 * - 401 TOKEN_MISSING: No token provided
 * - 401 TOKEN_EXPIRED: Token has expired (client should redirect to login)
 * - 401 TOKEN_INVALID: Token signature is invalid
 * - 401 TOKEN_MALFORMED: Token format is incorrect
 * - 401 TOKEN_NOT_ACTIVE: Token nbf (not before) claim is in the future
 */
function authenticateToken(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        const error = AUTH_ERRORS.TOKEN_MISSING;
        return res.status(error.status).json({
            error: error.message,
            code: error.code
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            const authError = mapJwtError(err);
            console.error(`JWT verification failed [${authError.code}]:`, err.message);
            return res.status(authError.status).json({
                error: authError.message,
                code: authError.code
            });
        }

        // Attach decoded user payload to request
        req.user = decoded;

        // Add token expiry info to request for potential refresh logic
        if (decoded.exp) {
            req.tokenExp = decoded.exp;
            req.tokenNearExpiry = (decoded.exp - Math.floor(Date.now() / 1000)) < TOKEN_REFRESH_THRESHOLD;
        }

        next();
    });
}

/**
 * Optional authentication middleware
 * Attaches user if valid token exists, but doesn't require authentication
 * Useful for routes that behave differently for authenticated vs anonymous users
 */
function optionalAuth(req, res, next) {
    const token = extractToken(req);

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;

                // Add token expiry info
                if (decoded.exp) {
                    req.tokenExp = decoded.exp;
                    req.tokenNearExpiry = (decoded.exp - Math.floor(Date.now() / 1000)) < TOKEN_REFRESH_THRESHOLD;
                }
            }
            // Silently ignore invalid tokens for optional auth
        });
    }
    next();
}

/**
 * Verify token without throwing - returns decoded payload or null
 * Useful for checking token validity without middleware
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null if invalid
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Generate a new JWT access token
 * @param {Object} payload - User data to encode (id, username, role)
 * @param {Object} options - Additional JWT options
 * @returns {string} - Signed JWT token
 */
function generateAccessToken(payload, options = {}) {
    const tokenPayload = {
        id: payload.id,
        username: payload.username,
        role: payload.role || 'user'
    };

    return jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: options.expiresIn || ACCESS_TOKEN_EXPIRY,
        ...options
    });
}

/**
 * Decode token without verification (for debugging/logging)
 * WARNING: Do not use for authentication - always use verifyToken
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (err) {
        return null;
    }
}

/**
 * Check if a token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired or invalid
 */
function isTokenExpired(token) {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }
    return decoded.exp < Math.floor(Date.now() / 1000);
}

/**
 * Get remaining time until token expiry
 * @param {string} token - JWT token
 * @returns {number} - Seconds until expiry, or 0 if expired/invalid
 */
function getTokenTimeRemaining(token) {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return 0;
    }
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
}

module.exports = {
    authenticateToken,
    optionalAuth,
    verifyToken,
    generateAccessToken,
    decodeToken,
    isTokenExpired,
    getTokenTimeRemaining,
    extractToken,
    generateRefreshToken,
    hashRefreshToken,
    mapJwtError,
    JWT_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY_DAYS,
    TOKEN_REFRESH_THRESHOLD,
    AUTH_ERRORS
};
