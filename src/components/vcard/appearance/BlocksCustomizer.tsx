/**
 * BlocksCustomizer - Configure button styles and section headers
 * Controls button appearance (shape, colors, border) and header typography
 */

import React from 'react';
import { Theme, ButtonStyle } from '@/types/modernProfile.types';
import { MousePointer2, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader, ColorPicker, RangeSlider, TypographyEditor } from '../shared';

interface BlocksCustomizerProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const BUTTON_SHAPES = ['rounded', 'pill', 'square', 'glass', 'outline'] as const;

const BlocksCustomizer: React.FC<BlocksCustomizerProps> = ({ theme, onThemeChange }) => {
  const updateButtons = (key: keyof ButtonStyle, val: any) => {
    onThemeChange({
      ...theme,
      buttons: { ...theme.buttons, [key]: val },
    });
  };

  const updateHeaders = (newConfig: any) => {
    onThemeChange({
      ...theme,
      headers: newConfig,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-10"
    >
      {/* Buttons Configuration */}
      <div className="space-y-6">
        <SectionHeader icon={MousePointer2} title="Buttons" subtitle="Button style and colors" />

        {/* Button Shape Selector */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Shape
          </label>
          <div className="grid grid-cols-5 gap-2">
            {BUTTON_SHAPES.map((s) => (
              <button
                key={s}
                onClick={() => updateButtons('shape', s)}
                className={`h-10 border rounded-lg flex items-center justify-center transition-all ${
                  theme.buttons.shape === s
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:border-gray-400'
                }`}
                title={s}
              >
                <div
                  className={`w-4 h-4 border-2 border-current ${
                    s === 'rounded'
                      ? 'rounded-md'
                      : s === 'pill'
                        ? 'rounded-full'
                        : s === 'square'
                          ? 'rounded-none'
                          : 'rounded-sm'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Button Colors */}
        <div className="space-y-1">
          <ColorPicker
            label="Background"
            value={theme.buttons.backgroundColor}
            onChange={(v) => updateButtons('backgroundColor', v)}
          />
          <ColorPicker
            label="Text"
            value={theme.buttons.textColor}
            onChange={(v) => updateButtons('textColor', v)}
          />
          <ColorPicker
            label="Border"
            value={theme.buttons.borderColor}
            onChange={(v) => updateButtons('borderColor', v)}
          />
          {theme.buttons.shadowColor && (
            <ColorPicker
              label="Shadow"
              value={theme.buttons.shadowColor}
              onChange={(v) => updateButtons('shadowColor', v)}
            />
          )}
        </div>

        {/* Border Width */}
        <RangeSlider
          label="Border Width"
          value={theme.buttons.borderWidth}
          min={0}
          max={4}
          step={0.5}
          onChange={(v) => updateButtons('borderWidth', v)}
          formatValue={(v) => `${v}px`}
        />
      </div>

      {/* Headers Configuration */}
      <div>
        <SectionHeader icon={Type} title="Section Headers" subtitle="Header typography" />
        <TypographyEditor config={theme.headers} onChange={updateHeaders} />
      </div>
    </motion.div>
  );
};

export default BlocksCustomizer;
