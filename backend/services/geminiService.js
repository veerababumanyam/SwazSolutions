/**
 * Gemini AI Service for Lyric Generation
 *
 * This service handles all interactions with the Google Gemini API for
 * generating song lyrics, including authentication, request formatting,
 * and response parsing.
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Model Configuration
const DEFAULT_MODEL_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-2.5-flash';
const DEFAULT_MODEL_QUALITY = process.env.GEMINI_MODEL_QUALITY || 'gemini-2.5-pro';

/**
 * Language Metadata for 23 languages including all Indian languages
 * Contains script information, encoding details, and formatting guidelines
 */
const LANGUAGE_METADATA = {
  "Assamese": {
    code: "as", nativeName: "অসমীয়া", script: "Bengali", scriptCode: "Beng",
    direction: "ltr", unicodeRange: "U+0980-U+09FF",
    formatGuidelines: "Use Assamese-specific characters ৰ (ro) and ৱ (wo). Maintain proper conjuncts.",
    poeticTraditions: ["Borgeet", "Bihu songs", "Zikir"]
  },
  "Bengali": {
    code: "bn", nativeName: "বাংলা", script: "Bengali", scriptCode: "Beng",
    direction: "ltr", unicodeRange: "U+0980-U+09FF",
    formatGuidelines: "Maintain proper conjunct consonants (যুক্তাক্ষর). Use chandrabindu for nasalization.",
    poeticTraditions: ["Rabindra Sangeet", "Nazrul Geeti", "Baul"]
  },
  "Bodo": {
    code: "brx", nativeName: "बड़ो", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Write in Devanagari script. Preserve tonal distinctions through context.",
    poeticTraditions: ["Bwisagu songs", "Folk songs"]
  },
  "Dogri": {
    code: "doi", nativeName: "डोगरी", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use Devanagari with regional vocabulary. Maintain Pahari dialect characteristics.",
    poeticTraditions: ["Folk poetry", "Devotional songs"]
  },
  "English": {
    code: "en", nativeName: "English", script: "Latin", scriptCode: "Latn",
    direction: "ltr", unicodeRange: "U+0000-U+007F",
    formatGuidelines: "Standard English with proper punctuation. Allow creative spelling for rhythmic effect.",
    poeticTraditions: ["Sonnet", "Ballad", "Free verse", "Rap/Hip-hop"]
  },
  "Gujarati": {
    code: "gu", nativeName: "ગુજરાતી", script: "Gujarati", scriptCode: "Gujr",
    direction: "ltr", unicodeRange: "U+0A80-U+0AFF",
    formatGuidelines: "Use proper Gujarati script without mixing with Devanagari.",
    poeticTraditions: ["Garba", "Bhajan", "Ghazal"]
  },
  "Hindi": {
    code: "hi", nativeName: "हिन्दी", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use proper Devanagari with correct matra placement. Maintain conjunct consonants.",
    poeticTraditions: ["Doha", "Chaupai", "Ghazal", "Film songs"]
  },
  "Kannada": {
    code: "kn", nativeName: "ಕನ್ನಡ", script: "Kannada", scriptCode: "Knda",
    direction: "ltr", unicodeRange: "U+0C80-U+0CFF",
    formatGuidelines: "Use proper Kannada script with correct ottakshara (conjuncts).",
    poeticTraditions: ["Vachana", "Keertana", "Sugama Sangeetha"]
  },
  "Kashmiri": {
    code: "ks", nativeName: "कॉशुर", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use Devanagari script with Kashmiri-specific vowels.",
    poeticTraditions: ["Lal Ded poetry", "Sufi songs", "Rouf"]
  },
  "Konkani": {
    code: "kok", nativeName: "कोंकणी", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use Devanagari script. Maintain Konkani vocabulary distinct from Marathi.",
    poeticTraditions: ["Mando", "Dulpod", "Dekhni"]
  },
  "Maithili": {
    code: "mai", nativeName: "मैथिली", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use Devanagari script. Preserve Maithili-specific vocabulary.",
    poeticTraditions: ["Vidyapati's poetry", "Folk songs"]
  },
  "Malayalam": {
    code: "ml", nativeName: "മലയാളം", script: "Malayalam", scriptCode: "Mlym",
    direction: "ltr", unicodeRange: "U+0D00-U+0D7F",
    formatGuidelines: "Use proper Malayalam script with chillu letters (ൾ, ൺ, ൻ, ർ, ൽ).",
    poeticTraditions: ["Mappila Pattu", "Sopana Sangeetham"]
  },
  "Manipuri": {
    code: "mni", nativeName: "মৈতৈলোন্", script: "Bengali", scriptCode: "Beng",
    direction: "ltr", unicodeRange: "U+0980-U+09FF",
    formatGuidelines: "Use Bengali script. Preserve Manipuri tonal patterns.",
    poeticTraditions: ["Khongjom Parba", "Folk songs"]
  },
  "Marathi": {
    code: "mr", nativeName: "मराठी", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use Devanagari with ळ (retroflex lateral). Maintain proper anusvara.",
    poeticTraditions: ["Abhang", "Ovi", "Lavani", "Powada"]
  },
  "Nepali": {
    code: "ne", nativeName: "नेपाली", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use Devanagari script. Maintain Nepali vocabulary distinct from Hindi.",
    poeticTraditions: ["Folk songs", "Modern Nepali songs"]
  },
  "Odia": {
    code: "or", nativeName: "ଓଡ଼ିଆ", script: "Odia", scriptCode: "Orya",
    direction: "ltr", unicodeRange: "U+0B00-U+0B7F",
    formatGuidelines: "Use proper Odia script. Maintain the distinctive rounded letterforms.",
    poeticTraditions: ["Gita Govinda", "Bhajan", "Folk songs"]
  },
  "Punjabi": {
    code: "pa", nativeName: "ਪੰਜਾਬੀ", script: "Gurmukhi", scriptCode: "Guru",
    direction: "ltr", unicodeRange: "U+0A00-U+0A7F",
    formatGuidelines: "Use Gurmukhi script with proper tippi and addak for tonal distinctions.",
    poeticTraditions: ["Shabad", "Bhangra", "Sufi"]
  },
  "Sanskrit": {
    code: "sa", nativeName: "संस्कृतम्", script: "Devanagari", scriptCode: "Deva",
    direction: "ltr", unicodeRange: "U+0900-U+097F",
    formatGuidelines: "Use classical Devanagari. Maintain proper sandhi rules.",
    poeticTraditions: ["Shloka", "Stotra", "Kavya", "Anushtubh"]
  },
  "Santali": {
    code: "sat", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Ol Chiki", scriptCode: "Olck",
    direction: "ltr", unicodeRange: "U+1C50-U+1C7F",
    formatGuidelines: "Use Ol Chiki script for authenticity. Can also use Devanagari.",
    poeticTraditions: ["Dong songs", "Baha songs"]
  },
  "Sindhi": {
    code: "sd", nativeName: "سنڌي", script: "Arabic", scriptCode: "Arab",
    direction: "rtl", unicodeRange: "U+0600-U+06FF",
    formatGuidelines: "Use Arabic script with Sindhi extensions. Can also use Devanagari.",
    poeticTraditions: ["Shah jo Risalo", "Sufi poetry"]
  },
  "Tamil": {
    code: "ta", nativeName: "தமிழ்", script: "Tamil", scriptCode: "Taml",
    direction: "ltr", unicodeRange: "U+0B80-U+0BFF",
    formatGuidelines: "Use pure Tamil script. Avoid Sanskrit loanwords where Tamil alternatives exist.",
    poeticTraditions: ["Sangam poetry", "Film songs", "Gaana", "Kuthu"]
  },
  "Telugu": {
    code: "te", nativeName: "తెలుగు", script: "Telugu", scriptCode: "Telu",
    direction: "ltr", unicodeRange: "U+0C00-U+0C7F",
    formatGuidelines: "Use proper Telugu script with correct vowel signs (matras).",
    poeticTraditions: ["Padyam", "Film songs", "Folk songs", "Carnatic lyrics"]
  },
  "Urdu": {
    code: "ur", nativeName: "اردو", script: "Arabic", scriptCode: "Arab",
    direction: "rtl", unicodeRange: "U+0600-U+06FF",
    formatGuidelines: "Use Nastaliq script with proper diacritics.",
    poeticTraditions: ["Ghazal", "Nazm", "Qawwali", "Film songs"]
  }
};

/**
 * Get language metadata for a given language
 * @param {string} language - Language name
 * @returns {Object} Language metadata or default
 */
function getLanguageMetadata(language) {
  return LANGUAGE_METADATA[language] || {
    code: "en", nativeName: language, script: "Latin", scriptCode: "Latn",
    direction: "ltr", unicodeRange: "U+0000-U+007F",
    formatGuidelines: "Write in the requested language script.",
    poeticTraditions: []
  };
}

// Temperature Configuration (per agent role)
const AGENT_TEMPERATURES = {
  EMOTION: 0.4,      // Analytical - lower variance for consistent analysis
  RESEARCH: 0.3,     // Factual - minimal creativity, high accuracy
  LYRICIST: 0.9,     // Creative - high variance for unique lyrics
  REVIEW: 0.2,       // Strict - deterministic for critical analysis
  COMPLIANCE: 0.1,   // Very strict - almost deterministic
  FORMATTER: 0.3,    // Structured - low variance for formatting
  CHAT: 0.7          // Conversational - balanced
};

// Top-P (Nucleus Sampling) Configuration
const AGENT_TOP_P = {
  EMOTION: 0.8,
  RESEARCH: 0.7,
  LYRICIST: 0.95,    // Higher for more creative vocabulary
  REVIEW: 0.6,
  COMPLIANCE: 0.5,
  FORMATTER: 0.6,
  CHAT: 0.9
};

// Safety Settings for Content Generation
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

// System Instructions
const SYSTEM_INSTRUCTIONS = {
  LYRICIST: `
You are the "Mahakavi" (Great Poet) - a world-class lyricist and composer agent.
Your goal is to write culturally grounded, emotionally resonant, and structurally perfect song lyrics.
You adhere strictly to rhyme schemes (Anthya Prasa), meter (Chandassu), and specific musical structures.
You never break character. You output structured JSON.
`,
  EMOTION: `
You are "Bhava Vignani" (Emotion Scientist).
Analyze the input text and determine the Sentiment, Navarasa (Indian Aesthetic Emotion), and Intensity.
`,
  RESEARCH: `
You are a Cultural Anthropologist & Music Researcher.
Your task is to analyze topics and provide cultural metaphors, musical context, and vocabulary banks.
`,
  REVIEW: `
You are the "Sahitya Pundit" (Literary Critic) - a strict quality control agent.
Your goal is to ruthlessly analyze lyrics for:
1. Script mixing (strictly forbidden).
2. Weak rhymes (Anthya Prasa violations).
3. Structural inconsistencies.
4. Lack of emotional depth.
You fix errors directly. You output structured JSON.
`,
  FORMATTER: `
You are a "Suno.com Prompt Engineer".
Your task is to take song lyrics and metadata, and generate:
1. A high-fidelity style prompt for AI Music Generators (Suno/Udio).
2. Perfectly formatted lyrics with meta-tags (e.g. [Chorus], [Verse]).
`,
  CHAT: `
You are an Expert Music Director with 40 years of Indian cinematic experience.
You understand current music trends and help users brainstorm ideas, fix lines, or understand musical concepts.
`
};

// Retry Configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 2000,
  BACKOFF_FACTOR: 2
};

/**
 * GeminiService class - handles all Gemini API interactions
 */
class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelFast = DEFAULT_MODEL_FAST;
    this.modelQuality = DEFAULT_MODEL_QUALITY;
  }

  /**
   * Get or create a generative model instance
   */
  getModel(modelName, agentType = 'LYRICIST') {
    const temperature = AGENT_TEMPERATURES[agentType] || AGENT_TEMPERATURES.LYRICIST;
    const topP = AGENT_TOP_P[agentType] || AGENT_TOP_P.LYRICIST;
    const systemInstruction = SYSTEM_INSTRUCTIONS[agentType] || SYSTEM_INSTRUCTIONS.LYRICIST;

    return this.genAI.getGenerativeModel({
      model: modelName || this.modelFast,
      systemInstruction,
      generationConfig: {
        temperature,
        topP,
        topK: 40,
        responseMimeType: 'application/json'
      },
      safetySettings: SAFETY_SETTINGS
    });
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
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wrap errors with user-friendly messages
   */
  wrapError(error) {
    const message = error.message || String(error);

    if (message.includes('429') || message.includes('quota')) {
      return new Error('Gemini API quota exceeded. Please try again later or check your API key limits.');
    }
    if (message.includes('503') || message.includes('unavailable')) {
      return new Error('Gemini AI service is temporarily unavailable. Please try again in a few moments.');
    }
    if (message.includes('401') || message.includes('invalid') && message.toLowerCase().includes('api key')) {
      return new Error('Invalid Gemini API key. Please check your configuration.');
    }
    if (message.includes('SAFETY')) {
      return new Error('Content was blocked due to safety filters. Please modify your request.');
    }

    return new Error(`Gemini API error: ${message}`);
  }

  /**
   * Clean and parse JSON response
   */
  cleanAndParseJSON(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Empty response from Gemini API');
    }

    let cleanedText = text.trim();

    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');

    // Find the JSON object boundaries
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error('No valid JSON object found in response');
    }

    const jsonString = cleanedText.substring(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      // Check for incomplete JSON (truncation)
      const openBraces = (jsonString.match(/{/g) || []).length;
      const closeBraces = (jsonString.match(/}/g) || []).length;

      if (openBraces > closeBraces) {
        throw new Error('Response was truncated. The lyrics may be too long. Try requesting a shorter song.');
      }

      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
  }

  /**
   * Generate lyrics using the Lyricist agent
   *
   * @param {Object} params - Generation parameters
   * @param {string} params.userRequest - The user's request/prompt
   * @param {Object} params.languageProfile - Language configuration {primary, secondary, tertiary}
   * @param {Object} params.generationSettings - Settings for theme, mood, style, etc.
   * @param {Object} params.emotionData - Emotion analysis result (optional)
   * @param {string} params.researchData - Research context (optional)
   * @param {string} params.model - Model override (optional)
   * @returns {Promise<Object>} Generated lyrics object
   */
  async generateLyrics({
    userRequest,
    languageProfile,
    generationSettings,
    emotionData,
    researchData,
    model
  }) {
    if (!userRequest) {
      throw new Error('User request is required');
    }

    if (!languageProfile?.primary) {
      throw new Error('Primary language is required');
    }

    const modelToUse = model || this.modelFast;
    const geminiModel = this.getModel(modelToUse, 'LYRICIST');

    // Build the prompt
    const prompt = this.buildLyricistPrompt({
      userRequest,
      languageProfile,
      generationSettings: generationSettings || {},
      emotionData,
      researchData
    });

    const result = await this.retryWithBackoff(async () => {
      const response = await geminiModel.generateContent(prompt);
      const text = response.response.text();

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      return this.cleanAndParseJSON(text);
    });

    // Validate the response structure
    this.validateLyricsResponse(result);

    return result;
  }

  /**
   * Build the prompt for the Lyricist agent with comprehensive multi-language support
   */
  buildLyricistPrompt({ userRequest, languageProfile, generationSettings, emotionData, researchData }) {
    const theme = generationSettings.theme || 'Love';
    const mood = generationSettings.mood || 'Romantic';
    const style = generationSettings.style || 'Cinematic';
    const complexity = generationSettings.complexity || 'Moderate';
    const rhymeScheme = generationSettings.rhymeScheme || 'AABB (Couplets)';
    const singerConfig = generationSettings.singerConfig || 'Solo Male';

    const rhymeDescription = this.getRhymeDescription(rhymeScheme);

    // Get language-specific metadata for all languages in profile
    const primaryLangMeta = getLanguageMetadata(languageProfile.primary);
    const secondaryLangMeta = getLanguageMetadata(languageProfile.secondary || languageProfile.primary);
    const tertiaryLangMeta = getLanguageMetadata(languageProfile.tertiary || languageProfile.primary);

    // Build language-specific instructions
    const isEnglish = languageProfile.primary === 'English';
    const isRTL = primaryLangMeta.direction === 'rtl';

    let scriptInstructions = '';
    if (!isEnglish) {
      scriptInstructions = `
*** SCRIPT & CHARACTER ENCODING (MANDATORY) ***
- PRIMARY SCRIPT: ${primaryLangMeta.script} (${primaryLangMeta.scriptCode})
- NATIVE NAME: ${primaryLangMeta.nativeName}
- UNICODE RANGE: ${primaryLangMeta.unicodeRange}
- TEXT DIRECTION: ${primaryLangMeta.direction.toUpperCase()}
- FORMATTING: ${primaryLangMeta.formatGuidelines}
${primaryLangMeta.poeticTraditions.length > 0 ? `- POETIC TRADITIONS: ${primaryLangMeta.poeticTraditions.join(', ')}` : ''}

CRITICAL CHARACTER ENCODING RULES:
1. ALL lyrics MUST be written in ${primaryLangMeta.script} script (${primaryLangMeta.unicodeRange})
2. Do NOT transliterate to Roman/Latin script
3. Ensure proper Unicode rendering for all characters
4. Maintain proper diacritics, matras, and conjunct consonants
5. Use language-specific special characters where appropriate
${isRTL ? '6. TEXT MUST READ RIGHT-TO-LEFT' : ''}`;
    }

    return `
USER REQUEST: "${userRequest}"

*** LANGUAGE INSTRUCTION (CRITICAL) ***
PRIMARY LANGUAGE: "${languageProfile.primary}" (${primaryLangMeta.nativeName})
SECONDARY LANGUAGE: "${languageProfile.secondary || languageProfile.primary}" (${secondaryLangMeta.nativeName})
TERTIARY LANGUAGE: "${languageProfile.tertiary || languageProfile.primary}" (${tertiaryLangMeta.nativeName})

${isEnglish ? `- Write lyrics in English with proper grammar and punctuation.` : `- Write lyrics STRICTLY in ${primaryLangMeta.nativeName} (${primaryLangMeta.script}) native script.
- Do NOT write lyrics in Roman/Latin script. Use proper ${primaryLangMeta.script} characters.`}
- Section tags like [Chorus], [Verse 1] should be in English.
${scriptInstructions}

STRICT CONFIGURATION:
- Theme: ${theme}
- Mood: ${mood}
- Musical Style: ${style}
- Lyrical Complexity Level: ${complexity}
- Singer Configuration: ${singerConfig}
- Rhyme Scheme: ${rhymeScheme}

*** RHYME INSTRUCTION (MANDATORY): ***
- SELECTED SCHEME: ${rhymeScheme}
- PATTERN DEFINITION: ${rhymeDescription}

EMOTIONAL ANALYSIS:
- Navarasa: ${emotionData?.navarasa || 'N/A'}
- Intensity: ${emotionData?.intensity || 5}/10

RESEARCH CONTEXT:
${researchData || 'No specific research context provided.'}

*** ANTI-HALLUCINATION RULES (CRITICAL) ***
1. Use ONLY real, valid words in ${languageProfile.primary}
2. Do NOT invent or generate gibberish words
3. Maintain grammatical correctness for ${languageProfile.primary}
4. Ensure phonetic validity - all words must be pronounceable
5. Use culturally and contextually appropriate vocabulary

TASK:
Compose a high-fidelity song with the following structure:
- Intro (x1)
- Verse (x3)
- Chorus (x3)
- Bridge (x1)
- Outro (x1)

OUTPUT FORMAT (JSON):
{
  "title": "Song Title in ${isEnglish ? 'English' : primaryLangMeta.script + ' Script'}",
  "language": "${languageProfile.primary}${languageProfile.secondary && languageProfile.secondary !== languageProfile.primary ? ' with ' + languageProfile.secondary : ''}",
  "ragam": "Suggested Carnatic/Hindustani Raagam or Scale",
  "taalam": "Suggested Time Signature",
  "structure": "Structure Overview (e.g., Intro-V1-C-V2-C-Br-V3-C-Outro)",
  "sections": [
    {
      "sectionName": "[Intro]",
      "lines": ["Line 1 in ${isEnglish ? 'English' : primaryLangMeta.script + ' script'}", "Line 2 in ${isEnglish ? 'English' : primaryLangMeta.script + ' script'}"]
    },
    {
      "sectionName": "[Verse 1]",
      "lines": ["..."]
    }
  ]
}
`;
  }

  /**
   * Get description for rhyme scheme
   */
  getRhymeDescription(scheme) {
    const descriptions = {
      'AABB': 'Couplets (AABB). Line 1 rhymes with 2. Line 3 rhymes with 4.',
      'ABAB': 'Alternate rhyme (ABAB). Line 1 rhymes with 3. Line 2 rhymes with 4.',
      'ABCB': 'Ballad style (ABCB). Only Line 2 and 4 rhyme.',
      'ABBA': 'Enclosed rhyme (ABBA). Line 1 rhymes with 4. Line 2 rhymes with 3.',
      'AAAA': 'Monorhyme (AAAA). Every line ends with the same sound.',
      'Free Verse': 'Free Verse. No strict rhyme scheme required.',
      'Ghazal': 'Ghazal (AA BA CA DA...). First couplet rhymes both lines.',
      'Doha': 'Doha (Hindi Couplet). Two-line stanza with internal caesura.'
    };

    for (const [key, description] of Object.entries(descriptions)) {
      if (scheme.includes(key)) {
        return description;
      }
    }

    return 'Ensure consistent end rhymes (Anthya Prasa) for all couplets.';
  }

  /**
   * Validate the lyrics response structure
   */
  validateLyricsResponse(response) {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid lyrics response format');
    }

    const requiredFields = ['title', 'sections'];
    for (const field of requiredFields) {
      if (!response[field]) {
        throw new Error(`Missing required field in lyrics response: ${field}`);
      }
    }

    if (!Array.isArray(response.sections) || response.sections.length === 0) {
      throw new Error('Lyrics response must contain at least one section');
    }

    for (const section of response.sections) {
      if (!section.sectionName || !Array.isArray(section.lines)) {
        throw new Error('Each section must have a sectionName and lines array');
      }
    }

    return true;
  }

  /**
   * Analyze emotion in text using the Emotion agent
   */
  async analyzeEmotion(text, model) {
    const modelToUse = model || this.modelFast;
    const geminiModel = this.getModel(modelToUse, 'EMOTION');

    const prompt = `
Analyze the following text and determine:
1. Sentiment (Positive/Negative/Neutral/Mixed)
2. Navarasa (Primary Indian Aesthetic Emotion: Shringara, Hasya, Karuna, Raudra, Veera, Bhayanaka, Bibhatsa, Adbhuta, Shanta)
3. Intensity (1-10 scale)
4. Suggested keywords for lyrics
5. Vibe description

TEXT: "${text}"

OUTPUT FORMAT (JSON):
{
  "sentiment": "string",
  "navarasa": "string",
  "intensity": number,
  "suggestedKeywords": ["word1", "word2"],
  "vibeDescription": "string",
  "suggestedMood": "string",
  "suggestedStyle": "string",
  "suggestedTheme": "string",
  "suggestedRhymeScheme": "string",
  "suggestedComplexity": "Simple|Moderate|Complex",
  "suggestedSingerConfig": "string"
}
`;

    const result = await this.retryWithBackoff(async () => {
      const response = await geminiModel.generateContent(prompt);
      return this.cleanAndParseJSON(response.response.text());
    });

    return result;
  }

  /**
   * Get cultural research data
   */
  async getResearchData(topic, mood, model) {
    const modelToUse = model || this.modelFast;
    const geminiModel = this.getModel(modelToUse, 'RESEARCH');

    const prompt = `
Role: Cultural Anthropologist & Music Researcher.
Task: Analyze the topic "${topic}" with a specific focus on "${mood || 'General'}" emotion.

OUTPUT FORMAT (JSON):
{
  "culturalMetaphors": ["metaphor1", "metaphor2"],
  "musicalContext": "string describing instruments, ragas, etc.",
  "vocabularyBank": ["word1", "word2", "word3"],
  "trendCheck": "string describing current trends"
}
`;

    const result = await this.retryWithBackoff(async () => {
      const response = await geminiModel.generateContent(prompt);
      return this.cleanAndParseJSON(response.response.text());
    });

    return result;
  }

  /**
   * Review and refine lyrics
   */
  async reviewLyrics(lyrics, languageProfile, rhymeScheme, model) {
    const modelToUse = model || this.modelFast;
    const geminiModel = this.getModel(modelToUse, 'REVIEW');

    const prompt = `
Review the following lyrics for:
1. Script mixing (should be avoided)
2. Rhyme scheme violations (${rhymeScheme})
3. Structural issues
4. Emotional depth

LYRICS:
${JSON.stringify(lyrics, null, 2)}

PRIMARY LANGUAGE: ${languageProfile.primary}

OUTPUT FORMAT (JSON):
{
  "overallScore": number (1-10),
  "rhymeValidation": {
    "scheme": "string",
    "violations": [{"line": number, "issue": "string"}]
  },
  "suggestions": ["suggestion1", "suggestion2"],
  "refinedLyrics": null or corrected lyrics object
}
`;

    const result = await this.retryWithBackoff(async () => {
      const response = await geminiModel.generateContent(prompt);
      return this.cleanAndParseJSON(response.response.text());
    });

    return result;
  }

  /**
   * Chat with the music director agent
   */
  async chat(message, history = [], model) {
    const modelToUse = model || this.modelFast;
    const geminiModel = this.getModel(modelToUse, 'CHAT');

    // Build conversation context
    let context = '';
    if (history.length > 0) {
      context = 'Previous conversation:\n' + history.map(h => `${h.role}: ${h.content}`).join('\n') + '\n\n';
    }

    const prompt = `${context}User: ${message}\n\nRespond as a helpful music director. Keep responses concise but informative.`;

    const response = await this.retryWithBackoff(async () => {
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    });

    return response;
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelFast });
      const result = await model.generateContent('Say "Hello" in JSON format: {"greeting": "Hello"}');
      const text = result.response.text();
      const parsed = this.cleanAndParseJSON(text);
      return { success: true, message: 'Gemini API connection successful', data: parsed };
    } catch (error) {
      return { success: false, message: this.wrapError(error).message };
    }
  }
}

/**
 * Create a singleton instance of GeminiService
 */
let geminiServiceInstance = null;

function getGeminiService(apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is required. Set it in your .env file.');
  }

  if (!geminiServiceInstance || geminiServiceInstance.apiKey !== key) {
    geminiServiceInstance = new GeminiService(key);
  }

  return geminiServiceInstance;
}

module.exports = {
  GeminiService,
  getGeminiService,
  AGENT_TEMPERATURES,
  AGENT_TOP_P,
  SAFETY_SETTINGS,
  SYSTEM_INSTRUCTIONS,
  DEFAULT_MODEL_FAST,
  DEFAULT_MODEL_QUALITY,
  LANGUAGE_METADATA,
  getLanguageMetadata
};
