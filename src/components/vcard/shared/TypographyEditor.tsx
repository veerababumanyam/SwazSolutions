/**
 * TypographyEditor - Complete typography configuration component
 * Controls font family, weight, size, color, and style options
 */

import React from 'react';
import { Typography } from '@/types/modernProfile.types';
import { Type as TypeIcon, CaseUpper, Italic, Underline } from 'lucide-react';
import ColorPicker from './ColorPicker';
import RangeSlider from './RangeSlider';
import ToggleGroup from './ToggleGroup';
import ToggleItem from './ToggleItem';

interface TypographyEditorProps {
  config: Typography;
  onChange: (config: Typography) => void;
  fonts?: Array<{ name: string; label: string }>;
  weights?: Array<{ value: string; label: string }>;
}

const DEFAULT_FONTS = [
  { name: 'Inter', label: 'Inter' },
  { name: 'DM Sans', label: 'DM Sans' },
  { name: 'Space Grotesk', label: 'Space Grotesk' },
  { name: 'Playfair Display', label: 'Playfair' },
  { name: 'Cinzel', label: 'Cinzel' },
  { name: 'Caveat', label: 'Caveat' },
  { name: 'EB Garamond', label: 'Garamond' },
  { name: 'Lora', label: 'Lora' },
  { name: 'Merriweather', label: 'Merriweather' },
];

const DEFAULT_WEIGHTS = [
  { value: 'normal', label: 'Regular' },
  { value: 'bold', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

const TypographyEditor: React.FC<TypographyEditorProps> = ({
  config,
  onChange,
  fonts = DEFAULT_FONTS,
  weights = DEFAULT_WEIGHTS,
}) => {
  return (
    <div className="space-y-5">
      {/* Font Family & Weight Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Font</label>
          <div className="relative">
            <select
              value={config.family}
              onChange={(e) => onChange({ ...config, family: e.target.value })}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white appearance-none focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {fonts.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <TypeIcon size={12} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</label>
          <div className="relative">
            <select
              value={config.weight}
              onChange={(e) => onChange({ ...config, weight: e.target.value as any })}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white appearance-none focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {weights.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <TypeIcon size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Color */}
      <ColorPicker
        label="Text Color"
        value={config.color}
        onChange={(val) => onChange({ ...config, color: val })}
      />

      {/* Size Slider */}
      <RangeSlider
        label="Size Scale"
        value={config.size}
        min={0.5}
        max={3.0}
        step={0.1}
        onChange={(val) => onChange({ ...config, size: val })}
        formatValue={(v) => `${v}x`}
      />

      {/* Letter Spacing */}
      {config.letterSpacing !== undefined && (
        <RangeSlider
          label="Letter Spacing"
          value={parseFloat(config.letterSpacing) || 0}
          min={-0.1}
          max={0.5}
          step={0.01}
          onChange={(val) => onChange({ ...config, letterSpacing: `${val}em` })}
          formatValue={(v) => `${v.toFixed(2)}em`}
        />
      )}

      {/* Style Toggles */}
      <ToggleGroup>
        <ToggleItem
          active={config.transform === 'uppercase'}
          onClick={() =>
            onChange({
              ...config,
              transform: config.transform === 'uppercase' ? 'none' : 'uppercase',
            })
          }
          icon={CaseUpper}
          title="Uppercase"
        />
        <ToggleItem
          active={config.style === 'italic'}
          onClick={() =>
            onChange({
              ...config,
              style: config.style === 'italic' ? 'normal' : 'italic',
            })
          }
          icon={Italic}
          title="Italic"
        />
        <ToggleItem
          active={config.decoration === 'underline'}
          onClick={() =>
            onChange({
              ...config,
              decoration: config.decoration === 'underline' ? 'none' : 'underline',
            })
          }
          icon={Underline}
          title="Underline"
        />
      </ToggleGroup>
    </div>
  );
};

export default TypographyEditor;
