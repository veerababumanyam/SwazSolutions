
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION_MULTIMODAL, getModelToUse } from "../config";

export const runMultiModalAgent = async (input: string, image?: string, audio?: string, apiKey?: string, selectedModel?: string): Promise<string> => {
  // If no media is provided, just return the text input
  if (!image && !audio) return input;

  const key = apiKey;
  if (!key) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: key });

  const parts: any[] = [{ text: `User Text Context: ${input}` }];

  if (image) {
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: image }
    });
  }

  if (audio) {
    parts.push({
      inlineData: { mimeType: "audio/mp3", data: audio }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: getModelToUse(selectedModel),
      config: { systemInstruction: SYSTEM_INSTRUCTION_MULTIMODAL },
      contents: [{ role: "user", parts: parts }]
    });

    const analysis = response.text || "";
    return `[Visual/Audio Context: ${analysis}] \n\n User Request: ${input}`;

  } catch (error) {
    console.error("MultiModal Agent Error:", error);
    // Re-throw API key errors
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    // For other errors, return original input
    return input;
  }
};
