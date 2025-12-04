// PublicProfileView Component
// Renders the public profile with appearance settings matching MobilePreview exactly
// This ensures visual consistency between editor preview and public profile
// Features: Modern icon-based links, action bar for QR/Share/vCard, mobile-first design

import React, { useCallback } from 'react';
import { Mail, Phone, Globe, Briefcase, Building2, Download, Share2, ExternalLink } from 'lucide-react';
import { getOptimalTextColor, getOptimalSecondaryTextColor, isLightColor } from '../../utils/wcagValidator';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../../constants/platforms';
import { ProfileQRCode } from './ProfileQRCode';

// Header background settings for Visual themes (hero-photo style)
export interface HeaderBackgroundSettings {
  useProfilePhoto: boolean;
  height: string;
  overlayColor: string;
  overlayOpacity: number;
  blur: number;
  gradientOverlay?: string;
  fallbackGradient: string;
}

// Banner settings for banner header style
export interface BannerSettings {
  mode: 'color' | 'image';
  color: string;
  image?: string;
  derivedFromWallpaper: boolean;
}

export interface AppearanceSettings {
  buttonStyle: 'solid' | 'glass' | 'outline';
  cornerRadius: number;
  shadowStyle: 'none' | 'subtle' | 'strong' | 'hard';
  buttonColor: string;
  shadowColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  headerStyle: 'simple' | 'banner' | 'avatar-top' | 'minimal' | 'hero-photo';
  headerColor: string;
  headerBackground?: HeaderBackgroundSettings;
  bannerSettings?: BannerSettings;
  wallpaper: string;
  wallpaperOpacity: number;
  footerText: string;
  showPoweredBy: boolean;
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
  pronouns?: string;
  company?: string;
}

interface PublicProfileViewProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings | null;
  /** URL to the public profile for QR code generation */
  profileUrl?: string;
  onDownloadVCard?: () => void;
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

// Default settings
const defaultHeaderBackground: HeaderBackgroundSettings = {
  useProfilePhoto: true,
  height: '45%',
  overlayColor: 'rgba(0, 0, 0, 0.3)',
  overlayOpacity: 30,
  blur: 0,
  fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const defaultBannerSettings: BannerSettings = {
  mode: 'color',
  color: '#8B5CF6',
  derivedFromWallpaper: true,
};

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

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  profile,
  links,
  appearance,
  profileUrl,
  onDownloadVCard,
  onShare,
}) => {
  const settings = appearance || defaultAppearance;

  /**
   * Get WCAG-compliant text colors based on background
   */
  const getWCAGTextColors = useCallback(() => {
    let bgColor = settings.backgroundColor;
    
    if (settings.wallpaper) {
      if (settings.wallpaper.startsWith('#') || /^[a-zA-Z]+$/.test(settings.wallpaper)) {
        bgColor = settings.wallpaper;
      } else if (settings.wallpaper.startsWith('linear-gradient') || settings.wallpaper.startsWith('radial-gradient')) {
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
  const getButtonStyle = (): React.CSSProperties => {
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
   */
  const extractDominantColorFromGradient = (gradient: string, fallback: string): string => {
    if (!gradient) return fallback;
    
    const hexMatch = gradient.match(/#([0-9A-Fa-f]{3,8})\b/);
    if (hexMatch) return `#${hexMatch[1]}`;
    
    const rgbMatch = gradient.match(/rgba?\s*\([^)]+\)/);
    if (rgbMatch) return rgbMatch[0];
    
    const namedColors = ['red', 'blue', 'green', 'purple', 'pink', 'orange', 'yellow', 'cyan', 'magenta', 'teal', 'indigo', 'violet'];
    for (const color of namedColors) {
      if (gradient.toLowerCase().includes(color)) return color;
    }
    
    return fallback;
  };

  /**
   * Get the effective banner color
   */
  const getBannerColor = (): string => {
    const bannerSettings = settings.bannerSettings || defaultBannerSettings;
    
    if (!bannerSettings.derivedFromWallpaper && bannerSettings.color) {
      return bannerSettings.color;
    }
    
    if (settings.wallpaper) {
      if (settings.wallpaper.startsWith('linear-gradient') || settings.wallpaper.startsWith('radial-gradient')) {
        return extractDominantColorFromGradient(settings.wallpaper, settings.buttonColor);
      }
      if (settings.wallpaper.startsWith('#') || /^[a-zA-Z]+$/.test(settings.wallpaper)) {
        return settings.wallpaper;
      }
    }
    
    return settings.buttonColor;
  };

  /**
   * Get the banner background style (color or image)
   */
  const getBannerStyle = (): React.CSSProperties => {
    const bannerSettings = settings.bannerSettings || defaultBannerSettings;
    
    if (bannerSettings.mode === 'image' && bannerSettings.image) {
      return {
        backgroundImage: `url(${bannerSettings.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    return {
      backgroundColor: getBannerColor(),
    };
  };

  // Get wallpaper background style
  const getWallpaperStyle = (): React.CSSProperties => {
    if (!settings.wallpaper) {
      return { backgroundColor: settings.backgroundColor };
    }
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
            {/* Banner Header */}
            <div 
              className="absolute top-0 left-0 right-0 h-32 sm:h-40 z-0"
              style={getBannerStyle()}
            >
              {bannerSettings.mode === 'image' && bannerSettings.image && (
                <div 
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))' }}
                />
              )}
            </div>
            {/* Avatar & Logo Section */}
            <div className="relative z-10 pt-24 sm:pt-28">
              <div className="flex flex-col items-center">
                <div className="relative -mt-12 sm:-mt-16">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-white shadow-lg">
                      {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  {profile.logo && (
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
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
            <div className="flex flex-col items-center pt-10 sm:pt-12">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 shadow-xl"
                    style={{ borderColor: settings.buttonColor }}
                  />
                ) : (
                  <div 
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl"
                    style={{ backgroundColor: settings.buttonColor }}
                  >
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {profile.logo && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
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
            <div className="flex items-center gap-4 pt-10 sm:pt-12 px-4">
              <div className="relative flex-shrink-0">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md"
                    style={{ backgroundColor: settings.buttonColor }}
                  >
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 
                  className="text-xl sm:text-2xl font-bold truncate"
                  style={{ color: wcagColors.nameColor }}
                >
                  {profile.displayName}
                </h1>
                {profile.pronouns && (
                  <p className="text-sm" style={{ color: wcagColors.bioColor }}>
                    ({profile.pronouns})
                  </p>
                )}
                {(profile.headline || (profile.showBio !== false && profile.bio)) && (
                  <p 
                    className="text-sm sm:text-base truncate mt-1"
                    style={{ color: wcagColors.bioColor }}
                  >
                    {profile.headline || (profile.showBio !== false ? profile.bio : '')}
                  </p>
                )}
                {profile.company && (
                  <p className="text-sm" style={{ color: wcagColors.bioColor }}>
                    {profile.company}
                  </p>
                )}
              </div>
            </div>
          </>
        );

      case 'hero-photo':
        const hb = settings.headerBackground || defaultHeaderBackground;
        const hasPhoto = !!profile.avatar && profile.avatar.length > 0;
        const bgColor = settings.backgroundColor || '#F5F0EB';
        const isLightBg = bgColor.toLowerCase() !== '#0f0f0f' && !bgColor.toLowerCase().includes('1a1a');
        const textColor = isLightBg ? '#1a1a1a' : '#ffffff';
        const textColorSecondary = isLightBg ? '#4a4a4a' : '#d1d1d1';
        
        return (
          <>
            <div className="relative">
              {hasPhoto ? (
                <img 
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-full h-48 sm:h-64 object-cover"
                  style={{
                    objectPosition: 'center 20%',
                    filter: hb.blur > 0 ? `blur(${hb.blur}px)` : undefined,
                  }}
                />
              ) : (
                <div 
                  className="w-full h-48 sm:h-64"
                  style={{ background: hb.fallbackGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                />
              )}
              
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `rgba(0, 0, 0, ${(hb.overlayOpacity || 15) / 100})`,
                }}
              />
              
              <div 
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${bgColor}, transparent)`,
                }}
              />
              
              {profile.logo && (
                <div className="absolute top-8 right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden">
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <div 
              className="relative px-4 sm:px-6 text-center pt-4 pb-4 z-10"
              style={{ backgroundColor: bgColor }}
            >
              <h1 
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: textColor }}
              >
                {profile.displayName}
              </h1>
              {profile.pronouns && (
                <p className="text-sm mb-1" style={{ color: textColorSecondary }}>
                  ({profile.pronouns})
                </p>
              )}
              {(profile.headline || (profile.showBio !== false && profile.bio)) && (
                <p 
                  className="text-sm sm:text-base mb-2 px-2 line-clamp-3"
                  style={{ color: textColorSecondary }}
                >
                  {profile.headline || (profile.showBio !== false ? profile.bio : '')}
                </p>
              )}
              {profile.company && (
                <p className="text-sm" style={{ color: textColorSecondary }}>
                  {profile.company}
                </p>
              )}
            </div>
          </>
        );

      case 'simple':
      default:
        return (
          <>
            <div className="flex flex-col items-center pt-10 sm:pt-12 mb-4">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-white shadow-lg">
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {profile.logo && (
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  // Render action section with inline QR code and action buttons
  const renderActionButtons = () => {
    const hasActions = onDownloadVCard || onShare || profileUrl;
    if (!hasActions) return null;

    return (
      <div className="my-6">
        {/* Modern Action Bar */}
        <div 
          className="rounded-2xl p-4 sm:p-5 backdrop-blur-sm"
          style={{ 
            backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`
          }}
        >
          {/* Inline QR Code - Scannable Size */}
          {profileUrl && (
            <div className="flex justify-center mb-4">
              <ProfileQRCode
                profileUrl={profileUrl}
                size={140}
                bgColor={wcagColors.isLight ? '#FFFFFF' : '#FFFFFF'}
                fgColor="#000000"
                showLabel={true}
                labelText="Scan to connect"
                labelColor={wcagColors.bioColor}
              />
            </div>
          )}

          {/* Action Buttons Row */}
          <div className={`grid gap-3 ${onShare && onDownloadVCard ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Share */}
            {onShare && (
              <button
                onClick={onShare}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                style={{ 
                  backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${settings.buttonColor}20` }}
                >
                  <Share2 className="w-6 h-6" style={{ color: settings.buttonColor }} />
                </div>
                <span className="text-xs font-medium" style={{ color: wcagColors.nameColor }}>
                  Share
                </span>
              </button>
            )}

            {/* Save Contact (vCard) */}
            {onDownloadVCard && (
              <button
                onClick={onDownloadVCard}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                style={{ 
                  backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${settings.buttonColor}20` }}
                >
                  <Download className="w-6 h-6" style={{ color: settings.buttonColor }} />
                </div>
                <span className="text-xs font-medium text-center" style={{ color: wcagColors.nameColor }}>
                  Save to Phone
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render links as elegant icon cards with labels
  const renderLinks = () => {
    if (links.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg opacity-60" style={{ color: wcagColors.bioColor }}>
            No links available
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ backgroundColor: `${wcagColors.nameColor}20` }} />
          <span className="text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: wcagColors.nameColor }}>
            Links
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: `${wcagColors.nameColor}20` }} />
        </div>

        {/* Links Grid - Modern Icon Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {links.map((link) => {
            const platform = detectPlatformFromUrl(link.url);
            const logoSrc = link.customLogo || platform?.logo || DEFAULT_LOGO;
            const displayName = link.displayLabel || platform?.name || link.platform || 'Link';

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${wcagColors.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}`
                }}
              >
                {/* Icon Container */}
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: `${settings.buttonColor}15`,
                    border: `1px solid ${settings.buttonColor}25`
                  }}
                >
                  <img
                    src={logoSrc}
                    alt={displayName}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LOGO;
                    }}
                  />
                </div>

                {/* Label */}
                <span 
                  className="text-sm font-medium text-center line-clamp-2"
                  style={{ color: wcagColors.nameColor }}
                >
                  {displayName}
                </span>

                {/* External Link Indicator */}
                <ExternalLink 
                  className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity absolute top-2 right-2" 
                  style={{ color: wcagColors.nameColor }}
                />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
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

      {/* Content Container */}
      <div 
        className={`relative z-10 max-w-2xl mx-auto ${
          settings.headerStyle === 'hero-photo' ? '' : 'px-4 sm:px-6'
        }`}
        style={{ fontFamily: settings.fontFamily }}
      >
        {/* Header Section */}
        {renderHeader()}

        {/* Content wrapper with padding for hero-photo */}
        <div 
          className={settings.headerStyle === 'hero-photo' ? 'px-4 sm:px-6' : ''}
          style={settings.headerStyle === 'hero-photo' ? { backgroundColor: settings.backgroundColor || '#F5F0EB' } : undefined}
        >
          {/* Name & Bio (skip for minimal and hero-photo since they're inline) */}
          {settings.headerStyle !== 'minimal' && settings.headerStyle !== 'hero-photo' && (
            <div className="text-center mb-4">
              <h1 
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: wcagColors.nameColor }}
              >
                {profile.displayName}
              </h1>
              {profile.pronouns && (
                <p className="text-sm mb-1" style={{ color: wcagColors.bioColor }}>
                  ({profile.pronouns})
                </p>
              )}
              {(profile.headline) && (
                <p 
                  className="text-sm sm:text-base mb-2"
                  style={{ color: wcagColors.bioColor }}
                >
                  {profile.headline}
                </p>
              )}
              {profile.company && (
                <p className="text-sm mb-2" style={{ color: wcagColors.bioColor }}>
                  {profile.company}
                </p>
              )}
              {profile.bio && profile.showBio !== false && (
                <p 
                  className="text-sm sm:text-base whitespace-pre-wrap"
                  style={{ color: wcagColors.bioColor }}
                >
                  {profile.bio}
                </p>
              )}
            </div>
          )}

          {/* Contact Info Section - Personal and Company contacts */}
          {((profile.showEmail && profile.publicEmail) || 
            (profile.showPhone && profile.publicPhone) || 
            (profile.showWebsite && profile.website) ||
            (profile.showCompanyEmail && profile.companyEmail) ||
            (profile.showCompanyPhone && profile.companyPhone)) && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {profile.showEmail && profile.publicEmail && (
                <a
                  href={`mailto:${profile.publicEmail}`}
                  className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                  }}
                  title={`Personal: ${profile.publicEmail}`}
                >
                  <Mail className="w-5 h-5" style={{ color: wcagColors.nameColor }} />
                </a>
              )}
              {profile.showPhone && profile.publicPhone && (
                <a
                  href={`tel:${profile.publicPhone}`}
                  className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                  }}
                  title={`Personal: ${profile.publicPhone}`}
                >
                  <Phone className="w-5 h-5" style={{ color: wcagColors.nameColor }} />
                </a>
              )}
              {profile.showCompanyEmail && profile.companyEmail && (
                <a
                  href={`mailto:${profile.companyEmail}`}
                  className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: wcagColors.isLight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.25)',
                  }}
                  title={`Work: ${profile.companyEmail}`}
                >
                  <Briefcase className="w-5 h-5" style={{ color: wcagColors.nameColor }} />
                </a>
              )}
              {profile.showCompanyPhone && profile.companyPhone && (
                <a
                  href={`tel:${profile.companyPhone}`}
                  className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: wcagColors.isLight ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.25)',
                  }}
                  title={`Work: ${profile.companyPhone}`}
                >
                  <Building2 className="w-5 h-5" style={{ color: wcagColors.nameColor }} />
                </a>
              )}
              {profile.showWebsite && profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: wcagColors.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                  }}
                  title={profile.website}
                >
                  <Globe className="w-5 h-5" style={{ color: wcagColors.nameColor }} />
                </a>
              )}
            </div>
          )}

          {/* Social Icons Row */}
          {featuredIcons.length > 0 && (
            <div className={`flex justify-center gap-3 sm:gap-4 mb-6 ${settings.headerStyle === 'hero-photo' ? 'mt-0' : 'mt-4'}`}>
              {featuredIcons.map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center rounded-full transition-transform hover:scale-110 ${
                    settings.headerStyle === 'hero-photo' 
                      ? 'w-11 h-11 sm:w-12 sm:h-12 bg-white shadow-md' 
                      : 'w-10 h-10 sm:w-11 sm:h-11 bg-gray-100 dark:bg-gray-700'
                  }`}
                  title={item.name}
                >
                  <img 
                    src={item.link.customLogo || `/assets/social-logos/${item.icon}.svg`}
                    alt={item.name}
                    className={settings.headerStyle === 'hero-photo' ? 'w-6 h-6' : 'w-5 h-5 sm:w-6 sm:h-6'}
                    style={{ filter: settings.headerStyle === 'hero-photo' ? 'none' : undefined }}
                  />
                </a>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {renderActionButtons()}

          {/* Links as Icon Cards */}
          {renderLinks()}

          {/* Footer Section */}
          <div className="py-8 text-center">
            {settings.footerText && (
              <p className="text-sm mb-2" style={{ color: wcagColors.bioColor }}>
                {settings.footerText}
              </p>
            )}
            {settings.showPoweredBy && (
              <p className="text-xs text-gray-400">
                Powered by SwazSolutions
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileView;
