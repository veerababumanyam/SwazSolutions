// Rate Limiting Middleware (T022)
// Specialized rate limiters for uploads and AI operations

const rateLimit = require('express-rate-limit');

/**
 * File upload rate limiter
 * Restricts file uploads to prevent abuse and manage storage
 * Limits: 20 uploads per hour per user
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    error: 'Too many file uploads. Please try again later.',
    limit: 20,
    windowMs: 3600000,
    retryAfter: 'Check Retry-After header'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  keyGenerator: (req) => {
    // Rate limit per authenticated user
    return req.user?.id?.toString() || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many file uploads',
      message: 'You have exceeded the upload limit. Please try again later.',
      limit: 20,
      windowMinutes: 60,
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * AI generation rate limiter
 * Restricts AI API calls to manage costs and prevent abuse
 * Limits: 5 generations per hour per user (as per T198)
 */
const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 AI generations per hour
  message: {
    error: 'Too many AI generation requests. Please try again later.',
    limit: 5,
    windowMs: 3600000,
    retryAfter: 'Check Retry-After header'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Rate limit per authenticated user
    return req.user?.id?.toString() || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'AI generation limit exceeded',
      message: 'You have reached the maximum number of AI theme generations for this hour.',
      limit: 5,
      windowMinutes: 60,
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * Image processing rate limiter
 * For image optimization, cropping, and conversion operations
 * Limits: 30 operations per hour per user
 */
const imageProcessingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 image operations per hour
  message: {
    error: 'Too many image processing requests. Please try again later.',
    limit: 30,
    windowMs: 3600000
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Image processing limit exceeded',
      message: 'You have exceeded the image processing limit for this hour.',
      limit: 30,
      windowMinutes: 60,
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * QR code generation rate limiter
 * For QR code generation and regeneration
 * Limits: 10 generations per 10 minutes per user
 */
const qrCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 QR generations per 10 minutes
  message: {
    error: 'Too many QR code generation requests.',
    limit: 10,
    windowMs: 600000
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'QR code generation limit exceeded',
      message: 'Please wait before generating more QR codes.',
      limit: 10,
      windowMinutes: 10,
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

module.exports = {
  uploadLimiter,
  aiGenerationLimiter,
  imageProcessingLimiter,
  qrCodeLimiter
};
