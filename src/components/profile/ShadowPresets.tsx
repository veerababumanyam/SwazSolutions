/**
 * Shadow Presets Component
 *
 * 20+ shadow presets across 5 categories:
 * - Elevation: floating, raised, stacked
 * - Inset: inset-subtle, inset-deep
 * - Glow: neon-glow, soft-glow, colored-glow
 * - Hard Edge: brutalist, retro, stamp
 * - Natural: drop-shadow, contact-sheet
 *
 * @author SwazSolutions
 * @version 1.0.0
 */

import React, { useCallback } from 'react';
import { CustomShadowSettings } from '../../types/profile.types';

interface ShadowPresetsProps {
  onSelect: (shadow: CustomShadowSettings) => void;
  currentShadow?: CustomShadowSettings;
}

interface PresetCategory {
  id: string;
  name: string;
  presets: PresetShadow[];
}

interface PresetShadow {
  id: string;
  name: string;
  shadow: CustomShadowSettings;
}

// ============================================================================
// PRESET DATA (20+ shadows across 5 categories)
// ============================================================================

const SHADOW_PRESETS: PresetCategory[] = [
  {
    id: 'elevation',
    name: 'Elevation',
    presets: [
      {
        id: 'floating',
        name: 'Floating',
        shadow: {
          offsetX: 0,
          offsetY: -8,
          blur: 16,
          spread: 0,
          color: '#000000',
          opacity: 15,
          inset: false,
        },
      },
      {
        id: 'raised',
        name: 'Raised',
        shadow: {
          offsetX: 0,
          offsetY: 4,
          blur: 12,
          spread: 0,
          color: '#000000',
          opacity: 20,
          inset: false,
        },
      },
      {
        id: 'stacked',
        name: 'Stacked',
        shadow: {
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          spread: 0,
          color: '#000000',
          opacity: 10,
          inset: false,
        },
      },
      {
        id: 'elevated',
        name: 'Elevated',
        shadow: {
          offsetX: 0,
          offsetY: 10,
          blur: 20,
          spread: -5,
          color: '#000000',
          opacity: 18,
          inset: false,
        },
      },
      {
        id: 'lifted',
        name: 'Lifted',
        shadow: {
          offsetX: 0,
          offsetY: 6,
          blur: 14,
          spread: 2,
          color: '#000000',
          opacity: 12,
          inset: false,
        },
      },
    ],
  },
  {
    id: 'inset',
    name: 'Inset',
    presets: [
      {
        id: 'inset-subtle',
        name: 'Inset Subtle',
        shadow: {
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          spread: 0,
          color: '#000000',
          opacity: 15,
          inset: true,
        },
      },
      {
        id: 'inset-deep',
        name: 'Inset Deep',
        shadow: {
          offsetX: 0,
          offsetY: 4,
          blur: 8,
          spread: -2,
          color: '#000000',
          opacity: 30,
          inset: true,
        },
      },
      {
        id: 'inset-soft',
        name: 'Inset Soft',
        shadow: {
          offsetX: 0,
          offsetY: 1,
          blur: 3,
          spread: 0,
          color: '#000000',
          opacity: 10,
          inset: true,
        },
      },
      {
        id: 'inset-dramatic',
        name: 'Inset Dramatic',
        shadow: {
          offsetX: 0,
          offsetY: 6,
          blur: 12,
          spread: -4,
          color: '#000000',
          opacity: 40,
          inset: true,
        },
      },
    ],
  },
  {
    id: 'glow',
    name: 'Glow',
    presets: [
      {
        id: 'neon-glow',
        name: 'Neon Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 20,
          spread: 0,
          color: '#8B5CF6',
          opacity: 60,
          inset: false,
        },
      },
      {
        id: 'soft-glow',
        name: 'Soft Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 16,
          spread: 0,
          color: '#FFFFFF',
          opacity: 30,
          inset: false,
        },
      },
      {
        id: 'colored-glow-blue',
        name: 'Blue Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 18,
          spread: 0,
          color: '#3B82F6',
          opacity: 50,
          inset: false,
        },
      },
      {
        id: 'colored-glow-pink',
        name: 'Pink Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 18,
          spread: 0,
          color: '#EC4899',
          opacity: 50,
          inset: false,
        },
      },
      {
        id: 'colored-glow-green',
        name: 'Green Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 18,
          spread: 0,
          color: '#10B981',
          opacity: 50,
          inset: false,
        },
      },
      {
        id: 'colored-glow-orange',
        name: 'Orange Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 18,
          spread: 0,
          color: '#F97316',
          opacity: 50,
          inset: false,
        },
      },
      {
        id: 'warm-glow',
        name: 'Warm Glow',
        shadow: {
          offsetX: 0,
          offsetY: 0,
          blur: 24,
          spread: 0,
          color: '#FBBF24',
          opacity: 40,
          inset: false,
        },
      },
    ],
  },
  {
    id: 'hard-edge',
    name: 'Hard Edge',
    presets: [
      {
        id: 'brutalist',
        name: 'Brutalist',
        shadow: {
          offsetX: 4,
          offsetY: 4,
          blur: 0,
          spread: 0,
          color: '#000000',
          opacity: 100,
          inset: false,
        },
      },
      {
        id: 'retro',
        name: 'Retro',
        shadow: {
          offsetX: 3,
          offsetY: 3,
          blur: 0,
          spread: 0,
          color: '#000000',
          opacity: 80,
          inset: false,
        },
      },
      {
        id: 'stamp',
        name: 'Stamp',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          blur: 0,
          spread: 0,
          color: '#000000',
          opacity: 100,
          inset: false,
        },
      },
      {
        id: 'hard-offset',
        name: 'Hard Offset',
        shadow: {
          offsetX: 6,
          offsetY: 6,
          blur: 0,
          spread: -2,
          color: '#000000',
          opacity: 100,
          inset: false,
        },
      },
      {
        id: 'neo-brutalist',
        name: 'Neo Brutalist',
        shadow: {
          offsetX: 8,
          offsetY: 8,
          blur: 0,
          spread: -3,
          color: '#000000',
          opacity: 90,
          inset: false,
        },
      },
    ],
  },
  {
    id: 'natural',
    name: 'Natural',
    presets: [
      {
        id: 'drop-shadow',
        name: 'Drop Shadow',
        shadow: {
          offsetX: 0,
          offsetY: 2,
          blur: 6,
          spread: 0,
          color: '#000000',
          opacity: 20,
          inset: false,
        },
      },
      {
        id: 'contact-sheet',
        name: 'Contact Sheet',
        shadow: {
          offsetX: 0,
          offsetY: 1,
          blur: 2,
          spread: 0,
          color: '#000000',
          opacity: 25,
          inset: false,
        },
      },
      {
        id: 'paper',
        name: 'Paper',
        shadow: {
          offsetX: 0,
          offsetY: 1,
          blur: 3,
          spread: 0,
          color: '#000000',
          opacity: 12,
          inset: false,
        },
      },
      {
        id: 'diffused',
        name: 'Diffused',
        shadow: {
          offsetX: 0,
          offsetY: 8,
          blur: 16,
          spread: -4,
          color: '#000000',
          opacity: 10,
          inset: false,
        },
      },
      {
        id: 'ambient',
        name: 'Ambient',
        shadow: {
          offsetX: 0,
          offsetY: 4,
          blur: 12,
          spread: 0,
          color: '#000000',
          opacity: 8,
          inset: false,
        },
      },
    ],
  },
];

export const ShadowPresets: React.FC<ShadowPresetsProps> = ({ onSelect, currentShadow }) => {
  // Check if preset matches current shadow
  const isPresetSelected = useCallback((preset: CustomShadowSettings) => {
    if (!currentShadow) return false;
    return (
      preset.offsetX === currentShadow.offsetX &&
      preset.offsetY === currentShadow.offsetY &&
      preset.blur === currentShadow.blur &&
      preset.spread === currentShadow.spread &&
      preset.color === currentShadow.color &&
      preset.opacity === currentShadow.opacity &&
      preset.inset === currentShadow.inset
    );
  }, [currentShadow]);

  return (
    <div className="space-y-6">
      {SHADOW_PRESETS.map((category) => (
        <div key={category.id}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {category.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.presets.map((preset) => {
              const isSelected = isPresetSelected(preset.shadow);
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelect(preset.shadow)}
                  className="group relative"
                  title={preset.name}
                >
                  {/* Preview Card */}
                  <div
                    className={`aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    {/* Inner element showing shadow */}
                    <div
                      className="w-12 h-12 bg-white dark:bg-gray-600 rounded-lg"
                      style={{
                        boxShadow: `${preset.shadow.inset ? 'inset ' : ''}${preset.shadow.offsetX}px ${preset.shadow.offsetY}px ${preset.shadow.blur}px ${preset.shadow.spread}px ${preset.shadow.color}${Math.round(preset.shadow.opacity * 2.55).toString(16).padStart(2, '0')}`,
                      }}
                    />
                  </div>

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

export default ShadowPresets;
