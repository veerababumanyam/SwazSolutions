/**
 * Gemini API Key Resolver Middleware
 *
 * Resolves the API key from multiple sources with priority:
 * 1. User's encrypted database key (highest priority)
 * 2. System environment variable GEMINI_API_KEY
 * 3. Request header X-Gemini-API-Key (legacy support)
 *
 * Sets req.geminiApiKey and req.geminiKeySource on success
 * Returns 400 error if no key is available
 */

const { decrypt, isEncrypted } = require('../services/encryptionService');

/**
 * Creates the geminiKeyResolver middleware
 * @param {Database} db - The SQL.js database instance
 * @returns {Function} Express middleware function
 */
function resolveGeminiApiKey(db) {
  return async (req, res, next) => {
    let apiKey = null;
    let keySource = null;

    try {
      // Priority 1: User's encrypted database key
      if (req.user && req.user.id) {
        try {
          const user = db.prepare('SELECT gemini_api_key FROM users WHERE id = ?')
            .get(req.user.id);

          if (user && user.gemini_api_key) {
            // Check if value is encrypted
            if (isEncrypted(user.gemini_api_key)) {
              apiKey = decrypt(user.gemini_api_key);
              keySource = 'user_database';
            } else {
              // Handle case where key might be stored unencrypted (shouldn't happen but be safe)
              apiKey = user.gemini_api_key;
              keySource = 'user_database';
            }
          }
        } catch (error) {
          console.error('Error retrieving user API key from database:', error.message);
          // Continue to next priority source on error
        }
      }

      // Priority 2: System environment variable
      if (!apiKey && process.env.GEMINI_API_KEY) {
        apiKey = process.env.GEMINI_API_KEY;
        keySource = 'system_env';
      }

      // Priority 3: Request header (legacy support)
      if (!apiKey && req.headers['x-gemini-api-key']) {
        apiKey = req.headers['x-gemini-api-key'];
        keySource = 'request_header';
      }

      // No API key found
      if (!apiKey) {
        return res.status(400).json({
          error: 'Gemini API key required',
          message: 'To use AI features, you need to configure a Google Gemini API key.',
          details: 'Get your free API key from Google AI Studio',
          apiKeyLink: 'https://aistudio.google.com/app/apikey',
          setupLink: '/account/settings',
          setupText: 'Configure in Account Settings → AI & Integrations'
        });
      }

      // Attach resolved key to request
      req.geminiApiKey = apiKey;
      req.geminiKeySource = keySource;

      next();
    } catch (error) {
      console.error('Unexpected error in geminiKeyResolver:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to resolve API key'
      });
    }
  };
}

module.exports = {
  resolveGeminiApiKey
};
