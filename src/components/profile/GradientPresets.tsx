/**
 * Gradient Presets Component
 *
 * 30+ gradient presets across 6 categories:
 * - Sunset: Warm, golden hour colors
 * - Ocean: Cool, aquatic themes
 * - Nature: Earthy, organic palettes
 * - Cosmic: Space, nebula inspired
 * - Minimal: Clean, simple gradients
 * - Vibrant: Bold, saturated colors
 *
 * @author SwazSolutions
 * @version 1.0.0
 */

import React, { useCallback } from 'react';
import { GradientSettings } from '../../types/profile.types';
import { gradientToCSS } from '../../utils/buttonStyleUtils';

interface GradientPresetsProps {
  onSelect: (gradient: GradientSettings) => void;
  currentGradient?: GradientSettings;
}

interface PresetCategory {
  id: string;
  name: string;
  presets: PresetGradient[];
}

interface PresetGradient {
  id: string;
  name: string;
  gradient: GradientSettings;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================================================
// PRESET DATA (30+ gradients across 6 categories)
// ============================================================================

const GRADIENT_PRESETS: PresetCategory[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    presets: [
      {
        id: 'sunset-warm',
        name: 'Golden Hour',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#FF6B6B', position: 0 },
            { id: generateId(), color: '#FFE66D', position: 100 },
          ],
        },
      },
      {
        id: 'sunset-coral',
        name: 'Coral Sky',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#FF9966', position: 0 },
            { id: generateId(), color: '#FF5E62', position: 100 },
          ],
        },
      },
      {
        id: 'sunset-mango',
        name: 'Mango',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#F2994A', position: 0 },
            { id: generateId(), color: '#F2C94C', position: 100 },
          ],
        },
      },
      {
        id: 'sunset-fire',
        name: 'Fire',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#FF416C', position: 0 },
            { id: generateId(), color: '#FF4B2B', position: 100 },
          ],
        },
      },
      {
        id: 'sunset-peach',
        name: 'Peach',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#FFECD2', position: 0 },
            { id: generateId(), color: '#FCB69F', position: 100 },
          ],
        },
      },
      {
        id: 'sunset-dusk',
        name: 'Dusk',
        gradient: {
          type: 'linear',
          angle: 160,
          stops: [
            { id: generateId(), color: '#7F00FF', position: 0 },
            { id: generateId(), color: '#E100FF', position: 100 },
          ],
        },
      },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    presets: [
      {
        id: 'ocean-deep',
        name: 'Deep Ocean',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#667eea', position: 0 },
            { id: generateId(), color: '#764ba2', position: 100 },
          ],
        },
      },
      {
        id: 'ocean-azure',
        name: 'Azure',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#2193b0', position: 0 },
            { id: generateId(), color: '#6dd5ed', position: 100 },
          ],
        },
      },
      {
        id: 'ocean-teal',
        name: 'Teal Wave',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#11998e', position: 0 },
            { id: generateId(), color: '#38ef7d', position: 100 },
          ],
        },
      },
      {
        id: 'ocean-cyan',
        name: 'Cyan Bliss',
        gradient: {
          type: 'linear',
          angle: 45,
          stops: [
            { id: generateId(), color: '#00C9FF', position: 0 },
            { id: generateId(), color: '#92FE9D', position: 100 },
          ],
        },
      },
      {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#2E3192', position: 0 },
            { id: generateId(), color: '#1BFFFF', position: 100 },
          ],
        },
      },
      {
        id: 'ocean-aqua',
        name: 'Aqua Marine',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#00B4DB', position: 0 },
            { id: generateId(), color: '#0083B0', position: 100 },
          ],
        },
      },
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    presets: [
      {
        id: 'nature-forest',
        name: 'Forest',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#134E5E', position: 0 },
            { id: generateId(), color: '#71B280', position: 100 },
          ],
        },
      },
      {
        id: 'nature-meadow',
        name: 'Meadow',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#56ab2f', position: 0 },
            { id: generateId(), color: '#a8e063', position: 100 },
          ],
        },
      },
      {
        id: 'nature-earth',
        name: 'Earth',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#8E2DE2', position: 0 },
            { id: generateId(), color: '#4A00E0', position: 100 },
          ],
        },
      },
      {
        id: 'nature-sage',
        name: 'Sage',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#D4FC79', position: 0 },
            { id: generateId(), color: '#96E6A1', position: 100 },
          ],
        },
      },
      {
        id: 'nature-moss',
        name: 'Moss',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#42275a', position: 0 },
            { id: generateId(), color: '#734b6d', position: 100 },
          ],
        },
      },
      {
        id: 'nature-autumn',
        name: 'Autumn',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#DA22FF', position: 0 },
            { id: generateId(), color: '#9733EE', position: 100 },
          ],
        },
      },
    ],
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    presets: [
      {
        id: 'cosmic-nebula',
        name: 'Nebula',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#833ab4', position: 0 },
            { id: generateId(), color: '#fd1d1d', position: 50 },
            { id: generateId(), color: '#fcb045', position: 100 },
          ],
        },
      },
      {
        id: 'cosmic-galaxy',
        name: 'Galaxy',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#0f0c29', position: 0 },
            { id: generateId(), color: '#302b63', position: 50 },
            { id: generateId(), color: '#24243e', position: 100 },
          ],
        },
      },
      {
        id: 'cosmic-aurora',
        name: 'Aurora',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#00c6ff', position: 0 },
            { id: generateId(), color: '#0072ff', position: 100 },
          ],
        },
      },
      {
        id: 'cosmic-stardust',
        name: 'Stardust',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#b721ff', position: 0 },
            { id: generateId(), color: '#21d4fd', position: 100 },
          ],
        },
      },
      {
        id: 'cosmic-purple',
        name: 'Purple Haze',
        gradient: {
          type: 'linear',
          angle: 45,
          stops: [
            { id: generateId(), color: '#cc2b5e', position: 0 },
            { id: generateId(), color: '#753a88', position: 100 },
          ],
        },
      },
      {
        id: 'cosmic-midnight',
        name: 'Midnight',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#232526', position: 0 },
            { id: generateId(), color: '#414345', position: 100 },
          ],
        },
      },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    presets: [
      {
        id: 'minimal-gray',
        name: 'Silver',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#bdc3c7', position: 0 },
            { id: generateId(), color: '#2c3e50', position: 100 },
          ],
        },
      },
      {
        id: 'minimal-mono',
        name: 'Monochrome',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#434343', position: 0 },
            { id: generateId(), color: '#000000', position: 100 },
          ],
        },
      },
      {
        id: 'minimal-soft',
        name: 'Soft Gray',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#E0EAFC', position: 0 },
            { id: generateId(), color: '#CFDEF3', position: 100 },
          ],
        },
      },
      {
        id: 'minimal-clean',
        name: 'Clean',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#ffffff', position: 0 },
            { id: generateId(), color: '#f5f7fa', position: 100 },
          ],
        },
      },
      {
        id: 'minimal-sand',
        name: 'Sand',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#C9D6FF', position: 0 },
            { id: generateId(), color: '#E2E2E2', position: 100 },
          ],
        },
      },
      {
        id: 'minimal-fog',
        name: 'Fog',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#757F9A', position: 0 },
            { id: generateId(), color: '#D7DDE8', position: 100 },
          ],
        },
      },
    ],
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    presets: [
      {
        id: 'vibrant-neon',
        name: 'Neon Nights',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#FF0099', position: 0 },
            { id: generateId(), color: '#493240', position: 100 },
          ],
        },
      },
      {
        id: 'vibrant-pink',
        name: 'Pink Pop',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#ec008c', position: 0 },
            { id: generateId(), color: '#fc6767', position: 100 },
          ],
        },
      },
      {
        id: 'vibrant-electric',
        name: 'Electric',
        gradient: {
          type: 'linear',
          angle: 45,
          stops: [
            { id: generateId(), color: '#000428', position: 0 },
            { id: generateId(), color: '#004e92', position: 100 },
          ],
        },
      },
      {
        id: 'vibrant-citrus',
        name: 'Citrus',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { id: generateId(), color: '#FDC830', position: 0 },
            { id: generateId(), color: '#F37335', position: 100 },
          ],
        },
      },
      {
        id: 'vibrant-berry',
        name: 'Berry',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { id: generateId(), color: '#8E2DE2', position: 0 },
            { id: generateId(), color: '#4A00E0', position: 100 },
          ],
        },
      },
      {
        id: 'vibrant-lime',
        name: 'Lade',
        gradient: {
          type: 'linear',
          angle: 90,
          stops: [
            { id: generateId(), color: '#1D976C', position: 0 },
            { id: generateId(), color: '#93F9B9', position: 100 },
          ],
        },
      },
    ],
  },
];

export const GradientPresets: React.FC<GradientPresetsProps> = ({ onSelect, currentGradient }) => {
  // Check if preset matches current gradient
  const isPresetSelected = useCallback((preset: GradientSettings) => {
    if (!currentGradient) return false;
    if (preset.type !== currentGradient.type) return false;
    if (preset.angle !== currentGradient.angle) return false;
    if (preset.position !== currentGradient.position) return false;
    if (preset.stops.length !== currentGradient.stops.length) return false;

    // Compare stops (order-agnostic)
    const sortedPresetStops = [...preset.stops].sort((a, b) => a.position - b.position);
    const sortedCurrentStops = [...currentGradient.stops].sort((a, b) => a.position - b.position);

    return sortedPresetStops.every((stop, i) => (
      stop.color === sortedCurrentStops[i].color &&
      stop.position === sortedCurrentStops[i].position
    ));
  }, [currentGradient]);

  return (
    <div className="space-y-6">
      {GRADIENT_PRESETS.map((category) => (
        <div key={category.id}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {category.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.presets.map((preset) => {
              const isSelected = isPresetSelected(preset.gradient);
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelect(preset.gradient)}
                  className="group relative"
                  title={preset.name}
                >
                  {/* Preview Card */}
                  <div
                    className={`aspect-square rounded-xl transition-all ${
                      isSelected
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'hover:scale-105 hover:shadow-lg'
                    }`}
                    style={{ background: gradientToCSS(preset.gradient) }}
                  />

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}

                  {/* Label */}
                  <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
                    {preset.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GradientPresets;
