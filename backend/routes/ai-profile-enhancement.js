/**
 * AI Profile Enhancement Routes
 * Endpoints for enhancing profile headlines and bios using Gemini AI
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { resolveGeminiApiKey } = require('../middleware/geminiKeyResolver');
const { apiLimiter } = require('../middleware/rateLimit');

/**
 * Create profile enhancement routes
 * @param {Database} db - SQL.js database instance
 * @returns {Router} Express router
 */
function createProfileEnhancementRoutes(db) {
  const router = express.Router();

  // Middleware to initialize Gemini service
  const initializeGeminiService = [
    authenticateToken,
    resolveGeminiApiKey(db),
    (req, res, next) => {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(req.geminiApiKey);
        req.geminiService = genAI.getGenerativeModel({
          model: 'gemini-3.0-flash',
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 200
          }
        });
        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to initialize AI service',
          message: error.message
        });
      }
    }
  ];

  /**
   * POST /api/ai/enhance-headline
   * Enhance profile headline with AI
   */
  router.post('/enhance-headline', ...initializeGeminiService, apiLimiter, async (req, res) => {
    try {
      const { currentHeadline, profileType, tone } = req.body;

      if (!currentHeadline || currentHeadline.length < 5) {
        return res.status(400).json({
          error: 'Invalid headline',
          message: 'Headline must be at least 5 characters'
        });
      }

      const prompt = `Enhance this professional headline to be more impactful and SEO-friendly.

Current: "${currentHeadline}"
Profile Type: ${profileType || 'Professional'}
Tone: ${tone || 'Professional'}

Requirements:
- Length: 80-100 characters maximum
- Include relevant keywords
- Make it specific and compelling
- Tone: ${tone || 'Professional'}
- NO clichés or buzzwords
- Return ONLY the enhanced headline

Enhanced Headline:`;

      const result = await req.geminiService.generateContent(prompt);
      const enhancedHeadline = result.response.text().trim().replace(/^["']|["']$/g, '');

      res.json({
        success: true,
        data: {
          original: currentHeadline,
          enhanced: enhancedHeadline
        }
      });
    } catch (error) {
      console.error('Headline enhancement error:', error);
      res.status(500).json({
        error: 'Failed to enhance headline',
        message: error.message
      });
    }
  });

  /**
   * POST /api/ai/enhance-bio
   * Enhance profile bio with AI
   */
  router.post('/enhance-bio', ...initializeGeminiService, apiLimiter, async (req, res) => {
    try {
      const { currentBio, profileType, tone } = req.body;

      if (!currentBio || currentBio.length < 10) {
        return res.status(400).json({
          error: 'Invalid bio',
          message: 'Bio must be at least 10 characters'
        });
      }

      const prompt = `Enhance this professional bio to be more engaging and comprehensive.

Current Bio: "${currentBio}"
Profile Type: ${profileType || 'Professional'}
Tone: ${tone || 'Professional'}

Requirements:
- Length: 300-400 characters
- Well-structured and engaging
- Include key achievements/skills
- Tone: ${tone || 'Professional'}
- Make it personal yet professional
- Return ONLY the enhanced bio

Enhanced Bio:`;

      const result = await req.geminiService.generateContent(prompt);
      const enhancedBio = result.response.text().trim().replace(/^["']|["']$/g, '');

      res.json({
        success: true,
        data: {
          original: currentBio,
          enhanced: enhancedBio
        }
      });
    } catch (error) {
      console.error('Bio enhancement error:', error);
      res.status(500).json({
        error: 'Failed to enhance bio',
        message: error.message
      });
    }
  });

  return router;
}

module.exports = createProfileEnhancementRoutes;
