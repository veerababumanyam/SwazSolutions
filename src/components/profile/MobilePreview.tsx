// MobilePreview Component
// Shows a live preview of the public profile on a mobile device frame with appearance settings
// Features: Modern icon-based links, action bar for QR/Share/vCard, mobile-first design

import React, { useState, useCallback } from 'react';
import { Mail, Phone, Globe, ExternalLink, Copy, Check, Share2, Eye, Briefcase, Building2, Download } from 'lucide-react';
import { getOptimalTextColor, getOptimalSecondaryTextColor, isLightColor } from '../../utils/wcagValidator';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../../constants/platforms';
import { ProfileQRCode } from '../public-profile/ProfileQRCode';

// Header background settings for Visual themes (hero-photo style)
export interface HeaderBackgroundSettings {
  useProfilePhoto: boolean;      // Use profile photo as header background
  height: string;                // Height of header area (e.g., "50%", "45%")
  overlayColor: string;          // Overlay color (e.g., "rgba(0,0,0,0.4)")
  overlayOpacity: number;        // Overlay opacity 0-100
  blur: number;                  // Blur amount in pixels (0 = no blur)
  gradientOverlay?: string;      // Optional gradient overlay
  fallbackGradient: string;      // Fallback gradient when no photo is available
}

// Banner settings for banner header style
export interface BannerSettings {
  mode: 'color' | 'image';       // Banner display mode
  color: string;                  // Banner color (derived from wallpaper or custom)
  image?: string;                 // Custom banner image URL
  derivedFromWallpaper: boolean;  // Whether color was auto-derived from wallpaper
}

export interface AppearanceSettings {
  // Button settings
  buttonStyle: 'solid' | 'glass' | 'outline';
  cornerRadius: number;
  shadowStyle: 'none' | 'subtle' | 'strong' | 'hard';
  buttonColor: string;
  shadowColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  // Header settings
  headerStyle: 'simple' | 'banner' | 'avatar-top' | 'minimal' | 'hero-photo';
  headerColor: string;
  headerBackground?: HeaderBackgroundSettings; // For hero-photo style
  bannerSettings?: BannerSettings; // For banner style
  // Wallpaper settings
  wallpaper: string; // CSS value: color, gradient, or image URL
  wallpaperOpacity: number; // 0-100
  // Footer settings
  footerText: string;
  showPoweredBy: boolean;
  // Theme settings
  themeId: string;
}

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

interface ProfileData {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  logo?: string;
  headline?: string;
  // Personal contact info fields
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  // Visibility toggles for personal contact info
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
  showBio?: boolean;
  // Company contact info fields
  companyEmail?: string;
  companyPhone?: string;
  // Visibility toggles for company contact info
  showCompanyEmail?: boolean;
  showCompanyPhone?: boolean;
}

interface MobilePreviewProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings;
  /** URL to the public profile for QR code generation */
  profileUrl?: string;
  onPreview?: () => void;
  onShare?: () => void;
}

// Featured social icons for header row
const FEATURED_PLATFORMS = [
  { name: 'Instagram', icon: 'instagram', pattern: 'instagram.com' },
  { name: 'WhatsApp', icon: 'whatsapp', pattern: 'wa.me' },
  { name: 'YouTube', icon: 'youtube', pattern: 'youtube.com' },
  { name: 'Facebook', icon: 'facebook', pattern: 'facebook.com' },
  { name: 'X', icon: 'x', pattern: 'twitter.com' },
  { name: 'X', icon: 'x', pattern: 'x.com' },
  { name: 'TikTok', icon: 'tiktok', pattern: 'tiktok.com' },
  { name: 'Apple Music', icon: 'apple-music', pattern: 'music.apple.com' },
  { name: 'Spotify', icon: 'spotify', pattern: 'spotify.com' },
  { name: 'LinkedIn', icon: 'linkedin', pattern: 'linkedin.com' },
  { name: 'GitHub', icon: 'github', pattern: 'github.com' },
  { name: 'Telegram', icon: 'telegram', pattern: 't.me' },
];

export const MobilePreview: React.FC<MobilePreviewProps> = ({ profile, links, appearance, profileUrl, onPreview, onShare }) => {
  // State for share button feedback
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Default header background settings for hero-photo style
  const defaultHeaderBackground: HeaderBackgroundSettings = {
    useProfilePhoto: true,
    height: '45%',
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    overlayOpacity: 30,
    blur: 0,
    fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  // Default banner settings
  const defaultBannerSettings: BannerSettings = {
    mode: 'color',
    color: '#8B5CF6',
    derivedFromWallpaper: true,
  };

  // Default appearance settings
  const defaultAppearance: AppearanceSettings = {
    buttonStyle: 'solid',
    cornerRadius: 12,
    shadowStyle: 'subtle',
    buttonColor: '#8B5CF6',
    shadowColor: '#000000',
    textColor: '#FFFFFF',
    backgroundColor: '#F9FAFB',
    fontFamily: 'Inter',
    headerStyle: 'simple',
    headerColor: '#8B5CF6',
    headerBackground: defaultHeaderBackground,
    bannerSettings: defaultBannerSettings,
    wallpaper: '',
    wallpaperOpacity: 100,
    footerText: '',
    showPoweredBy: true,
    themeId: '',
  };

  const settings = appearance || defaultAppearance;

  /**
   * Get WCAG-compliant text colors based on background
   * Uses wallpaper color extraction or background color
   */
  const getWCAGTextColors = useCallback(() => {
    let bgColor = settings.backgroundColor;
    
    // If wallpaper is a solid color, use that as base
    if (settings.wallpaper) {
      if (settings.wallpaper.startsWith('#') || /^[a-zA-Z]+$/.test(settings.wallpaper)) {
        bgColor = settings.wallpaper;
      } else if (settings.wallpaper.startsWith('linear-gradient') || settings.wallpaper.startsWith('radial-gradient')) {
        // Extract first color from gradient
        const hexMatch = settings.wallpaper.match(/#([0-9A-Fa-f]{3,8})\b/);
        if (hexMatch) bgColor = `#${hexMatch[1]}`;
      }
    }
    
    return {
      nameColor: getOptimalTextColor(bgColor),
      bioColor: getOptimalSecondaryTextColor(bgColor),
      isLight: isLightColor(bgColor),
      bgColor
    };
  }, [settings.backgroundColor, settings.wallpaper]);

  const wcagColors = getWCAGTextColors();

  // Get button styles based on appearance
  const getButtonStyle = () => {
    const base: React.CSSProperties = {
      borderRadius: `${settings.cornerRadius}px`,
      fontFamily: settings.fontFamily,
    };

    if (settings.buttonStyle === 'solid') {
      return {
        ...base,
        backgroundColor: settings.buttonColor,
        color: settings.textColor,
        boxShadow: settings.shadowStyle === 'none' ? 'none' :
                   settings.shadowStyle === 'subtle' ? `0 2px 4px ${settings.shadowColor}20` :
                   settings.shadowStyle === 'strong' ? `0 4px 8px ${settings.shadowColor}40` :
                   `2px 2px 0 ${settings.shadowColor}`,
      };
    } else if (settings.buttonStyle === 'glass') {
      return {
        ...base,
        backgroundColor: `${settings.buttonColor}30`,
        backdropFilter: 'blur(8px)',
        color: settings.buttonColor,
        border: `1px solid ${settings.buttonColor}40`,
      };
    } else {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `2px solid ${settings.buttonColor}`,
        color: settings.buttonColor,
      };
    }
  };

  // Get featured social icons for header row
  const getFeaturedSocialIcons = () => {
    return links
      .map(link => {
        const platform = FEATURED_PLATFORMS.find(p => 
          link.url.toLowerCase().includes(p.pattern)
        );
        return platform ? { ...platform, link } : null;
      })
      .filter(Boolean)
      .slice(0, 8);
  };

  const featuredIcons = getFeaturedSocialIcons();

  /**
   * Extract dominant color from a CSS gradient string
   * Returns the first color found in the gradient, or fallback
   */
  const extractDominantColorFromGradient = (gradient: string, fallback: string): string => {
    if (!gradient) return fallback;
    
    // Match hex colors (#fff, #ffffff)
    const hexMatch = gradient.match(/#([0-9A-Fa-f]{3,8})\b/);
    if (hexMatch) return `#${hexMatch[1]}`;
    
    // Match rgb/rgba colors
    const rgbMatch = gradient.match(/rgba?\s*\([^)]+\)/);
    if (rgbMatch) return rgbMatch[0];
    
    // Match named colors at the start of gradient stops
    const namedColors = ['red', 'blue', 'green', 'purple', 'pink', 'orange', 'yellow', 'cyan', 'magenta', 'teal', 'indigo', 'violet'];
    for (const color of namedColors) {
      if (gradient.toLowerCase().includes(color)) return color;
    }
    
    return fallback;
  };

  /**
   * Get the effective banner color - derived from wallpaper or custom
   */
  const getBannerColor = (): string => {
    const bannerSettings = settings.bannerSettings || defaultBannerSettings;
    
    // If custom color is set and not derived from wallpaper, use it
    if (!bannerSettings.derivedFromWallpaper && bannerSettings.color) {
      return bannerSettings.color;
    }
    
    // Try to derive from wallpaper
    if (settings.wallpaper) {
      // If wallpaper is a gradient, extract dominant color
      if (settings.wallpaper.startsWith('linear-gradient') || settings.wallpaper.startsWith('radial-gradient')) {
        return extractDominantColorFromGradient(settings.wallpaper, settings.buttonColor);
      }
      // If wallpaper is a solid color (hex or named)
      if (settings.wallpaper.startsWith('#') || /^[a-zA-Z]+$/.test(settings.wallpaper)) {
        return settings.wallpaper;
      }
    }
    
    // Fallback to button color for visual consistency
    return settings.buttonColor;
  };

  /**
   * Get the banner background style (color or image)
   */
  const getBannerStyle = (): React.CSSProperties => {
    const bannerSettings = settings.bannerSettings || defaultBannerSettings;
    
    // Image mode - show uploaded banner image
    if (bannerSettings.mode === 'image' && bannerSettings.image) {
      return {
        backgroundImage: `url(${bannerSettings.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Color mode - use derived or custom color
    return {
      backgroundColor: getBannerColor(),
    };
  };

  // Get wallpaper background style
  const getWallpaperStyle = (): React.CSSProperties => {
    if (!settings.wallpaper) {
      return { backgroundColor: settings.backgroundColor };
    }
    // Check if it's a gradient, image URL, or color
    if (settings.wallpaper.startsWith('linear-gradient') || settings.wallpaper.startsWith('radial-gradient')) {
      return { background: settings.wallpaper };
    }
    if (settings.wallpaper.startsWith('url(') || settings.wallpaper.startsWith('http')) {
      const url = settings.wallpaper.startsWith('url(') ? settings.wallpaper : `url(${settings.wallpaper})`;
      return { 
        backgroundImage: url,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: settings.backgroundColor
      };
    }
    return { backgroundColor: settings.wallpaper };
  };

  // Render header based on style
  const renderHeader = () => {
    switch (settings.headerStyle) {
      case 'banner':
        const bannerSettings = settings.bannerSettings || defaultBannerSettings;
        return (
          <>
            {/* Banner Header - Fixed height 8rem (128px) for optimal display */}
            <div 
              className="absolute top-0 left-0 right-0 h-32 z-0"
              style={getBannerStyle()}
            >
              {/* Subtle gradient overlay for text readability when using images */}
              {bannerSettings.mode === 'image' && bannerSettings.image && (
                <div 
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))' }}
                />
              )}
            </div>
            {/* Avatar & Logo Section - positioned over banner */}
            <div className="relative z-10 pt-20">
              <div className="flex flex-col items-center">
                {/* Profile Photo (Avatar) */}
                <div className="relative -mt-8">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                      {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  {/* Logo Badge */}
                  {profile.logo && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
                      <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case 'avatar-top':
        return (
          <>
            {/* Avatar at very top */}
            <div className="flex flex-col items-center pt-10">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-28 h-28 rounded-full object-cover border-4 shadow-xl"
                    style={{ borderColor: settings.buttonColor }}
                  />
                ) : (
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl"
                    style={{ backgroundColor: settings.buttonColor }}
                  >
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {/* Logo Badge */}
                {profile.logo && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'minimal':
        return (
          <>
            {/* Minimal - small avatar left-aligned */}
            <div className="flex items-center gap-3 pt-10 px-2">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-14 h-14 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
                    style={{ backgroundColor: settings.buttonColor }}
                  >
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold truncate"
                  style={{ color: wcagColors.nameColor }}
                >
                  {profile.displayName}
                </h3>
                {(profile.headline || (profile.showBio !== false && profile.bio)) && (
                  <p 
                    className="text-xs truncate"
                    style={{ color: wcagColors.bioColor }}
                  >
                    {profile.headline || (profile.showBio !== false ? profile.bio : '')}
                  </p>
                )}
              </div>
            </div>
          </>
        );

      case 'hero-photo':
        // Get header background settings with defaults
        const hb = settings.headerBackground || defaultHeaderBackground;
        const hasPhoto = !!profile.avatar && profile.avatar.length > 0;
        
        // Debug log
        console.log('[Hero-Photo]', { avatar: profile.avatar, hasPhoto });
        
        // WCAG 2.1 AA compliant colors - ensure 4.5:1 contrast ratio
        // For light backgrounds, use dark text; for dark backgrounds, use light text
        const bgColor = settings.backgroundColor || '#F5F0EB';
        const isLightBg = bgColor.toLowerCase() !== '#0f0f0f' && !bgColor.toLowerCase().includes('1a1a');
        const textColor = isLightBg ? '#1a1a1a' : '#ffffff';  // WCAG AA: Black on light, White on dark
        const textColorSecondary = isLightBg ? '#4a4a4a' : '#d1d1d1';  // WCAG AA secondary
        
        return (
          <>
            {/* Hero Photo Section - Profile photo at top */}
            <div className="relative">
              {/* Profile Photo */}
              {hasPhoto ? (
                <img 
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-full h-48 object-cover"
                  style={{
                    objectPosition: 'center 20%',
                    filter: hb.blur > 0 ? `blur(${hb.blur}px)` : undefined,
                  }}
                />
              ) : (
                <div 
                  className="w-full h-48"
                  style={{ background: hb.fallbackGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                />
              )}
              
              {/* Overlay for darkening */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `rgba(0, 0, 0, ${(hb.overlayOpacity || 15) / 100})`,
                }}
              />
              
              {/* Bottom fade gradient */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${bgColor}, transparent)`,
                }}
              />
              
              {/* Logo Badge in top corner */}
              {profile.logo && (
                <div className="absolute top-8 right-4 w-10 h-10 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden">
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            {/* Profile Info Section - On solid background for readability (WCAG AA) */}
            <div 
              className="relative px-4 text-center pt-2 pb-2 z-10"
              style={{ backgroundColor: bgColor }}
            >
              {/* Name - WCAG AA: minimum 4.5:1 contrast */}
              <h3 
                className="text-xl font-bold mb-1"
                style={{ color: textColor }}
              >
                {profile.displayName}
              </h3>
              
              {/* Bio/Headline - WCAG AA compliant secondary text */}
              {(profile.headline || (profile.showBio !== false && profile.bio)) && (
                <p 
                  className="text-sm mb-2 px-2 line-clamp-2"
                  style={{ color: textColorSecondary }}
                >
                  {profile.headline || (profile.showBio !== false ? profile.bio : '')}
                </p>
              )}
            </div>
          </>
        );

      case 'simple':
      default:
        return (
          <>
            {/* Simple - centered avatar */}
            {/* Avatar & Logo Section */}
            <div className="flex flex-col items-center pt-10 mb-3">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-3 border-white shadow-lg">
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {/* Logo Badge */}
                {profile.logo && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="relative mx-auto">
        {/* Phone Outer Frame */}
        <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Phone Inner Bezel */}
          <div className="bg-gray-800 rounded-[2.5rem] p-1">
            {/* Phone Screen */}
            <div 
              className="rounded-[2.25rem] overflow-hidden w-64 h-[520px] relative"
              style={getWallpaperStyle()}
            >
              {/* Wallpaper Overlay for opacity control */}
              {settings.wallpaper && settings.wallpaperOpacity < 100 && (
                <div 
                  className="absolute inset-0 z-0"
                  style={{ 
                    backgroundColor: settings.backgroundColor,
                    opacity: (100 - settings.wallpaperOpacity) / 100 
                  }}
                />
              )}

              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-20"></div>

              {/* Screen Content */}
              <div 
                className={`h-full overflow-y-auto pb-4 relative z-10 flex flex-col ${
                  settings.headerStyle === 'hero-photo' ? '' : 'px-4'
                }`}
                style={{ fontFamily: settings.fontFamily }}
              >
                {/* Header Section */}
                {renderHeader()}

                {/* Content wrapper with padding for hero-photo */}
                <div 
                  className={settings.headerStyle === 'hero-photo' ? 'px-4 flex-1' : ''}
                  style={settings.headerStyle === 'hero-photo' ? { backgroundColor: settings.backgroundColor || '#F5F0EB' } : undefined}
                >
                  {/* Name & Bio (skip for minimal and hero-photo since they're inline) */}
                {settings.headerStyle !== 'minimal' && settings.headerStyle !== 'hero-photo' && (
                  <>
                    <h3 
                      className="text-center text-lg font-bold mb-1"
                      style={{ color: wcagColors.nameColor }}
                    >
                      {profile.displayName}
                    </h3>
                    {(profile.headline || (profile.showBio !== false && profile.bio)) && (
                      <p 
                        className="text-center text-xs mb-3 px-2 line-clamp-2"
                        style={{ color: wcagColors.bioColor }}
                      >
                        {profile.headline || (profile.showBio !== false ? profile.bio : '')}
                      </p>
                    )}
                  </>
                )}

                {/* Contact Info Section - Personal and Company contacts */}
                {((profile.showEmail && profile.publicEmail) || 
                  (profile.showPhone && profile.publicPhone) || 
                  (profile.showWebsite && profile.website) ||
                  (profile.showCompanyEmail && profile.companyEmail) ||
                  (profile.showCompanyPhone && profile.companyPhone)) && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {/* Personal Email */}
                    {profile.showEmail && profile.publicEmail && (
                      <a
                        href={`mailto:${profile.publicEmail}`}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                        }}
                        title={`Personal: ${profile.publicEmail}`}
                      >
                        <Mail className="w-4 h-4" style={{ color: wcagColors.nameColor }} />
                      </a>
                    )}
                    {/* Personal Phone */}
                    {profile.showPhone && profile.publicPhone && (
                      <a
                        href={`tel:${profile.publicPhone}`}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                        }}
                        title={`Personal: ${profile.publicPhone}`}
                      >
                        <Phone className="w-4 h-4" style={{ color: wcagColors.nameColor }} />
                      </a>
                    )}
                    {/* Company Email */}
                    {profile.showCompanyEmail && profile.companyEmail && (
                      <a
                        href={`mailto:${profile.companyEmail}`}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: wcagColors.isLight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.25)',
                        }}
                        title={`Work: ${profile.companyEmail}`}
                      >
                        <Briefcase className="w-4 h-4" style={{ color: wcagColors.nameColor }} />
                      </a>
                    )}
                    {/* Company Phone */}
                    {profile.showCompanyPhone && profile.companyPhone && (
                      <a
                        href={`tel:${profile.companyPhone}`}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: wcagColors.isLight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.25)',
                        }}
                        title={`Work: ${profile.companyPhone}`}
                      >
                        <Building2 className="w-4 h-4" style={{ color: wcagColors.nameColor }} />
                      </a>
                    )}
                    {/* Website */}
                    {profile.showWebsite && profile.website && (
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                        }}
                        title={profile.website}
                      >
                        <Globe className="w-4 h-4" style={{ color: wcagColors.nameColor }} />
                      </a>
                    )}
                  </div>
                )}

                {/* Social Icons Row */}
                {featuredIcons.length > 0 && (
                  <div className={`flex justify-center gap-3 mb-4 ${settings.headerStyle === 'hero-photo' ? 'mt-0' : 'mt-2'}`}>
                    {featuredIcons.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-center rounded-full ${
                          settings.headerStyle === 'hero-photo' 
                            ? 'w-9 h-9 bg-white shadow-md' 
                            : 'w-7 h-7 bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <img 
                          src={item.link.customLogo || `/assets/social-logos/${item.icon}.svg`}
                          alt={item.name}
                          className={settings.headerStyle === 'hero-photo' ? 'w-5 h-5' : 'w-4 h-4'}
                          style={{ filter: settings.headerStyle === 'hero-photo' ? 'none' : undefined }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Bar - QR, Share, Save Contact */}
                <div 
                  className="rounded-xl p-3 mb-4"
                  style={{ 
                    backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${wcagColors.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {/* Inline QR Code */}
                  {profileUrl && (
                    <div className="flex justify-center mb-3">
                      <ProfileQRCode
                        profileUrl={profileUrl}
                        size={80}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        showLabel={true}
                        labelText="Scan to connect"
                        labelColor={wcagColors.bioColor}
                        className="scale-90"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
                      style={{ backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${settings.buttonColor}20` }}
                      >
                        <Share2 className="w-4 h-4" style={{ color: settings.buttonColor }} />
                      </div>
                      <span className="text-[9px] font-medium" style={{ color: wcagColors.nameColor }}>Share</span>
                    </div>
                    <div 
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
                      style={{ backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${settings.buttonColor}20` }}
                      >
                        <Download className="w-4 h-4" style={{ color: settings.buttonColor }} />
                      </div>
                      <span className="text-[9px] font-medium text-center" style={{ color: wcagColors.nameColor }}>Save</span>
                    </div>
                  </div>
                </div>

                {/* Links as Icon Cards */}
                {links.length > 0 && (
                  <div className="flex-1">
                    {/* Section Divider */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: `${wcagColors.nameColor}15` }} />
                      <span className="text-[9px] font-medium uppercase tracking-wider opacity-50" style={{ color: wcagColors.nameColor }}>
                        Links
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: `${wcagColors.nameColor}15` }} />
                    </div>
                    
                    {/* Icon Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {links.map((link) => {
                        const platform = detectPlatformFromUrl(link.url);
                        const logoSrc = link.customLogo || platform?.logo || DEFAULT_LOGO;
                        const displayName = link.displayLabel || platform?.name || link.platform || 'Link';

                        return (
                          <div
                            key={link.id}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-transform hover:scale-105"
                            style={{ 
                              backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${wcagColors.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)'}`
                            }}
                          >
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ 
                                backgroundColor: `${settings.buttonColor}12`,
                                border: `1px solid ${settings.buttonColor}20`
                              }}
                            >
                              <img
                                src={logoSrc}
                                alt={displayName}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_LOGO;
                                }}
                              />
                            </div>
                            <span 
                              className="text-[9px] font-medium text-center line-clamp-1 w-full"
                              style={{ color: wcagColors.nameColor }}
                            >
                              {displayName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {links.length === 0 && (
                  <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${settings.buttonColor}15` }}
                    >
                      <ExternalLink className="w-6 h-6" style={{ color: settings.buttonColor }} />
                    </div>
                    <p className="text-xs opacity-50" style={{ color: wcagColors.nameColor }}>
                      Add links to see them here
                    </p>
                  </div>
                )}

                {/* Footer Section */}
                <div className="mt-auto pt-4">
                  {settings.footerText && (
                    <p className="text-center text-xs text-gray-500 mb-1">
                      {settings.footerText}
                    </p>
                  )}
                  {settings.showPoweredBy && (
                    <p className="text-center text-[10px] text-gray-400">
                      Powered by SwazSolutions
                    </p>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons (Side) */}
        <div className="absolute -right-1 top-24 w-1 h-8 bg-gray-700 rounded-l-sm"></div>
        <div className="absolute -left-1 top-20 w-1 h-6 bg-gray-700 rounded-r-sm"></div>
        <div className="absolute -left-1 top-32 w-1 h-10 bg-gray-700 rounded-r-sm"></div>
        <div className="absolute -left-1 top-44 w-1 h-10 bg-gray-700 rounded-r-sm"></div>
      </div>

      {/* Preview Actions */}
      <div className="mt-4 flex justify-center gap-4 relative">
        {/* Preview Button - Opens public profile in new tab */}
        <button 
          onClick={() => {
            if (onPreview) {
              onPreview();
            } else {
              // Default behavior: open public profile in new tab
              const publicUrl = `${window.location.origin}/#/u/${profile.username}`;
              window.open(publicUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          className="text-sm text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>

        {/* Share Button with dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              if (onShare) {
                onShare();
              } else {
                setShowShareMenu(!showShareMenu);
              }
            }}
            className="text-sm text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          {/* Share Menu Dropdown */}
          {showShareMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] z-50">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                Share Profile
              </div>
              
              {/* Copy Link */}
              <button
                onClick={async () => {
                  const publicUrl = `${window.location.origin}/#/u/${profile.username}`;
                  try {
                    await navigator.clipboard.writeText(publicUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>

              {/* Open in New Tab */}
              <button
                onClick={() => {
                  const publicUrl = `${window.location.origin}/#/u/${profile.username}`;
                  window.open(publicUrl, '_blank', 'noopener,noreferrer');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Open in New Tab</span>
              </button>

              {/* Native Share (if supported) */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={async () => {
                    const publicUrl = `${window.location.origin}/#/u/${profile.username}`;
                    try {
                      await navigator.share({
                        title: `${profile.displayName}'s Profile`,
                        text: `Check out ${profile.displayName}'s profile!`,
                        url: publicUrl,
                      });
                      setShowShareMenu(false);
                    } catch (err) {
                      if ((err as Error).name !== 'AbortError') {
                        console.error('Share failed:', err);
                      }
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">More Options...</span>
                </button>
              )}

              {/* Close button */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close share menu when clicking outside */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default MobilePreview;
