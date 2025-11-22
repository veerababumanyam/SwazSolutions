import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_CHAT, SYSTEM_INSTRUCTION_PROMPT_ENGINEER, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST, DEFAULT_RHYME_SCHEME } from "./config";
import { Message, PromptEnhancementResult, GenerationSettings, LanguageProfile } from "./types";
import { wrapGenAIError } from "../utils";
import { AUTO_OPTION } from "./constants";

// Define Part type locally to ensure type safety without depending on specific SDK exports
type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export interface ChatAgentOptions {
  image?: string; // Base64 string
  audio?: string; // Base64 string
}

/**
 * Filters history to maintain relevance while staying within token limits.
 * Implements a sliding window approach (Last 15 turns) which is efficient for chat.
 */
const getOptimizedHistory = (history: Message[]): { role: string, parts: Part[] }[] => {
  const MAX_HISTORY_TURNS = 15;

  // Filter for valid chat roles and slice the last N messages
  const recentHistory = history
    .filter(m => m.role === "user" || m.role === "model")
    .slice(-MAX_HISTORY_TURNS);

  return recentHistory.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));
};

/**
 * Generates a dynamic system instruction based on the conversation context.
 * This allows the agent to adapt its persona (e.g., empathetic vs. technical).
 */
const getDynamicInstruction = (history: Message[], currentInput: string) => {
  let instruction = SYSTEM_INSTRUCTION_CHAT;
  const lowerInput = currentInput.toLowerCase();

  // 1. Context: Feedback on Lyrics
  const lastModelMsg = [...history].reverse().find(m => m.role === "model");
  if (lastModelMsg?.lyricsData) {
    instruction += `\n\n[CONTEXT: POST-GENERATION]\nThe user is discussing the lyrics you just helped orchestrate.
    - If they offer critique, be humble and suggest specific linguistic or rhythmic fixes.
    - If they ask about the 'Raagam' or 'Thalam', explain like a knowledgeable music director.
    - If they are satisfied, suggest next steps (e.g., "Shall we try a different stanza?").`;
  }

  // 2. Intent: Emotional Tone Detection
  if (/(sad|pain|tears|breakup|lonely|loss)/i.test(lowerInput)) {
    instruction += `\n\n[TONE: EMPATHETIC]\nThe user seems to be in a somber mood. Respond with poetic empathy and gentleness.`;
  } else if (/(party|dance|beat|energy|fast|fun)/i.test(lowerInput)) {
    instruction += `\n\n[TONE: ENERGETIC]\nThe user wants high energy. Keep your responses punchy, rhythmic, and enthusiastic.`;
  }

  return instruction;
};

/**
 * PROMPT ENGINEER AGENT 
 * Transforms raw user input into enhanced prompts and infers missing settings
 */
export const runPromptEngineerAgent = async (
  userInput: string,
  sidebarSettings: GenerationSettings,
  languageProfile: LanguageProfile,
  chatHistory: Message[],
  apiKey: string,
  selectedModel?: string
): Promise<PromptEnhancementResult> => {
  if (!apiKey) throw new Error("API Key is missing. Please configure it in settings.");

  const ai = new GoogleGenAI({ apiKey });

  // Build context from chat history
  const historyContext = getOptimizedHistory(chatHistory);

  // Build analysis of current settings (what's missing vs what's set)
  const settingsAnalysis = `
CURRENT USER SETTINGS:
- Ceremony: ${sidebarSettings.ceremony || 'Not selected'}
- Mood: ${sidebarSettings.mood === AUTO_OPTION ? 'Auto (needs inference)' : sidebarSettings.mood}
- Style: ${sidebarSettings.style === AUTO_OPTION ? 'Auto (needs inference)' : sidebarSettings.style}
- Theme: ${sidebarSettings.theme === AUTO_OPTION ? 'Auto (needs inference)' : sidebarSettings.theme}
- Rhyme Scheme: ${sidebarSettings.rhymeScheme === AUTO_OPTION ? 'Auto (needs inference)' : sidebarSettings.rhymeScheme}
- Singer Config: ${sidebarSettings.singerConfig === AUTO_OPTION ? 'Auto (needs inference)' : sidebarSettings.singerConfig}
- Complexity: ${sidebarSettings.complexity === AUTO_OPTION ? 'Auto (needs inference)' : sidebarSettings.complexity}
- Languages: Primary=${languageProfile.primary}, Secondary=${languageProfile.secondary}, Tertiary=${languageProfile.tertiary}

USER REQUEST: "${userInput}"

TASK:
1. Enhance the user's request to be more specific and detailed
2. For any setting marked as "Auto (needs inference)", suggest an appropriate value based on the request
3. Do NOT override settings that are already specified
4. If rhyme scheme is "Auto", suggest "${DEFAULT_RHYME_SCHEME}" as default
5. Ensure all suggested settings are coherent with each other
6. Consider the chat history for context
7. Generate a creative Suno.com style prompt (music style description)
   - For Indian/Asian songs: Mix global genres with native instruments (Fusion)
   - For Western songs: Use specific sub-genres and authentic instrumentation
   - Examples: "Cinematic Bollywood Fusion, Tabla, Sitar, Orchestral Strings"
   - Examples: "Acoustic Pop Ballad, Piano, Soft Guitar, Emotional Vocals"

RESPOND WITH VALID JSON ONLY (no markdown, no extra text):
{
  "enhancedPrompt": "detailed, specific prompt",
  "stylePrompt": "creative music style description for Suno.com",
  "inferredSettings": {
    "mood": "suggested mood or null",
    "style": "suggested style or null",
    "theme": "suggested theme or null",
    "rhymeScheme": "suggested rhyme or null",
    "singerConfig": "suggested singer or null",
    "complexity": "suggested complexity or null"
  },
  "confidenceScore": 0.85,
  "reasoningLog": "Brief explanation of your decisions"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: getModelToUse(selectedModel, MODEL_FAST),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PROMPT_ENGINEER,
        temperature: AGENT_TEMPERATURES.CHAT,
        topP: AGENT_TOP_P.CHAT,
        topK: 40,
        responseMimeType: "application/json"
      },
      contents: [
        ...historyContext,
        { role: "user", parts: [{ text: settingsAnalysis }] }
      ]
    });

    const responseText = response.text;
    const parsed = JSON.parse(responseText);

    return {
      enhancedPrompt: parsed.enhancedPrompt || userInput,
      stylePrompt: parsed.stylePrompt || "Cinematic, Fusion", // NEW: Style prompt generated here
      inferredSettings: parsed.inferredSettings || {},
      confidenceScore: parsed.confidenceScore || 0.5,
      reasoningLog: parsed.reasoningLog || "No reasoning provided"
    };

  } catch (error) {
    console.warn("Prompt Engineer Agent failed, using fallback...", error);

    // Fallback: Return original input with defaults
    return {
      enhancedPrompt: userInput,
      stylePrompt: "Cinematic, Emotional", // Fallback style
      inferredSettings: {
        rhymeScheme: DEFAULT_RHYME_SCHEME
      },
      confidenceScore: 0.3,
      reasoningLog: "Fallback mode: Agent failed, using defaults"
    };
  }
};

/**
 * CHAT AGENT (Original functionality)
 * Used for conversational interactions, not part of lyric workflow
 */
export const runChatAgent = async (
  text: string,
  history: Message[],
  options: ChatAgentOptions | undefined,
  apiKey?: string,
  selectedModel?: string
) => {
  const key = apiKey;
  if (!key) throw new Error("API Key is missing. Please configure it in settings.");

  const ai = new GoogleGenAI({ apiKey: key });

  // 1. Optimize Context
  const chatHistory = getOptimizedHistory(history);

  // 2. Construct Current Message (Text + Optional Multi-modal)
  const currentParts: Part[] = [{ text: text }];

  if (options?.image) {
    currentParts.push({
      inlineData: { mimeType: "image/jpeg", data: options.image }
    });
  }

  if (options?.audio) {
    currentParts.push({
      inlineData: { mimeType: "audio/mp3", data: options.audio }
    });
  }

  const contents = [
    ...chatHistory,
    { role: "user", parts: currentParts }
  ];

  // 3. Determine Dynamic Instruction
  const systemInstruction = getDynamicInstruction(history, text);

  try {
    // 4. API Call
    const response = await ai.models.generateContent({
      model: getModelToUse(selectedModel),
      config: {
        systemInstruction: systemInstruction,
        temperature: AGENT_TEMPERATURES.CHAT,
        topP: AGENT_TOP_P.CHAT,
        topK: 40
      },
      contents: contents
    });

    return response.text || "I'm listening... could you tell me more?";

  } catch (error) {
    console.warn("Chat Agent initial attempt failed, retrying...", error);

    // 5. Retry Strategy: Fallback to basic context if complex context fails
    try {
      const retryResponse = await ai.models.generateContent({
        model: getModelToUse(selectedModel),
        config: { systemInstruction: SYSTEM_INSTRUCTION_CHAT },
        contents: [{ role: "user", parts: [{ text: text }] }]
      });
      return retryResponse.text || "I apologize, I'm having trouble connecting to the muse right now.";
    } catch (retryError) {
      console.error("Chat Agent retry failed:", retryError);
      throw wrapGenAIError(retryError);
    }
  }
};