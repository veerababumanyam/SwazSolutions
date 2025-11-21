
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_REVIEW, AGENT_TEMPERATURES, AGENT_TOP_P } from "./config";
import { GeneratedLyrics, LanguageProfile, GenerationSettings } from "./types";
import { cleanAndParseJSON, formatLyricsForDisplay } from "../utils";

const getRhymeDescription = (scheme: string): string => {
  if (scheme.includes("AABB") || scheme.includes("Couplet")) return "Couplets (AABB). Line 1-2 rhyme, 3-4 rhyme.";
  if (scheme.includes("ABAB") || scheme.includes("Alternate")) return "Alternate (ABAB). Line 1-3 rhyme, 2-4 rhyme.";
  if (scheme.includes("ABCB") || scheme.includes("Ballad")) return "Ballad (ABCB). Only line 2-4 rhyme.";
  if (scheme.includes("ABBA") || scheme.includes("Enclosed")) return "Enclosed (ABBA). Line 1-4, 2-3 rhyme.";
  if (scheme.includes("AAAA") || scheme.includes("Monorhyme")) return "Monorhyme (AAAA). All lines same rhyme.";
  if (scheme.includes("AABA") || scheme.includes("Rubaiyat")) return "Rubaiyat (AABA). Lines 1,2,4 rhyme.";
  if (scheme.includes("AABCCB") || scheme.includes("Sestet")) return "Sestet (AABCCB). Complex 6-line.";
  if (scheme.includes("Terza")) return "Terza Rima (ABA BCB). Chain linking.";
  if (scheme.includes("Limerick")) return "Limerick (AABBA). Humorous pattern.";
  if (scheme.includes("Sonnet")) return "Sonnet (14 lines). ABAB CDCD EFEF GG structure.";
  if (scheme.includes("Sanskrit") || scheme.includes("Sloka") || scheme.includes("Doha") || scheme.includes("Chaupai")) return "Indian classical meter. Follow traditional syllable count and rhyme.";
  if (scheme.includes("Ghazal")) return "Ghazal (AA BA CA). First couplet both lines rhyme, then only second lines.";
  if (scheme.includes("Pallavi") || scheme.includes("Sthayi")) return "Classical song structure. Refrain + verses.";
  if (scheme.includes("Hip-Hop") || scheme.includes("Rap")) return "Internal rhymes and flow. Multiple rhymes per line.";
  if (scheme.includes("Free Verse") || scheme.includes("No Rhyme") || scheme.includes("Blank")) return "Free verse. No strict rhyme. Focus on rhythm.";
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
        temperature: AGENT_TEMPERATURES.REVIEW,
        // maxOutputTokens removed to allow dynamic length
        topP: AGENT_TOP_P.REVIEW,
        topK: 40
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
