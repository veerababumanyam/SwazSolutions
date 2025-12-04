// Font configuration types for vCard typography system

export interface FontOption {
    name: string;                    // Font name (e.g., "Anek Telugu")
    displayName: string;             // Display name with language label (e.g., "Anek Telugu (Telugu)")
    value: string;                   // CSS font-family value
    category: 'modern' | 'telugu' | 'tamil' | 'kannada' | 'malayalam' | 'hindi';
    language: string | null;         // Language name or null for modern fonts
    googleFont: string;              // Google Fonts family name for dynamic loading
    weights: number[];               // Available font weights
    preview: string;                 // Sample preview text in respective script
}

export interface FontCategory {
    id: string;
    label: string;
    fonts: FontOption[];
}

export interface FontConfig {
    categories: FontCategory[];
    getAllFonts: () => FontOption[];
    getFontByValue: (value: string) => FontOption | undefined;
    getFontsByCategory: (category: string) => FontOption[];
}
