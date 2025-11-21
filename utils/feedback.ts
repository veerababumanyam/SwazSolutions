import { Message } from "../agents/types";

// Feedback Types
export type FeedbackRating = "thumbs_up" | "thumbs_down";

export interface FeedbackEntry {
    id: string;
    messageId: string;
    rating: FeedbackRating;
    comment?: string;
    timestamp: number;
    context: {
        userRequest: string;
        agentResponse: string;
        generationSettings?: any;
    };
}

export interface FeedbackStats {
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    positiveRate: number;
    negativeRate: number;
    commonIssues: string[];
}

// Storage Keys
const FEEDBACK_STORAGE_KEY = "lyric_studio_feedback";
const FEEDBACK_INSIGHTS_KEY = "lyric_studio_feedback_insights";

/**
 * Save feedback to localStorage
 */
export const saveFeedback = (entry: FeedbackEntry): void => {
    try {
        const existing = loadAllFeedback();
        existing.push(entry);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));

        // Trigger insights update
        updateFeedbackInsights(existing);
    } catch (error) {
        console.error("Failed to save feedback:", error);
    }
};

/**
 * Load all feedback from localStorage
 */
export const loadAllFeedback = (): FeedbackEntry[] => {
    try {
        const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load feedback:", error);
        return [];
    }
};

/**
 * Get feedback for a specific message
 */
export const getFeedbackForMessage = (messageId: string): FeedbackEntry | undefined => {
    const allFeedback = loadAllFeedback();
    return allFeedback.find(f => f.messageId === messageId);
};

/**
 * Analyze feedback and generate statistics
 */
export const analyzeFeedback = (feedback: FeedbackEntry[]): FeedbackStats => {
    const total = feedback.length;
    const positive = feedback.filter(f => f.rating === "thumbs_up").length;
    const negative = feedback.filter(f => f.rating === "thumbs_down").length;

    // Extract common issues from negative feedback comments
    const negativeComments = feedback
        .filter(f => f.rating === "thumbs_down" && f.comment)
        .map(f => f.comment!.toLowerCase());

    const commonIssues: string[] = [];
    if (negativeComments.some(c => c.includes("rhyme") || c.includes("prasa"))) {
        commonIssues.push("Weak rhyming");
    }
    if (negativeComments.some(c => c.includes("script") || c.includes("transliteration") || c.includes("english"))) {
        commonIssues.push("Script mixing issues");
    }
    if (negativeComments.some(c => c.includes("complex") || c.includes("difficult"))) {
        commonIssues.push("Overly complex language");
    }
    if (negativeComments.some(c => c.includes("mood") || c.includes("emotion") || c.includes("sentiment"))) {
        commonIssues.push("Mood mismatch");
    }
    if (negativeComments.some(c => c.includes("structure") || c.includes("format"))) {
        commonIssues.push("Structural problems");
    }

    return {
        totalFeedback: total,
        positiveCount: positive,
        negativeCount: negative,
        positiveRate: total > 0 ? positive / total : 0,
        negativeRate: total > 0 ? negative / total : 0,
        commonIssues
    };
};

/**
 * Update cached feedback insights
 */
const updateFeedbackInsights = (feedback: FeedbackEntry[]): void => {
    try {
        const stats = analyzeFeedback(feedback);
        localStorage.setItem(FEEDBACK_INSIGHTS_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Failed to update feedback insights:", error);
    }
};

/**
 * Load cached feedback insights
 */
export const loadFeedbackInsights = (): FeedbackStats | null => {
    try {
        const data = localStorage.setItem(FEEDBACK_INSIGHTS_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Failed to load feedback insights:", error);
        return null;
    }
};

/**
 * Clear all feedback (for testing or reset)
 */
export const clearAllFeedback = (): void => {
    try {
        localStorage.removeItem(FEEDBACK_STORAGE_KEY);
        localStorage.removeItem(FEEDBACK_INSIGHTS_KEY);
    } catch (error) {
        console.error("Failed to clear feedback:", error);
    }
};
