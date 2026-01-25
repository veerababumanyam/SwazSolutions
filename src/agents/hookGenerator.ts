import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_HOOK_GENERATOR, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST } from "./config";
import { HookSuggestion, GenerationSettings, LanguageProfile, EmotionAnalysis, RhymeSuggestions } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { LANGUAGE_METADATA } from "./constants";

/**
 * HOOK GENERATOR AGENT - Agent #11 in the 13-Agent System
 * Core Responsibility: Creating memorable, catchy hooks and choruses
 *
 * This agent specializes in:
 * - Main hook/chorus creation
 * - Tagline generation
 * - Ear-worm design
 * - Repetition pattern optimization
 * - Call-and-response hooks
 * - Commercial appeal assessment
 */
export const runHookGeneratorAgent = async (
  userRequest: string,
  emotionData: EmotionAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  rhymeSuggestions: RhymeSuggestions,
  apiKey: string,
  selectedModel?: string
): Promise<HookSuggestion> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const hookSchema = {
    type: Type.OBJECT,
    properties: {
      mainHook: {
        type: Type.STRING,
        description: "The primary hook/chorus line in native script"
      },
      alternateHooks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Alternative hook options (3-5)"
      },
      tagline: {
        type: Type.STRING,
        description: "A memorable one-liner/tagline for the song"
      },
      memorabilityScore: {
        type: Type.NUMBER,
        description: "Estimated memorability score (1-10)"
      },
      hookPlacement: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Recommended placement points in the song structure"
      }
    },
    required: ["mainHook", "alternateHooks", "tagline", "memorabilityScore", "hookPlacement"]
  };

  // Get language metadata
  const langMetadata = LANGUAGE_METADATA[languageProfile.primary];

  // Style-specific hook guidelines
  const styleHookGuide: Record<string, string> = {
    "Bollywood": "Catchy, dramatic, with star power appeal. Think 'Chaiyya Chaiyya', 'Gaal Ni Kadni'",
    "Tollywood Mass": "High energy, whistle-worthy, mass appeal. Think 'Naatu Naatu', 'Oo Antava'",
    "Folk": "Simple, repetitive, easy to sing along. Traditional call-response",
    "Classical": "Dignified, melodious pallavi. Think Carnatic kriti structure",
    "Rap/Hip-Hop": "Punchy, rhythmic, with internal rhymes and wordplay",
    "EDM": "Short, repetitive, bass-drop ready. 4-8 syllables max",
    "Pop": "Universally catchy, verse-chorus contrast, immediate recall",
    "Sufi": "Mystical, repetitive divine names, trance-inducing",
    "Bhajan": "Devotional refrain, name chanting, call-response",
    "Rock": "Anthem-worthy, shoutable, guitar-riff sync"
  };

  const hookGuide = styleHookGuide[generationSettings.style] || "Create a memorable, singable hook";

  // Format rhyme suggestions for context
  const rhymeContext = rhymeSuggestions.primaryRhymes?.slice(0, 5).join(", ") || "Use natural rhymes";

  const prompt = `
    USER REQUEST: "${userRequest}"

    EMOTIONAL CONTEXT:
    - Navarasa: ${emotionData.navarasa}
    - Intensity: ${emotionData.intensity}/10
    - Vibe: ${emotionData.vibeDescription}

    GENERATION SETTINGS:
    - Theme: ${generationSettings.theme}
    - Mood: ${generationSettings.mood}
    - Style: ${generationSettings.style}
    - Singer Config: ${generationSettings.singerConfig}

    TARGET LANGUAGE: ${languageProfile.primary}
    SCRIPT: ${langMetadata?.script || languageProfile.primary}

    STYLE-SPECIFIC HOOK GUIDANCE:
    ${hookGuide}

    AVAILABLE RHYMES (from Rhyme Master):
    ${rhymeContext}

    TASK: Create irresistibly catchy hooks for this song.

    REQUIREMENTS:

    1. **MAIN HOOK** (1 primary):
       - Must be in ${languageProfile.primary} NATIVE SCRIPT
       - 4-12 syllables ideal for memorability
       - Must capture the ${generationSettings.theme} essence
       - Should be singable by ${generationSettings.singerConfig}
       - High phonetic appeal (sounds good when sung)

    2. **ALTERNATE HOOKS** (3-5 options):
       - Variations on the main theme
       - Different rhythmic feels
       - At least one call-response option if appropriate

    3. **TAGLINE** (1 memorable one-liner):
       - Could be used as song title
       - Summarizes the song's message
       - Hashtag-worthy for social media

    4. **MEMORABILITY SCORE** (1-10):
       - Assess the hook's stickiness potential
       - Consider: simplicity, repetition value, emotional impact

    5. **HOOK PLACEMENT**:
       - Suggest where to place hooks in song structure
       - Examples: "Open with hook", "Post-chorus hook", "Outro repetition"

    HOOK DESIGN PRINCIPLES:
    - **Repetition**: Hooks should be repeatably singable
    - **Contrast**: Stand out from verses melodically/rhythmically
    - **Emotion**: Capture the peak emotional moment
    - **Brevity**: Shorter is more memorable
    - **Phonetics**: Prioritize vowel sounds for singing
    - **Universality**: Even non-speakers should feel the vibe

    EXAMPLES OF GREAT HOOKS (for reference):
    - Telugu: "అందరూ సంతోషం" (Simple, joyful)
    - Hindi: "जय हो!" (Powerful, short)
    - Tamil: "குத்து குத்து" (Energetic, repetitive)
    - English: "We Will Rock You" (Anthem-worthy)

    IMPORTANT:
    - Write hooks in ${languageProfile.primary} native script
    - Consider the ${generationSettings.singerConfig} vocal style
    - Hooks must be ORIGINAL (no existing song copies)
    - Match the ${emotionData.intensity}/10 intensity level

    OUTPUT: Structured JSON with hook suggestions.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_FAST),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_HOOK_GENERATOR,
            responseMimeType: "application/json",
            responseSchema: hookSchema,
            temperature: AGENT_TEMPERATURES.HOOK_GENERATOR,
            topP: AGENT_TOP_P.HOOK_GENERATOR,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from hook generator agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<HookSuggestion>(response.text);

  } catch (error) {
    console.error("Hook Generator Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
