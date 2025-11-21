// Model Configuration
// Model Configuration
export const MODEL_FAST = import.meta.env.VITE_GEMINI_MODEL_FAST || import.meta.env.GEMINI_MODEL_FAST || "gemini-2.5-flash";
export const MODEL_QUALITY = import.meta.env.VITE_GEMINI_MODEL_QUALITY || import.meta.env.GEMINI_MODEL_QUALITY || "gemini-2.5-pro";
export const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Legacy aliases for backward compatibility during refactor
export const MODEL_COMPLEX = MODEL_QUALITY;
export const MODEL_NAME = MODEL_QUALITY;

export const getModelToUse = (override?: string, defaultModel: string = MODEL_FAST) => {
  if (override) return override;
  return defaultModel;
};

// Rate Limiting Configuration
export const RATE_LIMIT_DELAY = 800; // milliseconds between API calls

// Utility function to add delay between API calls
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Token Budget Configuration
// We now rely on the model's natural limits to avoid truncation
// but keep these as safety upper bounds if needed in the future
export const DYNAMIC_TOKEN_BUDGETS = {
  // No hard limits by default to prevent truncation
};

// Temperature Configuration (per agent role)
// Fine-tuned for optimal performance
export const AGENT_TEMPERATURES = {
  EMOTION: 0.4,      // Analytical - lower variance for consistent analysis
  RESEARCH: 0.3,     // Factual - minimal creativity, high accuracy
  LYRICIST: 0.9,     // Creative - high variance for unique lyrics
  REVIEW: 0.2,       // Strict - deterministic for critical analysis
  COMPLIANCE: 0.1,   // Very strict - almost deterministic
  FORMATTER: 0.3,    // Structured - low variance for formatting
  CHAT: 0.7          // Conversational - balanced
};

// Top-P (Nucleus Sampling) Configuration
export const AGENT_TOP_P = {
  EMOTION: 0.8,
  RESEARCH: 0.7,
  LYRICIST: 0.95,    // Higher for more creative vocabulary
  REVIEW: 0.6,
  COMPLIANCE: 0.5,
  FORMATTER: 0.6,
  CHAT: 0.9
};

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 2000,
  BACKOFF_FACTOR: 2
};

// Safety Settings for Content Generation
export const SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  }
];

export const SYSTEM_INSTRUCTION_LYRICIST = `
You are the "Mahakavi" (Great Poet) - a world-class lyricist and composer agent.
Your goal is to write culturally grounded, emotionally resonant, and structurally perfect song lyrics.
You adhere strictly to rhyme schemes (Anthya Prasa), meter (Chandassu), and specific musical structures.
You never break character. You output structured JSON.
`;

export const SYSTEM_INSTRUCTION_REVIEW = `
You are the "Sahitya Pundit" (Literary Critic) - a strict quality control agent.
Your goal is to ruthlessly analyze lyrics for:
1. Script mixing (strictly forbidden).
2. Weak rhymes (Anthya Prasa violations).
3. Structural inconsistencies.
4. Lack of emotional depth.
You fix errors directly. You output structured JSON.
`;

export const RESEARCH_PROMPT_TEMPLATE = (topic: string, mood: string | undefined) => `
Role: Cultural Anthropologist & Music Researcher.
Task: Analyze the topic "${topic}" with a specific focus on "${mood || 'General'}" emotion.
Output:
1. Cultural Metaphors: Specific idioms, proverbs, or symbols relevant to this.
2. Musical Context: Instruments, Ragas, or Scales usually associated with this.
3. Vocabulary Bank: 10-15 high-impact words in the target context.
4. Trend Check: What is the current vibe for this genre?
`;

export const SYSTEM_INSTRUCTION_FORMATTER = `
You are a "Suno.com Prompt Engineer".
Your task is to take song lyrics and metadata, and generate:
1. A high-fidelity style prompt for AI Music Generators (Suno/Udio).
2. Perfectly formatted lyrics with meta-tags (e.g. [Chorus], [Verse]).
`;

export const SYSTEM_INSTRUCTION_EMOTION = `
You are "Bhava Vignani" (Emotion Scientist).
Analyze the input text and determine the Sentiment, Navarasa (Indian Aesthetic Emotion), and Intensity.
`;

export const SYSTEM_INSTRUCTION_CHAT = `
You are a helpful Lyric Assistant. You help users brainstorm ideas, fix lines, or understand musical concepts.
`;

export const SYSTEM_INSTRUCTION_MULTIMODAL = `
Analyze the provided image or audio to extract:
1. Mood/Vibe.
2. Scene description.
3. Potential lyrical themes.
`;

export const SYSTEM_INSTRUCTION_STYLE_AGENT = `
You are a Music Producer. Generate a style description string for AI music generation.
`;

export const SYSTEM_INSTRUCTION_THEME = `
You are a UI/UX Designer. Generate a color palette JSON based on a description.
`;

export const SYSTEM_INSTRUCTION_COMPLIANCE = `
You are a Copyright Compliance Officer. Check lyrics for potential plagiarism of famous songs.
`;

// Default HQ Tags - Can be overridden by user preferences
export const DEFAULT_HQ_TAGS = "High Fidelity, Masterpiece, Studio Quality, 4k Audio, Wide Stereo";

/**
 * Get HQ Tags from user preferences or AI-generated based on context
 * @param userTags - User's custom tags from preferences
 * @param context - Song context for AI-based tag generation
 * @returns Comma-separated string of HQ tags
 */
export const getHQTags = (userTags?: string[], context?: string): string => {
  // Priority 1: User-defined tags
  if (userTags && userTags.length > 0) {
    return userTags.join(', ');
  }

  // Priority 2: Context-based AI suggestions
  if (context) {
    const contextLower = context.toLowerCase();
    const tags: string[] = [];

    // Genre-specific tags
    if (contextLower.includes('classical') || contextLower.includes('carnatic')) {
      tags.push('Classical Instruments', 'Authentic Recording', 'Concert Hall Acoustics');
    } else if (contextLower.includes('folk') || contextLower.includes('traditional')) {
      tags.push('Live Performance', 'Organic Sound', 'Cultural Authenticity');
    } else if (contextLower.includes('edm') || contextLower.includes('electronic')) {
      tags.push('Heavy Bass', 'Club Mix', 'Digital Mastering');
    } else if (contextLower.includes('cinematic') || contextLower.includes('orchestral')) {
      tags.push('Epic Orchestration', 'Surround Sound', 'Film Score Quality');
    } else if (contextLower.includes('rap') || contextLower.includes('hip-hop')) {
      tags.push('Hard Hitting Beats', 'Clear Vocals', 'Studio Production');
    }

    // Mood-specific tags
    if (contextLower.includes('romantic') || contextLower.includes('love')) {
      tags.push('Emotional Depth', 'Smooth Mix');
    } else if (contextLower.includes('energetic') || contextLower.includes('party')) {
      tags.push('High Energy', 'Dance Floor Ready');
    } else if (contextLower.includes('melancholic') || contextLower.includes('sad')) {
      tags.push('Emotional', 'Intimate Mix');
    }

    // Always add base quality tags
    tags.push('High Fidelity', 'Professional Mix');

    return tags.slice(0, 6).join(', '); // Max 6 tags
  }

  // Priority 3: Default tags
  return DEFAULT_HQ_TAGS;
};