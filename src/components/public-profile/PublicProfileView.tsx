// PublicProfileView Component
// Renders the public profile with appearance settings matching MobilePreview exactly
// This ensures visual consistency between editor preview and public profile
// Features: Modern icon-based links, action bar for QR/Share/vCard, mobile-first design

import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Globe, Briefcase, Building2, Download, Share2, ExternalLink, MapPin } from 'lucide-react';
import { getOptimalTextColor, getOptimalSecondaryTextColor, isLightColor } from '../../utils/wcagValidator';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../../constants/platforms';
import { ProfileQRCode } from './ProfileQRCode';
import { LazyImage } from '../LazyImage';
import { ThemeRenderer } from './ThemeRenderer';

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
  // Personal address fields
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
  // Company address fields
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
  image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" // Modern fallback
};

const defaultAppearance: AppearanceSettings = {
  buttonStyle: 'glass', // Default to Glass for modern feel
  cornerRadius: 16,
  shadowStyle: 'subtle',
  buttonColor: '#8B5CF6',
  shadowColor: '#000000',
  textColor: '#FFFFFF',
  backgroundColor: '#F9FAFB',
  fontFamily: 'Inter',
  headerStyle: 'simple', // Changed to simple to match screenshot
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Precise Theme Detection via data-theme attribute MutationObserver
  useEffect(() => {
    // Initial check
    const checkTheme = () => {
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Use html attribute first (controlled by Header), fallback to system
      setIsDarkMode(htmlTheme === 'dark' || (!htmlTheme && prefersDark));
    };

    checkTheme();

    // Create observer for dynamic changes (toggled from Header)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);


  /**
   * Get WCAG-compliant text colors based on background
   */
  const getWCAGTextColors = useCallback(() => {
    let bgColor = settings.backgroundColor;
    let isDarkBg = false;

    // Determine if we should treat the background as dark or light
    if (isDarkMode && !settings.wallpaper) {
      // If system is dark and no specific wallpaper, we are in dark mode default
      isDarkBg = true;
      bgColor = '#111827';
    } else if (settings.wallpaper) {
      if (settings.wallpaper.startsWith('#') || /^[a-zA-Z]+$/.test(settings.wallpaper)) {
        bgColor = settings.wallpaper;
        isDarkBg = !isLightColor(bgColor);
      } else if (settings.wallpaper.startsWith('linear-gradient') || settings.wallpaper.startsWith('radial-gradient')) {
        // Assume all gradients are relatively dark for safety, or check dominant color if extracting
        // For simpler logic, let's assume if it's a gradient and we are in dark mode, prefer light text
        // Or check the hex match
        const hexMatch = settings.wallpaper.match(/#([0-9A-Fa-f]{3,8})\b/);
        if (hexMatch) {
          bgColor = `#${hexMatch[1]}`;
          isDarkBg = !isLightColor(bgColor);
        } else {
          // Fallback for complex gradients - trust system preference or assume dark for modern vibrant designs
          isDarkBg = true;
        }
      }
    } else {
      // Solid background color
      isDarkBg = !isLightColor(bgColor);
    }

    // Force high contrast
    const nameColor = isDarkBg ? '#FFFFFF' : '#111827'; // White for dark, Gray-900 for light
    const bioColor = isDarkBg ? '#E5E7EB' : '#4B5563'; // Gray-200 for dark, Gray-600 for light

    return {
      nameColor,
      bioColor,
      isLight: !isDarkBg,
      bgColor,
      isDarkBg
    };
  }, [settings.backgroundColor, settings.wallpaper, isDarkMode]);

  const wcagColors = getWCAGTextColors();

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
      .slice(0, 8); // Limit to top 8 icons
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

  // Get wallpaper background style with fallback to mesh gradient
  const getWallpaperStyle = (): React.CSSProperties => {
    if (!settings.wallpaper) {
      // Automatic theme handling for default wallpaper
      if (isDarkMode) {
        // Premium Dark Mesh Gradient (matches screenshot vibe)
        return {
          background: `radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                         radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
                         radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)`,
          backgroundColor: '#111827'
        };
      } else {
        // Premium Light Mesh Gradient
        return {
          background: `radial-gradient(at 0% 0%, hsla(253,100%,96%,1) 0, transparent 50%), 
                          radial-gradient(at 50% 0%, hsla(225,100%,94%,1) 0, transparent 50%), 
                          radial-gradient(at 100% 0%, hsla(339,100%,94%,1) 0, transparent 50%)`,
          backgroundColor: '#F9FAFB'
        };
      }
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
        backgroundAttachment: 'fixed', // Parallax effect
        backgroundColor: settings.backgroundColor
      };
    }
    return { backgroundColor: settings.wallpaper };
  };

  // Render header based on style
  const renderHeader = () => {
    const avatarSizeClass = "w-24 h-24 sm:w-28 sm:h-28"; // Compact avatar size

    switch (settings.headerStyle) {
      case 'banner':
        const bannerSettings = settings.bannerSettings || defaultBannerSettings;
        return (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-32 z-0 overflow-hidden"
              style={{
                ...getBannerStyle(),
                borderBottomLeftRadius: '1.5rem',
                borderBottomRightRadius: '1.5rem'
              }}
            >
              {bannerSettings.mode === 'image' && bannerSettings.image && (
                <div
                  className="absolute inset-0 backdrop-blur-[2px]"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))' }}
                />
              )}
            </div>
            <div className="relative z-10 pt-20 px-4 animate-slide-up-fade">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profile.avatar ? (
                    <LazyImage
                      src={profile.avatar}
                      alt={profile.displayName}
                      className={`${avatarSizeClass} rounded-full object-cover border-[4px] shadow-xl transition-transform hover:scale-105`}
                      style={{ borderColor: settings.backgroundColor || '#fff' }}
                      priority
                    />
                  ) : (
                    <div className={`${avatarSizeClass} rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold border-[4px] shadow-xl`}
                      style={{ borderColor: settings.backgroundColor || '#fff' }}>
                      {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case 'hero-photo':
        const hb = settings.headerBackground || defaultHeaderBackground;
        const hasPhoto = !!profile.avatar && profile.avatar.length > 0;

        return (
          <div className="relative animate-slide-up-fade">
            <div className="relative h-60 w-full overflow-hidden rounded-b-[2rem] shadow-2xl">
              {hasPhoto ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                  style={{
                    filter: hb.blur > 0 ? `blur(${hb.blur}px)` : undefined,
                  }}
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: hb.fallbackGradient }}
                />
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-center sm:text-left z-20">
                <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-end gap-6">
                  {/* Logo if available */}
                  {profile.logo && (
                    <div className="hidden sm:block w-16 h-16 rounded-xl glass-panel p-2 shadow-lg mb-2">
                      <LazyImage src={profile.logo} alt="Logo" className="w-full h-full object-contain" priority />
                    </div>
                  )}

                  <div className="flex-1 text-white">
                    <h1 className="text-3xl font-black mb-1 tracking-tight drop-shadow-md">
                      {profile.displayName}
                    </h1>
                    {profile.headline && (
                      <p className="text-base font-medium opacity-90 drop-shadow-sm max-w-2xl line-clamp-2">
                        {profile.headline}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'simple':
      default:
        // Glowing avatar effect from screenshot - Compacted
        return (
          <div className="flex flex-col items-center pt-10 mb-6 animate-slide-up-fade">
            <div className="relative group">
              {/* Animated Glow Backlight */}
              <div className={`absolute inset-0 bg-gradient-to-r ${wcagColors.isDarkBg ? 'from-purple-500 via-pink-500 to-orange-500' : 'from-blue-400 via-teal-400 to-emerald-400'} rounded-full blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse`}></div>

              {/* Avatar Image */}
              <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-white/80 to-white/20">
                {profile.avatar ? (
                  <LazyImage
                    src={profile.avatar}
                    alt={profile.displayName}
                    className={`${avatarSizeClass} rounded-full object-cover border-4 shadow-2xl`}
                    style={{
                      borderColor: wcagColors.isDarkBg ? '#111827' : '#FFFFFF',
                      backgroundColor: wcagColors.isDarkBg ? '#111827' : '#FFFFFF'
                    }}
                    priority
                  />
                ) : (
                  <div className={`${avatarSizeClass} rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white text-4xl font-bold border-4 shadow-2xl`}
                    style={{
                      borderColor: wcagColors.isDarkBg ? '#111827' : '#FFFFFF',
                    }}>
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  // Render buttons specifically for sharing/downloading - Condensed
  const renderActionButtons = () => {
    const hasActions = onDownloadVCard || onShare || profileUrl;
    if (!hasActions) return null;

    return (
      <div className="mt-8 mb-12 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
        <div className={`rounded-3xl p-5 backdrop-blur-xl ${wcagColors.isDarkBg ? 'bg-white/5 border border-white/10' : 'bg-white/40 border border-white/40 shadow-lg'}`}>
          <div className="flex flex-col items-center">
            {profileUrl && (
              <div className="mb-4 p-3 bg-white rounded-xl shadow-lg">
                <ProfileQRCode
                  profileUrl={profileUrl}
                  size={140}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  showLabel={false}
                />
              </div>
            )}

            <div className="flex w-full gap-3">
              {onShare && (
                <button
                  onClick={onShare}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all group ${wcagColors.isDarkBg
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md border border-gray-100'
                    }`}
                >
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Share</span>
                </button>
              )}
              {onDownloadVCard && (
                <button
                  onClick={onDownloadVCard}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all group ${wcagColors.isDarkBg
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md border border-gray-100'
                    }`}
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Save</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render contact chips - Pill Shaped Outlines from screenshot
  const renderContactChips = () => {
    // Define button class based on theme lightness to ensure contrast
    const chipClass = wcagColors.isDarkBg
      ? "px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-white flex items-center gap-2 transition-all hover:bg-white/10 hover:scale-105 backdrop-blur-md text-sm"
      : "px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-800 flex items-center gap-2 transition-all hover:bg-gray-50 hover:shadow-md hover:scale-105 text-sm";

    return (
      <div className="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up-fade" style={{ animationDelay: '0.15s' }}>
        {profile.showEmail && profile.publicEmail && (
          <a href={`mailto:${profile.publicEmail}`} className={chipClass}>
            <Mail className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Email</span>
          </a>
        )}
        {profile.showPhone && profile.publicPhone && (
          <a href={`tel:${profile.publicPhone}`} className={chipClass}>
            <Phone className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Call</span>
          </a>
        )}
        {profile.showWebsite && profile.website && (
          <a href={profile.website} target="_blank" rel="noopener" className={chipClass}>
            <Globe className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Visit</span>
          </a>
        )}
      </div>
    );
  }

  // Render links as elegant glass cards - Condensed List Style
  const renderLinks = () => {
    // Filter out duplicate links (those already shown in featured icons)
    // This solves the 'repetitive elements' feedback
    const uniqueLinks = links.filter(link => {
      // Check if this link pattern matches any featured platform
      const isFeatured = FEATURED_PLATFORMS.some(p =>
        link.url.toLowerCase().includes(p.pattern)
      );
      // Show link if it's NOT a featured platform (custom links)
      // OR if it IS featured but we strictly want to hide social cards to reduce visible duplicates
      // We'll hide redundant social cards for a cleaner UI
      return !isFeatured;
    });

    if (uniqueLinks.length === 0) return null;

    // Header color based on theme
    const headerColor = wcagColors.isDarkBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

    return (
      <div className="space-y-3 pb-8 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-center text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: headerColor }}>
          Highlights
        </h3>

        <div className="grid gap-3">
          {uniqueLinks.map((link, index) => {
            const platform = detectPlatformFromUrl(link.url);
            const logoSrc = link.customLogo || platform?.logo || DEFAULT_LOGO;
            const displayName = link.displayLabel || platform?.name || link.platform || 'Link';

            // Glass panel classes - More Compact List Item Style
            const cardClass = wcagColors.isDarkBg
              ? "group relative flex items-center p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20"
              : "group relative flex items-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5";

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cardClass} transition-all duration-300`}
                style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
              >
                {/* Icon Container - Smaller */}
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className={`absolute inset-0 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity ${wcagColors.isDarkBg ? 'bg-white/20' : 'bg-gray-200'}`} />
                  <div className={`relative w-full h-full rounded-lg flex items-center justify-center ${wcagColors.isDarkBg ? 'bg-white/10 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                    <img
                      src={logoSrc}
                      alt={displayName}
                      className="w-6 h-6 object-contain transition-transform group-hover:scale-110"
                      onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }}
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 ml-4 min-w-0">
                  <h4 className="font-bold text-sm truncate pr-2" style={{ color: wcagColors.nameColor }}>
                    {displayName}
                  </h4>
                  <p className="text-xs truncate opacity-60" style={{ color: wcagColors.nameColor }}>
                    {new URL(link.url).hostname.replace('www.', '')}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${wcagColors.isDarkBg ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen relative w-full overflow-x-hidden selection:bg-purple-500/30"
      style={{
        ...getWallpaperStyle(),
        color: wcagColors.nameColor
      }}
    >
      {/* Background Overlay if opacity < 100 */}
      {settings.wallpaper && settings.wallpaperOpacity < 100 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: settings.backgroundColor,
            opacity: (100 - settings.wallpaperOpacity) / 100
          }}
        />
      )}

      {/* Main Content Container - Full Width Mobile, Centered Desktop */}
      <div className={`relative z-10 w-full max-w-[480px] mx-auto min-h-screen transition-all duration-500 flex flex-col ${settings.wallpaper ? 'border-x border-white/5' : ''}`}>

        {renderHeader()}

        <main className={`flex-1 px-5 pb-8 ${settings.headerStyle === 'hero-photo' ? 'pt-6' : ''}`}>
          {/* Info Block (Name/Bio) for non-hero layouts */}
          {settings.headerStyle !== 'hero-photo' && (
            <div className="text-center mb-6 animate-slide-up-fade">
              <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight drop-shadow-sm">{profile.displayName}</h1>
              {profile.headline && <p className="text-base opacity-90 mb-2 font-medium">{profile.headline}</p>}
              {profile.bio && <p className="text-xs opacity-70 whitespace-pre-wrap max-w-sm mx-auto leading-relaxed">{profile.bio}</p>}

              {/* Social Icons row - ALWAYS visual for common platforms */}
              {featuredIcons.length > 0 && (
                <div className="flex justify-center gap-3 mt-5">
                  {featuredIcons.map((item: any, idx) => (
                    <a
                      key={idx}
                      href={item.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-1 hover:scale-110 ${wcagColors.isDarkBg ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} shadow-sm`}
                    >
                      <img src={item.link.customLogo || `/assets/social-logos/${item.icon}.svg`} alt="" className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {renderContactChips()}
          {renderLinks()}
          {renderActionButtons()}

          {/* Footer */}
          <div className="mt-auto pt-6 pb-4 text-center opacity-40 text-[10px] tracking-[0.2em] uppercase font-bold">
            {settings.footerText && <p className="mb-2">{settings.footerText}</p>}
            {settings.showPoweredBy && <p>Powered by SwazSolutions</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicProfileView;
