/**
 * ColorPicker - Color input with visual swatch preview
 * Displays hex value and interactive color selector
 */

import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showHex?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, showHex = true }) => (
  <div className="flex items-center justify-between py-2 group">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
      {label}
    </span>
    <div className="flex items-center gap-3">
      {showHex && (
        <span className="text-[10px] font-mono text-gray-400 dark:text-white/30 uppercase hidden sm:block">
          {value}
        </span>
      )}
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/20 shadow-sm transition-transform hover:scale-110 active:scale-95">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-[-50%] w-[200%] h-[200%] p-0 cursor-pointer border-none"
        />
      </div>
    </div>
  </div>
);

export default ColorPicker;
