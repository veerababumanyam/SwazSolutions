/**
 * Input Validation Utilities
 * Validates inputs across all agents to prevent errors and API failures
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate API Key
 */
export const validateApiKey = (apiKey: string): ValidationResult => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API Key is required' };
  }

  const trimmed = apiKey.trim();

  if (!trimmed.startsWith('AIza')) {
    return { valid: false, error: 'Invalid API Key format. Must start with "AIza"' };
  }

  if (trimmed.length < 35) {
    return { valid: false, error: 'API Key is too short' };
  }

  return { valid: true };
};

/**
 * Validate User Input for Lyrics Generation
 */
export const validateUserInput = (input: string): ValidationResult => {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'Please enter a song description' };
  }

  const trimmed = input.trim();

  if (trimmed.length < 5) {
    return { valid: false, error: 'Description is too short. Please provide more details.' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Description is too long. Maximum 5000 characters.' };
  }

  return { valid: true };
};

/**
 * Validate Lyrics Text Length
 */
export const validateLyricsLength = (lyrics: string): ValidationResult => {
  if (!lyrics || lyrics.trim().length === 0) {
    return { valid: false, error: 'Lyrics cannot be empty' };
  }

  const trimmed = lyrics.trim();

  if (trimmed.length > 50000) {
    return { valid: false, error: 'Lyrics are too long. Maximum 50,000 characters.' };
  }

  return { valid: true };
};

/**
 * Validate Language Selection
 */
export const validateLanguage = (language: string): ValidationResult => {
  if (!language || language.trim().length === 0) {
    return { valid: false, error: 'Language must be selected' };
  }

  return { valid: true };
};

/**
 * Validate Model Name
 */
export const validateModelName = (modelName: string): ValidationResult => {
  if (!modelName || modelName.trim().length === 0) {
    return { valid: false, error: 'Model name is required' };
  }

  const validModels = [
    'gemini-3.0-flash',
    'gemini-3.0-pro',
    'gemini-3-pro-preview',
    'imagen-3.0-generate-001',
    'imagen-4.0-generate-001'
  ];

  // Check if it's a known model or follows Gemini naming pattern
  if (!validModels.includes(modelName) && !modelName.startsWith('gemini-') && !modelName.startsWith('imagen-')) {
    return { valid: false, error: 'Unknown model name' };
  }

  return { valid: true };
};

/**
 * Validate Base64 Image Data
 */
export const validateBase64Image = (base64: string): ValidationResult => {
  if (!base64 || base64.trim().length === 0) {
    return { valid: false, error: 'Image data is empty' };
  }

  // Check size (max 10MB)
  const sizeInBytes = (base64.length * 3) / 4;
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (sizeInBytes > maxSize) {
    return { valid: false, error: 'Image is too large. Maximum 10MB.' };
  }

  return { valid: true };
};

/**
 * Validate HQ Tags
 */
export const validateHQTags = (tags: string[]): ValidationResult => {
  if (!Array.isArray(tags)) {
    return { valid: false, error: 'Tags must be an array' };
  }

  if (tags.length === 0) {
    return { valid: false, error: 'At least one tag is required' };
  }

  if (tags.length > 10) {
    return { valid: false, error: 'Maximum 10 tags allowed' };
  }

  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.trim().length === 0) {
      return { valid: false, error: 'All tags must be non-empty strings' };
    }
    if (tag.length > 50) {
      return { valid: false, error: 'Each tag must be less than 50 characters' };
    }
  }

  return { valid: true };
};

/**
 * Sanitize User Input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

/**
 * Validate File Name
 */
export const validateFileName = (fileName: string): ValidationResult => {
  if (!fileName || fileName.trim().length === 0) {
    return { valid: false, error: 'File name is required' };
  }

  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(fileName)) {
    return { valid: false, error: 'File name contains invalid characters' };
  }

  if (fileName.length > 255) {
    return { valid: false, error: 'File name is too long' };
  }

  return { valid: true };
};

/**
 * Validate JSON String
 */
export const validateJSON = (jsonString: string): ValidationResult => {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
};

/**
 * Validate Generation Settings
 */
export const validateGenerationSettings = (settings: any): ValidationResult => {
  if (!settings || typeof settings !== 'object') {
    return { valid: false, error: 'Settings must be an object' };
  }

  // Check required fields
  const requiredFields = ['theme', 'mood', 'style', 'complexity', 'rhymeScheme'];
  for (const field of requiredFields) {
    if (!settings[field] || settings[field].trim().length === 0) {
      return { valid: false, error: `${field} is required` };
    }
  }

  return { valid: true };
};

/**
 * Rate Limiting Validator
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.maxRequests - this.requests.length;
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.windowMs;
  }
}
