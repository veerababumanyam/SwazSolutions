# AppearanceEditor.tsx Refactoring Guide

## Overview

This guide documents the extraction of reusable components from `src/pages/AppearanceEditor.tsx` into a modular component hierarchy at `src/components/vcard/`. The refactoring improves code reusability, maintainability, and enables integration with the new unified VCardPanel.

## Component Architecture

### Directory Structure

```
src/components/vcard/
├── shared/                          # Reusable UI components
│   ├── SectionHeader.tsx           # Section header with icon + title
│   ├── ColorPicker.tsx             # Color input with swatch
│   ├── RangeSlider.tsx             # Range input with display
│   ├── ToggleGroup.tsx             # Toggle button container
│   ├── ToggleItem.tsx              # Individual toggle button
│   ├── TypographyEditor.tsx        # Font/size/weight/style editor
│   └── index.ts                    # Barrel export
│
├── appearance/                      # Theme/appearance customization
│   ├── ThemeGallery.tsx            # Theme selection grid
│   ├── ProfileCustomizer.tsx       # Profile typography editor
│   ├── BlocksCustomizer.tsx        # Button & header styling
│   ├── GlobalCustomizer.tsx        # Background, colors, SEO
│   ├── AppearancePanel.tsx         # Main wrapper with tabs
│   └── index.ts                    # Barrel export
│
└── index.ts                        # Root vcard export
```

## Extracted Components

### Shared UI Components (`src/components/vcard/shared/`)

#### SectionHeader.tsx
```tsx
<SectionHeader
  icon={Layout}
  title="Themes"
  subtitle="Optional description"
/>
```
- **Props**: `icon`, `title`, `subtitle?`
- **Features**: Icon + title with border, supports dark mode
- **Usage**: Headers for any customization section

#### ColorPicker.tsx
```tsx
<ColorPicker
  label="Color"
  value="#ff0000"
  onChange={(color) => handleChange(color)}
  showHex={true}
/>
```
- **Props**: `label`, `value`, `onChange`, `showHex?`
- **Features**: Visual swatch, hex display, hover effects
- **Usage**: Any color customization input

#### RangeSlider.tsx
```tsx
<RangeSlider
  label="Size"
  value={12}
  min={8}
  max={24}
  step={1}
  onChange={(value) => handleChange(value)}
  formatValue={(v) => `${v}px`}
/>
```
- **Props**: `label`, `value`, `min`, `max`, `step`, `onChange`, `formatValue?`
- **Features**: Visual slider, formatted display value
- **Usage**: Numeric range inputs with visual feedback

#### ToggleGroup.tsx
```tsx
<ToggleGroup label="Style Options">
  <ToggleItem active={isBold} onClick={toggleBold} icon={Bold} title="Bold" />
  <ToggleItem active={isItalic} onClick={toggleItalic} icon={Italic} title="Italic" />
</ToggleGroup>
```
- **Props**: `label?`, `children`
- **Features**: Button group container with consistent styling
- **Usage**: Container for related toggle buttons

#### ToggleItem.tsx
```tsx
<ToggleItem
  active={isSelected}
  onClick={handleSelect}
  icon={CheckIcon}
  title="Toggle label"
/>
```
- **Props**: `active`, `onClick`, `icon`, `title?`, `label?`
- **Features**: Icon button with active state, hover effects
- **Usage**: Individual toggle option within ToggleGroup

#### TypographyEditor.tsx
```tsx
<TypographyEditor
  config={typographyConfig}
  onChange={(newConfig) => handleChange(newConfig)}
  fonts={customFonts}
  weights={customWeights}
/>
```
- **Props**: `config` (Typography), `onChange`, `fonts?`, `weights?`
- **Features**: Font family, weight, size, color, letter spacing, style toggles
- **Includes**: ColorPicker, RangeSlider, ToggleGroup composition
- **Usage**: Complete typography customization panel

### Appearance Customization Components (`src/components/vcard/appearance/`)

#### ThemeGallery.tsx
```tsx
<ThemeGallery
  themes={THEMES}
  currentTheme={activeTheme}
  onSelectTheme={(theme) => setTheme(theme)}
  categories={THEME_CATEGORIES}
/>
```
- **Props**: `themes[]`, `currentTheme`, `onSelectTheme`, `categories[]`
- **Features**:
  - Category filtering
  - Search functionality
  - Live theme preview cards
  - Animated transitions
  - Selected badge
- **State**: Manages activeCategory, searchQuery locally
- **Usage**: Full theme selection interface

#### ProfileCustomizer.tsx
```tsx
<ProfileCustomizer
  theme={currentTheme}
  onThemeChange={(newTheme) => setTheme(newTheme)}
/>
```
- **Props**: `theme`, `onThemeChange`
- **Components**: Three columns (Name, Profession, Bio)
- **Usage**: Profile typography customization
- **Includes**: TypographyEditor x3 for name/profession/bio

#### BlocksCustomizer.tsx
```tsx
<BlocksCustomizer
  theme={currentTheme}
  onThemeChange={(newTheme) => setTheme(newTheme)}
/>
```
- **Props**: `theme`, `onThemeChange`
- **Includes**:
  - Button shape selector (rounded, pill, square, glass, outline)
  - Button colors (background, text, border, shadow)
  - Border width slider
  - Section headers typography editor
- **Usage**: Button and header styling customization

#### GlobalCustomizer.tsx
```tsx
<GlobalCustomizer
  theme={currentTheme}
  onThemeChange={(newTheme) => setTheme(newTheme)}
/>
```
- **Props**: `theme`, `onThemeChange`
- **Includes**:
  - Background type selector (color, gradient, image)
  - Background upload and preview
  - Blur and overlay controls
  - Accent color picker
  - Social icon style selector
  - SEO settings (title, description, keywords)
- **Usage**: Global theme settings and SEO
- **Context**: Uses ProfileContext for updateProfile

#### AppearancePanel.tsx
```tsx
<AppearancePanel
  theme={currentTheme}
  onThemeChange={(newTheme) => setTheme(newTheme)}
/>
```
- **Props**: `theme`, `onThemeChange`
- **Features**: Tabbed interface (Profile, Blocks, Global)
- **Includes**: ProfileCustomizer, BlocksCustomizer, GlobalCustomizer
- **State**: Manages activeTab locally
- **Usage**: Main wrapper for all appearance customization

## Refactored AppearanceEditor Usage

### Before (Monolithic)
```tsx
// src/pages/AppearanceEditor.tsx - 542 lines
// All components defined inline with no reusability
const AppearanceEditor = () => {
  // All logic and sub-components here
}
```

### After (Modular)
```tsx
// src/pages/AppearanceEditor.tsx - ~100 lines
import { ThemeGallery, AppearancePanel } from '@/components/vcard';
import { THEMES, CATEGORIES } from '@/constants/themes';
import { useProfile } from '@/contexts/ProfileContext';

const AppearanceEditor: React.FC = () => {
  const { theme, setTheme } = useProfile();

  return (
    <div className="space-y-12 pb-24">
      {/* Theme Selection */}
      <ThemeGallery
        themes={THEMES}
        currentTheme={theme}
        onSelectTheme={setTheme}
        categories={CATEGORIES}
      />

      {/* Customization Interface */}
      <AppearancePanel
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
};

export default AppearanceEditor;
```

## Migration Path

### Step 1: Install Extracted Components
All components are now available from:
```tsx
import {
  // Shared
  SectionHeader,
  ColorPicker,
  RangeSlider,
  ToggleGroup,
  ToggleItem,
  TypographyEditor,
  // Appearance
  ThemeGallery,
  ProfileCustomizer,
  BlocksCustomizer,
  GlobalCustomizer,
  AppearancePanel,
} from '@/components/vcard';
```

### Step 2: Simplify AppearanceEditor.tsx
Remove inline component definitions and use extracted components:
```tsx
const AppearanceEditor: React.FC = () => {
  const { theme, setTheme } = useProfile();

  return (
    <div className="space-y-12 pb-24">
      <ThemeGallery
        themes={THEMES}
        currentTheme={theme}
        onSelectTheme={setTheme}
        categories={CATEGORIES}
      />
      <AppearancePanel theme={theme} onThemeChange={setTheme} />
    </div>
  );
};
```

### Step 3: Reuse in VCardPanel
```tsx
// Future VCardPanel usage
import { AppearancePanel } from '@/components/vcard';

const VCardPanel = () => {
  return (
    <AppearancePanel
      theme={vCardTheme}
      onThemeChange={updateVCardTheme}
    />
  );
};
```

## State Management Pattern

All components accept props and use callback functions for state management:

```tsx
// Parent manages state
const [theme, setTheme] = useState<Theme>(initialTheme);

// Child receives props and callbacks
<AppearancePanel
  theme={theme}
  onThemeChange={setTheme}
/>
```

For form state within customizers:
```tsx
// ProfileContext used for profile-specific updates
const { profile, updateProfile } = useProfile();

// Theme updates via props callback
onThemeChange({...theme, accentColor: '#fff'})
```

## Styling Consistency

All components maintain:
- **Dark Mode**: Full `dark:` prefix support
- **TailwindCSS**: Original utility classes preserved
- **Framer Motion**: Animations for transitions and galleries
- **Responsive Design**: Tailored for mobile, tablet, desktop
- **Haptic Feedback**: Integrated `useHaptic()` hook

## Type Safety

Components use TypeScript interfaces from `@/types/modernProfile.types`:
- `Theme` - Complete theme configuration
- `Typography` - Font, size, color, style properties
- `ButtonStyle` - Button appearance settings
- `ThemeCategory` - Theme category enum

```tsx
interface TypographyEditorProps {
  config: Typography;
  onChange: (config: Typography) => void;
  fonts?: Array<{ name: string; label: string }>;
  weights?: Array<{ value: string; label: string }>;
}
```

## Customization Guide

### Adding Custom Fonts
```tsx
const CUSTOM_FONTS = [
  { name: 'Custom Font', label: 'Custom' },
  ...DEFAULT_FONTS,
];

<TypographyEditor
  config={config}
  onChange={onChange}
  fonts={CUSTOM_FONTS}
/>
```

### Extending Button Shapes
```tsx
const CUSTOM_SHAPES = ['rounded', 'pill', 'custom-shape'];

// In BlocksCustomizer
{CUSTOM_SHAPES.map(s => (
  <button key={s} onClick={() => updateButtons('shape', s)}>
    {s}
  </button>
))}
```

### Adding Theme Categories
```tsx
const EXTENDED_CATEGORIES = [
  'All',
  'Wedding',
  'Photography',
  'My Custom Category',
];

<ThemeGallery
  categories={EXTENDED_CATEGORIES}
  {...otherProps}
/>
```

## Benefits

1. **Reusability**: Components used across AppearanceEditor, VCardPanel, and future features
2. **Maintainability**: Clear separation of concerns, easier to test
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Consistency**: Unified styling and interaction patterns
5. **Performance**: Memoization opportunities for expensive components
6. **Dark Mode**: Complete dark mode support across all components
7. **Accessibility**: Proper ARIA labels and semantic HTML
8. **Extensibility**: Easy to add new customization options

## Testing Strategy

### Unit Testing
```tsx
// Test SectionHeader renders with icon and title
// Test ColorPicker onChange callback
// Test RangeSlider value formatting
```

### Integration Testing
```tsx
// Test TypographyEditor updates typography state
// Test AppearancePanel tab switching
// Test ThemeGallery selection and filtering
```

### E2E Testing
```tsx
// Full appearance editor workflow
// Theme application and persistence
// SEO settings integration
```

## Performance Considerations

1. **Memoization**: Consider React.memo for frequently re-rendering components
2. **Lazy Loading**: ThemeGallery supports lazy image loading
3. **Virtualization**: For large theme lists, consider react-window
4. **Debouncing**: Color picker and slider updates could be debounced
5. **Code Splitting**: AppearancePanel could be lazy-loaded

## Future Enhancements

1. **Theme Presets**: Save/load custom theme combinations
2. **Theme Sharing**: Export theme as JSON/URL
3. **AI Theme Generation**: Auto-generate themes based on preferences
4. **Preview Modes**: Desktop, mobile, tablet previews
5. **Accessibility Validator**: Contrast checker, readability scores
6. **History/Undo**: Theme change history with undo/redo
7. **Collaboration**: Real-time theme editing with others

## Files Modified/Created

### Created Files
```
src/components/vcard/shared/
  ├── SectionHeader.tsx
  ├── ColorPicker.tsx
  ├── RangeSlider.tsx
  ├── ToggleGroup.tsx
  ├── ToggleItem.tsx
  ├── TypographyEditor.tsx
  └── index.ts

src/components/vcard/appearance/
  ├── ThemeGallery.tsx
  ├── ProfileCustomizer.tsx
  ├── BlocksCustomizer.tsx
  ├── GlobalCustomizer.tsx
  ├── AppearancePanel.tsx
  └── index.ts
```

### Updated Files
```
src/components/vcard/index.ts
  - Added exports for new components
```

### Future Updates (Recommended)
```
src/pages/AppearanceEditor.tsx
  - Refactor to use new components (see "After" example)
```

## Imports Reference

### Quick Import Guide
```tsx
// All from one export
import {
  SectionHeader,
  ColorPicker,
  RangeSlider,
  ToggleGroup,
  ToggleItem,
  TypographyEditor,
  ThemeGallery,
  ProfileCustomizer,
  BlocksCustomizer,
  GlobalCustomizer,
  AppearancePanel,
} from '@/components/vcard';

// Or specific imports
import { ColorPicker, RangeSlider } from '@/components/vcard/shared';
import { AppearancePanel } from '@/components/vcard/appearance';
```

## Troubleshooting

### Component Not Updating
- Ensure `onThemeChange` callback is properly wired
- Check that parent state is being updated
- Verify ProfileContext is available for SEO fields

### Styling Issues
- Confirm TailwindCSS is processing vcard directory
- Check dark mode class is applied to root element
- Verify color values are valid hex codes

### Type Errors
- Ensure Typography and Theme types are imported from `@/types/modernProfile.types`
- Check ButtonStyle type matches buttons property
- Verify ThemeCategory type is correct

---

**Created**: Phase 1 - vCard Editor Redesign
**Version**: 1.0
**Last Updated**: 2026-01-31
