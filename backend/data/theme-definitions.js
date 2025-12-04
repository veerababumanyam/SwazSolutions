// Theme Definitions for vCard System Themes
// 12 professionally designed themes across 4 categories

const THEME_DEFINITIONS = [
    // ====================
    // PROFESSIONAL THEMES
    // ====================
    {
        name: "Classic Blue",
        category: "professional",
        colors: {
            background: "#FFFFFF",
            backgroundSecondary: "#F8FAFC",
            primary: "#3B82F6",
            secondary: "#60A5FA",
            accent: "#2563EB",
            text: "#1F2937",
            textSecondary: "#6B7280",
            border: "#E5E7EB"
        },
        typography: {
            fontFamily: "'Inter', 'system-ui', 'sans-serif'",
            headingFont: "'Poppins', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.375rem", md: "0.5rem", lg: "1rem" },
            shadows: {
                sm: "0 1px 2px rgba(0,0,0,0.05)",
                md: "0 4px 6px rgba(0,0,0,0.1)",
                lg: "0 10px 15px rgba(0,0,0,0.1)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "4px",
            borderColor: "#3B82F6",
            shadow: "0 4px 6px rgba(59, 130, 246, 0.3)"
        }
    },

    {
        name: "Executive Gray",
        category: "professional",
        colors: {
            background: "#F9FAFB",
            backgroundSecondary: "#F3F4F6",
            primary: "#4B5563",
            secondary: "#6B7280",
            accent: "#374151",
            text: "#111827",
            textSecondary: "#6B7280",
            border: "#D1D5DB"
        },
        typography: {
            fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'",
            headingFont: "'Merriweather', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1100px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.25rem", md: "0.375rem", lg: "0.5rem" },
            shadows: {
                sm: "0 1px 3px rgba(0,0,0,0.08)",
                md: "0 4px 6px rgba(0,0,0,0.12)",
                lg: "0 10px 20px rgba(0,0,0,0.15)"
            }
        },
        avatar: {
            shape: "rounded",
            size: "110px",
            borderWidth: "3px",
            borderColor: "#4B5563",
            shadow: "0 4px 8px rgba(75, 85, 99, 0.25)"
        }
    },

    {
        name: "Corporate Navy",
        category: "professional",
        colors: {
            background: "#FFFFFF",
            backgroundSecondary: "#F0F4F8",
            primary: "#1E3A8A",
            secondary: "#3B82F6",
            accent: "#1E40AF",
            text: "#1F2937",
            textSecondary: "#4B5563",
            border: "#CBD5E1"
        },
        typography: {
            fontFamily: "'Open Sans', 'Helvetica', 'Arial', 'sans-serif'",
            headingFont: "'Playfair Display', 'Georgia', 'serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 600, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.75rem", lg: "2.25rem" },
            borderRadius: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
            shadows: {
                sm: "0 1px 2px rgba(30, 58, 138, 0.05)",
                md: "0 4px 6px rgba(30, 58, 138, 0.1)",
                lg: "0 10px 15px rgba(30, 58, 138, 0.15)"
            }
        },
        avatar: {
            shape: "circle",
            size: "130px",
            borderWidth: "5px",
            borderColor: "#1E3A8A",
            shadow: "0 6px 12px rgba(30, 58, 138, 0.3)"
        }
    },

    // ====================
    // MODERN THEMES
    // ====================
    {
        name: "Vibrant Gradient",
        category: "modern",
        colors: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSecondary: "#F9FAFB",
            primary: "#8B5CF6",
            secondary: "#A78BFA",
            accent: "#7C3AED",
            text: "#FFFFFF",
            textSecondary: "#E9D5FF",
            border: "rgba(255,255,255,0.2)"
        },
        typography: {
            fontFamily: "'Outfit', 'Inter', 'sans-serif'",
            headingFont: "'Montserrat', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 600, bold: 800 }
        },
        layout: {
            maxWidth: "1300px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "0.75rem", md: "1rem", lg: "1.5rem" },
            shadows: {
                sm: "0 2px 4px rgba(139, 92, 246, 0.1)",
                md: "0 8px 16px rgba(139, 92, 246, 0.2)",
                lg: "0 20px 40px rgba(139, 92, 246, 0.3)"
            }
        },
        avatar: {
            shape: "circle",
            size: "140px",
            borderWidth: "6px",
            borderColor: "#FFFFFF",
            shadow: "0 8px 16px rgba(139, 92, 246, 0.5)"
        }
    },

    {
        name: "Glassmorphism",
        category: "modern",
        colors: {
            background: "rgba(255, 255, 255, 0.1)",
            backgroundSecondary: "rgba(255, 255, 255, 0.05)",
            primary: "#06B6D4",
            secondary: "#22D3EE",
            accent: "#0891B2",
            text: "#0F172A",
            textSecondary: "#334155",
            border: "rgba(6, 182, 212, 0.2)"
        },
        typography: {
            fontFamily: "'Space Grotesk', 'Inter', 'sans-serif'",
            headingFont: "'Space Grotesk', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
            shadows: {
                sm: "0 4px 6px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                md: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
                lg: "0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "3px",
            borderColor: "rgba(6, 182, 212, 0.5)",
            shadow: "0 8px 32px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
        }
    },

    {
        name: "Neumorphic",
        category: "modern",
        colors: {
            background: "#E0E5EC",
            backgroundSecondary: "#D1D9E6",
            primary: "#6366F1",
            secondary: "#818CF8",
            accent: "#4F46E5",
            text: "#1F2937",
            textSecondary: "#4B5563",
            border: "#BEC8D9"
        },
        typography: {
            fontFamily: "'DM Sans', 'Inter', 'sans-serif'",
            headingFont: "'DM Sans', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.5rem", h2: "2rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.75rem", md: "1rem", lg: "1.5rem" },
            shadows: {
                sm: "4px 4px 8px #BEC8D9, -4px -4px 8px #FFFFFF",
                md: "8px 8px 16px #BEC8D9, -8px -8px 16px #FFFFFF",
                lg: "12px 12px 24px #BEC8D9, -12px -12px 24px #FFFFFF"
            }
        },
        avatar: {
            shape: "circle",
            size: "120px",
            borderWidth: "0px",
            borderColor: "transparent",
            shadow: "8px 8px 16px #BEC8D9, -8px -8px 16px #FFFFFF"
        }
    },

    // ====================
    // CREATIVE THEMES
    // ====================
    {
        name: "Neon Night",
        category: "creative",
        colors: {
            background: "#0F0F23",
            backgroundSecondary: "#1A1A2E",
            primary: "#FF006E",
            secondary: "#FB5607",
            accent: "#FFBE0B",
            text: "#FFFFFF",
            textSecondary: "#A0A0B0",
            border: "#2D2D44"
        },
        typography: {
            fontFamily: "'Orbitron', 'Roboto', 'sans-serif'",
            headingFont: "'Orbitron', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 600, bold: 900 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 0 10px rgba(255, 0, 110, 0.3)",
                md: "0 0 20px rgba(255, 0, 110, 0.5)",
                lg: "0 0 40px rgba(255, 0, 110, 0.7)"
            }
        },
        avatar: {
            shape: "circle",
            size: "130px",
            borderWidth: "4px",
            borderColor: "#FF006E",
            shadow: "0 0 30px rgba(255, 0, 110, 0.8), 0 0 60px rgba(251, 86, 7, 0.4)"
        }
    },

    {
        name: "Sunset Dream",
        category: "creative",
        colors: {
            background: "linear-gradient(135deg, #FFA07A 0%, #FF6B9D 50%, #C06C84 100%)",
            backgroundSecondary: "#FFF5F5",
            primary: "#FF6B9D",
            secondary: "#FFA07A",
            accent: "#C06C84",
            text: "#FFFFFF",
            textSecondary: "#FFE5EC",
            border: "rgba(255,255,255,0.3)"
        },
        typography: {
            fontFamily: "'Quicksand', 'Nunito', 'sans-serif'",
            headingFont: "'Pacifico', 'cursive'",
            baseFontSize: "16px",
            headingSizes: { h1: "3rem", h2: "2.5rem", h3: "2rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1250px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.75rem" },
            borderRadius: { sm: "1rem", md: "1.5rem", lg: "2rem" },
            shadows: {
                sm: "0 4px 8px rgba(255, 107, 157, 0.2)",
                md: "0 8px 20px rgba(255, 107, 157, 0.3)",
                lg: "0 16px 40px rgba(255, 107, 157, 0.4)"
            }
        },
        avatar: {
            shape: "circle",
            size: "150px",
            borderWidth: "6px",
            borderColor: "#FFFFFF",
            shadow: "0 8px 24px rgba(255, 107, 157, 0.5)"
        }
    },

    {
        name: "Ocean Waves",
        category: "creative",
        colors: {
            background: "linear-gradient(135deg, #0077BE 0%, #00A896 50%, #05668D 100%)",
            backgroundSecondary: "#E8F4F8",
            primary: "#00A896",
            secondary: "#0077BE",
            accent: "#05668D",
            text: "#FFFFFF",
            textSecondary: "#B8E6F0",
            border: "rgba(255,255,255,0.25)"
        },
        typography: {
            fontFamily: "'Lato', 'Raleway', 'sans-serif'",
            headingFont: "'Righteous', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.75rem", h2: "2.25rem", h3: "1.75rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1200px",
            spacing: { xs: "0.75rem", sm: "1.25rem", md: "2rem", lg: "2.5rem" },
            borderRadius: { sm: "0.75rem", md: "1.25rem", lg: "1.75rem" },
            shadows: {
                sm: "0 4px 8px rgba(0, 168, 150, 0.2)",
                md: "0 8px 20px rgba(0, 168, 150, 0.3)",
                lg: "0 16px 40px rgba(0, 168, 150, 0.4)"
            }
        },
        avatar: {
            shape: "circle",
            size: "135px",
            borderWidth: "5px",
            borderColor: "#FFFFFF",
            shadow: "0 8px 20px rgba(0, 168, 150, 0.6)"
        }
    },

    // ====================
    // MINIMAL THEMES
    // ====================
    {
        name: "Pastel Dream",
        category: "minimal",
        colors: {
            background: "#FFF9F9",
            backgroundSecondary: "#FFF0F5",
            primary: "#FFB3D9",
            secondary: "#C9B8E0",
            accent: "#A4C8E1",
            text: "#4A4A4A",
            textSecondary: "#7A7A7A",
            border: "#F0E6EF"
        },
        typography: {
            fontFamily: "'Nunito', 'Poppins', 'sans-serif'",
            headingFont: "'Comfortaa', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1100px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.75rem", md: "1rem", lg: "1.5rem" },
            shadows: {
                sm: "0 2px 4px rgba(255, 179, 217, 0.1)",
                md: "0 4px 8px rgba(255, 179, 217, 0.15)",
                lg: "0 8px 16px rgba(255, 179, 217, 0.2)"
            }
        },
        avatar: {
            shape: "circle",
            size: "110px",
            borderWidth: "3px",
            borderColor: "#FFB3D9",
            shadow: "0 4px 12px rgba(255, 179, 217, 0.3)"
        }
    },

    {
        name: "Monochrome",
        category: "minimal",
        colors: {
            background: "#FFFFFF",
            backgroundSecondary: "#FAFAFA",
            primary: "#000000",
            secondary: "#2D2D2D",
            accent: "#1A1A1A",
            text: "#000000",
            textSecondary: "#666666",
            border: "#E0E0E0"
        },
        typography: {
            fontFamily: "'IBM Plex Sans', 'Helvetica', 'Arial', 'sans-serif'",
            headingFont: "'IBM Plex Mono', 'monospace'",
            baseFontSize: "16px",
            headingSizes: { h1: "2rem", h2: "1.75rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 700 }
        },
        layout: {
            maxWidth: "1000px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0rem", md: "0.25rem", lg: "0.5rem" },
            shadows: {
                sm: "0 1px 2px rgba(0,0,0,0.1)",
                md: "0 2px 4px rgba(0,0,0,0.15)",
                lg: "0 4px 8px rgba(0,0,0,0.2)"
            }
        },
        avatar: {
            shape: "square",
            size: "100px",
            borderWidth: "2px",
            borderColor: "#000000",
            shadow: "none"
        }
    },

    {
        name: "Nordic Clean",
        category: "minimal",
        colors: {
            background: "#F7F9FC",
            backgroundSecondary: "#FFFFFF",
            primary: "#5E81AC",
            secondary: "#81A1C1",
            accent: "#4C566A",
            text: "#2E3440",
            textSecondary: "#4C566A",
            border: "#D8DEE9"
        },
        typography: {
            fontFamily: "'Source Sans Pro', 'Helvetica Neue', 'sans-serif'",
            headingFont: "'Libre Franklin', 'sans-serif'",
            baseFontSize: "16px",
            headingSizes: { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
            fontWeights: { normal: 400, medium: 500, bold: 600 }
        },
        layout: {
            maxWidth: "1100px",
            spacing: { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2rem" },
            borderRadius: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
            shadows: {
                sm: "0 1px 3px rgba(94, 129, 172, 0.08)",
                md: "0 4px 6px rgba(94, 129, 172, 0.12)",
                lg: "0 8px 16px rgba(94, 129, 172, 0.15)"
            }
        },
        avatar: {
            shape: "rounded",
            size: "110px",
            borderWidth: "3px",
            borderColor: "#5E81AC",
            shadow: "0 4px 8px rgba(94, 129, 172, 0.2)"
        }
    }
];

module.exports = THEME_DEFINITIONS;
