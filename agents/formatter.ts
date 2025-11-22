import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_FORMATTER, getHQTags, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { cleanAndParseJSON } from "../utils";
import { validateApiKey, validateLyricsLength } from "../utils/validation";

export interface FormatterOutput {
  formattedLyrics: string;
}

export interface FormatterOptions {
  stylePrompt: string; // Received from Prompt Engineer
  customHQTags?: string[];
  context?: string;
}

/**
 * STREAMLINED FORMATTER AGENT
 * Core Responsibility: Add Suno.com meta-tags ONLY
 * Style prompt generation moved to Prompt Engineer
 */
export const runFormatterAgent = async (
  lyrics: string,
  apiKey: string,
  selectedModel: string,
  options: FormatterOptions
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

  // Get HQ tags
  const hqTags = getHQTags(options?.customHQTags, options?.context);

  // Append HQ tags to style prompt from Prompt Engineer
  const finalStylePrompt = `${options.stylePrompt}, ${hqTags}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      formattedLyrics: { type: Type.STRING, description: "Lyrics with [Square Bracket] meta-tags for Suno.com" }
    },
    required: ["formattedLyrics"]
  };

  const prompt = `
    INPUT LYRICS:
    ${lyrics}

    STYLE PROMPT (for reference): ${finalStylePrompt}

    TASK:
    Add [Square Bracket] meta-tags to structure the lyrics for Suno.com:
    - [Intro], [Verse 1], [Verse 2], [Verse 3], [Chorus], [Bridge], [Outro]
    - Tag each section appropriately
    - Keep the lyrics content exactly as is - only add tags
    - DO NOT add [Spoken Word] or [Dialogue] tags
    - DO NOT modify the lyrics themselves

    Return ONLY the tagged lyrics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_FORMATTER,
        temperature: AGENT_TEMPERATURES.FORMATTER,
        topP: AGENT_TOP_P.FORMATTER,
        topK: 40,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      const result = cleanAndParseJSON<{ formattedLyrics: string }>(response.text);
      return {
        formattedLyrics: result.formattedLyrics
      };
    }

    // Fallback
    return {
      formattedLyrics: lyrics
    };

  } catch (error) {
    console.error("Formatter Agent Error:", error);
    const { wrapGenAIError } = await import("../utils");
    throw wrapGenAIError(error);
  }
};