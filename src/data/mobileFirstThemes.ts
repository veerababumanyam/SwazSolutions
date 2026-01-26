/**
 * MOBILE-FIRST THEMES
 * Modern link-in-bio themes inspired by Linktr.ee, Beacons.ai, Koji, Taplink
 * Optimized for mobile devices with touch-friendly targets and readable layouts
 */

import { Theme, ThemeCategory } from '../types/profile.types';

// ============================================================================
// THEME CATEGORY METADATA
// ============================================================================

export const THEME_CATEGORY_META: Record<ThemeCategory, { icon: string; name: string; description: string }> = {
  minimal: { icon: '◻️', name: 'Minimal', description: 'Clean and simple' },
  gradient: { icon: '🎨', name: 'Gradient', description: 'Vibrant color blends' },
  photo: { icon: '📷', name: 'Photo', description: 'Upload your own background' },
  glass: { icon: '💎', name: 'Glass', description: 'Frosted glass effects' },
  dark: { icon: '🌙', name: 'Dark', description: 'Easy on the eyes' },
  bold: { icon: '💥', name: 'Bold', description: 'Stand out loudly' },
  nature: { icon: '🌿', name: 'Nature', description: 'Earthy tones' },
  urban: { icon: '🏙️', name: 'Urban', description: 'City vibes' },
  seasonal: { icon: '🎃', name: 'Seasonal', description: 'Festive themes' },
};

// ============================================================================
// MOBILE-FIRST THEMES
// ============================================================================

export const MOBILE_FIRST_THEMES: Theme[] = [
  // ============================================================================
  // MINIMAL THEMES - Clean, focused on content
  // ============================================================================
  {
    id: 'minimal-white',
    name: 'Clean White',
    description: 'Crisp white background, perfect for professional profiles',
    category: 'minimal',
    preview: 'https://placehold.co/400x800/f8f9fa/1a1a1a?text=Clean+White',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      background: '#FFFFFF',
      backgroundSecondary: '#F9FAFB',
      text: '#111827',
      accent: '#3B82F6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },
  {
    id: 'minimal-cream',
    name: 'Warm Cream',
    description: 'Soft cream background for a welcoming feel',
    category: 'minimal',
    preview: 'https://placehold.co/400x800/F5F0EB/5C4B37?text=Warm+Cream',
    colors: {
      primary: '#5C4B37',
      secondary: '#8B7355',
      background: '#FDFBF7',
      backgroundSecondary: '#F5F0EB',
      text: '#3D2E1F',
      accent: '#D4A574',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // GRADIENT THEMES - Vibrant, eye-catching
  // ============================================================================
  {
    id: 'gradient-sunset',
    name: 'Sunset Vibes',
    description: 'Warm orange to pink gradient, energetic and fun',
    category: 'gradient',
    preview: 'https://placehold.co/400x800/linear-gradient(135deg,%20%23FF6B6B%200%,%20%23FFE66D%20100%)/FFFFFF?text=Sunset',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFE66D',
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
      backgroundSecondary: '#FFF5F5',
      text: '#1F2937',
      accent: '#FF8E53',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    wallpaper: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    supportsCustomPhoto: false,
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Waves',
    description: 'Cool blue to teal gradient, calm and refreshing',
    category: 'gradient',
    preview: 'https://placehold.co/400x800/linear-gradient(135deg,%20%2366EEA%200%,%20%237648A2%20100%)/FFFFFF?text=Ocean',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSecondary: '#EEF2FF',
      text: '#FFFFFF',
      accent: '#F59E0B',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.5rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    supportsCustomPhoto: false,
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora Borealis',
    description: 'Green and purple gradient, magical and unique',
    category: 'gradient',
    preview: 'https://placehold.co/400x800/linear-gradient(135deg,%20%2300D2FF%200%,%20%233A86FF%2050%,%20%238338EC%20100%)/FFFFFF?text=Aurora',
    colors: {
      primary: '#8338EC',
      secondary: '#3A86FF',
      background: 'linear-gradient(135deg, #00D2FF 0%, #3A86FF 50%, #8338EC 100%)',
      backgroundSecondary: '#F5F3FF',
      text: '#FFFFFF',
      accent: '#FF006E',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.5rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    wallpaper: 'linear-gradient(135deg, #00D2FF 0%, #3A86FF 50%, #8338EC 100%)',
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // PHOTO THEMES - Support custom photo backgrounds
  // ============================================================================
  {
    id: 'photo-blur',
    name: 'Photo Blur',
    description: 'Upload a photo with blur overlay - links stand out',
    category: 'photo',
    preview: 'https://placehold.co/400x800/333333/FFFFFF?text=Photo+Blur',
    colors: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      background: '#111827',
      backgroundSecondary: '#1F2937',
      text: '#FFFFFF',
      accent: '#3B82F6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    headerBackground: {
      useProfilePhoto: false,
      height: '100%',
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      overlayOpacity: 60,
      blur: 8,
      fallbackGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    supportsCustomPhoto: true,
  },
  {
    id: 'photo-overlay',
    name: 'Photo Overlay',
    description: 'Full photo background with semi-transparent link cards',
    category: 'photo',
    preview: 'https://placehold.co/400x800/333333/FFFFFF?text=Photo+Overlay',
    colors: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      background: '#111827',
      backgroundSecondary: '#1F2937',
      text: '#FFFFFF',
      accent: '#10B981',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
      spacing: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2.5rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    headerBackground: {
      useProfilePhoto: true,
      height: '40%',
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      overlayOpacity: 40,
      blur: 2,
      fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    supportsCustomPhoto: true,
  },
  {
    id: 'photo-gradient',
    name: 'Photo Gradient',
    description: 'Photo background with gradient overlay - premium look',
    category: 'photo',
    preview: 'https://placehold.co/400x800/333333/FFFFFF?text=Photo+Gradient',
    colors: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.8)',
      background: '#1F2937',
      backgroundSecondary: '#111827',
      text: '#FFFFFF',
      accent: '#F59E0B',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    headerBackground: {
      useProfilePhoto: true,
      height: '45%',
      overlayColor: 'transparent',
      overlayOpacity: 50,
      blur: 0,
      gradientOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
      fallbackGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    supportsCustomPhoto: true,
  },
  {
    id: 'photo-clean',
    name: 'Photo Clean',
    description: 'Photo background with clean white cards',
    category: 'photo',
    preview: 'https://placehold.co/400x800/333333/FFFFFF?text=Photo+Clean',
    colors: {
      primary: '#111827',
      secondary: '#6B7280',
      background: '#F9FAFB',
      backgroundSecondary: '#FFFFFF',
      text: '#111827',
      accent: '#8B5CF6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'rounded', size: 'lg' },
    headerBackground: {
      useProfilePhoto: true,
      height: '35%',
      overlayColor: 'rgba(255, 255, 255, 0.3)',
      overlayOpacity: 30,
      blur: 0,
      gradientOverlay: 'linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%)',
      fallbackGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    supportsCustomPhoto: true,
  },

  // ============================================================================
  // GLASS THEMES - Frosted glass effects
  // ============================================================================
  {
    id: 'glass-purple',
    name: 'Glass Purple',
    description: 'Frosted glass cards on purple gradient',
    category: 'glass',
    preview: 'https://placehold.co/400x800/linear-gradient(135deg,%20%23C33764%200%,%20%231D2671%20100%)/FFFFFF?text=Glass+Purple',
    colors: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.7)',
      background: 'linear-gradient(135deg, #C33764 0%, #1D2671 100%)',
      backgroundSecondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      accent: '#FFD700',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    wallpaper: 'linear-gradient(135deg, #C33764 0%, #1D2671 100%)',
    supportsCustomPhoto: false,
  },
  {
    id: 'glass-ocean',
    name: 'Glass Ocean',
    description: 'Frosted glass cards on ocean blue gradient',
    category: 'glass',
    preview: 'https://placehold.co/400x800/linear-gradient(135deg,%20%232195F3%200%,%20%2306B6D4%20100%)/FFFFFF?text=Glass+Ocean',
    colors: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.7)',
      background: 'linear-gradient(135deg, #2195F3 0%, #06B6D4 100%)',
      backgroundSecondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      accent: '#FCD34D',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '1rem', md: '1.25rem', lg: '1.5rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    wallpaper: 'linear-gradient(135deg, #2195F3 0%, #06B6D4 100%)',
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // DARK THEMES - Easy on the eyes
  // ============================================================================
  {
    id: 'dark-midnight',
    name: 'Midnight',
    description: 'Deep black and gray, perfect for dark mode lovers',
    category: 'dark',
    preview: 'https://placehold.co/400x800/111827/FFFFFF?text=Midnight',
    colors: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
      background: '#111827',
      backgroundSecondary: '#1F2937',
      text: '#F9FAFB',
      accent: '#8B5CF6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },
  {
    id: 'dark-neon',
    name: 'Neon Nights',
    description: 'Dark background with neon accent colors',
    category: 'dark',
    preview: 'https://placehold.co/400x800/0F172A/00FFA3?text=Neon+Nights',
    colors: {
      primary: '#00FFA3',
      secondary: '#FF006E',
      background: '#0F172A',
      backgroundSecondary: '#1E293B',
      text: '#F1F5F9',
      accent: '#00FFA3',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // BOLD THEMES - Stand out loudly
  // ============================================================================
  {
    id: 'bold-sunset',
    name: 'Bold Sunset',
    description: 'High contrast orange gradient for maximum impact',
    category: 'bold',
    preview: 'https://placehold.co/400x800/linear-gradient(135deg,%20%23FF416C%200,%%20%23FF4B2B%20100%)/FFFFFF?text=Bold+Sunset',
    colors: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.9)',
      background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
      backgroundSecondary: '#FFF5F5',
      text: '#FFFFFF',
      accent: '#FFD700',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2.5rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    wallpaper: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
    supportsCustomPhoto: false,
  },
  {
    id: 'bold-lime',
    name: 'Electric Lime',
    description: 'Vibrant lime green that pops on any screen',
    category: 'bold',
    preview: 'https://placehold.co/400x800/000000/CCFF00?text=Electric+Lime',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      background: '#CCFF00',
      backgroundSecondary: '#000000',
      text: '#000000',
      accent: '#FF006E',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '0rem', md: '0rem', lg: '0rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'square', size: 'lg' },
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // NATURE THEMES - Earthy tones
  // ============================================================================
  {
    id: 'nature-forest',
    name: 'Forest Floor',
    description: 'Deep greens and earthy browns',
    category: 'nature',
    preview: 'https://placehold.co/400x800/2D5016/FFFFFF?text=Forest+Floor',
    colors: {
      primary: '#D4A373',
      secondary: '#A9B388',
      background: '#2D5016',
      backgroundSecondary: '#4A6741',
      text: '#FAEDCD',
      accent: '#D4A373',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },
  {
    id: 'nature-sand',
    name: 'Desert Sand',
    description: 'Warm sandy tones with terra cotta accents',
    category: 'nature',
    preview: 'https://placehold.co/400x800/F5EBE0/8B4513?text=Desert+Sand',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      background: '#F5EBE0',
      backgroundSecondary: '#E8DCC8',
      text: '#3E2723',
      accent: '#CD853F',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'rounded', size: 'lg' },
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // URBAN THEMES - City vibes
  // ============================================================================
  {
    id: 'urban-concrete',
    name: 'Concrete Jungle',
    description: 'Industrial grays with yellow accents',
    category: 'urban',
    preview: 'https://placehold.co/400x800/374151/FBBF24?text=Concrete+Jungle',
    colors: {
      primary: '#FBBF24',
      secondary: '#60A5FA',
      background: '#374151',
      backgroundSecondary: '#4B5563',
      text: '#F3F4F6',
      accent: '#FBBF24',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0rem', md: '0.125rem', lg: '0.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'rounded', size: 'lg' },
    supportsCustomPhoto: false,
  },
  {
    id: 'urban-neon',
    name: 'City Lights',
    description: 'Dark with neon pink and blue accents',
    category: 'urban',
    preview: 'https://placehold.co/400x800/1A1A2E/FF006E?text=City+Lights',
    colors: {
      primary: '#FF006E',
      secondary: '#8338EC',
      background: '#1A1A2E',
      backgroundSecondary: '#16213E',
      text: '#EAEAEA',
      accent: '#00F5D4',
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },

  // ============================================================================
  // SEASONAL THEMES - Festive themes
  // ============================================================================
  {
    id: 'seasonal-cherry',
    name: 'Cherry Blossom',
    description: 'Soft pinks for spring vibes',
    category: 'seasonal',
    preview: 'https://placehold.co/400x800/FDF2F8/DB2777?text=Cherry+Blossom',
    colors: {
      primary: '#DB2777',
      secondary: '#F472B6',
      background: '#FDF2F8',
      backgroundSecondary: '#FCE7F3',
      text: '#831843',
      accent: '#EC4899',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },
  {
    id: 'seasonal-autumn',
    name: 'Autumn Leaves',
    description: 'Warm orange and brown for fall',
    category: 'seasonal',
    preview: 'https://placehold.co/400x800/FFF7ED/EA580C?text=Autumn+Leaves',
    colors: {
      primary: '#EA580C',
      secondary: '#F59E0B',
      background: '#FFF7ED',
      backgroundSecondary: '#FFEDD5',
      text: '#7C2D12',
      accent: '#DC2626',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
    },
    layout: {
      borderRadius: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: false,
  },
  // ============================================================================
  // NEW THEMES (SCREENSHOT INSPIRED)
  // ============================================================================
  {
    id: 'nature-hydra',
    name: 'Hydra Green',
    description: 'Natural deep greens with soft buttons',
    category: 'nature',
    preview: 'https://placehold.co/400x800/4A5D4F/E8E8E8?text=Hydra',
    colors: {
      primary: '#E8E8E8',
      secondary: '#D0D0D0',
      background: '#4A5D4F',
      backgroundSecondary: '#3A4D39',
      text: '#2F3E33',
      accent: '#E8E8E8',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      spacing: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    supportsCustomPhoto: false,
  },
  {
    id: 'photo-katy',
    name: 'Poolside',
    description: 'Fresh and airy with white buttons',
    category: 'photo',
    preview: 'https://placehold.co/400x800/87CEEB/FFFFFF?text=Poolside',
    colors: {
      primary: '#FFFFFF',
      secondary: '#F0F0F0',
      background: '#87CEEB',
      backgroundSecondary: '#E0F7FA',
      text: '#1A1A1A',
      accent: '#1A1A1A',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      spacing: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    headerBackground: {
      useProfilePhoto: true,
      height: '100%',
      overlayColor: 'rgba(0,0,0,0.1)',
      overlayOpacity: 10,
      blur: 0,
      fallbackGradient: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%)',
    },
    supportsCustomPhoto: true,
  },
  {
    id: 'bold-matthew',
    name: 'Skater Vibe',
    description: 'Gritty aesthetic with peach buttons',
    category: 'bold',
    preview: 'https://placehold.co/400x800/2B2B2B/F4A261?text=Skater',
    colors: {
      primary: '#F4A261',
      secondary: '#E76F51',
      background: '#2B2B2B',
      backgroundSecondary: '#1A1A1A',
      text: '#FFFFFF',
      accent: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '0.2rem', md: '0.3rem', lg: '0.4rem' },
      spacing: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '1.5rem' },
    },
    avatar: { shape: 'circle', size: 'lg' },
    supportsCustomPhoto: true,
  },
  {
    id: 'photo-dena',
    name: 'Track Blue',
    description: 'Sporty blue with white buttons',
    category: 'photo',
    preview: 'https://placehold.co/400x800/0047AB/FFFFFF?text=Track',
    colors: {
      primary: '#FFFFFF',
      secondary: '#E6E6E6',
      background: '#0047AB',
      backgroundSecondary: '#003380',
      text: '#0047AB',
      accent: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '1.5rem', md: '1.5rem', lg: '1.5rem' }, // Making rounded to simulate waviness as best as possible without custom CSS
      spacing: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    headerBackground: {
      useProfilePhoto: true,
      height: '100%',
      overlayColor: 'rgba(0,0,0,0.2)',
      overlayOpacity: 20,
      blur: 0,
      fallbackGradient: 'linear-gradient(135deg, #0047AB 0%, #002244 100%)',
    },
    supportsCustomPhoto: true,
  },
  {
    id: 'minimal-bakery',
    name: 'Patisserie',
    description: 'Elegant white with red accents',
    category: 'minimal',
    preview: 'https://placehold.co/400x800/FFF8F0/FFFFFF?text=Bakery',
    colors: {
      primary: '#FFFFFF',
      secondary: '#FFF0F0',
      background: '#FFF8F0',
      backgroundSecondary: '#FFFFFF',
      text: '#D93025',
      accent: '#D93025',
    },
    typography: {
      fontFamily: 'Playfair Display, serif',
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
    },
    layout: {
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
    },
    avatar: { shape: 'circle', size: 'xl' },
    supportsCustomPhoto: false,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  return MOBILE_FIRST_THEMES.find(theme => theme.id === id);
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: ThemeCategory): Theme[] {
  return MOBILE_FIRST_THEMES.filter(theme => theme.category === category);
}

/**
 * Get photo background themes (themes that support custom photo uploads)
 */
export function getPhotoBackgroundThemes(): Theme[] {
  return MOBILE_FIRST_THEMES.filter(theme => theme.supportsCustomPhoto);
}

export default MOBILE_FIRST_THEMES;
