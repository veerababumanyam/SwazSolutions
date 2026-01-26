const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const logger = require('../utils/logger');

// Import Gemini SDK
let GoogleGenAI;
try {
    ({ GoogleGenAI } = require('@google/genai'));
} catch (error) {
    console.warn('⚠️  @google/genai not installed. AI features will be disabled.');
}

const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Proxy endpoint for Gemini AI API calls
 * Protects API key by keeping it server-side only
 */
function createGeminiProxyRoutes() {
    // Health check endpoint
    router.get('/health', (req, res) => {
        const isConfigured = !!API_KEY && !!GoogleGenAI;
        res.json({
            configured: isConfigured,
            available: isConfigured,
            message: isConfigured
                ? 'Gemini API is configured and ready'
                : 'Gemini API is not configured or SDK not installed'
        });
    });

    /**
     * POST /api/gemini-proxy/generate
     * Proxy for generateContent API calls
     * Body: { model, contents, generationConfig, safetySettings, systemInstruction }
     */
    router.post('/generate', authenticateToken, apiLimiter, async (req, res) => {
        if (!API_KEY) {
            logger.error('Gemini API key not configured');
            return res.status(503).json({
                error: 'AI service not configured',
                code: 'API_KEY_MISSING'
            });
        }

        if (!GoogleGenAI) {
            logger.error('Gemini SDK not available');
            return res.status(503).json({
                error: 'AI service not available',
                code: 'SDK_NOT_INSTALLED'
            });
        }

        try {
            const {
                model,
                contents,
                generationConfig,
                safetySettings,
                systemInstruction
            } = req.body;

            // Validate required fields
            if (!model || !contents) {
                return res.status(400).json({
                    error: 'Missing required fields: model and contents',
                    code: 'INVALID_REQUEST'
                });
            }

            // Validate model name (prevent injection)
            const allowedModels = [
                'gemini-3.0-flash',
                'gemini-3.0-pro',
                'gemini-2.0-flash',
                'gemini-2.0-pro',
                'gemini-1.5-flash',
                'gemini-1.5-pro'
            ];

            if (!allowedModels.includes(model)) {
                return res.status(400).json({
                    error: `Invalid model. Allowed: ${allowedModels.join(', ')}`,
                    code: 'INVALID_MODEL'
                });
            }

            // Initialize Gemini AI
            const ai = new GoogleGenAI({ apiKey: API_KEY });

            // Build request parameters
            const requestParams = {
                model,
                contents,
                generationConfig: generationConfig || {},
                safetySettings: safetySettings || []
            };

            if (systemInstruction) {
                requestParams.systemInstruction = systemInstruction;
            }

            // Log request (without sensitive data)
            logger.info('Gemini API request', {
                userId: req.user.id,
                model,
                contentCount: contents.length
            });

            // Make API call
            const result = await ai.models.generateContent(requestParams);

            // Extract response
            const response = result.response;
            const text = response.text();

            // Log successful response
            logger.info('Gemini API response received', {
                userId: req.user.id,
                model,
                responseLength: text.length
            });

            // Return response in same format as frontend expects
            res.json({
                success: true,
                response: {
                    text: () => text,
                    candidates: response.candidates,
                    usageMetadata: response.usageMetadata
                },
                // For compatibility with frontend parsing
                _rawText: text
            });

        } catch (error) {
            logger.error('Gemini API error', {
                userId: req.user.id,
                error: error.message,
                code: error.code
            });

            // Handle specific error types
            if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
                return res.status(429).json({
                    error: 'API rate limit exceeded. Please try again later.',
                    code: 'RATE_LIMIT_EXCEEDED'
                });
            }

            if (error.message?.includes('safety')) {
                return res.status(400).json({
                    error: 'Content blocked by safety filters',
                    code: 'SAFETY_FILTER_BLOCKED'
                });
            }

            // Generic error
            res.status(500).json({
                error: 'AI generation failed',
                code: 'GENERATION_FAILED',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
}

module.exports = { createGeminiProxyRoutes };
