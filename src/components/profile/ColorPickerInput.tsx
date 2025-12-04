/**
 * ColorPickerInput Component
 * 
 * Mobile-first color picker with touch-friendly interface.
 * Features:
 * - 44px minimum touch targets for accessibility
 * - Bottom sheet modal on mobile for better reach
 * - Dropdown on desktop for quick access
 * - Preset color swatches with larger touch targets on mobile
 * - Native color picker integration
 * - Dark mode support
 * 
 * @author SwazSolutions
 * @version 2.0.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

/**
 * Custom hook to detect if device is mobile based on screen width
 * Uses 640px breakpoint (Tailwind's sm) as threshold
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Sync input value with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle click outside to close picker (desktop only)
  useEffect(() => {
    if (isMobile) return; // Skip for mobile - uses modal with explicit close
    
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (isMobile && showPicker) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, showPicker]);

  // Handle hex input change with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color (with or without #, 3 or 6 digits)
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    } else if (/^#[0-9A-Fa-f]{3}$/.test(newValue)) {
      // Convert 3-digit hex to 6-digit
      const expanded = `#${newValue[1]}${newValue[1]}${newValue[2]}${newValue[2]}${newValue[3]}${newValue[3]}`;
      onChange(expanded);
    }
  }, [onChange]);

  // Handle native color picker change
  const handleColorPickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // Handle preset color selection
  const handlePresetSelect = useCallback((color: string) => {
    setInputValue(color);
    onChange(color);
    setShowPicker(false);
  }, [onChange]);

  // Preset colors - common palette
  const presetColors = useMemo(() => [
    '#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981', 
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937',
    '#14B8A6', '#6366F1', '#F97316', '#84CC16', '#06B6D4',
  ], []);

  // Render the color picker content (shared between mobile and desktop)
  const renderPickerContent = () => (
    <>
      {/* Native Color Picker - larger on mobile */}
      <div className="mb-4">
        <input
          type="color"
          value={value}
          onChange={handleColorPickerChange}
          className="w-full h-28 sm:h-32 rounded-xl cursor-pointer border-0 touch-manipulation"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>

      {/* Preset Colors - 44px min touch targets on mobile */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Preset colors</p>
        <div className="grid grid-cols-5 gap-3 sm:gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetSelect(color)}
              className={`w-11 h-11 sm:w-8 sm:h-8 rounded-xl sm:rounded-lg border-2 transition-all active:scale-95 ${
                value.toLowerCase() === color.toLowerCase()
                  ? 'border-purple-500 ring-2 ring-purple-300 dark:ring-purple-700 scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Current Value Display */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Selected:</span>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg border border-gray-300 dark:border-gray-600" 
            style={{ backgroundColor: value }} 
          />
          <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {value}
          </code>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative" ref={pickerRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      {/* Input Row - 44px min height for touch targets */}
      <div className="flex items-center gap-3">
        {/* Color Preview Button - 44px touch target */}
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg border-2 border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all active:scale-95 touch-manipulation"
          style={{ backgroundColor: value }}
          title="Click to pick color"
          aria-label={`Current color: ${value}. Click to change.`}
          aria-expanded={showPicker}
        />
        
        {/* Hex Input - larger padding for touch */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1 px-4 py-3 sm:py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-lg text-base sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[48px] sm:min-h-0"
          aria-label={`${label} hex value`}
        />
      </div>

      {/* 
        Color Picker Modal/Dropdown
        Mobile: Bottom sheet modal with backdrop
        Desktop: Dropdown positioned below input
      */}
      {showPicker && (
        <>
          {isMobile ? (
            // Mobile: Bottom Sheet Modal
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={() => setShowPicker(false)}
                aria-hidden="true"
              />
              
              {/* Bottom Sheet */}
              <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl animate-slide-up safe-area-inset-bottom">
                {/* Handle bar for visual affordance */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                
                {/* Header with close button */}
                <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {label}
                  </h3>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close color picker"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Picker Content */}
                <div className="px-6 py-4 pb-8 max-h-[70vh] overflow-y-auto">
                  {renderPickerContent()}
                </div>
              </div>
            </>
          ) : (
            // Desktop: Dropdown
            <div className="absolute z-50 top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72 animate-fade-in">
              {renderPickerContent()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ColorPickerInput;
