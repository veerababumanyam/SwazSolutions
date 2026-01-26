/**
 * ENHANCED THEME SELECTOR
 * Premium theme browsing with live preview and better UX
 *
 * Features:
 * - Live theme preview on hover
 * - Better categorization with icons
 * - Smooth transitions
 * - Theme favorites
 * - Search functionality
 * - Grid/List view toggle
 * - Quick apply with confirmation
 */

import React, { useState, useMemo } from 'react';
import { Palette, Loader2, Check, Image, Sparkles, Wand2, Search, Grid3x3, List, Star, Eye, Info } from 'lucide-react';
import { Theme, ThemeCategory, THEME_CATEGORY_META } from '../../types/theme.types';

interface EnhancedThemeSelectorProps {
  themes: Theme[];
  selectedThemeId: string;
  loading: boolean;
  onApplyTheme: (theme: Theme) => void;
  onShowAIModal: () => void;
  onPreviewTheme?: (theme: Theme) => void;
}

type ThemeCategoryFilter = 'all' | ThemeCategory;
type ViewMode = 'grid' | 'list';

export const EnhancedThemeSelector: React.FC<EnhancedThemeSelectorProps> = ({
  themes,
  selectedThemeId,
  loading,
  onApplyTheme,
  onShowAIModal,
  onPreviewTheme
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [applyingThemeId, setApplyingThemeId] = useState<number | null>(null);

  // Filter themes by category and search query
  const filteredThemes = useMemo(() => {
    let filtered = selectedCategory === 'all' ? themes : themes.filter(theme => theme.category === selectedCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(query) ||
        String(theme.category).toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [themes, selectedCategory, searchQuery]);

  // Theme categories with counts
  const themeCategories = useMemo(() => [
    { id: 'all' as const, label: 'All', icon: '✨', count: themes.length },
    ...Object.entries(THEME_CATEGORY_META).map(([id, meta]) => ({
      id: id as ThemeCategory,
      label: meta.label,
      icon: meta.icon,
      count: themes.filter(t => t.category === id).length
    }))
  ].filter(cat => cat.id === 'all' || cat.count > 0), [themes]);

  // Toggle favorite
  const toggleFavorite = (e: React.MouseEvent, themeId: number) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(themeId)) {
        newFavorites.delete(themeId);
      } else {
        newFavorites.add(themeId);
      }
      return newFavorites;
    });
  };

  // Apply theme with loading state
  const handleApplyTheme = async (theme: Theme) => {
    setApplyingThemeId(theme.id || null);
    try {
      await onApplyTheme(theme);
    } finally {
      setTimeout(() => setApplyingThemeId(null), 500);
    }
  };

  // Handle preview
  const handlePreview = (theme: Theme) => {
    setHoveredTheme(theme);
    onPreviewTheme?.(theme);
  };

  return (
    <div className="space-y-6">
      {/* AI Theme Generation - Prominent CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-shift bg-[length:200%_200%]" />
        <div className="relative bg-white dark:bg-gray-900 rounded-xl p-5">
          <button
            onClick={onShowAIModal}
            className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 min-h-[60px]"
          >
            <Wand2 className="w-6 h-6" />
            <span className="text-lg">Generate with AI</span>
            <Sparkles className="w-5 h-5 opacity-70" />
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
            Describe your style and let AI create a WCAG-compliant theme
          </p>
        </div>
      </div>

      {/* Header with Search and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Theme Gallery</h3>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
            {themes.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {themeCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`text-xs ${selectedCategory === cat.id ? 'text-purple-200' : 'text-gray-400'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Info Banner for Visual Themes */}
      {selectedCategory === 'visual' && (
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
          <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
              Visual themes use your profile photo as a stunning header background
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Perfect for photographers, models, and personal brands
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading themes...</p>
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="text-center py-16">
          <Palette className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No themes found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredThemes.map((theme) => {
                const isSelected = selectedThemeId === String(theme.id);
                const isFavorite = favorites.has(theme.id || 0);
                const isApplying = applyingThemeId === theme.id;
                const isVisual = theme.category === 'visual';

                return (
                  <div
                    key={theme.id}
                    className={`relative group rounded-2xl border-2 transition-all overflow-hidden ${
                      isSelected
                        ? 'border-purple-500 dark:border-purple-400 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                    onMouseEnter={() => handlePreview(theme)}
                    onMouseLeave={() => setHoveredTheme(null)}
                  >
                    {/* Theme Preview */}
                    <div
                      className="h-24 relative overflow-hidden"
                      style={{ background: theme.wallpaper || theme.colors.background }}
                    >
                      {isVisual ? (
                        <>
                          <Image className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-30" style={{ color: theme.colors.text }} />
                          <div
                            className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center"
                            style={{ background: `linear-gradient(to top, ${theme.colors.background}, transparent)` }}
                          >
                            <div className="w-12 h-1 rounded" style={{ backgroundColor: theme.colors.primary }} />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                          <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="w-16 h-2 rounded" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="w-10 h-1.5 rounded opacity-60" style={{ backgroundColor: theme.colors.secondary }} />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApplyTheme(theme)}
                          disabled={isApplying}
                          className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          {isApplying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(e, theme.id || 0)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </button>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                          Active
                        </div>
                      )}
                    </div>

                    {/* Theme Info */}
                    <div className="p-3 bg-white dark:bg-gray-900">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {theme.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                        {theme.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredThemes.map((theme) => {
                const isSelected = selectedThemeId === String(theme.id);
                const isFavorite = favorites.has(theme.id || 0);
                const isApplying = applyingThemeId === theme.id;
                const isVisual = theme.category === 'visual';

                return (
                  <div
                    key={theme.id}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 dark:border-purple-400 shadow-md bg-purple-50/50 dark:bg-purple-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm bg-white dark:bg-gray-900'
                    }`}
                    onMouseEnter={() => handlePreview(theme)}
                    onMouseLeave={() => setHoveredTheme(null)}
                  >
                    {/* Theme Preview Thumbnail */}
                    <div
                      className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                      style={{ background: theme.wallpaper || theme.colors.background }}
                    >
                      {isVisual ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-6 h-6 opacity-40" style={{ color: theme.colors.text }} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center gap-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="w-8 h-1.5 rounded" style={{ backgroundColor: theme.colors.primary }} />
                        </div>
                      )}
                    </div>

                    {/* Theme Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {theme.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {theme.category}
                        </span>
                        {THEME_CATEGORY_META[theme.category]?.icon && (
                          <span className="text-xs">{THEME_CATEGORY_META[theme.category]?.icon}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleFavorite(e, theme.id || 0)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                      <button
                        onClick={() => handleApplyTheme(theme)}
                        disabled={isApplying}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        } disabled:opacity-50`}
                      >
                        {isApplying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            Active
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Theme Count */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredThemes.length} of {themes.length} themes
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedThemeSelector;
