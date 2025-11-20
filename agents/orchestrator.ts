
import { runEmotionAgent } from "./emotion";
import { runResearchAgent } from "./research";
import { runLyricistAgent } from "./lyricist";
import { runReviewAgent } from "./review";
import { runFormatterAgent } from "./formatter";
import { runComplianceAgent } from "./compliance";
import { LanguageProfile, GenerationSettings, AgentStatus, EmotionAnalysis, ComplianceReport } from "./types";
import { MODEL_COMPLEX, MODEL_FAST } from "./config";
import { AUTO_OPTION } from "./constants";

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
const resolveSettings = (userSettings: GenerationSettings, analysis: EmotionAnalysis): GenerationSettings => {
    const resolve = (userVal: string, aiVal: string, defaultVal: string) => {
        if (!userVal || userVal === AUTO_OPTION) return aiVal || defaultVal;
        return userVal;
    };

    const resolveCustom = (val: string, custom: string, aiVal: string, defaultVal: string) => {
        if (val === "Custom" && custom) return custom;
        if (!val || val === AUTO_OPTION) return aiVal || defaultVal;
        return val;
    };

    return {
        ...userSettings,
        mood: resolveCustom(userSettings.mood, userSettings.customMood, analysis.suggestedMood, "Romantic"),
        style: resolveCustom(userSettings.style, userSettings.customStyle, analysis.suggestedStyle, "Cinematic"),
        theme: resolveCustom(userSettings.theme, userSettings.customTheme, analysis.suggestedTheme, "Love"),
        rhymeScheme: resolveCustom(userSettings.rhymeScheme, userSettings.customRhymeScheme, analysis.suggestedRhymeScheme, "AABB"),
        singerConfig: resolveCustom(userSettings.singerConfig, userSettings.customSingerConfig, analysis.suggestedSingerConfig, "Duet"),
        complexity: (userSettings.complexity === AUTO_OPTION || !userSettings.complexity) 
            ? (analysis.suggestedComplexity || "Medium") 
            : userSettings.complexity
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

    if (!apiKey) throw new Error("API Key is missing. Please configure it in the sidebar.");

    try {
        // 1. EMOTION & INTENT ANALYSIS
        onProgress({ message: "Emotion Agent: Analyzing sentiment & Navarasa...", agent: 'IDLE', progress: 10, type: 'log' });
        const emotionData = await runEmotionAgent(userRequest, apiKey, MODEL_FAST);
        onProgress({ message: `Detected Mood: ${emotionData.sentiment} (${emotionData.navarasa})`, agent: 'IDLE', progress: 15, type: 'log' });
        
        // RESOLVE CONFIGURATION
        const finalSettings = resolveSettings(generationSettings, emotionData);
        onProgress({ message: `Configuration Resolved: ${finalSettings.style} | ${finalSettings.mood}`, agent: 'IDLE', progress: 18, type: 'log' });
        
        // 2. CULTURAL RESEARCH
        onProgress({ message: `Research Agent: Scanning cultural context for '${finalSettings.mood}'...`, agent: 'IDLE', progress: 25, type: 'log' });
        const researchData = await runResearchAgent(
            userRequest, 
            emotionData?.vibeDescription || finalSettings.mood, 
            apiKey, 
            MODEL_FAST
        );
        onProgress({ message: "Cultural context acquired.", agent: 'IDLE', progress: 35, type: 'log' });

        // 3. LYRICIST AGENT
        onProgress({ message: `Lyricist Agent: Composing ${finalSettings.style} lyrics in ${languageProfile.primary}...`, agent: 'LYRICIST', progress: 40 });
        const draftLyrics = await runLyricistAgent(
            researchData,
            userRequest,
            languageProfile,
            emotionData,
            finalSettings,
            apiKey,
            MODEL_COMPLEX
        );
        onProgress({ message: "Draft generated. Handing off to Reviewer.", agent: 'LYRICIST', progress: 60, type: 'log' });

        // 4. REVIEW AGENT
        onProgress({ message: "Review Agent: Sahitya Pundit is auditing rhymes & meter...", agent: 'REVIEW', progress: 70 });
        const refinedLyrics = await runReviewAgent(
            draftLyrics,
            userRequest,
            languageProfile,
            finalSettings,
            apiKey,
            MODEL_COMPLEX
        );
        onProgress({ message: "Review complete. Checking compliance...", agent: 'REVIEW', progress: 80, type: 'log' });

        // 5. COMPLIANCE AGENT
        onProgress({ message: "Compliance Agent: Checking originality...", agent: 'COMPLIANCE', progress: 85 });
        let complianceReport;
        try {
            complianceReport = await runComplianceAgent(refinedLyrics, apiKey, MODEL_FAST);
            onProgress({ message: `Compliance Check: ${complianceReport.verdict} (${complianceReport.originalityScore}% Originality)`, agent: 'IDLE', progress: 88, type: 'log' });
        } catch (e) {
            console.warn("Compliance check failed", e);
            onProgress({ message: "Compliance Agent unavailable, skipping.", agent: 'IDLE', progress: 88, type: 'log' });
        }

        // 6. FORMATTER AGENT
        onProgress({ message: "Formatter Agent: Preparing Suno.com tags...", agent: 'IDLE', progress: 95 });
        const finalOutput = await runFormatterAgent(refinedLyrics, apiKey, MODEL_FAST);

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
