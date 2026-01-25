import { GoogleGenAI, Type } from "@google/genai";
import {
  SYSTEM_INSTRUCTION_MAGIC_RHYME_OPTIMIZER,
  getModelToUse,
  AGENT_TEMPERATURES,
  AGENT_TOP_P,
  MODEL_FAST
} from "./config";
import {
  MagicRhymeOptimization,
  EmotionAnalysis,
  GenerationSettings,
  LanguageProfile,
  RhymeSuggestions,
  MelodyAnalysis
} from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { LANGUAGE_METADATA } from "./constants";

/**
 * MAGIC RHYME OPTIMIZER AGENT - Agent #8 in the 14-Agent System
 * Core Responsibility: Advanced phonetic optimization and musicality enhancement
 *
 * This agent specializes in:
 * - Phonetic flow analysis and syllable stress optimization
 * - Multi-syllabic and mosaic rhyme upgrades
 * - Assonance, consonance, and alliteration patterns
 * - Melodic contour alignment for rhymes
 * - Syllable balancing for rhythmic consistency
 * - Cross-language phonetic bridging (fusion mode)
 *
 * Runs after Rhyme Master in Phase 3.5 to enhance rhyme quality
 * Uses outputs from Melody Agent and Rhyme Master for optimization
 */
export const runMagicRhymeOptimizerAgent = async (
  userRequest: string,
  emotionData: EmotionAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  rhymeSuggestions: RhymeSuggestions,
  melodyAnalysis: MelodyAnalysis,
  apiKey: string,
  selectedModel?: string
): Promise<MagicRhymeOptimization> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const optimizationSchema = {
    type: Type.OBJECT,
    properties: {
      enhancedRhymes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Upgraded rhyme pairs with multi-syllabic patterns"
      },
      phoneticPatterns: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Assonance and consonance patterns for internal flow"
      },
      syllableOptimization: {
        type: Type.OBJECT,
        description: "Syllable count recommendations per line for rhythmic consistency"
      },
      alliterationSuggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Alliterative phrases to enhance memorability"
      },
      melodicAlignment: {
        type: Type.STRING,
        description: "How rhymes should align with melodic contour"
      },
      flowScore: {
        type: Type.NUMBER,
        description: "Overall phonetic flow score (1-10)"
      },
      optimizationNotes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Specific optimization recommendations for the lyricist"
      }
    },
    required: [
      "enhancedRhymes",
      "phoneticPatterns",
      "syllableOptimization",
      "alliterationSuggestions",
      "melodicAlignment",
      "flowScore",
      "optimizationNotes"
    ]
  };

  // Get language-specific phonetic information
  const langMetadata = LANGUAGE_METADATA[languageProfile.primary];
  const poeticTraditions = langMetadata?.poeticTraditions?.join(", ") || "General";

  // Check if fusion mode
  const isFusion = languageProfile.primary !== languageProfile.secondary;
  const fusionNote = isFusion
    ? `FUSION MODE: Optimize phonetic bridges between ${languageProfile.primary} and ${languageProfile.secondary}. Create smooth sound transitions across languages.`
    : `PURE MODE: All phonetic patterns must be in ${languageProfile.primary} only.`;

  // Extract rhyme context from Rhyme Master output
  const primaryRhymesContext = rhymeSuggestions.primaryRhymes?.slice(0, 10).join(", ") || "No rhymes provided";
  const alternateRhymesContext = rhymeSuggestions.alternateRhymes?.slice(0, 5).join(", ") || "None";
  const internalRhymesContext = rhymeSuggestions.internalRhymes?.join(", ") || "None";

  // Extract melody context
  const melodyContext = `Tempo: ${melodyAnalysis.suggestedTempo}, Meter: ${melodyAnalysis.suggestedMeter}, Pattern: ${melodyAnalysis.rhythmicPattern}, Contour: ${melodyAnalysis.melodicContour}`;

  const prompt = `
    USER REQUEST: "${userRequest}"

    EMOTIONAL CONTEXT:
    - Navarasa: ${emotionData.navarasa}
    - Mood: ${generationSettings.mood}
    - Theme: ${generationSettings.theme}
    - Intensity: ${emotionData.intensity}/10
    - Vibe: ${emotionData.vibeDescription}

    LANGUAGE CONFIGURATION:
    - Primary: ${languageProfile.primary}
    - Secondary: ${languageProfile.secondary}
    - Script: ${langMetadata?.script || "Unknown"}
    - Unicode Range: ${langMetadata?.unicodeRange || "N/A"}
    - Poetic Traditions: ${poeticTraditions}

    ${fusionNote}

    RHYME MASTER OUTPUT (foundation to optimize):
    - Primary Rhymes: ${primaryRhymesContext}
    - Alternate Rhymes: ${alternateRhymesContext}
    - Internal Rhymes: ${internalRhymesContext}
    - Rhyme Scheme: ${generationSettings.rhymeScheme}
    - Scheme Valid: ${rhymeSuggestions.schemeValidation ? "Yes" : "No"}

    MELODY ANALYSIS (align phonetics with music):
    ${melodyContext}
    - Musical Notes: ${melodyAnalysis.musicalNotes}

    SINGER CONFIGURATION: ${generationSettings.singerConfig}
    COMPLEXITY LEVEL: ${generationSettings.complexity}

    TASK: Optimize the rhyme scheme and phonetic patterns for maximum musicality and flow.

    REQUIREMENTS:

    1. **ENHANCED RHYMES** (10-15 upgraded pairs):
       - Take basic rhymes from Rhyme Master and UPGRADE them
       - Add multi-syllabic rhyming patterns (e.g., "celebration ↔ education")
       - Include mosaic rhymes where multiple words rhyme: "love you ↔ above you"
       - Create compound rhymes where end sounds and internal sounds echo
       - Format: "word1/phrase1 ↔ word2/phrase2 (type: multi-syllabic/mosaic/compound)"
       - ALL rhymes must be in ${langMetadata?.script || languageProfile.primary} script for Indian languages

    2. **PHONETIC PATTERNS** (8-12 patterns for lyrical flow):
       - ASSONANCE: Repeated vowel sounds within lines (e.g., "fleet feet sweep the street")
       - CONSONANCE: Repeated consonant sounds (e.g., "pitter patter of little feet")
       - VOWEL HARMONY: Plan for open vowels (a, e, i, o, u) on sustained/high notes
       - SIBILANCE: S-sounds for gentle/romantic themes
       - Format: "Pattern Type: Example phrase in ${languageProfile.primary}"

    3. **SYLLABLE OPTIMIZATION**:
       - Recommend syllable counts per section type (verse/chorus/bridge)
       - Ensure consistency for rhythmic flow
       - Align with ${melodyAnalysis.suggestedMeter} meter
       - Consider ${melodyAnalysis.suggestedTempo} tempo (faster = shorter lines)
       - Output format: { "verse": "8-10 syllables", "chorus": "6-8 syllables", "bridge": "4-6 syllables" }

    4. **ALLITERATION SUGGESTIONS** (6-10 phrases):
       - Create catchy alliterative phrases for hooks/emphasis points
       - MUST be in ${langMetadata?.script || languageProfile.primary} script
       - Align with ${generationSettings.theme} theme and ${generationSettings.mood} mood
       - Consider emotional intensity (${emotionData.intensity}/10)

    5. **MELODIC ALIGNMENT** (comprehensive guidance):
       - Explain WHERE rhymes should fall relative to melodic peaks/troughs
       - Consider ${melodyAnalysis.suggestedTempo} tempo for stress placement
       - Guide stressed syllable placement on downbeats
       - Suggest unstressed syllables for pickups/off-beats
       - Consider the ${melodyAnalysis.melodicContour} melodic contour

    6. **FLOW SCORE** (1-10):
       - Rate the overall phonetic flow POTENTIAL after optimization
       - Consider: singability, natural pronunciation, emotional resonance
       - Higher intensity (${emotionData.intensity}) = stronger, punchier sounds
       - Lower intensity = smoother, flowing sounds

    7. **OPTIMIZATION NOTES** (5-8 specific tips):
       - Which phonetic patterns work best for ${languageProfile.primary}
       - Tongue-twister pitfalls to AVOID
       - Fusion optimization tips (if applicable)
       - ${generationSettings.singerConfig}-specific considerations
       - Complexity-appropriate vocabulary guidance

    PHONETIC OPTIMIZATION PRINCIPLES:
    - **SINGABILITY**: Prioritize open vowels (a, e, i, o, u) for sustained/high notes
    - **PHONETIC DENSITY**: Balance consonant clusters - avoid tongue-twisters before climax notes
    - **STRESS ALIGNMENT**: Match natural word stress with rhythmic beats
    - **EUPHONY**: Create pleasant sound combinations, avoid harsh juxtapositions
    - **LANGUAGE AUTHENTICITY**: Respect ${languageProfile.primary} phonetic rules strictly
    - **MELODIC FIT**: Rhymes should ENHANCE, never fight, the melody
    - **EMOTIONAL SOUND**: Use harder consonants (k, t, p) for energy, softer (l, m, n) for gentleness

    LANGUAGE-SPECIFIC CONSIDERATIONS:
    - For Indian languages: Consider MATRA counts, not just syllables
    - For tonal languages: Respect pitch patterns
    - For highly inflected languages: Optimize verb/noun endings carefully
    - For fusion: Create smooth phonetic TRANSITIONS between languages
    - For ${languageProfile.primary}: ${langMetadata?.formatGuidelines || "Follow standard conventions"}

    CRITICAL RULES:
    - ALL suggestions must be REAL ${languageProfile.primary} words/patterns
    - Optimize for ${generationSettings.singerConfig} vocal delivery
    - ENHANCE, don't replace, the Rhyme Master's foundation
    - Consider the ${emotionData.intensity}/10 emotional intensity level
    - Native script ONLY for Indian languages (no Roman transliteration in output)

    OUTPUT: Structured JSON with advanced phonetic optimizations.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_FAST),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_MAGIC_RHYME_OPTIMIZER,
            responseMimeType: "application/json",
            responseSchema: optimizationSchema,
            temperature: AGENT_TEMPERATURES.MAGIC_RHYME_OPTIMIZER,
            topP: AGENT_TOP_P.MAGIC_RHYME_OPTIMIZER,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from magic rhyme optimizer agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<MagicRhymeOptimization>(response.text);

  } catch (error) {
    console.error("Magic Rhyme Optimizer Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
