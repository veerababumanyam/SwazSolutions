# vCard Components - Usage Examples

Quick reference guide for using all extracted components.

## Shared UI Components

### SectionHeader
Displays a section title with icon and optional subtitle.

```tsx
import { SectionHeader } from '@/components/vcard';
import { Palette } from 'lucide-react';

// Basic usage
<SectionHeader icon={Palette} title="Colors" />

// With subtitle
<SectionHeader
  icon={Palette}
  title="Colors"
  subtitle="Customize accent and theme colors"
/>
```

**Props**:
- `icon: LucideIcon` - Icon component from lucide-react
- `title: string` - Section title (uppercase)
- `subtitle?: string` - Optional descriptive text

---

### ColorPicker
Interactive color input with visual swatch preview.

```tsx
import { ColorPicker } from '@/components/vcard';
import { useState } from 'react';

export function ColorEditor() {
  const [color, setColor] = useState('#ff0000');

  return (
    <ColorPicker
      label="Primary Color"
      value={color}
      onChange={setColor}
      showHex={true}
    />
  );
}
```

**Props**:
- `label: string` - Input label
- `value: string` - Hex color value
- `onChange: (value: string) => void` - Change handler
- `showHex?: boolean` - Show hex code (default: true)

**Features**:
- Displays hex code on hover
- Click to open color picker
- Hover scale animation
- Dark mode support

---

### RangeSlider
Slider input with formatted value display.

```tsx
import { RangeSlider } from '@/components/vcard';
import { useState } from 'react';

export function SizeEditor() {
  const [size, setSize] = useState(16);

  return (
    <RangeSlider
      label="Font Size"
      value={size}
      min={8}
      max={32}
      step={1}
      onChange={setSize}
      formatValue={(v) => `${v}px`}
    />
  );
}
```

**Props**:
- `label: string` - Slider label
- `value: number` - Current value
- `min: number` - Minimum value
- `max: number` - Maximum value
- `step: number` - Step increment
- `onChange: (value: number) => void` - Change handler
- `formatValue?: (value: number) => string` - Value formatter

**Features**:
- Displays formatted value
- Visual slider track
- Accent color on hover
- Works with decimals

---

### ToggleGroup & ToggleItem
Button group for selecting from multiple options.

```tsx
import { ToggleGroup, ToggleItem } from '@/components/vcard';
import { Bold, Italic, Underline } from 'lucide-react';
import { useState } from 'react';

export function StyleSelector() {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  return (
    <ToggleGroup label="Text Styles">
      <ToggleItem
        active={isBold}
        onClick={() => setIsBold(!isBold)}
        icon={Bold}
        title="Bold"
      />
      <ToggleItem
        active={isItalic}
        onClick={() => setIsItalic(!isItalic)}
        icon={Italic}
        title="Italic"
      />
      <ToggleItem
        icon={Underline}
        active={false}
        onClick={() => {}}
        title="Underline"
      />
    </ToggleGroup>
  );
}
```

**ToggleGroup Props**:
- `label?: string` - Group label
- `children: React.ReactNode` - ToggleItem components

**ToggleItem Props**:
- `active: boolean` - Selection state
- `onClick: () => void` - Click handler
- `icon: LucideIcon` - Icon component
- `title?: string` - Tooltip title
- `label?: string` - Alternative to title

**Features**:
- Icon-based buttons
- Active state styling
- Hover effects
- Flex layout

---

### TypographyEditor
Complete typography customization panel.

```tsx
import { TypographyEditor } from '@/components/vcard';
import { Typography } from '@/types/modernProfile.types';
import { useState } from 'react';

export function FontCustomizer() {
  const [typography, setTypography] = useState<Typography>({
    family: 'Inter',
    weight: 'normal',
    size: 1,
    color: '#000000',
    style: 'normal',
    decoration: 'none',
    transform: 'none',
    letterSpacing: '0em',
  });

  return (
    <TypographyEditor
      config={typography}
      onChange={setTypography}
    />
  );
}
```

**With Custom Fonts**:
```tsx
const FONTS = [
  { name: 'Futura', label: 'Futura' },
  { name: 'Georgia', label: 'Georgia' },
];

const WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: 'normal', label: 'Regular' },
  { value: 'bold', label: 'Bold' },
  { value: '900', label: 'Black' },
];

<TypographyEditor
  config={typography}
  onChange={setTypography}
  fonts={FONTS}
  weights={WEIGHTS}
/>
```

**Props**:
- `config: Typography` - Current typography config
- `onChange: (config: Typography) => void` - Change handler
- `fonts?: Array<{name, label}>` - Custom font list
- `weights?: Array<{value, label}>` - Custom weight list

**Includes**:
- Font family dropdown
- Font weight dropdown
- Color picker
- Size slider (0.5x - 3x)
- Letter spacing slider (-0.1em - 0.5em)
- Style toggles (Uppercase, Italic, Underline)

---

## Appearance Components

### ThemeGallery
Theme selection grid with search and category filtering.

```tsx
import { ThemeGallery } from '@/components/vcard';
import { THEMES, CATEGORIES } from '@/constants/themes';
import { useProfile } from '@/contexts/ProfileContext';

export function ThemeSelector() {
  const { theme, setTheme } = useProfile();

  return (
    <ThemeGallery
      themes={THEMES}
      currentTheme={theme}
      onSelectTheme={setTheme}
      categories={CATEGORIES}
    />
  );
}
```

**Props**:
- `themes: Theme[]` - Array of available themes
- `currentTheme: Theme` - Currently selected theme
- `onSelectTheme: (theme: Theme) => void` - Selection handler
- `categories: ThemeCategory[]` - Available categories

**Features**:
- Search by theme name
- Filter by category
- Live preview cards
- Selected badge
- Animated transitions
- Hover zoom effect

---

### ProfileCustomizer
Customize name, profession, and bio typography.

```tsx
import { ProfileCustomizer } from '@/components/vcard';
import { Theme } from '@/types/modernProfile.types';
import { useState } from 'react';

export function ProfileTypographyEditor() {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <ProfileCustomizer
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
```

**Props**:
- `theme: Theme` - Current theme configuration
- `onThemeChange: (theme: Theme) => void` - Update handler

**Includes**:
- Name typography editor (left column)
- Profession typography editor (middle column)
- Bio typography editor (right column)
- All editors use TypographyEditor component

---

### BlocksCustomizer
Configure button and section header styles.

```tsx
import { BlocksCustomizer } from '@/components/vcard';

export function ButtonStyleEditor() {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <BlocksCustomizer
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
```

**Props**:
- `theme: Theme` - Current theme configuration
- `onThemeChange: (theme: Theme) => void` - Update handler

**Features**:
- Button shape selector (rounded, pill, square, glass, outline)
- Color pickers:
  - Button background
  - Button text
  - Button border
  - Button shadow (optional)
- Border width slider (0-4px)
- Section headers typography editor

---

### GlobalCustomizer
Configure background, accent colors, social icons, and SEO.

```tsx
import { GlobalCustomizer } from '@/components/vcard';

export function GlobalThemeEditor() {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <GlobalCustomizer
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
```

**Props**:
- `theme: Theme` - Current theme configuration
- `onThemeChange: (theme: Theme) => void` - Update handler

**Left Column - Background**:
- Background type selector (color, gradient, image)
- Color picker for solid/gradient
- Image upload and preview
- Blur effect slider (0-20px)
- Overlay opacity slider (0-90%)

**Right Column - Colors & Accents**:
- Accent color picker
- Social icon style selector (filled, outline, minimal, glass)
- Icon color picker
- SEO settings:
  - Meta title input
  - Meta description textarea
  - Keywords input

---

### AppearancePanel
Main tabbed wrapper for all appearance customization.

```tsx
import { AppearancePanel } from '@/components/vcard';
import { useProfile } from '@/contexts/ProfileContext';

export function AppearanceCustomizer() {
  const { theme, setTheme } = useProfile();

  return (
    <AppearancePanel
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
```

**Props**:
- `theme: Theme` - Current theme configuration
- `onThemeChange: (theme: Theme) => void` - Update handler

**Tabs**:
1. **Profile** - Name, profession, bio typography
2. **Blocks** - Button and header styles
3. **Global** - Background, colors, and SEO

**Features**:
- Smooth tab transitions
- Haptic feedback on tab change
- Responsive tab layout
- Maintains scroll position

---

## Complete Integration Example

```tsx
import React, { useState } from 'react';
import {
  ThemeGallery,
  AppearancePanel,
  SectionHeader,
  ColorPicker,
} from '@/components/vcard';
import { THEMES, CATEGORIES } from '@/constants/themes';
import { Theme } from '@/types/modernProfile.types';
import { Sparkles } from 'lucide-react';

export function CompleteThemeEditor() {
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [customColor, setCustomColor] = useState('#0066ff');

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Design Your Profile</h1>
          <p className="text-gray-500 text-sm">Customize colors, fonts, and layout</p>
        </div>
      </div>

      {/* Quick Color Control */}
      <section className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-200 dark:border-white/5">
        <SectionHeader icon={Sparkles} title="Quick Customization" />
        <ColorPicker
          label="Brand Color"
          value={customColor}
          onChange={setCustomColor}
        />
      </section>

      {/* Theme Selection */}
      <ThemeGallery
        themes={THEMES}
        currentTheme={theme}
        onSelectTheme={setTheme}
        categories={CATEGORIES}
      />

      {/* Detailed Customization */}
      <AppearancePanel theme={theme} onThemeChange={setTheme} />
    </div>
  );
}
```

---

## Component Composition Patterns

### Pattern 1: Nested Components
```tsx
// AppearancePanel contains:
// - ProfileCustomizer (contains TypographyEditor x3)
// - BlocksCustomizer (contains ToggleGroup, ColorPicker, RangeSlider, TypographyEditor)
// - GlobalCustomizer (contains ColorPicker x2, RangeSlider x2)
```

### Pattern 2: State Management
```tsx
// Parent manages state
const [theme, setTheme] = useState(initialTheme);

// Pass through callbacks
<AppearancePanel
  theme={theme}
  onThemeChange={setTheme}
/>

// Component updates parent state
const handleColorChange = (color) => {
  onThemeChange({...theme, accentColor: color})
}
```

### Pattern 3: Context Integration
```tsx
// GlobalCustomizer uses ProfileContext
const { profile, updateProfile } = useProfile();

// For theme updates
onThemeChange({...theme, ...changes})

// For profile-specific updates (SEO)
updateProfile({...profile, seo: newSEO})
```

---

## Styling Notes

All components include:
- **Dark Mode**: `dark:` prefixed classes
- **Responsive**: Mobile-first design
- **Hover States**: Interactive feedback
- **Focus States**: Keyboard navigation
- **Transitions**: Smooth animations
- **Accessibility**: ARIA labels and semantic HTML

### Customizing Styles
Components use Tailwind CSS classes. Modify via:
1. Edit component source files directly
2. Wrap components with additional styling
3. Use Tailwind's `@apply` directive for custom styles

---

## Type Definitions

```tsx
// From @/types/modernProfile.types

interface Typography {
  family: string;              // Font family name
  weight: 'normal' | 'bold' | string;
  size: number;                // 0.5 - 3.0 scale
  color: string;               // Hex color
  style: 'normal' | 'italic';
  decoration: 'none' | 'underline';
  transform: 'none' | 'uppercase';
  letterSpacing?: string;      // em units
}

interface ButtonStyle {
  shape: 'rounded' | 'pill' | 'square' | 'glass' | 'outline';
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  shadowColor?: string;
}

interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  profile: { name; profession; bio: Typography };
  buttons: ButtonStyle;
  headers: Typography;
  bgType: 'color' | 'gradient' | 'image';
  bgValue: string;
  bgConfig?: { bgBlur: number; bgOverlay: number };
  accentColor: string;
  socials: { style: 'filled' | 'outline' | 'minimal' | 'glass'; color: string };
}
```

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Phase**: 1 - Component Extraction
