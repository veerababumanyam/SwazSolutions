/**
 * ENHANCED APPEARANCE PANEL
 * Modern theme management with 28+ themes, live preview, and user-friendly interface
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  LayoutGrid,
  Type,
  Settings2,
  Info
} from 'lucide-react';
import { Theme, ThemeCategory, THEME_CATEGORY_META } from '../../types/theme.types';
import { EnhancedThemeSelector } from './ThemeSelector.enhanced';
import { allModernThemes } from '../../data/modernThemes';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface HeaderBackgroundSettings {
  useProfilePhoto: boolean;
  height: string;
  opacity: number;
  blur?: number;
}

export interface BannerSettings {
  mode: 'color' | 'gradient' | 'image';
  color: string;
  gradient?: string;
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

interface ProfileData {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  logo?: string;
  headline?: string;
}

interface AppearancePanelProps {
  settings: AppearanceSettings;
  onChange: (settings: AppearanceSettings) => void;
  profileData?: ProfileData;
  onLivePreviewChange?: (settings: AppearanceSettings) => void;
}

type TabType = 'themes' | 'layout' | 'typography' | 'branding';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedAppearancePanel: React.FC<AppearancePanelProps> = ({
  settings,
  onChange,
  profileData,
  onLivePreviewChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('themes');

  // System themes state
  const [systemThemes, setSystemThemes] = useState<Theme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);

  // Fetch system themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setThemesLoading(true);
        // Use local themes directly
        setSystemThemes(allModernThemes);
      } catch (error) {
        console.log('Using local themes as fallback:', error);
        setSystemThemes(allModernThemes);
      } finally {
        setThemesLoading(false);
      }
    };
    fetchThemes();
  }, []);

  // Get the currently applied theme
  const appliedTheme = useMemo(() => {
    if (!settings.themeId) return null;
    return systemThemes.find(t => String(t.id) === settings.themeId) || null;
  }, [settings.themeId, systemThemes]);

  // Apply system theme
  const handleApplyTheme = async (theme: Theme) => {
    // Extract theme properties
    const bgColor = theme.wallpaper
      ? theme.colors.backgroundSecondary
      : theme.colors.background;

    const wallpaperValue = theme.wallpaper || '';

    // Map theme to appearance settings
    const newSettings: AppearanceSettings = {
      ...settings,
      themeId: String(theme.id),
      backgroundColor: bgColor,
      wallpaper: wallpaperValue,
      wallpaperOpacity: wallpaperValue ? 100 : settings.wallpaperOpacity,
      buttonColor: theme.colors.primary,
      textColor: theme.colors.text,
      shadowColor: theme.colors.accent,
      headerColor: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      cornerRadius: parseInt(theme.layout.borderRadius.md) || 12,
      headerStyle: theme.category === 'visual' ? 'hero-photo' : settings.headerStyle,
    };

    onChange(newSettings);
    onLivePreviewChange?.(newSettings);
  };

  // Handle preview theme
  const handlePreviewTheme = (theme: Theme) => {
    // Optional: Show preview without applying
    console.log('Previewing theme:', theme.name);
  };

  // Tab configuration
  const tabs = [
    { id: 'themes' as const, label: 'Themes', icon: Palette },
    { id: 'layout' as const, label: 'Layout', icon: LayoutGrid },
    { id: 'typography' as const, label: 'Typography', icon: Type },
    { id: 'branding' as const, label: 'Branding', icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          {appliedTheme && (
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-100">
                    Active Theme: {appliedTheme.name}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 capitalize">
                    {appliedTheme.category}
                  </p>
                </div>
              </div>
            </div>
          )}

          <EnhancedThemeSelector
            themes={systemThemes}
            selectedThemeId={settings.themeId}
            loading={themesLoading}
            onApplyTheme={handleApplyTheme}
            onShowAIModal={() => {
              // TODO: Implement AI theme generation
              console.log('AI theme generation not yet implemented');
            }}
            onPreviewTheme={handlePreviewTheme}
          />
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Layout Options
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Layout customization options will be available here. For now, use the theme selector to change layouts.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Header Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['simple', 'banner', 'avatar-top', 'minimal'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    const newSettings = { ...settings, headerStyle: style };
                    onChange(newSettings);
                    onLivePreviewChange?.(newSettings);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center capitalize ${
                    settings.headerStyle === style
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Font Family</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Playfair Display', 'Montserrat'].map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    const newSettings = { ...settings, fontFamily: font };
                    onChange(newSettings);
                    onLivePreviewChange?.(newSettings);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    settings.fontFamily === font
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Corner Radius</h3>
            <div className="flex gap-2">
              {[0, 8, 12, 16, 24].map((radius) => (
                <button
                  key={radius}
                  onClick={() => {
                    const newSettings = { ...settings, cornerRadius: radius };
                    onChange(newSettings);
                    onLivePreviewChange?.(newSettings);
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    settings.cornerRadius === radius
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ borderRadius: radius }}
                >
                  {radius}px
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Button Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['solid', 'glass', 'outline'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    const newSettings = { ...settings, buttonStyle: style };
                    onChange(newSettings);
                    onLivePreviewChange?.(newSettings);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center capitalize ${
                    settings.buttonStyle === style
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAppearancePanel;
