/**
 * MOBILE-FIRST PROFILE RENDERER
 * Renders public profile with mobile-first design and photo background support
 * Ensures consistency between editor preview and public profile view
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Mail, Phone, Globe, Download, Share2, ExternalLink, MapPin, ChevronRight } from 'lucide-react';
import { getOptimalTextColor, getOptimalSecondaryTextColor, isLightColor } from '../../utils/wcagValidator';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../../constants/platforms';
import { ProfileQRCode } from './ProfileQRCode';
import { LazyImage } from '../LazyImage';
import { getButtonStyles, getButtonHoverStyles } from '../../utils/buttonStyleUtils';

// Import types - Re-export for convenience
export type {
  AppearanceSettings,
  BackgroundSettings,
  SocialLink,
  ProfileData
} from '../../types/profile.types';

// ============================================================================
// TYPES
// ============================================================================

export interface ProfileRendererProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings | null;
  profileUrl?: string;
  onDownloadVCard?: () => void;
  onShare?: () => void;
  isPreview?: boolean;
}

// ============================================================================
// DEFAULT APPEARANCE SETTINGS
// ============================================================================

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
  background: {
    type: 'solid',
    value: '#F9FAFB',
    opacity: 100,
    blur: 0,
  },
  footerText: '',
  showPoweredBy: true,
  themeId: '',
  spacing: 'comfortable',
  linkStyle: 'card',
};

// ============================================================================
// MOBILE-FIRST PROFILE RENDERER COMPONENT
// ============================================================================

export const MobileFirstProfileRenderer: React.FC<ProfileRendererProps> = ({
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
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Detect dark mode
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
  }, []);

  // WCAG-compliant color detection
  const getWCAGTextColors = useCallback(() => {
    let bgColor = settings.backgroundColor;
    let isDarkBg = false;

    // Determine background color from settings
    if (settings.background.type === 'image' || settings.background.type === 'gradient') {
      // For images and gradients, check if overlay makes it dark
      const overlayOpacity = settings.background.overlayOpacity || 0;
      isDarkBg = overlayOpacity > 50 || !isLightColor(settings.backgroundColor);
    } else if (settings.background.type === 'solid') {
      bgColor = settings.background.value;
      isDarkBg = !isLightColor(bgColor);
    }

    const nameColor = getOptimalTextColor(bgColor, isDarkMode);
    const bioColor = getOptimalSecondaryTextColor(bgColor, isDarkMode);

    return { nameColor, bioColor, isLight: !isDarkBg, bgColor, isDarkBg };
  }, [settings.backgroundColor, settings.background, isDarkMode]);

  const { nameColor, bioColor, isLight, bgColor, isDarkBg } = getWCAGTextColors();

  // ============================================================================
  // BACKGROUND STYLES
  // ============================================================================

  const getBackgroundStyle = useCallback((): React.CSSProperties => {
    const bg = settings.background;

    if (bg.type === 'image' && bg.value) {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }

    if (bg.type === 'gradient' && bg.value) {
      return {
        background: bg.value,
      };
    }

    return {
      backgroundColor: bg.value || settings.backgroundColor,
    };
  }, [settings.background, settings.backgroundColor]);

  // ============================================================================
  // LINK CARD STYLES
  // ============================================================================

  const getLinkCardStyle = useCallback((index: number): React.CSSProperties => {
    // Check if using enhanced button settings
    const hasEnhancedSettings = 'buttonEnhancement' in settings &&
      (settings as any).buttonEnhancement;

    if (hasEnhancedSettings) {
      const base = getButtonStyles(settings);
      const hover = getButtonHoverStyles(settings);
      return {
        ...base,
        ...hover,
      };
    }

    // Legacy button styling (backwards compatible)
    const base: React.CSSProperties = {
      borderRadius: `${settings.cornerRadius}px`,
      transition: 'all 0.2s ease',
    };

    // Button style
    if (settings.buttonStyle === 'solid') {
      return {
        ...base,
        backgroundColor: settings.buttonColor,
        color: settings.textColor,
        boxShadow: settings.shadowStyle === 'none' ? 'none' :
          settings.shadowStyle === 'subtle' ? `0 2px 8px ${settings.shadowColor}20` :
          settings.shadowStyle === 'strong' ? `0 4px 16px ${settings.shadowColor}40` :
            `2px 2px 0 ${settings.shadowColor}`,
      };
    }

    if (settings.buttonStyle === 'glass') {
      return {
        ...base,
        backgroundColor: `${settings.buttonColor}20`,
        backdropFilter: 'blur(8px)',
        color: settings.buttonColor,
        border: `1px solid ${settings.buttonColor}40`,
      };
    }

    if (settings.buttonStyle === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `2px solid ${settings.buttonColor}`,
        color: settings.buttonColor,
      };
    }

    // minimal
    return {
      ...base,
      backgroundColor: 'transparent',
      color: nameColor,
      borderBottom: `1px solid ${bioColor}40`,
    };
  }, [settings, nameColor, bioColor]);

  // ============================================================================
  // RENDER LINK CARD
  // ============================================================================

  const renderLinkCard = (link: SocialLink, index: number) => {
    const platform = detectPlatformFromUrl(link.url);
    const displayLabel = link.displayLabel || platform || link.url;

    if (settings.linkStyle === 'pill') {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
          style={getLinkCardStyle(index)}
        >
          {link.customLogo ? (
            <img src={link.customLogo} alt="" className="w-5 h-5" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
          <span>{displayLabel}</span>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </a>
      );
    }

    if (settings.linkStyle === 'minimal') {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between py-3 px-4 transition-all hover:scale-[1.02]"
          style={getLinkCardStyle(index)}
        >
          <span className="font-medium">{displayLabel}</span>
          <ExternalLink className="w-4 h-4 opacity-40" />
        </a>
      );
    }

    if (settings.linkStyle === 'icon-only') {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all hover:scale-110"
          style={{
            backgroundColor: `${settings.buttonColor}20`,
            border: `1px solid ${settings.buttonColor}40`,
          }}
        >
          {link.customLogo ? (
            <img src={link.customLogo} alt="" className="w-7 h-7" />
          ) : (
            <Globe className="w-7 h-7" style={{ color: settings.buttonColor }} />
          )}
        </a>
      );
    }

    // card (default)
    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={getLinkCardStyle(index)}
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 overflow-hidden">
          {link.customLogo ? (
            <img src={link.customLogo} alt={displayLabel} className="w-full h-full object-cover" />
          ) : (
            <Globe className="w-6 h-6 opacity-60" />
          )}
        </div>
        <span className="flex-1 font-medium text-left truncate">{displayLabel}</span>
        <ExternalLink className="w-5 h-5 opacity-40 flex-shrink-0" />
      </a>
    );
  };

  // ============================================================================
  // RENDER HEADER
  // ============================================================================

  const renderHeader = () => {
    const avatarSize = settings.headerStyle === 'hero-photo' ? 'w-28 h-28' : 'w-20 h-20';
    const avatarBorderRadius = settings.headerStyle === 'avatar-top' ? 'rounded-2xl' : 'rounded-full';

    return (
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="relative">
          {profile.avatar ? (
            <LazyImage
              src={profile.avatar}
              alt={profile.displayName}
              className={`${avatarSize} ${avatarBorderRadius} object-cover shadow-xl`}
            />
          ) : (
            <div
              className={`${avatarSize} ${avatarBorderRadius} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl`}
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {profile.logo && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <LazyImage src={profile.logo} alt="Logo" className="w-6 h-6 object-contain" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="text-center mt-4 px-4">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: nameColor }}
          >
            {profile.displayName}
          </h1>
          {profile.headline && (
            <p className="text-sm mb-2" style={{ color: bioColor }}>
              {profile.headline}
            </p>
          )}
          {profile.showBio && profile.bio && (
            <p className="text-sm whitespace-pre-wrap" style={{ color: bioColor }}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Contact Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {profile.showEmail && profile.publicEmail && (
            <a
              href={`mailto:${profile.publicEmail}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: nameColor,
              }}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
          )}
          {profile.showPhone && profile.publicPhone && (
            <a
              href={`tel:${profile.publicPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: nameColor,
              }}
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
          )}
          {profile.showWebsite && profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: nameColor,
              }}
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const spacingClasses = {
    compact: 'gap-2',
    comfortable: 'gap-3',
    spacious: 'gap-4',
  };

  return (
    <div
      className="relative min-h-screen w-full max-w-md mx-auto"
      style={{
        fontFamily: settings.fontFamily,
        ...getBackgroundStyle(),
      }}
    >
      {/* Background Overlay */}
      {(settings.background.blur > 0 || settings.background.overlayOpacity > 0) && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: settings.background.overlayColor || 'rgba(0,0,0,0.3)',
            opacity: (settings.background.overlayOpacity || 0) / 100,
            backdropFilter: settings.background.blur > 0 ? `blur(${settings.background.blur}px)` : undefined,
          }}
        />
      )}

      {/* Action Buttons - Top Right (not in preview) */}
      {!isPreview && (onDownloadVCard || onShare) && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {onShare && (
            <button
              onClick={onShare}
              className="p-3 rounded-full transition-all shadow-lg"
              style={{
                backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                color: nameColor,
              }}
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {onDownloadVCard && (
            <button
              onClick={onDownloadVCard}
              className="p-3 rounded-full transition-all shadow-lg"
              style={{
                backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                color: nameColor,
              }}
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {!isPreview && showQR && profileUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan to Connect</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <ProfileQRCode
                profileUrl={profileUrl}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#000000"
                showLabel={false}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">{profileUrl}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-4 py-8 pb-16">
        {renderHeader()}

        {/* Action Buttons Section - QR Code, Share, Download */}
        <div className="mb-6">
          <div
            className="rounded-2xl p-4 backdrop-blur-xl border"
            style={{
              backgroundColor: isDarkBg ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
              borderColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
            }}
          >
            {/* QR Code - Always visible */}
            {profileUrl && (
              <div className="flex justify-center mb-4">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <ProfileQRCode
                    profileUrl={profileUrl}
                    size={100}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    showLabel={true}
                    labelText="Scan to connect"
                    labelColor={bioColor}
                    labelSize="xs"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    color: nameColor,
                  }}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              )}
              {onDownloadVCard && (
                <button
                  onClick={onDownloadVCard}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                    color: nameColor,
                  }}
                >
                  <Download className="w-5 h-5" />
                  <span>Save Contact</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className={`flex flex-col ${spacingClasses[settings.spacing] || 'gap-3'}`}>
          {settings.linkStyle === 'icon-only' ? (
            <div className="flex flex-wrap justify-center gap-3">
              {links.map((link, index) => renderLinkCard(link, index))}
            </div>
          ) : (
            <>
              {links.map((link, index) => renderLinkCard(link, index))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          {settings.footerText && (
            <p className="text-xs mb-2" style={{ color: bioColor }}>
              {settings.footerText}
            </p>
          )}
          {!isPreview && settings.showPoweredBy && (
            <p className="text-xs" style={{ color: bioColor }}>
              Powered by Swaz vCard
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileFirstProfileRenderer;
