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
import { Theme, ThemeHeaderBackground, ThemeCategory, THEME_CATEGORY_META } from '../../types/theme.types';
import themeService from '../../services/themeService';
import AIThemeModal from '../appearance/AIThemeModal';
import { ImageCropper } from '../common/ImageCropper';
import { CropResult } from '../../utils/cropImage';
import ThemeSelector from './ThemeSelector';
import ThemeCustomizer from './ThemeCustomizer';

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

  // Banner cropper state
  const [bannerCropperOpen, setBannerCropperOpen] = useState(false);
  const [bannerCropperImage, setBannerCropperImage] = useState<string>('');
  const [bannerUploading, setBannerUploading] = useState(false);

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
      description: 'Fonts & Icon Styling'
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

  // Handle banner image selection - opens cropper
  const handleBannerFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB for banner)
    if (file.size > 10 * 1024 * 1024) {
      alert('Banner image must be less than 10MB');
      return;
    }

    // Read file and open cropper
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setBannerCropperImage(base64);
      setBannerCropperOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  }, []);

  // Handle cropped banner upload
  const handleBannerCropComplete = useCallback(async (result: CropResult) => {
    setBannerUploading(true);
    try {
      // Upload to server
      const response = await fetch('/api/uploads/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: result.base64 })
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
    } catch (error) {
      console.error('Failed to upload banner:', error);
      alert('Failed to upload banner image. Please try again.');
    } finally {
      setBannerUploading(false);
      setBannerCropperOpen(false);
      setBannerCropperImage('');
    }
  }, [settings, onChange]);

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
      case 'style':
        return (
          <ThemeSelector
            themes={systemThemes}
            selectedThemeId={settings.themeId}
            loading={themesLoading}
            onApplyTheme={applySystemTheme}
            onShowAIModal={() => setShowAIModal(true)}
          />
        );
      case 'layout':
      case 'typography':
      case 'branding':
        return (
          <ThemeCustomizer
            settings={settings}
            onChange={onChange}
          />
        );
      default:
        return null;
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

      {/* Banner Image Cropper Modal */}
      <ImageCropper
        imageSrc={bannerCropperImage}
        isOpen={bannerCropperOpen}
        onClose={() => {
          setBannerCropperOpen(false);
          setBannerCropperImage('');
        }}
        onCropComplete={handleBannerCropComplete}
        aspectRatio="banner"
        title="Crop Banner Image"
        cropShape="rect"
      />
    </div>
  );
};

export default AppearancePanel;
