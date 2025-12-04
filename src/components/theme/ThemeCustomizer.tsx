import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Type, Layout as LayoutIcon, User } from 'lucide-react';
import { Theme, ThemeColors, ThemeTypography, ThemeLayout, ThemeAvatar } from '../../types/theme.types';
import { ThemePreview } from './ThemePreview';
import { themeService } from '../../services/themeService';

interface ThemeCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
    baseTheme?: Theme;
    onSave?: (theme: Theme) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
    isOpen,
    onClose,
    baseTheme,
    onSave
}) => {
    const [themeName, setThemeName] = useState('');
    const [colors, setColors] = useState<ThemeColors>({
        background: '#FFFFFF',
        backgroundSecondary: '#F8FAFC',
        primary: '#3B82F6',
        secondary: '#60A5FA',
        accent: '#2563EB',
        text: '#1F2937',
        textSecondary: '#6B7280',
        border: '#E5E7EB'
    });
    const [typography, setTypography] = useState<ThemeTypography>({
        fontFamily: "'Inter', 'system-ui', 'sans-serif'",
        headingFont: "'Poppins', 'sans-serif'",
        baseFontSize: '16px',
        headingSizes: { h1: '2.5rem', h2: '2rem', h3: '1.5rem' },
        fontWeights: { normal: 400, medium: 500, bold: 700 }
    });
    const [layout, setLayout] = useState<ThemeLayout>({
        maxWidth: '1200px',
        spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem' },
        borderRadius: { sm: '0.375rem', md: '0.5rem', lg: '1rem' },
        shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)'
        }
    });
    const [avatar, setAvatar] = useState<ThemeAvatar>({
        shape: 'circle',
        size: '120px',
        borderWidth: '4px',
        borderColor: '#3B82F6',
        shadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
    });
    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'avatar'>('colors');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (baseTheme) {
            setThemeName(`${baseTheme.name} (Custom)`);
            setColors(baseTheme.colors);
            setTypography(baseTheme.typography);
            setLayout(baseTheme.layout);
            setAvatar(baseTheme.avatar);
        }
    }, [baseTheme]);

    if (!isOpen) return null;

    const currentTheme: Theme = {
        name: themeName,
        category: 'custom',
        colors,
        typography,
        layout,
        avatar,
        isSystem: false
    };

    const handleSave = async () => {
        if (!themeName.trim()) {
            alert('Please enter a theme name');
            return;
        }

        try {
            setSaving(true);
            const response = await themeService.createTheme({
                name: themeName,
                category: 'custom',
                colors,
                typography,
                layout,
                avatar
            });

            alert(`Theme "${response.theme.name}" saved successfully!`);

            if (onSave) {
                onSave(response.theme);
            }

            onClose();
        } catch (error) {
            console.error('Failed to save theme:', error);
            alert('Failed to save theme. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'colors' as const, label: 'Colors', icon: Palette },
        { id: 'typography' as const, label: 'Typography', icon: Type },
        { id: 'layout' as const, label: 'Layout', icon: LayoutIcon },
        { id: 'avatar' as const, label: 'Avatar', icon: User }
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Customize Theme</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Personalize your theme with live preview
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close customizer"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    {/* Left: Controls */}
                    <div className="space-y-6">
                        {/* Theme Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Theme Name
                            </label>
                            <input
                                type="text"
                                value={themeName}
                                onChange={(e) => setThemeName(e.target.value)}
                                placeholder="My Awesome Theme"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                                                ? 'border-primary text-primary font-medium'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {activeTab === 'colors' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(colors).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={value}
                                                    onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'typography' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Font Family
                                        </label>
                                        <input
                                            type="text"
                                            value={typography.fontFamily}
                                            onChange={(e) => setTypography({ ...typography, fontFamily: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heading Font
                                        </label>
                                        <input
                                            type="text"
                                            value={typography.headingFont}
                                            onChange={(e) => setTypography({ ...typography, headingFont: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Base Font Size
                                        </label>
                                        <input
                                            type="text"
                                            value={typography.baseFontSize}
                                            onChange={(e) => setTypography({ ...typography, baseFontSize: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'layout' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Width
                                        </label>
                                        <input
                                            type="text"
                                            value={layout.maxWidth}
                                            onChange={(e) => setLayout({ ...layout, maxWidth: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Border Radius
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(layout.borderRadius).map(([key, value]) => (
                                                <div key={key}>
                                                    <label className="text-xs text-gray-600 capitalize">{key}</label>
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => setLayout({
                                                            ...layout,
                                                            borderRadius: { ...layout.borderRadius, [key]: e.target.value }
                                                        })}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'avatar' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Shape
                                        </label>
                                        <select
                                            value={avatar.shape}
                                            onChange={(e) => setAvatar({ ...avatar, shape: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        >
                                            <option value="circle">Circle</option>
                                            <option value="rounded">Rounded</option>
                                            <option value="square">Square</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Size
                                        </label>
                                        <input
                                            type="text"
                                            value={avatar.size}
                                            onChange={(e) => setAvatar({ ...avatar, size: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Border Width
                                        </label>
                                        <input
                                            type="text"
                                            value={avatar.borderWidth}
                                            onChange={(e) => setAvatar({ ...avatar, borderWidth: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Border Color
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={avatar.borderColor}
                                                onChange={(e) => setAvatar({ ...avatar, borderColor: e.target.value })}
                                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={avatar.borderColor}
                                                onChange={(e) => setAvatar({ ...avatar, borderColor: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Live Preview</h3>
                            <ThemePreview theme={currentTheme} size="large" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !themeName.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Theme'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeCustomizer;
