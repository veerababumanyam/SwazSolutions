
import { runEmotionAgent } from "./emotion";
import { runResearchAgent } from "./research";
import { runLyricistAgent } from "./lyricist";
import { runReviewAgent } from "./review";
import { runFormatterAgent } from "./formatter";
import { runPromptEngineerAgent } from "./chat";
// New 14-Agent System imports
import { runMelodyAgent } from "./melody";
import { runRhymeMasterAgent } from "./rhymeMaster";
import { runMagicRhymeOptimizerAgent } from "./magicRhymeOptimizer";
import { runCulturalTranslatorAgent } from "./culturalTranslator";
import { runCulturalMetaphorEngine } from "./culturalMetaphorEngine";
import { runHookGeneratorAgent } from "./hookGenerator";
import { runStructureArchitectAgent } from "./structureArchitect";
import { runQualityAssuranceAgent } from "./qualityAssurance";
import {
    LanguageProfile,
    GenerationSettings,
    EmotionAnalysis,
    Message,
    MelodyAnalysis,
    RhymeSuggestions,
    MagicRhymeOptimization,
    CulturalAdaptation,
    CulturalMetaphorAnalysis,
    HookSuggestion,
    StructureRecommendation,
    QualityReport
} from "./types";
import { MODEL_COMPLEX, MODEL_FAST, API_KEY, delay, RATE_LIMIT_DELAY, DEFAULT_RHYME_SCHEME, AGENT_TEMPERATURES } from "./config";
import { AUTO_OPTION } from "./constants";
import { validateApiKey, validateUserInput, validateLanguage } from "../utils/validation";
import { loadUserPreferences } from "../utils/storage";
import { getPreferences } from "../services/preferencesApi";

// Agent types for the 14-agent system
type AgentType = 'LYRICIST' | 'REVIEW' | 'IDLE' | 'CHAT' | 'MELODY' | 'RHYME_MASTER' |
                 'MAGIC_RHYME_OPTIMIZER' | 'CULTURAL_TRANSLATOR' | 'CULTURAL_METAPHOR' |
                 'HOOK_GENERATOR' | 'STRUCTURE_ARCHITECT' | 'QUALITY_ASSURANCE' |
                 'PROMPT_ENGINEER' | 'EMOTION' | 'RESEARCH' | 'FORMATTER';

export interface GenerationStep {
    message: string;
    agent: AgentType;
    progress: number;
    type?: 'log';
}

export interface WorkflowResult {
    lyrics: string;
    stylePrompt: string;
    researchData?: string;
    analysis?: EmotionAnalysis;
    promptEnhancement?: {
        original: string;
        enhanced: string;
        inferredSettings: Partial<GenerationSettings>;
    };
    // New 14-Agent System outputs
    melodyAnalysis?: MelodyAnalysis;
    rhymeSuggestions?: RhymeSuggestions;
    magicRhymeOptimization?: MagicRhymeOptimization;
    culturalAdaptation?: CulturalAdaptation;
    culturalMetaphorAnalysis?: CulturalMetaphorAnalysis;
    hookSuggestions?: HookSuggestion;
    structureRecommendation?: StructureRecommendation;
    qualityReport?: QualityReport;
}

// Helper to adjust agent temperatures based on user preference
// precision: -0.2 (lower creativity), balanced: 0 (no change), creative: +0.2 (higher creativity)
const adjustTemperatureForPreference = (
    baseTemperature: number,
    preference: 'precise' | 'balanced' | 'creative'
): number => {
    const MIN_TEMP = 0.1;
    const MAX_TEMP = 0.95;

    switch (preference) {
        case 'precise':
            // Lower temperature for more deterministic, precise output
            return Math.max(MIN_TEMP, baseTemperature - 0.2);
        case 'creative':
            // Higher temperature for more creative, diverse output
            return Math.min(MAX_TEMP, baseTemperature + 0.2);
        case 'balanced':
        default:
            // Keep original temperature
            return baseTemperature;
    }
};

// Helper to get adjusted agent temperatures based on user preference
const getAdjustedAgentTemperatures = (
    preference: 'precise' | 'balanced' | 'creative'
): typeof AGENT_TEMPERATURES => {
    const adjusted = { ...AGENT_TEMPERATURES };

    Object.keys(adjusted).forEach((key) => {
        const agentKey = key as keyof typeof AGENT_TEMPERATURES;
        adjusted[agentKey] = adjustTemperatureForPreference(
            AGENT_TEMPERATURES[agentKey],
            preference
        );
    });

    console.log(`🎵 Temperature Preference Applied: ${preference}`, {
        originalLyricist: AGENT_TEMPERATURES.LYRICIST,
        adjustedLyricist: adjusted.LYRICIST,
        originalHookGenerator: AGENT_TEMPERATURES.HOOK_GENERATOR,
        adjustedHookGenerator: adjusted.HOOK_GENERATOR,
        allAdjusted: adjusted
    });

    return adjusted;
};

// Helper to merge User settings with AI suggestions
// Priority: 1. User Explicit Choice, 2. Prompt Engineer Inference, 3. Ceremony Settings, 4. Defaults
const resolveSettings = (
    userSettings: GenerationSettings,
    promptInferredSettings: Partial<GenerationSettings>
): GenerationSettings => {
    const hasCeremony = userSettings.ceremony && userSettings.ceremony !== 'None' && userSettings.ceremony !== '';

    const resolveWithContext = (val: string, custom: string, promptAI: string | undefined, defaultVal: string) => {
        // If user selected "Custom" and provided custom value, use it
        if (val === "Custom" && custom) return custom;

        // If ceremony is selected and value is NOT auto/empty, respect the ceremony setting
        if (hasCeremony && val && val !== AUTO_OPTION) return val;

        // If Prompt Engineer suggested a value and user didn't override, use it
        if ((!val || val === AUTO_OPTION) && promptAI) return promptAI;

        // Otherwise use default
        if (!val || val === AUTO_OPTION) return defaultVal;

        return val;
    };

    return {
        ...userSettings,
        // Preserve ceremony and category
        category: userSettings.category || '',
        ceremony: userSettings.ceremony || '',

        // Resolve each setting: User > Prompt AI > Ceremony > Default (Emotion AI removed)
        mood: resolveWithContext(userSettings.mood, userSettings.customMood, promptInferredSettings.mood, "Romantic"),
        style: resolveWithContext(userSettings.style, userSettings.customStyle, promptInferredSettings.style, "Cinematic"),
        theme: resolveWithContext(userSettings.theme, userSettings.customTheme, promptInferredSettings.theme, "Love"),
        rhymeScheme: resolveWithContext(userSettings.rhymeScheme, userSettings.customRhymeScheme, promptInferredSettings.rhymeScheme, DEFAULT_RHYME_SCHEME),
        singerConfig: resolveWithContext(userSettings.singerConfig, userSettings.customSingerConfig || '', promptInferredSettings.singerConfig, "Duet"),

        // Complexity
        complexity: (userSettings.complexity === AUTO_OPTION || !userSettings.complexity)
            ? (promptInferredSettings.complexity || "Moderate")
            : userSettings.complexity,

        // Preserve custom values
        customMood: userSettings.customMood,
        customStyle: userSettings.customStyle,
        customTheme: userSettings.customTheme,
        customRhymeScheme: userSettings.customRhymeScheme,
        customSingerConfig: userSettings.customSingerConfig
    };
};

/**
 * 14-AGENT ORCHESTRATOR
 * =====================
 * The Orchestrator manages the lifecycle of song generation with 14 specialized agents.
 *
 * AGENT PIPELINE:
 * 1. Prompt Engineer Agent - Enhances and analyzes user request
 * 2. Emotion Agent - Navarasa emotional analysis
 * 3. Research Agent - Cultural context gathering (parallel with Emotion)
 * 4. Melody Agent - Musical structure recommendations
 * 5. Rhyme Master Agent - Rhyme generation and validation
 * 6. Cultural Translator Agent - Cross-cultural adaptation
 * 7. Cultural Metaphor Engine - Region-specific metaphors and cultural context
 * 8. Hook Generator Agent - Catchy hooks and chorus creation
 * 9. Structure Architect Agent - Song structure optimization
 * 10. Lyricist Agent - Core lyric composition
 * 11. Review Agent - Quality control and rhyme validation
 * 12. Quality Assurance Agent - Final comprehensive check
 * 13. Formatter Agent - Suno.com tag formatting
 * 14. Chat Agent - (Available separately for conversation)
 *
 * PARALLEL EXECUTION:
 * - Emotion + Research run in parallel after Prompt Engineer
 * - Melody + Rhyme Master + Cultural Translator + Cultural Metaphor Engine run in parallel
 * - Hook Generator + Structure Architect run in parallel
 * - Lyricist → Review → QA → Formatter run sequentially
 */
export const runLyricGenerationWorkflow = async (
    userRequest: string,
    languageProfile: LanguageProfile,
    generationSettings: GenerationSettings,
    apiKey: string,
    chatHistory: Message[],
    onProgress: (step: GenerationStep) => void
): Promise<WorkflowResult> => {

    // ====== INPUT VALIDATION ======
    const effectiveApiKey = apiKey || API_KEY;
    const apiValidation = validateApiKey(effectiveApiKey);
    if (!apiValidation.valid) {
        throw new Error(apiValidation.error || "Invalid API Key");
    }

    const inputValidation = validateUserInput(userRequest);
    if (!inputValidation.valid) {
        throw new Error(inputValidation.error || "Invalid user input");
    }

    const langValidation = validateLanguage(languageProfile.primary);
    if (!langValidation.valid) {
        throw new Error(langValidation.error || "Invalid language selection");
    }

    // Load user preferences for HQ tags
    const userPrefs = loadUserPreferences();

    // Load and apply temperature preference from user preferences
    let adjustedAgentTemperatures = { ...AGENT_TEMPERATURES };
    try {
        const userPreferences = await getPreferences();
        const temperaturePreference = userPreferences.ai.temperaturePreference || 'balanced';
        adjustedAgentTemperatures = getAdjustedAgentTemperatures(temperaturePreference);
    } catch (error) {
        console.warn('⚠️  Could not load user temperature preferences, using defaults:', error);
        // Fall back to original temperatures if preference loading fails
    }

    try {
        console.log('🚀 Starting 13-Agent Lyric Generation Workflow');

        // ====== PHASE 1: PROMPT ENGINEERING ======
        onProgress({ message: "Agent 1/13: Prompt Engineer analyzing request...", agent: 'PROMPT_ENGINEER', progress: 3, type: 'log' });

        const promptEnhancement = await runPromptEngineerAgent(
            userRequest,
            generationSettings,
            languageProfile,
            chatHistory,
            effectiveApiKey
        );

        const enhancedRequest = promptEnhancement.enhancedPrompt;
        onProgress({
            message: `Enhanced: "${enhancedRequest.substring(0, 50)}..."`,
            agent: 'PROMPT_ENGINEER',
            progress: 6,
            type: 'log'
        });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 2: PARALLEL ANALYSIS (Emotion + Research) ======
        onProgress({ message: "Agents 2-3/13: Emotion & Research agents (parallel)...", agent: 'EMOTION', progress: 8, type: 'log' });

        const [emotionData, researchData] = await Promise.all([
            runEmotionAgent(enhancedRequest, effectiveApiKey, MODEL_FAST),
            runResearchAgent(enhancedRequest, generationSettings.mood || "General", effectiveApiKey, MODEL_FAST)
        ]);

        onProgress({ message: `Emotion: ${emotionData.navarasa} | Research: Complete`, agent: 'RESEARCH', progress: 14, type: 'log' });

        // Resolve settings
        const finalSettings = resolveSettings(generationSettings, promptEnhancement.inferredSettings);

        console.log('⚙️  Settings Resolution:', {
            hasCeremony: finalSettings.ceremony && finalSettings.ceremony !== 'None' && finalSettings.ceremony !== '',
            ceremony: finalSettings.ceremony,
            category: finalSettings.category,
            promptInferred: promptEnhancement.inferredSettings,
            finalSettings: {
                mood: finalSettings.mood,
                style: finalSettings.style,
                theme: finalSettings.theme,
                rhymeScheme: finalSettings.rhymeScheme,
                singerConfig: finalSettings.singerConfig,
                complexity: finalSettings.complexity
            }
        });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 3: PARALLEL PREPARATION (Melody + Rhyme + Culture + Metaphors) ======
        onProgress({ message: "Agents 4-7/14: Melody, Rhyme Master, Cultural Translator & Metaphor Engine (parallel)...", agent: 'MELODY', progress: 18, type: 'log' });

        const [melodyAnalysis, rhymeSuggestions, culturalAdaptation, culturalMetaphorAnalysis] = await Promise.all([
            runMelodyAgent(enhancedRequest, emotionData, finalSettings, languageProfile, effectiveApiKey),
            runRhymeMasterAgent(enhancedRequest, emotionData, finalSettings, languageProfile, effectiveApiKey),
            runCulturalTranslatorAgent(enhancedRequest, researchData, emotionData, finalSettings, languageProfile, effectiveApiKey),
            runCulturalMetaphorEngine(enhancedRequest, emotionData, finalSettings, languageProfile, effectiveApiKey)
        ]);

        onProgress({
            message: `Melody: ${melodyAnalysis.suggestedTempo} | Rhymes: ${rhymeSuggestions.primaryRhymes?.length || 0} pairs`,
            agent: 'RHYME_MASTER',
            progress: 24,
            type: 'log'
        });

        // ====== PHASE 3.5: MAGIC RHYME OPTIMIZER (depends on Melody + Rhyme Master) ======
        onProgress({ message: "Agent 8/14: Magic Rhyme Optimizer enhancing phonetic patterns...", agent: 'MAGIC_RHYME_OPTIMIZER', progress: 26, type: 'log' });

        const magicRhymeOptimization = await runMagicRhymeOptimizerAgent(
            enhancedRequest,
            emotionData,
            finalSettings,
            languageProfile,
            rhymeSuggestions,
            melodyAnalysis,
            effectiveApiKey
        );

        onProgress({
            message: `Magic Rhyme Score: ${magicRhymeOptimization.flowScore}/10 | Enhanced: ${magicRhymeOptimization.enhancedRhymes?.length || 0} pairs | Metaphors: ${culturalMetaphorAnalysis.primaryMetaphors?.length || 0}`,
            agent: 'MAGIC_RHYME_OPTIMIZER',
            progress: 30,
            type: 'log'
        });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 4: PARALLEL CREATIVE (Hook + Structure) ======
        onProgress({ message: "Agents 9-10/14: Hook Generator & Structure Architect (parallel)...", agent: 'HOOK_GENERATOR', progress: 34, type: 'log' });

        const [hookSuggestions, structureRecommendation] = await Promise.all([
            runHookGeneratorAgent(enhancedRequest, emotionData, finalSettings, languageProfile, rhymeSuggestions, effectiveApiKey),
            runStructureArchitectAgent(enhancedRequest, emotionData, melodyAnalysis, finalSettings, languageProfile, effectiveApiKey)
        ]);

        onProgress({
            message: `Hook: "${hookSuggestions.mainHook?.substring(0, 30)}..." | Structure: ${structureRecommendation.recommendedStructure}`,
            agent: 'STRUCTURE_ARCHITECT',
            progress: 42,
            type: 'log'
        });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 5: CORE COMPOSITION (Lyricist) ======
        onProgress({
            message: `Agent 11/14: Lyricist composing ${finalSettings.style} lyrics in ${languageProfile.primary}...`,
            agent: 'LYRICIST',
            progress: 47
        });

        // Format cultural metaphors for the lyricist
        const metaphorsList = culturalMetaphorAnalysis.primaryMetaphors
            ?.slice(0, 5)
            .map(m => `• ${m.metaphor} (${m.meaning})`)
            .join('\n') || 'N/A';

        const symbolsList = culturalMetaphorAnalysis.culturalSymbols
            ?.slice(0, 3)
            .map(s => `• ${s.symbol}: ${s.symbolism}`)
            .join('\n') || 'N/A';

        const idiomsList = culturalMetaphorAnalysis.idiomaticExpressions
            ?.slice(0, 4)
            .map(i => `• ${i.expression} - ${i.actualMeaning} (${i.tone})`)
            .join('\n') || 'N/A';

        // Enhance the research data with all agent outputs for the lyricist
        const enrichedContext = `
${researchData}

=== MELODY ANALYSIS ===
Tempo: ${melodyAnalysis.suggestedTempo}
Key: ${melodyAnalysis.suggestedKey}
Meter: ${melodyAnalysis.suggestedMeter}
Pattern: ${melodyAnalysis.rhythmicPattern}
Notes: ${melodyAnalysis.musicalNotes}

=== RHYME TOOLKIT ===
Primary Rhymes: ${rhymeSuggestions.primaryRhymes?.slice(0, 10).join(', ')}
Suggestions: ${rhymeSuggestions.suggestions?.join('; ')}

=== MAGIC RHYME OPTIMIZATION (ENHANCED PHONETICS) ===
Enhanced Rhymes: ${magicRhymeOptimization.enhancedRhymes?.slice(0, 8).join(', ')}
Phonetic Patterns: ${magicRhymeOptimization.phoneticPatterns?.slice(0, 5).join('; ')}
Alliteration Ideas: ${magicRhymeOptimization.alliterationSuggestions?.slice(0, 4).join(', ')}
Syllable Guide: ${JSON.stringify(magicRhymeOptimization.syllableOptimization)}
Melodic Alignment: ${magicRhymeOptimization.melodicAlignment}
Flow Score: ${magicRhymeOptimization.flowScore}/10
Optimization Tips: ${magicRhymeOptimization.optimizationNotes?.slice(0, 3).join('; ')}

=== CULTURAL GUIDANCE ===
${culturalAdaptation.adaptationNotes}
Phrases: ${culturalAdaptation.localizedPhrases?.slice(0, 5).join('; ')}

=== CULTURAL METAPHORS (Use These!) ===
${metaphorsList}

=== CULTURAL SYMBOLS ===
${symbolsList}

=== IDIOMATIC EXPRESSIONS ===
${idiomsList}

=== MYTHOLOGY REFERENCES ===
${culturalMetaphorAnalysis.mythologyReferences?.slice(0, 3).map(m => `• ${m.reference}: ${m.incorporation}`).join('\n') || 'N/A'}

=== NATURE IMAGERY ===
${culturalMetaphorAnalysis.natureMetaphors?.slice(0, 6).join(', ') || 'N/A'}

=== CULTURAL CONTEXT SUMMARY ===
${culturalMetaphorAnalysis.culturalContextSummary}

=== HOOKS TO USE ===
Main Hook: ${hookSuggestions.mainHook}
Tagline: ${hookSuggestions.tagline}
Placement: ${hookSuggestions.hookPlacement?.join(', ')}

=== STRUCTURE TO FOLLOW ===
Pattern: ${structureRecommendation.recommendedStructure}
Sections: ${structureRecommendation.sectionOrder?.join(' → ')}
Climax: ${structureRecommendation.climaxPoint}
`;

        const draftLyrics = await runLyricistAgent(
            enrichedContext,
            enhancedRequest,
            languageProfile,
            emotionData,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );

        onProgress({ message: "Draft complete. Initiating review...", agent: 'LYRICIST', progress: 60, type: 'log' });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 6: REVIEW ======
        onProgress({ message: "Agent 12/14: Review Agent auditing rhymes & script...", agent: 'REVIEW', progress: 65 });

        const refinedLyrics = await runReviewAgent(
            draftLyrics,
            enhancedRequest,
            languageProfile,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );

        onProgress({ message: "Review complete. Running quality assurance...", agent: 'REVIEW', progress: 75, type: 'log' });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 7: QUALITY ASSURANCE ======
        onProgress({ message: "Agent 13/14: Quality Assurance - Final inspection...", agent: 'QUALITY_ASSURANCE', progress: 80 });

        const qualityReport = await runQualityAssuranceAgent(
            refinedLyrics,
            enhancedRequest,
            emotionData,
            finalSettings,
            languageProfile,
            effectiveApiKey
        );

        const qaStatus = qualityReport.approved ? '✓ Approved' : '⚠ Issues found';
        onProgress({
            message: `QA Score: ${qualityReport.overallScore}/100 ${qaStatus}`,
            agent: 'QUALITY_ASSURANCE',
            progress: 88,
            type: 'log'
        });

        // Log quality report
        console.log('📊 Quality Report:', {
            overallScore: qualityReport.overallScore,
            approved: qualityReport.approved,
            languageAccuracy: qualityReport.languageAccuracy,
            rhymeConsistency: qualityReport.rhymeConsistency,
            emotionalCoherence: qualityReport.emotionalCoherence,
            culturalAuthenticity: qualityReport.culturalAuthenticity,
            structuralIntegrity: qualityReport.structuralIntegrity,
            issues: qualityReport.issues?.length || 0
        });

        await delay(RATE_LIMIT_DELAY);

        // ====== PHASE 8: FORMATTING ======
        onProgress({ message: "Agent 14/14: Formatter adding Suno.com tags...", agent: 'FORMATTER', progress: 94 });

        const finalOutput = await runFormatterAgent(
            refinedLyrics,
            effectiveApiKey,
            MODEL_FAST,
            {
                stylePrompt: promptEnhancement.stylePrompt,
                customHQTags: userPrefs.hqTags.length > 0 ? userPrefs.hqTags : undefined,
                context: `${finalSettings.style} ${finalSettings.mood} ${finalSettings.theme}`
            }
        );

        onProgress({ message: "🎵 14-Agent Workflow Complete!", agent: 'IDLE', progress: 100 });

        console.log('✅ 14-Agent Workflow completed successfully');

        return {
            lyrics: finalOutput.formattedLyrics,
            stylePrompt: promptEnhancement.stylePrompt,
            researchData: researchData,
            analysis: emotionData,
            promptEnhancement: {
                original: userRequest,
                enhanced: enhancedRequest,
                inferredSettings: promptEnhancement.inferredSettings
            },
            // New 14-Agent System outputs
            melodyAnalysis,
            rhymeSuggestions,
            magicRhymeOptimization,
            culturalAdaptation,
            culturalMetaphorAnalysis,
            hookSuggestions,
            structureRecommendation,
            qualityReport
        };

    } catch (error) {
        console.error("14-Agent Orchestrator Failed:", error);
        throw error;
    }
};

/**
 * SIMPLIFIED WORKFLOW (Original 7-Agent Flow)
 * For backward compatibility or faster generation
 */
export const runSimplifiedWorkflow = async (
    userRequest: string,
    languageProfile: LanguageProfile,
    generationSettings: GenerationSettings,
    apiKey: string,
    chatHistory: Message[],
    onProgress: (step: GenerationStep) => void
): Promise<WorkflowResult> => {
    // Original 7-agent flow implementation
    const effectiveApiKey = apiKey || API_KEY;
    const apiValidation = validateApiKey(effectiveApiKey);
    if (!apiValidation.valid) {
        throw new Error(apiValidation.error || "Invalid API Key");
    }

    const inputValidation = validateUserInput(userRequest);
    if (!inputValidation.valid) {
        throw new Error(inputValidation.error || "Invalid user input");
    }

    const langValidation = validateLanguage(languageProfile.primary);
    if (!langValidation.valid) {
        throw new Error(langValidation.error || "Invalid language selection");
    }

    const userPrefs = loadUserPreferences();

    try {
        onProgress({ message: "Prompt Engineer: Analyzing request...", agent: 'CHAT', progress: 5, type: 'log' });

        const promptEnhancement = await runPromptEngineerAgent(
            userRequest,
            generationSettings,
            languageProfile,
            chatHistory,
            effectiveApiKey
        );

        const enhancedRequest = promptEnhancement.enhancedPrompt;
        await delay(RATE_LIMIT_DELAY);

        onProgress({ message: "Analyzing emotion & research...", agent: 'IDLE', progress: 15, type: 'log' });

        const [emotionData, researchData] = await Promise.all([
            runEmotionAgent(enhancedRequest, effectiveApiKey, MODEL_FAST),
            runResearchAgent(enhancedRequest, generationSettings.mood || "General", effectiveApiKey, MODEL_FAST)
        ]);

        const finalSettings = resolveSettings(generationSettings, promptEnhancement.inferredSettings);
        await delay(RATE_LIMIT_DELAY);

        onProgress({ message: "Composing lyrics...", agent: 'LYRICIST', progress: 40 });

        const draftLyrics = await runLyricistAgent(
            researchData,
            enhancedRequest,
            languageProfile,
            emotionData,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );

        await delay(RATE_LIMIT_DELAY);

        onProgress({ message: "Reviewing...", agent: 'REVIEW', progress: 70 });

        const refinedLyrics = await runReviewAgent(
            draftLyrics,
            enhancedRequest,
            languageProfile,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );

        await delay(RATE_LIMIT_DELAY);

        onProgress({ message: "Formatting...", agent: 'IDLE', progress: 90 });

        const finalOutput = await runFormatterAgent(
            refinedLyrics,
            effectiveApiKey,
            MODEL_FAST,
            {
                stylePrompt: promptEnhancement.stylePrompt,
                customHQTags: userPrefs.hqTags.length > 0 ? userPrefs.hqTags : undefined,
                context: `${finalSettings.style} ${finalSettings.mood} ${finalSettings.theme}`
            }
        );

        onProgress({ message: "Complete!", agent: 'IDLE', progress: 100 });

        return {
            lyrics: finalOutput.formattedLyrics,
            stylePrompt: promptEnhancement.stylePrompt,
            researchData,
            analysis: emotionData,
            promptEnhancement: {
                original: userRequest,
                enhanced: enhancedRequest,
                inferredSettings: promptEnhancement.inferredSettings
            }
        };

    } catch (error) {
        console.error("Simplified Workflow Failed:", error);
        throw error;
    }
};
