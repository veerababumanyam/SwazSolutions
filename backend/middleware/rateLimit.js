// Rate Limiting Middleware (T022)
// Specialized rate limiters for uploads, AI operations, and authentication

const rateLimit = require('express-rate-limit');

// Helper function to get client identifier (IP or user ID)
// Normalizes IPv6 localhost to IPv4 for consistency
const getClientKey = (req, includeUserId = false) => {
  if (includeUserId && req.user?.id) {
    return req.user.id.toString();
  }
  let ip = req.ip || req.connection?.remoteAddress || 'unknown';
  // Normalize IPv6 localhost to IPv4
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  return ip;
};

/**
 * Authentication rate limiter - Standard
 * For general auth operations (token refresh, logout, etc.)
 * Limits: 30 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  message: {
    error: 'Too many authentication requests',
    message: 'Please wait before making more authentication requests.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => getClientKey(req),
  handler: (req, res) => {
    console.log(`🚫 Auth rate limit exceeded for IP: ${getClientKey(req)}`);
    res.status(429).json({
      error: 'Too many authentication requests',
      message: 'Please wait before making more authentication requests.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * Strict authentication rate limiter
 * For sensitive operations: login, register, password reset
 * Very strict to prevent brute force attacks
 * Limits: 5 attempts per 15 minutes per IP
 */
const strictAuthLimiter = rateLimit({
  windowMs: parseInt(process.env.STRICT_AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.STRICT_AUTH_RATE_LIMIT_MAX) || 5,
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login/registration attempts. Please try again in 15 minutes.',
    code: 'STRICT_AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all attempts including successful ones for security
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => {
    // Use IP + username combo if available for more targeted limiting
    const username = req.body?.username || req.body?.email || '';
    const ip = getClientKey(req);
    return username ? `${ip}:${username.toLowerCase()}` : ip;
  },
  handler: (req, res) => {
    const username = req.body?.username || req.body?.email || 'unknown';
    console.log(`🚫 Strict auth rate limit exceeded for IP: ${getClientKey(req)}, username: ${username}`);
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many login/registration attempts. Please try again in 15 minutes.',
      code: 'STRICT_AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * General API rate limiter
 * For standard API endpoints
 * Limits: 100 requests per minute per IP
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests',
    message: 'Too many requests. Please slow down.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => getClientKey(req, true), // Use user ID if available
  handler: (req, res) => {
    console.log(`🚫 API rate limit exceeded for: ${getClientKey(req, true)}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests. Please slow down.',
      code: 'API_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

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
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => getClientKey(req, true),
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
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => getClientKey(req, true),
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
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => getClientKey(req, true),
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
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation
  keyGenerator: (req) => getClientKey(req, true),
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
  authLimiter,
  strictAuthLimiter,
  apiLimiter,
  uploadLimiter,
  aiGenerationLimiter,
  imageProcessingLimiter,
  qrCodeLimiter
};
