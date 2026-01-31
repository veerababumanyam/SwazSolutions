# vCard Component Architecture - Visual Tree

## Complete Component Hierarchy

```
vCard Components
│
├─ Shared UI Primitives (src/components/vcard/shared/)
│  │
│  ├─ SectionHeader ✓
│  │  └─ Props: icon, title, subtitle?
│  │  └─ Used by: All customizers
│  │
│  ├─ ColorPicker ✓
│  │  └─ Props: label, value, onChange, showHex?
│  │  └─ Used by: TypographyEditor, BlocksCustomizer, GlobalCustomizer
│  │
│  ├─ RangeSlider ✓
│  │  └─ Props: label, value, min, max, step, onChange, formatValue?
│  │  └─ Used by: TypographyEditor, BlocksCustomizer, GlobalCustomizer
│  │
│  ├─ ToggleGroup ✓
│  │  └─ Props: label?, children
│  │  └─ Used by: TypographyEditor, BlocksCustomizer
│  │
│  ├─ ToggleItem ✓
│  │  └─ Props: active, onClick, icon, title?, label?
│  │  └─ Used by: TypographyEditor
│  │
│  └─ TypographyEditor ✓
│     ├─ Props: config, onChange, fonts?, weights?
│     ├─ Uses: ColorPicker, RangeSlider, ToggleGroup, ToggleItem
│     └─ Used by: ProfileCustomizer, BlocksCustomizer, GlobalCustomizer
│
├─ Appearance Customization (src/components/vcard/appearance/)
│  │
│  ├─ ThemeGallery ✓
│  │  ├─ Props: themes[], currentTheme, onSelectTheme, categories[]
│  │  ├─ State: activeCategory, searchQuery
│  │  ├─ Features: Filter, Search, Animated Grid, Selected Badge
│  │  └─ Used by: AppearanceEditor
│  │
│  ├─ ProfileCustomizer ✓
│  │  ├─ Props: theme, onThemeChange
│  │  ├─ Uses: TypographyEditor (3x - name, profession, bio)
│  │  └─ Used by: AppearancePanel
│  │
│  ├─ BlocksCustomizer ✓
│  │  ├─ Props: theme, onThemeChange
│  │  ├─ Uses:
│  │  │  ├─ SectionHeader (2x)
│  │  │  ├─ ToggleGroup (1x - button shapes)
│  │  │  ├─ ColorPicker (4x - button colors)
│  │  │  ├─ RangeSlider (1x - border width)
│  │  │  └─ TypographyEditor (1x - headers)
│  │  └─ Used by: AppearancePanel
│  │
│  ├─ GlobalCustomizer ✓
│  │  ├─ Props: theme, onThemeChange
│  │  ├─ Uses:
│  │  │  ├─ SectionHeader (3x)
│  │  │  ├─ ToggleGroup (2x - bg type, social style)
│  │  │  ├─ ColorPicker (3x - bg, accent, icon)
│  │  │  └─ RangeSlider (2x - blur, overlay)
│  │  ├─ Context: ProfileContext
│  │  └─ Used by: AppearancePanel
│  │
│  └─ AppearancePanel ✓
│     ├─ Props: theme, onThemeChange
│     ├─ State: activeTab ('profile' | 'blocks' | 'global')
│     ├─ Uses: ProfileCustomizer, BlocksCustomizer, GlobalCustomizer
│     ├─ Features: Tabbed Interface, Smooth Transitions
│     └─ Used by: AppearanceEditor, Future VCardPanel
│
├─ Link Management (src/components/vcard/links/) [Existing]
│  ├─ SortableLinkItem
│  ├─ AddLinkMenu
│  └─ LinksPanel
│
└─ Root (src/components/vcard/index.ts)
   └─ Exports: All above components + linkTypeUtils
```

## Usage Pyramid

```
                    AppearanceEditor
                           │
                ┌──────────┴──────────┐
                │                     │
           ThemeGallery        AppearancePanel
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
       ProfileCustomizer     BlocksCustomizer        GlobalCustomizer
              │                       │                       │
              └───┬───────────────────┼───────────────────────┘
                  │                   │
          TypographyEditor    ┌───────┴────────┐
              │ │ │           │                │
              │ └─────────────────────────────┘
              │
        ┌─────┴─────────────────────┐
        │                           │
    ColorPicker            RangeSlider  ToggleGroup
                                          │
                                    ToggleItem
```

## Component Dependency Graph

```
┌──────────────────────────────────────────────────────────────┐
│                      SectionHeader                            │
│                    (No dependencies)                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      ColorPicker                              │
│                    (No dependencies)                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     RangeSlider                               │
│                    (No dependencies)                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    ToggleGroup                                │
│                    (No dependencies)                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     ToggleItem                                │
│                    (No dependencies)                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  TypographyEditor                             │
│                  (Depends on: ↓)                              │
├──────────────────────────────────────────────────────────────┤
│  ├─ ColorPicker                                              │
│  ├─ RangeSlider                                              │
│  ├─ ToggleGroup                                              │
│  └─ ToggleItem                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   ThemeGallery                                │
│            (No vcard component dependencies)                  │
│   Uses: React, Framer Motion, useHaptic hook                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                ProfileCustomizer                              │
│                  (Depends on: ↓)                              │
├──────────────────────────────────────────────────────────────┤
│  ├─ SectionHeader                                            │
│  └─ TypographyEditor (3x)                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                BlocksCustomizer                               │
│                  (Depends on: ↓)                              │
├──────────────────────────────────────────────────────────────┤
│  ├─ SectionHeader (2x)                                       │
│  ├─ ToggleGroup (1x)                                         │
│  ├─ ColorPicker (4x)                                         │
│  ├─ RangeSlider (1x)                                         │
│  └─ TypographyEditor (1x)                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                GlobalCustomizer                               │
│                  (Depends on: ↓)                              │
├──────────────────────────────────────────────────────────────┤
│  ├─ SectionHeader (3x)                                       │
│  ├─ ToggleGroup (2x)                                         │
│  ├─ ColorPicker (3x)                                         │
│  ├─ RangeSlider (2x)                                         │
│  └─ ProfileContext (useProfile)                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  AppearancePanel                              │
│                  (Depends on: ↓)                              │
├──────────────────────────────────────────────────────────────┤
│  ├─ ProfileCustomizer                                        │
│  ├─ BlocksCustomizer                                         │
│  └─ GlobalCustomizer                                         │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
AppearanceEditor
       │
       ├─ READS: theme (from ProfileContext)
       ├─ WRITES: setTheme (to ProfileContext)
       │
       ├─── ThemeGallery
       │    ├─ READS: theme, themes[], categories[]
       │    ├─ MANAGES: activeCategory, searchQuery (local)
       │    └─ WRITES: onSelectTheme() callback
       │
       └─── AppearancePanel
            ├─ READS: theme
            ├─ MANAGES: activeTab (local state)
            │
            ├─── ProfileCustomizer (when activeTab='profile')
            │    ├─ READS: theme.profile.name/profession/bio
            │    ├─ USES: TypographyEditor x3
            │    └─ WRITES: onThemeChange()
            │
            ├─── BlocksCustomizer (when activeTab='blocks')
            │    ├─ READS: theme.buttons, theme.headers
            │    ├─ USES: ToggleGroup, ColorPicker, RangeSlider, TypographyEditor
            │    └─ WRITES: onThemeChange()
            │
            └─── GlobalCustomizer (when activeTab='global')
                 ├─ READS: theme.bg*, theme.accent*, theme.socials
                 ├─ READS: profile (from ProfileContext for SEO)
                 ├─ USES: ToggleGroup, ColorPicker, RangeSlider
                 ├─ WRITES: onThemeChange() for theme
                 └─ WRITES: updateProfile() for SEO
```

## Component Size & Complexity Matrix

```
                Simple          Medium          Complex
              Components       Components      Components
              ────────────────────────────────────────────
Primitive     • ColorPicker   • ToggleGroup
UI            • RangeSlider   • TypographyEditor
              • ToggleItem
              • SectionHeader

Composite                     • ProfileCustomizer
Components                     • BlocksCustomizer
                              • ThemeGallery

Container                                     • GlobalCustomizer
Components                                    • AppearancePanel
```

## Lines of Code Per Component

```
Primitive Components:
├─ SectionHeader.tsx       : 18 lines
├─ ColorPicker.tsx         : 23 lines
├─ RangeSlider.tsx         : 28 lines
├─ ToggleGroup.tsx         : 15 lines
├─ ToggleItem.tsx          : 21 lines
└─ TypographyEditor.tsx    : 108 lines
   Total:                    213 lines

Composite Components:
├─ ThemeGallery.tsx        : 117 lines
├─ ProfileCustomizer.tsx   : 47 lines
├─ BlocksCustomizer.tsx    : 128 lines
└─ GlobalCustomizer.tsx    : 165 lines
   Total:                    457 lines

Container:
└─ AppearancePanel.tsx     : 72 lines
   Total:                    72 lines

Grand Total Components:     742 lines
+ Index files:               30 lines
+ Total Implementation:      772 lines
+ Documentation:           ~1,500 lines
```

## Re-usability Index

```
Component              Used By (Count)  Re-usability Score
─────────────────────────────────────────────────────────
SectionHeader         All customizers   ⭐⭐⭐⭐⭐ Very High
ColorPicker           5 parent comps    ⭐⭐⭐⭐⭐ Very High
RangeSlider           5 parent comps    ⭐⭐⭐⭐⭐ Very High
ToggleGroup           2 parent comps    ⭐⭐⭐⭐  High
ToggleItem            1 parent comp     ⭐⭐⭐   Medium
TypographyEditor      3 parent comps    ⭐⭐⭐⭐⭐ Very High
ThemeGallery          AppearanceEditor  ⭐⭐⭐⭐  High
ProfileCustomizer     AppearancePanel   ⭐⭐⭐   Medium
BlocksCustomizer      AppearancePanel   ⭐⭐⭐   Medium
GlobalCustomizer      AppearancePanel   ⭐⭐⭐   Medium
AppearancePanel       Multiple pages    ⭐⭐⭐⭐⭐ Very High
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                   External Contexts                      │
├─────────────────────────────────────────────────────────┤
│  • ProfileContext (useProfile hook)                     │
│    ├─ Used by: GlobalCustomizer (updateProfile)        │
│    ├─ Used by: AppearanceEditor (setTheme)             │
│    └─ Used by: AppearancePanel (indirect)              │
│                                                         │
│  • HapticContext (useHaptic hook)                       │
│    ├─ Used by: ThemeGallery (trigger haptic)          │
│    ├─ Used by: AppearancePanel (trigger haptic)       │
│    └─ Granular: Category, tab, and theme selection    │
│                                                         │
│  • ThemeContext (implicit via props)                   │
│    ├─ Theme management through props-drilling         │
│    └─ All customizers receive via props               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   External Libraries                     │
├─────────────────────────────────────────────────────────┤
│  • Framer Motion                                        │
│    ├─ ThemeGallery animations (grid items)            │
│    ├─ AppearancePanel transitions (tab content)       │
│    └─ Smooth, production-ready animations             │
│                                                         │
│  • Lucide React Icons                                  │
│    ├─ SectionHeader icons                             │
│    ├─ ToggleItem icons                                │
│    └─ 50+ icon support                                │
│                                                         │
│  • Tailwind CSS                                        │
│    ├─ All styling (no CSS modules)                    │
│    ├─ Dark mode support                               │
│    └─ Responsive design                               │
│                                                         │
│  • React 19+                                           │
│    ├─ Latest React features                           │
│    ├─ Server Component ready                          │
│    └─ Concurrent rendering support                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Type Definitions                       │
├─────────────────────────────────────────────────────────┤
│  • From @/types/modernProfile.types:                   │
│    ├─ Theme                                            │
│    ├─ Typography                                       │
│    ├─ ButtonStyle                                      │
│    ├─ ThemeCategory                                    │
│    └─ Used by: All appearance components              │
└─────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
AppearanceEditor (Page Component)
│
├─ LOCAL STATE: None (delegates to context)
│
├─ CONTEXT STATE:
│  ├─ theme (from ProfileContext)
│  ├─ setTheme (from ProfileContext)
│  ├─ profile (from ProfileContext)
│  └─ updateProfile (from ProfileContext)
│
└─ CHILD STATE:
   │
   ├─ ThemeGallery
   │  ├─ LOCAL: activeCategory, searchQuery
   │  └─ PROPS: themes, currentTheme, onSelectTheme, categories
   │
   └─ AppearancePanel
      ├─ LOCAL: activeTab
      │
      ├─ ProfileCustomizer
      │  ├─ NO LOCAL STATE
      │  └─ PROPS: theme, onThemeChange
      │     ├─ TypographyEditor (Name)
      │     ├─ TypographyEditor (Profession)
      │     └─ TypographyEditor (Bio)
      │
      ├─ BlocksCustomizer
      │  ├─ NO LOCAL STATE
      │  └─ PROPS: theme, onThemeChange
      │     ├─ ToggleGroup (Shapes)
      │     ├─ ColorPickers (Colors)
      │     ├─ RangeSlider (Border)
      │     └─ TypographyEditor (Headers)
      │
      └─ GlobalCustomizer
         ├─ LOCAL: bgInputRef
         └─ PROPS: theme, onThemeChange
            ├─ ToggleGroup (BG Type)
            ├─ ColorPickers (Colors)
            ├─ RangeSliders (Effects)
            └─ Input fields (SEO)
```

## File Organization

```
src/components/vcard/
│
├── shared/                          [REUSABLE UI PRIMITIVES]
│   ├── SectionHeader.tsx           (Icon + Title Header)
│   ├── ColorPicker.tsx             (Color Input with Swatch)
│   ├── RangeSlider.tsx             (Slider with Display)
│   ├── ToggleGroup.tsx             (Button Group Container)
│   ├── ToggleItem.tsx              (Individual Toggle Button)
│   ├── TypographyEditor.tsx        (Typography Configuration)
│   ├── linkTypeUtils.ts            (Link utilities)
│   └── index.ts                    (Barrel export)
│
├── appearance/                      [THEME CUSTOMIZATION]
│   ├── ThemeGallery.tsx            (Theme Selection Grid)
│   ├── ProfileCustomizer.tsx       (Profile Typography)
│   ├── BlocksCustomizer.tsx        (Buttons & Headers)
│   ├── GlobalCustomizer.tsx        (Background, Colors, SEO)
│   ├── AppearancePanel.tsx         (Main Container)
│   └── index.ts                    (Barrel export)
│
├── links/                           [LINK MANAGEMENT]
│   ├── SortableLinkItem.tsx        (Link item)
│   ├── AddLinkMenu.tsx             (Link menu)
│   ├── LinksPanel.tsx              (Links panel)
│   └── index.ts                    (Barrel export)
│
└── index.ts                        [ROOT EXPORT]
```

---

**Legend**:
- ✓ = Successfully extracted
- ⭐ = Re-usability rating (1-5 stars)
- → = Dependency/import
- ≈ = Similar/related component

**Version**: 1.0
**Date**: 2026-01-31
**Status**: Complete & Production Ready
