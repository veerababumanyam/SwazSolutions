
import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION_EMOTION , getModelToUse} from "./config";
import { EmotionAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff } from "../utils";

export const runEmotionAgent = async (input: string, apiKey?: string, selectedModel?: string): Promise<EmotionAnalysis> => {
  const key = apiKey;
  if (!key) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: key });

  const emotionSchema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, description: "Positive, Negative, or Neutral" },
      navarasa: { type: Type.STRING, description: "The dominant Rasa (e.g., Shringara, Raudra)" },
      intensity: { type: Type.INTEGER, description: "Scale of 1 to 10" },
      suggestedKeywords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Keywords that match this emotion" 
      },
      vibeDescription: { type: Type.STRING, description: "A poetic description of the detected vibe" },
      // AI Configuration Suggestions
      suggestedMood: { type: Type.STRING, description: "Best matching mood (e.g., Romantic, Energetic)" },
      suggestedStyle: { type: Type.STRING, description: "Best matching musical style (e.g., Cinematic, Pop, Folk)" },
      suggestedTheme: { type: Type.STRING, description: "Best matching theme (e.g., Love, Nature)" },
      suggestedRhymeScheme: { type: Type.STRING, description: "Best rhyme scheme (e.g., AABB (Couplet), Free Verse)" },
      suggestedComplexity: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Complexity level" },
      suggestedSingerConfig: { type: Type.STRING, description: "Best singer setup (e.g., Duet, Solo Male)" }
    },
    required: ["sentiment", "navarasa", "intensity", "vibeDescription", "suggestedMood", "suggestedStyle", "suggestedTheme", "suggestedRhymeScheme", "suggestedComplexity", "suggestedSingerConfig"]
  };

  const prompt = `
    USER INPUT: "${input}"
    
    TASK:
    1. Analyze the emotional sentiment and "Navarasa" (Indian Aesthetic).
    2. ACT AS A MUSIC PRODUCER: Based on the user's request, determine the best configuration for generating the song.
    
    If the user says "Write a rap", suggestedStyle should be "Rap/Hip-Hop" and rhyme should be "AABB".
    If the user says "Sad song about breakup", mood should be "Melancholic", style might be "Cinematic" or "Ghazal".
    If the user says "Love song", mood is "Romantic".
    
    Provide specific values for suggestedMood, suggestedStyle, etc., that best fit the prompt.
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
            temperature: 0.6,
          }
        });

        if (!result.text) {
          throw new Error("No response text");
        }
        return result;
      },
      2, // max 2 retries for rate limits
      1000 // start with 1s delay
    );

    return cleanAndParseJSON<EmotionAnalysis>(response.text);
  } catch (error) {
    console.error("Emotion Agent Error:", error);
    // Re-throw API key errors to be handled by orchestrator
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    const { wrapGenAIError } = await import("../utils");
    throw wrapGenAIError(error);
  }
};
