import React, { useState, useMemo } from 'react';
import { Palette, Loader2, Check, Image, Sparkles, Wand2 } from 'lucide-react';
import { Theme, ThemeCategory, THEME_CATEGORY_META } from '../../types/theme.types';

interface ThemeSelectorProps {
    themes: Theme[];
    selectedThemeId: string;
    loading: boolean;
    onApplyTheme: (theme: Theme) => void;
    onShowAIModal: () => void;
}

type ThemeCategoryFilter = 'all' | ThemeCategory;

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    themes,
    selectedThemeId,
    loading,
    onApplyTheme,
    onShowAIModal
}) => {
    const [selectedCategory, setSelectedCategory] = useState<ThemeCategoryFilter>('all');

    const filteredThemes = useMemo(() => {
        if (selectedCategory === 'all') return themes;
        return themes.filter(theme => theme.category === selectedCategory);
    }, [themes, selectedCategory]);

    const themeCategories = useMemo(() => [
        { id: 'all' as const, label: 'All', icon: '✨', count: themes.length },
        ...Object.entries(THEME_CATEGORY_META).map(([id, meta]) => ({
            id: id as ThemeCategory,
            label: meta.label,
            icon: meta.icon,
            count: themes.filter(t => t.category === id).length
        }))
    ].filter(cat => cat.id === 'all' || cat.count > 0), [themes]);

    return (
        <div className="space-y-4">
            {/* AI Theme Generation Button */}
            <div className="mb-4">
                <button
                    onClick={onShowAIModal}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25 min-h-[52px]"
                >
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Theme with AI</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Describe your style and let AI create a WCAG-compliant theme
                </p>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Professional Themes</h3>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Browse WCAG 2.1 AA compliant themes with optimized contrast ratios
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
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
                        <span className={`ml-0.5 ${selectedCategory === cat.id ? 'text-purple-200' : 'text-gray-400'}`}>
                            ({cat.count})
                        </span>
                    </button>
                ))}
            </div>

            {/* Themes Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            ) : filteredThemes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No themes found in this category
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredThemes.map((theme) => {
                        const isSelected = selectedThemeId === String(theme.id);
                        const isVisual = theme.category === 'visual';
                        const previewBackground = theme.wallpaper || theme.colors.background;

                        return (
                            <button
                                key={theme.id}
                                onClick={() => onApplyTheme(theme)}
                                className={`relative p-3 rounded-xl border-2 transition-all min-h-[120px] text-left ${isSelected
                                        ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-900'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {/* Theme Preview */}
                                <div
                                    className="h-16 rounded-lg mb-2 flex flex-col items-center justify-center gap-1 overflow-hidden relative"
                                    style={{ background: previewBackground }}
                                >
                                    {isVisual ? (
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
                                        <>
                                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                                            <div className="w-10 h-1.5 rounded" style={{ backgroundColor: theme.colors.primary }} />
                                            <div className="w-6 h-1 rounded" style={{ backgroundColor: theme.colors.secondary }} />
                                        </>
                                    )}
                                </div>

                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1 block">
                                    {theme.name}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
                                    {theme.category}
                                </span>

                                {isSelected && (
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
        </div>
    );
};

export default ThemeSelector;
