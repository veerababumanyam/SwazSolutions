
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_EMOTION, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { EmotionAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff } from "../utils/helpers";

/**
 * SIMPLIFIED EMOTION AGENT
 * Core Responsibility: Navarasa (9 classical emotions) detection ONLY
 * Setting inference moved to Prompt Engineer Agent
 */
export const runEmotionAgent = async (input: string, apiKey?: string, selectedModel?: string): Promise<EmotionAnalysis> => {
  const key = apiKey;
  if (!key) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: key });

  const emotionSchema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, description: "Positive, Negative, or Neutral" },
      navarasa: { type: Type.STRING, description: "The dominant Rasa (e.g., Shringar, Karuna, Raudra, Veera, Hasya, Bhayanaka, Bibhatsa, Adbhuta, Shanta)" },
      intensity: { type: Type.INTEGER, description: "Emotional intensity scale 1-10" },
      vibeDescription: { type: Type.STRING, description: "A poetic description of the detected emotional vibe" }
    },
    required: ["sentiment", "navarasa", "intensity", "vibeDescription"]
  };

  const prompt = `
    USER INPUT: "${input}"
    
    TASK: Analyze the emotional content using the Navarasa framework (9 classical emotions):
    
    1. Shringar (Love/Beauty/Romance)
    2. Hasya (Laughter/Joy/Comedy)
    3. Karuna (Compassion/Sadness/Pathos)
    4. Raudra (Anger/Fury)
    5. Veera (Courage/Valor/Heroism)
    6. Bhayanaka (Fear/Terror)
    7. Bibhatsa (Disgust/Aversion)
    8. Adbhuta (Wonder/Amazement)
    9. Shanta (Peace/Tranquility)
    
    Determine:
    - Overall sentiment (Positive/Negative/Neutral)
    - Dominant Navarasa emotion
    - Intensity (1-10, where 10 is extreme)
    - A poetic description of the vibe
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_EMOTION,
            responseMimeType: "application/json",
            responseSchema: emotionSchema,
            temperature: AGENT_TEMPERATURES.EMOTION,
            topP: AGENT_TOP_P.EMOTION,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<EmotionAnalysis>(response.text);
  } catch (error) {
    console.error("Emotion Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    const { wrapGenAIError } = await import("../utils/helpers");
    throw wrapGenAIError(error);
  }
};
