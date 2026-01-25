import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_STRUCTURE_ARCHITECT, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST } from "./config";
import { StructureRecommendation, GenerationSettings, LanguageProfile, EmotionAnalysis, MelodyAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { SCENARIO_KNOWLEDGE_BASE } from "./constants";

/**
 * STRUCTURE ARCHITECT AGENT - Agent #12 in the 13-Agent System
 * Core Responsibility: Song structure optimization and planning
 *
 * This agent specializes in:
 * - Optimal section ordering
 * - Dynamic flow planning
 * - Section length optimization
 * - Emotional arc design
 * - Genre-specific conventions
 * - Climax point identification
 */
export const runStructureArchitectAgent = async (
  userRequest: string,
  emotionData: EmotionAnalysis,
  melodyAnalysis: MelodyAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  apiKey: string,
  selectedModel?: string
): Promise<StructureRecommendation> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const structureSchema = {
    type: Type.OBJECT,
    properties: {
      recommendedStructure: {
        type: Type.STRING,
        description: "Concise structure notation (e.g., 'I-V1-C-V2-C-B-C-O')"
      },
      sectionOrder: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Ordered list of sections with descriptors"
      },
      sectionLengths: {
        type: Type.OBJECT,
        description: "Recommended line counts per section type"
      },
      dynamicFlow: {
        type: Type.STRING,
        description: "Description of energy/dynamics throughout the song"
      },
      climaxPoint: {
        type: Type.STRING,
        description: "Where the emotional/musical peak should occur"
      }
    },
    required: ["recommendedStructure", "sectionOrder", "sectionLengths", "dynamicFlow", "climaxPoint"]
  };

  // Style-specific structure conventions
  const styleStructureGuide: Record<string, string> = {
    "Bollywood": "Intro-Verse1-Chorus-Verse2-Chorus-Bridge-Chorus-Outro. Often starts with hook tease. Dance break optional.",
    "Tollywood Mass": "Hook-Intro-Verse1-Chorus-Verse2-Chorus-Mass Interlude-Verse3-Chorus-Outro. High energy throughout.",
    "Folk": "Call-Response structure. Simple verse repetition. Minimal bridge. Communal singing feel.",
    "Classical": "Pallavi-Anupallavi-Charanam-Pallavi structure (Carnatic) or Sthayi-Antara-Sanchari-Abhog (Hindustani)",
    "Rap/Hip-Hop": "Verse1-Hook-Verse2-Hook-Bridge-Verse3-Hook. Heavy emphasis on verses. Hook is short.",
    "EDM": "Intro-Build-Drop-Break-Build-Drop-Outro. Lyrics minimal. Focus on build-drop dynamics.",
    "Pop": "Verse-PreChorus-Chorus-Verse-PreChorus-Chorus-Bridge-Chorus-Outro. Standard commercial structure.",
    "Sufi": "Repetitive structure. Long build-up. Trance-like repetition of key phrases. Gradual intensity increase.",
    "Bhajan": "Dhruva (refrain)-Charana (verse) alternation. Simple, devotional. Ends with prolonged dhruva.",
    "Rock": "Intro-Verse-Chorus-Verse-Chorus-Solo-Chorus-Outro. Guitar solo replaces bridge."
  };

  // Get ceremony context if available
  let ceremonyNote = "";
  if (generationSettings.ceremony && generationSettings.ceremony !== "None") {
    for (const category of SCENARIO_KNOWLEDGE_BASE) {
      const ceremony = category.events.find(e => e.id === generationSettings.ceremony);
      if (ceremony) {
        ceremonyNote = `CEREMONY: ${ceremony.label} - Structure should honor traditional patterns for this occasion.`;
        break;
      }
    }
  }

  const structureGuide = styleStructureGuide[generationSettings.style] || "Verse-Chorus-Verse-Chorus-Bridge-Chorus structure";

  const prompt = `
    USER REQUEST: "${userRequest}"

    EMOTIONAL ANALYSIS:
    - Navarasa: ${emotionData.navarasa}
    - Intensity: ${emotionData.intensity}/10
    - Vibe: ${emotionData.vibeDescription}

    MELODY ANALYSIS:
    - Tempo: ${melodyAnalysis.suggestedTempo}
    - Key: ${melodyAnalysis.suggestedKey}
    - Meter: ${melodyAnalysis.suggestedMeter}
    - Rhythmic Pattern: ${melodyAnalysis.rhythmicPattern}

    GENERATION SETTINGS:
    - Theme: ${generationSettings.theme}
    - Mood: ${generationSettings.mood}
    - Style: ${generationSettings.style}
    - Complexity: ${generationSettings.complexity}
    - Singer Config: ${generationSettings.singerConfig}

    ${ceremonyNote}

    STYLE-SPECIFIC STRUCTURE CONVENTION:
    ${structureGuide}

    TARGET LANGUAGE: ${languageProfile.primary}

    TASK: Design the optimal song structure for maximum impact.

    REQUIREMENTS:

    1. **RECOMMENDED STRUCTURE** (compact notation):
       - Use abbreviations: I=Intro, V=Verse, C=Chorus, B=Bridge, O=Outro, PC=PreChorus
       - Example: "I-V1-PC-C-V2-PC-C-B-C-O"

    2. **SECTION ORDER** (detailed list):
       - List each section with purpose
       - Include transitions between sections
       - Example: ["Intro (Hook tease, 4 bars)", "Verse 1 (Story setup)", ...]

    3. **SECTION LENGTHS** (line recommendations):
       - How many lines per section type
       - Consider complexity level: ${generationSettings.complexity}
       - Simple = fewer lines, Complex = more lines

    4. **DYNAMIC FLOW**:
       - Map the energy curve throughout the song
       - Describe build-ups, drops, and dynamics
       - Consider the ${emotionData.intensity}/10 intensity

    5. **CLIMAX POINT**:
       - Identify where emotional/musical peak should be
       - Usually 70-80% through the song
       - Align with the ${generationSettings.mood} mood

    STRUCTURE PRINCIPLES:
    - **Opening Impact**: First 10 seconds must hook the listener
    - **Contrast**: Verses and choruses should feel different
    - **Pacing**: Match ${melodyAnalysis.suggestedTempo} tempo requirements
    - **Singer Config**: Structure for ${generationSettings.singerConfig}
       - Solo: Can have longer sections
       - Duet: Include call-response sections
       - Chorus: Include group sections
    - **Repetition**: Chorus appears at least 3x
    - **Bridge**: Provides contrast before final chorus
    - **Outro**: Satisfying conclusion (fade or climax)

    COMPLEXITY-BASED LENGTHS:
    - Simple: Verse=4 lines, Chorus=4 lines, Bridge=2 lines
    - Moderate: Verse=8 lines, Chorus=6 lines, Bridge=4 lines
    - Complex: Verse=12 lines, Chorus=8 lines, Bridge=6 lines

    OUTPUT: Structured JSON with structural recommendations.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_FAST),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_STRUCTURE_ARCHITECT,
            responseMimeType: "application/json",
            responseSchema: structureSchema,
            temperature: AGENT_TEMPERATURES.STRUCTURE_ARCHITECT,
            topP: AGENT_TOP_P.STRUCTURE_ARCHITECT,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from structure architect agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<StructureRecommendation>(response.text);

  } catch (error) {
    console.error("Structure Architect Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
