/**
 * Security Logging Middleware
 * Logs security-relevant events for incident response and compliance
 * Implements GDPR-compliant IP hashing for privacy
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const SECURITY_LOG_FILE = path.join(logsDir, 'security.log');
const AUTH_LOG_FILE = path.join(logsDir, 'auth.log');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB per log file

/**
 * Hash IP address for privacy (GDPR compliance)
 * Uses a salted hash to prevent reverse engineering while maintaining
 * the ability to track multiple events from the same IP
 * @param {string} ip - IP address to hash
 * @returns {string} - Hashed IP (first 16 characters of SHA-256)
 */
function hashIP(ip) {
    if (!ip) return 'unknown';
    const salt = process.env.IP_HASH_SALT || 'default-salt-change-in-production';
    return crypto.createHash('sha256')
        .update(ip + salt)
        .digest('hex')
        .substring(0, 16);
}

/**
 * Rotate log file if it exceeds maximum size
 * @param {string} filePath - Path to log file
 */
function rotateLogIfNeeded(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > MAX_LOG_SIZE) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const archivePath = filePath.replace('.log', `-${timestamp}.log`);
                fs.renameSync(filePath, archivePath);
                console.log(`Log rotated: ${archivePath}`);
            }
        }
    } catch (error) {
        console.error('Failed to rotate log:', error);
    }
}

/**
 * Write security event to log file
 * @param {Object} event - Security event object
 */
function logSecurityEvent(event) {
    rotateLogIfNeeded(SECURITY_LOG_FILE);
    const logLine = JSON.stringify(event) + '\n';
    fs.appendFileSync(SECURITY_LOG_FILE, logLine, { flag: 'a' });
}

/**
 * Write auth event to auth-specific log file
 * @param {Object} event - Auth event object
 */
function logAuthEvent(event) {
    rotateLogIfNeeded(AUTH_LOG_FILE);
    const logLine = JSON.stringify(event) + '\n';
    fs.appendFileSync(AUTH_LOG_FILE, logLine, { flag: 'a' });
}

/**
 * Security event types for categorization
 */
const SECURITY_EVENT_TYPES = {
    AUTH_SUCCESS: 'auth_success',
    AUTH_FAILURE: 'auth_failure',
    AUTH_FAILURE_PASSWORD: 'auth_failure_password',
    AUTH_FAILURE_TOKEN: 'auth_failure_token',
    AUTH_FAILURE_CSRF: 'auth_failure_csrf',
    TOKEN_REFRESH: 'token_refresh',
    TOKEN_ISSUED: 'token_issued',
    PERMISSION_DENIED: 'permission_denied',
    RESOURCE_ACCESS: 'resource_access',
    RESOURCE_MODIFICATION: 'resource_modification',
    RESOURCE_DELETION: 'resource_deletion',
    DATA_EXPORT: 'data_export',
    ACCOUNT_DELETION: 'account_deletion',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
    XSS_ATTEMPT: 'xss_attempt',
    CSRF_ATTEMPT: 'csrf_attempt',
    INVALID_INPUT: 'invalid_input',
    SECURITY_MISCONFIGURATION: 'security_misconfiguration'
};

/**
 * Security logger middleware
 * Logs security-relevant events based on request/response characteristics
 */
const securityLogger = (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    // Extract relevant request information
    const requestInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        query: req.query,
        ip: hashIP(req.ip || req.connection.remoteAddress),
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
        origin: req.headers['origin'],
        userId: req.user?.id || null,
        username: req.user?.username || null,
        role: req.user?.role || null,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length']
    };

    // Override res.send to capture response
    res.send = function(data) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Determine if this is a security-relevant event
        const securityEvents = [
            // Authentication events
            statusCode === 401 && requestInfo.path.includes('/auth/'),
            statusCode === 403,

            // Not found (potential enumeration)
            statusCode === 404 && requestInfo.path.startsWith('/api/'),

            // Rate limiting
            statusCode === 429,

            // Server errors (potential attack indicators)
            statusCode === 500,

            // Deletion operations
            requestInfo.method === 'DELETE',

            // Admin operations
            requestInfo.path.includes('/admin') || requestInfo.path.includes('/admin'),

            // Auth endpoints
            requestInfo.path.includes('/auth/'),
        ];

        const shouldLog = securityEvents.some(Boolean);

        if (shouldLog) {
            let eventType = SECURITY_EVENT_TYPES.RESOURCE_ACCESS;

            // Categorize event type
            if (requestInfo.path.includes('/auth/login') && statusCode === 200) {
                eventType = SECURITY_EVENT_TYPES.AUTH_SUCCESS;
                logAuthEvent({ ...requestInfo, eventType, statusCode, responseTime });
            } else if (requestInfo.path.includes('/auth/login') && statusCode === 401) {
                eventType = SECURITY_EVENT_TYPES.AUTH_FAILURE_PASSWORD;
                logAuthEvent({ ...requestInfo, eventType, statusCode, responseTime });
            } else if (statusCode === 401) {
                eventType = SECURITY_EVENT_TYPES.AUTH_FAILURE_TOKEN;
                logAuthEvent({ ...requestInfo, eventType, statusCode, responseTime });
            } else if (statusCode === 403) {
                eventType = SECURITY_EVENT_TYPES.PERMISSION_DENIED;
            } else if (statusCode === 429) {
                eventType = SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED;
            } else if (requestInfo.method === 'DELETE') {
                eventType = SECURITY_EVENT_TYPES.RESOURCE_DELETION;
            } else if (requestInfo.method === 'PUT' || requestInfo.method === 'POST') {
                eventType = SECURITY_EVENT_TYPES.RESOURCE_MODIFICATION;
            }

            logSecurityEvent({ ...requestInfo, eventType, statusCode, responseTime });
        }

        // Call original send
        originalSend.call(this, data);
    };

    next();
};

/**
 * Log successful authentication
 * @param {Object} req - Express request object
 * @param {Object} user - User object
 */
const logAuthSuccess = (req, user) => {
    const event = {
        timestamp: new Date().toISOString(),
        eventType: SECURITY_EVENT_TYPES.AUTH_SUCCESS,
        method: req.method,
        path: req.path,
        ip: hashIP(req.ip),
        userAgent: req.headers['user-agent'],
        userId: user.id,
        username: user.username,
        role: user.role
    };
    logAuthEvent(event);
};

/**
 * Log failed authentication
 * @param {Object} req - Express request object
 * @param {string} reason - Failure reason
 * @param {string} errorCode - Error code
 */
const logAuthFailure = (req, reason, errorCode) => {
    const event = {
        timestamp: new Date().toISOString(),
        eventType: SECURITY_EVENT_TYPES.AUTH_FAILURE,
        method: req.method,
        path: req.path,
        ip: hashIP(req.ip),
        userAgent: req.headers['user-agent'],
        reason,
        errorCode,
        body: req.body ? { username: req.body.username } : null
    };
    logAuthEvent(event);
};

/**
 * Log suspicious activity
 * @param {Object} req - Express request object
 * @param {string} activity - Description of suspicious activity
 */
const logSuspiciousActivity = (req, activity) => {
    const event = {
        timestamp: new Date().toISOString(),
        eventType: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        method: req.method,
        path: req.path,
        ip: hashIP(req.ip),
        userAgent: req.headers['user-agent'],
        userId: req.user?.id || null,
        activity,
        query: req.query,
        body: req.body
    };
    logSecurityEvent(event);
};

/**
 * Log security violation
 * @param {Object} req - Express request object
 * @param {string} violation - Type of violation
 * @param {Object} details - Additional details
 */
const logSecurityViolation = (req, violation, details = {}) => {
    const event = {
        timestamp: new Date().toISOString(),
        eventType: violation,
        method: req.method,
        path: req.path,
        ip: hashIP(req.ip),
        userAgent: req.headers['user-agent'],
        userId: req.user?.id || null,
        violation,
        details
    };
    logSecurityEvent(event);
};

module.exports = {
    securityLogger,
    logAuthSuccess,
    logAuthFailure,
    logSuspiciousActivity,
    logSecurityViolation,
    SECURITY_EVENT_TYPES,
    hashIP
};
