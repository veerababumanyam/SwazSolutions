// AI Bio Generation Route
// POST /api/profiles/me/bio/generate
// Uses Google Gemini Flash for generating personalized bios based on personality vibes
// Rate limited to 5 requests per user per day

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { resolveGeminiApiKey } = require('../middleware/geminiKeyResolver');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getClientKey } = require('../middleware/rateLimit');

// Rate limiter: 5 requests per user per day
// Uses user ID as key for per-user limiting
const aiBioLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 generations per day per user
  message: {
    error: 'AI bio generation limit exceeded',
    message: 'You have reached the maximum of 5 bio generations per day. Please try again tomorrow.',
    limit: 5,
    windowHours: 24
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => {
    // Use user ID for per-user limiting, fall back to normalized IP
    return getClientKey(req, true);
  },
  handler: (req, res) => {
    console.warn(`🚫 AI bio generation limit exceeded for user: ${req.user?.id}`);
    res.status(429).json({
      error: 'AI bio generation limit exceeded',
      message: 'You have reached the maximum of 5 bio generations per day. Please try again tomorrow.',
      limit: 5,
      windowHours: 24,
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Personality vibes with system prompts
const PERSONALITY_VIBES = {
  professional: {
    name: 'Professional',
    prompt: 'You are a professional bio writer for business cards and corporate profiles. Write concise, polished, achievement-focused bios that highlight expertise and credibility. Use formal tone with industry-relevant language.'
  },
  minimalist: {
    name: 'Minimalist',
    prompt: 'You are a minimalist bio writer. Create extremely concise, elegant bios that distill the essence of a person in the fewest words possible. Every word must count. Use simple, powerful language.'
  },
  witty: {
    name: 'Witty',
    prompt: 'You are a witty bio writer with a playful sense of humor. Create clever, engaging bios that make people smile while still being professional. Use wordplay, unexpected turns, and light humor.'
  },
  mystical: {
    name: 'Mystical',
    prompt: 'You are a mystical bio writer who sees the poetic and philosophical in everyday life. Write bios that hint at depth, purpose, and cosmic connection. Use evocative, slightly mysterious language.'
  },
  energetic: {
    name: 'Energetic',
    prompt: 'You are an energetic bio writer full of enthusiasm and passion. Create dynamic, high-energy bios that convey excitement and drive. Use action words, exclamation points sparingly, and vibrant language.'
  }
};

// Middleware chain to initialize Gemini service
const initializeGeminiService = [
  authenticateToken,
  (req, res, next) => {
    const db = require('../config/database');
    resolveGeminiApiKey(db)(req, res, next);
  },
  (req, res, next) => {
    try {
      const { GoogleGenerativeAI: GAI } = require('@google/generative-ai');
      const genAI = new GAI(req.geminiApiKey);
      req.geminiService = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 300,
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
 * POST /api/profiles/me/bio/generate
 * Generate 3 distinct bios based on personality vibe
 *
 * Request body:
 * - vibe: 'professional' | 'minimalist' | 'witty' | 'mystical' | 'energetic'
 * - name: string (optional, falls back to profile name)
 * - profession: string (optional, falls back to profile profession/headline)
 * - interests: string (optional, additional context)
 *
 * Response:
 * - bios: string[] (3 bios, 120-150 characters each)
 * - vibe: string (selected vibe)
 */
router.post('/me/bio/generate', ...initializeGeminiService, aiBioLimiter, async (req, res) => {
  try {
    const db = require('../config/database');
    const { vibe, name, profession, interests } = req.body;

    // Validate vibe
    if (!vibe || !PERSONALITY_VIBES[vibe]) {
      return res.status(400).json({
        error: 'Invalid vibe',
        message: `Vibe must be one of: ${Object.keys(PERSONALITY_VIBES).join(', ')}`
      });
    }

    // Get user's profile for context
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Extract context from profile or request
    const personName = name || profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const personProfession = profession || profile.profession || profile.headline || '';
    const personInterests = interests || '';

    // Build context string
    const contextParts = [];
    if (personName) {contextParts.push(`Name: ${personName}`);}
    if (personProfession) {contextParts.push(`Profession: ${personProfession}`);}
    if (personInterests) {contextParts.push(`Interests: ${personInterests}`);}

    const contextString = contextParts.join('\n');

    if (!contextString) {
      return res.status(400).json({
        error: 'Insufficient context',
        message: 'Please provide at least a name or profession to generate a bio.'
      });
    }

    // Build prompt
    const vibeConfig = PERSONALITY_VIBES[vibe];
    const userPrompt = `${contextString}

Generate exactly 3 distinct bio variations for a digital profile card.

Requirements:
- Each bio must be between 120-150 characters (strict limit)
- Capture the essence of the person in ${vibeConfig.name.toLowerCase()} style
- Make each bio unique and distinct from the others
- Each bio should be complete and standalone
- Return ONLY the 3 bios, separated by triple pipes (|||)
- Format: Bio 1|||Bio 2|||Bio 3
- No numbering, no extra text, no explanations

Example format:
Turning coffee into code since 2015. Full-stack wizard who loves clean architecture.|||Senior dev crafting digital experiences. Coffee addict. Architecture enthusiast.|||Code craftsman with a passion for elegant solutions. Fueled by espresso and curiosity.`;

    // Generate bios
    console.warn(`🤖 Generating ${vibe} bios for user ${req.user.id}`);

    const result = await req.geminiService.generateContent([
      { role: 'user', parts: [{ text: vibeConfig.prompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will generate concise, character-limited bios in the specified style.' }] },
      { role: 'user', parts: [{ text: userPrompt }] }
    ]);

    const responseText = result.response.text();

    // Parse response - split by |||
    let bios = responseText.split('|||').map(bio => bio.trim()).filter(bio => bio.length > 0);

    // Validate bios
    if (bios.length === 0) {
      throw new Error('AI did not generate any bios');
    }

    // Ensure exactly 3 bios (pad or trim)
    if (bios.length < 3) {
      console.warn(`⚠️  Only ${bios.length} bios generated, expected 3`);
      // If we got fewer, try to generate more with a retry
      // For now, just use what we got
    } else if (bios.length > 3) {
      bios = bios.slice(0, 3); // Take first 3
    }

    // Enforce character limits (120-150)
    bios = bios.map(bio => {
      if (bio.length > 150) {
        // Truncate at last complete word before 150
        const truncated = bio.substring(0, 150);
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
      }
      return bio;
    });

    // Filter out bios that are too short
    bios = bios.filter(bio => bio.length >= 50);

    if (bios.length === 0) {
      throw new Error('Generated bios did not meet length requirements');
    }

    console.warn(`✅ Generated ${bios.length} ${vibe} bios for user ${req.user.id}`);

    res.json({
      bios,
      vibe,
      count: bios.length
    });

  } catch (error) {
    console.error('AI bio generation error:', error);

    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        error: 'API configuration error',
        message: 'Unable to connect to AI service. Please try again later.'
      });
    }

    if (error.message?.includes('quota')) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Bio generation failed',
      message: 'Failed to generate bios. Please try again.'
    });
  }
});

module.exports = router;
