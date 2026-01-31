/**
 * Album Cover Generation Routes
 *
 * API endpoints for AI-powered album cover generation using Google Imagen.
 * Handles cover generation, regeneration with variations, and style presets.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { getImagenService, STYLE_PRESETS, MOOD_VISUALS } = require('../services/imagenService');
const { aiGenerationLimiter } = require('../middleware/rateLimit');
const { optionalAuth } = require('../middleware/auth');
const { resolveGeminiApiKey } = require('../middleware/geminiKeyResolver');

// Covers directory
const COVERS_DIR = path.join(__dirname, '../../data/covers');

/**
 * Create album cover routes
 * @param {Object} db - Database instance (for future use - saving cover history)
 * @returns {express.Router}
 */
function createAlbumCoverRoutes(db) {
  const router = express.Router();

  /**
   * Middleware to resolve Gemini API key and initialize Imagen service
   */
  const initializeImagenService = [
    optionalAuth,  // Make user optional for backwards compatibility
    resolveGeminiApiKey(db),
    (req, res, next) => {
      // Initialize service from resolved API key
      try {
        req.imagenService = getImagenService(req.geminiApiKey);
        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to initialize Imagen service',
          message: error.message
        });
      }
    }
  ];

  /**
   * GET /api/album-covers/styles
   * Get available style presets and moods
   */
  router.get('/styles', (req, res) => {
    res.json({
      success: true,
      data: {
        styles: Object.keys(STYLE_PRESETS).map(key => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          description: STYLE_PRESETS[key]
        })),
        moods: Object.keys(MOOD_VISUALS).map(key => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          description: MOOD_VISUALS[key]
        }))
      }
    });
  });

  /**
   * POST /api/album-covers/generate
   * Generate album cover artwork using Imagen
   *
   * Body:
   * - prompt: string (optional) - Direct image prompt
   * - lyrics: object (optional) - Generated lyrics to extract themes from
   * - style: string (optional) - Style preset (e.g., 'cinematic', 'minimalist')
   * - genre: string (optional) - Music genre
   * - mood: string (optional) - Mood/emotion
   * - customPrompt: string (optional) - Additional custom instructions
   * - aspectRatio: string (optional) - Default "1:1"
   * - numberOfImages: number (optional) - Default 1 (max 4)
   */
  router.post('/generate', initializeImagenService, aiGenerationLimiter, async (req, res) => {
    try {
      const {
        prompt,
        lyrics,
        style,
        genre,
        mood,
        customPrompt,
        aspectRatio,
        numberOfImages
      } = req.body;

      // Validate that we have either a prompt or lyrics
      if (!prompt && !lyrics) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Either prompt or lyrics must be provided'
        });
      }

      // Validate prompt length if provided
      if (prompt && (prompt.length < 5 || prompt.length > 2000)) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'prompt must be between 5 and 2000 characters'
        });
      }

      console.log(`[Album Covers API] Generating cover with style: ${style || 'default'}`);

      // Generate the cover
      const result = await req.imagenService.generateAlbumCover({
        prompt,
        lyrics,
        style: style || 'cinematic',
        genre: genre || '',
        mood: mood || '',
        customPrompt: customPrompt || '',
        aspectRatio: aspectRatio || '1:1',
        numberOfImages: Math.min(numberOfImages || 1, 4)
      });

      // Ensure covers directory exists
      if (!fs.existsSync(COVERS_DIR)) {
        fs.mkdirSync(COVERS_DIR, { recursive: true });
      }

      // Save generated images to disk
      const savedImages = result.images.map((img, idx) => {
        return req.imagenService.saveImageToFile(
          img.data,
          img.mimeType,
          COVERS_DIR
        );
      });

      console.log(`[Album Covers API] Generated ${savedImages.length} cover(s)`);

      res.json({
        success: true,
        data: {
          covers: savedImages.map(img => ({
            url: img.url,
            filename: img.filename
          })),
          prompt: result.prompt,
          style: result.style,
          aspectRatio: result.aspectRatio
        }
      });
    } catch (error) {
      console.error('[Album Covers API] Generation error:', error);
      res.status(500).json({
        error: 'Failed to generate album cover',
        message: error.message
      });
    }
  });

  /**
   * POST /api/album-covers/regenerate
   * Regenerate album cover with same settings but new variation
   *
   * Body:
   * - prompt: string (required) - Original prompt to use
   * - style: string (optional) - Style preset
   * - aspectRatio: string (optional) - Default "1:1"
   */
  router.post('/regenerate', initializeImagenService, aiGenerationLimiter, async (req, res) => {
    try {
      const { prompt, style, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'prompt is required for regeneration'
        });
      }

      console.log(`[Album Covers API] Regenerating cover...`);

      // Generate new variation
      const result = await req.imagenService.generateAlbumCover({
        prompt,
        style: style || 'cinematic',
        aspectRatio: aspectRatio || '1:1',
        numberOfImages: 1
      });

      // Validate that images were generated
      if (!result.images || result.images.length === 0) {
        return res.status(500).json({
          error: 'No images generated',
          message: 'The API returned no images. Please try again.'
        });
      }

      // Ensure covers directory exists
      if (!fs.existsSync(COVERS_DIR)) {
        fs.mkdirSync(COVERS_DIR, { recursive: true });
      }

      // Save the new image
      const savedImage = req.imagenService.saveImageToFile(
        result.images[0].data,
        result.images[0].mimeType,
        COVERS_DIR
      );

      console.log(`[Album Covers API] Regenerated cover: ${savedImage.filename}`);

      res.json({
        success: true,
        data: {
          cover: {
            url: savedImage.url,
            filename: savedImage.filename
          },
          prompt: result.prompt,
          style: result.style,
          aspectRatio: result.aspectRatio
        }
      });
    } catch (error) {
      console.error('[Album Covers API] Regeneration error:', error);
      res.status(500).json({
        error: 'Failed to regenerate album cover',
        message: error.message
      });
    }
  });

  /**
   * GET /api/album-covers/test
   * Test Imagen API connection
   */
  router.get('/test', initializeImagenService, async (req, res) => {
    try {
      console.log('[Album Covers API] Testing Imagen API connection...');

      const result = await req.imagenService.testConnection();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          model: result.model
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Connection test failed',
          message: result.message
        });
      }
    } catch (error) {
      console.error('[Album Covers API] Test error:', error);
      res.status(500).json({
        error: 'Failed to test connection',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/album-covers/:filename
   * Delete a generated cover
   */
  router.delete('/:filename', (req, res) => {
    try {
      const { filename } = req.params;

      // Validate filename to prevent path traversal
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          error: 'Invalid filename',
          message: 'Filename contains invalid characters'
        });
      }

      const filepath = path.join(COVERS_DIR, filename);

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The specified cover does not exist'
        });
      }

      // Delete the file
      fs.unlinkSync(filepath);

      console.log(`[Album Covers API] Deleted cover: ${filename}`);

      res.json({
        success: true,
        message: 'Cover deleted successfully'
      });
    } catch (error) {
      console.error('[Album Covers API] Delete error:', error);
      res.status(500).json({
        error: 'Failed to delete cover',
        message: error.message
      });
    }
  });

  /**
   * GET /api/album-covers/config
   * Get current Imagen configuration
   */
  router.get('/config', (req, res) => {
    res.json({
      success: true,
      data: {
        hasServerKey: !!process.env.GEMINI_API_KEY,
        requiresClientKey: !process.env.GEMINI_API_KEY,
        availableStyles: Object.keys(STYLE_PRESETS),
        availableMoods: Object.keys(MOOD_VISUALS),
        maxImages: 4,
        defaultAspectRatio: '1:1',
        supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4']
      }
    });
  });

  return router;
}

module.exports = createAlbumCoverRoutes;
