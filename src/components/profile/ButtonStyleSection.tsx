/**
 * Button Style Section Component
 *
 * Integrates all button customization controls:
 * - Style selector (solid/glass/outline/minimal)
 * - Shadow: Preset gallery OR custom editor
 * - Background: Solid color OR gradient builder
 * - Border: Width slider + color picker
 * - Hover: Scale + brightness sliders
 * - Live preview card
 *
 * @author SwazSolutions
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Palette,
  Sparkles,
  Border,
  MousePointer,
  Eye,
  Settings,
} from 'lucide-react';
import { AppearanceSettings, ButtonEnhancementSettings } from '../../types/profile.types';
import { DEFAULT_BUTTON_ENHANCEMENT } from '../../utils/buttonStyleUtils';
import { ColorPickerInput } from './ColorPickerInput';
import { ShadowEditor } from './ShadowEditor';
import { ShadowPresets } from './ShadowPresets';
import { GradientBuilder } from './GradientBuilder';
import { GradientPresets } from './GradientPresets';

interface ButtonStyleSectionProps {
  settings: AppearanceSettings;
  onChange: (settings: AppearanceSettings) => void;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
};

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, unit = '', onChange }) => {
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

export const ButtonStyleSection: React.FC<ButtonStyleSectionProps> = ({ settings, onChange }) => {
  // Get button enhancement settings (with defaults)
  const buttonEnhancement: ButtonEnhancementSettings = useMemo(() => {
    const existing = (settings as any).buttonEnhancement;
    if (existing) {
      return {
        ...DEFAULT_BUTTON_ENHANCEMENT,
        ...existing,
      };
    }
    return DEFAULT_BUTTON_ENHANCEMENT;
  }, [settings]);

  // Update button enhancement settings
  const updateButtonEnhancement = useCallback((updates: Partial<ButtonEnhancementSettings>) => {
    const newEnhancement = { ...buttonEnhancement, ...updates };
    onChange({
      ...settings,
      buttonEnhancement: newEnhancement,
    } as any);
  }, [buttonEnhancement, settings, onChange]);

  // Button preview styles
  const previewStyles = useMemo(() => {
    const base: React.CSSProperties = {
      borderRadius: `${settings.cornerRadius}px`,
      fontFamily: settings.fontFamily,
      padding: '12px 24px',
      fontWeight: '600',
      display: 'inline-block',
      transition: 'all 0.2s ease',
    };

    // Background
    let background = settings.buttonColor;
    if (buttonEnhancement.useGradient && buttonEnhancement.gradient.stops.length > 0) {
      const stops = buttonEnhancement.gradient.stops
        .sort((a, b) => a.position - b.position)
        .map(s => `${s.color} ${s.position}%`)
        .join(', ');
      background = buttonEnhancement.gradient.type === 'linear'
        ? `linear-gradient(${buttonEnhancement.gradient.angle ?? 135}deg, ${stops})`
        : `radial-gradient(circle at ${buttonEnhancement.gradient.position ?? 'center'}, ${stops})`;
    }

    // Shadow
    let boxShadow = 'none';
    if (buttonEnhancement.useCustomShadow) {
      const s = buttonEnhancement.customShadow;
      const alpha = Math.max(0, Math.min(100, s.opacity)) / 100;
      boxShadow = `${s.inset ? 'inset ' : ''}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
    }

    // Border
    const border = buttonEnhancement.borderWidth > 0
      ? `${buttonEnhancement.borderWidth}px solid ${buttonEnhancement.borderColor}`
      : undefined;

    return {
      ...base,
      backgroundColor: buttonEnhancement.useGradient ? undefined : background,
      backgroundImage: buttonEnhancement.useGradient ? background : undefined,
      boxShadow,
      border,
      color: settings.textColor,
    };
  }, [settings, buttonEnhancement]);

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <button style={previewStyles}>
            Sample Button
          </button>
        </div>
      </div>

      {/* Button Style Selector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Button Style</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['solid', 'glass', 'outline', 'minimal'] as const).map((style) => (
            <button
              key={style}
              onClick={() => onChange({ ...settings, buttonStyle: style })}
              className={`p-3 rounded-lg border-2 transition-all capitalize ${
                settings.buttonStyle === style
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Shadow Section */}
      <CollapsibleSection
        title="Custom Shadow"
        icon={<Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* Enable Custom Shadow Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Use Custom Shadow
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Override default shadow styles
              </p>
            </div>
            <button
              onClick={() => updateButtonEnhancement({ useCustomShadow: !buttonEnhancement.useCustomShadow })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                buttonEnhancement.useCustomShadow ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  buttonEnhancement.useCustomShadow ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {buttonEnhancement.useCustomShadow && (
            <>
              {/* Presets vs Custom Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => updateButtonEnhancement({ showShadowPresets: true })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    (buttonEnhancement as any).showShadowPresets
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => updateButtonEnhancement({ showShadowPresets: false })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    !(buttonEnhancement as any).showShadowPresets
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Presets Gallery or Custom Editor */}
              {(buttonEnhancement as any).showShadowPresets ? (
                <ShadowPresets
                  onSelect={(shadow) => updateButtonEnhancement({ customShadow: shadow })}
                  currentShadow={buttonEnhancement.customShadow}
                />
              ) : (
                <ShadowEditor
                  shadow={buttonEnhancement.customShadow}
                  onChange={(shadow) => updateButtonEnhancement({ customShadow: shadow })}
                />
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Gradient Background Section */}
      <CollapsibleSection
        title="Gradient Background"
        icon={<Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* Enable Gradient Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Use Gradient Background
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Replace solid color with gradient
              </p>
            </div>
            <button
              onClick={() => updateButtonEnhancement({ useGradient: !buttonEnhancement.useGradient })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                buttonEnhancement.useGradient ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  buttonEnhancement.useGradient ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {buttonEnhancement.useGradient && (
            <>
              {/* Presets vs Custom Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => updateButtonEnhancement({ showGradientPresets: true })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    (buttonEnhancement as any).showGradientPresets
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => updateButtonEnhancement({ showGradientPresets: false })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    !(buttonEnhancement as any).showGradientPresets
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Presets Gallery or Custom Builder */}
              {(buttonEnhancement as any).showGradientPresets ? (
                <GradientPresets
                  onSelect={(gradient) => updateButtonEnhancement({ gradient })}
                  currentGradient={buttonEnhancement.gradient}
                />
              ) : (
                <GradientBuilder
                  gradient={buttonEnhancement.gradient}
                  onChange={(gradient) => updateButtonEnhancement({ gradient })}
                />
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Border Section */}
      <CollapsibleSection
        title="Border"
        icon={<Border className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
      >
        <div className="space-y-4">
          <SliderControl
            label="Border Width"
            value={buttonEnhancement.borderWidth}
            min={0}
            max={10}
            unit="px"
            onChange={(value) => updateButtonEnhancement({ borderWidth: value })}
          />

          {buttonEnhancement.borderWidth > 0 && (
            <ColorPickerInput
              label="Border Color"
              value={buttonEnhancement.borderColor}
              onChange={(color) => updateButtonEnhancement({ borderColor: color })}
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Hover Effects Section */}
      <CollapsibleSection
        title="Hover Effects"
        icon={<MousePointer className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
      >
        <div className="space-y-4">
          <SliderControl
            label="Hover Scale"
            value={buttonEnhancement.hoverScale}
            min={90}
            max={110}
            unit="%"
            onChange={(value) => updateButtonEnhancement({ hoverScale: value })}
          />

          <SliderControl
            label="Hover Brightness"
            value={buttonEnhancement.hoverBrightness}
            min={80}
            max={120}
            unit="%"
            onChange={(value) => updateButtonEnhancement({ hoverBrightness: value })}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ButtonStyleSection;
