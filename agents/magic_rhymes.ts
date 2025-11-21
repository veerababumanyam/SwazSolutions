
import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_FAST } from "./config";
import { LyricSection } from "./types";
import { cleanAndParseJSON } from "../utils";
import { validateApiKey, validateLanguage } from "../utils/validation";

export const runMagicRhymesAgent = async (
    sections: LyricSection[], 
    language: string,
    apiKey: string
): Promise<LyricSection[]> => {
    const apiValidation = validateApiKey(apiKey);
    if (!apiValidation.valid) {
        throw new Error(apiValidation.error || "Invalid API Key");
    }
    
    const langValidation = validateLanguage(language);
    if (!langValidation.valid) {
        throw new Error(langValidation.error || "Invalid Language");
    }
    
    if (!sections || sections.length === 0) {
        throw new Error("No lyrics sections provided");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                sectionName: { type: Type.STRING },
                lines: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sectionName", "lines"]
        }
    };

    const prompt = `
        You are a "Rhyme Surgeon". 
        Input Language: ${language}
        
        TASK:
        1. Analyze the lyrics below.
        2. Identify lines with WEAK or MISSING end rhymes (Anthya Prasa).
        3. REWRITE only the weak lines to have strong phonetic rhymes while keeping the original meaning.
        4. Return the full set of lyrics with the improvements.
        
        INPUT LYRICS:
        ${JSON.stringify(sections)}
        
        OUTPUT:
        Strict JSON array of sections.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.4 
            }
        });

        if (response.text) {
            return cleanAndParseJSON<LyricSection[]>(response.text);
        }
        return sections;
    } catch (error) {
        console.error("Magic Rhymes Error:", error);
        throw error;
    }
};
