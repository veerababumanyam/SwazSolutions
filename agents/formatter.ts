import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_FORMATTER, getHQTags, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { cleanAndParseJSON } from "../utils";
import { validateApiKey, validateLyricsLength } from "../utils/validation";

export interface FormatterOutput {
  stylePrompt: string;
  formattedLyrics: string;
}

export interface FormatterOptions {
  customHQTags?: string[];
  context?: string;
}

export const runFormatterAgent = async (
  lyrics: string,
  apiKey: string,
  selectedModel: string,
  options?: FormatterOptions
): Promise<FormatterOutput> => {
  // Validation
  const apiKeyValidation = validateApiKey(apiKey);
  if (!apiKeyValidation.valid) {
    throw new Error(apiKeyValidation.error);
  }

  const lyricsValidation = validateLyricsLength(lyrics);
  if (!lyricsValidation.valid) {
    throw new Error(lyricsValidation.error);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Get HQ tags based on user preferences or context
  const hqTags = getHQTags(options?.customHQTags, options?.context);

  const schema = {
    type: Type.OBJECT,
    properties: {
      stylePrompt: { type: Type.STRING, description: "A creative music style prompt with HQ tags." },
      formattedLyrics: { type: Type.STRING, description: "The lyrics with enhanced meta-tags." }
    },
    required: ["stylePrompt", "formattedLyrics"]
  };

  const prompt = `
    INPUT LYRICS:
    ${lyrics}

    TASK:
    1. Generate a "Creative Music Style Prompt" for Suno.com.
       - If Indian/Asian: Mix Global genres with Native instruments (Fusion).
       - If European/Western: Use specific sub-genres and authentic instrumentation.
    2. **IMPORTANT:** The stylePrompt MUST end with: "${hqTags}".
    3. Format the lyrics with [Square Bracket] meta-tags for Suno.
    4. **STRICT RULE:** Do NOT generate [Spoken Word].
  `;

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_FORMATTER,
        temperature: AGENT_TEMPERATURES.FORMATTER,
        // maxOutputTokens removed to allow dynamic length
        topP: AGENT_TOP_P.FORMATTER,
        topK: 40,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return cleanAndParseJSON<FormatterOutput>(response.text);
    }

    // Fallback
    return {
      stylePrompt: `Cinematic, Fusion, ${hqTags}`,
      formattedLyrics: lyrics
    };

  } catch (error) {
    console.error("Formatter Agent Error:", error);
    const { wrapGenAIError } = await import("../utils");
    throw wrapGenAIError(error);
  }
};