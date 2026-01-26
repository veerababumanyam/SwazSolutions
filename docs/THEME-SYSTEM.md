# Modern Theme System Documentation

## Overview

A premium, WCAG 2.1 AA compliant theme system with **28 modern themes** across 9 categories, designed for digital vCard and public profile pages.

## Theme Categories

### 1. Aurora Themes (3 themes)
Soft, flowing gradients inspired by northern lights.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 1 | Aurora Dreams | Purple/Pink/Pink gradient | Creative professionals |
| 2 | Northern Lights | Deep purple/blue/teal | Night-themed profiles |
| 3 | Sunset Aurora | Pink/yellow/pink | Warm, energetic brands |

### 2. Gradient Themes (4 themes)
Bold, vibrant modern gradients with high energy.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 4 | Ocean Breeze | Cyan/Blue gradient | Fresh, clean brands |
| 5 | Lava Flow | Red/Orange gradient | Bold, passionate brands |
| 6 | Forest Rain | Green/Emerald gradient | Eco-friendly brands |
| 7 | Royal Purple | Purple gradient | Premium, luxury brands |

### 3. Glass Themes (3 themes)
Glassmorphism 2.0 with frosted effects.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 8 | Crystal Glass | Light with blue primary | Modern tech brands |
| 9 | Dark Crystal | Dark mode with blue accents | Premium dark themes |
| 10 | Mint Glass | Light mint/teal | Fresh, clean aesthetics |

### 4. Minimal Themes (4 themes)
Clean, typography-focused designs.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 11 | Pure White | Black on white | Classic, timeless |
| 12 | Soft Gray | Gray tones | Subtle, professional |
| 13 | Editorial | Serif fonts, warm tones | Writers, journalists |
| 14 | Modern Sans | Bold sans-serif | Modern startups |

### 5. Dark Themes (4 themes)
Rich dark mode themes with accent colors.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 15 | Obsidian Night | Pure black/white | High contrast |
| 16 | Midnight Blue | Dark blue/slate | Corporate, professional |
| 17 | Cyber Dark | Neon accents (green/pink/red) | Gaming, tech |
| 18 | Velvet Dark | Purple/lavender | Luxury, creative |

### 6. Visual Themes (2 themes)
Hero photo themes with profile image as header.

| Theme ID | Name | Feature | Best For |
|----------|------|---------|----------|
| 19 | Hero Portrait | Full profile photo header | Photographers, models |
| 20 | Hero Blurred | Blurred profile photo overlay | Artistic, subtle |

### 7. Pastel Themes (3 themes)
Soft, dreamy color palettes.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 21 | Peach Dream | Pink/peach tones | Fashion, beauty |
| 22 | Lavender Fields | Purple/lavender | Wellness, creative |
| 23 | Sky Blue | Light blue/azure | Healthcare, corporate |

### 8. Neon Themes (3 themes)
Vibrant, cyber-inspired themes.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 24 | Neon Pink | Pink/orange on black | Nightlife, entertainment |
| 25 | Neon Blue | Cyan/blue on black | Tech, startups |
| 26 | Neon Green | Green/lime on black | Gaming, esports |

### 9. Brutal Themes (2 themes)
Modern brutalist aesthetics.

| Theme ID | Name | Colors | Best For |
|----------|------|--------|----------|
| 27 | Brutal Bold | Yellow/black with hard shadows | Bold, disruptive brands |
| 28 | Brutal Pastel | Pink/gray with offset shadows | Modern agencies |

## WCAG 2.1 AA Compliance

All themes meet or exceed WCAG 2.1 AA requirements:

- **Normal Text**: 4.5:1 contrast ratio minimum
- **Large Text**: 3:1 contrast ratio minimum
- **UI Components**: 3:1 contrast ratio minimum
- **Focus Indicators**: Visible on all interactive elements

## Features

### Enhanced PublicProfileView Component

**File**: `src/components/public-profile/PublicProfileView.enhanced.tsx`

#### Key Features:
1. **Advanced Avatar Styles**
   - Multi-layer glow effects
   - Animated gradient borders
   - Status indicators
   - Hover interactions

2. **Premium Animations**
   - Staggered entrance animations
   - Smooth transitions (600ms base)
   - Spring physics on interactions
   - Micro-interactions on all elements

3. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts for all screen sizes
   - Touch-friendly 44px minimum touch targets
   - Safe area support for notched devices

4. **Accessibility**
   - WCAG 2.1 AA compliant colors
   - Semantic HTML structure
   - Focus visible indicators
   - Screen reader friendly

5. **Interactive Elements**
   - Premium glassmorphism cards
   - Hover effects with 3D transforms
   - Smooth button press feedback
   - Magnetic hover effects

### Enhanced Theme Selector

**File**: `src/components/profile/ThemeSelector.enhanced.tsx`

#### Key Features:
1. **Live Preview**
   - Hover to preview themes
   - Real-time theme application
   - Visual theme cards with gradients

2. **Grid/List View Toggle**
   - Grid view for visual browsing
   - List view for detailed comparison
   - Smooth transitions between views

3. **Search & Filter**
   - Real-time search by name/category
   - Category filter pills with counts
   - Clear visual feedback

4. **Favorites System**
   - Star favorite themes
   - Persistent favorite storage
   - Quick access to preferred themes

5. **AI Theme Generation**
   - Prominent CTA button
   - Gradient animation
   - Clear description

### Premium CSS Animations

**File**: `src/index.css` (lines 2774+)

#### Animation Categories:

1. **Entrance Animations**
   - `animate-slide-up-fade` - Smooth upward entrance
   - `animate-fade-in-scale` - Scale and fade
   - `animate-bounce-in` - Bouncy entrance
   - `animate-elastic` - Elastic scale effect
   - `animate-flip-in` - 3D flip entrance

2. **Glow & Shadow Effects**
   - `glow-pulse` - Pulsing glow animation
   - `neon-text` - Neon text glow
   - `shadow-float` - Floating shadow
   - `inner-glow` - Inner light effect

3. **Gradient Animations**
   - `gradient-animated` - Shifting gradient
   - `gradient-pulse` - Pulsing opacity
   - `gradient-rotate` - Rotating gradient

4. **Micro-interactions**
   - `hover-press` - Button press feedback
   - `hover-bounce` - Bouncing on hover
   - `hover-shake` - Shake effect
   - `hover-wiggle` - Wiggling animation
   - `heartbeat` - Heartbeat pulse

5. **Card Effects**
   - `card-lift` - Lift on hover
   - `card-3d` - 3D tilt effect
   - `card-reveal` - Staggered reveal
   - `premium-card-hover` - Enhanced hover

6. **Avatar Effects**
   - `avatar-float` - Gentle floating
   - `avatar-pulse` - Pulsing ring
   - `avatar-glow` - Glowing effect
   - `aurora-glow` - Category-specific glow

7. **Loading States**
   - `loading-dot` - Bouncing dots
   - `loading-bar` - Progress bar
   - `loading-spin` - Spinning loader
   - `loading-pulse` - Pulsing effect

8. **Special Effects**
   - `ripple` - Material ripple effect
   - `typing-effect` - Typing animation
   - `sparkle` - Sparkle particles
   - `shimmer-effect` - Shimmer sweep
   - `pulse-ring` - Expanding rings

## Usage

### Basic Usage

```tsx
import { EnhancedPublicProfileView } from './components/public-profile/PublicProfileView.enhanced';

<EnhancedPublicProfileView
  profile={profileData}
  links={socialLinks}
  appearance={appearanceSettings}
  profileUrl="https://yourdomain.com/u/username"
  onDownloadVCard={handleDownload}
  onShare={handleShare}
/>
```

### Theme Selection

```tsx
import { EnhancedThemeSelector } from './components/profile/ThemeSelector.enhanced';
import { allModernThemes } from './data/modernThemes';

<EnhancedThemeSelector
  themes={allModernThemes}
  selectedThemeId={currentThemeId}
  loading={isLoading}
  onApplyTheme={handleApplyTheme}
  onShowAIModal={() => setShowAIModal(true)}
  onPreviewTheme={handlePreviewTheme}
/>
```

### Custom Theme Creation

```tsx
import { createTheme } from './data/modernThemes';

const customTheme = createTheme(100, 'My Theme', 'gradient', {
  colors: {
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#C4B5FD',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB'
  },
  wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
});
```

## Customization

### Color Schemes

Each theme supports:
- Background colors (solid or gradient)
- Primary, secondary, accent colors
- Text colors with WCAG compliance
- Border colors
- Wallpaper/gradients

### Typography

- Font family selection
- Heading fonts (can differ from body)
- Base font size
- Heading sizes (H1, H2, H3)
- Font weights (normal, medium, bold)

### Layout Options

- Max width control
- Spacing (xs, sm, md, lg)
- Border radius (sm, md, lg)
- Shadow depth (sm, md, lg)

### Avatar Styles

- Shape: circle, rounded, square
- Size customization
- Border width and color
- Shadow effects

### Header Styles

- Simple (centered avatar)
- Banner (top banner image)
- Avatar-top (avatar at top)
- Minimal (no avatar)
- Hero-photo (full-width photo header)

## Accessibility

### Keyboard Navigation

All interactive elements are keyboard accessible:
- Tab through all links and buttons
- Enter/Space to activate
- Visible focus indicators
- Logical tab order

### Screen Readers

- Semantic HTML structure
- ARIA labels where needed
- Alt text for images
- Descriptive link text

### Reduced Motion

Respects `prefers-reduced-motion` setting:
- Disables all animations
- Maintains functionality
- Instant transitions

## Performance

### Optimizations

- Lazy loading for images
- CSS animations over JS
- Hardware acceleration (transform, opacity)
- Efficient re-renders
- Minimal bundle size

### Lighthouse Scores

Target scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 100

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android

## Migration from Original

### Step 1: Import Enhanced Components

```tsx
// Replace
import { PublicProfileView } from './components/public-profile/PublicProfileView';

// With
import { EnhancedPublicProfileView } from './components/public-profile/PublicProfileView.enhanced';
```

### Step 2: Add Theme Data

```tsx
import { allModernThemes } from './data/modernThemes';
```

### Step 3: Update Theme Selector

```tsx
// Replace
import { ThemeSelector } from './components/profile/ThemeSelector';

// With
import { EnhancedThemeSelector } from './components/profile/ThemeSelector.enhanced';
```

### Step 4: No Prop Changes Required

The enhanced components use the same props as the original, making migration seamless.

## Support

For issues or questions:
1. Check the theme documentation
2. Verify WCAG compliance with contrast checker
3. Test in multiple browsers
4. Check reduced motion preferences

## Credits

- Design based on 2024-2025 design trends
- WCAG 2.1 AA compliance verified
- Animations optimized for 60fps
- Mobile-first responsive design
