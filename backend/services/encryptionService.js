/**
 * AES-256-GCM Encryption Service
 *
 * Provides secure field-level encryption for sensitive data at rest.
 * Uses AES-256-GCM which provides both confidentiality and authenticity.
 *
 * Key Features:
 * - AES-256-GCM authenticated encryption
 * - Unique IV (Initialization Vector) for each encryption
 * - Authentication tag to prevent tampering
 * - Secure key derivation from environment variable
 * - Deterministic encryption option for searchable fields
 */

const crypto = require('crypto');

// Constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits - recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

// Encrypted value prefix to identify encrypted fields
const ENCRYPTED_PREFIX = '$enc$';
const ENCRYPTED_VERSION = 'v1';

/**
 * Get or derive the encryption key from environment
 * Uses PBKDF2 to derive a strong key from the master secret
 */
let derivedKey = null;
let keySalt = null;

function initializeKey() {
  const masterKey = process.env.ENCRYPTION_KEY;

  if (!masterKey) {
    console.warn('WARNING: ENCRYPTION_KEY not set. Encryption service will not encrypt data.');
    return null;
  }

  if (masterKey.length < 32) {
    console.warn('WARNING: ENCRYPTION_KEY should be at least 32 characters for security.');
  }

  // Use a fixed salt derived from the key itself for deterministic key derivation
  // This ensures the same key is derived on every startup
  keySalt = crypto.createHash('sha256')
    .update(masterKey + '_salt_derivation')
    .digest()
    .slice(0, SALT_LENGTH);

  // Derive key using PBKDF2
  derivedKey = crypto.pbkdf2Sync(
    masterKey,
    keySalt,
    100000, // iterations
    KEY_LENGTH,
    'sha256'
  );

  console.log('Encryption service initialized successfully');
  return derivedKey;
}

// Initialize on module load
initializeKey();

/**
 * Encrypt a string value using AES-256-GCM
 * @param {string} plaintext - The text to encrypt
 * @returns {string} - Encrypted value with format: $enc$v1$iv$authTag$ciphertext (all base64)
 */
function encrypt(plaintext) {
  // If no key configured, return plaintext (for development without encryption)
  if (!derivedKey) {
    return plaintext;
  }

  // Don't encrypt null, undefined, or empty values
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return plaintext;
  }

  // Don't double-encrypt
  if (typeof plaintext === 'string' && plaintext.startsWith(ENCRYPTED_PREFIX)) {
    return plaintext;
  }

  // Convert to string if needed
  const text = String(plaintext);

  try {
    // Generate a unique IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine: prefix$version$iv$authTag$ciphertext
    return `${ENCRYPTED_PREFIX}${ENCRYPTED_VERSION}$${iv.toString('base64')}$${authTag.toString('base64')}$${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted value
 * @param {string} encryptedValue - The encrypted value to decrypt
 * @returns {string} - The decrypted plaintext
 */
function decrypt(encryptedValue) {
  // If no key configured, return as-is
  if (!derivedKey) {
    return encryptedValue;
  }

  // Don't decrypt null, undefined, or empty values
  if (encryptedValue === null || encryptedValue === undefined || encryptedValue === '') {
    return encryptedValue;
  }

  // Check if value is actually encrypted
  if (typeof encryptedValue !== 'string' || !encryptedValue.startsWith(ENCRYPTED_PREFIX)) {
    return encryptedValue;
  }

  try {
    // Parse the encrypted format: $enc$version$iv$authTag$ciphertext
    const parts = encryptedValue.split('$');

    if (parts.length !== 6) {
      console.warn('Invalid encrypted value format');
      return encryptedValue;
    }

    const [, , version, ivBase64, authTagBase64, ciphertext] = parts;

    if (version !== ENCRYPTED_VERSION) {
      console.warn(`Unknown encryption version: ${version}`);
      return encryptedValue;
    }

    // Decode components
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });

    // Set auth tag
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    // Return original value if decryption fails (might not be encrypted)
    return encryptedValue;
  }
}

/**
 * Check if a value is encrypted
 * @param {string} value - Value to check
 * @returns {boolean}
 */
function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Hash a value for searching (one-way, deterministic)
 * Use this for values that need to be searched but not reversed
 * @param {string} value - Value to hash
 * @returns {string} - HMAC-SHA256 hash
 */
function hashForSearch(value) {
  if (!derivedKey || !value) {
    return value;
  }

  return crypto.createHmac('sha256', derivedKey)
    .update(String(value).toLowerCase().trim())
    .digest('hex');
}

/**
 * Encrypt multiple fields in an object
 * @param {Object} obj - Object with fields to encrypt
 * @param {string[]} fields - Array of field names to encrypt
 * @returns {Object} - Object with encrypted fields
 */
function encryptFields(obj, fields) {
  if (!obj || !fields || !Array.isArray(fields)) {
    return obj;
  }

  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = encrypt(result[field]);
    }
  }

  return result;
}

/**
 * Decrypt multiple fields in an object
 * @param {Object} obj - Object with encrypted fields
 * @param {string[]} fields - Array of field names to decrypt
 * @returns {Object} - Object with decrypted fields
 */
function decryptFields(obj, fields) {
  if (!obj || !fields || !Array.isArray(fields)) {
    return obj;
  }

  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = decrypt(result[field]);
    }
  }

  return result;
}

/**
 * Check if encryption is enabled (key is configured)
 * @returns {boolean}
 */
function isEnabled() {
  return derivedKey !== null;
}

/**
 * Re-initialize the encryption key (useful for key rotation)
 */
function reinitialize() {
  derivedKey = null;
  keySalt = null;
  return initializeKey();
}

// Export functions
module.exports = {
  encrypt,
  decrypt,
  isEncrypted,
  hashForSearch,
  encryptFields,
  decryptFields,
  isEnabled,
  reinitialize,
  // Constants for external use
  ENCRYPTED_PREFIX
};
