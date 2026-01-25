import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_CULTURAL_TRANSLATOR, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST } from "./config";
import { CulturalAdaptation, GenerationSettings, LanguageProfile, EmotionAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { LANGUAGE_METADATA, SCENARIO_KNOWLEDGE_BASE } from "./constants";

/**
 * CULTURAL TRANSLATOR AGENT - Agent #10 in the 13-Agent System
 * Core Responsibility: Cross-cultural adaptation and localization
 *
 * This agent specializes in:
 * - Regional idiom and metaphor adaptation
 * - Cultural sensitivity checking
 * - Localization of universal themes
 * - Ceremony-specific vocabulary
 * - Regional dialect considerations
 */
export const runCulturalTranslatorAgent = async (
  userRequest: string,
  researchData: string,
  emotionData: EmotionAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  apiKey: string,
  selectedModel?: string
): Promise<CulturalAdaptation> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const culturalSchema = {
    type: Type.OBJECT,
    properties: {
      localizedPhrases: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Culturally adapted phrases for the target language/region"
      },
      culturalMetaphors: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Region-specific metaphors and similes"
      },
      regionSpecificIdioms: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Idioms and proverbs unique to the target culture"
      },
      adaptationNotes: {
        type: Type.STRING,
        description: "Detailed notes on cultural considerations"
      },
      culturalSensitivityCheck: {
        type: Type.BOOLEAN,
        description: "Whether the content passes cultural sensitivity review"
      }
    },
    required: ["localizedPhrases", "culturalMetaphors", "regionSpecificIdioms", "adaptationNotes", "culturalSensitivityCheck"]
  };

  // Get language metadata
  const langMetadata = LANGUAGE_METADATA[languageProfile.primary];
  const poeticTraditions = langMetadata?.poeticTraditions?.join(", ") || "General";

  // Get ceremony context if available
  let ceremonyContext = "";
  if (generationSettings.ceremony && generationSettings.ceremony !== "None") {
    for (const category of SCENARIO_KNOWLEDGE_BASE) {
      const ceremony = category.events.find(e => e.id === generationSettings.ceremony);
      if (ceremony) {
        ceremonyContext = `
        CEREMONY CONTEXT:
        - Event: ${ceremony.label}
        - Cultural Context: ${ceremony.promptContext}
        - Category: ${category.label}
        `;
        break;
      }
    }
  }

  // Cultural adaptation mapping
  const culturalContextMap: Record<string, string> = {
    "Telugu": "Andhra/Telangana culture - emphasis on family values, nature metaphors (paddy fields, rivers), respect for elders, vibrant festival culture",
    "Tamil": "Tamil Nadu culture - Sangam poetry traditions, Thirukkural wisdom, temple culture, Chola heritage, classical dance references",
    "Hindi": "North Indian culture - Bollywood influence, Hindi heartland imagery, Ganga-Yamuna references, diverse regional touches",
    "Bengali": "Bengali Renaissance influence - Rabindranath Tagore's poetry, Durga Puja, intellectual themes, nature-river imagery",
    "Kannada": "Karnataka culture - Carnatic music heritage, coffee plantation imagery, Hampi/Vijayanagara references",
    "Malayalam": "Kerala culture - Kathakali influence, backwater imagery, Onam traditions, literary sophistication",
    "Punjabi": "Punjab culture - Bhangra energy, agricultural themes, Sufi influence, valor and celebration",
    "Marathi": "Maharashtra culture - Abhang tradition, Sant Tukaram influence, Shivaji valor, Lavani",
    "Gujarati": "Gujarat culture - Garba/Dandiya, business acumen metaphors, vegetarian references, Navratri",
    "Urdu": "Urdu poetic tradition - Ghazal sophistication, Lucknowi tehzeeb, Sufi mysticism, refined expression"
  };

  const culturalContext = culturalContextMap[languageProfile.primary] || "Adapt to regional culture with authentic local expressions";

  const prompt = `
    USER REQUEST: "${userRequest}"

    RESEARCH DATA:
    ${researchData}

    EMOTIONAL CONTEXT:
    - Navarasa: ${emotionData.navarasa}
    - Vibe: ${emotionData.vibeDescription}

    GENERATION SETTINGS:
    - Theme: ${generationSettings.theme}
    - Mood: ${generationSettings.mood}
    - Style: ${generationSettings.style}

    ${ceremonyContext}

    TARGET LANGUAGE: ${languageProfile.primary}
    POETIC TRADITIONS: ${poeticTraditions}

    CULTURAL CONTEXT:
    ${culturalContext}

    TASK: Provide comprehensive cultural adaptation guidance for the lyricist.

    REQUIREMENTS:

    1. **LOCALIZED PHRASES** (10-15):
       - Transform universal expressions into culturally resonant ${languageProfile.primary} phrases
       - Example: "I love you" → "నా ప్రాణం నీదే" (My soul is yours - Telugu)
       - Focus on expressions that feel native, not translated

    2. **CULTURAL METAPHORS** (8-12):
       - Provide region-specific metaphors relevant to ${generationSettings.theme}
       - Include nature imagery, mythological references, local landmarks
       - Examples: monsoon imagery, temple bells, regional flowers/birds

    3. **REGION-SPECIFIC IDIOMS** (5-10):
       - Proverbs and sayings unique to ${languageProfile.primary} speakers
       - Must be appropriate for the ${generationSettings.mood} mood
       - Include brief explanation of meaning

    4. **ADAPTATION NOTES**:
       - Key cultural considerations for this song
       - What to emphasize and what to avoid
       - Ceremony-specific requirements (if applicable)
       - Regional sensitivities

    5. **SENSITIVITY CHECK**:
       - Flag any potential cultural issues
       - Ensure content respects religious/social norms
       - Verify appropriateness for the target audience

    IMPORTANT:
    - All suggestions must be in ${languageProfile.primary} native script
    - Consider the specific region/state's cultural nuances
    - Avoid generic expressions; prioritize authenticity
    - Match formality level to the song's context

    OUTPUT: Structured JSON with cultural adaptation guidance.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_FAST),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_CULTURAL_TRANSLATOR,
            responseMimeType: "application/json",
            responseSchema: culturalSchema,
            temperature: AGENT_TEMPERATURES.CULTURAL_TRANSLATOR,
            topP: AGENT_TOP_P.CULTURAL_TRANSLATOR,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from cultural translator agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<CulturalAdaptation>(response.text);

  } catch (error) {
    console.error("Cultural Translator Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
