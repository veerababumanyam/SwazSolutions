import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_MELODY, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST } from "./config";
import { MelodyAnalysis, EmotionAnalysis, GenerationSettings, LanguageProfile } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";

/**
 * MELODY AGENT - Agent #8 in the 13-Agent System
 * Core Responsibility: Musical structure analysis and recommendations
 *
 * This agent analyzes the emotional content and song context to suggest:
 * - Optimal tempo (BPM)
 * - Key signature
 * - Time signature/meter
 * - Rhythmic patterns
 * - Melodic contour
 * - Raga suggestions (for Indian music)
 */
export const runMelodyAgent = async (
  userRequest: string,
  emotionData: EmotionAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  apiKey: string,
  selectedModel?: string
): Promise<MelodyAnalysis> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const melodySchema = {
    type: Type.OBJECT,
    properties: {
      suggestedTempo: {
        type: Type.STRING,
        description: "Recommended tempo in BPM with descriptor (e.g., '120 BPM - Moderato')"
      },
      suggestedKey: {
        type: Type.STRING,
        description: "Recommended key signature (e.g., 'C Major', 'A Minor', 'Raag Yaman')"
      },
      suggestedMeter: {
        type: Type.STRING,
        description: "Time signature (e.g., '4/4', '3/4', 'Adi Taalam - 8 beats')"
      },
      rhythmicPattern: {
        type: Type.STRING,
        description: "Suggested rhythmic feel (e.g., 'Syncopated groove', 'Straight beat', 'Dappankuthu')"
      },
      melodicContour: {
        type: Type.STRING,
        description: "Description of melodic shape (e.g., 'Rising chorus, falling verses')"
      },
      musicalNotes: {
        type: Type.STRING,
        description: "Additional musical suggestions and notes for the composer"
      }
    },
    required: ["suggestedTempo", "suggestedKey", "suggestedMeter", "rhythmicPattern", "melodicContour", "musicalNotes"]
  };

  // Style-to-tempo mapping
  const styleTempoGuide: Record<string, string> = {
    "Cinematic": "60-80 BPM for dramatic, 100-120 BPM for action",
    "Folk": "80-100 BPM, acoustic feel",
    "Classical": "60-90 BPM, flexible rubato",
    "Pop": "100-130 BPM, steady 4/4",
    "Rap/Hip-Hop": "85-115 BPM, heavy bass",
    "EDM": "120-150 BPM, four-on-floor",
    "Tollywood Mass": "100-140 BPM, Dappankuthu groove",
    "Bhangra": "110-130 BPM, dhol-driven",
    "Sufi": "70-100 BPM, meditative",
    "Rock": "110-140 BPM, driving rhythm"
  };

  const styleGuide = styleTempoGuide[generationSettings.style] || "100-120 BPM, adapt to mood";

  const prompt = `
    USER REQUEST: "${userRequest}"

    EMOTIONAL ANALYSIS:
    - Navarasa: ${emotionData.navarasa}
    - Sentiment: ${emotionData.sentiment}
    - Intensity: ${emotionData.intensity}/10
    - Vibe: ${emotionData.vibeDescription}

    GENERATION SETTINGS:
    - Style: ${generationSettings.style}
    - Mood: ${generationSettings.mood}
    - Theme: ${generationSettings.theme}
    - Complexity: ${generationSettings.complexity}
    - Singer Config: ${generationSettings.singerConfig}

    LANGUAGE: ${languageProfile.primary}

    STYLE TEMPO GUIDE: ${styleGuide}

    TASK: Analyze the emotional and contextual information to provide comprehensive musical recommendations.

    CONSIDERATIONS:
    1. For Indian languages, consider appropriate Ragas:
       - Romantic/Love: Raag Yaman, Raag Kalyani, Raag Des
       - Sad/Melancholic: Raag Marwa, Raag Darbari, Raag Todi
       - Devotional: Raag Bhairavi, Raag Bhupali
       - Energetic: Raag Bilawal, Raag Kedar
       - Peaceful: Raag Bhoopali, Raag Durga

    2. Match tempo to emotional intensity:
       - Low intensity (1-3): Slower tempos
       - Medium intensity (4-6): Moderate tempos
       - High intensity (7-10): Faster tempos

    3. Consider the singer configuration for vocal range recommendations

    4. For mass/commercial appeal, suggest catchy rhythmic patterns

    OUTPUT: Provide detailed musical recommendations in JSON format.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_FAST),
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_MELODY,
            responseMimeType: "application/json",
            responseSchema: melodySchema,
            temperature: AGENT_TEMPERATURES.MELODY,
            topP: AGENT_TOP_P.MELODY,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from melody agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<MelodyAnalysis>(response.text);

  } catch (error) {
    console.error("Melody Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
