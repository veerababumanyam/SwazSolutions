/**
 * Middleware Barrel Export
 * Centralized imports to avoid path resolution issues
 */

// Authentication
const { authenticateToken, requireAdmin } = require('./auth');

// Rate limiting
const {
  authLimiter,
  strictAuthLimiter,
  apiLimiter,
  uploadLimiter,
  aiGenerationLimiter,
  imageProcessingLimiter,
  qrCodeLimiter
} = require('./rateLimit');

// Security
const { securityLogger } = require('./securityLogger');

// Access control
const { allowPublicAccess } = require('./publicAccess');

// Ownership validation
const { verifyProfileOwnership } = require('./profileOwnership');

// Subscription checks
const { checkSubscriptionTier } = require('./subscription');

// Error handling
const {
  asyncHandler,
  catchAsync,
  AppError,
  errorHandler,
  notFoundHandler,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError
} = require('./errorHandler');

module.exports = {
  // Authentication
  authenticateToken,
  requireAdmin,

  // Rate limiting
  authLimiter,
  strictAuthLimiter,
  apiLimiter,
  uploadLimiter,
  aiGenerationLimiter,
  imageProcessingLimiter,
  qrCodeLimiter,

  // Security
  securityLogger,

  // Access control
  allowPublicAccess,

  // Ownership
  verifyProfileOwnership,

  // Subscription
  checkSubscriptionTier,

  // Error handling
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
