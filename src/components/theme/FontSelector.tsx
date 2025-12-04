// FontSelector Component - Dropdown selector for fonts with previews and language labels

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { FontOption } from '../../types/fonts.types';
import { fetchFonts } from '../../services/fontService';

interface FontSelectorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    allowCustom?: boolean;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
    value,
    onChange,
    label = 'Font Family',
    allowCustom = true
}) => {
    const [fonts, setFonts] = useState<FontOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchFonts().then(setFonts);
    }, []);

    // Check if current value matches any predefined font
    // Match both exact value and font name (for backward compatibility)
    useEffect(() => {
        if (!fonts.length || !value) return;

        // Try exact match first
        let matchedFont = fonts.find(f => f.value === value);

        // If no exact match, try matching by font name (first part of CSS value)
        if (!matchedFont) {
            const valueName = value.split(',')[0].replace(/['"]/g, '').trim();
            matchedFont = fonts.find(f => {
                const fontName = f.value.split(',')[0].replace(/['"]/g, '').trim();
                return fontName === valueName;
            });
        }

        if (!matchedFont && value) {
            setIsCustom(true);
            setCustomValue(value);
        } else {
            setIsCustom(false);
        }
    }, [value, fonts]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selectedFont with flexible matching
    const selectedFont = fonts.find(f => {
        if (f.value === value) return true;
        // Also match by font name for backward compatibility
        const valueName = value?.split(',')[0].replace(/['"]/g, '').trim();
        const fontName = f.value.split(',')[0].replace(/['"]/g, '').trim();
        return valueName === fontName;
    });
    const displayValue = selectedFont?.displayName || (isCustom ? 'Custom Font' : 'Select a font...');

    // Group fonts by category
    const grouped = {
        modern: fonts.filter(f => f.category === 'modern'),
        telugu: fonts.filter(f => f.category === 'telugu'),
        tamil: fonts.filter(f => f.category === 'tamil'),
        kannada: fonts.filter(f => f.category === 'kannada'),
        malayalam: fonts.filter(f => f.category === 'malayalam'),
        hindi: fonts.filter(f => f.category === 'hindi'),
    };

    // Helper to check if a font is selected (flexible matching)
    const isFontSelected = (font: FontOption) => {
        if (font.value === value) return true;
        const valueName = value?.split(',')[0].replace(/['"]/g, '').trim();
        const fontName = font.value.split(',')[0].replace(/['"]/g, '').trim();
        return valueName === fontName;
    };

    const handleSelectFont = (font: FontOption) => {
        onChange(font.value);
        setIsOpen(false);
        setIsCustom(false);
    };

    const handleCustomSubmit = () => {
        if (customValue.trim()) {
            onChange(customValue.trim());
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            {/* Main selector button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white hover:border-gray-400 transition-colors flex items-center justify-between"
            >
                <span className="truncate" style={{ fontFamily: selectedFont?.value || value }}>
                    {displayValue}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-y-auto">
                    {/* Modern Fonts */}
                    {grouped.modern.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 sticky top-0">
                                Modern Fonts
                            </div>
                            {grouped.modern.map(font => (
                                <button
                                    key={font.name}
                                    type="button"
                                    onClick={() => handleSelectFont(font)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900" style={{ fontFamily: font.value }}>
                                            {font.displayName}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" style={{ fontFamily: font.value }}>
                                            {font.preview}
                                        </div>
                                    </div>
                                    {isFontSelected(font) && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Telugu Fonts */}
                    {grouped.telugu.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 sticky top-0">
                                Telugu Fonts
                            </div>
                            {grouped.telugu.map(font => (
                                <button
                                    key={font.name}
                                    type="button"
                                    onClick={() => handleSelectFont(font)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {font.displayName}
                                            {font.language && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                    {font.language}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" style={{ fontFamily: font.value }}>
                                            {font.preview}
                                        </div>
                                    </div>
                                    {isFontSelected(font) && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tamil Fonts */}
                    {grouped.tamil.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 sticky top-0">
                                Tamil Fonts
                            </div>
                            {grouped.tamil.map(font => (
                                <button
                                    key={font.name}
                                    type="button"
                                    onClick={() => handleSelectFont(font)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {font.displayName}
                                            {font.language && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                    {font.language}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" style={{ fontFamily: font.value }}>
                                            {font.preview}
                                        </div>
                                    </div>
                                    {isFontSelected(font) && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Kannada Fonts */}
                    {grouped.kannada.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 sticky top-0">
                                Kannada Fonts
                            </div>
                            {grouped.kannada.map(font => (
                                <button
                                    key={font.name}
                                    type="button"
                                    onClick={() => handleSelectFont(font)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {font.displayName}
                                            {font.language && (
                                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                                    {font.language}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" style={{ fontFamily: font.value }}>
                                            {font.preview}
                                        </div>
                                    </div>
                                    {isFontSelected(font) && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Malayalam Fonts */}
                    {grouped.malayalam.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 sticky top-0">
                                Malayalam Fonts
                            </div>
                            {grouped.malayalam.map(font => (
                                <button
                                    key={font.name}
                                    type="button"
                                    onClick={() => handleSelectFont(font)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {font.displayName}
                                            {font.language && (
                                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                    {font.language}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" style={{ fontFamily: font.value }}>
                                            {font.preview}
                                        </div>
                                    </div>
                                    {isFontSelected(font) && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Hindi Fonts */}
                    {grouped.hindi.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 sticky top-0">
                                Hindi Fonts
                            </div>
                            {grouped.hindi.map(font => (
                                <button
                                    key={font.name}
                                    type="button"
                                    onClick={() => handleSelectFont(font)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {font.displayName}
                                            {font.language && (
                                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                    {font.language}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate" style={{ fontFamily: font.value }}>
                                            {font.preview}
                                        </div>
                                    </div>
                                    {isFontSelected(font) && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Custom font option */}
                    {allowCustom && (
                        <div className="border-t border-gray-200">
                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600">
                                Custom Font
                            </div>
                            <div className="px-3 py-2">
                                <input
                                    type="text"
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                                    placeholder="Enter CSS font-family..."
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomSubmit}
                                    className="mt-2 w-full px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
                                >
                                    Use Custom Font
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
