/**
 * Gemini API Proxy Utility
 *
 * This utility provides a secure way to interact with the Gemini API
 * by routing all requests through the backend proxy endpoint.
 *
 * SECURITY: API keys are kept server-side only, never exposed to the browser.
 *
 * Usage: Replace direct GoogleGenAI usage with this proxy client.
 *
 * Example:
 *   // OLD (insecure - exposes API key):
 *   const ai = new GoogleGenAI({ apiKey: API_KEY });
 *
 *   // NEW (secure - uses backend proxy):
 *   const ai = createGeminiProxyClient();
 */

export interface GenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    stopSequences?: string[];
}

export interface SafetySetting {
    category: string;
    threshold: string;
}

export interface Content {
    role?: string;
    parts: Array<{ text: string } | { inlineData?: any }>;
}

export interface GenerateContentParams {
    model: string;
    contents: Content[];
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    systemInstruction?: string;
}

export interface GenerateContentResult {
    response: {
        text: () => string;
        candidates?: any[];
        usageMetadata?: any;
    };
}

/**
 * Gemini Proxy Client
 * Mimics the GoogleGenAI SDK interface but routes through backend
 */
export class GeminiProxyClient {
    private baseUrl: string;

    constructor() {
        // Use API_URL or fallback to relative path
        this.baseUrl = import.meta.env.VITE_API_URL || '';
    }

    /**
     * Check if the proxy is configured and available
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/gemini-proxy/health`, {
                credentials: 'include'
            });
            const data = await response.json();
            return data.available;
        } catch (error) {
            console.error('Gemini proxy health check failed:', error);
            return false;
        }
    }

    /**
     * Models API - provides generateContent method
     */
    get models() {
        return {
            generateContent: async (params: GenerateContentParams): Promise<GenerateContentResult> => {
                try {
                    const response = await fetch(`${this.baseUrl}/api/gemini-proxy/generate`, {
                        method: 'POST',
                        credentials: 'include', // Send httpOnly cookies automatically
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(params)
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));

                        // Handle specific error codes
                        if (errorData.code === 'RATE_LIMIT_EXCEEDED') {
                            throw new Error('AI service rate limit exceeded. Please try again in a moment.');
                        }

                        if (errorData.code === 'SAFETY_FILTER_BLOCKED') {
                            throw new Error('Content blocked by safety filters. Please modify your request.');
                        }

                        if (errorData.code === 'API_KEY_MISSING') {
                            throw new Error('AI service not configured. Please contact support.');
                        }

                        throw new Error(errorData.error || 'Failed to generate content');
                    }

                    const data = await response.json();

                    // Return in the same format as GoogleGenAI SDK
                    return {
                        response: {
                            text: () => data._rawText || data.response.text(),
                            candidates: data.response.candidates,
                            usageMetadata: data.response.usageMetadata
                        }
                    };

                } catch (error) {
                    if (error instanceof Error) {
                        throw error;
                    }
                    throw new Error('Network error while generating content');
                }
            }
        };
    }
}

/**
 * Create a Gemini proxy client instance
 * Use this instead of `new GoogleGenAI({ apiKey })`
 */
export function createGeminiProxyClient(): GeminiProxyClient {
    return new GeminiProxyClient();
}

/**
 * Legacy API key getter - returns empty string with warning
 * This ensures old code doesn't break but alerts developers
 */
export function getApiKey(): string {
    console.warn(
        '⚠️  Direct API key access is deprecated for security reasons. ' +
        'Use createGeminiProxyClient() instead.'
    );
    return '';
}
