/**
 * Logger Utility
 * Structured logging with file output and log levels
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Format log entry with timestamp and metadata
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {string} Formatted log entry
 */
function formatLogEntry(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
}

/**
 * Write content to log file
 * @param {string} filePath - Path to log file
 * @param {string} content - Content to write
 */
function writeToFile(filePath, content) {
  try {
    fs.appendFileSync(filePath, content);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Logger object with methods for each log level
 */
const logger = {
  /**
   * Log error message
   * @param {string} message - Error message
   * @param {object} meta - Additional metadata
   */
  error(message, meta = {}) {
    const entry = formatLogEntry(LOG_LEVELS.ERROR, message, meta);
    console.error(entry.trim());
    writeToFile(ERROR_LOG_FILE, entry);
    writeToFile(LOG_FILE, entry);
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    const entry = formatLogEntry(LOG_LEVELS.WARN, message, meta);
    console.warn(entry.trim());
    writeToFile(LOG_FILE, entry);
  },

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {object} meta - Additional metadata
   */
  info(message, meta = {}) {
    const entry = formatLogEntry(LOG_LEVELS.INFO, message, meta);
    console.log(entry.trim());
    writeToFile(LOG_FILE, entry);
  },

  /**
   * Log debug message (only in development)
   * @param {string} message - Debug message
   * @param {object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const entry = formatLogEntry(LOG_LEVELS.DEBUG, message, meta);
      console.log(entry.trim());
      writeToFile(LOG_FILE, entry);
    }
  },

  /**
   * Log HTTP request
   * @param {object} req - Express request object
   * @param {number} statusCode - Response status code
   * @param {number} responseTime - Response time in ms
   */
  http(req, statusCode, responseTime) {
    const message = `${req.method} ${req.path} ${statusCode}`;
    const meta = {
      method: req.method,
      path: req.path,
      statusCode,
      responseTime,
      ip: req.ip
    };

    if (statusCode >= 500) {
      this.error(message, meta);
    } else if (statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  },

  /**
   * Log database query
   * @param {string} query - SQL query
   * @param {number} duration - Query duration in ms
   */
  database(query, duration) {
    const meta = { query: query.substring(0, 100), duration };
    if (duration > 1000) {
      this.warn('Slow database query', meta);
    } else {
      this.debug('Database query', meta);
    }
  },

  /**
   * Log payment event
   * @param {string} provider - Payment provider
   * @param {string} orderId - Order ID
   * @param {string} status - Payment status
   * @param {object} meta - Additional metadata
   */
  payment(provider, orderId, status, meta = {}) {
    const message = `Payment ${status}: ${provider} - ${orderId}`;
    const paymentMeta = {
      provider,
      orderId,
      status,
      ...meta
    };

    if (status === 'failed' || status === 'error') {
      this.error(message, paymentMeta);
    } else if (status === 'pending') {
      this.warn(message, paymentMeta);
    } else {
      this.info(message, paymentMeta);
    }
  },

  /**
   * Log authentication event
   * @param {string} event - Auth event type (login, logout, register, etc.)
   * @param {number} userId - User ID
   * @param {object} meta - Additional metadata
   */
  auth(event, userId, meta = {}) {
    const message = `Auth ${event}: User ${userId}`;
    this.info(message, { event, userId, ...meta });
  },

  /**
   * Log security event
   * @param {string} event - Security event type
   * @param {object} meta - Additional metadata
   */
  security(event, meta = {}) {
    const message = `Security event: ${event}`;
    this.warn(message, { event, ...meta });
  }
};

module.exports = logger;
