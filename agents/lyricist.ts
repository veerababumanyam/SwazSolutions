
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_LYRICIST } from "./config";
import { GeneratedLyrics, LanguageProfile, EmotionAnalysis, GenerationSettings } from "./types";
import { cleanAndParseJSON, formatLyricsForDisplay, wrapGenAIError, retryWithBackoff } from "../utils";
import { SCENARIO_KNOWLEDGE_BASE, INDIAN_LANGUAGES } from "./constants";

const getRhymeDescription = (scheme: string): string => {
  if (scheme.startsWith("AABB")) return "Couplets. Line 1 rhymes with 2. Line 3 rhymes with 4. (e.g., aa-ta, paa-ta)";
  if (scheme.startsWith("ABAB")) return "Alternate rhyme. Line 1 rhymes with 3. Line 2 rhymes with 4.";
  if (scheme.startsWith("ABCB")) return "Ballad style. Line 2 rhymes with 4. Lines 1 and 3 do not need to rhyme.";
  if (scheme.startsWith("AABA")) return "Rubaiyat style. Lines 1, 2, and 4 must rhyme. Line 3 is unrhymed.";
  if (scheme.startsWith("ABBA")) return "Enclosed rhyme. Line 1 rhymes with 4. Line 2 rhymes with 3.";
  if (scheme.startsWith("AAAA")) return "Monorhyme. Every single line in the stanza must end with the same sound/rhyme.";
  if (scheme.startsWith("AABCCB")) return "Sestet. Line 1 rhymes with 2. Line 4 rhymes with 5. Line 3 rhymes with 6.";
  if (scheme.startsWith("Terza")) return "Chained rhyme (ABA BCB CDC). Line 2 of stanza 1 rhymes with Lines 1 & 3 of stanza 2.";
  if (scheme.startsWith("Limerick")) return "AABBA. Lines 1, 2, and 5 rhyme (usually longer). Lines 3 and 4 rhyme (usually shorter).";
  if (scheme === "Free Verse") return "No strict rhyme required. Focus entirely on rhythm, flow, and emotional expression.";
  
  return "Ensure consistent end rhymes (Anthya Prasa) for all couplets.";
};

export const runLyricistAgent = async (
  researchData: string,
  userRequest: string,
  languageProfile: LanguageProfile,
  emotionData: EmotionAnalysis | undefined,
  generationSettings: GenerationSettings, // Now strictly typed as required
  apiKey: string,
  selectedModel: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const lyricsSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Format: 'Native Title'. Title should be in Native Script."
      },
      language: { type: Type.STRING, description: "Description of the language mix used" },
      ragam: { type: Type.STRING, description: "Suggested Carnatic/Hindustani Raagam (or Scale/Mode for Western)" },
      taalam: { type: Type.STRING, description: "Suggested Time Signature or Beat" },
      structure: { type: Type.STRING, description: "Structure Overview (e.g., Intro-V1-C-V2-C-Br-V3-C-Outro)" },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sectionName: { type: Type.STRING, description: "STRICTLY ENGLISH TAGS IN SQUARE BRACKETS: [Chorus], [Verse 1], [Verse 2], [Verse 3], [Bridge], [Intro], [Outro]." },
            lines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `The lyrics lines written STRICTLY in the ${languageProfile.primary} native script/orthography.`
            }
          },
          required: ["sectionName", "lines"]
        }
      }
    },
    required: ["title", "language", "ragam", "taalam", "sections"]
  };

  // --- LANGUAGE LOGIC ---
  const isMixed = languageProfile.primary !== languageProfile.secondary || languageProfile.primary !== languageProfile.tertiary;
  const isIndian = INDIAN_LANGUAGES.includes(languageProfile.primary);

  let languageInstruction = `PRIMARY LANGUAGE: "${languageProfile.primary}".`;

  // Script Enforcement
  if (isIndian) {
    languageInstruction += `\n    CRITICAL: Write the lyrics content STRICTLY in ${languageProfile.primary} NATIVE SCRIPT.
      DO NOT USE ROMAN/LATIN CHARACTERS FOR LYRICS (No Transliteration like "Nenu").`;
  } else {
    languageInstruction += `\n    CRITICAL: Write the lyrics in standard ${languageProfile.primary} script and orthography.`;
  }

  // Mixing & Rhyme Logic
  if (isMixed) {
    const secondary = languageProfile.secondary !== languageProfile.primary ? languageProfile.secondary : null;
    const tertiary = languageProfile.tertiary !== languageProfile.primary ? languageProfile.tertiary : null;
    const mixedLangs = [secondary, tertiary].filter(Boolean).join(" and ");

    languageInstruction += `\n    **FUSION MODE ACTIVATED**: The user has explicitly requested a mix of ${languageProfile.primary} with ${mixedLangs}.
    - **Dominance:** Keep approx 80-90% of the lyrics in the Primary Language (${languageProfile.primary}).
    - **Intelligent Mixing:** You are permitted to borrow words or short phrases from ${mixedLangs} IF AND ONLY IF:
      1. It matches the colloquial style (e.g., Tanglish, Hinglish, Spanglish).
      2. **CRITICAL:** It helps you achieve a perfect **Anthya Prasa (End Rhyme)** that would be difficult or impossible using only pure ${languageProfile.primary} words.
    - **Formatting:** If borrowing a word, transliterate it into the ${languageProfile.primary} script so the singer can read it flowingly.`;
  } else {
    languageInstruction += `\n    **PURE MODE ACTIVATED**: All language slots are set to ${languageProfile.primary}.
    - **Strict Rule:** You must write PURE ${languageProfile.primary}.
    - **Prohibited:** Do NOT use English words or words from other languages, even if they are common. Use pure vocabulary.
    - **Rhyme Strategy:** You must find rhymes strictly within the ${languageProfile.primary} lexicon.`;
  }

  // Settings are already resolved by Orchestrator (Auto-Detect logic handled there)
  const theme = generationSettings.theme;
  const mood = generationSettings.mood;
  const style = generationSettings.style;
  const complexity = generationSettings.complexity;
  const rhymeScheme = generationSettings.rhymeScheme;
  const singerConfig = generationSettings.singerConfig;

  // --- SCENARIO CONTEXT INJECTION ---
  let scenarioInstruction = "";
  if (generationSettings?.ceremony && generationSettings.ceremony !== "None") {
    // Find the scenario definition in the Knowledge Base
    let foundScenario = null;
    for (const cat of SCENARIO_KNOWLEDGE_BASE) {
      const hit = cat.events.find(e => e.id === generationSettings.ceremony);
      if (hit) {
        foundScenario = hit;
        break;
      }
    }

    if (foundScenario) {
      scenarioInstruction = `
      *** SCENARIO / CONTEXT INSTRUCTION (CRITICAL) ***
      SCENARIO: ${foundScenario.label}
      ${foundScenario.promptContext}
      
      INSTRUCTION: The song MUST explicitly reference the emotions, metaphors, and cultural tropes described above.
      Do not write a generic ${theme} song. Write a specific song for ${foundScenario.label}.
      `;
    }
  }

  const rhymeInstruction = getRhymeDescription(rhymeScheme);

  // Define explicit complexity instructions
  const complexityInstructions: Record<string, string> = {
    "Simple": "STRICTLY use colloquial, everyday conversational language. Avoid archaic words. Keep it catchy and simple to sing.",
    "Poetic": "Use standard literary style with beautiful metaphors and flow.",
    "Complex": "Use high vocabulary, complex metaphors, and deep concepts."
  };

  const specificComplexityInstruction = complexityInstructions[complexity] || complexityInstructions["Poetic"];

  const prompt = `
    USER REQUEST: "${userRequest}"
    
    *** LANGUAGE INSTRUCTION (CRITICAL) ***
    ${languageInstruction}
    - **OUTPUT SCRIPT:** The lyrics text must be in ${languageProfile.primary} native script.
    - **NO ENGLISH CONTENT:** Do NOT write the lyrics in English/Roman Script (unless English is the requested language). Only the tags like [Chorus] are English.
    - **NO TRANSLATION:** Do not provide English translations in the JSON output lines.
    - **NO SPOKEN WORD:** Do not generate sections marked as spoken, dialogue, or narration. All lines must be sung.
    
    STRICT CONFIGURATION:
    - Theme: ${theme}
    - Mood: ${mood}
    - Musical Style: ${style}
    - Lyrical Complexity Level: ${complexity}
    - SINGER CONFIGURATION: ${singerConfig}
    - RHYME SCHEME: ${rhymeScheme}
    
    ${scenarioInstruction}

    *** COMPLEXITY INSTRUCTION (${complexity}): ***
    ${specificComplexityInstruction}

    *** RHYME & PRASA INSTRUCTION (CRITICAL): ***
    - **SELECTED SCHEME:** ${rhymeScheme}
    - **PATTERN DEFINITION:** ${rhymeInstruction}
    - You MUST maintain **ANTHYA PRASA** (End Rhyme) strictly according to the pattern above.
    - The last words/syllables of the matching lines MUST sound similar phonetically.
    - If in Fusion Mode, use secondary language words if needed to force a rhyme.

    *** PUNCTUATION & EXPRESSION (MANDATORY): ***
    - Add punctuation (comma, exclamation, question mark) to the end of every line to convey the singing expression.
    - Do not produce "flat" text.
    - Use '!' for intensity, ',' for flow, '?' for questions.
    
    EMOTIONAL ANALYSIS:
    - Navarasa: ${emotionData?.navarasa || 'N/A'}
    - Intensity: ${emotionData?.intensity || 5}/10

    RESEARCH CONTEXT:
    ${researchData}

    TASK:
    Compose a high-fidelity song.
    
    *** THINKING PROCESS INSTRUCTION ***
    Before generating the JSON:
    1. Plan the **Maatra (Meter)**: Ensure lines have a singable rhythm.
    2. Plan the **Prasa (Rhymes)**: List out rhyming words for ${languageProfile.primary} that fit the ${mood} context.
    3. Draft the verses mentally to ensure the rhyme scheme ${rhymeScheme} is perfectly met.
    4. **Add Expression**: Decide where to place '!', '?', and ',' to control the singing dynamic.

    MANDATORY STRUCTURAL BLUEPRINT (DO NOT DEVIATE):
    1. **[Intro]**: Include humming, alaap, or atmospheric sounds.
    2. **[Verse 1]**: First stanza.
    3. **[Chorus]**: Main Hook.
    4. **[Verse 2]**: Second stanza (progression).
    5. **[Chorus]**: Main Hook (Repeat).
    6. **[Bridge]**: Emotional/Tempo shift.
    7. **[Verse 3]**: Third stanza (Climax).
    8. **[Chorus]**: Main Hook (Final Repeat).
    9. **[Outro]**: Fading out, humming.

    Output strictly in JSON format matching the schema.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_LYRICIST,
            responseMimeType: "application/json",
            responseSchema: lyricsSchema,
            temperature: 0.85,
          }
        });

        if (!result.text) {
          throw new Error("No response text from lyricist agent");
        }
        return result;
      },
      2,
      1000
    );

    const data = cleanAndParseJSON<GeneratedLyrics>(response.text);
    return formatLyricsForDisplay(data);

  } catch (error) {
    console.error("Lyricist Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
