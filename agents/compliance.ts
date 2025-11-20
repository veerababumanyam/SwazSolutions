import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION_COMPLIANCE, getModelToUse } from "./config";
import { ComplianceReport, GeneratedLyrics } from "./types";
import { cleanAndParseJSON } from "../utils";

export const runComplianceAgent = async (lyrics: GeneratedLyrics | string, apiKey?: string, selectedModel?: string): Promise<ComplianceReport> => {
  const key = apiKey;
  if (!key) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: key });

  // Handle both object and string input
  const lyricsText = typeof lyrics === 'string' ? lyrics : JSON.stringify(lyrics);

  const complianceSchema = {
    type: Type.OBJECT,
    properties: {
      originalityScore: { type: Type.INTEGER, description: "0 to 100" },
      flaggedPhrases: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Phrases that sound too similar to existing famous songs"
      },
      similarSongs: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Names of songs that share style or lyrics"
      },
      verdict: { type: Type.STRING, description: "Safe, Caution, or High Risk" }
    },
    required: ["originalityScore", "verdict"]
  };

  try {
    const response = await ai.models.generateContent({
      model: getModelToUse(selectedModel),
      contents: `Analyze these lyrics for plagiarism risks: \n${lyricsText}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_COMPLIANCE,
        responseMimeType: "application/json",
        responseSchema: complianceSchema,
        temperature: 0.2, // Low temp for strict analysis
      }
    });

    if (response.text) {
      return cleanAndParseJSON<ComplianceReport>(response.text);
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Compliance Agent Error:", error);
    // Re-throw API key errors
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    // Return safe fallback for other errors
    return {
      originalityScore: 100,
      flaggedPhrases: [],
      similarSongs: [],
      verdict: "Error Checking"
    };
  }
};