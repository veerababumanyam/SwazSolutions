// AI Profile Enhancement Service
// Uses Google Gemini to enhance Headline and Bio text based on profile type and tone

import { GoogleGenAI } from "@google/genai";
import { MODEL_FAST, getModelToUse } from "../agents/config";
import {
  PROFILE_TYPES,
  ENHANCEMENT_TONES,
  HEADLINE_MAX_LENGTH,
  BIO_MAX_LENGTH,
  ProfileType,
  EnhancementTone
} from "../constants/profileEnhancement";

export interface EnhancementRequest {
  text: string;
  profileTypeId: string;
  toneId: string;
  additionalContext?: string; // e.g., company name, skills, etc.
}

export interface EnhancementResult {
  enhancedText: string;
  originalText: string;
  profileType: string;
  tone: string;
}

const getProfileType = (id: string): ProfileType => {
  return PROFILE_TYPES.find(p => p.id === id) || PROFILE_TYPES[PROFILE_TYPES.length - 1];
};

const getTone = (id: string): EnhancementTone => {
  return ENHANCEMENT_TONES.find(t => t.id === id) || ENHANCEMENT_TONES[0];
};

/**
 * Enhances a headline using AI based on profile type and tone
 */
export const enhanceHeadline = async (
  request: EnhancementRequest,
  apiKey: string,
  selectedModel?: string
): Promise<EnhancementResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your Gemini API key in settings.");
  }

  const profileType = getProfileType(request.profileTypeId);
  const tone = getTone(request.toneId);

  const systemInstruction = `You are an expert professional copywriter specializing in creating compelling personal brand headlines for mobile apps.
Your task is to REWRITE and TRANSFORM the user's headline to make it significantly more impactful, memorable, and compelling.

CRITICAL REQUIREMENTS:
1. You MUST rewrite the headline - do NOT return the same text
2. STRICT LIMIT: Maximum 80-100 characters (this is for mobile display)
3. Be CONCISE - every word must count
4. Use the | (pipe) separator sparingly - max 2-3 segments
5. Be creative and make it stand out
6. Match the requested tone exactly
7. Use powerful action words
8. Return ONLY the new headline text, nothing else
9. Do not use quotation marks around the output
10. Do not add explanations or commentary`;

  const prompt = `PROFILE TYPE: ${profileType.label}
Profile Description: ${profileType.description}
Relevant Keywords to incorporate: ${profileType.keywords.join(', ')}

TONE: ${tone.label}
Tone Description: ${tone.description}

ORIGINAL HEADLINE TO REWRITE: "${request.text}"
${request.additionalContext ? `\nADDITIONAL CONTEXT: ${request.additionalContext}` : ''}

IMPORTANT: Create a NEW, IMPROVED headline that is DIFFERENT from the original. 
Transform it to be more compelling, use stronger words, and make it memorable.
The new headline should capture attention and clearly communicate value.
Do NOT simply return the original text - you must rewrite it completely.`;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("[ProfileEnhancement] Calling Gemini API for headline...");
    console.log("[ProfileEnhancement] Model:", getModelToUse(selectedModel, MODEL_FAST));
    console.log("[ProfileEnhancement] Temperature:", tone.temperature);
    
    const config = {
      systemInstruction,
      temperature: tone.temperature,
      topP: 0.95,
      maxOutputTokens: 8192,
      // @ts-ignore
      includeThoughts: false,
    };

    console.log("[ProfileEnhancement] Config:", JSON.stringify(config, null, 2));

    const response = await ai.models.generateContent({
      model: getModelToUse(selectedModel, MODEL_FAST),
      config,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    console.log("[ProfileEnhancement] Full response object:", JSON.stringify(response, null, 2));
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0] as any;
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("[ProfileEnhancement] Response truncated due to MAX_TOKENS. Consider increasing token limit further.");
      }
    }

    console.log("[ProfileEnhancement] response.text:", response.text);
    console.log("[ProfileEnhancement] response.candidates:", response.candidates);
    
    // Try multiple ways to get the text from the response
    let responseText: string | undefined = undefined;
    
    // Method 1: Direct text property
    if (typeof response.text === 'string' && response.text.trim()) {
      responseText = response.text;
      console.log("[ProfileEnhancement] Got text from response.text");
    }
    
    // Method 2: From candidates array
    if (!responseText && response.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
      const candidate = response.candidates[0] as any;
      console.log("[ProfileEnhancement] Candidate:", JSON.stringify(candidate, null, 2));
      
      if (candidate?.content?.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
        // Join all parts to ensure we capture the full response
        responseText = candidate.content.parts
          .map((part: any) => part.text || '')
          .join('')
          .trim();
          
        if (responseText) {
          console.log("[ProfileEnhancement] Got text from candidates[0].content.parts (joined)");
        }
      }
    }
    
    // Method 3: Try accessing as function if it's a getter
    if (!responseText && typeof (response as any).getText === 'function') {
      responseText = (response as any).getText();
      console.log("[ProfileEnhancement] Got text from getText() method");
    }
    
    console.log("[ProfileEnhancement] Final extracted text:", responseText);
    
    // Check if we got a valid response
    if (!responseText || responseText.trim() === '') {
      console.error("[ProfileEnhancement] Empty response from API");
      
      if (response.candidates && response.candidates.length > 0 && (response.candidates[0] as any).finishReason === "MAX_TOKENS") {
         throw new Error("AI response was truncated (MAX_TOKENS). Please try again.");
      }

      throw new Error("AI returned empty response. Please try again.");
    }
    
    let enhancedText = responseText.trim();
    
    // Remove any quotation marks that might have been added
    enhancedText = enhancedText.replace(/^["']|["']$/g, '');
    
    // Check if AI returned the same text (shouldn't happen with our prompts)
    if (enhancedText === request.text.trim()) {
      console.warn("[ProfileEnhancement] AI returned same text, forcing retry logic");
      throw new Error("AI returned unchanged text. Please try a different tone.");
    }
    
    // Ensure we stay within character limit
    if (enhancedText.length > HEADLINE_MAX_LENGTH) {
      enhancedText = enhancedText.substring(0, HEADLINE_MAX_LENGTH - 3) + '...';
    }

    console.log("[ProfileEnhancement] Enhanced headline:", enhancedText);
    
    return {
      enhancedText,
      originalText: request.text,
      profileType: profileType.label,
      tone: tone.label
    };
  } catch (error) {
    console.error("[ProfileEnhancement] Headline enhancement error:", error);
    throw error instanceof Error ? error : new Error("Failed to enhance headline. Please try again.");
  }
};

/**
 * Enhances a bio using AI based on profile type and tone
 */
export const enhanceBio = async (
  request: EnhancementRequest,
  apiKey: string,
  selectedModel?: string
): Promise<EnhancementResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your Gemini API key in settings.");
  }

  const profileType = getProfileType(request.profileTypeId);
  const tone = getTone(request.toneId);

  const systemInstruction = `You are an expert professional copywriter specializing in creating compelling personal bios for mobile apps.
Your task is to REWRITE and TRANSFORM the user's bio to make it significantly more engaging, impactful, and memorable.

CRITICAL REQUIREMENTS:
1. You MUST rewrite the bio - do NOT return the same text
2. STRICT LIMIT: Maximum 300-400 characters (this is for mobile display)
3. Keep it SHORT and PUNCHY - 2-3 sentences maximum
4. Lead with the most impactful statement
5. Match the requested tone exactly
6. Make every word count - no filler
7. Return ONLY the new bio text, nothing else
8. Do not use quotation marks around the output
9. Do not add explanations or commentary
10. Focus on ONE key differentiator`;

  const prompt = `PROFILE TYPE: ${profileType.label}
Profile Description: ${profileType.description}
Relevant Keywords to incorporate: ${profileType.keywords.join(', ')}

TONE: ${tone.label}
Tone Description: ${tone.description}

ORIGINAL BIO TO REWRITE: "${request.text}"
${request.additionalContext ? `\nADDITIONAL CONTEXT: ${request.additionalContext}` : ''}

IMPORTANT: Create a NEW, IMPROVED bio that is DIFFERENT from the original.
Transform it with:
- Stronger opening that hooks the reader
- Clear value proposition and expertise
- Engaging narrative that tells a story
- Professional yet personable voice matching the tone
- Specific achievements or differentiators

Do NOT simply return the original text - you must rewrite it completely to be more compelling.`;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("[ProfileEnhancement] Calling Gemini API for bio...");
    
    const config = {
      systemInstruction,
      temperature: tone.temperature,
      topP: 0.95,
      maxOutputTokens: 8192,
      // @ts-ignore
      includeThoughts: false,
    };

    console.log("[ProfileEnhancement] Bio Config:", JSON.stringify(config, null, 2));

    const response = await ai.models.generateContent({
      model: getModelToUse(selectedModel, MODEL_FAST),
      config,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0] as any;
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("[ProfileEnhancement] Bio response truncated due to MAX_TOKENS");
      }
    }

    // Try multiple ways to get the text from the response
    let responseText = response.text;
    
    // If response.text is undefined, try to extract from candidates
    if (!responseText && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        // Join all parts to ensure we capture the full response
        responseText = candidate.content.parts
          .map((part: any) => part.text || '')
          .join('')
          .trim();
      }
    }
    
    console.log("[ProfileEnhancement] Bio extracted text:", responseText);
    
    // Check if we got a valid response
    if (!responseText || responseText.trim() === '') {
      console.error("[ProfileEnhancement] Empty response from API for bio");
      
      if (response.candidates && response.candidates.length > 0 && (response.candidates[0] as any).finishReason === "MAX_TOKENS") {
         throw new Error("AI response was truncated (MAX_TOKENS). Please try again.");
      }

      throw new Error("AI returned empty response. Please try again.");
    }
    
    let enhancedText = responseText.trim();
    
    // Remove any quotation marks that might have been added
    enhancedText = enhancedText.replace(/^["']|["']$/g, '');
    
    // Check if AI returned the same text
    if (enhancedText === request.text.trim()) {
      console.warn("[ProfileEnhancement] AI returned same bio text");
      throw new Error("AI returned unchanged text. Please try a different tone.");
    }
    
    // Ensure we stay within character limit
    if (enhancedText.length > BIO_MAX_LENGTH) {
      enhancedText = enhancedText.substring(0, BIO_MAX_LENGTH - 3) + '...';
    }

    return {
      enhancedText,
      originalText: request.text,
      profileType: profileType.label,
      tone: tone.label
    };
  } catch (error) {
    console.error("Bio enhancement error:", error);
    throw new Error("Failed to enhance bio. Please try again.");
  }
};

/**
 * Get the API key from localStorage or environment
 */
export const getApiKey = (): string => {
  // Check localStorage first (user-configured)
  const storedKey = localStorage.getItem("swaz_gemini_api_key");
  if (storedKey) return storedKey;
  
  // Fall back to environment variable
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};
