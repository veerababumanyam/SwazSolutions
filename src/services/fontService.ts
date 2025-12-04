// Font configuration service - fetches from backend and caches locally

import { FontOption } from '../types/fonts.types';

let fontCache: FontOption[] | null = null;

/**
 * Fetches all available font options from the backend
 */
export async function fetchFonts(): Promise<FontOption[]> {
    if (fontCache) {
        return fontCache;
    }

    try {
        const response = await fetch('/api/fonts');
        if (!response.ok) throw new Error('Failed to fetch fonts');

        const data = await response.json();
        fontCache = data.fonts;
        return fontCache;
    } catch (error) {
        console.error('Error fetching fonts:', error);
        return [];
    }
}

/**
 * Gets fonts grouped by category
 */
export async function getFontsGroupedByCategory(): Promise<Record<string, FontOption[]>> {
    const fonts = await fetchFonts();

    return {
        modern: fonts.filter(f => f.category === 'modern'),
        telugu: fonts.filter(f => f.category === 'telugu'),
        tamil: fonts.filter(f => f.category === 'tamil'),
        kannada: fonts.filter(f => f.category === 'kannada'),
        malayalam: fonts.filter(f => f.category === 'malayalam'),
        hindi: fonts.filter(f => f.category === 'hindi'),
    };
}

/**
 * Finds a font by its CSS value
 */
export async function getFontByValue(value: string): Promise<FontOption | undefined> {
    const fonts = await fetchFonts();
    return fonts.find(f => f.value === value);
}

/**
 * Clears the font cache (useful for testing)
 */
export function clearFontCache(): void {
    fontCache = null;
}
