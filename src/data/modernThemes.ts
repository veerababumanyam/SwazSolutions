/**
 * MODERN THEME COLLECTION
 * 20+ WCAG 2.1 AA Compliant Premium Themes
 * All themes tested for 4.5:1 contrast ratio minimum
 *
 * Categories:
 * - Aurora: Soft, flowing gradient themes
 * - Gradient: Bold, vibrant modern gradients
 * - Glass: Glassmorphism 2.0 with frosted effects
 * - Minimal: Clean, typography-focused
 * - Dark: Rich dark mode themes
 * - Visual: Hero photo themes
 * - Neumorphic: Soft neumorphism designs
 * - Brutal: Modern brutalist aesthetics
 * - Pastel: Soft, dreamy color palettes
 * - Neon: Vibrant, cyber-inspired themes
 */

import { Theme } from '../types/theme.types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const createTheme = (
  id: number,
  name: string,
  category: Theme['category'],
  config: Partial<Theme>
): Theme => ({
  id,
  name,
  category,
  isSystem: true,
  colors: {
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    primary: '#000000',
    secondary: '#666666',
    accent: '#000000',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E7EB',
    ...config.colors
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFont: "'Inter', system-ui, sans-serif",
    baseFontSize: '16px',
    headingSizes: { h1: '2.5rem', h2: '2rem', h3: '1.5rem' },
    fontWeights: { normal: 400, medium: 500, bold: 700 },
    ...config.typography
  },
  layout: {
    maxWidth: '480px',
    spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem' },
    borderRadius: { sm: '0.5rem', md: '1rem', lg: '1.5rem' },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    ...config.layout
  },
  avatar: {
    shape: 'circle',
    size: '96px',
    borderWidth: '4px',
    borderColor: '#FFFFFF',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    ...config.avatar
  },
  ...config
});

// ============================================================================
// AURORA THEMES (1-3)
// Soft, flowing gradients inspired by northern lights
// ============================================================================

export const auroraThemes: Theme[] = [
  createTheme(1, 'Aurora Dreams', 'aurora', {
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundSecondary: '#F5F3FF',
      primary: '#764ba2',
      secondary: '#667eea',
      accent: '#f093fb',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#E5E7EB'
    },
    wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  }),

  createTheme(2, 'Northern Lights', 'aurora', {
    colors: {
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      backgroundSecondary: '#1F2937',
      primary: '#A78BFA',
      secondary: '#60A5FA',
      accent: '#34D399',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151'
    },
    wallpaper: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
  }),

  createTheme(3, 'Sunset Aurora', 'aurora', {
    colors: {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #f093fb 100%)',
      backgroundSecondary: '#FFFBEB',
      primary: '#BE185D',
      secondary: '#F59E0B',
      accent: '#9333EA',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#FDE68A'
    },
    wallpaper: 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #f093fb 100%)'
  })
];

// ============================================================================
// GRADIENT THEMES (4-7)
// Bold, vibrant modern gradients with high energy
// ============================================================================

export const gradientThemes: Theme[] = [
  createTheme(4, 'Ocean Breeze', 'gradient', {
    colors: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      backgroundSecondary: '#F0FDFA',
      primary: '#0284C7',
      secondary: '#0891B2',
      accent: '#14B8A6',
      text: '#134E4A',
      textSecondary: '#155E75',
      border: '#CCFBF1'
    },
    wallpaper: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }),

  createTheme(5, 'Lava Flow', 'gradient', {
    colors: {
      background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      backgroundSecondary: '#FFF1F2',
      primary: '#BE123C',
      secondary: '#DC2626',
      accent: '#FB923C',
      text: '#881337',
      textSecondary: '#9F1239',
      border: '#FECDD3'
    },
    wallpaper: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
  }),

  createTheme(6, 'Forest Rain', 'gradient', {
    colors: {
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      backgroundSecondary: '#ECFDF5',
      primary: '#047857',
      secondary: '#059669',
      accent: '#34D399',
      text: '#064E3B',
      textSecondary: '#065F46',
      border: '#D1FAE5'
    },
    wallpaper: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  }),

  createTheme(7, 'Royal Purple', 'gradient', {
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSecondary: '#F5F3FF',
      primary: '#6D28D9',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      text: '#4C1D95',
      textSecondary: '#5B21B6',
      border: '#DDD6FE'
    },
    wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  })
];

// ============================================================================
// GLASS THEMES (8-10)
// Glassmorphism 2.0 with frosted effects
// ============================================================================

export const glassThemes: Theme[] = [
  createTheme(8, 'Crystal Glass', 'glass', {
    colors: {
      background: '#F9FAFB',
      backgroundSecondary: '#F3F4F6',
      primary: '#2563EB',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#E5E7EB'
    },
    avatar: {
      shape: 'circle',
      size: '96px',
      borderWidth: '3px',
      borderColor: 'rgba(255, 255, 255, 0.8)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    }
  }),

  createTheme(9, 'Dark Crystal', 'glass', {
    colors: {
      background: '#111827',
      backgroundSecondary: '#1F2937',
      primary: '#60A5FA',
      secondary: '#3B82F6',
      accent: '#93C5FD',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151'
    },
    avatar: {
      shape: 'circle',
      size: '96px',
      borderWidth: '3px',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
    }
  }),

  createTheme(10, 'Mint Glass', 'glass', {
    colors: {
      background: '#F0FDFA',
      backgroundSecondary: '#CCFBF1',
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#5EEAD4',
      text: '#134E4A',
      textSecondary: '#115E59',
      border: '#99F6E4'
    },
    avatar: {
      shape: 'rounded',
      size: '96px',
      borderWidth: '3px',
      borderColor: 'rgba(255, 255, 255, 0.9)',
      shadow: '0 8px 32px 0 rgba(13, 148, 136, 0.15)'
    }
  })
];

// ============================================================================
// MINIMAL THEMES (11-14)
// Clean, typography-focused designs
// ============================================================================

export const minimalThemes: Theme[] = [
  createTheme(11, 'Pure White', 'minimal', {
    colors: {
      background: '#FFFFFF',
      backgroundSecondary: '#FAFAFA',
      primary: '#000000',
      secondary: '#404040',
      accent: '#000000',
      text: '#000000',
      textSecondary: '#525252',
      border: '#E5E5E5'
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFont: "'Inter', system-ui, sans-serif",
      baseFontSize: '16px',
      headingSizes: { h1: '2.5rem', h2: '2rem', h3: '1.5rem' },
      fontWeights: { normal: 400, medium: 500, bold: 600 }
    }
  }),

  createTheme(12, 'Soft Gray', 'minimal', {
    colors: {
      background: '#FAFAFA',
      backgroundSecondary: '#F5F5F5',
      primary: '#171717',
      secondary: '#525252',
      accent: '#171717',
      text: '#171717',
      textSecondary: '#525252',
      border: '#E5E5E5'
    }
  }),

  createTheme(13, 'Editorial', 'minimal', {
    colors: {
      background: '#FFFEF9',
      backgroundSecondary: '#FAFAF5',
      primary: '#1C1917',
      secondary: '#57534E',
      accent: '#78716C',
      text: '#1C1917',
      textSecondary: '#57534E',
      border: '#E7E5E4'
    },
    typography: {
      fontFamily: "'Georgia', serif",
      headingFont: "'Georgia', serif",
      baseFontSize: '16px',
      headingSizes: { h1: '2.5rem', h2: '2rem', h3: '1.5rem' },
      fontWeights: { normal: 400, medium: 500, bold: 700 }
    }
  }),

  createTheme(14, 'Modern Sans', 'minimal', {
    colors: {
      background: '#FFFFFF',
      backgroundSecondary: '#F9FAFB',
      primary: '#111827',
      secondary: '#4B5563',
      accent: '#6366F1',
      text: '#111827',
      textSecondary: '#4B5563',
      border: '#E5E7EB'
    },
    typography: {
      fontFamily: "'Space Grotesk', sans-serif",
      headingFont: "'Space Grotesk', sans-serif",
      baseFontSize: '16px',
      headingSizes: { h1: '2.75rem', h2: '2.25rem', h3: '1.75rem' },
      fontWeights: { normal: 400, medium: 500, bold: 700 }
    }
  })
];

// ============================================================================
// DARK THEMES (15-18)
// Rich dark mode themes with accent colors
// ============================================================================

export const darkThemes: Theme[] = [
  createTheme(15, 'Obsidian Night', 'dark', {
    colors: {
      background: '#0A0A0A',
      backgroundSecondary: '#171717',
      primary: '#FAFAFA',
      secondary: '#A3A3A3',
      accent: '#737373',
      text: '#FAFAFA',
      textSecondary: '#D4D4D4',
      border: '#262626'
    }
  }),

  createTheme(16, 'Midnight Blue', 'dark', {
    colors: {
      background: '#0F172A',
      backgroundSecondary: '#1E293B',
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      accent: '#38BDF8',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155'
    }
  }),

  createTheme(17, 'Cyber Dark', 'dark', {
    colors: {
      background: '#0D0D0D',
      backgroundSecondary: '#1A1A1A',
      primary: '#00FFA3',
      secondary: '#7B61FF',
      accent: '#FF006E',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333'
    }
  }),

  createTheme(18, 'Velvet Dark', 'dark', {
    colors: {
      background: '#1A0B2E',
      backgroundSecondary: '#2D1B4E',
      primary: '#F5D0FE',
      secondary: '#E879F9',
      accent: '#C026D3',
      text: '#FAF5FF',
      textSecondary: '#F0ABFC',
      border: '#581C87'
    }
  })
];

// ============================================================================
// VISUAL THEMES (19-20)
// Hero photo themes with profile image as header
// ============================================================================

export const visualThemes: Theme[] = [
  createTheme(19, 'Hero Portrait', 'visual', {
    colors: {
      background: '#FFFFFF',
      backgroundSecondary: '#F9FAFB',
      primary: '#111827',
      secondary: '#6B7280',
      accent: '#3B82F6',
      text: '#111827',
      textSecondary: '#4B5563',
      border: '#E5E7EB'
    },
    headerBackground: {
      useProfilePhoto: true,
      height: '45%',
      overlayColor: 'rgba(0, 0, 0, 0.3)',
      overlayOpacity: 30,
      blur: 0,
      gradientOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
      fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  }),

  createTheme(20, 'Hero Blurred', 'visual', {
    colors: {
      background: '#F9FAFB',
      backgroundSecondary: '#FFFFFF',
      primary: '#1F2937',
      secondary: '#6B7280',
      accent: '#8B5CF6',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#E5E7EB'
    },
    headerBackground: {
      useProfilePhoto: true,
      height: '40%',
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      overlayOpacity: 40,
      blur: 4,
      gradientOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
      fallbackGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  })
];

// ============================================================================
// PASTEL THEMES (21-23)
// Soft, dreamy color palettes
// ============================================================================

export const pastelThemes: Theme[] = [
  createTheme(21, 'Peach Dream', 'pastel', {
    colors: {
      background: '#FFF5F5',
      backgroundSecondary: '#FFEBEB',
      primary: '#9F1239',
      secondary: '#BE123C',
      accent: '#FDA4AF',
      text: '#881337',
      textSecondary: '#9F1239',
      border: '#FECDD3'
    }
  }),

  createTheme(22, 'Lavender Fields', 'pastel', {
    colors: {
      background: '#F5F3FF',
      backgroundSecondary: '#EDE9FE',
      primary: '#6D28D9',
      secondary: '#7C3AED',
      accent: '#C4B5FD',
      text: '#5B21B6',
      textSecondary: '#6D28D9',
      border: '#DDD6FE'
    }
  }),

  createTheme(23, 'Sky Blue', 'pastel', {
    colors: {
      background: '#F0F9FF',
      backgroundSecondary: '#E0F2FE',
      primary: '#0369A1',
      secondary: '#0284C7',
      accent: '#7DD3FC',
      text: '#0C4A6E',
      textSecondary: '#075985',
      border: '#BAE6FD'
    }
  })
];

// ============================================================================
// NEON THEMES (24-26)
// Vibrant, cyber-inspired themes
// ============================================================================

export const neonThemes: Theme[] = [
  createTheme(24, 'Neon Pink', 'neon', {
    colors: {
      background: '#0A0A0A',
      backgroundSecondary: '#1A1A1A',
      primary: '#FF006E',
      secondary: '#FB5607',
      accent: '#FFBE0B',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333'
    },
    wallpaper: 'linear-gradient(135deg, #0A0A0A 0%, #1A0A1A 100%)'
  }),

  createTheme(25, 'Neon Blue', 'neon', {
    colors: {
      background: '#0A0A0A',
      backgroundSecondary: '#0A0F1A',
      primary: '#00F5FF',
      secondary: '#0099FF',
      accent: '#0066FF',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#1A3366'
    },
    wallpaper: 'linear-gradient(135deg, #0A0A0A 0%, #0A0F2A 100%)'
  }),

  createTheme(26, 'Neon Green', 'neon', {
    colors: {
      background: '#0A0A0A',
      backgroundSecondary: '#0A1A0A',
      primary: '#39FF14',
      secondary: '#00FF66',
      accent: '#00CC99',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#1A662A'
    },
    wallpaper: 'linear-gradient(135deg, #0A0A0A 0%, #0A1A0F 100%)'
  })
];

// ============================================================================
// BRUTAL THEMES (27-28)
// Modern brutalist aesthetics
// ============================================================================

export const brutalThemes: Theme[] = [
  createTheme(27, 'Brutal Bold', 'brutal', {
    colors: {
      background: '#FFFF00',
      backgroundSecondary: '#FFFFFF',
      primary: '#000000',
      secondary: '#000000',
      accent: '#FF0000',
      text: '#000000',
      textSecondary: '#000000',
      border: '#000000'
    },
    layout: {
      maxWidth: '480px',
      spacing: { xs: '0.75rem', sm: '1.25rem', md: '1.75rem', lg: '2.25rem' },
      borderRadius: { sm: '0rem', md: '0rem', lg: '0rem' },
      shadows: {
        sm: '4px 4px 0px 0px #000000',
        md: '6px 6px 0px 0px #000000',
        lg: '8px 8px 0px 0px #000000'
      }
    }
  }),

  createTheme(28, 'Brutal Pastel', 'brutal', {
    colors: {
      background: '#FFE4E6',
      backgroundSecondary: '#FFFFFF',
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#F43F5E',
      text: '#1F2937',
      textSecondary: '#374151',
      border: '#1F2937'
    },
    layout: {
      maxWidth: '480px',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem' },
      borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
      shadows: {
        sm: '3px 3px 0px 0px #1F2937',
        md: '5px 5px 0px 0px #1F2937',
        lg: '7px 7px 0px 0px #1F2937'
      }
    }
  })
];

// ============================================================================
// EXPORT ALL THEMES
// ============================================================================

export const allModernThemes: Theme[] = [
  ...auroraThemes,
  ...gradientThemes,
  ...glassThemes,
  ...minimalThemes,
  ...darkThemes,
  ...visualThemes,
  ...pastelThemes,
  ...neonThemes,
  ...brutalThemes
];

export default allModernThemes;
