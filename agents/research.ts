
import { GoogleGenAI } from "@google/genai";
import { RESEARCH_PROMPT_TEMPLATE, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { retryWithBackoff } from "../utils";

export const runResearchAgent = async (topic: string, mood: string | undefined, apiKey: string, selectedModel: string) => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Enhance prompt to leverage search capabilities
  const searchPrompt = `${RESEARCH_PROMPT_TEMPLATE(topic, mood)}
  
  CRITICAL INSTRUCTION: 
  Use Google Search to find:
  1. Recent lyrical trends or slang relevant to this topic.
  2. If the user references a specific movie or song style, find its details (Composer, Raagam, Vibe).
  3. Cultural metaphors associated with this specific mood.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: selectedModel,
          contents: searchPrompt,
          config: {
            // Enable Google Search Grounding for research
            tools: [{ googleSearch: {} }],
            temperature: AGENT_TEMPERATURES.RESEARCH,
            // maxOutputTokens removed to allow dynamic length
            topP: AGENT_TOP_P.RESEARCH,
            topK: 40
          }
        });
        if (!result.text) {
          throw new Error("No response text from research agent");
        }
        return result;
      },
      2,
      1000
    );

    let resultText = response.text || "";

    // Extract and append grounding metadata (sources) if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      const sources = groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web?.title ? `- ${chunk.web.title} (${chunk.web.uri})` : null)
        .filter(Boolean);

      if (sources.length > 0) {
        resultText += "\n\n[RESEARCH SOURCES]:\n" + sources.join("\n");
      }
    }

    return resultText;

  } catch (error) {
    console.warn("Research Agent (Search) failed, falling back to basic knowledge...", error);

    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }

    // Try fallback without search tool
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: selectedModel,
        contents: RESEARCH_PROMPT_TEMPLATE(topic, mood)
      });
      return fallbackResponse.text || "";
    } catch (fallbackError) {
      const { wrapGenAIError } = await import("../utils");
      throw wrapGenAIError(fallbackError);
    }
  }
};
