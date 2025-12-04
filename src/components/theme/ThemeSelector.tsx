import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Theme } from '../../types/theme.types';
import { ThemeGallery } from './ThemeGallery';

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onThemeSelected?: (theme: Theme) => void;
    onCustomizeClick?: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    isOpen,
    onClose,
    onThemeSelected,
    onCustomizeClick
}) => {
    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

    if (!isOpen) return null;

    const handleThemeSelect = (theme: Theme) => {
        setSelectedTheme(theme);
        if (onThemeSelected) {
            onThemeSelected(theme);
        }
    };

    const handleCustomize = (theme: Theme) => {
        if (onCustomizeClick) {
            onCustomizeClick(theme);
            onClose(); // Close selector when opening customizer
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Choose Your Theme</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Select a theme to apply to your profile, or customize one to make it your own
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close theme selector"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <ThemeGallery
                        onSelectTheme={handleThemeSelect}
                        onCustomizeTheme={handleCustomize}
                        showCustomButton={true}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="text-sm text-gray-600">
                        {selectedTheme && (
                            <span>Last selected: <strong>{selectedTheme.name}</strong></span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;
