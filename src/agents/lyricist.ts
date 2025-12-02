import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_LYRICIST, AGENT_TEMPERATURES, AGENT_TOP_P, SAFETY_SETTINGS } from "./config";
import { GeneratedLyrics, LanguageProfile, EmotionAnalysis, GenerationSettings } from "./types";
import { cleanAndParseJSON, formatLyricsForDisplay, wrapGenAIError, retryWithBackoff } from "../utils/helpers";
import { SCENARIO_KNOWLEDGE_BASE, INDIAN_LANGUAGES } from "./constants";

const getRhymeDescription = (scheme: string): string => {
  // Basic Patterns
  if (scheme.includes("AABB") || scheme.includes("Couplet")) return "Couplets (AABB). Line 1 rhymes with 2. Line 3 rhymes with 4. Perfect for catchy hooks. (e.g., aa-ta, paa-ta)";
  if (scheme.includes("ABAB") || scheme.includes("Alternate")) return "Alternate rhyme (ABAB). Line 1 rhymes with 3. Line 2 rhymes with 4. Creates musical flow.";
  if (scheme.includes("ABCB") || scheme.includes("Ballad")) return "Ballad style (ABCB). Only Line 2 and 4 rhyme. Lines 1 and 3 are free. Good for storytelling.";
  if (scheme.includes("ABBA") || scheme.includes("Enclosed")) return "Enclosed rhyme (ABBA). Line 1 rhymes with 4. Line 2 rhymes with 3. Creates symmetry.";
  if (scheme.includes("AAAA") || scheme.includes("Monorhyme")) return "Monorhyme (AAAA). Every single line must end with the same sound/rhyme. Hypnotic effect.";

  // Complex Western
  if (scheme.includes("AABA") || scheme.includes("Rubaiyat")) return "Rubaiyat style (AABA). Lines 1, 2, and 4 must rhyme. Line 3 is unrhymed. Persian origin.";
  if (scheme.includes("AABCCB") || scheme.includes("Sestet")) return "Sestet (AABCCB). Line 1-2 rhyme, 4-5 rhyme, 3-6 rhyme. Six-line stanza.";
  if (scheme.includes("ABABCC") || scheme.includes("Shakespearean Tail")) return "Shakespearean tail (ABABCC). Alternate rhyme + couplet ending. Strong closure.";
  if (scheme.includes("ABABBCC") || scheme.includes("Rhyme Royal")) return "Rhyme Royal (ABABBCC). Seven-line stanza with concluding couplet. Regal feel.";
  if (scheme.includes("ABABCDCD") || scheme.includes("Ottava Rima")) return "Ottava Rima style (ABABCDCD). Eight-line stanza, two quatrains. Epic narrative.";
  if (scheme.includes("Terza")) return "Terza Rima (ABA BCB CDC). Chained rhyme linking stanzas. Line 2 of stanza 1 rhymes with Lines 1 & 3 of stanza 2.";
  if (scheme.includes("Limerick")) return "Limerick (AABBA). Lines 1, 2, 5 rhyme (long). Lines 3, 4 rhyme (short). Humorous rhythm.";
  if (scheme.includes("Villanelle")) return "Villanelle. Complex repeating pattern with two refrains. 19 lines, ABA rhyme scheme with repeating lines.";
  if (scheme.includes("Sonnet")) return "Sonnet (14 lines). Three quatrains + couplet: ABAB CDCD EFEF GG. Shakespearean structure with volta.";

  // Indian Classical
  if (scheme.includes("Sanskrit") || scheme.includes("Sloka") || scheme.includes("Anushtubh")) return "Sanskrit Slokas (Anushtubh). 8 syllables per quarter verse. Traditional Vedic meter for devotional content. Maintain chandas (prosody).";
  if (scheme.includes("Doha")) return "Doha (Hindi Couplet). Two-line stanza with internal caesura. 13+11 matra pattern. Sant tradition.";
  if (scheme.includes("Chaupai")) return "Chaupai (AABB Quatrain). Four-line verse with couplet rhyme. Used in Ramcharitmanas. 16 matra per line.";
  if (scheme.includes("Kavita") || scheme.includes("Muktaka")) return "Muktaka (Free-standing verse). Each stanza is complete thought. No mandatory rhyme linking stanzas.";
  if (scheme.includes("Ghazal")) return "Ghazal (AA BA CA DA...). First couplet rhymes both lines (AA). Then only second line rhymes (BA, CA). Radif and qaafiya.";
  if (scheme.includes("Bhajan")) return "Bhajan pattern. Devotional repeat structure. Simple AABB with chorus refrain. Call-response format.";

  // Song Structures
  if (scheme.includes("Verse-Chorus")) return "Verse-Chorus structure. Verses (AABB) alternate with chorus (CCDD). Chorus repeats identically.";
  if (scheme.includes("Call-Response")) return "Call-Response (ABAB). First line is 'call', second is 'response'. Interactive singing pattern.";
  if (scheme.includes("Pallavi") || scheme.includes("Charanam")) return "Pallavi-Charanam (Carnatic). Pallavi = refrain/chorus. Charanam = verses. Pallavi repeats after each charanam.";
  if (scheme.includes("Sthayi") || scheme.includes("Antara")) return "Sthayi-Antara (Hindustani). Sthayi = lower octave refrain. Antara = higher octave verse. Classical structure.";
  if (scheme.includes("Hip-Hop Flow")) return "Hip-Hop internal rhymes. Multiple rhymes within single line, not just end rhymes. Focus on flow and rhythm.";
  if (scheme.includes("Rap Multi")) return "Rap Multisyllabic rhymes. Multiple syllable rhymes: 'education / revelation'. Complex wordplay and internal rhyming.";

  // Modern
  if (scheme.includes("Free Verse") || scheme.includes("No Rhyme")) return "Free Verse. No strict rhyme scheme required. Focus entirely on rhythm, flow, imagery, and emotional expression.";
  if (scheme.includes("Blank Verse")) return "Blank Verse. Unrhymed but maintains iambic pentameter. Dignified, speech-like quality.";
  if (scheme.includes("Slant Rhyme")) return "Slant/Near rhymes. Words sound similar but don't perfectly rhyme (road/load vs road/rude). Modern, subtle.";
  if (scheme.includes("Internal Rhyme")) return "Internal rhymes. Rhymes occur within lines, not just at ends. Creates dense sonic texture.";
  if (scheme.includes("Chain Rhyme")) return "Chain rhyme linking stanzas. Last word of one stanza rhymes with first of next. Continuity.";

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

  // Log received settings to verify data flow
  console.log('🎵 Lyricist Agent - Received Settings:', {
    ceremony: generationSettings.ceremony,
    category: generationSettings.category,
    mood: generationSettings.mood,
    style: generationSettings.style,
    theme: generationSettings.theme,
    rhymeScheme: generationSettings.rhymeScheme,
    singerConfig: generationSettings.singerConfig,
    complexity: generationSettings.complexity
  });

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

  // ANTI-HALLUCINATION: Language Validation Rules
  const antiHallucinationRules = `
    *** ANTI-HALLUCINATION LANGUAGE VALIDATION (CRITICAL) ***
    YOU MUST FOLLOW THESE RULES TO PREVENT NONSENSICAL OUTPUT:
    
    1. **REAL WORDS ONLY**: Every single word you write MUST exist in the real ${languageProfile.primary} language dictionary.
       - ❌ NO invented words, NO gibberish, NO nonsensical combinations
       - ✅ Only authentic, verifiable words that a native speaker would recognize
    
    2. **GRAMMATICAL CORRECTNESS**: Maintain proper grammar in ${languageProfile.primary}
       - ❌ Do NOT mix grammar rules from different languages
       - ✅ Use correct sentence structure, verb conjugations, and word order for ${languageProfile.primary}
    
    3. **PHONETIC VALIDITY**: All words must be phonetically pronounceable in ${languageProfile.primary}
       - ❌ No unpronounceable character combinations
       - ✅ Natural syllable patterns that flow when spoken/sung
    
    4. **CONTEXT APPROPRIATENESS**: Words must fit the cultural and emotional context
       - Use vocabulary appropriate to the ${languageProfile.primary} culture
       - Match register (formal vs colloquial) to the song style
  `;

  // Script Enforcement
  if (isIndian) {
    languageInstruction += `\n    CRITICAL: Write the lyrics content STRICTLY in ${languageProfile.primary} NATIVE SCRIPT.
      DO NOT USE ROMAN/LATIN CHARACTERS FOR LYRICS (No Transliteration like "Nenu").
      ${antiHallucinationRules}`;
  } else {
    languageInstruction += `\n    CRITICAL: Write the lyrics in standard ${languageProfile.primary} script and orthography.
      ${antiHallucinationRules}`;
  }

  // Mixing & Rhyme Logic
  if (isMixed) {
    const secondary = languageProfile.secondary !== languageProfile.primary ? languageProfile.secondary : null;
    const tertiary = languageProfile.tertiary !== languageProfile.primary ? languageProfile.tertiary : null;
    const mixedLangs = [secondary, tertiary].filter(Boolean).join(" and ");

    languageInstruction += `\n    **FUSION MODE ACTIVATED**: The user has explicitly requested a mix of ${languageProfile.primary} with ${mixedLangs}.
    - **Dominance:** Keep approx 70-80% of the lyrics in the Primary Language (${languageProfile.primary}).
    - **Intelligent Mixing:** You are permitted to borrow words or short phrases from ${mixedLangs} IF AND ONLY IF:
      1. It matches the colloquial style (e.g., Tanglish, Hinglish, Spanglish).
      2. **CRITICAL:** It helps you achieve a perfect **Anthya Prasa (End Rhyme)** that would be difficult or impossible using only pure ${languageProfile.primary} words.
      3. **CODE-SWITCHING RULES:**
         - Switch at natural phrase boundaries (e.g., after a complete thought)
         - ❌ NEVER mix mid-word (e.g., "love-u" is FORBIDDEN unless it's intentional modern slang)
         - ✅ Switch entire words or phrases cleanly
         - Ensure both languages maintain grammatical correctness
    - **Formatting:** If borrowing a word, transliterate it into the ${languageProfile.primary} script so the singer can read it flowingly.
    - **VALIDATION:** After composing, mentally verify that EVERY word is either valid ${languageProfile.primary} OR valid ${mixedLangs}.`;
  } else {
    languageInstruction += `\n    **PURE MODE ACTIVATED**: All language slots are set to ${languageProfile.primary}.
    - **Strict Rule:** You must write PURE ${languageProfile.primary}.
    - **Prohibited:** Do NOT use English words or words from other languages, even if they are common. Use pure vocabulary.
    - **Rhyme Strategy:** You must find rhymes strictly within the ${languageProfile.primary} lexicon.
    - **VALIDATION:** After composing, verify that EVERY word is authentic ${languageProfile.primary}.`;
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

    *** RHYME & PRASA INSTRUCTION (MANDATORY - HIGHEST PRIORITY): ***
    - **SELECTED SCHEME:** ${rhymeScheme}
    - **PATTERN DEFINITION:** ${rhymeInstruction}
    
    **CRITICAL RHYME ENFORCEMENT RULES:**
    1. **MANDATORY COMPLIANCE**: The rhyme scheme ${rhymeScheme} is NOT optional - it is MANDATORY for EVERY verse
    2. **END RHYME VERIFICATION**: After composing EACH verse, verify that:
       - The last syllable/word of each line matches the pattern
       - Phonetic endings are identical or very similar (e.g., -ആം/-aam, -లో/-lo)
       - Natural pronunciation produces the rhyme sound
    
    3. **RHYME QUALITY HIERARCHY** (in order of preference):
       a) Perfect Rhyme: Identical ending sounds (highest priority)
       b) Near Rhyme: Similar but not identical sounds (acceptable if natural)
       c) Forced Rhyme: Grammatically awkward but rhymes (use only if necessary)
       d) NO RHYME: Completely FORBIDDEN - NEVER produce non-rhyming lines where rhyme is required
    
    4. **CROSS-LANGUAGE RHYMING** (if in Fusion Mode):
       - You MAY use words from ${languageProfile.secondary} to achieve perfect rhymes
       - Example: In Tanglish, "காதல் + fall" or "மனசு + miss" are acceptable end rhymes
       - But ensure the borrowed word fits the context naturally
    
    5. **RHYME VERIFICATION CHECKLIST** (mentally verify before finalizing):
       - [ ] Did I count the rhyme pattern correctly (A-B-A-B or A-A-B-B, etc.)?
       - [ ] Do the ending sounds actually match when spoken aloud?
       - [ ] Are the rhymes natural, not forced?
       - [ ] Did I maintain ${rhymeScheme} pattern throughout ALL verses/choruses?
    
    **SPECIAL NOTE: If the user did NOT specify a rhyme scheme, use AABB (Couplets) as the MANDATORY DEFAULT.**

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

    DYNAMIC STRUCTURAL GUIDELINES (FLEXIBLE BUT MANDATORY COMPONENTS):
    You have full creative freedom to arrange the song structure to best suit the content, emotion, and flow.
    However, you MUST include the following components in your arrangement (order is up to you, but make it musical):
    
    REQUIRED COMPONENTS (Checklist):
    - [ ] Intro (x1)
    - [ ] Verse (x3)
    - [ ] Chorus (x3)
    - [ ] Bridge (x1)
    - [ ] Outro (x1)

    INSTRUCTION:
    - Analyze the user request and emotion.
    - Design a structure that maximizes impact (e.g., maybe start with a Chorus? maybe double verses? maybe a long outro?).
    - Ensure all required components listed above are present in your final JSON.
    - You can add extra short sections (like Pre-Chorus or Interlude) if it enhances the song.

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
            temperature: AGENT_TEMPERATURES.LYRICIST,
            topP: AGENT_TOP_P.LYRICIST,
            topK: 40,
            safetySettings: SAFETY_SETTINGS as any
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
