import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme.types';
import { themeService } from '../../services/themeService';
import { ThemePreview } from './ThemePreview';
import { Loader2, Search, Filter, CheckCircle, XCircle, X } from 'lucide-react';

interface ThemeGalleryProps {
    onSelectTheme?: (theme: Theme) => void;
    onCustomizeTheme?: (theme: Theme) => void;
    showCustomButton?: boolean;
}

// Toast notification component
interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
            ) : (
                <XCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ThemeGallery: React.FC<ThemeGalleryProps> = ({
    onSelectTheme,
    onCustomizeTheme,
    showCustomButton = true
}) => {
    const [systemThemes, setSystemThemes] = useState<Theme[]>([]);
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [applyingThemeId, setApplyingThemeId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const categories = ['all', 'professional', 'modern', 'creative', 'minimal', 'custom'];

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            setLoading(true);
            setError(null);
            const { system, custom } = await themeService.getAllThemes();
            setSystemThemes(system);
            setCustomThemes(custom);
        } catch (err) {
            setError('Failed to load themes. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyTheme = async (theme: Theme) => {
        if (!theme.id) return;

        try {
            setApplyingThemeId(theme.id);
            await themeService.applyTheme(theme.id);

            if (onSelectTheme) {
                onSelectTheme(theme);
            }

            // Show success toast
            setToast({ message: `Theme "${theme.name}" applied successfully!`, type: 'success' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to apply theme. Please try again.';
            console.error('Failed to apply theme:', err);
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setApplyingThemeId(null);
        }
    };

    const handleCustomize = (theme: Theme) => {
        if (onCustomizeTheme) {
            onCustomizeTheme(theme);
        }
    };

    const filterThemes = (themes: Theme[]): Theme[] => {
        return themes.filter(theme => {
            const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    };

    const allThemes = [...systemThemes, ...customThemes];
    const filteredThemes = filterThemes(allThemes);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-textSecondary">Loading themes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>{error}</p>
                <button
                    onClick={loadThemes}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Theme Gallery</h2>
                <p className="text-sm text-gray-600">{filteredThemes.length} themes available</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search themes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Theme Grid */}
            {filteredThemes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No themes found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredThemes.map((theme) => (
                        <div key={theme.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            {/* Theme Info */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                        {theme.category}
                                    </span>
                                </div>
                                {theme.isSystem && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">System</span>
                                )}
                            </div>

                            {/* Preview */}
                            <div className="mb-3 flex justify-center">
                                <ThemePreview theme={theme} size="small" />
                            </div>

                            {/* Color Palette */}
                            <div className="flex gap-1 mb-3">
                                <div className="w-full h-6 rounded" style={{ backgroundColor: theme.colors.background }} title="Background"></div>
                                <div className="w-full h-6 rounded" style={{ backgroundColor: theme.colors.primary }} title="Primary"></div>
                                <div className="w-full h-6 rounded" style={{ backgroundColor: theme.colors.secondary }} title="Secondary"></div>
                                <div className="w-full h-6 rounded" style={{ backgroundColor: theme.colors.accent }} title="Accent"></div>
                                <div className="w-full h-6 rounded border border-gray-300" style={{ backgroundColor: theme.colors.text }} title="Text"></div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApplyTheme(theme)}
                                    disabled={applyingThemeId === theme.id}
                                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {applyingThemeId === theme.id ? (
                                        <>
                                            <Loader2 className="inline w-4 h-4 animate-spin mr-1" />
                                            Applying...
                                        </>
                                    ) : (
                                        'Apply'
                                    )}
                                </button>
                                {showCustomButton && (
                                    <button
                                        onClick={() => handleCustomize(theme)}
                                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        Customize
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ThemeGallery;
