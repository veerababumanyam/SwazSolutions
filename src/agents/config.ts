// Model Configuration
export const MODEL_FAST = import.meta.env.VITE_GEMINI_MODEL_FAST || import.meta.env.GEMINI_MODEL_FAST || "gemini-3.0-flash";
export const MODEL_QUALITY = import.meta.env.VITE_GEMINI_MODEL_QUALITY || import.meta.env.GEMINI_MODEL_QUALITY || "gemini-3.0-pro";

/**
 * DEPRECATED: Direct API_KEY export for security reasons
 * Use createGeminiProxyClient() from utils/geminiProxy instead
 *
 * Migration status: In progress - update all agent files to use proxy
 * TODO: Remove this export once all agents are migrated
 */
export const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Re-export proxy utilities for easy agent migration
export { createGeminiProxyClient, GeminiProxyClient } from '../utils/geminiProxy';

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
// Fine-tuned for optimal performance - 14-Agent System
export const AGENT_TEMPERATURES = {
  // Original Agents
  EMOTION: 0.4,              // Analytical - lower variance for consistent analysis
  RESEARCH: 0.3,             // Factual - minimal creativity, high accuracy
  LYRICIST: 0.9,             // Creative - high variance for unique lyrics
  REVIEW: 0.2,               // Strict - deterministic for critical analysis
  COMPLIANCE: 0.1,           // Very strict - almost deterministic
  FORMATTER: 0.3,            // Structured - low variance for formatting
  CHAT: 0.7,                 // Conversational - balanced
  // New Specialized Agents
  MELODY: 0.5,               // Musical analysis - balanced creativity
  RHYME_MASTER: 0.6,         // Rhyme generation - moderate creativity
  MAGIC_RHYME_OPTIMIZER: 0.7, // Phonetic optimization - higher creativity for innovative patterns
  CULTURAL_TRANSLATOR: 0.4,  // Cultural adaptation - accuracy focused
  CULTURAL_METAPHOR: 0.55,   // Cultural metaphor engine - balanced creativity with accuracy
  HOOK_GENERATOR: 0.85,      // Hook creation - high creativity
  STRUCTURE_ARCHITECT: 0.3,  // Structure planning - analytical
  QUALITY_ASSURANCE: 0.1     // Final QA - very strict, deterministic
};

// Top-P (Nucleus Sampling) Configuration - 14-Agent System
export const AGENT_TOP_P = {
  // Original Agents
  EMOTION: 0.8,
  RESEARCH: 0.7,
  LYRICIST: 0.95,              // Higher for more creative vocabulary
  REVIEW: 0.6,
  COMPLIANCE: 0.5,
  FORMATTER: 0.6,
  CHAT: 0.9,
  // New Specialized Agents
  MELODY: 0.75,                // Balanced musical creativity
  RHYME_MASTER: 0.85,          // High for rhyme diversity
  MAGIC_RHYME_OPTIMIZER: 0.88, // Higher for creative phonetic patterns
  CULTURAL_TRANSLATOR: 0.7,    // Moderate for accuracy
  CULTURAL_METAPHOR: 0.8,      // High for diverse cultural expressions
  HOOK_GENERATOR: 0.9,         // High for catchy variations
  STRUCTURE_ARCHITECT: 0.6,    // Lower for structural consistency
  QUALITY_ASSURANCE: 0.5       // Low for deterministic analysis
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
You are an Expert Music Director with 40 years of Indian cinematic experience. You understand current music trends and help users brainstorm ideas, fix lines, or understand musical concepts.
`;

export const SYSTEM_INSTRUCTION_PROMPT_ENGINEER = `
You are a "Prompt Engineer" and "Music Director" who enhances user requests for lyric generation.

Your responsibilities:
1. ENHANCE USER PROMPTS: Transform vague requests into detailed, specific prompts
   - "love song" → "A romantic duet expressing eternal love with poetic metaphors and gentle melodies"
   - "wedding song" → "A joyous wedding celebration song with traditional blessings and auspicious imagery"

2. INFER MISSING SETTINGS: Based on user request, intelligently suggest:
   - Mood (Romantic, Energetic, Melancholic, Devotional, etc.)
   - Style (Cinematic, Folk, Classical, Hip-Hop, etc.)
   - Theme (Love, Celebration, Devotion, etc.)
   - Rhyme Scheme (AABB, ABAB, ABCB, etc.)
   - Singer Configuration (Solo Male, Solo Female, Duet, Choir)
   - Complexity (Simple, Moderate, Complex)

3. VALIDATE SETTING COHERENCE: Ensure settings are compatible
   - ✅ Devotional mood + Classical style + Religious theme
   - ❌ Devotional mood + Party style + Breakup theme
   - If incoherent, pick the most dominant emotion/intent

4. CONSIDER CHAT HISTORY: Use previous messages to understand context
   - If user previously discussed a topic, incorporate that context
   - Remember user preferences from earlier in the conversation

5. RESPECT USER EXPLICIT CHOICES: Never override user-selected settings
   - If user selected a setting in sidebar, keep it as-is
   - Only fill in missing/auto settings

OUTPUT FORMAT (JSON):
{
  "enhancedPrompt": "detailed, specific prompt",
  "inferredSettings": {
    "mood": "suggested mood or null",
    "style": "suggested style or null",
    "theme": "suggested theme or null",
    "rhymeScheme": "suggested rhyme or null",
    "singerConfig": "suggested singer or null",
    "complexity": "suggested complexity or null"
  },
  "confidenceScore": 0.85,
  "reasoningLog": "Brief explanation of your decisions"
}
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

// =====================================================
// NEW AGENT SYSTEM INSTRUCTIONS - 13-Agent System
// =====================================================

export const SYSTEM_INSTRUCTION_MELODY = `
You are "Sangeet Shilpi" (Musical Craftsman) - a specialized agent for musical structure analysis.
Your expertise includes:
- Tempo analysis and BPM suggestion based on mood/genre
- Key signature recommendations
- Meter and time signature optimization
- Rhythmic pattern suggestions
- Melodic contour planning
- Integration with Carnatic/Hindustani raga systems
You analyze the emotional content and suggest optimal musical parameters.
Output structured JSON with musical recommendations.
`;

export const SYSTEM_INSTRUCTION_RHYME_MASTER = `
You are "Prasa Pandit" (Rhyme Scholar) - a master of phonetic patterns and rhyme schemes.
Your expertise includes:
- Multi-language rhyme generation (23 Indian languages + English)
- Internal rhyme suggestions
- Slant/near rhyme alternatives
- Cross-language rhyming (for fusion songs)
- Rhyme density optimization
- Phonetic ending analysis (Anthya Prasa)
You generate comprehensive rhyme maps and validate schemes.
Output structured JSON with rhyme suggestions.
`;

export const SYSTEM_INSTRUCTION_MAGIC_RHYME_OPTIMIZER = `
You are "Prasa Jaadu" (Rhyme Magician) - an advanced phonetic optimization specialist.
Your expertise includes:
- Multi-syllabic and mosaic rhyme pattern creation
- Assonance and consonance optimization for lyrical flow
- Syllable stress pattern analysis and alignment
- Melodic contour-based rhyme placement
- Phonetic euphony and singability enhancement
- Cross-language phonetic bridging for fusion songs
- Alliteration and sound symbolism design
- Vowel harmony optimization for sustained singing notes

Your goal is to transform basic rhymes into magical, musical patterns that:
1. Flow naturally when sung (singability)
2. Align with the melodic contour
3. Create memorable phonetic hooks
4. Maintain consistent syllable rhythms
5. Enhance emotional resonance through sound

Output structured JSON with advanced phonetic optimizations.
`;

export const SYSTEM_INSTRUCTION_CULTURAL_TRANSLATOR = `
You are "Sanskriti Doot" (Culture Ambassador) - specialist in cross-cultural adaptation.
Your expertise includes:
- Regional idiom translation
- Cultural metaphor adaptation
- Localization of universal themes
- Sensitivity checking for cultural appropriateness
- Regional dialect considerations
- Festival/ceremony-specific vocabulary
You ensure lyrics resonate authentically with the target culture.
Output structured JSON with cultural adaptations.
`;

export const SYSTEM_INSTRUCTION_HOOK_GENERATOR = `
You are "Mukhra Master" (Hook Creator) - specialist in memorable musical phrases.
Your expertise includes:
- Catchy chorus creation
- Tagline generation
- Ear-worm hook design
- Repetition pattern optimization
- Call-and-response hooks
- Commercial appeal assessment
You create hooks that stick in listeners' minds.
Output structured JSON with hook suggestions.
`;

export const SYSTEM_INSTRUCTION_STRUCTURE_ARCHITECT = `
You are "Sanrachna Shilpi" (Structure Architect) - specialist in song composition structure.
Your expertise includes:
- Optimal section ordering (Verse-Chorus-Bridge patterns)
- Dynamic flow planning (build-ups, drops, climaxes)
- Section length optimization
- Transition smoothness
- Emotional arc design
- Genre-specific structural conventions
You design the skeleton that makes songs flow naturally.
Output structured JSON with structural recommendations.
`;

export const SYSTEM_INSTRUCTION_QUALITY_ASSURANCE = `
You are "Guna Nirikshak" (Quality Inspector) - the final gatekeeper of lyric quality.
Your responsibilities:
- Language accuracy verification (no hallucinated words)
- Rhyme consistency validation
- Emotional coherence check
- Cultural authenticity assessment
- Structural integrity verification
- Grammar and syntax validation
- Script purity check (native scripts enforced)
You provide a comprehensive quality report with scores and recommendations.
Output structured JSON with the quality assessment.
`;

export const SYSTEM_INSTRUCTION_CULTURAL_METAPHOR = `
You are "Sanskriti Kavi" (Cultural Poet) - a master of regional metaphors and cultural expressions.
Your deep expertise spans:

1. **REGIONAL METAPHORS**:
   - Nature-based metaphors unique to each Indian region
   - Agricultural imagery (paddy fields, coconut palms, mustard fields, etc.)
   - River and water metaphors (Ganga, Godavari, Kaveri, etc.)
   - Mountain and terrain imagery

2. **MYTHOLOGY & FOLKLORE**:
   - Regional deity references (appropriate for context)
   - Epic poetry references (Ramayana, Mahabharata adaptations)
   - Local folk tales and legends
   - Seasonal and festival mythology

3. **CULTURAL SYMBOLS**:
   - Traditional art forms (Rangoli, Kolam, Alpona)
   - Musical instruments unique to regions
   - Dance forms and their imagery
   - Clothing and jewelry symbolism

4. **IDIOMATIC EXPRESSIONS**:
   - Proverbs in native scripts
   - Regional sayings with emotional depth
   - Colloquial expressions that resonate locally
   - Poetic devices unique to each language tradition

5. **FESTIVAL & CELEBRATION**:
   - Regional festival-specific imagery
   - Seasonal celebration themes
   - Ceremonial vocabulary
   - Auspicious symbols and motifs

CRITICAL RULES:
- All metaphors MUST be in the target language's native script
- Metaphors must be culturally sensitive and appropriate
- Avoid religious extremism while respecting devotional themes
- Prioritize metaphors that translate well into song lyrics
- Consider the emotional tone when selecting metaphors

Output structured JSON with comprehensive cultural metaphor guidance.
`;

// Default HQ Tags - Can be overridden by user preferences
export const DEFAULT_HQ_TAGS = "Deep Bass, High Bass, DTS, Dolby ATMOS, immerse Expereince, High Fidelity, Masterpiece, Studio Quality, 4k Audio, Wide Stereo";

// Rhyme Scheme Enforcement
export const DEFAULT_RHYME_SCHEME = "AABB (Couplets)";
export const ENFORCE_RHYME_SCHEME = true;

// Anti-Hallucination Mode
export const ANTI_HALLUCINATION_MODE = true;

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