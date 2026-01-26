/**
 * Shadow Editor Component
 *
 * Professional shadow customization with live preview
 * Features:
 * - Independent offset X/Y, blur, spread, opacity control
 * - Color picker with presets
 * - Inset toggle for inner shadows
 * - Live preview card
 * - CSS output display
 *
 * @author SwazSolutions
 * @version 1.0.0
 */

import React, { useCallback, useMemo } from 'react';
import { Eye, Code, Copy, Check } from 'lucide-react';
import { CustomShadowSettings } from '../../types/profile.types';
import { shadowToCSS } from '../../utils/buttonStyleUtils';
import { ColorPickerInput } from './ColorPickerInput';

interface ShadowEditorProps {
  shadow: CustomShadowSettings;
  onChange: (shadow: CustomShadowSettings) => void;
}

export const ShadowEditor: React.FC<ShadowEditorProps> = ({ shadow, onChange }) => {
  const [copied, setCopied] = React.useState(false);

  // Generate CSS for preview
  const shadowCSS = useMemo(() => shadowToCSS(shadow), [shadow]);

  // Handle value updates
  const updateValue = useCallback(<K extends keyof CustomShadowSettings>(
    key: K,
    value: CustomShadowSettings[K]
  ) => {
    onChange({ ...shadow, [key]: value });
  }, [shadow, onChange]);

  // Copy CSS to clipboard
  const handleCopyCSS = useCallback(() => {
    navigator.clipboard.writeText(`box-shadow: ${shadowCSS};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shadowCSS]);

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</h3>
        </div>
        <div
          className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center"
        >
          <div
            className="w-24 h-24 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center"
            style={{ boxShadow: shadowCSS }}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
          </div>
        </div>
      </div>

      {/* Offset X Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Offset X
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {shadow.offsetX}px
          </span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          step={1}
          value={shadow.offsetX}
          onChange={(e) => updateValue('offsetX', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>-50px</span>
          <span>0</span>
          <span>50px</span>
        </div>
      </div>

      {/* Offset Y Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Offset Y
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {shadow.offsetY}px
          </span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          step={1}
          value={shadow.offsetY}
          onChange={(e) => updateValue('offsetY', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>-50px</span>
          <span>0</span>
          <span>50px</span>
        </div>
      </div>

      {/* Blur Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Blur
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {shadow.blur}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={shadow.blur}
          onChange={(e) => updateValue('blur', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0px</span>
          <span>50</span>
          <span>100px</span>
        </div>
      </div>

      {/* Spread Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Spread
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {shadow.spread}px
          </span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          step={1}
          value={shadow.spread}
          onChange={(e) => updateValue('spread', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>-50px</span>
          <span>0</span>
          <span>50px</span>
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Opacity
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {shadow.opacity}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={shadow.opacity}
          onChange={(e) => updateValue('opacity', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>50</span>
          <span>100%</span>
        </div>
      </div>

      {/* Color Picker */}
      <ColorPickerInput
        label="Shadow Color"
        value={shadow.color}
        onChange={(color) => updateValue('color', color)}
      />

      {/* Inset Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Inner Shadow (Inset)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Creates shadow inside the element
          </p>
        </div>
        <button
          onClick={() => updateValue('inset', !shadow.inset)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            shadow.inset ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
              shadow.inset ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* CSS Output */}
      <div className="mt-6 p-4 bg-gray-900 dark:bg-black rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase">CSS Output</span>
          </div>
          <button
            onClick={handleCopyCSS}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <code className="block text-xs text-green-400 font-mono break-all">
          box-shadow: {shadowCSS};
        </code>
      </div>
    </div>
  );
};

export default ShadowEditor;
