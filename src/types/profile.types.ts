/**
 * Shared Profile Type Definitions
 * Single source of truth for all profile-related interfaces
 */

// ============================================================================
// APPEARANCE SETTINGS
// ============================================================================

export interface HeaderBackgroundSettings {
  useProfilePhoto: boolean;
  height: string;
  overlayColor: string;
  overlayOpacity: number;
  blur: number;
  gradientOverlay?: string;
  fallbackGradient: string;
}

export interface BannerSettings {
  mode: 'color' | 'image';
  color: string;
  image?: string;
  derivedFromWallpaper: boolean;
}

export interface BackgroundSettings {
  type: 'solid' | 'gradient' | 'image' | 'video';
  value: string;
  opacity: number;
  blur?: number;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface AppearanceSettings {
  // Button settings
  buttonStyle: 'solid' | 'glass' | 'outline' | 'minimal';
  cornerRadius: number;
  shadowStyle: 'none' | 'subtle' | 'strong' | 'hard';
  buttonColor: string;
  shadowColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  // Header settings
  headerStyle: 'simple' | 'banner' | 'avatar-top' | 'minimal' | 'hero-photo' | 'floating' | 'centered-focus';
  headerColor: string;
  headerBackground?: HeaderBackgroundSettings;
  bannerSettings?: BannerSettings;
  // Background settings (mobile-first)
  background: BackgroundSettings;
  // Footer settings
  footerText: string;
  showPoweredBy: boolean;
  // Theme settings
  themeId: string;
  // Layout spacing (mobile-first)
  spacing: 'compact' | 'comfortable' | 'spacious';
  // Link card style
  linkStyle: 'card' | 'pill' | 'minimal' | 'icon-only';
}

// ============================================================================
// BUTTON ENHANCEMENT SETTINGS
// ============================================================================

export interface CustomShadowSettings {
  offsetX: number;    // -50 to 50px
  offsetY: number;    // -50 to 50px
  blur: number;       // 0 to 100px
  spread: number;     // -50 to 50px
  color: string;      // hex
  opacity: number;    // 0-100
  inset: boolean;     // inner shadow
}

export interface GradientStop {
  id: string;
  color: string;
  position: number;  // 0-100%
}

export interface GradientSettings {
  type: 'linear' | 'radial';
  angle?: number;     // 0-360 (linear only)
  stops: GradientStop[];
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface ButtonEnhancementSettings {
  useCustomShadow: boolean;
  customShadow: CustomShadowSettings;
  useGradient: boolean;
  gradient: GradientSettings;
  borderWidth: number;
  borderColor: string;
  hoverScale: number;
  hoverBrightness: number;
}

// ============================================================================
// PROFILE DATA
// ============================================================================

export interface ProfileData {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  logo?: string;
  headline?: string;
  pronouns?: string;
  company?: string;
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
  showBio?: boolean;
  companyEmail?: string;
  companyPhone?: string;
  showCompanyEmail?: boolean;
  showCompanyPhone?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  showAddressLine1?: boolean;
  showAddressLine2?: boolean;
  showAddressCity?: boolean;
  showAddressState?: boolean;
  showAddressPostalCode?: boolean;
  showAddressCountry?: boolean;
  showAddress?: boolean;
  companyAddressLine1?: string;
  companyAddressLine2?: string;
  companyAddressCity?: string;
  companyAddressState?: string;
  companyAddressPostalCode?: string;
  companyAddressCountry?: string;
  showCompanyAddressLine1?: boolean;
  showCompanyAddressLine2?: boolean;
  showCompanyAddressCity?: boolean;
  showCompanyAddressState?: boolean;
  showCompanyAddressPostalCode?: boolean;
  showCompanyAddressCountry?: boolean;
  showCompanyAddress?: boolean;
}

// ============================================================================
// SOCIAL LINKS
// ============================================================================

export interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

// ============================================================================
// THEME CATEGORIES
// ============================================================================

export type ThemeCategory =
  | 'minimal'
  | 'gradient'
  | 'photo'
  | 'glass'
  | 'dark'
  | 'bold'
  | 'nature'
  | 'urban'
  | 'seasonal';

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  layout: {
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  };
  avatar?: {
    shape: 'circle' | 'rounded' | 'square';
    size: 'sm' | 'md' | 'lg' | 'xl';
  };
  wallpaper?: string;
  headerBackground?: HeaderBackgroundSettings;
  supportsCustomPhoto: boolean;
}
