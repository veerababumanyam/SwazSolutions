/**
 * WCAG 2.1 AA Color Contrast Validation Utility
 * 
 * Provides functions to:
 * - Calculate relative luminance of colors
 * - Calculate contrast ratio between two colors
 * - Validate WCAG 2.1 AA compliance
 * - Generate accessible color pairs
 * - Adjust colors to meet accessibility requirements
 */

// WCAG 2.1 AA Minimum Contrast Ratios
export const WCAG_AA_NORMAL_TEXT = 4.5;  // For text < 18pt (or < 14pt bold)
export const WCAG_AA_LARGE_TEXT = 3.0;   // For text >= 18pt (or >= 14pt bold)
export const WCAG_AA_UI_COMPONENTS = 3.0; // For UI components and graphical objects

export interface WCAGResult {
  isValid: boolean;
  contrastRatio: number;
  level: 'AAA' | 'AA' | 'A' | 'Fail';
  recommendation?: string;
}

export interface ColorPair {
  foreground: string;
  background: string;
  contrastRatio: number;
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle shorthand hex (#RGB)
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const expandedHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expandedHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Parse any color format (hex, rgb, rgba) to RGB values
 */
export function parseColor(color: string): { r: number; g: number; b: number; a?: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  
  // Handle rgb/rgba
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  
  return null;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0;

  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const lum1 = getRelativeLuminance(foreground);
  const lum2 = getRelativeLuminance(background);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG 2.1 AA standards
 */
export function checkWCAGCompliance(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): WCAGResult {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
  
  let level: 'AAA' | 'AA' | 'A' | 'Fail';
  let recommendation: string | undefined;
  
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  } else if (ratio >= 3) {
    level = 'A';
    if (!isLargeText) {
      recommendation = 'Consider using a darker foreground or lighter background color.';
    }
  } else {
    level = 'Fail';
    recommendation = 'This color combination does not meet WCAG accessibility standards.';
  }
  
  return {
    isValid: ratio >= threshold,
    contrastRatio: Math.round(ratio * 100) / 100,
    level,
    recommendation,
  };
}

/**
 * Determine if a background color is "light" or "dark"
 */
export function isLightColor(color: string): boolean {
  const luminance = getRelativeLuminance(color);
  return luminance > 0.179; // Standard threshold
}

/**
 * Get optimal text color (black or white) for a given background
 */
export function getOptimalTextColor(background: string): string {
  return isLightColor(background) ? '#1a1a1a' : '#ffffff';
}

/**
 * Get optimal secondary text color for a given background
 */
export function getOptimalSecondaryTextColor(background: string): string {
  return isLightColor(background) ? '#4a4a4a' : '#d1d1d1';
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(color: string, percent: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  const amount = (percent / 100) * 255;
  return rgbToHex(
    rgb.r + amount,
    rgb.g + amount,
    rgb.b + amount
  );
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(color: string, percent: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  const factor = 1 - (percent / 100);
  return rgbToHex(
    rgb.r * factor,
    rgb.g * factor,
    rgb.b * factor
  );
}

/**
 * Adjust foreground color to meet WCAG AA contrast requirements
 */
export function adjustForContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): string {
  const threshold = isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
  let ratio = getContrastRatio(foreground, background);
  
  if (ratio >= threshold) {
    return foreground;
  }
  
  const bgIsLight = isLightColor(background);
  let adjustedColor = foreground;
  let attempts = 0;
  const maxAttempts = 20;
  
  while (ratio < threshold && attempts < maxAttempts) {
    // Darken for light backgrounds, lighten for dark backgrounds
    adjustedColor = bgIsLight
      ? darkenColor(adjustedColor, 10)
      : lightenColor(adjustedColor, 10);
    ratio = getContrastRatio(adjustedColor, background);
    attempts++;
  }
  
  // If we couldn't achieve the target, return optimal black or white
  if (ratio < threshold) {
    return bgIsLight ? '#1a1a1a' : '#ffffff';
  }
  
  return adjustedColor;
}

/**
 * Generate an accessible gradient that maintains readability
 * Returns overlay color and opacity for text readability
 */
export function getAccessibleGradientOverlay(
  gradientColors: string[],
  textColor: string = '#ffffff'
): { overlayColor: string; overlayOpacity: number } {
  // Calculate average luminance of gradient colors
  const avgLuminance = gradientColors.reduce((sum, color) => {
    return sum + getRelativeLuminance(color);
  }, 0) / gradientColors.length;
  
  const textLuminance = getRelativeLuminance(textColor);
  
  // If text is light, we need a darker overlay
  // If text is dark, we need a lighter overlay (or no overlay)
  if (textLuminance > 0.5) {
    // White text needs dark overlay
    const opacity = Math.min(0.6, Math.max(0.2, avgLuminance));
    return { overlayColor: 'rgba(0, 0, 0, 1)', overlayOpacity: Math.round(opacity * 100) };
  } else {
    // Dark text - less overlay needed or light overlay
    const opacity = Math.min(0.3, Math.max(0, 0.5 - avgLuminance));
    return { overlayColor: 'rgba(255, 255, 255, 1)', overlayOpacity: Math.round(opacity * 100) };
  }
}

/**
 * Validate a complete theme's color accessibility
 */
export interface ThemeAccessibilityReport {
  isCompliant: boolean;
  issues: Array<{
    property: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
    message: string;
  }>;
  score: number; // 0-100
}

export function validateThemeAccessibility(colors: {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
}): ThemeAccessibilityReport {
  const issues: ThemeAccessibilityReport['issues'] = [];
  const checks: Array<{
    name: string;
    fg: string;
    bg: string;
    required: number;
  }> = [
    { name: 'Text on Background', fg: colors.text, bg: colors.background, required: WCAG_AA_NORMAL_TEXT },
    { name: 'Secondary Text on Background', fg: colors.textSecondary, bg: colors.background, required: WCAG_AA_NORMAL_TEXT },
    { name: 'Text on Secondary Background', fg: colors.text, bg: colors.backgroundSecondary, required: WCAG_AA_NORMAL_TEXT },
    { name: 'Primary Button Text', fg: '#ffffff', bg: colors.primary, required: WCAG_AA_NORMAL_TEXT },
    { name: 'Secondary Button Text', fg: '#ffffff', bg: colors.secondary, required: WCAG_AA_NORMAL_TEXT },
    { name: 'Accent on Background', fg: colors.accent, bg: colors.background, required: WCAG_AA_UI_COMPONENTS },
  ];
  
  let passedChecks = 0;
  
  for (const check of checks) {
    const ratio = getContrastRatio(check.fg, check.bg);
    if (ratio < check.required) {
      issues.push({
        property: check.name,
        foreground: check.fg,
        background: check.bg,
        ratio: Math.round(ratio * 100) / 100,
        required: check.required,
        message: `Contrast ratio ${ratio.toFixed(2)} is below the required ${check.required}:1 for ${check.name}`,
      });
    } else {
      passedChecks++;
    }
  }
  
  const score = Math.round((passedChecks / checks.length) * 100);
  
  return {
    isCompliant: issues.length === 0,
    issues,
    score,
  };
}

/**
 * Pre-defined accessible color palettes that meet WCAG 2.1 AA
 * These are curated gradient-friendly palettes
 */
export const ACCESSIBLE_PALETTES = {
  // Warm gradients
  sunriseGlow: {
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    textOnGradient: '#1a1a1a',
    background: '#FFF8F3',
    text: '#2D2D2D',
    textSecondary: '#5A5A5A',
  },
  coralDream: {
    gradient: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 50%, #FF99AC 100%)',
    textOnGradient: '#1a1a1a',
    background: '#FFF5F5',
    text: '#2D2A2A',
    textSecondary: '#5C5757',
  },
  
  // Cool gradients
  oceanBreeze: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textOnGradient: '#ffffff',
    background: '#F5F3FF',
    text: '#1F1F3D',
    textSecondary: '#4A4A6A',
  },
  mintFresh: {
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textOnGradient: '#1a1a1a',
    background: '#F0FFF4',
    text: '#1A3D2E',
    textSecondary: '#4A6B5A',
  },
  
  // Neutral gradients
  slate: {
    gradient: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)',
    textOnGradient: '#ffffff',
    background: '#F7FAFC',
    text: '#1A202C',
    textSecondary: '#4A5568',
  },
  
  // Dark mode gradients
  midnightPurple: {
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    textOnGradient: '#ffffff',
    background: '#0F0F1A',
    text: '#F7F7F7',
    textSecondary: '#A0A0B0',
  },
};

export default {
  checkWCAGCompliance,
  getContrastRatio,
  getRelativeLuminance,
  isLightColor,
  getOptimalTextColor,
  getOptimalSecondaryTextColor,
  adjustForContrast,
  validateThemeAccessibility,
  hexToRgb,
  rgbToHex,
  parseColor,
  lightenColor,
  darkenColor,
  getAccessibleGradientOverlay,
  ACCESSIBLE_PALETTES,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AA_LARGE_TEXT,
  WCAG_AA_UI_COMPONENTS,
};
