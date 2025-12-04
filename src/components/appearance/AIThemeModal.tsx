/**
 * AI Theme Modal Component
 * 
 * A modal for users to input their preferences and generate
 * a custom theme using AI.
 */

import React, { useState, useCallback } from 'react';
import { generateAITheme, QUICK_THEME_PRESETS } from '../../agents/themeAgent';
import type { AIThemePrompt, AIThemeResponse, Theme } from '../../types/theme.types';
import { validateThemeAccessibility } from '../../utils/wcagValidator';

interface AIThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onThemeGenerated: (theme: Theme) => void;
    apiKey?: string;
}

// Preset mood options
const MOOD_OPTIONS = [
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'creative', label: 'Creative', emoji: '🎨' },
    { value: 'playful', label: 'Playful', emoji: '🎉' },
    { value: 'elegant', label: 'Elegant', emoji: '✨' },
    { value: 'minimal', label: 'Minimal', emoji: '📝' },
    { value: 'bold', label: 'Bold', emoji: '🔥' },
    { value: 'calm', label: 'Calm', emoji: '🌿' },
    { value: 'techy', label: 'Tech', emoji: '💻' },
];

// Preset style options
const STYLE_OPTIONS = [
    { value: 'gradient', label: 'Gradient', description: 'Vibrant color transitions' },
    { value: 'glass', label: 'Glass', description: 'Frosted glass effects' },
    { value: 'minimal', label: 'Minimal', description: 'Clean and simple' },
    { value: 'dark', label: 'Dark Mode', description: 'Rich dark backgrounds' },
    { value: 'aurora', label: 'Aurora', description: 'Soft flowing colors' },
];

// Color preference options
const COLOR_OPTIONS = [
    { value: 'blue', label: 'Blue', color: '#3B82F6' },
    { value: 'purple', label: 'Purple', color: '#8B5CF6' },
    { value: 'pink', label: 'Pink', color: '#EC4899' },
    { value: 'green', label: 'Green', color: '#10B981' },
    { value: 'orange', label: 'Orange', color: '#F97316' },
    { value: 'cyan', label: 'Cyan', color: '#06B6D4' },
    { value: 'warm', label: 'Warm Tones', color: 'linear-gradient(90deg, #F97316, #EF4444)' },
    { value: 'cool', label: 'Cool Tones', color: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' },
];

// Industry options
const INDUSTRY_OPTIONS = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Entertainment',
    'Fashion',
    'Food & Beverage',
    'Real Estate',
    'Consulting',
    'Art & Design',
    'Music',
    'Sports',
    'Other',
];

export const AIThemeModal: React.FC<AIThemeModalProps> = ({
    isOpen,
    onClose,
    onThemeGenerated,
    apiKey,
}) => {
    // Form state
    const [mood, setMood] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [colorPreference, setColorPreference] = useState<string>('');
    const [industry, setIndustry] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    
    // UI state
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedTheme, setGeneratedTheme] = useState<Theme | null>(null);
    const [wcagScore, setWcagScore] = useState<number | null>(null);

    // Reset form
    const resetForm = useCallback(() => {
        setMood('');
        setStyle('');
        setColorPreference('');
        setIndustry('');
        setDescription('');
        setError(null);
        setGeneratedTheme(null);
        setWcagScore(null);
    }, []);

    // Handle close
    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [onClose, resetForm]);

    // Apply quick preset
    const applyQuickPreset = useCallback((presetKey: string) => {
        const preset = QUICK_THEME_PRESETS[presetKey];
        if (preset) {
            setMood(preset.mood || '');
            setStyle(preset.style || '');
            setColorPreference(preset.colorPreference || '');
            setIndustry(preset.industry || '');
        }
    }, []);

    // Generate theme
    const handleGenerate = useCallback(async () => {
        if (!mood && !description) {
            setError('Please select a mood or provide a description');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedTheme(null);

        const prompt: AIThemePrompt = {
            mood,
            style,
            colorPreference,
            industry,
            description,
        };

        try {
            const response: AIThemeResponse = await generateAITheme(prompt, apiKey);

            if (response.success && response.theme) {
                setGeneratedTheme(response.theme);
                setWcagScore(response.wcagScore || null);
            } else {
                setError(response.message || 'Failed to generate theme');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    }, [mood, style, colorPreference, industry, description, apiKey]);

    // Apply generated theme
    const handleApplyTheme = useCallback(() => {
        if (generatedTheme) {
            onThemeGenerated(generatedTheme);
            handleClose();
        }
    }, [generatedTheme, onThemeGenerated, handleClose]);

    // Regenerate with same settings
    const handleRegenerate = useCallback(() => {
        setGeneratedTheme(null);
        handleGenerate();
    }, [handleGenerate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xl">✨</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                AI Theme Generator
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Describe your vision, let AI create it
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {!generatedTheme ? (
                        <>
                            {/* Quick Presets */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Quick Presets
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(QUICK_THEME_PRESETS).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => applyQuickPreset(key)}
                                            className="px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors capitalize"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mood / Vibe *
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {MOOD_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setMood(option.value)}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                mood === option.value
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{option.emoji}</div>
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {option.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Design Style
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {STYLE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setStyle(option.value)}
                                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                                                style === option.value
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {option.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Preference */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Color Preference
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setColorPreference(option.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${
                                                colorPreference === option.value
                                                    ? 'border-purple-500'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ background: option.color }}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {option.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Industry */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Industry (Optional)
                                </label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Select an industry...</option>
                                    {INDUSTRY_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt.toLowerCase()}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Description */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe any specific requirements, colors, or inspiration..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Theme Preview */
                        <div className="space-y-6">
                            {/* Preview Card */}
                            <div
                                className="rounded-2xl p-6 overflow-hidden"
                                style={{
                                    background: generatedTheme.wallpaper || generatedTheme.colors.background,
                                }}
                            >
                                <div
                                    className="rounded-xl p-4"
                                    style={{ backgroundColor: generatedTheme.colors.background }}
                                >
                                    <h3
                                        className="text-xl font-bold mb-2"
                                        style={{ color: generatedTheme.colors.text }}
                                    >
                                        {generatedTheme.name}
                                    </h3>
                                    <p
                                        className="text-sm mb-4"
                                        style={{ color: generatedTheme.colors.textSecondary }}
                                    >
                                        Your AI-generated theme is ready!
                                    </p>
                                    
                                    {/* Color Swatches */}
                                    <div className="flex gap-2 mb-4">
                                        {['primary', 'secondary', 'accent'].map((key) => (
                                            <div
                                                key={key}
                                                className="w-10 h-10 rounded-lg shadow-sm"
                                                style={{ backgroundColor: generatedTheme.colors[key as keyof typeof generatedTheme.colors] }}
                                                title={key}
                                            />
                                        ))}
                                    </div>
                                    
                                    {/* Sample Button */}
                                    <button
                                        className="px-4 py-2 rounded-lg text-white font-medium"
                                        style={{
                                            backgroundColor: generatedTheme.colors.primary,
                                            borderRadius: generatedTheme.layout.borderRadius.md,
                                        }}
                                    >
                                        Sample Button
                                    </button>
                                </div>
                            </div>

                            {/* WCAG Score */}
                            {wcagScore !== null && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                            wcagScore >= 80
                                                ? 'bg-green-500'
                                                : wcagScore >= 60
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                        }`}
                                    >
                                        {wcagScore}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            WCAG 2.1 AA Score
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {wcagScore >= 80
                                                ? 'Excellent accessibility'
                                                : wcagScore >= 60
                                                ? 'Good accessibility'
                                                : 'May need adjustments'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {!generatedTheme ? (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || (!mood && !description)}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span>
                                        Generate Theme
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRegenerate}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Regenerate
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setGeneratedTheme(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleApplyTheme}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                                >
                                    <span>✓</span>
                                    Apply Theme
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIThemeModal;
