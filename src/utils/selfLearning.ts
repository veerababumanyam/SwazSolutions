import { FeedbackStats } from "./feedback";
import { AGENT_TEMPERATURES } from "../agents/config";

export interface AgentAdjustment {
    agent: string;
    parameter: string;
    oldValue: number;
    newValue: number;
    reason: string;
}

/**
 * Generate prompt adjustments based on negative feedback patterns
 */
export const getPromptAdjustments = (stats: FeedbackStats): string[] => {
    const adjustments: string[] = [];

    if (!stats || stats.totalFeedback < 3) {
        return adjustments; // Need at least 3 feedback entries to make adjustments
    }

    // If negative rate is high, suggest adjustments
    if (stats.negativeRate > 0.4) {
        stats.commonIssues.forEach(issue => {
            switch (issue) {
                case "Weak rhyming":
                    adjustments.push("CRITICAL: Enforce STRICT rhyme schemes. Review agent must reject weak rhymes.");
                    break;
                case "Script mixing issues":
                    adjustments.push("CRITICAL: Convert ALL transliterated text to Native Script immediately.");
                    break;
                case "Overly complex language":
                    adjustments.push("Simplify vocabulary. Prefer common words over archaic/literary terms.");
                    break;
                case "Mood mismatch":
                    adjustments.push("Ensure emotional tone matches user's requested mood more closely.");
                    break;
                case "Structural problems":
                    adjustments.push("Follow the requested song structure more rigidly (verse-chorus patterns).");
                    break;
            }
        });
    }

    return adjustments;
};

/**
 * Get parameter adjustments for agents based on feedback
 */
export const getAgentParameterAdjustments = (stats: FeedbackStats): AgentAdjustment[] => {
    const adjustments: AgentAdjustment[] = [];

    if (!stats || stats.totalFeedback < 5) {
        return adjustments; // Need at least 5 feedback entries
    }

    // If high negative feedback rate, adjust temperatures
    if (stats.negativeRate > 0.5) {
        // Common issue: overly complex language → lower lyricist temperature
        if (stats.commonIssues.includes("Overly complex language")) {
            const currentTemp = AGENT_TEMPERATURES.LYRICIST;
            const newTemp = Math.max(0.7, currentTemp - 0.1);
            adjustments.push({
                agent: "LYRICIST",
                parameter: "temperature",
                oldValue: currentTemp,
                newValue: newTemp,
                reason: "Reduce creativity to simplify language based on user feedback"
            });
        }

        // Common issue: weak rhyming → lower review temperature (more strict)
        if (stats.commonIssues.includes("Weak rhyming")) {
            const currentTemp = AGENT_TEMPERATURES.REVIEW;
            const newTemp = Math.max(0.1, currentTemp - 0.1);
            adjustments.push({
                agent: "REVIEW",
                parameter: "temperature",
                oldValue: currentTemp,
                newValue: newTemp,
                reason: "Make review more deterministic/strict to catch rhyme issues"
            });
        }

        // Common issue: mood mismatch → lower emotion temperature
        if (stats.commonIssues.includes("Mood mismatch")) {
            const currentTemp = AGENT_TEMPERATURES.EMOTION;
            const newTemp = Math.max(0.3, currentTemp - 0.1);
            adjustments.push({
                agent: "EMOTION",
                parameter: "temperature",
                newValue: newTemp,
                oldValue: currentTemp,
                reason: "Make emotion detection more consistent"
            });
        }
    }

    return adjustments;
};

/**
 * Apply learned adjustments to generation settings
 */
export const applyLearningToSettings = (
    baseSettings: any,
    stats: FeedbackStats
): any => {
    const adjustedSettings = { ...baseSettings };

    // If users consistently dislike complex lyrics, default to "Simple"
    if (stats.commonIssues.includes("Overly complex language")) {
        if (!adjustedSettings.complexity || adjustedSettings.complexity === "Poetic") {
            adjustedSettings.complexity = "Simple";
            console.log("📊 Self-learning: Defaulting to Simple complexity based on feedback");
        }
    }

    // If script mixing is an issue, enforce pure mode
    if (stats.commonIssues.includes("Script mixing issues")) {
        if (adjustedSettings.mixedScript !== false) {
            adjustedSettings.mixedScript = false;
            console.log("📊 Self-learning: Enforcing pure script mode based on feedback");
        }
    }

    return adjustedSettings;
};

/**
 * Get feedback-based system instruction enhancements
 */
export const getFeedbackBasedInstructions = (stats: FeedbackStats): string => {
    if (!stats || stats.totalFeedback < 3) {
        return "";
    }

    const promptAdjustments = getPromptAdjustments(stats);

    if (promptAdjustments.length === 0) {
        return "";
    }

    return `\n\n🎯 LEARNED FROM USER FEEDBACK (${stats.negativeCount} negative, ${stats.positiveCount} positive):\n${promptAdjustments.map((adj, i) => `${i + 1}. ${adj}`).join("\n")}`;
};
