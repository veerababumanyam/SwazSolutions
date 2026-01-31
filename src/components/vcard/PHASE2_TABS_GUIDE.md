# Phase 2: vCard Editor Tabbed Interface Guide

## Overview

Phase 2 implements a three-tab interface for the vCard editor, organizing content into logical sections:
1. **Portfolio Tab** - Profile info, social links, content blocks
2. **Aesthetics Tab** - Theme customization, typography, background
3. **Insights Tab** - Analytics and metrics display

## Component Structure

### Main Tab Components

#### 1. **TabNavigation.tsx** (80-120 lines)
The tab switcher at the top of the editor pane.

**Features:**
- Three tabs: Portfolio | Aesthetics | Insights
- Icons for each tab (Briefcase, Palette, BarChart3)
- Active tab highlighted with blue underline + background
- Unsaved changes indicator (orange dot on active tab)
- Keyboard navigation (Arrow Left/Right to switch tabs)
- Smooth Framer Motion transitions
- Full accessibility (ARIA labels, semantic HTML)

**Props:**
```typescript
interface TabNavigationProps {
  activeTab: 'portfolio' | 'aesthetics' | 'insights';
  onTabChange: (tab: 'portfolio' | 'aesthetics' | 'insights') => void;
  hasUnsavedChanges?: boolean;
}
```

**Usage:**
```tsx
<TabNavigation
  activeTab={activeTab}
  onTabChange={setActiveTab}
  hasUnsavedChanges={isDirty}
/>
```

#### 2. **PortfolioTab.tsx** (150-200 lines)
Main editing tab combining three sections.

**Structure:**
- Integrates ProfileSection, SocialsSection, BlocksSection
- Real-time preview updates on field changes
- Handles all profile, social, and block mutations

**Props:**
```typescript
interface PortfolioTabProps {
  profile: ProfileData | null;
  links: LinkItem[];
  socials: SocialLink[];
}
```

**Features:**
- Avatar upload with preview
- Display name, profession, bio fields
- AI bio enhancement button (uses Gemini API - TODO)
- Social media platform toggles with URL editors
- Block type grid for adding new blocks
- Drag-and-drop block reordering (via LinksPanel)

#### 3. **AestheticsTab.tsx** (100-150 lines)
Theme customization tab.

**Structure:**
- ThemeGallery for browsing themes
- TypographyEditor for text customization
- GlobalCustomizer for background and accent colors

**Props:**
```typescript
interface AestheticsTabProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}
```

**Features:**
- Live preview updates when changing theme
- 50+ theme cards with category filters
- Font family, size, weight, color customization
- Background color, gradient, or image with effects
- Accent color picker
- Social icon style selector
- Undo/Revert to template button

#### 4. **InsightsTab.tsx** (100-150 lines)
Analytics and metrics display tab.

**Props:**
```typescript
interface InsightsTabProps {
  profileId: string;
}
```

**Features:**
- Lazy-loaded ProfileAnalytics component (read-only)
- Quick stats cards (Views, Downloads, Shares)
- Time series charts (7, 30, 90 days)
- Device and referrer breakdown
- Error boundary with fallback UI
- Suspense loading skeleton

### Section Components

#### 1. **ProfileSection.tsx** (80-120 lines)
Profile information editing.

**Components:**
- Avatar upload with drag-over feedback
- Display name input
- Professional title/role input
- Bio textarea with character count
- AI enhance button for bio

**Props:**
```typescript
interface ProfileSectionProps {
  profile: ProfileData | null;
  onProfileChange: (updates: Partial<ProfileData>) => Promise<void>;
  onAIEnhance: () => Promise<void>;
  isEnhancing?: boolean;
}
```

#### 2. **SocialsSection.tsx** (100-150 lines)
Social media links management.

**Components:**
- Toggle grid for 8 platforms (Instagram, Twitter, LinkedIn, Email, Website, YouTube, GitHub, Facebook)
- Expandable editor for each active social
- URL input with platform-specific placeholder
- Remove button for each social

**Props:**
```typescript
interface SocialsSectionProps {
  socials: SocialLink[];
  onAddSocial: (platform: SocialPlatform) => Promise<void>;
  onUpdateSocial: (id: string, updates: Partial<SocialLink>) => Promise<void>;
  onRemoveSocial: (id: string) => Promise<void>;
}
```

**Platforms Supported:**
- instagram, twitter, linkedin, email, website, youtube, github, facebook, tiktok (extensible)

#### 3. **BlocksSection.tsx** (100-150 lines)
Content blocks management.

**Components:**
- Block type icon grid (3-4 columns)
- "Add Block" button for each type
- Embedded LinksPanel for managing existing blocks
- Drag-and-drop reordering support

**Block Types:**
- CLASSIC - Simple link
- HEADER - Section header
- GALLERY - Image gallery
- VIDEO_EMBED - Embedded video
- CONTACT_FORM - Contact form
- MAP_LOCATION - Location map
- FILE_DOWNLOAD - Downloadable file
- CUSTOM_LINK - Custom block with icon

**Props:**
```typescript
interface BlocksSectionProps {
  links: LinkItem[];
  onAddBlock: (type: LinkType) => Promise<void>;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => Promise<void>;
  onToggleBlockActive: (blockId: string) => Promise<void>;
  onReorderBlocks: (newOrder: LinkItem[]) => Promise<void>;
  isLoading?: boolean;
}
```

## Integration Guide

### Using All Tabs Together

Create a parent component that manages the active tab and passes data:

```tsx
import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { TabNavigation, PortfolioTab, AestheticsTab, InsightsTab } from '@/components/vcard';

const VCardEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'aesthetics' | 'insights'>('portfolio');
  const { profile, links, theme } = useProfile();

  return (
    <div className="space-y-6">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUnsavedChanges={isDirty}
      />

      {activeTab === 'portfolio' && (
        <PortfolioTab profile={profile} links={links} socials={profile?.socials || []} />
      )}

      {activeTab === 'aesthetics' && (
        <AestheticsTab theme={theme} onThemeChange={setTheme} />
      )}

      {activeTab === 'insights' && <InsightsTab profileId={profile?.id || ''} />}
    </div>
  );
};

export default VCardEditor;
```

### Using Individual Components

Each tab and section can be used independently:

```tsx
// Just the tab navigation
<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

// Just the portfolio section
<ProfileSection profile={profile} onProfileChange={handleUpdate} />

// Just social management
<SocialsSection socials={socials} onAddSocial={handleAdd} />
```

## Styling & Theme Support

All components include:
- **Dark mode support** via Tailwind classes (dark:)
- **Responsive design** - Adapts to mobile, tablet, desktop
- **Framer Motion transitions** - Smooth animations between states
- **Semantic HTML** - Proper a11y with ARIA labels
- **Consistent spacing** - Uses TailwindCSS scale (4px base unit)
- **Rounded corners** - 2xl (16px) default for containers, xl/lg for inputs

### Color Scheme

**Light Mode:**
- Background: white (#FFFFFF)
- Text: gray-900
- Borders: gray-200
- Hover: gray-50/100
- Accent: blue-500

**Dark Mode:**
- Background: white/5 (semi-transparent white)
- Text: white
- Borders: white/10
- Hover: white/5-10
- Accent: blue-500 (same)

## Error Handling

### ProfileSection
- Graceful fallback if profile is null
- Character count for bio

### SocialsSection
- Automatic platform validation
- URL format hints via placeholder
- Expandable error messages

### BlocksSection
- Loading state for add/delete operations
- Drag-and-drop error recovery
- Empty state with CTA

### InsightsTab
- Error Boundary component for ProfileAnalytics
- Suspense loading skeleton
- Network error fallback

## Performance Optimizations

1. **Lazy loading** - ProfileAnalytics uses lazy()
2. **Memoization** - useCallback for handlers
3. **Suspense** - Async component loading with skeleton
4. **Motion optimization** - layoutId for efficient animations
5. **Code splitting** - Each tab can be loaded separately

## Accessibility Features

- **Keyboard navigation** - Arrow keys to switch tabs
- **ARIA labels** - All buttons and inputs have proper labels
- **Semantic HTML** - Using <button>, <input>, <textarea> elements
- **Focus management** - Tab stops flow logically
- **Screen reader support** - Proper roles and descriptions
- **Color contrast** - WCAG AA compliant

## State Management

All components use the ProfileContext hook:

```typescript
const {
  profile,
  links,
  theme,
  updateProfile,
  addLink,
  updateLink,
  removeLink,
  reorderLinks,
  addSocialLink,
  updateSocialLink,
  removeSocialLink,
  setTheme,
  saveThemeCustomization,
} = useProfile();
```

## TODOs & Future Enhancements

### ProfileSection
- [ ] Integrate image cropper for avatar editing
- [ ] AI bio enhancement with Gemini API
- [ ] Bio suggestion based on profession

### SocialsSection
- [ ] Profile URL validation
- [ ] Auto-detect social platform from URL
- [ ] Custom social platform support

### BlocksSection
- [ ] Block editor modal for advanced settings
- [ ] Block templates/presets
- [ ] Bulk edit operations

### AestheticsTab
- [ ] Template gallery/browser (Phase 4)
- [ ] Font upload support
- [ ] Advanced typography controls
- [ ] Theme duplication/customization

### InsightsTab
- [ ] Real-time analytics updates via WebSocket
- [ ] Custom date range picker
- [ ] Export analytics as PDF/CSV
- [ ] Conversion tracking

## Files Created

```
src/components/vcard/
├── TabNavigation.tsx (new)
├── PortfolioTab.tsx (new)
├── AestheticsTab.tsx (new)
├── InsightsTab.tsx (new)
└── sections/
    ├── ProfileSection.tsx (new)
    ├── SocialsSection.tsx (new)
    ├── BlocksSection.tsx (new)
    └── index.ts (new)
```

## Testing Checklist

- [ ] Tab switching with click
- [ ] Tab switching with keyboard arrows
- [ ] Unsaved changes indicator appears
- [ ] Profile fields update in real-time
- [ ] Avatar upload shows preview
- [ ] Social platform toggle enable/disable
- [ ] Social URL editing expands/collapses
- [ ] Block add buttons work for all types
- [ ] Block drag-and-drop reordering works
- [ ] Theme selection updates live preview
- [ ] Dark mode classes apply correctly
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation flows properly
- [ ] Error states display correctly
- [ ] Analytics loads with data

## Related Components

- `ProfileContext` - State management
- `LinksPanel` - Block list and reordering
- `ThemeGallery` - Theme selection
- `TypographyEditor` - Typography customization
- `GlobalCustomizer` - Background and colors
- `ProfileAnalytics` - Analytics display (lazy loaded)
- `SectionHeader` - Reusable section title
- `ColorPicker` - Color input component
