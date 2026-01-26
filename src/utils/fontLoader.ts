// Font loader utility for loading locally hosted fonts
// Fonts are self-hosted in /public/fonts/ for offline support and better performance

let fontsLoaded = false;

/**
 * Loads all fonts from the local fonts.css file
 * This is called once on app initialization
 */
export function loadLocalFonts(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fontsLoaded) {
            resolve();
            return;
        }

        // Check if fonts.css already exists in the page
        const existing = document.querySelector('link[href="/fonts/fonts.css"]');
        if (existing) {
            fontsLoaded = true;
            resolve();
            return;
        }

        // Create and inject link element for local fonts
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/fonts/fonts.css';

        link.onload = () => {
            fontsLoaded = true;
            resolve();
        };

        link.onerror = () => {
            reject(new Error('Failed to load local fonts'));
        };

        document.head.appendChild(link);
    });
}

/**
 * Checks if fonts are loaded
 */
export function areFontsLoaded(): boolean {
    return fontsLoaded;
}

/**
 * Preloads fonts on app initialization
 * Call this in your main App component on mount
 */
export function preloadFonts(): void {
    loadLocalFonts().catch(() => {
        // Silently handle font loading errors
    });
}

/**
 * Legacy function for compatibility - now just loads all local fonts
 * @deprecated Use loadLocalFonts() instead
 */
export function loadGoogleFont(_fontFamily: string, _weights?: number[]): Promise<void> {
    return loadLocalFonts();
}

/**
 * Clears the loaded fonts flag (useful for testing)
 */
export function clearFontCache(): void {
    fontsLoaded = false;
}
