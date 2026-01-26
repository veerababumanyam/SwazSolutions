/**
 * Standardized Error Response Utility
 * Provides consistent error response format across all API endpoints
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Error codes for different error types
 */
const ErrorCodes = {
    // Authentication errors (1xxx)
    UNAUTHORIZED: 'UNAUTHORIZED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_MISSING: 'TOKEN_MISSING',
    AUTH_FAILED: 'AUTH_FAILED',

    // Authorization errors (2xxx)
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
    SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',

    // Resource errors (3xxx)
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',

    // Validation errors (4xxx)
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

    // Server errors (5xxx)
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

    // Rate limiting (4xxx)
    RATE_LIMITED: 'RATE_LIMITED',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS'
};

/**
 * HTTP status codes for different error types
 */
const ErrorStatus = {
    [ErrorCodes.UNAUTHORIZED]: 401,
    [ErrorCodes.TOKEN_EXPIRED]: 401,
    [ErrorCodes.TOKEN_INVALID]: 401,
    [ErrorCodes.TOKEN_MISSING]: 401,
    [ErrorCodes.AUTH_FAILED]: 401,

    [ErrorCodes.FORBIDDEN]: 403,
    [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
    [ErrorCodes.SUBSCRIPTION_REQUIRED]: 403,
    [ErrorCodes.SUBSCRIPTION_EXPIRED]: 403,

    [ErrorCodes.NOT_FOUND]: 404,
    [ErrorCodes.ALREADY_EXISTS]: 409,
    [ErrorCodes.CONFLICT]: 409,

    [ErrorCodes.VALIDATION_ERROR]: 400,
    [ErrorCodes.INVALID_INPUT]: 400,
    [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,

    [ErrorCodes.INTERNAL_ERROR]: 500,
    [ErrorCodes.DATABASE_ERROR]: 500,
    [ErrorCodes.SERVICE_UNAVAILABLE]: 503,

    [ErrorCodes.RATE_LIMITED]: 429,
    [ErrorCodes.TOO_MANY_REQUESTS]: 429
};

/**
 * Create a standardized error response
 * @param {string} code - Error code from ErrorCodes
 * @param {string} message - Human-readable error message
 * @param {Object} details - Additional error details (only included in development)
 * @param {number} status - HTTP status code (auto-determined if not provided)
 */
function errorResponse(res, code, message, details = null, status = null) {
    const statusCode = status || ErrorStatus[code] || 500;

    const response = {
        success: false,
        error: {
            code,
            message
        }
    };

    // Include details in development or if explicitly provided
    if (details && (isDevelopment || details.includeInProduction)) {
        response.error.details = isDevelopment ? details : details.production;
    }

    // Log error for debugging
    if (statusCode >= 500) {
        console.error(`[${code}] ${message}`, details || '');
    }

    return res.status(statusCode).json(response);
}

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code (default: 200)
 */
function successResponse(res, data = null, message = 'Success', status = 200) {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(status).json(response);
}

/**
 * Async error handler wrapper
 * Catches errors in async route handlers and sends standardized error responses
 * @param {Function} handler - Async route handler
 */
function asyncHandler(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            // Log the full error in development
            if (isDevelopment) {
                console.error('Async handler error:', error);
            }

            // Determine error code and message
            let code = ErrorCodes.INTERNAL_ERROR;
            let message = 'An unexpected error occurred';

            if (error.name === 'ValidationError') {
                code = ErrorCodes.VALIDATION_ERROR;
                message = error.message;
            } else if (error.message && error.message.includes('UNIQUE constraint')) {
                code = ErrorCodes.ALREADY_EXISTS;
                message = 'Resource already exists';
            } else if (error.message) {
                message = isDevelopment ? error.message : 'An error occurred';
            }

            return errorResponse(res, code, message, isDevelopment ? { stack: error.stack } : null);
        }
    };
}

/**
 * Validate request body against required fields
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, missing: string[] }
 */
function validateRequired(body, requiredFields = []) {
    const missing = requiredFields.filter(field => !body[field]);

    if (missing.length > 0) {
        return {
            valid: false,
            missing,
            message: `Missing required fields: ${missing.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Middleware to validate required fields
 * @param {Array} requiredFields - Array of required field names
 */
function requireFields(...requiredFields) {
    return (req, res, next) => {
        const validation = validateRequired(req.body, requiredFields);

        if (!validation.valid) {
            return errorResponse(res, ErrorCodes.MISSING_REQUIRED_FIELD, validation.message);
        }

        next();
    };
}

module.exports = {
    ErrorCodes,
    ErrorStatus,
    errorResponse,
    successResponse,
    asyncHandler,
    validateRequired,
    requireFields
};
