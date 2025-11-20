
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_REVIEW } from "./config";
import { GeneratedLyrics, LanguageProfile, GenerationSettings } from "./types";
import { cleanAndParseJSON, formatLyricsForDisplay } from "../utils";

const getRhymeDescription = (scheme: string): string => {
  if (scheme.startsWith("AABB")) return "Couplets. Line 1 rhymes with 2. Line 3 rhymes with 4.";
  if (scheme.startsWith("ABAB")) return "Alternate rhyme. Line 1 rhymes with 3. Line 2 rhymes with 4.";
  if (scheme.startsWith("ABCB")) return "Ballad. Line 2 rhymes with 4. Lines 1 and 3 are free.";
  if (scheme.startsWith("AABA")) return "Rubaiyat. Lines 1, 2, and 4 rhyme. Line 3 is free.";
  if (scheme.startsWith("ABBA")) return "Enclosed. Line 1 rhymes with 4. Line 2 rhymes with 3.";
  if (scheme.startsWith("AAAA")) return "Monorhyme. All lines end with same rhyme.";
  if (scheme.startsWith("AABCCB")) return "Sestet. Line 1 rhymes with 2. Line 4 rhymes with 5. Line 3 rhymes with 6.";
  if (scheme.startsWith("Terza")) return "Chain Rhyme (ABA BCB).";
  if (scheme.startsWith("Limerick")) return "AABBA structure.";
  return "Consistent end rhymes (Anthya Prasa).";
};

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
      title: { type: Type.STRING, description: "Refined title in Native Script" },
      language: { type: Type.STRING },
      ragam: { type: Type.STRING },
      taalam: { type: Type.STRING },
      structure: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sectionName: { type: Type.STRING, description: "MUST BE [English Tag] like [Chorus] or [Verse]" },
            lines: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["sectionName", "lines"]
        }
      }
    },
    required: ["title", "sections"]
  };

  const complexity = generationSettings?.complexity || "Poetic";
  const rhymeScheme = generationSettings?.rhymeScheme || "AABB (Couplet)";
  const rhymeInstruction = getRhymeDescription(rhymeScheme);

  const prompt = `
    INPUT LYRICS (DRAFT):
    ${draftLyrics}

    ORIGINAL CONTEXT:
    ${originalContext}

    TARGET LANGUAGE: ${languageProfile.primary}
    REQUESTED COMPLEXITY: ${complexity}
    REQUESTED RHYME SCHEME: ${rhymeScheme}

    ROLE: You are a strict "Sahitya Pundit" (Literary Expert). Your job is to fix errors, not to compliment the writer.

    TASK:
    1. **SCRIPT AUDIT (HIGHEST PRIORITY):**
       - **REJECT** any lines written in English/Roman script (Transliteration) like "Nenu vastunnanu".
       - **CONVERT** them immediately to Native Script: "నేను వస్తున్నాను".
       - The final output must contain 0% Roman characters in the lyrics lines.

    2. **RHYME & PRASA REPAIR:**
       - **TARGET SCHEME:** ${rhymeScheme} (${rhymeInstruction})
       - Check the "Anthya Prasa" (End Rhyme) of every matching line.
       - If they do not rhyme phonetically, **REWRITE** the line to force a rhyme while keeping the meaning.
       - Do not allow weak rhymes.

    3. **STRUCTURE & FORMATTING:**
       - Ensure standardized English tags: [Chorus], [Verse 1], [Bridge].
       - Remove any metadata lines inside the sections.
       - Ensure the song is complete (Intro to Outro).
    
    4. **COMPLEXITY CHECK:**
       - If "Simple": Remove archaic/Grandhika words.
       - If "Poetic": Ensure metaphors are logical.

    5. **PUNCTUATION & EXPRESSION FIX:**
       - Scan the draft. If lines end without punctuation, ADD IT based on the mood.
       - Use '!' for intensity, ',' for flow, '?' for questions, '...' for pauses.
       - Ensure the lyrics look like poetry, not just text.

    6. **NO SPOKEN WORD:**
       - If detected, remove any [Spoken Word], [Dialogue], or [Narration] sections.
       - Convert them to melodic verses or remove them entirely.

    Return the COMPLETE, CORRECTED version in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_REVIEW,
        responseMimeType: "application/json",
        responseSchema: lyricsSchema,
        temperature: 0.3, // Very low temperature for strict adherence
      }
    });

    if (response.text) {
      const data = cleanAndParseJSON<GeneratedLyrics>(response.text);
      return formatLyricsForDisplay(data);
    }

    return draftLyrics; // Return original if review fails

  } catch (error) {
    console.error("Review Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    console.warn("Review failed, returning draft lyrics");
    return draftLyrics;
  }
};
