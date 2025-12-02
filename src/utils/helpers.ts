import { GeneratedLyrics } from "../agents/types";

/**
 * Token Budget Tracking
 */
export const estimateTokens = (text: string): number => {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
};

export const cleanAndParseJSON = <T>(text: string): T => {
    try {
        // Remove code blocks if present
        let cleanText = text.replace(/```json\n?|```/g, '').trim();
        // Find the first '{' and last '}' to handle potential preamble/postscript
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
        }

        // Check for incomplete JSON (missing closing bracket)
        if (start !== -1 && end === -1) {
            throw new Error("Incomplete JSON: Response appears truncated (missing closing bracket). This may indicate insufficient token budget.");
        }

        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", text);
        console.error("Text Length:", text.length);

        // Provide more helpful error message
        if (e instanceof Error && e.message.includes("Incomplete JSON")) {
            throw new Error(e.message);
        }
        throw new Error(`Failed to parse agent output: ${e instanceof Error ? e.message : String(e)}`);
    }
};

export const wrapGenAIError = (error: any): Error => {
    if (error instanceof Error) return error;
    return new Error(String(error));
};

export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 2000,
    backoffFactor: number = 2
): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        // Check for 429 Too Many Requests or 503 Service Unavailable
        const status = error?.status || error?.code;
        const message = error?.message || '';

        const isRateLimit = status === 429 || message.includes('429');
        const isServiceUnavailable = status === 503 || message.includes('503');
        const isRetryable = isRateLimit || isServiceUnavailable;

        if (retries <= 0 || !isRetryable) {
            if (isRateLimit) {
                throw new Error("Gemini API Quota Exceeded. Please try again later or switch to a faster model (Flash).");
            }
            if (isServiceUnavailable) {
                throw new Error("Gemini API Service Unavailable (503). The AI service is temporarily down. Please try again in a few moments.");
            }
            throw error;
        }

        let waitTime = delay;

        // Try to parse "Please retry in X s" from error message
        if (isRateLimit && message) {
            const match = message.match(/retry in ([0-9.]+)s/);
            if (match && match[1]) {
                waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Add 1s buffer
            }
        }

        console.log(`⏳ API Error (${status}). Waiting ${waitTime}ms before retry... (${retries} retries left)`);

        await new Promise(resolve => setTimeout(resolve, waitTime));
        return retryWithBackoff(fn, retries - 1, delay * backoffFactor, backoffFactor);
    }
};

export const formatLyricsForDisplay = (data: GeneratedLyrics): string => {
    let output = "";

    if (data.title) output += `Title: ${data.title}\n`;
    if (data.ragam) output += `Ragam/Scale: ${data.ragam}\n`;
    if (data.taalam) output += `Taalam/Beat: ${data.taalam}\n\n`;

    if (data.sections) {
        data.sections.forEach(section => {
            output += `${section.sectionName}\n`;
            section.lines.forEach(line => {
                output += `${line}\n`;
            });
            output += `\n`;
        });
    }

    return output.trim();
};

/**
 * Export Utilities
 */
export const exportToJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportToText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};