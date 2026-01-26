/**
 * SHARED PROFILE RENDERER
 * This component contains all the rendering logic for displaying a profile
 * Used by both PublicProfileView and MobilePreview to ensure exact consistency
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Mail, Phone, Globe, Briefcase, Building2, Download, Share2, ExternalLink, MapPin, Calendar, Link as LinkIcon } from 'lucide-react';
import { getOptimalTextColor, getOptimalSecondaryTextColor, isLightColor } from '../../utils/wcagValidator';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../../constants/platforms';
import { ProfileQRCode } from './ProfileQRCode';
import { LazyImage } from '../LazyImage';

// Re-export types
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

export interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

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

export interface ProfileRendererProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings | null;
  profileUrl?: string;
  onDownloadVCard?: () => void;
  onShare?: () => void;
  isPreview?: boolean; // Add flag for preview mode (no QR code, no action bar)
}

// Animation configuration
const ANIMATION_STAGGER = 100;
const ANIMATION_DURATION = 600;

const defaultHeaderBackground = {
  useProfilePhoto: true,
  height: '45%',
  overlayColor: 'rgba(0, 0, 0, 0.4)',
  overlayOpacity: 40,
  blur: 2,
  fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
};

const defaultBannerSettings = {
  mode: 'color' as const,
  color: '#8B5CF6',
  derivedFromWallpaper: true
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

// Featured social platforms
const FEATURED_PLATFORMS = [
  { name: 'Instagram', icon: 'instagram', pattern: 'instagram.com' },
  { name: 'WhatsApp', icon: 'whatsapp', pattern: 'wa.me' },
  { name: 'YouTube', icon: 'youtube', pattern: 'youtube.com' },
  { name: 'Facebook', icon: 'facebook', pattern: 'facebook.com' },
  { name: 'X', icon: 'x', pattern: 'twitter.com' },
  { name: 'X', icon: 'x', pattern: 'x.com' },
  { name: 'LinkedIn', icon: 'linkedin', pattern: 'linkedin.com' },
  { name: 'TikTok', icon: 'tiktok', pattern: 'tiktok.com' },
  { name: 'Telegram', icon: 'telegram', pattern: 't.me' },
  { name: 'GitHub', icon: 'github', pattern: 'github.com' },
];

export const ProfileRenderer: React.FC<ProfileRendererProps> = ({
  profile,
  links,
  appearance = defaultAppearance,
  profileUrl,
  onDownloadVCard,
  onShare,
  isPreview = false
}) => {
  const settings = appearance || defaultAppearance;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Detect dark mode from appearance
  useEffect(() => {
    const detectDarkMode = () => {
      const root = document.documentElement;
      const dataTheme = root.getAttribute('data-theme');
      if (dataTheme === 'dark') {
        setIsDarkMode(true);
        return;
      }

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    };

    detectDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => detectDarkMode();
    mediaQuery.addEventListener('change', handleChange);

    const observer = new MutationObserver(() => detectDarkMode());
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, [settings.backgroundColor, settings.wallpaper]);

  // Trigger entrance animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // WCAG-compliant color detection
  const getWCAGTextColors = useCallback(() => {
    let bgColor = settings.backgroundColor;
    let isDarkBg = false;

    // Check if wallpaper is a gradient or image
    if (settings.wallpaper) {
      // Extract colors from gradient for better detection
      if (settings.wallpaper.includes('gradient')) {
        const colorMatch = settings.wallpaper.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
        if (colorMatch && colorMatch.length > 0) {
          // Use the first color from gradient as reference
          bgColor = colorMatch[0];
        }
      } else if (settings.wallpaper.startsWith('http')) {
        // For images, use backgroundSecondary
        bgColor = '#F3F4F6';
      } else {
        bgColor = settings.wallpaper;
      }
    }

    // Detect if background is dark
    isDarkBg = !isLightColor(bgColor);

    const nameColor = getOptimalTextColor(bgColor, isDarkMode);
    const bioColor = getOptimalSecondaryTextColor(bgColor, isDarkMode);

    return { nameColor, bioColor, isLight: !isDarkBg, bgColor, isDarkBg };
  }, [settings.backgroundColor, settings.wallpaper, isDarkMode]);

  const { nameColor, bioColor, isLight, bgColor, isDarkBg } = getWCAGTextColors();

  // Render header based on style
  const renderHeader = () => {
    const avatarSize = settings.headerStyle === 'hero-photo' ? 'w-28 h-28' : 'w-24 h-24';
    const avatarBorderRadius = settings.headerStyle === 'avatar-top' ? 'rounded-lg' : 'rounded-full';

    switch (settings.headerStyle) {
      case 'banner':
        return (
          <div className="relative">
            <div
              className="h-32 w-full"
              style={{
                background: settings.bannerSettings?.image
                  ? `url(${settings.bannerSettings.image}) center/cover`
                  : settings.bannerSettings?.color || settings.headerColor
              }}
            />
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className={`${avatarSize} ${avatarBorderRadius} overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg`}>
                {profile.avatar ? (
                  <LazyImage
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'hero-photo':
        const headerBg = settings.headerBackground || defaultHeaderBackground;
        return (
          <div
            className="relative h-48 overflow-hidden"
            style={{
              height: headerBg.height,
              background: headerBg.useProfilePhoto && profile.avatar
                ? `url(${profile.avatar}) center/cover`
                : headerBg.fallbackGradient
            }}
          >
            {(headerBg.useProfilePhoto || headerBg.blur > 0) && (
              <div
                className="absolute inset-0"
                style={{
                  background: headerBg.gradientOverlay || headerBg.overlayColor,
                  opacity: (headerBg.overlayOpacity || 40) / 100,
                  backdropFilter: headerBg.blur > 0 ? `blur(${headerBg.blur}px)` : undefined
                }}
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6">
              {profile.avatar && !headerBg.useProfilePhoto && (
                <div className={`w-28 h-28 ${avatarBorderRadius} overflow-hidden border-4 border-white/30 shadow-2xl mb-4`}>
                  <LazyImage
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {profile.displayName}
              </h2>
              {profile.headline && (
                <p className="text-white/90 text-center mt-1 text-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {profile.headline}
                </p>
              )}
            </div>
          </div>
        );

      case 'avatar-top':
        return (
          <div className="flex flex-col items-center -mt-2">
            <div className={`w-28 h-28 ${avatarBorderRadius} overflow-hidden shadow-lg mb-4`}>
              {profile.avatar ? (
                <LazyImage
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        );

      case 'minimal':
        return null;

      case 'simple':
      default:
        return (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden shadow-lg mb-4 border-4 ${isDarkBg ? 'border-white/10' : 'border-white'}`}>
                {profile.avatar ? (
                  <LazyImage
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>
          </div>
        );
    }
  };

  // Render contact chip
  const renderContactChip = (icon: React.ReactNode, text: string, href?: string) => {
    const chipClass = `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isDarkBg
        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
        : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50'
    }`;

    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={chipClass}>
          {icon}
          <span>{text}</span>
        </a>
      );
    }

    return (
      <div className={chipClass}>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  // Render social icon
  const renderSocialIcon = (link: SocialLink) => {
    const platform = detectPlatformFromUrl(link.url);
    const iconColor = isLight ? '#1F2937' : '#FFFFFF';

    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
          isDarkBg
            ? 'bg-white/10 hover:bg-white/20 border border-white/20'
            : 'bg-white/80 hover:bg-white border border-gray-200/50 shadow-sm'
        }`}
        style={{ animationDelay: `${links.indexOf(link) * ANIMATION_STAGGER}ms` }}
      >
        {link.customLogo ? (
          <img src={link.customLogo} alt={link.displayLabel || link.platform || 'link'} className="w-6 h-6" />
        ) : (
          <svg viewBox="0 0 24 24" fill={iconColor} className="w-6 h-6">
            <path d={DEFAULT_LOGO} />
          </svg>
        )}
      </a>
    );
  };

  // Render link card
  const renderLinkCard = (link: SocialLink) => {
    const platform = detectPlatformFromUrl(link.url);
    const displayLabel = link.displayLabel || platform || link.url;

    const buttonStyle = {
      solid: isDarkBg
        ? 'bg-white text-gray-900 hover:bg-white/90'
        : `bg-[${settings.buttonColor}] text-white hover:opacity-90`,
      glass: isDarkBg
        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
        : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50',
      outline: isDarkBg
        ? 'bg-transparent hover:bg-white/10 text-white border border-white/30'
        : 'bg-transparent hover:bg-gray-100 text-gray-900 border border-gray-300'
    }[settings.buttonStyle];

    const shadowClass = {
      none: '',
      subtle: isDarkBg ? 'shadow-lg shadow-white/5' : 'shadow-lg',
      strong: isDarkBg ? 'shadow-xl shadow-white/10' : 'shadow-xl',
      hard: 'shadow-hard'
    }[settings.shadowStyle];

    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${buttonStyle} ${shadowClass}`}
        style={{
          borderRadius: `${settings.cornerRadius}px`,
          animationDelay: `${links.indexOf(link) * ANIMATION_STAGGER}ms`
        }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {link.customLogo ? (
            <img src={link.customLogo} alt={displayLabel} className="w-full h-full object-cover" />
          ) : (
            <ExternalLink className="w-5 h-5" />
          )}
        </div>
        <span className="flex-1 font-medium text-left truncate">
          {displayLabel}
        </span>
        <ExternalLink className="w-5 h-5 opacity-50 flex-shrink-0" />
      </a>
    );
  };

  // Build background style
  const backgroundStyle = useMemo(() => {
    if (settings.wallpaper) {
      return {
        background: settings.wallpaper,
        opacity: settings.wallpaperOpacity / 100
      };
    }
    return {
      backgroundColor: settings.backgroundColor
    };
  }, [settings.wallpaper, settings.wallpaperOpacity, settings.backgroundColor]);

  return (
    <div
      className="relative min-h-screen w-full max-w-lg mx-auto"
      style={{
        fontFamily: settings.fontFamily,
        ...backgroundStyle
      }}
    >
      {/* Action Bar - Only show if not preview */}
      {!isPreview && (onDownloadVCard || onShare) && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {onShare && (
            <button
              onClick={onShare}
              className={`p-3 rounded-full transition-all ${
                isDarkBg
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50 shadow-sm'
              }`}
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {onDownloadVCard && (
            <button
              onClick={onDownloadVCard}
              className={`p-3 rounded-full transition-all ${
                isDarkBg
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50 shadow-sm'
              }`}
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* QR Code Modal - Only show if not preview */}
      {!isPreview && showQR && profileUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan to Connect</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                ×
              </button>
            </div>
            <ProfileQRCode value={profileUrl} size={200} />
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{profileUrl}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`px-6 pb-12 ${settings.headerStyle === 'banner' ? 'pt-20' : settings.headerStyle === 'hero-photo' ? 'pt-4' : 'pt-8'}`}>
        {/* Header */}
        {renderHeader()}

        {/* Profile Info */}
        <div className={`text-center ${settings.headerStyle === 'banner' ? 'mt-14' : settings.headerStyle === 'avatar-top' ? '' : 'mt-4'}`}>
          {settings.headerStyle !== 'hero-photo' && (
            <>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: nameColor, animationDelay: '0ms' }}
              >
                {profile.displayName}
              </h2>
              {profile.headline && settings.headerStyle !== 'minimal' && (
                <p className="text-sm mb-1" style={{ color: bioColor }}>
                  {profile.headline}
                </p>
              )}
            </>
          )}

          {settings.headerStyle !== 'hero-photo' && profile.showBio && profile.bio && (
            <p className="text-sm mb-4 whitespace-pre-wrap" style={{ color: bioColor }}>
              {profile.bio}
            </p>
          )}

          {/* Contact Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {profile.showEmail && profile.publicEmail && renderContactChip(
              <Mail className="w-4 h-4" />,
              profile.publicEmail,
              `mailto:${profile.publicEmail}`
            )}
            {profile.showPhone && profile.publicPhone && renderContactChip(
              <Phone className="w-4 h-4" />,
              profile.publicPhone,
              `tel:${profile.publicPhone}`
            )}
            {profile.showWebsite && profile.website && renderContactChip(
              <Globe className="w-4 h-4" />,
              profile.website?.replace(/^https?:\/\//, ''),
              profile.website
            )}
          </div>

          {/* Social Icons Row */}
          {links.slice(0, 8).map((link, index) => (
            <React.Fragment key={link.id}>
              {renderSocialIcon(link)}
            </React.Fragment>
          ))}
        </div>

        {/* Links Section */}
        <div className="space-y-3 mt-8">
          {links.map((link) => renderLinkCard(link))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          {settings.footerText && (
            <p className="text-xs mb-2" style={{ color: bioColor }}>
              {settings.footerText}
            </p>
          )}
          {settings.showPoweredBy && !isPreview && (
            <p className="text-xs" style={{ color: bioColor }}>
              Powered by Swaz vCard
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileRenderer;
