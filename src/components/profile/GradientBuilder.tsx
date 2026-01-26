/**
 * Gradient Builder Component
 *
 * Professional gradient customization with multi-stop support
 * Features:
 * - Linear/Radial toggle
 * - Angle slider (0-360°) for linear gradients
 * - 2-5 color stops with position control
 * - Draggable stop reordering
 * - Live gradient preview bar
 * - CSS output display
 *
 * @author SwazSolutions
 * @version 1.0.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Eye, Code, Copy, Check, Plus, Trash2, GripVertical } from 'lucide-react';
import { GradientSettings, GradientStop } from '../../types/profile.types';
import { gradientToCSS } from '../../utils/buttonStyleUtils';
import { ColorPickerInput } from './ColorPickerInput';

interface GradientBuilderProps {
  gradient: GradientSettings;
  onChange: (gradient: GradientSettings) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const GradientBuilder: React.FC<GradientBuilderProps> = ({ gradient, onChange }) => {
  const [copied, setCopied] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Generate CSS for preview
  const gradientCSS = useMemo(() => gradientToCSS(gradient), [gradient]);

  // Handle gradient type change
  const handleTypeChange = useCallback((type: 'linear' | 'radial') => {
    onChange({ ...gradient, type });
  }, [gradient, onChange]);

  // Handle angle change (linear only)
  const handleAngleChange = useCallback((angle: number) => {
    onChange({ ...gradient, angle });
  }, [gradient, onChange]);

  // Handle position change (radial only)
  const handlePositionChange = useCallback((position: GradientSettings['position']) => {
    onChange({ ...gradient, position });
  }, [gradient, onChange]);

  // Add new color stop
  const addStop = useCallback(() => {
    if (gradient.stops.length >= 5) return;
    const newStop: GradientStop = {
      id: generateId(),
      color: '#888888',
      position: 50,
    };
    // Insert in middle
    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
    const insertIndex = sortedStops.findIndex(s => s.position > 50);
    const newStops = insertIndex >= 0
      ? [...gradient.stops, newStop]
      : [...gradient.stops, newStop];
    onChange({ ...gradient, stops: newStops });
  }, [gradient, onChange]);

  // Remove color stop
  const removeStop = useCallback((stopId: string) => {
    if (gradient.stops.length <= 2) return; // Minimum 2 stops
    onChange({
      ...gradient,
      stops: gradient.stops.filter(s => s.id !== stopId),
    });
  }, [gradient, onChange]);

  // Update stop color
  const updateStopColor = useCallback((stopId: string, color: string) => {
    onChange({
      ...gradient,
      stops: gradient.stops.map(s => s.id === stopId ? { ...s, color } : s),
    });
  }, [gradient, onChange]);

  // Update stop position
  const updateStopPosition = useCallback((stopId: string, position: number) => {
    onChange({
      ...gradient,
      stops: gradient.stops.map(s => s.id === stopId ? { ...s, position } : s),
    });
  }, [gradient, onChange]);

  // Handle drag start
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStops = [...gradient.stops];
    const [removed] = newStops.splice(draggedIndex, 1);
    newStops.splice(index, 0, removed);

    onChange({ ...gradient, stops: newStops });
    setDraggedIndex(index);
  }, [draggedIndex, gradient, onChange]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // Copy CSS to clipboard
  const handleCopyCSS = useCallback(() => {
    navigator.clipboard.writeText(`background: ${gradientCSS};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [gradientCSS]);

  // Sort stops for display
  const sortedStops = useMemo(() => {
    return [...gradient.stops].sort((a, b) => a.position - b.position);
  }, [gradient.stops]);

  return (
    <div className="space-y-6">
      {/* Live Gradient Preview Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</h3>
        </div>
        <div
          className="w-full h-20 rounded-xl shadow-inner"
          style={{ background: gradientCSS }}
        />
      </div>

      {/* Gradient Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gradient Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTypeChange('linear')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              gradient.type === 'linear'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => handleTypeChange('radial')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              gradient.type === 'radial'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Angle Control (Linear Only) */}
      {gradient.type === 'linear' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Angle
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {gradient.angle ?? 135}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={gradient.angle ?? 135}
            onChange={(e) => handleAngleChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0°</span>
            <span>180°</span>
            <span>360°</span>
          </div>
          {/* Visual angle indicator */}
          <div className="flex justify-center mt-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 relative"
              style={{
                background: `conic-gradient(from ${-(gradient.angle ?? 135) + 90}deg, #3B82F6 0deg, transparent 60deg, transparent 300deg, #3B82F6 360deg)`,
              }}
            >
              <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Position Control (Radial Only) */}
      {gradient.type === 'radial' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['center', 'top', 'bottom', 'left', 'right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => handlePositionChange(pos)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize ${
                  gradient.position === pos
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Stops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Color Stops</h3>
          <button
            onClick={addStop}
            disabled={gradient.stops.length >= 5}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stop</span>
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {gradient.stops.length}/5 stops
        </div>

        {/* Stops List */}
        <div className="space-y-3">
          {sortedStops.map((stop, index) => (
            <div
              key={stop.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all ${
                draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing pt-1">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Stop Content */}
                <div className="flex-1 space-y-3">
                  {/* Color Picker */}
                  <ColorPickerInput
                    label={`Stop ${index + 1}`}
                    value={stop.color}
                    onChange={(color) => updateStopColor(stop.id, color)}
                  />

                  {/* Position Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Position
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {stop.position}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={stop.position}
                      onChange={(e) => updateStopPosition(stop.id, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={gradient.stops.length <= 2}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                  title="Remove stop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div className="p-4 bg-gray-900 dark:bg-black rounded-xl">
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
          background: {gradientCSS};
        </code>
      </div>
    </div>
  );
};

export default GradientBuilder;
