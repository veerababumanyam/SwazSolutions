import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_RHYME_MASTER, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST } from "./config";
import { RhymeSuggestions, GenerationSettings, LanguageProfile, EmotionAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { LANGUAGE_METADATA } from "./constants";

/**
 * RHYME MASTER AGENT - Agent #9 in the 13-Agent System
 * Core Responsibility: Advanced rhyme generation and validation
 *
 * This agent specializes in:
 * - Multi-language rhyme generation
 * - Rhyme scheme validation
 * - Internal rhyme suggestions
 * - Cross-language rhyming (for fusion songs)
 * - Rhyme map creation for the lyricist
 */
export const runRhymeMasterAgent = async (
  userRequest: string,
  emotionData: EmotionAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  apiKey: string,
  selectedModel?: string
): Promise<RhymeSuggestions> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const rhymeSchema = {
    type: Type.OBJECT,
    properties: {
      primaryRhymes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of strong rhyming word pairs for the primary language"
      },
      alternateRhymes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Slant/near rhymes as alternatives"
      },
      internalRhymes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Suggested internal rhyme patterns"
      },
      rhymeMap: {
        type: Type.OBJECT,
        description: "Map of theme keywords to their rhymes"
      },
      schemeValidation: {
        type: Type.BOOLEAN,
        description: "Whether the selected rhyme scheme is achievable"
      },
      suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Specific suggestions for the lyricist"
      }
    },
    required: ["primaryRhymes", "alternateRhymes", "internalRhymes", "rhymeMap", "schemeValidation", "suggestions"]
  };

  // Get language-specific rhyme information
  const langMetadata = LANGUAGE_METADATA[languageProfile.primary];
  const poeticTraditions = langMetadata?.poeticTraditions?.join(", ") || "General";
  const commonRhymePatterns = langMetadata?.commonRhymePatterns?.join(", ") || "AABB, ABAB";

  // Check if fusion mode
  const isFusion = languageProfile.primary !== languageProfile.secondary;
  const fusionNote = isFusion
    ? `FUSION MODE: Cross-language rhyming allowed between ${languageProfile.primary} and ${languageProfile.secondary}.`
    : `PURE MODE: All rhymes must be in ${languageProfile.primary} only.`;

  const prompt = `
    USER REQUEST: "${userRequest}"

    EMOTIONAL CONTEXT:
    - Navarasa: ${emotionData.navarasa}
    - Mood: ${generationSettings.mood}
    - Theme: ${generationSettings.theme}

    LANGUAGE CONFIGURATION:
    - Primary: ${languageProfile.primary}
    - Secondary: ${languageProfile.secondary}
    - Tertiary: ${languageProfile.tertiary}
    - Script: ${langMetadata?.script || "Unknown"}
    - Poetic Traditions: ${poeticTraditions}
    - Common Patterns: ${commonRhymePatterns}

    ${fusionNote}

    SELECTED RHYME SCHEME: ${generationSettings.rhymeScheme}

    TASK: Generate a comprehensive rhyme toolkit for the lyricist.

    REQUIREMENTS:
    1. **PRIMARY RHYMES**: Provide 15-20 strong rhyming word pairs relevant to the theme.
       - Format: "word1 - word2" (e.g., "ప్రేమ - నేమా" for Telugu love theme)
       - Must be phonetically perfect end rhymes (Anthya Prasa)

    2. **ALTERNATE RHYMES**: Provide 10-15 slant/near rhymes as backup options.
       - These are acceptable when perfect rhymes feel forced

    3. **INTERNAL RHYMES**: Suggest 5-10 internal rhyme patterns.
       - Words that can rhyme within a single line for added musicality

    4. **RHYME MAP**: Create a dictionary mapping key theme words to their rhymes.
       - Focus on words likely to appear in a ${generationSettings.theme} song

    5. **SCHEME VALIDATION**: Assess if ${generationSettings.rhymeScheme} is achievable in ${languageProfile.primary}.
       - Some complex schemes may be difficult in certain languages

    6. **SUGGESTIONS**: Provide specific tips for the lyricist.
       - Which syllable patterns work best
       - Common pitfalls to avoid
       - Fusion rhyme opportunities (if applicable)

    IMPORTANT:
    - All rhyming words must be REAL ${languageProfile.primary} words
    - Consider the emotional tone when selecting rhymes
    - Prioritize rhymes that sound natural when sung
    - For Indian languages, focus on the last syllable/matra for rhyming

    OUTPUT: Structured JSON with comprehensive rhyme suggestions.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_FAST),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_RHYME_MASTER,
            responseMimeType: "application/json",
            responseSchema: rhymeSchema,
            temperature: AGENT_TEMPERATURES.RHYME_MASTER,
            topP: AGENT_TOP_P.RHYME_MASTER,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from rhyme master agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<RhymeSuggestions>(response.text);

  } catch (error) {
    console.error("Rhyme Master Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
