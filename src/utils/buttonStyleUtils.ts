/**
 * Button Style Utilities
 *
 * Professional CSS generation utilities for button customization
 * Handles shadow, gradient, color conversion, and complete button styling
 *
 * @module buttonStyleUtils
 */

import { CustomShadowSettings, GradientSettings, AppearanceSettings } from '../types/profile.types';

// ============================================================================
// COLOR CONVERSION
// ============================================================================

/**
 * Converts hex color to rgba string
 * @param hex - Hex color string (with or without #)
 * @param alpha - Alpha value 0-1
 * @returns RGBA color string
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Fallback for invalid hex
  return `rgba(0, 0, 0, ${alpha})`;
};

/**
 * Converts opacity (0-100) to alpha (0-1)
 * @param opacity - Opacity value 0-100
 * @returns Alpha value 0-1
 */
const opacityToAlpha = (opacity: number): number => {
  return Math.max(0, Math.min(100, opacity)) / 100;
};

// ============================================================================
// SHADOW TO CSS
// ============================================================================

/**
 * Converts custom shadow settings to CSS box-shadow string
 * @param shadow - Shadow configuration
 * @returns CSS box-shadow string
 */
export const shadowToCSS = (shadow: CustomShadowSettings): string => {
  const { offsetX, offsetY, blur, spread, color, opacity, inset } = shadow;
  const rgbaColor = hexToRgba(color, opacityToAlpha(opacity));
  const insetKeyword = inset ? 'inset ' : '';

  return `${insetKeyword}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgbaColor}`;
};

/**
 * Default shadow presets
 */
export const DEFAULT_SHADOWS: Record<string, CustomShadowSettings> = {
  none: {
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    spread: 0,
    color: '#000000',
    opacity: 0,
    inset: false,
  },
  subtle: {
    offsetX: 0,
    offsetY: 2,
    blur: 8,
    spread: 0,
    color: '#000000',
    opacity: 15,
    inset: false,
  },
  strong: {
    offsetX: 0,
    offsetY: 4,
    blur: 16,
    spread: 0,
    color: '#000000',
    opacity: 25,
    inset: false,
  },
  hard: {
    offsetX: 2,
    offsetY: 2,
    blur: 0,
    spread: 0,
    color: '#000000',
    opacity: 100,
    inset: false,
  },
};

// ============================================================================
// GRADIENT TO CSS
// ============================================================================

/**
 * Sorts gradient stops by position
 * @param stops - Gradient stops array
 * @returns Sorted stops
 */
const sortGradientStops = (stops: GradientSettings['stops']): GradientSettings['stops'] => {
  return [...stops].sort((a, b) => a.position - b.position);
};

/**
 * Converts gradient settings to CSS background-image string
 * @param gradient - Gradient configuration
 * @returns CSS background-image string
 */
export const gradientToCSS = (gradient: GradientSettings): string => {
  const sortedStops = sortGradientStops(gradient.stops);

  if (gradient.type === 'linear') {
    const angle = gradient.angle ?? 135;
    const stopsStr = sortedStops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }

  // radial gradient
  const position = gradient.position ?? 'center';
  const stopsStr = sortedStops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');
  return `radial-gradient(circle at ${position}, ${stopsStr})`;
};

/**
 * Default gradient presets
 */
export const DEFAULT_GRADIENTS: Record<string, GradientSettings> = {
  sunset: {
    type: 'linear',
    angle: 135,
    stops: [
      { id: '1', color: '#FF6B6B', position: 0 },
      { id: '2', color: '#FFE66D', position: 100 },
    ],
  },
  ocean: {
    type: 'linear',
    angle: 180,
    stops: [
      { id: '1', color: '#667eea', position: 0 },
      { id: '2', color: '#764ba2', position: 100 },
    ],
  },
};

// ============================================================================
// BUTTON STYLES GENERATION
// ============================================================================

/**
 * Generates complete button styles from appearance settings
 * @param settings - Appearance settings
 * @returns React CSS properties object
 */
export const getButtonStyles = (settings: AppearanceSettings): React.CSSProperties => {
  const base: React.CSSProperties = {
    borderRadius: `${settings.cornerRadius}px`,
    transition: 'all 0.2s ease',
    fontFamily: settings.fontFamily,
  };

  // Check if using enhanced button settings
  const hasEnhancedSettings = 'buttonEnhancement' in settings &&
    (settings as any).buttonEnhancement;

  if (hasEnhancedSettings) {
    const enhancement = (settings as any).buttonEnhancement;

    // Build background
    let background = settings.buttonColor;
    if (enhancement.useGradient && enhancement.gradient.stops.length > 0) {
      background = gradientToCSS(enhancement.gradient);
    }

    // Build shadow
    let boxShadow = 'none';
    if (enhancement.useCustomShadow) {
      boxShadow = shadowToCSS(enhancement.customShadow);
    } else if (settings.shadowStyle !== 'none') {
      // Use legacy shadow style
      const shadow = DEFAULT_SHADOWS[settings.shadowStyle] || DEFAULT_SHADOWS.subtle;
      boxShadow = shadowToCSS(shadow);
    }

    // Build border
    const border = enhancement.borderWidth > 0
      ? `${enhancement.borderWidth}px solid ${enhancement.borderColor}`
      : undefined;

    // Build hover effects
    const hoverScale = enhancement.hoverScale ?? 1.02;
    const hoverBrightness = enhancement.hoverBrightness ?? 100;

    return {
      ...base,
      backgroundColor: enhancement.useGradient ? undefined : background,
      backgroundImage: enhancement.useGradient ? background : undefined,
      boxShadow,
      border,
      color: settings.textColor,
      '--hover-scale': hoverScale,
      '--hover-brightness': hoverBrightness,
    } as React.CSSProperties;
  }

  // Legacy button styling (backwards compatible)
  switch (settings.buttonStyle) {
    case 'solid':
      return {
        ...base,
        backgroundColor: settings.buttonColor,
        color: settings.textColor,
        boxShadow: settings.shadowStyle === 'none' ? 'none' :
          settings.shadowStyle === 'subtle' ? `0 2px 8px ${settings.shadowColor}20` :
          settings.shadowStyle === 'strong' ? `0 4px 16px ${settings.shadowColor}40` :
            `2px 2px 0 ${settings.shadowColor}`,
      };

    case 'glass':
      return {
        ...base,
        backgroundColor: `${settings.buttonColor}20`,
        backdropFilter: 'blur(8px)',
        color: settings.buttonColor,
        border: `1px solid ${settings.buttonColor}40`,
      };

    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `2px solid ${settings.buttonColor}`,
        color: settings.buttonColor,
      };

    case 'minimal':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${settings.buttonColor}40`,
      };

    default:
      return base;
  }
};

/**
 * Generates hover styles for buttons
 * @param settings - Appearance settings
 * @returns React CSS properties for hover state
 */
export const getButtonHoverStyles = (settings: AppearanceSettings): React.CSSProperties => {
  const hasEnhancedSettings = 'buttonEnhancement' in settings &&
    (settings as any).buttonEnhancement;

  if (hasEnhancedSettings) {
    const enhancement = (settings as any).buttonEnhancement;
    const hoverScale = enhancement.hoverScale ?? 1.02;
    const hoverBrightness = enhancement.hoverBrightness ?? 100;

    return {
      transform: `scale(${hoverScale})`,
      filter: `brightness(${hoverBrightness}%)`,
    } as React.CSSProperties;
  }

  // Legacy hover styles
  return {
    transform: 'scale(1.02)',
  };
};

/**
 * Default button enhancement settings
 */
export const DEFAULT_BUTTON_ENHANCEMENT = {
  useCustomShadow: false,
  customShadow: DEFAULT_SHADOWS.subtle,
  useGradient: false,
  gradient: DEFAULT_GRADIENTS.sunset,
  borderWidth: 0,
  borderColor: '#000000',
  hoverScale: 102,
  hoverBrightness: 100,
};
