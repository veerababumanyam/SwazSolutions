
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_REVIEW, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { GeneratedLyrics, LanguageProfile, GenerationSettings } from "./types";
import { cleanAndParseJSON, formatLyricsForDisplay } from "../utils/helpers";

const getRhymeDescription = (scheme: string): string => {
  if (scheme.includes("AABB") || scheme.includes("Couplet")) return "Couplets (AABB). Line 1-2 rhyme, 3-4 rhyme.";
  if (scheme.includes("ABAB") || scheme.includes("Alternate")) return "Alternate (ABAB). Line 1-3 rhyme, 2-4 rhyme.";
  if (scheme.includes("ABCB") || scheme.includes("Ballad")) return "Ballad (ABCB). Only line 2-4 rhyme.";
  if (scheme.includes("ABBA") || scheme.includes("Enclosed")) return "Enclosed (ABBA). Line 1-4, 2-3 rhyme.";
  if (scheme.includes("AAAA") || scheme.includes("Monorhyme")) return "Monorhyme (AAAA). All lines same rhyme.";
  if (scheme.includes("Free Verse") || scheme.includes("No Rhyme") || scheme.includes("Blank")) return "Free verse. No strict rhyme.";
  return "Consistent end rhymes (Anthya Prasa).";
};

/**
 * STREAMLINED REVIEW AGENT
 * Core Responsibility: Rhyme validation + Script verification ONLY
 * Structure generation, complexity checks, punctuation removed (Lyricist handles these)
 */
export const runReviewAgent = async (
  draftLyrics: string,
  originalContext: string,
  languageProfile: LanguageProfile,
  generationSettings: GenerationSettings | undefined,
  apiKey: string,
  selectedModel: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const lyricsSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      language: { type: Type.STRING },
      ragam: { type: Type.STRING },
      taalam: { type: Type.STRING },
      structure: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sectionName: { type: Type.STRING },
            lines: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["sectionName", "lines"]
        }
      }
    },
    required: ["title", "sections"]
  };

  const rhymeScheme = generationSettings?.rhymeScheme || "AABB (Couplet)";
  const rhymeInstruction = getRhymeDescription(rhymeScheme);

  const prompt = `
    INPUT LYRICS (DRAFT):
    ${draftLyrics}

    TARGET LANGUAGE: ${languageProfile.primary}
    RHYME SCHEME: ${rhymeScheme}

    ROLE: You are a "Sahitya Pundit" (Literary Critic) performing quality control.

    FOCUSED TASKS (DO NOT DO ANYTHING ELSE):
    
    1. **SCRIPT VERIFICATION (CRITICAL):**
       - Verify all lyrics are in ${languageProfile.primary} NATIVE SCRIPT
       - If any lines use Roman/Latin transliteration, CONVERT to native script
       - Example: "Nenu vastunnanu" → "నేను వస్తున్నాను"
       - Final output must have 0% Roman characters in lyrics

    2. **RHYME VALIDATION:**
       - Target: ${rhymeScheme} (${rhymeInstruction})
       - Check phonetic end rhymes (Anthya Prasa)
       - If rhymes are weak/missing, REWRITE the line to force a rhyme
       - Maintain meaning while fixing rhymes
       - Cross-language rhyming allowed if in fusion mode

    3. **BASIC ERROR CORRECTION:**
       - Fix obvious typos or grammatical errors
       - Ensure tags are in English: [Chorus], [Verse], [Bridge], etc.
       - Remove any metadata or instructions within lyrics
    
    DO NOT:
    - Add missing sections (Lyricist handles structure)
    - Change complexity level
    - Add punctuation (Lyricist handles expression)
    - Rewrite for style preferences

    Return the corrected version in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_REVIEW,
        responseMimeType: "application/json",
        responseSchema: lyricsSchema,
        temperature: AGENT_TEMPERATURES.REVIEW,
        topP: AGENT_TOP_P.REVIEW,
        topK: 40
      }
    });

    if (response.text) {
      const data = cleanAndParseJSON<GeneratedLyrics>(response.text);
      return formatLyricsForDisplay(data);
    }

    return draftLyrics;

  } catch (error) {
    console.error("Review Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    console.warn("Review failed, returning draft lyrics");
    return draftLyrics;
  }
};
