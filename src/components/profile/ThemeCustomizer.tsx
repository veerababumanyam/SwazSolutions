import React, { useState } from 'react';
import { Palette, LayoutGrid, Type, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import ColorPickerInput from './ColorPickerInput';
import { FontSelector } from '../theme/FontSelector';
import { AppearanceSettings } from './AppearancePanel';

interface ThemeCustomizerProps {
    settings: AppearanceSettings;
    onChange: (settings: AppearanceSettings) => void;
}

interface CollapsibleSectionProps {
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

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
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-purple-500">{icon}</span>}
                    <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && <div className="p-4 space-y-4 bg-white dark:bg-gray-900">{children}</div>}
        </div>
    );
};

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ settings, onChange }) => {
    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors');

    return (
        <div className="space-y-6">
            {/* Tab Buttons */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                {(['colors', 'typography', 'layout'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab
                            ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content per tab */}
            {activeTab === 'colors' && (
                <div className="space-y-4">
                    <CollapsibleSection title="Core Colors" icon={<Palette className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorPickerInput
                                label="Button Color"
                                value={settings.buttonColor}
                                onChange={(val) => onChange({ ...settings, buttonColor: val })}
                            />
                            <ColorPickerInput
                                label="Button Text"
                                value={settings.textColor}
                                onChange={(val) => onChange({ ...settings, textColor: val })}
                            />
                            <ColorPickerInput
                                label="Background"
                                value={settings.backgroundColor}
                                onChange={(val) => onChange({ ...settings, backgroundColor: val })}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {activeTab === 'typography' && (
                <div className="space-y-4">
                    <CollapsibleSection title="Typography" icon={<Type className="w-4 h-4" />}>
                        <FontSelector
                            value={settings.fontFamily}
                            onChange={(val) => onChange({ ...settings, fontFamily: val })}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {activeTab === 'layout' && (
                <div className="space-y-4">
                    <CollapsibleSection title="Button Layout" icon={<LayoutGrid className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Button Style
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['solid', 'glass', 'outline'] as const).map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => onChange({ ...settings, buttonStyle: style })}
                                            className={`py-2 px-3 text-xs font-medium rounded-lg border-2 transition-all capitalize ${settings.buttonStyle === style
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Corner Radius ({settings.cornerRadius}px)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={settings.cornerRadius}
                                    onChange={(e) => onChange({ ...settings, cornerRadius: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
};

export default ThemeCustomizer;
