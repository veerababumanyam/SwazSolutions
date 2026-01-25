/**
 * Lyrics Generation Routes
 *
 * API endpoints for AI-powered lyric generation using Google Gemini.
 * Handles lyric generation, emotion analysis, research, and review.
 */

const express = require('express');
const { getGeminiService } = require('../services/geminiService');

/**
 * Create lyrics routes
 * @param {Object} db - Database instance (for future use - saving lyrics, history, etc.)
 * @returns {express.Router}
 */
function createLyricsRoutes(db) {
  const router = express.Router();

  /**
   * Middleware to check if Gemini API is configured
   */
  const requireGeminiConfig = (req, res, next) => {
    const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'Gemini API key is required',
        message: 'Please provide a Gemini API key via X-Gemini-API-Key header or configure GEMINI_API_KEY environment variable.'
      });
    }

    // Attach the service to the request
    try {
      req.geminiService = getGeminiService(apiKey);
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to initialize Gemini service',
        message: error.message
      });
    }
  };

  /**
   * POST /api/lyrics/generate
   * Generate song lyrics using AI
   *
   * Body:
   * - userRequest: string (required) - The user's song description/request
   * - languageProfile: { primary: string, secondary?: string, tertiary?: string } (required)
   * - generationSettings: { theme, mood, style, complexity, rhymeScheme, singerConfig, ... } (optional)
   * - emotionData: { navarasa, intensity, ... } (optional)
   * - researchData: string (optional)
   * - model: string (optional) - Model override
   */
  router.post('/generate', requireGeminiConfig, async (req, res) => {
    try {
      const {
        userRequest,
        languageProfile,
        generationSettings,
        emotionData,
        researchData,
        model
      } = req.body;

      // Validate required fields
      if (!userRequest || typeof userRequest !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'userRequest (string) is required'
        });
      }

      if (!languageProfile || !languageProfile.primary) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'languageProfile with primary language is required'
        });
      }

      // Validate userRequest length
      if (userRequest.length < 5) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'userRequest must be at least 5 characters long'
        });
      }

      if (userRequest.length > 5000) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'userRequest must not exceed 5000 characters'
        });
      }

      console.log(`[Lyrics API] Generating lyrics for: "${userRequest.substring(0, 50)}..."`);

      const lyrics = await req.geminiService.generateLyrics({
        userRequest,
        languageProfile: {
          primary: languageProfile.primary,
          secondary: languageProfile.secondary || languageProfile.primary,
          tertiary: languageProfile.tertiary || languageProfile.primary
        },
        generationSettings: generationSettings || {},
        emotionData: emotionData || null,
        researchData: researchData || '',
        model
      });

      console.log(`[Lyrics API] Successfully generated lyrics: "${lyrics.title}"`);

      res.json({
        success: true,
        data: lyrics
      });
    } catch (error) {
      console.error('[Lyrics API] Error generating lyrics:', error);
      res.status(500).json({
        error: 'Failed to generate lyrics',
        message: error.message
      });
    }
  });

  /**
   * POST /api/lyrics/analyze-emotion
   * Analyze emotion in text for better lyric generation
   *
   * Body:
   * - text: string (required) - Text to analyze
   * - model: string (optional) - Model override
   */
  router.post('/analyze-emotion', requireGeminiConfig, async (req, res) => {
    try {
      const { text, model } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'text (string) is required'
        });
      }

      if (text.length < 3) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'text must be at least 3 characters long'
        });
      }

      console.log(`[Lyrics API] Analyzing emotion for: "${text.substring(0, 50)}..."`);

      const emotionData = await req.geminiService.analyzeEmotion(text, model);

      res.json({
        success: true,
        data: emotionData
      });
    } catch (error) {
      console.error('[Lyrics API] Error analyzing emotion:', error);
      res.status(500).json({
        error: 'Failed to analyze emotion',
        message: error.message
      });
    }
  });

  /**
   * POST /api/lyrics/research
   * Get cultural research data for a topic
   *
   * Body:
   * - topic: string (required) - Topic to research
   * - mood: string (optional) - Mood/emotion focus
   * - model: string (optional) - Model override
   */
  router.post('/research', requireGeminiConfig, async (req, res) => {
    try {
      const { topic, mood, model } = req.body;

      if (!topic || typeof topic !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'topic (string) is required'
        });
      }

      console.log(`[Lyrics API] Researching topic: "${topic}"`);

      const researchData = await req.geminiService.getResearchData(topic, mood, model);

      res.json({
        success: true,
        data: researchData
      });
    } catch (error) {
      console.error('[Lyrics API] Error getting research data:', error);
      res.status(500).json({
        error: 'Failed to get research data',
        message: error.message
      });
    }
  });

  /**
   * POST /api/lyrics/review
   * Review and refine generated lyrics
   *
   * Body:
   * - lyrics: object (required) - Lyrics object to review
   * - languageProfile: object (required) - Language configuration
   * - rhymeScheme: string (optional) - Expected rhyme scheme
   * - model: string (optional) - Model override
   */
  router.post('/review', requireGeminiConfig, async (req, res) => {
    try {
      const { lyrics, languageProfile, rhymeScheme, model } = req.body;

      if (!lyrics || typeof lyrics !== 'object') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'lyrics (object) is required'
        });
      }

      if (!languageProfile || !languageProfile.primary) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'languageProfile with primary language is required'
        });
      }

      console.log(`[Lyrics API] Reviewing lyrics: "${lyrics.title || 'Untitled'}"`);

      const reviewResult = await req.geminiService.reviewLyrics(
        lyrics,
        languageProfile,
        rhymeScheme || 'AABB',
        model
      );

      res.json({
        success: true,
        data: reviewResult
      });
    } catch (error) {
      console.error('[Lyrics API] Error reviewing lyrics:', error);
      res.status(500).json({
        error: 'Failed to review lyrics',
        message: error.message
      });
    }
  });

  /**
   * POST /api/lyrics/chat
   * Chat with the music director AI
   *
   * Body:
   * - message: string (required) - User's message
   * - history: array (optional) - Chat history [{role: 'user'|'model', content: string}]
   * - model: string (optional) - Model override
   */
  router.post('/chat', requireGeminiConfig, async (req, res) => {
    try {
      const { message, history, model } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'message (string) is required'
        });
      }

      console.log(`[Lyrics API] Chat message: "${message.substring(0, 50)}..."`);

      const response = await req.geminiService.chat(message, history || [], model);

      res.json({
        success: true,
        data: {
          role: 'model',
          content: response
        }
      });
    } catch (error) {
      console.error('[Lyrics API] Error in chat:', error);
      res.status(500).json({
        error: 'Failed to process chat message',
        message: error.message
      });
    }
  });

  /**
   * GET /api/lyrics/test
   * Test Gemini API connection
   */
  router.get('/test', requireGeminiConfig, async (req, res) => {
    try {
      console.log('[Lyrics API] Testing Gemini API connection...');

      const result = await req.geminiService.testConnection();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Connection test failed',
          message: result.message
        });
      }
    } catch (error) {
      console.error('[Lyrics API] Error testing connection:', error);
      res.status(500).json({
        error: 'Failed to test connection',
        message: error.message
      });
    }
  });

  /**
   * GET /api/lyrics/config
   * Get current Gemini configuration (model names, etc.)
   */
  router.get('/config', (req, res) => {
    res.json({
      success: true,
      data: {
        modelFast: process.env.GEMINI_MODEL_FAST || 'gemini-2.5-flash',
        modelQuality: process.env.GEMINI_MODEL_QUALITY || 'gemini-2.5-pro',
        hasServerKey: !!process.env.GEMINI_API_KEY,
        requiresClientKey: !process.env.GEMINI_API_KEY
      }
    });
  });

  return router;
}

module.exports = createLyricsRoutes;
