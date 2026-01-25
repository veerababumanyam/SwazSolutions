import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_QUALITY_ASSURANCE, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_QUALITY } from "./config";
import { QualityReport, GenerationSettings, LanguageProfile, EmotionAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { LANGUAGE_METADATA, INDIAN_LANGUAGES } from "./constants";

/**
 * QUALITY ASSURANCE AGENT - Agent #13 in the 13-Agent System
 * Core Responsibility: Final comprehensive quality check
 *
 * This agent is the FINAL GATEKEEPER and checks:
 * - Language accuracy (no hallucinated words)
 * - Rhyme consistency
 * - Emotional coherence
 * - Cultural authenticity
 * - Structural integrity
 * - Grammar and syntax
 * - Script purity
 */
export const runQualityAssuranceAgent = async (
  finalLyrics: string,
  userRequest: string,
  emotionData: EmotionAnalysis,
  generationSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  apiKey: string,
  selectedModel?: string
): Promise<QualityReport> => {
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const qualitySchema = {
    type: Type.OBJECT,
    properties: {
      overallScore: {
        type: Type.NUMBER,
        description: "Overall quality score (0-100)"
      },
      languageAccuracy: {
        type: Type.NUMBER,
        description: "Language/vocabulary accuracy score (0-100)"
      },
      rhymeConsistency: {
        type: Type.NUMBER,
        description: "Rhyme scheme adherence score (0-100)"
      },
      emotionalCoherence: {
        type: Type.NUMBER,
        description: "Emotional consistency score (0-100)"
      },
      culturalAuthenticity: {
        type: Type.NUMBER,
        description: "Cultural appropriateness score (0-100)"
      },
      structuralIntegrity: {
        type: Type.NUMBER,
        description: "Song structure quality score (0-100)"
      },
      issues: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of identified issues"
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Suggestions for improvement"
      },
      approved: {
        type: Type.BOOLEAN,
        description: "Whether the lyrics pass quality threshold (>70 overall)"
      }
    },
    required: ["overallScore", "languageAccuracy", "rhymeConsistency", "emotionalCoherence", "culturalAuthenticity", "structuralIntegrity", "issues", "recommendations", "approved"]
  };

  // Get language metadata
  const langMetadata = LANGUAGE_METADATA[languageProfile.primary];
  const isIndian = INDIAN_LANGUAGES.includes(languageProfile.primary);

  // Script verification criteria
  const scriptCheck = isIndian
    ? `SCRIPT CHECK: All lyrics must be in ${langMetadata?.script || languageProfile.primary} script. NO Roman/Latin transliteration allowed. Unicode range: ${langMetadata?.unicodeRange || "N/A"}`
    : `SCRIPT CHECK: All lyrics must be in standard ${languageProfile.primary} orthography.`;

  // Rhyme scheme to check
  const rhymeScheme = generationSettings.rhymeScheme || "AABB (Couplet)";

  const prompt = `
    FINAL LYRICS TO REVIEW:
    ${finalLyrics}

    ORIGINAL USER REQUEST:
    "${userRequest}"

    EXPECTED EMOTIONAL PROFILE:
    - Navarasa: ${emotionData.navarasa}
    - Sentiment: ${emotionData.sentiment}
    - Intensity: ${emotionData.intensity}/10
    - Vibe: ${emotionData.vibeDescription}

    GENERATION SETTINGS:
    - Theme: ${generationSettings.theme}
    - Mood: ${generationSettings.mood}
    - Style: ${generationSettings.style}
    - Complexity: ${generationSettings.complexity}
    - Rhyme Scheme: ${rhymeScheme}
    - Singer Config: ${generationSettings.singerConfig}

    TARGET LANGUAGE: ${languageProfile.primary}
    ${scriptCheck}

    TASK: Perform COMPREHENSIVE quality assurance on the lyrics.

    SCORING CRITERIA (0-100 each):

    1. **LANGUAGE ACCURACY** (Weight: 25%):
       - Are ALL words real ${languageProfile.primary} words?
       - Is grammar correct?
       - Are there any hallucinated/invented words?
       - Is vocabulary appropriate for the complexity level (${generationSettings.complexity})?
       Deduct: -10 per gibberish word, -5 per grammar error

    2. **RHYME CONSISTENCY** (Weight: 20%):
       - Does the rhyme scheme match ${rhymeScheme}?
       - Are end rhymes phonetically correct (Anthya Prasa)?
       - Are there any broken rhyme patterns?
       Deduct: -10 per missing rhyme, -5 per weak rhyme

    3. **EMOTIONAL COHERENCE** (Weight: 20%):
       - Does the content match the ${emotionData.navarasa} emotion?
       - Is the ${generationSettings.mood} mood maintained throughout?
       - Does intensity match ${emotionData.intensity}/10?
       Deduct: -15 per emotional mismatch, -10 per mood drift

    4. **CULTURAL AUTHENTICITY** (Weight: 15%):
       - Are metaphors culturally appropriate?
       - Are there any culturally insensitive elements?
       - Does it feel authentically ${languageProfile.primary}?
       Deduct: -20 per cultural issue, -10 per generic expression

    5. **STRUCTURAL INTEGRITY** (Weight: 20%):
       - Are all required sections present (Intro, Verses, Chorus, Bridge, Outro)?
       - Are section tags in English ([Chorus], [Verse], etc.)?
       - Is the flow natural?
       - Does it suit ${generationSettings.singerConfig}?
       Deduct: -10 per missing section, -5 per flow issue

    CRITICAL CHECKS (AUTO-FAIL if violated):
    - ❌ Any Roman/Latin script in Indian language lyrics
    - ❌ More than 5 gibberish/invented words
    - ❌ Less than 50% rhyme compliance
    - ❌ Completely wrong emotional tone
    - ❌ Missing Chorus section

    APPROVAL THRESHOLD:
    - Overall score >= 70 → APPROVED
    - Overall score < 70 → NOT APPROVED

    ISSUE REPORTING:
    - List all specific issues found
    - Be precise (line numbers if possible)
    - Prioritize by severity

    RECOMMENDATIONS:
    - Provide actionable improvement suggestions
    - Focus on fixable issues
    - Be constructive

    CALCULATE OVERALL SCORE:
    Overall = (Language×0.25) + (Rhyme×0.20) + (Emotion×0.20) + (Culture×0.15) + (Structure×0.20)

    OUTPUT: Comprehensive JSON quality report.
  `;

  try {
    const response = await retryWithBackoff(
      async () => {
        const result = await ai.models.generateContent({
          model: getModelToUse(selectedModel, MODEL_QUALITY), // Use quality model for final QA
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_QUALITY_ASSURANCE,
            responseMimeType: "application/json",
            responseSchema: qualitySchema,
            temperature: AGENT_TEMPERATURES.QUALITY_ASSURANCE,
            topP: AGENT_TOP_P.QUALITY_ASSURANCE,
            topK: 40
          }
        });

        if (!result.text) {
          throw new Error("No response text from quality assurance agent");
        }
        return result;
      },
      2,
      1000
    );

    return cleanAndParseJSON<QualityReport>(response.text);

  } catch (error) {
    console.error("Quality Assurance Agent Error:", error);
    if (error instanceof Error && error.message === "API_KEY_MISSING") {
      throw error;
    }
    throw wrapGenAIError(error);
  }
};
