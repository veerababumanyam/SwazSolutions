/**
 * Imagen AI Service for Album Cover Generation
 *
 * This service handles all interactions with Google's Imagen 4.0 API for
 * generating album artwork based on lyric themes and user style preferences.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Imagen Model Configuration
const IMAGEN_MODEL = 'imagen-3.0-generate-002';

// Style Presets for Album Covers
const STYLE_PRESETS = {
  // Genre-based styles
  cinematic: 'Cinematic movie poster style, dramatic lighting, epic composition, professional photography',
  folk: 'Hand-drawn illustration style, watercolor textures, nature themes, earthy tones, organic feel',
  electronic: 'Neon cyberpunk aesthetic, geometric patterns, glitch art effects, vibrant gradients',
  classical: 'Elegant orchestral theme, gold accents, vintage oil painting style, ornate details',
  hiphop: 'Street art graffiti style, urban landscape, bold typography space, gritty textures',
  bollywood: 'Vibrant colorful Bollywood poster style, dramatic expressions, rich cultural motifs',
  devotional: 'Spiritual serene atmosphere, divine lighting, traditional religious art style, peaceful',
  rock: 'Edgy rock concert poster, high contrast, bold graphics, rebellious energy',
  jazz: 'Smoky jazz club atmosphere, art deco elements, sophisticated retro style',
  lofi: 'Cozy lo-fi aesthetic, anime-inspired, warm nostalgic colors, relaxing vibes',

  // Art styles
  minimalist: 'Clean minimalist design, simple geometric shapes, limited color palette, modern',
  abstract: 'Abstract expressionism, fluid organic forms, vibrant color splashes, artistic',
  vintage: 'Retro 80s aesthetic, nostalgic vibes, analog film texture, synthwave colors',
  watercolor: 'Soft watercolor painting style, flowing colors, artistic brush strokes',
  digital: 'Modern digital art, clean vectors, professional graphic design, contemporary',
  photography: 'Professional photography style, high quality, artistic composition, realistic',
  illustration: 'Hand-drawn illustration, detailed line work, artistic character',
  surreal: 'Surrealist dreamscape, impossible geometry, ethereal atmosphere, imaginative'
};

// Mood to visual mapping
const MOOD_VISUALS = {
  romantic: 'warm sunset colors, soft lighting, intimate atmosphere',
  melancholic: 'muted tones, rain, solitary figure, emotional depth',
  energetic: 'vibrant colors, dynamic movement, explosive energy',
  peaceful: 'calm serene landscape, soft pastels, tranquil atmosphere',
  dark: 'shadows, dramatic contrast, mysterious atmosphere',
  joyful: 'bright sunny colors, celebration, happy vibes',
  nostalgic: 'faded vintage colors, memories, timeless feeling',
  epic: 'grand scale, dramatic sky, monumental presence'
};

// Retry Configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 2000,
  BACKOFF_FACTOR: 2
};

/**
 * ImagenService class - handles all Imagen API interactions
 */
class ImagenService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for Imagen');
    }

    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(fn, retries = RETRY_CONFIG.MAX_RETRIES, delay = RETRY_CONFIG.INITIAL_DELAY) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Check for rate limiting
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          console.warn(`Rate limited. Attempt ${attempt + 1}/${retries + 1}. Waiting ${delay}ms...`);
        } else if (error.message?.includes('503') || error.message?.includes('unavailable')) {
          console.warn(`Service unavailable. Attempt ${attempt + 1}/${retries + 1}. Waiting ${delay}ms...`);
        } else {
          // For other errors, don't retry
          throw this.wrapError(error);
        }

        if (attempt < retries) {
          await this.delay(delay);
          delay *= RETRY_CONFIG.BACKOFF_FACTOR;
        }
      }
    }

    throw this.wrapError(lastError);
  }

  /**
   * Wrap errors with user-friendly messages
   */
  wrapError(error) {
    const message = error.message || String(error);

    if (message.includes('429') || message.includes('quota')) {
      return new Error('Imagen API quota exceeded. Please try again later or check your API key limits.');
    }
    if (message.includes('503') || message.includes('unavailable')) {
      return new Error('Imagen AI service is temporarily unavailable. Please try again in a few moments.');
    }
    if (message.includes('401') || message.includes('invalid') && message.toLowerCase().includes('api key')) {
      return new Error('Invalid Gemini API key. Please check your configuration.');
    }
    if (message.includes('SAFETY') || message.includes('blocked')) {
      return new Error('Image generation was blocked due to safety filters. Please modify your prompt.');
    }
    if (message.includes('not supported') || message.includes('not available')) {
      return new Error('Image generation is not available with your current API key. Please ensure you have access to Imagen models.');
    }

    return new Error(`Imagen API error: ${message}`);
  }

  /**
   * Build an optimized album cover prompt from lyrics and style settings
   *
   * @param {Object} params - Generation parameters
   * @param {Object} params.lyrics - Generated lyrics object with title, sections, etc.
   * @param {string} params.style - Style preset (e.g., 'cinematic', 'minimalist')
   * @param {string} params.genre - Music genre
   * @param {string} params.mood - Mood/emotion
   * @param {string} params.customPrompt - Additional custom instructions
   * @returns {string} Optimized image generation prompt
   */
  buildAlbumCoverPrompt({ lyrics, style, genre, mood, customPrompt }) {
    const parts = [];

    // Base album cover instruction
    parts.push('Professional album cover artwork design');

    // Add style preset if available
    if (style && STYLE_PRESETS[style.toLowerCase()]) {
      parts.push(STYLE_PRESETS[style.toLowerCase()]);
    } else if (style) {
      parts.push(`${style} artistic style`);
    }

    // Add mood visuals
    if (mood && MOOD_VISUALS[mood.toLowerCase()]) {
      parts.push(MOOD_VISUALS[mood.toLowerCase()]);
    } else if (mood) {
      parts.push(`${mood} mood and atmosphere`);
    }

    // Add genre context
    if (genre) {
      parts.push(`${genre} music aesthetic`);
    }

    // Extract themes from lyrics if available
    if (lyrics) {
      if (lyrics.title) {
        parts.push(`Theme: "${lyrics.title}"`);
      }

      // Get key themes from first few lines
      if (lyrics.sections && lyrics.sections.length > 0) {
        const firstLines = lyrics.sections
          .slice(0, 2)
          .flatMap(s => s.lines || [])
          .slice(0, 3)
          .join(' ');

        if (firstLines.length > 0) {
          // Truncate for prompt efficiency
          const themeExcerpt = firstLines.substring(0, 100);
          parts.push(`Inspired by: ${themeExcerpt}`);
        }
      }
    }

    // Add custom prompt if provided
    if (customPrompt && customPrompt.trim()) {
      parts.push(customPrompt.trim());
    }

    // Add quality and format requirements
    parts.push('High resolution, square format, professional quality, suitable for music streaming platforms, no text or typography');

    return parts.join('. ');
  }

  /**
   * Generate album cover image using Imagen API
   *
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - Direct image prompt (optional if lyrics provided)
   * @param {Object} params.lyrics - Generated lyrics object (optional if prompt provided)
   * @param {string} params.style - Style preset
   * @param {string} params.genre - Music genre
   * @param {string} params.mood - Mood/emotion
   * @param {string} params.customPrompt - Additional custom instructions
   * @param {string} params.aspectRatio - Aspect ratio (default: '1:1')
   * @param {number} params.numberOfImages - Number of images to generate (1-4)
   * @returns {Promise<Object>} Generated image data
   */
  async generateAlbumCover({
    prompt,
    lyrics,
    style = 'cinematic',
    genre = '',
    mood = '',
    customPrompt = '',
    aspectRatio = '1:1',
    numberOfImages = 1
  }) {
    // Build prompt from lyrics if not directly provided
    let finalPrompt = prompt;
    if (!finalPrompt) {
      finalPrompt = this.buildAlbumCoverPrompt({ lyrics, style, genre, mood, customPrompt });
    }

    if (!finalPrompt || finalPrompt.length < 10) {
      throw new Error('A prompt or lyrics are required for image generation');
    }

    // Validate parameters
    const validAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    if (!validAspectRatios.includes(aspectRatio)) {
      throw new Error(`Invalid aspect ratio. Must be one of: ${validAspectRatios.join(', ')}`);
    }

    if (numberOfImages < 1 || numberOfImages > 4) {
      throw new Error('numberOfImages must be between 1 and 4');
    }

    console.log(`[Imagen] Generating ${numberOfImages} image(s) with prompt: "${finalPrompt.substring(0, 100)}..."`);

    try {
      const result = await this.retryWithBackoff(async () => {
        // Use the Gemini model for image generation
        const model = this.genAI.getGenerativeModel({
          model: IMAGEN_MODEL,
          generationConfig: {
            responseModalities: ['Text', 'Image']
          }
        });

        const response = await model.generateContent(finalPrompt);

        // Extract images from the response
        const images = [];

        if (response.response && response.response.candidates) {
          for (const candidate of response.response.candidates) {
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                  images.push({
                    data: part.inlineData.data,
                    mimeType: part.inlineData.mimeType
                  });
                }
              }
            }
          }
        }

        if (images.length === 0) {
          throw new Error('No images generated. The model may not support image generation with your current API key.');
        }

        return images;
      });

      return {
        images: result,
        prompt: finalPrompt,
        style,
        aspectRatio
      };
    } catch (error) {
      throw this.wrapError(error);
    }
  }

  /**
   * Save generated image to file
   *
   * @param {string} base64Data - Base64 encoded image data
   * @param {string} mimeType - Image MIME type
   * @param {string} coversDir - Directory to save covers
   * @returns {Object} Saved file info { filename, url }
   */
  saveImageToFile(base64Data, mimeType, coversDir) {
    // Ensure covers directory exists
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }

    // Generate unique filename
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const filename = `cover-${timestamp}-${uniqueId}.${ext}`;
    const filepath = path.join(coversDir, filename);

    // Write file
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);

    console.log(`[Imagen] Saved cover to: ${filepath}`);

    return {
      filename,
      filepath,
      url: `/covers/${filename}`
    };
  }

  /**
   * Test Imagen API connection
   */
  async testConnection() {
    try {
      const model = this.genAI.getGenerativeModel({ model: IMAGEN_MODEL });

      // Just check if we can access the model
      const result = await model.generateContent('Test prompt for album cover');

      return {
        success: true,
        message: 'Imagen API connection successful',
        model: IMAGEN_MODEL
      };
    } catch (error) {
      return {
        success: false,
        message: this.wrapError(error).message
      };
    }
  }
}

/**
 * Create a singleton instance of ImagenService
 */
let imagenServiceInstance = null;

function getImagenService(apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is required for image generation.');
  }

  if (!imagenServiceInstance || imagenServiceInstance.apiKey !== key) {
    imagenServiceInstance = new ImagenService(key);
  }

  return imagenServiceInstance;
}

module.exports = {
  ImagenService,
  getImagenService,
  STYLE_PRESETS,
  MOOD_VISUALS,
  IMAGEN_MODEL
};
