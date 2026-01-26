/**
 * MOBILE-FIRST APPEARANCE PANEL
 * Modern theme selector with photo background upload support
 * Inspired by Linktr.ee, Beacons.ai, Koji
 *
 * Features:
 * - Mobile-first responsive design
 * - Photo background upload with preview
 * - 18+ themes across 9 categories
 * - Live preview updates
 * - Touch-friendly controls
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Palette,
  LayoutGrid,
  Type,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wand2,
  Loader2
} from 'lucide-react';
import { MOBILE_FIRST_THEMES, getThemesByCategory, getPhotoBackgroundThemes, THEME_CATEGORY_META } from '../../data/mobileFirstThemes';
import { AppearanceSettings, BackgroundSettings, Theme, ThemeCategory } from '../../types/profile.types';
import { ButtonStyleSection } from './ButtonStyleSection';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AppearancePanelProps {
  settings: AppearanceSettings;
  onChange: (settings: AppearanceSettings) => void;
  profileData?: {
    username: string;
    displayName: string;
    avatar?: string;
  };
}

// Mobile-first tab structure
type TabType = 'themes' | 'background' | 'buttons' | 'typography' | 'spacing';
type ButtonSubTabType = 'basic' | 'advanced';

// ============================================================================
// MOBILE-FIRST THEME CARD COMPONENT
// ============================================================================

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect, isLoading }) => {
  return (
    <button
      onClick={onSelect}
      className={`relative group w-full aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-300 ${isSelected
          ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 shadow-xl'
          : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-blue-300 hover:scale-102 shadow-md'
        }`}
      disabled={isLoading}
    >
      {/* Theme Preview */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: theme.preview ? `url(${theme.preview})` : undefined,
          background: theme.preview ? undefined : theme.colors.background
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Theme Name */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
          <h3 className="text-white font-bold text-sm drop-shadow-lg">{theme.name}</h3>
          <p className="text-white/80 text-xs drop-shadow line-clamp-1">{theme.description}</p>
        </div>
      </div>

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Photo Support Badge */}
      {theme.supportsCustomPhoto && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">Photo</span>
        </div>
      )}
    </button>
  );
};

// ============================================================================
// PHOTO UPLOADER COMPONENT
// ============================================================================

interface PhotoUploaderProps {
  currentPhoto?: string;
  onUpload: (photoUrl: string) => void;
  onRemove: () => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ currentPhoto, onUpload, onRemove }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/uploads/background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUpload(data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-left">
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Upload Background Photo
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG up to 10MB
              </p>
            </div>
          </>
        )}
      </label>

      {/* Current Photo Preview */}
      {currentPhoto && (
        <div className="relative">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden">
            <img
              src={currentPhoto}
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CUSTOMIZATION SLIDER COMPONENT
// ============================================================================

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
};

// ============================================================================
// MAIN APPEARANCE PANEL COMPONENT
// ============================================================================

export const MobileFirstAppearancePanel: React.FC<AppearancePanelProps> = ({
  settings,
  onChange,
  profileData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('themes');
  const [activeButtonSubTab, setActiveButtonSubTab] = useState<ButtonSubTabType>('basic');
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>('all');
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | undefined>(
    settings.background.type === 'image' ? settings.background.value : undefined
  );

  // Filter themes by category
  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return MOBILE_FIRST_THEMES;
    return getThemesByCategory(selectedCategory);
  }, [selectedCategory]);

  // Category filter options
  const categories = useMemo(() => [
    { id: 'all' as const, label: 'All', icon: '✨', count: MOBILE_FIRST_THEMES.length },
    { id: 'minimal' as const, label: 'Minimal', icon: THEME_CATEGORY_META.minimal.icon, count: getThemesByCategory('minimal').length },
    { id: 'gradient' as const, label: 'Gradient', icon: THEME_CATEGORY_META.gradient.icon, count: getThemesByCategory('gradient').length },
    { id: 'photo' as const, label: 'Photo', icon: THEME_CATEGORY_META.photo.icon, count: getThemesByCategory('photo').length },
    { id: 'glass' as const, label: 'Glass', icon: THEME_CATEGORY_META.glass.icon, count: getThemesByCategory('glass').length },
    { id: 'dark' as const, label: 'Dark', icon: THEME_CATEGORY_META.dark.icon, count: getThemesByCategory('dark').length },
    { id: 'bold' as const, label: 'Bold', icon: THEME_CATEGORY_META.bold.icon, count: getThemesByCategory('bold').length },
    { id: 'nature' as const, label: 'Nature', icon: THEME_CATEGORY_META.nature.icon, count: getThemesByCategory('nature').length },
    { id: 'urban' as const, label: 'Urban', icon: THEME_CATEGORY_META.urban.icon, count: getThemesByCategory('urban').length },
    { id: 'seasonal' as const, label: 'Seasonal', icon: THEME_CATEGORY_META.seasonal.icon, count: getThemesByCategory('seasonal').length },
  ], []);

  // Mobile-first tabs
  const tabs = useMemo(() => [
    { id: 'themes' as TabType, label: 'Themes', icon: <Palette className="w-5 h-5" />, description: 'Choose a theme' },
    { id: 'background' as TabType, label: 'Background', icon: <ImageIcon className="w-5 h-5" />, description: 'Custom background' },
    { id: 'buttons' as TabType, label: 'Buttons', icon: <LayoutGrid className="w-5 h-5" />, description: 'Button style' },
    { id: 'typography' as TabType, label: 'Text', icon: <Type className="w-5 h-5" />, description: 'Font & size' },
    { id: 'spacing' as TabType, label: 'Spacing', icon: <Sparkles className="w-5 h-5" />, description: 'Layout spacing' },
  ], []);

  // Apply theme
  const applyTheme = useCallback(async (theme: Theme) => {
    setApplyingTheme(theme.id);

    try {
      // Update appearance settings based on theme
      const newSettings: AppearanceSettings = {
        ...settings,
        themeId: theme.id,
        buttonColor: theme.colors.primary,
        textColor: theme.colors.text,
        backgroundColor: theme.colors.backgroundSecondary,
        shadowColor: theme.colors.accent,
        headerColor: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        cornerRadius: parseInt(theme.layout.borderRadius.md) || 12,
        // Background settings
        background: {
          type: theme.wallpaper ? 'gradient' : 'solid',
          value: theme.wallpaper || theme.colors.background,
          opacity: 100,
          blur: theme.headerBackground?.blur || 0,
          overlayColor: theme.headerBackground?.overlayColor || 'rgba(0,0,0,0.3)',
          overlayOpacity: theme.headerBackground?.overlayOpacity || 30,
        },
        // Header style based on category
        headerStyle: theme.category === 'photo' ? 'hero-photo' : 'simple',
        spacing: 'comfortable',
        linkStyle: 'card',
      };

      // Preserve custom photo if it exists
      if (customPhotoUrl && theme.supportsCustomPhoto) {
        newSettings.background = {
          ...newSettings.background,
          type: 'image',
          value: customPhotoUrl,
        };
      }

      onChange(newSettings);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setApplyingTheme(null);
    }
  }, [settings, onChange, customPhotoUrl]);

  // Handle photo upload
  const handlePhotoUpload = useCallback((photoUrl: string) => {
    setCustomPhotoUrl(photoUrl);
    onChange({
      ...settings,
      background: {
        ...settings.background,
        type: 'image',
        value: photoUrl,
      },
    });
  }, [settings, onChange]);

  // Handle photo removal
  const handlePhotoRemove = useCallback(() => {
    setCustomPhotoUrl(undefined);
    // Revert to theme's default background
    const theme = MOBILE_FIRST_THEMES.find(t => t.id === settings.themeId);
    if (theme?.wallpaper) {
      onChange({
        ...settings,
        background: {
          ...settings.background,
          type: 'gradient',
          value: theme.wallpaper,
        },
      });
    }
  }, [settings, onChange]);

  // ============================================================================
  // RENDER TAB CONTENT
  // ============================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'themes':
        return (
          <div className="space-y-6">
            {/* Category Filter - Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === category.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                  <span className="text-xs opacity-60">({category.count})</span>
                </button>
              ))}
            </div>

            {/* Theme Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={settings.themeId === theme.id}
                  onSelect={() => applyTheme(theme)}
                  isLoading={applyingTheme === theme.id}
                />
              ))}
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-6">
            {/* Photo Upload Section */}
            {settings.themeId && MOBILE_FIRST_THEMES.find(t => t.id === settings.themeId)?.supportsCustomPhoto ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                    Custom Background Photo
                  </h3>
                </div>
                <PhotoUploader
                  currentPhoto={customPhotoUrl}
                  onUpload={handlePhotoUpload}
                  onRemove={handlePhotoRemove}
                />
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Photo backgrounds require a photo theme
                </p>
                <button
                  onClick={() => setActiveTab('themes')}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Browse Photo Themes →
                </button>
              </div>
            )}

            {/* Background Adjustments */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Background Adjustments</h3>

              <SliderControl
                label="Blur"
                value={settings.background.blur || 0}
                min={0}
                max={20}
                onChange={(value) => onChange({
                  ...settings,
                  background: { ...settings.background, blur: value },
                })}
              />

              <SliderControl
                label="Opacity"
                value={settings.background.opacity}
                min={0}
                max={100}
                unit="%"
                onChange={(value) => onChange({
                  ...settings,
                  background: { ...settings.background, opacity: value },
                })}
              />

              <SliderControl
                label="Overlay Opacity"
                value={settings.background.overlayOpacity || 30}
                min={0}
                max={100}
                unit="%"
                onChange={(value) => onChange({
                  ...settings,
                  background: { ...settings.background, overlayOpacity: value },
                })}
              />
            </div>
          </div>
        );

      case 'buttons':
        return (
          <div className="space-y-6">
            {/* Button Subtabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveButtonSubTab('basic')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeButtonSubTab === 'basic'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setActiveButtonSubTab('advanced')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeButtonSubTab === 'advanced'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Advanced
              </button>
            </div>

            {/* Basic Controls */}
            {activeButtonSubTab === 'basic' && (
              <div className="space-y-6">
                {/* Button Style Selection */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Button Style</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['solid', 'glass', 'outline', 'minimal'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => onChange({ ...settings, buttonStyle: style })}
                        className={`p-4 rounded-xl border-2 transition-all ${settings.buttonStyle === style
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <span className="capitalize font-medium">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Radius */}
                <SliderControl
                  label="Corner Radius"
                  value={settings.cornerRadius}
                  min={0}
                  max={24}
                  unit="px"
                  onChange={(value) => onChange({ ...settings, cornerRadius: value })}
                />

                {/* Button Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Button Color
                  </label>
                  <input
                    type="color"
                    value={settings.buttonColor}
                    onChange={(e) => onChange({ ...settings, buttonColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Advanced Controls */}
            {activeButtonSubTab === 'advanced' && (
              <ButtonStyleSection settings={settings} onChange={onChange} />
            )}
          </div>
        );

      case 'typography':
        return (
          <div className="space-y-6">
            {/* Font Family Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Font Family</h3>
              <div className="space-y-2">
                {[
                  { id: 'Inter', name: 'Inter (Clean)' },
                  { id: 'Poppins', name: 'Poppins (Modern)' },
                  { id: 'Playfair Display', name: 'Playfair (Elegant)' },
                  { id: 'Roboto', name: 'Roboto (Classic)' },
                  { id: 'Open Sans', name: 'Open Sans (Friendly)' },
                ].map((font) => (
                  <button
                    key={font.id}
                    onClick={() => onChange({ ...settings, fontFamily: font.id })}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${settings.fontFamily === font.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    style={{ fontFamily: font.id }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'spacing':
        return (
          <div className="space-y-6">
            {/* Spacing Preset */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Layout Spacing</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'comfortable', 'spacious'] as const).map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => onChange({ ...settings, spacing })}
                    className={`p-3 rounded-xl border-2 transition-all capitalize ${settings.spacing === spacing
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            {/* Link Style */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Link Card Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['card', 'pill', 'minimal', 'icon-only'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onChange({ ...settings, linkStyle: style })}
                    className={`p-3 rounded-xl border-2 transition-all capitalize ${settings.linkStyle === style
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    {style.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
      {/* Mobile-first Tab Navigation - Horizontal scroll */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] transition-colors border-b-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Tab Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Render tab content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MobileFirstAppearancePanel;
