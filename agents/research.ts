
import { GoogleGenAI } from "@google/genai";
import { RESEARCH_PROMPT_TEMPLATE, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { retryWithBackoff } from "../utils";

/**
 * SIMPLIFIED RESEARCH AGENT
 * Core Responsibility: Cultural context from knowledge base ONLY
 * Google Search removed for reliability and speed
 */
export const runResearchAgent = async (
  topic: string,
  mood: string | undefined,
  apiKey: string,
  selectedModel: string
): Promise<string> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `${RESEARCH_PROMPT_TEMPLATE(topic, mood)}
  
  CRITICAL INSTRUCTIONS:
  - Focus on cultural metaphors, idioms, and traditional references
  - Provide language-specific vocabulary appropriate to the mood
  - Include ceremony-specific imagery if relevant
  - Draw from your knowledge base (no external search needed)
  - Keep response concise (max 500 words)
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: {
            temperature: AGENT_TEMPERATURES.RESEARCH,
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

    return response.text || "";

  } catch (error) {
    console.error("Research Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    const { wrapGenAIError } = await import("../utils");
    throw wrapGenAIError(error);
  }
};
