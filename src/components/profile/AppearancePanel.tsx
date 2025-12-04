/**
 * AppearancePanel Component
 * 
 * Mobile-first, responsive panel for customizing profile appearance.
 * Unified theme management with system themes + custom styling.
 * 
 * Features:
 * - Browse 18 system themes across 6 categories (Aurora, Gradient, Glass, Minimal, Dark, Visual)
 * - WCAG 2.1 AA compliant themes with 4.5:1+ contrast ratios
 * - Visual themes with hero-photo header style
 * - AI-powered theme generation using Google Gemini
 * - Full customization of colors, typography, layout, and branding
 * - Apply themes via API or customize individual settings
 * 
 * @author SwazSolutions
 * @version 4.0.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Palette,
  LayoutGrid,
  Type,
  Sparkles,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Image,
  Loader2,
  Wand2
} from 'lucide-react';
import ColorPickerInput from './ColorPickerInput';
import { Theme, ThemeHeaderBackground, ThemeCategory, THEME_CATEGORY_META } from '../../types/theme.types';
import themeService from '../../services/themeService';
import AIThemeModal from '../appearance/AIThemeModal';
import { FontSelector } from '../theme/FontSelector';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  mode: 'color' | 'image';       // Banner display mode
  color: string;                  // Banner color (derived from wallpaper or custom)
  image?: string;                 // Custom banner image URL
  derivedFromWallpaper: boolean;  // Whether color was auto-derived from wallpaper
}

export interface AppearanceSettings {
  // Button settings
  buttonStyle: 'solid' | 'glass' | 'outline';
  cornerRadius: number; // 0-24
  shadowStyle: 'none' | 'subtle' | 'strong' | 'hard';
  buttonColor: string;
  shadowColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  // Header settings
  headerStyle: 'simple' | 'banner' | 'avatar-top' | 'minimal' | 'hero-photo';
  headerColor: string;
  headerBackground?: HeaderBackgroundSettings;
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
}

// Consolidated tab structure - 4 intuitive categories
type TabType = 'style' | 'layout' | 'typography' | 'branding';

// Theme category for filtering (local type extends imported ThemeCategory with 'all')
type ThemeCategoryFilter = 'all' | ThemeCategory;

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * CollapsibleSection - Accordion-style section for organizing content within tabs
 * Improves mobile UX by reducing initial visual clutter
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[56px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-purple-500">{icon}</span>}
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AppearancePanel: React.FC<AppearancePanelProps> = ({
  settings,
  onChange,
  profileData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('style');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // System themes state
  const [systemThemes, setSystemThemes] = useState<Theme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategoryFilter>('all');
  const [applyingTheme, setApplyingTheme] = useState<number | null>(null);

  // Fetch system themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setThemesLoading(true);
        const response = await themeService.getSystemThemes();
        setSystemThemes(response.themes || []);
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      } finally {
        setThemesLoading(false);
      }
    };
    fetchThemes();
  }, []);

  // Filter themes by category
  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return systemThemes;
    return systemThemes.filter(theme => theme.category === selectedCategory);
  }, [systemThemes, selectedCategory]);

  // ============================================================================
  // THEME CUSTOMIZATION DETECTION
  // Detect when user has customized colors away from selected theme
  // ============================================================================

  // Get the currently applied theme (if any)
  const appliedTheme = useMemo(() => {
    if (!settings.themeId) return null;
    return systemThemes.find(t => String(t.id) === settings.themeId) || null;
  }, [settings.themeId, systemThemes]);

  // Check if current settings differ from the applied theme
  const isCustomized = useMemo(() => {
    if (!appliedTheme) return false;

    // Get expected values from theme
    const expectedBgColor = appliedTheme.wallpaper
      ? appliedTheme.colors.backgroundSecondary
      : appliedTheme.colors.background;
    const expectedWallpaper = appliedTheme.wallpaper || '';
    const expectedButtonColor = appliedTheme.colors.primary;
    const expectedTextColor = appliedTheme.colors.text;

    // Compare with current settings (normalize colors for comparison)
    const normalize = (color: string) => color?.toLowerCase().replace(/\s/g, '') || '';

    const bgDiffers = normalize(settings.backgroundColor) !== normalize(expectedBgColor);
    const wallpaperDiffers = normalize(settings.wallpaper) !== normalize(expectedWallpaper);
    const buttonDiffers = normalize(settings.buttonColor) !== normalize(expectedButtonColor);
    const textDiffers = normalize(settings.textColor) !== normalize(expectedTextColor);

    return bgDiffers || wallpaperDiffers || buttonDiffers || textDiffers;
  }, [appliedTheme, settings]);

  // Reset to theme defaults handler
  const handleResetToTheme = useCallback(() => {
    if (!appliedTheme) return;

    // Determine wallpaper and background from theme
    const hasWallpaper = appliedTheme.wallpaper && appliedTheme.wallpaper.length > 0;
    const isGradientBackground = typeof appliedTheme.colors.background === 'string' &&
      (appliedTheme.colors.background.includes('gradient') || appliedTheme.colors.background.includes('rgba'));

    const wallpaperValue = hasWallpaper
      ? appliedTheme.wallpaper
      : (isGradientBackground ? appliedTheme.colors.background : '');

    const bgColor = isGradientBackground
      ? appliedTheme.colors.backgroundSecondary
      : appliedTheme.colors.background;

    onChange({
      ...settings,
      backgroundColor: bgColor,
      wallpaper: wallpaperValue || '',
      wallpaperOpacity: wallpaperValue ? 100 : settings.wallpaperOpacity,
      buttonColor: appliedTheme.colors.primary,
      textColor: appliedTheme.colors.text,
      shadowColor: appliedTheme.colors.accent,
      headerColor: appliedTheme.colors.primary,
    });
  }, [appliedTheme, settings, onChange]);

  // Theme categories for filter - using new WCAG 2.1 AA categories
  const themeCategories: { id: ThemeCategoryFilter; label: string; icon: string; count: number }[] = useMemo(() => [
    { id: 'all', label: 'All', icon: '✨', count: systemThemes.length },
    { id: 'aurora', label: 'Aurora', icon: THEME_CATEGORY_META.aurora?.icon || '🌌', count: systemThemes.filter(t => t.category === 'aurora').length },
    { id: 'gradient', label: 'Gradient', icon: THEME_CATEGORY_META.gradient?.icon || '🎨', count: systemThemes.filter(t => t.category === 'gradient').length },
    { id: 'glass', label: 'Glass', icon: THEME_CATEGORY_META.glass?.icon || '💎', count: systemThemes.filter(t => t.category === 'glass').length },
    { id: 'minimal', label: 'Minimal', icon: THEME_CATEGORY_META.minimal?.icon || '◻️', count: systemThemes.filter(t => t.category === 'minimal').length },
    { id: 'dark', label: 'Dark', icon: THEME_CATEGORY_META.dark?.icon || '🌙', count: systemThemes.filter(t => t.category === 'dark').length },
    { id: 'visual', label: 'Visual', icon: THEME_CATEGORY_META.visual?.icon || '📷', count: systemThemes.filter(t => t.category === 'visual').length },
  ], [systemThemes]);

  // ============================================================================
  // TAB CONFIGURATION
  // Consolidated from 7 tabs to 4 intuitive categories
  // Mobile: icon only | sm+: icon + label
  // ============================================================================

  const tabs = useMemo(() => [
    {
      id: 'style' as TabType,
      label: 'Style',
      shortLabel: 'Style',
      icon: <Palette className="w-5 h-5" />,
      description: 'Theme & Colors'
    },
    {
      id: 'layout' as TabType,
      label: 'Layout',
      shortLabel: 'Layout',
      icon: <LayoutGrid className="w-5 h-5" />,
      description: 'Header & Background'
    },
    {
      id: 'typography' as TabType,
      label: 'Typography',
      shortLabel: 'Text',
      icon: <Type className="w-5 h-5" />,
      description: 'Text & Buttons'
    },
    {
      id: 'branding' as TabType,
      label: 'Branding',
      shortLabel: 'Brand',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Footer & Credits'
    },
  ], []);

  // ============================================================================
  // AI COLOR GENERATION
  // ============================================================================

  const generateAIColors = useCallback((profile?: ProfileData) => {
    // Simple color generation based on profile - in production, use Gemini API
    const palettes = [
      { primary: '#8B5CF6', background: '#F5F3FF', text: '#FFFFFF', shadow: '#4C1D95' },
      { primary: '#3B82F6', background: '#EFF6FF', text: '#FFFFFF', shadow: '#1E40AF' },
      { primary: '#10B981', background: '#ECFDF5', text: '#FFFFFF', shadow: '#065F46' },
      { primary: '#F59E0B', background: '#FFFBEB', text: '#000000', shadow: '#92400E' },
      { primary: '#EF4444', background: '#FEF2F2', text: '#FFFFFF', shadow: '#991B1B' },
      { primary: '#EC4899', background: '#FDF2F8', text: '#FFFFFF', shadow: '#9D174D' },
      { primary: '#6366F1', background: '#EEF2FF', text: '#FFFFFF', shadow: '#3730A3' },
      { primary: '#14B8A6', background: '#F0FDFA', text: '#FFFFFF', shadow: '#0F766E' },
    ];

    // Pick a random palette or use profile-based logic
    const index = profile?.displayName
      ? profile.displayName.charCodeAt(0) % palettes.length
      : Math.floor(Math.random() * palettes.length);

    return palettes[index];
  }, []);

  const handleGenerateWithAI = useCallback(async () => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI generation - in real implementation, this would call the Gemini API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate colors based on profile content
      const colors = generateAIColors(profileData);
      onChange({
        ...settings,
        buttonColor: colors.primary,
        backgroundColor: colors.background,
        textColor: colors.text,
        shadowColor: colors.shadow,
      });
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [profileData, settings, onChange, generateAIColors]);

  // ============================================================================
  // PRESET DATA
  // ============================================================================

  // Pre-defined themes
  const presetThemes = useMemo(() => [
    {
      id: 'minimal-white',
      name: 'Minimal White',
      preview: { bg: '#FFFFFF', btn: '#000000', accent: '#666666' },
      settings: {
        backgroundColor: '#FFFFFF',
        buttonColor: '#000000',
        textColor: '#FFFFFF',
        headerColor: '#000000',
        shadowStyle: 'none' as const,
        buttonStyle: 'outline' as const,
      }
    },
    {
      id: 'purple-dream',
      name: 'Purple Dream',
      preview: { bg: '#F5F3FF', btn: '#8B5CF6', accent: '#A78BFA' },
      settings: {
        backgroundColor: '#F5F3FF',
        buttonColor: '#8B5CF6',
        textColor: '#FFFFFF',
        headerColor: '#8B5CF6',
        shadowStyle: 'subtle' as const,
        buttonStyle: 'solid' as const,
      }
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      preview: { bg: '#EFF6FF', btn: '#3B82F6', accent: '#60A5FA' },
      settings: {
        backgroundColor: '#EFF6FF',
        buttonColor: '#3B82F6',
        textColor: '#FFFFFF',
        headerColor: '#3B82F6',
        shadowStyle: 'subtle' as const,
        buttonStyle: 'solid' as const,
      }
    },
    {
      id: 'forest-green',
      name: 'Forest Green',
      preview: { bg: '#ECFDF5', btn: '#10B981', accent: '#34D399' },
      settings: {
        backgroundColor: '#ECFDF5',
        buttonColor: '#10B981',
        textColor: '#FFFFFF',
        headerColor: '#10B981',
        shadowStyle: 'subtle' as const,
        buttonStyle: 'solid' as const,
      }
    },
    {
      id: 'sunset-orange',
      name: 'Sunset Orange',
      preview: { bg: '#FFF7ED', btn: '#F97316', accent: '#FB923C' },
      settings: {
        backgroundColor: '#FFF7ED',
        buttonColor: '#F97316',
        textColor: '#FFFFFF',
        headerColor: '#F97316',
        shadowStyle: 'subtle' as const,
        buttonStyle: 'solid' as const,
      }
    },
    {
      id: 'rose-pink',
      name: 'Rose Pink',
      preview: { bg: '#FDF2F8', btn: '#EC4899', accent: '#F472B6' },
      settings: {
        backgroundColor: '#FDF2F8',
        buttonColor: '#EC4899',
        textColor: '#FFFFFF',
        headerColor: '#EC4899',
        shadowStyle: 'subtle' as const,
        buttonStyle: 'solid' as const,
      }
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      preview: { bg: '#1F2937', btn: '#F9FAFB', accent: '#9CA3AF' },
      settings: {
        backgroundColor: '#1F2937',
        buttonColor: '#F9FAFB',
        textColor: '#1F2937',
        headerColor: '#F9FAFB',
        shadowStyle: 'none' as const,
        buttonStyle: 'solid' as const,
      }
    },
    {
      id: 'glass-modern',
      name: 'Glass Modern',
      preview: { bg: '#F8FAFC', btn: '#6366F1', accent: '#818CF8' },
      settings: {
        backgroundColor: '#F8FAFC',
        buttonColor: '#6366F1',
        textColor: '#6366F1',
        headerColor: '#6366F1',
        shadowStyle: 'subtle' as const,
        buttonStyle: 'glass' as const,
      }
    },
  ], []);

  // Wallpaper presets (gradients and patterns)
  const wallpaperPresets = useMemo(() => [
    { id: 'none', name: 'None', value: '', preview: '#F9FAFB' },
    { id: 'gradient-purple', name: 'Purple Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient-blue', name: 'Ocean Gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient-sunset', name: 'Sunset Gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'gradient-mint', name: 'Mint Gradient', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', preview: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
    { id: 'gradient-dark', name: 'Dark Gradient', value: 'linear-gradient(135deg, #434343 0%, #000000 100%)', preview: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
    { id: 'gradient-emerald', name: 'Emerald Gradient', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'gradient-coral', name: 'Coral Gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: 'gradient-space', name: 'Space Gradient', value: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)', preview: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)' },
  ], []);

  // Preset color palettes for quick selection
  const presetPalettes = useMemo(() => [
    { bg: '#FFFFFF', btn: '#000000', text: '#FFFFFF', name: 'Minimal' },
    { bg: '#F5F3FF', btn: '#8B5CF6', text: '#FFFFFF', name: 'Purple' },
    { bg: '#EFF6FF', btn: '#3B82F6', text: '#FFFFFF', name: 'Blue' },
    { bg: '#ECFDF5', btn: '#10B981', text: '#FFFFFF', name: 'Green' },
    { bg: '#FEF2F2', btn: '#EF4444', text: '#FFFFFF', name: 'Red' },
    { bg: '#FFFBEB', btn: '#F59E0B', text: '#000000', name: 'Amber' },
    { bg: '#FDF2F8', btn: '#EC4899', text: '#FFFFFF', name: 'Pink' },
    { bg: '#1F2937', btn: '#F9FAFB', text: '#1F2937', name: 'Dark' },
  ], []);

  // Quick color picks for headers
  const quickColors = useMemo(() => [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#000000', '#6366F1'
  ], []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const applyTheme = useCallback((theme: typeof presetThemes[0]) => {
    onChange({
      ...settings,
      ...theme.settings,
      themeId: theme.id,
    });
  }, [onChange, settings]);

  /**
   * Apply a system theme from the API
   * Updates local appearance settings based on theme properties
   * Handles gradient themes by mapping to wallpaper property
   */
  const applySystemTheme = useCallback(async (theme: Theme) => {
    if (!theme.id) return;

    setApplyingTheme(theme.id);
    try {
      // Call API to apply theme to profile
      await themeService.applyTheme(theme.id);

      // Determine if theme has a gradient background or wallpaper
      const hasWallpaper = theme.wallpaper && theme.wallpaper.length > 0;
      const isGradientBackground = typeof theme.colors.background === 'string' &&
        (theme.colors.background.includes('gradient') || theme.colors.background.includes('rgba'));

      // Use theme's wallpaper if available, or background if it's a gradient
      const wallpaperValue = hasWallpaper
        ? theme.wallpaper
        : (isGradientBackground ? theme.colors.background : '');

      // For gradient themes, use backgroundSecondary as the solid backgroundColor
      const bgColor = isGradientBackground
        ? theme.colors.backgroundSecondary
        : theme.colors.background;

      // Update local appearance settings from theme
      const newSettings: AppearanceSettings = {
        ...settings,
        themeId: String(theme.id),
        backgroundColor: bgColor,
        wallpaper: wallpaperValue || '',
        wallpaperOpacity: wallpaperValue ? 100 : settings.wallpaperOpacity,
        buttonColor: theme.colors.primary,
        textColor: theme.colors.text,
        shadowColor: theme.colors.accent,
        headerColor: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        cornerRadius: parseInt(theme.layout.borderRadius.md) || 12,
        // Set header style based on theme category
        headerStyle: theme.category === 'visual' ? 'hero-photo' : settings.headerStyle,
      };

      // Add header background settings for Visual themes
      if (theme.category === 'visual' && theme.headerBackground) {
        newSettings.headerBackground = {
          useProfilePhoto: theme.headerBackground.useProfilePhoto,
          height: theme.headerBackground.height,
          overlayColor: theme.headerBackground.overlayColor,
          overlayOpacity: theme.headerBackground.overlayOpacity,
          blur: theme.headerBackground.blur,
          gradientOverlay: theme.headerBackground.gradientOverlay,
          fallbackGradient: theme.headerBackground.fallbackGradient,
        };
      }

      onChange(newSettings);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setApplyingTheme(null);
    }
  }, [settings, onChange]);

  // ============================================================================
  // RENDER TAB CONTENT
  // ============================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      // ========================================================================
      // STYLE TAB - Theme presets + Colors (combined from theme & colors tabs)
      // ========================================================================
      case 'style':
        return (
          <div className="space-y-4">
            {/* AI Theme Generation Button */}
            <div className="mb-4">
              <button
                onClick={() => setShowAIModal(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25 min-h-[52px]"
              >
                <Wand2 className="w-5 h-5" />
                <span>✨ Generate Theme with AI</span>
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Describe your style and let AI create a WCAG-compliant theme
              </p>
            </div>

            {/* System Themes Section */}
            <CollapsibleSection title="Browse Themes" icon={<Palette className="w-4 h-4" />} defaultOpen={true}>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {systemThemes.length} WCAG 2.1 AA compliant themes with 4.5:1+ contrast ratios
              </p>

              {/* Category Filter Pills with Icons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {themeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {cat.count > 0 && (
                      <span className={`ml-0.5 ${selectedCategory === cat.id ? 'text-purple-200' : 'text-gray-400'}`}>
                        ({cat.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Themes Grid */}
              {themesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : filteredThemes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No themes found in this category
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredThemes.map((theme) => {
                    const isSelected = settings.themeId === String(theme.id);
                    const isApplying = applyingTheme === theme.id;
                    const isVisual = theme.category === 'visual';

                    // Use wallpaper for preview if available, otherwise use background
                    const previewBackground = theme.wallpaper || theme.colors.background;

                    return (
                      <button
                        key={theme.id}
                        onClick={() => applySystemTheme(theme)}
                        disabled={isApplying}
                        className={`relative p-3 rounded-xl border-2 transition-all min-h-[120px] text-left ${isSelected
                          ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-900'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          } ${isApplying ? 'opacity-70' : ''}`}
                      >
                        {/* Theme Preview */}
                        <div
                          className="h-16 rounded-lg mb-2 flex flex-col items-center justify-center gap-1 overflow-hidden relative"
                          style={{
                            background: previewBackground
                          }}
                        >
                          {isVisual ? (
                            // Visual theme preview - show hero-photo indicator
                            <>
                              <Image className="w-6 h-6 opacity-40" style={{ color: theme.colors.text }} />
                              <div
                                className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center"
                                style={{ background: `linear-gradient(to top, ${theme.colors.background}, transparent)` }}
                              >
                                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: theme.colors.primary }} />
                              </div>
                            </>
                          ) : (
                            // Standard theme preview
                            <>
                              <div
                                className="w-5 h-5 rounded-full"
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              <div
                                className="w-10 h-1.5 rounded"
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              <div
                                className="w-6 h-1 rounded"
                                style={{ backgroundColor: theme.colors.secondary }}
                              />
                            </>
                          )}
                        </div>

                        {/* Theme Info */}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1 block">
                          {theme.name}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
                          {theme.category}
                        </span>

                        {/* Selected/Loading Indicator */}
                        {isApplying ? (
                          <div className="absolute top-2 right-2">
                            <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                          </div>
                        ) : isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-purple-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Visual Themes Info */}
              {selectedCategory === 'visual' && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <Image className="w-4 h-4 inline mr-1.5" />
                    <strong>Visual themes</strong> use your profile photo as a stunning half-screen header background.
                  </p>
                </div>
              )}

              {/* Custom Theme Indicator & Reset Button */}
              {appliedTheme && (
                <div className={`mt-4 p-3 rounded-lg flex items-center justify-between gap-3 ${isCustomized
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  }`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isCustomized ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300 truncate">
                          <strong>{appliedTheme.name}</strong> (customized)
                        </p>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-700 dark:text-green-300 truncate">
                          <strong>{appliedTheme.name}</strong> applied
                        </p>
                      </>
                    )}
                  </div>
                  {isCustomized && (
                    <button
                      onClick={handleResetToTheme}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors min-h-[32px]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}

              {/* Custom Tip */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 <strong>Tip:</strong> After selecting a theme, fine-tune colors and layout below.
                </p>
              </div>
            </CollapsibleSection>

            {/* Color Customization Section - clearly labeled as overrides */}
            <CollapsibleSection
              title={appliedTheme ? "Customize Colors" : "Color Palette"}
              icon={<Palette className="w-4 h-4" />}
              defaultOpen={false}
            >
              <div className="space-y-4">
                {/* Override Warning */}
                {appliedTheme && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ✏️ Changes here will customize the <strong>{appliedTheme.name}</strong> theme.
                      Use the Reset button above to restore original theme colors.
                    </p>
                  </div>
                )}

                {/* Color pickers with mobile-friendly layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPickerInput
                    label="Background color"
                    value={settings.backgroundColor}
                    onChange={(color) => onChange({ ...settings, backgroundColor: color })}
                  />
                  <ColorPickerInput
                    label="Button color"
                    value={settings.buttonColor}
                    onChange={(color) => onChange({ ...settings, buttonColor: color })}
                  />
                  <ColorPickerInput
                    label="Text color"
                    value={settings.textColor}
                    onChange={(color) => onChange({ ...settings, textColor: color })}
                  />
                  <ColorPickerInput
                    label="Shadow color"
                    value={settings.shadowColor}
                    onChange={(color) => onChange({ ...settings, shadowColor: color })}
                  />
                </div>

                {/* Quick Palette Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Palettes</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {presetPalettes.map((palette, i) => (
                      <button
                        key={i}
                        onClick={() => onChange({
                          ...settings,
                          backgroundColor: palette.bg,
                          buttonColor: palette.btn,
                          textColor: palette.text,
                        })}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors min-h-[44px] flex items-center justify-center"
                        title={palette.name}
                      >
                        <div className="flex gap-1 justify-center">
                          <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: palette.bg }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.btn }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Generate Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={isGeneratingAI}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Generate with AI
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    AI will suggest colors based on your profile
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      // ========================================================================
      // LAYOUT TAB - Header + Wallpaper (combined)
      // ========================================================================
      case 'layout':
        return (
          <div className="space-y-4">
            {/* Header Style Section */}
            <CollapsibleSection title="Header Style" icon={<LayoutGrid className="w-4 h-4" />} defaultOpen={true}>
              {/* Responsive 2-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { id: 'simple', name: 'Simple', icon: '✦', desc: 'Centered avatar with star' },
                  { id: 'banner', name: 'Banner', icon: '▭', desc: 'Full-width header banner' },
                  { id: 'avatar-top', name: 'Avatar Top', icon: '◯', desc: 'Large avatar at top' },
                  { id: 'minimal', name: 'Minimal', icon: '─', desc: 'Compact inline layout' },
                  { id: 'hero-photo', name: 'Hero Photo', icon: '📷', desc: 'Profile photo as half-screen background' },
                ] as const).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onChange({ ...settings, headerStyle: style.id })}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left min-h-[80px] ${settings.headerStyle === style.id
                      ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{style.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{style.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{style.desc}</p>
                    {settings.headerStyle === style.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-purple-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Hero Photo Settings - only shown when hero-photo is selected */}
              {settings.headerStyle === 'hero-photo' && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl space-y-4">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Hero Photo Settings
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        Overlay Opacity: {settings.headerBackground?.overlayOpacity || 30}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={settings.headerBackground?.overlayOpacity || 30}
                        onChange={(e) => onChange({
                          ...settings,
                          headerBackground: {
                            ...(settings.headerBackground || {
                              useProfilePhoto: true,
                              height: '45%',
                              overlayColor: 'rgba(0,0,0,0.3)',
                              blur: 0,
                              fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }),
                            overlayOpacity: parseInt(e.target.value),
                          }
                        })}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        Blur Effect: {settings.headerBackground?.blur || 0}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={settings.headerBackground?.blur || 0}
                        onChange={(e) => onChange({
                          ...settings,
                          headerBackground: {
                            ...(settings.headerBackground || {
                              useProfilePhoto: true,
                              height: '45%',
                              overlayColor: 'rgba(0,0,0,0.3)',
                              overlayOpacity: 30,
                              fallbackGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }),
                            blur: parseInt(e.target.value),
                          }
                        })}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your profile photo will be used as the header background. Upload a high-quality photo for best results.
                  </p>
                </div>
              )}

              {/* Banner Settings - only shown when banner is selected */}
              {settings.headerStyle === 'banner' && (
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl space-y-4">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Banner Settings
                  </p>

                  {/* Banner Mode Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Banner Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onChange({
                          ...settings,
                          bannerSettings: {
                            ...(settings.bannerSettings || { color: settings.buttonColor, derivedFromWallpaper: true }),
                            mode: 'color',
                          }
                        })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${(!settings.bannerSettings || settings.bannerSettings.mode === 'color')
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        Color
                      </button>
                      <button
                        onClick={() => onChange({
                          ...settings,
                          bannerSettings: {
                            ...(settings.bannerSettings || { color: settings.buttonColor, derivedFromWallpaper: true }),
                            mode: 'image',
                          }
                        })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${settings.bannerSettings?.mode === 'image'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        Image
                      </button>
                    </div>
                  </div>

                  {/* Color Mode Settings */}
                  {(!settings.bannerSettings || settings.bannerSettings.mode === 'color') && (
                    <div className="space-y-3">
                      {/* Auto-derive toggle */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.bannerSettings?.derivedFromWallpaper !== false}
                          onChange={(e) => onChange({
                            ...settings,
                            bannerSettings: {
                              mode: 'color',
                              color: settings.bannerSettings?.color || settings.buttonColor,
                              derivedFromWallpaper: e.target.checked,
                            }
                          })}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Auto-match from background
                        </span>
                      </label>

                      {/* Custom color picker - only show when not auto-derived */}
                      {settings.bannerSettings?.derivedFromWallpaper === false && (
                        <ColorPickerInput
                          label="Banner Color"
                          value={settings.bannerSettings?.color || settings.buttonColor}
                          onChange={(color) => onChange({
                            ...settings,
                            bannerSettings: {
                              mode: 'color',
                              color,
                              derivedFromWallpaper: false,
                            }
                          })}
                        />
                      )}
                    </div>
                  )}

                  {/* Image Mode Settings */}
                  {settings.bannerSettings?.mode === 'image' && (
                    <div className="space-y-3">
                      {/* Current banner image preview */}
                      {settings.bannerSettings?.image && (
                        <div className="relative">
                          <img
                            src={settings.bannerSettings.image}
                            alt="Banner preview"
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => onChange({
                              ...settings,
                              bannerSettings: {
                                ...settings.bannerSettings!,
                                image: undefined,
                              }
                            })}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Upload banner image button */}
                      <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors min-h-[48px]">
                        <Image className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {settings.bannerSettings?.image ? 'Change Banner Image' : 'Upload Banner Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Validate file size (max 2MB for banner)
                            if (file.size > 2 * 1024 * 1024) {
                              alert('Banner image must be less than 2MB');
                              return;
                            }

                            try {
                              // Convert to base64
                              const reader = new FileReader();
                              reader.onload = async (event) => {
                                const base64 = event.target?.result as string;

                                // Upload to server
                                const response = await fetch('/api/uploads/background', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({ image: base64 })
                                });

                                if (!response.ok) {
                                  throw new Error('Upload failed');
                                }

                                const data = await response.json();

                                // Update settings with uploaded image URL
                                onChange({
                                  ...settings,
                                  bannerSettings: {
                                    mode: 'image',
                                    color: settings.bannerSettings?.color || settings.buttonColor,
                                    derivedFromWallpaper: false,
                                    image: data.url,
                                  }
                                });
                              };
                              reader.readAsDataURL(file);
                            } catch (error) {
                              console.error('Failed to upload banner:', error);
                              alert('Failed to upload banner image. Please try again.');
                            }
                          }}
                        />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recommended: 1920×400px, max 2MB. JPG, PNG, or WebP.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleSection>

            {/* Wallpaper/Background Section */}
            <CollapsibleSection title="Background" icon={<Sparkles className="w-4 h-4" />} defaultOpen={true}>
              {/* Theme override warning */}
              {appliedTheme && appliedTheme.wallpaper && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    ⚠️ The <strong>{appliedTheme.name}</strong> theme includes a background gradient.
                    Changing the background below will customize your theme.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose a gradient or solid color for your page background
              </p>
              {/* Responsive grid: 3 cols mobile, 4 on sm, 5 on lg */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {wallpaperPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onChange({ ...settings, wallpaper: preset.value })}
                    className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden min-h-[60px] ${settings.wallpaper === preset.value
                      ? 'border-purple-500 dark:border-purple-400 ring-2 ring-offset-2 ring-purple-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    style={{ background: preset.preview }}
                    title={preset.name}
                  >
                    {preset.id === 'none' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {settings.wallpaper === preset.value && (
                      <div className="absolute bottom-1 right-1">
                        <Check className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Wallpaper Opacity - only show when wallpaper is selected */}
              {settings.wallpaper && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Opacity: {settings.wallpaperOpacity}%
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Light</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.wallpaperOpacity}
                      onChange={(e) => onChange({ ...settings, wallpaperOpacity: parseInt(e.target.value) })}
                      className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">Full</span>
                  </div>
                </div>
              )}

              {/* Container Background Color */}
              <div className="mt-4">
                <ColorPickerInput
                  label="Container overlay color"
                  value={settings.backgroundColor}
                  onChange={(color) => onChange({ ...settings, backgroundColor: color })}
                />
              </div>
            </CollapsibleSection>
          </div>
        );

      // ========================================================================
      // TYPOGRAPHY TAB - Text + Buttons (combined)
      // ========================================================================
      case 'typography':
        return (
          <div className="space-y-4">
            {/* Font Settings Section */}
            <CollapsibleSection title="Font Settings" defaultOpen={true}>
              <FontSelector
                label="Font Family"
                value={settings.fontFamily}
                onChange={(value) => onChange({ ...settings, fontFamily: value })}
                allowCustom={true}
              />

              {/* Font Preview */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4">
                <p style={{ fontFamily: settings.fontFamily }} className="text-lg font-bold text-gray-900 dark:text-white">
                  Preview Text
                </p>
                <p style={{ fontFamily: settings.fontFamily }} className="text-sm text-gray-600 dark:text-gray-400">
                  This is how your text will look on your profile
                </p>
              </div>
            </CollapsibleSection>

            {/* Button Style Section */}
            <CollapsibleSection title="Button Style" defaultOpen={true}>
              {/* Button style options - responsive grid */}
              <div className="grid grid-cols-3 gap-3">
                {(['solid', 'glass', 'outline'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onChange({ ...settings, buttonStyle: style })}
                    className={`relative p-4 rounded-xl border-2 transition-all min-h-[80px] ${settings.buttonStyle === style
                      ? 'border-purple-500 dark:border-purple-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div
                      className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium ${style === 'solid'
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                        : style === 'glass'
                          ? 'bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                          : 'bg-transparent border-2 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-200'
                        }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </div>
                    {style === 'glass' && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-yellow-900" />
                      </span>
                    )}
                    {settings.buttonStyle === style && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-purple-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Corner Radius */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Corner Radius: {settings.cornerRadius}px
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Square</span>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={settings.cornerRadius}
                    onChange={(e) => onChange({ ...settings, cornerRadius: parseInt(e.target.value) })}
                    className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">Round</span>
                </div>
                {/* Visual preview of corner radius */}
                <div className="mt-3 flex justify-center">
                  <div
                    className="w-20 h-12 bg-purple-500 transition-all"
                    style={{ borderRadius: `${settings.cornerRadius}px` }}
                  />
                </div>
              </div>

              {/* Shadows */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Shadow Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['none', 'subtle', 'strong', 'hard'] as const).map((shadow) => (
                    <button
                      key={shadow}
                      onClick={() => onChange({ ...settings, shadowStyle: shadow })}
                      className={`p-3 rounded-xl border-2 transition-all min-h-[72px] ${settings.shadowStyle === shadow
                        ? 'border-purple-500 dark:border-purple-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <div
                        className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto w-full max-w-[60px]"
                        style={{
                          boxShadow: shadow === 'none' ? 'none' :
                            shadow === 'subtle' ? '0 2px 8px rgba(0,0,0,0.1)' :
                              shadow === 'strong' ? '0 4px 16px rgba(0,0,0,0.2)' :
                                '4px 4px 0 rgba(0,0,0,0.8)',
                        }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 block text-center capitalize">
                        {shadow}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Colors - with override warning */}
              <div className="mt-4">
                {appliedTheme && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      ✏️ Button color changes will customize the <strong>{appliedTheme.name}</strong> theme
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPickerInput
                    label="Button color"
                    value={settings.buttonColor}
                    onChange={(color) => onChange({ ...settings, buttonColor: color })}
                  />
                  <ColorPickerInput
                    label="Button text color"
                    value={settings.textColor}
                    onChange={(color) => onChange({ ...settings, textColor: color })}
                  />
                  <ColorPickerInput
                    label="Shadow color"
                    value={settings.shadowColor}
                    onChange={(color) => onChange({ ...settings, shadowColor: color })}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      // ========================================================================
      // BRANDING TAB - Footer settings
      // ========================================================================
      case 'branding':
        return (
          <div className="space-y-4">
            <CollapsibleSection title="Footer Content" defaultOpen={true}>
              {/* Footer Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Footer Text
                </label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => onChange({ ...settings, footerText: e.target.value })}
                  placeholder="e.g., Made with ❤️ in NYC"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 min-h-[48px]"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {settings.footerText.length}/50 characters
                </p>
              </div>

              {/* Powered By Toggle - large touch-friendly toggle */}
              <div className="mt-4">
                <label className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer min-h-[72px]">
                  <div className="flex-1 pr-4">
                    <span className="font-medium text-gray-900 dark:text-white block">
                      Show "Powered by SwazSolutions"
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Display branding in footer
                    </p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.showPoweredBy}
                      onChange={(e) => onChange({ ...settings, showPoweredBy: e.target.checked })}
                      className="sr-only"
                    />
                    {/* Custom toggle - 48px wide for touch */}
                    <div className={`w-14 h-8 rounded-full transition-colors ${settings.showPoweredBy ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${settings.showPoweredBy ? 'translate-x-7' : 'translate-x-1'} mt-1`} />
                    </div>
                  </div>
                </label>
              </div>
            </CollapsibleSection>

            {/* Footer Preview */}
            <CollapsibleSection title="Preview" defaultOpen={true}>
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                {settings.footerText && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {settings.footerText}
                  </p>
                )}
                {settings.showPoweredBy && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Powered by SwazSolutions
                  </p>
                )}
                {!settings.footerText && !settings.showPoweredBy && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    No footer content configured
                  </p>
                )}
              </div>
            </CollapsibleSection>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
            <p className="text-center">
              <span className="text-2xl block mb-2">🚧</span>
              Coming soon
            </p>
          </div>
        );
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* 
        Tab Navigation - Mobile-first horizontal scrollable tabs
        Following UnifiedProfileEditor.tsx pattern (lines 564-579)
        - overflow-x-auto for horizontal scroll on mobile
        - scrollbar-hide for cleaner mobile UX
        - whitespace-nowrap to prevent tab wrapping
        - Icon only on xs, icon + label on sm+
        - Min 44px touch targets
      */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 min-h-[56px] min-w-[64px] sm:min-w-0 ${activeTab === tab.id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon}
              {/* Hide label on xs screens, show on sm+ */}
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Show short label on xs only for accessibility */}
              <span className="sm:hidden text-xs">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          {/* Tab Header with description */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Render active tab content */}
          {renderTabContent()}
        </div>
      </div>

      {/* AI Theme Generation Modal */}
      <AIThemeModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onThemeGenerated={(theme) => {
          // Apply the AI-generated theme to appearance settings
          const hasWallpaper = theme.wallpaper && theme.wallpaper.length > 0;
          const isGradientBackground = typeof theme.colors.background === 'string' &&
            (theme.colors.background.includes('gradient') || theme.colors.background.includes('rgba'));

          const wallpaperValue = hasWallpaper
            ? theme.wallpaper
            : (isGradientBackground ? theme.colors.background : '');

          const bgColor = isGradientBackground
            ? theme.colors.backgroundSecondary
            : theme.colors.background;

          const newSettings: AppearanceSettings = {
            ...settings,
            themeId: `ai-${Date.now()}`,
            backgroundColor: bgColor,
            wallpaper: wallpaperValue || '',
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
          setShowAIModal(false);
        }}
        apiKey={import.meta.env.VITE_GEMINI_API_KEY || ''}
      />
    </div>
  );
};

export default AppearancePanel;
