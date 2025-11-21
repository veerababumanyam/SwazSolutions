
import { runEmotionAgent } from "./emotion";
import { runResearchAgent } from "./research";
import { runLyricistAgent } from "./lyricist";
import { runReviewAgent } from "./review";
import { runFormatterAgent } from "./formatter";
import { runComplianceAgent } from "./compliance";
import { LanguageProfile, GenerationSettings, AgentStatus, EmotionAnalysis, ComplianceReport } from "./types";
import { MODEL_COMPLEX, MODEL_FAST, API_KEY, delay, RATE_LIMIT_DELAY } from "./config";
import { AUTO_OPTION } from "./constants";
import { validateApiKey, validateUserInput, validateLanguage } from "../utils/validation";
import { loadUserPreferences } from "../utils/storage";

export interface GenerationStep {
    message: string;
    agent: 'LYRICIST' | 'REVIEW' | 'IDLE' | 'COMPLIANCE';
    progress: number;
    type?: 'log'; // To distinguish between status updates and logs
}

export interface WorkflowResult {
    lyrics: string;
    stylePrompt: string;
    researchData?: string;
    analysis?: any;
    compliance?: ComplianceReport;
}

// Helper to merge User settings with AI suggestions
// Priority: 1. User Explicit Choice, 2. Context/Ceremony Settings, 3. AI Analysis, 4. Defaults
const resolveSettings = (userSettings: GenerationSettings, analysis: EmotionAnalysis): GenerationSettings => {
    const hasCeremony = userSettings.ceremony && userSettings.ceremony !== 'None' && userSettings.ceremony !== '';

    const resolveWithContext = (val: string, custom: string, aiVal: string, defaultVal: string) => {
        // If user selected "Custom" and provided custom value, use it
        if (val === "Custom" && custom) return custom;

        // If ceremony is selected and value is NOT auto/empty, respect the ceremony setting
        if (hasCeremony && val && val !== AUTO_OPTION) return val;

        // Otherwise fall back to AI analysis or default
        if (!val || val === AUTO_OPTION) return aiVal || defaultVal;

        return val;
    };

    return {
        ...userSettings,
        // Preserve ceremony and category
        category: userSettings.category || '',
        ceremony: userSettings.ceremony || '',

        // Resolve each setting with context priority
        mood: resolveWithContext(userSettings.mood, userSettings.customMood, analysis.suggestedMood, "Romantic"),
        style: resolveWithContext(userSettings.style, userSettings.customStyle, analysis.suggestedStyle, "Cinematic"),
        theme: resolveWithContext(userSettings.theme, userSettings.customTheme, analysis.suggestedTheme, "Love"),
        rhymeScheme: resolveWithContext(userSettings.rhymeScheme, userSettings.customRhymeScheme, analysis.suggestedRhymeScheme, "AABB (Couplets)"),
        singerConfig: resolveWithContext(userSettings.singerConfig, userSettings.customSingerConfig || '', analysis.suggestedSingerConfig, "Duet"),

        // Complexity uses simpler logic
        complexity: (userSettings.complexity === AUTO_OPTION || !userSettings.complexity)
            ? (analysis.suggestedComplexity || "Moderate")
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
 * The Orchestrator manages the lifecycle of song generation.
 * It chains agents together: Input -> Emotion -> Research -> Writer -> Review -> Compliance -> Formatter
 */
export const runLyricGenerationWorkflow = async (
    userRequest: string,
    languageProfile: LanguageProfile,
    generationSettings: GenerationSettings,
    apiKey: string,
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

    try {
        // 1. SEQUENTIAL EXECUTION: Emotion Analysis followed by Research
        onProgress({ message: "Starting emotion analysis...", agent: 'IDLE', progress: 5, type: 'log' });

        const emotionData = await runEmotionAgent(userRequest, effectiveApiKey, MODEL_FAST);
        onProgress({ message: `Detected Mood: ${emotionData.sentiment} (${emotionData.navarasa})`, agent: 'IDLE', progress: 15, type: 'log' });

        // Rate limiting delay between API calls
        await delay(RATE_LIMIT_DELAY);

        onProgress({ message: "Starting research agent...", agent: 'IDLE', progress: 20, type: 'log' });
        const researchData = await runResearchAgent(
            userRequest,
            generationSettings.mood || "General",
            effectiveApiKey,
            MODEL_FAST
        );
        onProgress({ message: "Cultural context acquired.", agent: 'IDLE', progress: 25, type: 'log' });

        // 2. RESOLVE CONFIGURATION
        const finalSettings = resolveSettings(generationSettings, emotionData);

        // Log settings resolution for debugging
        console.log('⚙️  Settings Resolution:', {
            hasCeremony: finalSettings.ceremony && finalSettings.ceremony !== 'None' && finalSettings.ceremony !== '',
            ceremony: finalSettings.ceremony,
            category: finalSettings.category,
            finalSettings: {
                mood: finalSettings.mood,
                style: finalSettings.style,
                theme: finalSettings.theme,
                rhymeScheme: finalSettings.rhymeScheme,
                singerConfig: finalSettings.singerConfig,
                complexity: finalSettings.complexity
            },
            aiSuggestions: {
                mood: emotionData.suggestedMood,
                style: emotionData.suggestedStyle,
                theme: emotionData.suggestedTheme
            }
        });

        onProgress({ message: `Configuration Resolved: ${finalSettings.style} | ${finalSettings.mood}`, agent: 'IDLE', progress: 30, type: 'log' });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 3. LYRICIST AGENT
        onProgress({ message: `Lyricist Agent: Composing ${finalSettings.style} lyrics in ${languageProfile.primary}...`, agent: 'LYRICIST', progress: 40 });
        const draftLyrics = await runLyricistAgent(
            researchData,
            userRequest,
            languageProfile,
            emotionData,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );
        onProgress({ message: "Draft generated. Handing off to Reviewer.", agent: 'LYRICIST', progress: 60, type: 'log' });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 4. REVIEW AGENT
        onProgress({ message: "Review Agent: Sahitya Pundit is auditing rhymes & meter...", agent: 'REVIEW', progress: 70 });
        const refinedLyrics = await runReviewAgent(
            draftLyrics,
            userRequest,
            languageProfile,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );
        onProgress({ message: "Review complete. Checking compliance...", agent: 'REVIEW', progress: 80, type: 'log' });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 5. COMPLIANCE AGENT
        onProgress({ message: "Compliance Agent: Checking originality...", agent: 'COMPLIANCE', progress: 85 });
        let complianceReport;
        try {
            complianceReport = await runComplianceAgent(refinedLyrics, effectiveApiKey, MODEL_FAST);
            onProgress({ message: `Compliance Check: ${complianceReport.verdict} (${complianceReport.originalityScore}% Originality)`, agent: 'IDLE', progress: 88, type: 'log' });
        } catch (e) {
            console.warn("Compliance check failed", e);
            onProgress({ message: "Compliance Agent unavailable, skipping.", agent: 'IDLE', progress: 88, type: 'log' });
        }

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 6. FORMATTER AGENT (with user HQ tags)
        onProgress({ message: "Formatter Agent: Preparing Suno.com tags...", agent: 'IDLE', progress: 95 });
        const finalOutput = await runFormatterAgent(
            refinedLyrics,
            effectiveApiKey,
            MODEL_FAST,
            {
                customHQTags: userPrefs.hqTags.length > 0 ? userPrefs.hqTags : undefined,
                context: `${finalSettings.style} ${finalSettings.mood} ${finalSettings.theme}`
            }
        );

        onProgress({ message: "Workflow Complete.", agent: 'IDLE', progress: 100 });

        return {
            lyrics: finalOutput.formattedLyrics,
            stylePrompt: finalOutput.stylePrompt,
            researchData: researchData,
            analysis: emotionData,
            compliance: complianceReport
        };

    } catch (error) {
        console.error("Orchestrator Failed:", error);
        throw error;
    }
};
