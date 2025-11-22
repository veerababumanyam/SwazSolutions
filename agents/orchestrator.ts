
import { runEmotionAgent } from "./emotion";
import { runResearchAgent } from "./research";
import { runLyricistAgent } from "./lyricist";
import { runReviewAgent } from "./review";
import { runFormatterAgent } from "./formatter";
import { runPromptEngineerAgent } from "./chat";
import { LanguageProfile, GenerationSettings, AgentStatus, EmotionAnalysis, Message } from "./types";
import { MODEL_COMPLEX, MODEL_FAST, API_KEY, delay, RATE_LIMIT_DELAY, DEFAULT_RHYME_SCHEME } from "./config";
import { AUTO_OPTION } from "./constants";
import { validateApiKey, validateUserInput, validateLanguage } from "../utils/validation";
import { loadUserPreferences } from "../utils/storage";

export interface GenerationStep {
    message: string;
    agent: 'LYRICIST' | 'REVIEW' | 'IDLE' | 'CHAT';
    progress: number;
    type?: 'log';
}

export interface WorkflowResult {
    lyrics: string;
    stylePrompt: string;
    researchData?: string;
    analysis?: any;
    promptEnhancement?: {
        original: string;
        enhanced: string;
        inferredSettings: any;
    };
}

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
 * The Orchestrator manages the lifecycle of song generation.
 * NEW FLOW: Input -> PROMPT ENGINEER -> Emotion -> Research -> Lyricist -> Review -> Compliance -> Formatter
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

    try {
        // 0. PROMPT ENGINEER AGENT (NEW FIRST STEP)
        onProgress({ message: "Prompt Engineer: Analyzing and enhancing request...", agent: 'CHAT', progress: 3, type: 'log' });

        const promptEnhancement = await runPromptEngineerAgent(
            userRequest,
            generationSettings,
            languageProfile,
            chatHistory,
            effectiveApiKey
        );

        const enhancedRequest = promptEnhancement.enhancedPrompt;
        onProgress({
            message: `Enhanced: "${enhancedRequest.substring(0, 60)}..."`,
            agent: 'CHAT',
            progress: 8,
            type: 'log'
        });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 1. EMOTION ANALYSIS (using enhanced prompt)
        onProgress({ message: "Emotion Agent: Analyzing sentiment...", agent: 'IDLE', progress: 10, type: 'log' });

        const emotionData = await runEmotionAgent(enhancedRequest, effectiveApiKey, MODEL_FAST);
        onProgress({ message: `Detected: ${emotionData.sentiment} (${emotionData.navarasa})`, agent: 'IDLE', progress: 18, type: 'log' });

        // Rate limiting delay between API calls
        await delay(RATE_LIMIT_DELAY);

        // 2. RESEARCH AGENT
        onProgress({ message: "Research Agent: Gathering cultural context...", agent: 'IDLE', progress: 23, type: 'log' });
        const researchData = await runResearchAgent(
            enhancedRequest,
            generationSettings.mood || "General",
            effectiveApiKey,
            MODEL_FAST
        );
        onProgress({ message: "Cultural context acquired.", agent: 'IDLE', progress: 28, type: 'log' });

        // 3. CONFIGURATION RESOLUTION (Emotion AI suggestions removed)
        const finalSettings = resolveSettings(generationSettings, promptEnhancement.inferredSettings);

        // Log settings resolution for debugging
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

        onProgress({ message: `Configuration: ${finalSettings.style} | ${finalSettings.mood} | ${finalSettings.rhymeScheme}`, agent: 'IDLE', progress: 33, type: 'log' });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 4. LYRICIST AGENT (with enhanced prompt)
        onProgress({ message: `Lyricist Agent: Composing ${finalSettings.style} lyrics in ${languageProfile.primary}...`, agent: 'LYRICIST', progress: 45 });
        const draftLyrics = await runLyricistAgent(
            researchData,
            enhancedRequest, // Use enhanced prompt, not original
            languageProfile,
            emotionData,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );
        onProgress({ message: "Draft generated. Handing off to Reviewer.", agent: 'LYRICIST', progress: 65, type: 'log' });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 5. REVIEW AGENT
        onProgress({ message: "Review Agent: Auditing rhymes & script...", agent: 'REVIEW', progress: 73 });
        const refinedLyrics = await runReviewAgent(
            draftLyrics,
            enhancedRequest,
            languageProfile,
            finalSettings,
            effectiveApiKey,
            MODEL_COMPLEX
        );
        onProgress({ message: "Review complete. Formatting for Suno...", agent: 'REVIEW', progress: 88, type: 'log' });

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // 6. FORMATTER AGENT (with style prompt from Prompt Engineer)
        onProgress({ message: "Formatter Agent: Adding Suno.com tags...", agent: 'IDLE', progress: 96 });
        const finalOutput = await runFormatterAgent(
            refinedLyrics,
            effectiveApiKey,
            MODEL_FAST,
            {
                stylePrompt: promptEnhancement.stylePrompt, // From Prompt Engineer
                customHQTags: userPrefs.hqTags.length > 0 ? userPrefs.hqTags : undefined,
                context: `${finalSettings.style} ${finalSettings.mood} ${finalSettings.theme}`
            }
        );

        onProgress({ message: "Workflow Complete.", agent: 'IDLE', progress: 100 });

        return {
            lyrics: finalOutput.formattedLyrics,
            stylePrompt: promptEnhancement.stylePrompt, // From Prompt Engineer
            researchData: researchData,
            analysis: emotionData,
            promptEnhancement: {
                original: userRequest,
                enhanced: enhancedRequest,
                inferredSettings: promptEnhancement.inferredSettings
            }
        };

    } catch (error) {
        console.error("Orchestrator Failed:", error);
        throw error;
    }
};
