/**
 * Error Handler Middleware
 * Centralized error handling and async route wrapper
 */

/**
 * Async handler wrapper - eliminates try-catch in routes
 * Wraps async route handlers and forwards errors to error middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Application Error class
 * Extends Error to include status code and operational flag
 * Operational errors are expected errors (validation, not found, etc.)
 * Non-operational errors are unexpected (programming errors, system failures)
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether this is an expected error
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP Status Error classes
 * Convenient error classes for common HTTP status codes
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400, true);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, true);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422, true);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, true);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, false);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503, true);
  }
}

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error for monitoring
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.path}:`, {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      body: req.body
    });
  } else {
    // Production logging - only log essential info
    console.error(`[Error] ${req.method} ${req.path}:`, {
      message: err.message,
      statusCode: err.statusCode || 500,
      isOperational: err.isOperational || false
    });
  }

  // Handle operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Handle Sequelize/database errors
  if (err.name === 'SequelizeError' || err.name === 'DatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Database error occurred'
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error'
  });
}

/**
 * 404 handler
 * Catches requests to non-existent routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  });
}

/**
 * Async error boundary handler
 * Wraps route handlers to catch async errors
 * Use this for individual routes that need special error handling
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped middleware
 */
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

module.exports = {
  asyncHandler,
  catchAsync,
  AppError,
  errorHandler,
  notFoundHandler,
  // HTTP Error Classes
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError
};
