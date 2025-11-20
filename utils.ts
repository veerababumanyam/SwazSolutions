import { GeneratedLyrics } from "./agents/types";

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
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", text);
        throw new Error("Failed to parse agent output");
    }
};

export const wrapGenAIError = (error: any): Error => {
    if (error instanceof Error) return error;
    return new Error(String(error));
};

export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries: number = 2,
    delay: number = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
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