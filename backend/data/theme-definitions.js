// Theme Definitions for vCard System Themes
// 18 professionally designed themes across 6 categories
// All themes are WCAG 2.1 AA compliant with minimum 4.5:1 contrast ratio for text
// 
// Categories:
// 1. Aurora (3) - Soft, flowing gradient themes inspired by northern lights
// 2. Gradient (3) - Bold, modern gradient themes with vibrant colors
// 3. Glass (3) - Glassmorphism 2.0 themes with frosted effects
// 4. Minimal (3) - Clean, typography-focused themes
// 5. Dark (3) - Rich dark mode themes with accent colors
// 6. Visual (3) - Hero photo themes with profile image as header

// ====================
// FONT OPTIONS for vCard Typography
// Modern fonts + Indian language support (Telugu, Tamil, Kannada, Malayalam, Hindi)
// ====================

const FONT_OPTIONS = [
    // Modern Fonts
    {
        name: 'Inter',
        displayName: 'Inter',
        value: "'Inter', 'system-ui', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Inter',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'DM Sans',
        displayName: 'DM Sans',
        value: "'DM Sans', 'Inter', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'DM Sans',
        weights: [400, 500, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Space Grotesk',
        displayName: 'Space Grotesk',
        value: "'Space Grotesk', 'Inter', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Space Grotesk',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Poppins',
        displayName: 'Poppins',
        value: "'Poppins', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Poppins',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Montserrat',
        displayName: 'Montserrat',
        value: "'Montserrat', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Montserrat',
        weights: [400, 500, 600, 700, 800],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Outfit',
        displayName: 'Outfit',
        value: "'Outfit', 'Inter', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Outfit',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Manrope',
        displayName: 'Manrope',
        value: "'Manrope', 'Inter', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Manrope',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Lexend',
        displayName: 'Lexend',
        value: "'Lexend', 'Inter', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Lexend',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Plus Jakarta Sans',
        displayName: 'Plus Jakarta Sans',
        value: "'Plus Jakarta Sans', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Plus Jakarta Sans',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Sora',
        displayName: 'Sora',
        value: "'Sora', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Sora',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Raleway',
        displayName: 'Raleway',
        value: "'Raleway', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Raleway',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },
    {
        name: 'Nunito',
        displayName: 'Nunito',
        value: "'Nunito', 'sans-serif'",
        category: 'modern',
        language: null,
        googleFont: 'Nunito',
        weights: [400, 500, 600, 700],
        preview: 'The quick brown fox jumps over the lazy dog'
    },

    // Telugu Fonts
    {
        name: 'Anek Telugu',
        displayName: 'Anek Telugu (Telugu)',
        value: "'Anek Telugu', 'sans-serif'",
        category: 'telugu',
        language: 'Telugu',
        googleFont: 'Anek Telugu',
        weights: [400, 500, 600, 700],
        preview: 'తెలుగు లిపి - అందమైన ఫాంట్'
    },
    {
        name: 'Noto Sans Telugu',
        displayName: 'Noto Sans Telugu (Telugu)',
        value: "'Noto Sans Telugu', 'sans-serif'",
        category: 'telugu',
        language: 'Telugu',
        googleFont: 'Noto Sans Telugu',
        weights: [400, 500, 600, 700],
        preview: 'తెలుగు లిపి - స్పష్టమైన ఫాంట్'
    },
    {
        name: 'Tiro Telugu',
        displayName: 'Tiro Telugu (Telugu)',
        value: "'Tiro Telugu', 'serif'",
        category: 'telugu',
        language: 'Telugu',
        googleFont: 'Tiro Telugu',
        weights: [400],
        preview: 'తెలుగు లిపి - సాంప్రదాయ శైలి'
    },
    {
        name: 'Hind Guntur',
        displayName: 'Hind Guntur (Telugu)',
        value: "'Hind Guntur', 'sans-serif'",
        category: 'telugu',
        language: 'Telugu',
        googleFont: 'Hind Guntur',
        weights: [300, 400, 500, 600, 700],
        preview: 'తెలుగు లిపి - ఆధునిక ఫాంట్'
    },

    // Tamil Fonts
    {
        name: 'Anek Tamil',
        displayName: 'Anek Tamil (Tamil)',
        value: "'Anek Tamil', 'sans-serif'",
        category: 'tamil',
        language: 'Tamil',
        googleFont: 'Anek Tamil',
        weights: [400, 500, 600, 700],
        preview: 'தமிழ் எழுத்து - அழகான எழுத்துரு'
    },
    {
        name: 'Noto Sans Tamil',
        displayName: 'Noto Sans Tamil (Tamil)',
        value: "'Noto Sans Tamil', 'sans-serif'",
        category: 'tamil',
        language: 'Tamil',
        googleFont: 'Noto Sans Tamil',
        weights: [400, 500, 600, 700],
        preview: 'தமிழ் எழுத்து - தெளிவான எழுத்துரு'
    },
    {
        name: 'Catamaran',
        displayName: 'Catamaran (Tamil)',
        value: "'Catamaran', 'sans-serif'",
        category: 'tamil',
        language: 'Tamil',
        googleFont: 'Catamaran',
        weights: [400, 500, 600, 700, 800],
        preview: 'தமிழ் எழுத்து - நவீன எழுத்துரு'
    },
    {
        name: 'Hind Madurai',
        displayName: 'Hind Madurai (Tamil)',
        value: "'Hind Madurai', 'sans-serif'",
        category: 'tamil',
        language: 'Tamil',
        googleFont: 'Hind Madurai',
        weights: [300, 400, 500, 600, 700],
        preview: 'தமிழ் எழுத்து - எளிய எழுத்துரு'
    },

    // Kannada Fonts
    {
        name: 'Anek Kannada',
        displayName: 'Anek Kannada (Kannada)',
        value: "'Anek Kannada', 'sans-serif'",
        category: 'kannada',
        language: 'Kannada',
        googleFont: 'Anek Kannada',
        weights: [400, 500, 600, 700],
        preview: 'ಕನ್ನಡ ಲಿಪಿ - ಸುಂದರ ಫಾಂಟ್'
    },
    {
        name: 'Noto Sans Kannada',
        displayName: 'Noto Sans Kannada (Kannada)',
        value: "'Noto Sans Kannada', 'sans-serif'",
        category: 'kannada',
        language: 'Kannada',
        googleFont: 'Noto Sans Kannada',
        weights: [400, 500, 600, 700],
        preview: 'ಕನ್ನಡ ಲಿಪಿ - ಸ್ಪಷ್ಟ ಫಾಂಟ್'
    },
    {
        name: 'Noto Serif Kannada',
        displayName: 'Noto Serif Kannada (Kannada)',
        value: "'Noto Serif Kannada', 'serif'",
        category: 'kannada',
        language: 'Kannada',
        googleFont: 'Noto Serif Kannada',
        weights: [400, 500, 600, 700],
        preview: 'ಕನ್ನಡ ಲಿಪಿ - ಸಾಂಪ್ರದಾಯಿಕ ಶೈಲಿ'
    },
    {
        name: 'Baloo Tamma 2',
        displayName: 'Baloo Tamma 2 (Kannada)',
        value: "'Baloo Tamma 2', 'sans-serif'",
        category: 'kannada',
        language: 'Kannada',
        googleFont: 'Baloo Tamma 2',
        weights: [400, 500, 600, 700, 800],
        preview: 'ಕನ್ನಡ ಲಿಪಿ - ಆಧುನಿಕ ಫಾಂಟ್'
    },

    // Malayalam Fonts
    {
        name: 'Anek Malayalam',
        displayName: 'Anek Malayalam (Malayalam)',
        value: "'Anek Malayalam', 'sans-serif'",
        category: 'malayalam',
        language: 'Malayalam',
        googleFont: 'Anek Malayalam',
        weights: [400, 500, 600, 700],
        preview: 'മലയാളം ലിപി - മനോഹരമായ ഫോണ്ട്'
    },
    {
        name: 'Noto Sans Malayalam',
        displayName: 'Noto Sans Malayalam (Malayalam)',
        value: "'Noto Sans Malayalam', 'sans-serif'",
        category: 'malayalam',
        language: 'Malayalam',
        googleFont: 'Noto Sans Malayalam',
        weights: [400, 500, 600, 700],
        preview: 'മലയാളം ലിപി - വ്യക്തമായ ഫോണ്ട്'
    },
    {
        name: 'Noto Serif Malayalam',
        displayName: 'Noto Serif Malayalam (Malayalam)',
        value: "'Noto Serif Malayalam', 'serif'",
        category: 'malayalam',
        language: 'Malayalam',
        googleFont: 'Noto Serif Malayalam',
        weights: [400, 500, 600, 700],
        preview: 'മലയാളം ലിപി - പരമ്പരാഗത ശൈലി'
    },
    {
        name: 'Chilanka',
        displayName: 'Chilanka (Malayalam)',
        value: "'Chilanka', 'cursive'",
        category: 'malayalam',
        language: 'Malayalam',
        googleFont: 'Chilanka',
        weights: [400],
        preview: 'മലയാളം ലിപി - കൈപ്പട ശൈലി'
    },

    // Hindi/Devanagari Fonts
    {
        name: 'Anek Devanagari',
        displayName: 'Anek Devanagari (Hindi)',
        value: "'Anek Devanagari', 'sans-serif'",
        category: 'hindi',
        language: 'Hindi',
        googleFont: 'Anek Devanagari',
        weights: [400, 500, 600, 700],
        preview: 'हिंदी लिपि - सुंदर फ़ॉन्ट'
    },
    {
        name: 'Noto Sans Devanagari',
        displayName: 'Noto Sans Devanagari (Hindi)',
        value: "'Noto Sans Devanagari', 'sans-serif'",
        category: 'hindi',
        language: 'Hindi',
        googleFont: 'Noto Sans Devanagari',
        weights: [400, 500, 600, 700],
        preview: 'हिंदी लिपि - स्पष्ट फ़ॉन्ट'
    },
    {
        name: 'Hind',
        displayName: 'Hind (Hindi)',
        value: "'Hind', 'sans-serif'",
        category: 'hindi',
        language: 'Hindi',
        googleFont: 'Hind',
        weights: [300, 400, 500, 600, 700],
        preview: 'हिंदी लिपि - आधुनिक फ़ॉन्ट'
    },
    {
        name: 'Tiro Devanagari Hindi',
        displayName: 'Tiro Devanagari Hindi (Hindi)',
        value: "'Tiro Devanagari Hindi', 'serif'",
        category: 'hindi',
        language: 'Hindi',
        googleFont: 'Tiro Devanagari Hindi',
        weights: [400],
        preview: 'हिंदी लिपि - पारंपरिक शैली'
    }
];


const THEME_DEFINITIONS = [
    // ====================
    // AURORA THEMES (Soft, flowing gradients)
    // Inspired by northern lights and natural phenomena
    // ====================
    {
        name: "Aurora Borealis",
        category: "aurora",
        colors: {
            background: "#F0F9FF",
            backgroundSecondary: "#E0F2FE",
            primary: "#0EA5E9",
            secondary: "#22D3EE",
            accent: "#06B6D4",
            text: "#0C4A6E",             // 7.2:1 contrast ✓
            textSecondary: "#0369A1",    // 4.8:1 contrast ✓
            border: "#BAE6FD"
        },
        wallpaper: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)",
        typography: {
            fontFamily: "'Inter', 'system-ui', 'sans-serif'",
            headingFont: "'Plus Jakarta Sans', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 2px 8px rgba(102, 126, 234, 0.15)",
                md: "0 8px 24px rgba(102, 126, 234, 0.2)",
                lg: "0 16px 48px rgba(102, 126, 234, 0.25)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "4px",
            borderColor: "#FFFFFF",
            shadow: "0 8px 24px rgba(102, 126, 234, 0.4)"
        }
    },

    {
        name: "Sunset Aurora",
        category: "aurora",
        colors: {
            background: "#FFF7ED",
            backgroundSecondary: "#FFEDD5",
            primary: "#F97316",
            secondary: "#FB923C",
            accent: "#EA580C",
            text: "#7C2D12",             // 7.8:1 contrast ✓
            textSecondary: "#9A3412",    // 5.1:1 contrast ✓
            border: "#FED7AA"
        },
        wallpaper: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fad0c4 50%, #ffd1ff 75%, #fa709a 100%)",
        typography: {
            fontFamily: "'Outfit', 'Inter', 'sans-serif'",
            headingFont: "'Sora', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 2px 8px rgba(249, 115, 22, 0.12)",
                md: "0 8px 24px rgba(249, 115, 22, 0.18)",
                lg: "0 16px 48px rgba(249, 115, 22, 0.24)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "4px",
            borderColor: "#FFFFFF",
            shadow: "0 8px 24px rgba(249, 115, 22, 0.35)"
        }
    },

    {
        name: "Mint Aurora",
        category: "aurora",
        colors: {
            background: "#F0FDF4",
            backgroundSecondary: "#DCFCE7",
            primary: "#10B981",
            secondary: "#34D399",
            accent: "#059669",
            text: "#064E3B",             // 8.2:1 contrast ✓
            textSecondary: "#047857",    // 5.3:1 contrast ✓
            border: "#A7F3D0"
        },
        wallpaper: "linear-gradient(135deg, #11998e 0%, #38ef7d 30%, #a8edea 60%, #fed6e3 100%)",
        typography: {
            fontFamily: "'Space Grotesk', 'Inter', 'sans-serif'",
            headingFont: "'Satoshi', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 2px 8px rgba(16, 185, 129, 0.12)",
                md: "0 8px 24px rgba(16, 185, 129, 0.18)",
                lg: "0 16px 48px rgba(16, 185, 129, 0.24)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "4px",
            borderColor: "#FFFFFF",
            shadow: "0 8px 24px rgba(16, 185, 129, 0.35)"
        }
    },

    // ====================
    // GRADIENT THEMES (Bold, vibrant modern gradients)
    // High-energy, eye-catching designs
    // ====================
    {
        name: "Electric Violet",
        category: "gradient",
        colors: {
            background: "#FAF5FF",
            backgroundSecondary: "#F3E8FF",
            primary: "#8B5CF6",
            secondary: "#A78BFA",
            accent: "#7C3AED",
            text: "#3B0764",             // 10.5:1 contrast ✓
            textSecondary: "#6B21A8",    // 5.6:1 contrast ✓
            border: "#DDD6FE"
        },
        wallpaper: "linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 80%, #f5576c 100%)",
        typography: {
            fontFamily: "'DM Sans', 'Inter', 'sans-serif'",
            headingFont: "'Clash Display', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 600, bold: 800 }
        },
        layout: {
            maxWidth: "1280px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "1rem", md: "1.5rem", lg: "2rem" },
            shadows: {
                sm: "0 4px 12px rgba(139, 92, 246, 0.15)",
                md: "0 12px 32px rgba(139, 92, 246, 0.25)",
                lg: "0 24px 64px rgba(139, 92, 246, 0.35)"
            }
        },
        avatar: {
            shape: "circle",
            size: "140px",
            borderWidth: "5px",
            borderColor: "#FFFFFF",
            shadow: "0 12px 32px rgba(139, 92, 246, 0.5)"
        }
    },

    {
        name: "Cyber Pink",
        category: "gradient",
        colors: {
            background: "#FDF2F8",
            backgroundSecondary: "#FCE7F3",
            primary: "#EC4899",
            secondary: "#F472B6",
            accent: "#DB2777",
            text: "#500724",             // 11.2:1 contrast ✓
            textSecondary: "#9D174D",    // 5.8:1 contrast ✓
            border: "#FBCFE8"
        },
        wallpaper: "linear-gradient(135deg, #f093fb 0%, #f5576c 30%, #ff6b9d 60%, #c44fff 100%)",
        typography: {
            fontFamily: "'Lexend', 'Inter', 'sans-serif'",
            headingFont: "'Cabinet Grotesk', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 600, bold: 800 }
        },
        layout: {
            maxWidth: "1280px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "1rem", md: "1.5rem", lg: "2rem" },
            shadows: {
                sm: "0 4px 12px rgba(236, 72, 153, 0.15)",
                md: "0 12px 32px rgba(236, 72, 153, 0.25)",
                lg: "0 24px 64px rgba(236, 72, 153, 0.35)"
            }
        },
        avatar: {
            shape: "circle",
            size: "140px",
            borderWidth: "5px",
            borderColor: "#FFFFFF",
            shadow: "0 12px 32px rgba(236, 72, 153, 0.5)"
        }
    },

    {
        name: "Ocean Depths",
        category: "gradient",
        colors: {
            background: "#F0FDFA",
            backgroundSecondary: "#CCFBF1",
            primary: "#14B8A6",
            secondary: "#2DD4BF",
            accent: "#0D9488",
            text: "#042F2E",             // 12.1:1 contrast ✓
            textSecondary: "#115E59",    // 6.2:1 contrast ✓
            border: "#99F6E4"
        },
        wallpaper: "linear-gradient(135deg, #0093E9 0%, #80D0C7 30%, #00d4ff 60%, #0077b6 100%)",
        typography: {
            fontFamily: "'Manrope', 'Inter', 'sans-serif'",
            headingFont: "'General Sans', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 600, bold: 800 }
        },
        layout: {
            maxWidth: "1280px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "1rem", md: "1.5rem", lg: "2rem" },
            shadows: {
                sm: "0 4px 12px rgba(20, 184, 166, 0.15)",
                md: "0 12px 32px rgba(20, 184, 166, 0.25)",
                lg: "0 24px 64px rgba(20, 184, 166, 0.35)"
            }
        },
        avatar: {
            shape: "circle",
            size: "140px",
            borderWidth: "5px",
            borderColor: "#FFFFFF",
            shadow: "0 12px 32px rgba(20, 184, 166, 0.5)"
        }
    },

    // ====================
    // GLASS THEMES (Glassmorphism 2.0)
    // Frosted glass effects with subtle gradients
    // ====================
    {
        name: "Crystal Clear",
        category: "glass",
        colors: {
            background: "#FFFFFF",
            backgroundSecondary: "rgba(255, 255, 255, 0.8)",
            primary: "#6366F1",
            secondary: "#818CF8",
            accent: "#4F46E5",
            text: "#1E1B4B",             // 13.8:1 contrast ✓
            textSecondary: "#3730A3",    // 7.2:1 contrast ✓
            border: "rgba(99, 102, 241, 0.2)"
        },
        wallpaper: "linear-gradient(135deg, #E8F0FE 0%, #F3E8FF 50%, #FCE7F3 100%)",
        typography: {
            fontFamily: "'Inter', 'system-ui', 'sans-serif'",
            headingFont: "'Archivo', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 4px 16px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                md: "0 8px 32px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                lg: "0 16px 64px rgba(99, 102, 241, 0.16), inset 0 1px 0 rgba(255,255,255,0.8)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "rgba(255, 255, 255, 0.8)",
            shadow: "0 8px 32px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)"
        }
    },

    {
        name: "Frosted Rose",
        category: "glass",
        colors: {
            background: "#FFFBFB",
            backgroundSecondary: "rgba(255, 251, 251, 0.85)",
            primary: "#F43F5E",
            secondary: "#FB7185",
            accent: "#E11D48",
            text: "#4C0519",             // 12.5:1 contrast ✓
            textSecondary: "#881337",    // 6.8:1 contrast ✓
            border: "rgba(244, 63, 94, 0.2)"
        },
        wallpaper: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 30%, #FECDD3 60%, #FDA4AF 100%)",
        typography: {
            fontFamily: "'Nunito Sans', 'Inter', 'sans-serif'",
            headingFont: "'Red Hat Display', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 4px 16px rgba(244, 63, 94, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                md: "0 8px 32px rgba(244, 63, 94, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                lg: "0 16px 64px rgba(244, 63, 94, 0.16), inset 0 1px 0 rgba(255,255,255,0.8)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "rgba(255, 255, 255, 0.8)",
            shadow: "0 8px 32px rgba(244, 63, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)"
        }
    },

    {
        name: "Arctic Mist",
        category: "glass",
        colors: {
            background: "#F8FAFC",
            backgroundSecondary: "rgba(248, 250, 252, 0.85)",
            primary: "#0EA5E9",
            secondary: "#38BDF8",
            accent: "#0284C7",
            text: "#0C4A6E",             // 7.4:1 contrast ✓
            textSecondary: "#0369A1",    // 4.9:1 contrast ✓
            border: "rgba(14, 165, 233, 0.2)"
        },
        wallpaper: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 30%, #7DD3FC 60%, #38BDF8 100%)",
        typography: {
            fontFamily: "'Public Sans', 'Inter', 'sans-serif'",
            headingFont: "'Figtree', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 4px 16px rgba(14, 165, 233, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                md: "0 8px 32px rgba(14, 165, 233, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                lg: "0 16px 64px rgba(14, 165, 233, 0.16), inset 0 1px 0 rgba(255,255,255,0.8)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "rgba(255, 255, 255, 0.8)",
            shadow: "0 8px 32px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)"
        }
    },

    // ====================
    // MINIMAL THEMES (Clean, typography-focused)
    // Bento-box inspired, content-first designs
    // ====================
    {
        name: "Paper White",
        category: "minimal",
        colors: {
            background: "#FFFFFF",
            backgroundSecondary: "#FAFAFA",
            primary: "#18181B",
            secondary: "#3F3F46",
            accent: "#27272A",
            text: "#09090B",             // 21:1 contrast ✓
            textSecondary: "#52525B",    // 7.0:1 contrast ✓
            border: "#E4E4E7"
        },
        typography: {
            fontFamily: "'IBM Plex Sans', 'system-ui', 'sans-serif'",
            headingFont: "'IBM Plex Serif', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1000px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
            shadows: {
                sm: "0 1px 2px rgba(0,0,0,0.05)",
                md: "0 2px 8px rgba(0,0,0,0.08)",
                lg: "0 4px 16px rgba(0,0,0,0.1)"
            }
        },
        avatar: {
            shape: "rounded",
            size: "100px",
            borderWidth: "2px",
            borderColor: "#E4E4E7",
            shadow: "0 2px 8px rgba(0,0,0,0.08)"
        }
    },

    {
        name: "Warm Stone",
        category: "minimal",
        colors: {
            background: "#FAFAF9",
            backgroundSecondary: "#F5F5F4",
            primary: "#57534E",
            secondary: "#78716C",
            accent: "#44403C",
            text: "#1C1917",             // 18.5:1 contrast ✓
            textSecondary: "#57534E",    // 7.3:1 contrast ✓
            border: "#D6D3D1"
        },
        typography: {
            fontFamily: "'Source Sans 3', 'system-ui', 'sans-serif'",
            headingFont: "'Libre Baskerville', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1000px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 1px 2px rgba(87, 83, 78, 0.06)",
                md: "0 2px 8px rgba(87, 83, 78, 0.1)",
                lg: "0 4px 16px rgba(87, 83, 78, 0.12)"
            }
        },
        avatar: {
            shape: "circle",
            size: "100px",
            borderWidth: "2px",
            borderColor: "#D6D3D1",
            shadow: "0 2px 8px rgba(87, 83, 78, 0.1)"
        }
    },

    {
        name: "Cool Slate",
        category: "minimal",
        colors: {
            background: "#F8FAFC",
            backgroundSecondary: "#F1F5F9",
            primary: "#475569",
            secondary: "#64748B",
            accent: "#334155",
            text: "#0F172A",             // 17.2:1 contrast ✓
            textSecondary: "#475569",    // 7.5:1 contrast ✓
            border: "#CBD5E1"
        },
        typography: {
            fontFamily: "'Work Sans', 'system-ui', 'sans-serif'",
            headingFont: "'Fraunces', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1000px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 1px 2px rgba(71, 85, 105, 0.06)",
                md: "0 2px 8px rgba(71, 85, 105, 0.1)",
                lg: "0 4px 16px rgba(71, 85, 105, 0.12)"
            }
        },
        avatar: {
            shape: "rounded",
            size: "100px",
            borderWidth: "2px",
            borderColor: "#CBD5E1",
            shadow: "0 2px 8px rgba(71, 85, 105, 0.1)"
        }
    },

    // ====================
    // DARK THEMES (Rich dark mode)
    // High contrast, accessible dark designs
    // ====================
    {
        name: "Midnight Purple",
        category: "dark",
        colors: {
            background: "#0F0A1E",
            backgroundSecondary: "#1A1433",
            primary: "#A855F7",
            secondary: "#C084FC",
            accent: "#9333EA",
            text: "#F5F3FF",             // 15.8:1 contrast ✓
            textSecondary: "#C4B5FD",    // 8.2:1 contrast ✓
            border: "#3B2C5C"
        },
        wallpaper: "linear-gradient(135deg, #0F0A1E 0%, #1A1433 40%, #2D1F4F 70%, #1A1433 100%)",
        typography: {
            fontFamily: "'Outfit', 'Inter', 'sans-serif'",
            headingFont: "'Syne', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.75rem", md: "1rem", lg: "1.25rem" },
            shadows: {
                sm: "0 2px 8px rgba(168, 85, 247, 0.15)",
                md: "0 8px 24px rgba(168, 85, 247, 0.2)",
                lg: "0 16px 48px rgba(168, 85, 247, 0.25)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "#A855F7",
            shadow: "0 0 32px rgba(168, 85, 247, 0.5)"
        }
    },

    {
        name: "Neon Noir",
        category: "dark",
        colors: {
            background: "#0A0A0A",
            backgroundSecondary: "#141414",
            primary: "#22D3EE",
            secondary: "#67E8F9",
            accent: "#06B6D4",
            text: "#ECFEFF",             // 19.2:1 contrast ✓
            textSecondary: "#A5F3FC",    // 13.5:1 contrast ✓
            border: "#1E3A40"
        },
        wallpaper: "linear-gradient(135deg, #0A0A0A 0%, #0D1B1E 40%, #142830 70%, #0A0A0A 100%)",
        typography: {
            fontFamily: "'Space Mono', 'Consolas', 'monospace'",
            headingFont: "'Orbitron', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 0 8px rgba(34, 211, 238, 0.2)",
                md: "0 0 16px rgba(34, 211, 238, 0.3)",
                lg: "0 0 32px rgba(34, 211, 238, 0.4)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "#22D3EE",
            shadow: "0 0 24px rgba(34, 211, 238, 0.6)"
        }
    },

    {
        name: "Charcoal Ember",
        category: "dark",
        colors: {
            background: "#0C0A09",
            backgroundSecondary: "#1C1917",
            primary: "#F97316",
            secondary: "#FB923C",
            accent: "#EA580C",
            text: "#FEF3C7",             // 17.5:1 contrast ✓
            textSecondary: "#FCD34D",    // 13.2:1 contrast ✓
            border: "#3D2B1F"
        },
        wallpaper: "linear-gradient(135deg, #0C0A09 0%, #1C1410 40%, #2D1F14 70%, #0C0A09 100%)",
        typography: {
            fontFamily: "'Bricolage Grotesque', 'Inter', 'sans-serif'",
            headingFont: "'Bebas Neue', 'Impact', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 2px 8px rgba(249, 115, 22, 0.15)",
                md: "0 8px 24px rgba(249, 115, 22, 0.2)",
                lg: "0 16px 48px rgba(249, 115, 22, 0.25)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "#F97316",
            shadow: "0 0 24px rgba(249, 115, 22, 0.5)"
        }
    },

    // ====================
    // VISUAL THEMES (Hero Photo Style)
    // Profile photo as header with gradient fade
    // ====================
    {
        name: "Portrait Luxe",
        category: "visual",
        colors: {
            background: "#F5F0EB",
            backgroundSecondary: "#EDE5DD",
            primary: "#8B7355",
            secondary: "#A68B6E",
            accent: "#6B5B45",
            text: "#2D2A26",             // 11.5:1 contrast ✓
            textSecondary: "#5C574F",    // 5.2:1 contrast ✓
            border: "#DDD5CC"
        },
        typography: {
            fontFamily: "'Inter', 'system-ui', 'sans-serif'",
            headingFont: "'Cormorant Garamond', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2rem", h2: "1.75rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.75rem", md: "1rem", lg: "1.5rem" },
            shadows: {
                sm: "0 1px 2px rgba(0,0,0,0.05)",
                md: "0 4px 6px rgba(0,0,0,0.08)",
                lg: "0 10px 15px rgba(0,0,0,0.1)"
            }
        },
        avatar: {
            shape: "circle",
            size: "0px",
            borderWidth: "0px",
            borderColor: "transparent",
            shadow: "none"
        },
        headerBackground: {
            useProfilePhoto: true,
            height: "45%",
            overlayColor: "rgba(0, 0, 0, 0.1)",
            overlayOpacity: 10,
            blur: 0,
            fallbackGradient: "linear-gradient(135deg, #8B7355 0%, #A68B6E 50%, #C4A77D 100%)"
        }
    },

    {
        name: "Cinematic Noir",
        category: "visual",
        colors: {
            background: "#0A0A0A",
            backgroundSecondary: "#141414",
            primary: "#FFFFFF",
            secondary: "#A0A0A0",
            accent: "#E5E5E5",
            text: "#FFFFFF",             // 21:1 contrast ✓
            textSecondary: "#A3A3A3",    // 7.8:1 contrast ✓
            border: "#262626"
        },
        typography: {
            fontFamily: "'Outfit', 'Inter', 'sans-serif'",
            headingFont: "'Bebas Neue', 'Impact', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 2px 4px rgba(0,0,0,0.5)",
                md: "0 4px 12px rgba(0,0,0,0.6)",
                lg: "0 8px 24px rgba(0,0,0,0.7)"
            }
        },
        avatar: {
            shape: "circle",
            size: "0px",
            borderWidth: "0px",
            borderColor: "transparent",
            shadow: "none"
        },
        headerBackground: {
            useProfilePhoto: true,
            height: "50%",
            overlayColor: "rgba(0, 0, 0, 0.3)",
            overlayOpacity: 30,
            blur: 0,
            fallbackGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)"
        }
    },

    {
        name: "Soft Bloom",
        category: "visual",
        colors: {
            background: "#FFF5F7",
            backgroundSecondary: "#FFF0F3",
            primary: "#E07A9C",
            secondary: "#F2A6B9",
            accent: "#C55A7B",
            text: "#4A2C37",             // 9.8:1 contrast ✓
            textSecondary: "#7A4D5C",    // 5.1:1 contrast ✓
            border: "#FFD6E0"
        },
        typography: {
            fontFamily: "'Nunito', 'Poppins', 'sans-serif'",
            headingFont: "'Playfair Display', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1100px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.75rem" },
            shadows: {
                sm: "0 2px 4px rgba(224, 122, 156, 0.08)",
                md: "0 4px 8px rgba(224, 122, 156, 0.12)",
                lg: "0 8px 16px rgba(224, 122, 156, 0.16)"
            }
        },
        avatar: {
            shape: "circle",
            size: "0px",
            borderWidth: "0px",
            borderColor: "transparent",
            shadow: "none"
        },
        headerBackground: {
            useProfilePhoto: true,
            height: "45%",
            overlayColor: "rgba(255, 245, 247, 0.15)",
            overlayOpacity: 15,
            blur: 0,
            fallbackGradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #fad0c4 100%)"
        }
    }
];

module.exports = { THEME_DEFINITIONS, FONT_OPTIONS };
