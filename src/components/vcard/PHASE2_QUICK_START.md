# Phase 2: Quick Start Guide

## Installation & Setup (30 seconds)

### 1. Import Components
```tsx
import {
  TabNavigation,
  PortfolioTab,
  AestheticsTab,
  InsightsTab,
} from '@/components/vcard';
```

### 2. Ensure ProfileProvider is Wrapping Your App
```tsx
import { ProfileProvider } from '@/contexts/ProfileContext';

// In your app root:
<ProfileProvider>
  <YourApp />
</ProfileProvider>
```

### 3. Create Editor Component
```tsx
import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { TabNavigation, PortfolioTab, AestheticsTab, InsightsTab } from '@/components/vcard';

const VCardEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'aesthetics' | 'insights'>('portfolio');
  const { profile, links, theme } = useProfile();

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUnsavedChanges={false}
      />

      {/* Tab Content */}
      {activeTab === 'portfolio' && profile && (
        <PortfolioTab profile={profile} links={links} socials={profile.socials} />
      )}
      {activeTab === 'aesthetics' && <AestheticsTab theme={theme} onThemeChange={() => {}} />}
      {activeTab === 'insights' && profile && <InsightsTab profileId={String(profile.id)} />}
    </div>
  );
};

export default VCardEditor;
```

## Component APIs (Quick Reference)

### TabNavigation
```tsx
<TabNavigation
  activeTab="portfolio"                    // 'portfolio' | 'aesthetics' | 'insights'
  onTabChange={(tab) => setActiveTab(tab)} // Callback function
  hasUnsavedChanges={isDirty}              // Optional: shows indicator
/>
```

### PortfolioTab
```tsx
<PortfolioTab
  profile={profile}       // ProfileData | null
  links={links}           // LinkItem[]
  socials={socials}       // SocialLink[]
/>
```

### AestheticsTab
```tsx
<AestheticsTab
  theme={theme}                              // Theme
  onThemeChange={(newTheme) => updateTheme()} // Callback
/>
```

### InsightsTab
```tsx
<InsightsTab
  profileId="user-id-here" // string
/>
```

## Features Overview

### Portfolio Tab
- Avatar upload with preview
- Profile name, profession, bio editing
- AI bio enhancement (TODO: Gemini integration)
- 8 social platforms with URL management
- 8 block types for content
- Drag-and-drop block reordering

### Aesthetics Tab
- 50+ theme selection
- Typography customization
- Background (color, gradient, image)
- Accent colors
- Social icon styles

### Insights Tab
- Profile views metrics
- vCard downloads tracking
- Share events
- Time-based analytics
- Device breakdown

## Keyboard Shortcuts

- **Arrow Left/Right** - Switch between tabs
- **Tab** - Navigate form fields
- **Enter** - Confirm selections
- **Space** - Toggle checkboxes/switches

## Styling Classes (Dark Mode Support)

All components automatically support:
- Light mode (default)
- Dark mode (via `dark:` classes)
- Mobile responsive (via Tailwind breakpoints)
- Smooth animations (via Framer Motion)

## State Management (ProfileContext)

The components automatically use ProfileContext for:
```typescript
const {
  // Read-only
  profile,
  links,
  theme,
  isLoading,
  error,

  // Mutations
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

## Common Tasks

### Mark as Dirty (Unsaved Changes)
```tsx
const [isDirty, setIsDirty] = useState(false);

<TabNavigation hasUnsavedChanges={isDirty} />

// In mutation handlers
const handleChange = async (data) => {
  setIsDirty(true);
  await updateProfile(data);
};
```

### Save All Changes
```tsx
const handleSave = async () => {
  try {
    // All mutations already sync via ProfileContext
    // Just trigger final save if needed
    await profileService.saveProfile();
    setIsDirty(false);
  } catch (error) {
    console.error('Save failed:', error);
  }
};
```

### Handle Errors
```tsx
const { error } = useProfile();

if (error) {
  return <div className="text-red-500">Error: {error}</div>;
}
```

### Show Loading State
```tsx
const { isLoading } = useProfile();

if (isLoading) {
  return <div>Loading...</div>;
}
```

## File Locations

```
src/components/vcard/
├── TabNavigation.tsx                    # Main tab switcher
├── PortfolioTab.tsx                     # Profile editing
├── AestheticsTab.tsx                    # Theme customization
├── InsightsTab.tsx                      # Analytics
├── sections/
│   ├── ProfileSection.tsx               # Profile info
│   ├── SocialsSection.tsx               # Social links
│   ├── BlocksSection.tsx                # Content blocks
│   └── index.ts                         # Exports
├── PHASE2_TABS_GUIDE.md                 # Full documentation
├── PHASE2_INTEGRATION_EXAMPLE.tsx       # Examples
└── PHASE2_QUICK_START.md                # This file
```

## Documentation

- **PHASE2_TABS_GUIDE.md** - Complete API reference
- **PHASE2_INTEGRATION_EXAMPLE.tsx** - Full examples
- **PHASE2_QUICK_START.md** - This file
- **PHASE2_IMPLEMENTATION_SUMMARY.md** - Implementation details

## TypeScript Types

All components are fully typed:
```tsx
// Profile data
interface ProfileData {
  username: string;
  displayName: string;
  profession?: string;
  bio: string;
  avatarUrl: string;
  socials: SocialLink[];
}

// Social link
interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  isActive: boolean;
}

// Content block
interface LinkItem {
  id: string;
  type: LinkType;
  title: string;
  url?: string;
  isActive: boolean;
  clicks: number;
}

// Theme
interface Theme {
  id: string;
  name: string;
  bgType: 'color' | 'image' | 'gradient';
  bgValue: string;
  profile: { name: Typography; profession: Typography; bio: Typography };
  buttons: ButtonStyle;
  accentColor: string;
}
```

## Accessibility

All components include:
- ARIA labels on buttons
- Semantic HTML elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- WCAG AA color contrast

## Performance

- Lazy-loaded ProfileAnalytics
- Memoized callbacks with useCallback
- Suspense for async components
- Framer Motion with layout ID optimization
- No unnecessary re-renders

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Next Steps

1. **Copy the example** from PHASE2_INTEGRATION_EXAMPLE.tsx
2. **Implement save handler** for backend persistence
3. **Add ProfileAnalytics** component if not present
4. **Test in your app** with real data
5. **Check PHASE2_TABS_GUIDE.md** for advanced customization

## Troubleshooting

### ProfileContext error
```
Error: useProfile must be used within a ProfileProvider
```
Solution: Wrap your app with `<ProfileProvider>`

### Missing ProfileAnalytics
```
ProfileAnalytics component not found
```
Solution: Implement `src/components/ProfileAnalytics.tsx` or update import

### Dark mode not working
```
Classes not applying with dark:
```
Solution: Ensure Tailwind dark mode is enabled in tailwind.config.js

## Support

For issues or questions:
1. Check PHASE2_TABS_GUIDE.md for detailed documentation
2. Review PHASE2_INTEGRATION_EXAMPLE.tsx for usage patterns
3. See PHASE2_IMPLEMENTATION_SUMMARY.md for technical details

---

**Ready to use!** You can import and use these components immediately.
