// MobilePreview Component
// Shows a live preview of the public profile on a mobile device frame with appearance settings

import React from 'react';

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
  headerStyle: 'simple' | 'banner' | 'avatar-top' | 'minimal';
  headerColor: string;
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
}

interface MobilePreviewProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings;
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
];

export const MobilePreview: React.FC<MobilePreviewProps> = ({ profile, links, appearance }) => {
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
    wallpaper: '',
    wallpaperOpacity: 100,
    footerText: '',
    showPoweredBy: true,
    themeId: '',
  };

  const settings = appearance || defaultAppearance;

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
        return (
          <>
            {/* Banner Header */}
            <div 
              className="absolute top-0 left-0 right-0 h-28 z-0"
              style={{ backgroundColor: settings.headerColor }}
            />
            {/* Avatar & Logo Section - positioned over banner */}
            <div className="relative z-10 pt-16">
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
                    style={{ borderColor: settings.headerColor }}
                  />
                ) : (
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl"
                    style={{ backgroundColor: settings.headerColor }}
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
                    style={{ backgroundColor: settings.headerColor }}
                  >
                    {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {profile.displayName}
                </h3>
                {(profile.headline || profile.bio) && (
                  <p className="text-xs text-gray-600 truncate">
                    {profile.headline || profile.bio}
                  </p>
                )}
              </div>
            </div>
          </>
        );

      case 'simple':
      default:
        return (
          <>
            {/* Simple - centered avatar with decorative star */}
            <div className="flex justify-center pt-2 mb-4">
              <span className="text-2xl" style={{ color: settings.headerColor }}>✦</span>
            </div>
            {/* Avatar & Logo Section */}
            <div className="flex flex-col items-center mb-3">
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
                className="h-full overflow-y-auto pb-4 px-4 relative z-10 flex flex-col"
                style={{ fontFamily: settings.fontFamily }}
              >
                {/* Header Section */}
                {renderHeader()}

                {/* Name & Bio (skip for minimal since it's inline) */}
                {settings.headerStyle !== 'minimal' && (
                  <>
                    <h3 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {profile.displayName}
                    </h3>
                    {(profile.headline || profile.bio) && (
                      <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-3 px-2 line-clamp-2">
                        {profile.headline || profile.bio}
                      </p>
                    )}
                  </>
                )}

                {/* Social Icons Row */}
                {featuredIcons.length > 0 && (
                  <div className="flex justify-center gap-2 mb-4 mt-2">
                    {featuredIcons.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                      >
                        <img 
                          src={item.link.customLogo || `/assets/social-logos/${item.icon}.svg`}
                          alt={item.name}
                          className="w-4 h-4"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="space-y-2 flex-1">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 flex items-center gap-3 transition-transform hover:scale-[1.02]"
                      style={getButtonStyle()}
                    >
                      {/* Link Thumbnail */}
                      {link.customLogo ? (
                        <img
                          src={link.customLogo}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                          style={{ borderRadius: `${Math.max(settings.cornerRadius - 4, 0)}px` }}
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 flex items-center justify-center font-bold"
                          style={{ 
                            backgroundColor: settings.buttonStyle === 'solid' ? 'rgba(255,255,255,0.2)' : settings.buttonColor,
                            color: settings.buttonStyle === 'solid' ? settings.textColor : '#FFFFFF',
                            borderRadius: `${Math.max(settings.cornerRadius - 4, 0)}px` 
                          }}
                        >
                          {(link.displayLabel || link.platform || '?')[0].toUpperCase()}
                        </div>
                      )}
                      
                      {/* Link Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {link.displayLabel || link.platform || 'Link'}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="opacity-60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {links.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm flex-1 flex items-center justify-center">
                    Your links will appear here
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

        {/* Buttons (Side) */}
        <div className="absolute -right-1 top-24 w-1 h-8 bg-gray-700 rounded-l-sm"></div>
        <div className="absolute -left-1 top-20 w-1 h-6 bg-gray-700 rounded-r-sm"></div>
        <div className="absolute -left-1 top-32 w-1 h-10 bg-gray-700 rounded-r-sm"></div>
        <div className="absolute -left-1 top-44 w-1 h-10 bg-gray-700 rounded-r-sm"></div>
      </div>

      {/* Preview Actions */}
      <div className="mt-4 flex justify-center gap-4">
        <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
};

export default MobilePreview;
