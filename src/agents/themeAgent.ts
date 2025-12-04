/**
 * AI Theme Generation Agent
 * 
 * Uses Google Gemini to generate WCAG 2.1 AA compliant themes
 * based on user preferences and descriptions.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { API_KEY, MODEL_FAST, delay, RATE_LIMIT_DELAY } from './config';
import type { Theme, ThemeColors, AIThemePrompt, AIThemeResponse, ThemeCategory } from '../types/theme.types';
import { 
    validateThemeAccessibility, 
    adjustForContrast, 
    isLightColor,
    getContrastRatio,
    WCAG_AA_NORMAL_TEXT
} from '../utils/wcagValidator';

// Theme generation temperature - creative but structured
const THEME_TEMPERATURE = 0.75;

// System prompt for theme generation
const THEME_SYSTEM_PROMPT = `You are an expert UI/UX designer specializing in creating beautiful, accessible color themes.
Your task is to generate a complete theme configuration based on user preferences.

CRITICAL REQUIREMENTS:
1. ALL colors MUST meet WCAG 2.1 AA accessibility standards
2. Text colors must have at least 4.5:1 contrast ratio against backgrounds
3. Use modern 2024-2025 design trends: gradient meshes, soft organic shapes, muted pastels or rich darks
4. Create cohesive, professional color palettes

When generating themes:
- Background colors should be light (#F0F0F0+) or dark (#1A1A1A-) to ensure text readability
- Primary colors should be vibrant and work well for buttons
- Text colors must contrast strongly with background (dark text on light bg, light text on dark bg)
- Secondary text should be slightly lighter than primary text but still pass WCAG AA

You MUST respond with ONLY valid JSON in this exact structure (no markdown, no explanation):
{
    "name": "Theme Name",
    "category": "aurora|gradient|glass|minimal|dark|visual|ai-generated",
    "colors": {
        "background": "#HEXCODE",
        "backgroundSecondary": "#HEXCODE",
        "primary": "#HEXCODE",
        "secondary": "#HEXCODE",
        "accent": "#HEXCODE",
        "text": "#HEXCODE",
        "textSecondary": "#HEXCODE",
        "border": "#HEXCODE"
    },
    "wallpaper": "linear-gradient(135deg, #COLOR1 0%, #COLOR2 50%, #COLOR3 100%)",
    "typography": {
        "fontFamily": "'Font Name', 'Fallback', sans-serif",
        "headingFont": "'Heading Font', sans-serif",
        "baseFontSize": "16px",
        "headingSizes": { "h1": "2.5rem", "h2": "2rem", "h3": "1.5rem" },
        "fontWeights": { "normal": 400, "medium": 500, "bold": 700 }
    },
    "layout": {
        "maxWidth": "1200px",
        "spacing": { "xs": "0.5rem", "sm": "1rem", "md": "1.5rem", "lg": "2rem" },
        "borderRadius": { "sm": "0.75rem", "md": "1rem", "lg": "1.5rem" },
        "shadows": {
            "sm": "0 2px 8px rgba(0,0,0,0.1)",
            "md": "0 8px 24px rgba(0,0,0,0.15)",
            "lg": "0 16px 48px rgba(0,0,0,0.2)"
        }
    },
    "avatar": {
        "shape": "circle|rounded|square",
        "size": "120px",
        "borderWidth": "4px",
        "borderColor": "#HEXCODE",
        "shadow": "0 8px 24px rgba(0,0,0,0.3)"
    }
}`;

/**
 * Generate a theme using AI based on user preferences
 */
export async function generateAITheme(prompt: AIThemePrompt, apiKey?: string): Promise<AIThemeResponse> {
    const key = apiKey || API_KEY;
    if (!key) {
        return {
            success: false,
            message: 'AI API key not configured. Please add VITE_GEMINI_API_KEY to your environment.',
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: key });

        // Build the user prompt
        const userPrompt = buildUserPrompt(prompt);

        // Add rate limiting delay
        await delay(RATE_LIMIT_DELAY);

        // Generate the theme
        const result = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: `${THEME_SYSTEM_PROMPT}\n\n${userPrompt}`,
            config: {
                temperature: THEME_TEMPERATURE,
                topP: 0.9,
                maxOutputTokens: 2048,
            }
        });

        if (!result.text) {
            return {
                success: false,
                message: 'AI returned empty response. Please try again.',
            };
        }

        // Parse the JSON response
        const theme = parseThemeResponse(result.text);
        
        if (!theme) {
            return {
                success: false,
                message: 'Failed to parse AI response. Please try again.',
            };
        }

        // Validate and fix WCAG compliance
        const validatedTheme = validateAndFixTheme(theme);
        
        // Calculate accessibility score
        const accessibilityReport = validateThemeAccessibility(validatedTheme.colors);

        return {
            success: true,
            theme: {
                ...validatedTheme,
                isSystem: false,
                isAIGenerated: true,
                category: 'ai-generated' as ThemeCategory,
            },
            wcagScore: accessibilityReport.score,
            suggestions: accessibilityReport.issues.map(i => i.message),
        };

    } catch (error) {
        console.error('[AI Theme Agent] Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Build the user prompt from preferences
 */
function buildUserPrompt(prompt: AIThemePrompt): string {
    const parts: string[] = [];

    parts.push(`Create a theme with the following characteristics:`);
    
    if (prompt.mood) {
        parts.push(`- Mood/Vibe: ${prompt.mood}`);
    }
    
    if (prompt.industry) {
        parts.push(`- Industry/Use Case: ${prompt.industry}`);
    }
    
    if (prompt.colorPreference) {
        parts.push(`- Color Preference: ${prompt.colorPreference}`);
    }
    
    if (prompt.style) {
        parts.push(`- Design Style: ${prompt.style}`);
    }
    
    if (prompt.description) {
        parts.push(`- Additional Details: ${prompt.description}`);
    }

    parts.push(`\nRemember: All text must have at least 4.5:1 contrast ratio for WCAG 2.1 AA compliance.`);
    parts.push(`Generate a modern, trendy theme following 2024-2025 design trends.`);

    return parts.join('\n');
}

/**
 * Parse the AI response into a theme object
 */
function parseThemeResponse(text: string): Partial<Theme> | null {
    try {
        // Remove any markdown code blocks if present
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(jsonText);
        return parsed as Partial<Theme>;
    } catch (error) {
        console.error('[AI Theme Agent] JSON parse error:', error);
        console.error('[AI Theme Agent] Raw text:', text);
        return null;
    }
}

/**
 * Validate and fix theme for WCAG compliance
 */
function validateAndFixTheme(theme: Partial<Theme>): Theme {
    const colors = theme.colors || {} as ThemeColors;
    const bg = colors.background || '#FFFFFF';
    const bgIsLight = isLightColor(bg);

    // Ensure text colors meet WCAG AA requirements
    const fixedColors: ThemeColors = {
        background: colors.background || (bgIsLight ? '#FFFFFF' : '#0A0A0A'),
        backgroundSecondary: colors.backgroundSecondary || (bgIsLight ? '#F5F5F5' : '#141414'),
        primary: colors.primary || '#6366F1',
        secondary: colors.secondary || '#818CF8',
        accent: colors.accent || '#4F46E5',
        text: ensureContrast(colors.text, bg, bgIsLight ? '#0F172A' : '#F8FAFC'),
        textSecondary: ensureContrast(colors.textSecondary, bg, bgIsLight ? '#475569' : '#CBD5E1'),
        border: colors.border || (bgIsLight ? '#E2E8F0' : '#334155'),
    };

    // Validate button text contrast on primary color
    const primaryTextContrast = getContrastRatio('#FFFFFF', fixedColors.primary);
    if (primaryTextContrast < WCAG_AA_NORMAL_TEXT) {
        // If white doesn't work on primary, we need to adjust
        const blackContrast = getContrastRatio('#000000', fixedColors.primary);
        if (blackContrast > primaryTextContrast) {
            // Primary is too light, darken it
            fixedColors.primary = adjustForContrast('#FFFFFF', fixedColors.primary);
        }
    }

    return {
        name: theme.name || 'AI Generated Theme',
        category: 'ai-generated' as ThemeCategory,
        colors: fixedColors,
        typography: theme.typography || getDefaultTypography(),
        layout: theme.layout || getDefaultLayout(),
        avatar: theme.avatar || getDefaultAvatar(fixedColors.primary),
        wallpaper: theme.wallpaper,
        headerBackground: theme.headerBackground,
        isSystem: false,
        isAIGenerated: true,
    };
}

/**
 * Ensure a color meets contrast requirements against background
 */
function ensureContrast(color: string | undefined, background: string, fallback: string): string {
    if (!color) return fallback;
    
    const ratio = getContrastRatio(color, background);
    if (ratio >= WCAG_AA_NORMAL_TEXT) {
        return color;
    }
    
    // Try to adjust the color
    const adjusted = adjustForContrast(color, background);
    const adjustedRatio = getContrastRatio(adjusted, background);
    
    return adjustedRatio >= WCAG_AA_NORMAL_TEXT ? adjusted : fallback;
}

/**
 * Default typography settings
 */
function getDefaultTypography() {
    return {
        fontFamily: "'Inter', 'system-ui', 'sans-serif'",
        headingFont: "'Plus Jakarta Sans', 'sans-serif'",
        baseFontSize: "16px",
        headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
        fontWeights: { normal: 400, medium: 500, bold: 700 }
    };
}

/**
 * Default layout settings
 */
function getDefaultLayout() {
    return {
        maxWidth: "1200px",
        spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
        borderRadius: { sm: "0.75rem", md: "1rem", lg: "1.5rem" },
        shadows: {
            sm: "0 2px 8px rgba(0,0,0,0.1)",
            md: "0 8px 24px rgba(0,0,0,0.15)",
            lg: "0 16px 48px rgba(0,0,0,0.2)"
        }
    };
}

/**
 * Default avatar settings
 */
function getDefaultAvatar(primaryColor: string) {
    return {
        shape: 'circle' as const,
        size: "120px",
        borderWidth: "4px",
        borderColor: "#FFFFFF",
        shadow: `0 8px 24px ${primaryColor}40`
    };
}

/**
 * Quick theme presets based on common moods
 */
export const QUICK_THEME_PRESETS: Record<string, AIThemePrompt> = {
    professional: {
        mood: 'professional and trustworthy',
        style: 'minimal',
        colorPreference: 'blue and gray tones',
        industry: 'business',
    },
    creative: {
        mood: 'creative and artistic',
        style: 'bold gradient',
        colorPreference: 'vibrant purples and pinks',
        industry: 'design',
    },
    tech: {
        mood: 'modern and innovative',
        style: 'dark mode with neon accents',
        colorPreference: 'cyan and purple on dark',
        industry: 'technology',
    },
    nature: {
        mood: 'calm and natural',
        style: 'soft aurora',
        colorPreference: 'greens and earth tones',
        industry: 'wellness',
    },
    luxury: {
        mood: 'elegant and sophisticated',
        style: 'minimal with rich accents',
        colorPreference: 'gold, cream, and dark accents',
        industry: 'luxury',
    },
    playful: {
        mood: 'fun and energetic',
        style: 'vibrant gradient',
        colorPreference: 'warm oranges, pinks, and yellows',
        industry: 'entertainment',
    },
};

export default {
    generateAITheme,
    QUICK_THEME_PRESETS,
};
