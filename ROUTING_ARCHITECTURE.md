# Phase 5 Routing Architecture Guide

## Visual Route Map

### Before Phase 5
```
┌─────────────────────────────────────────────────────────────┐
│                    Profile Editing Routes                    │
└─────────────────────────────────────────────────────────────┘

/profile/edit
    ├─ Component: LinksEditor (in Layout)
    ├─ Purpose: Manage social links and portfolio
    └─ UI: Tabs, form inputs, preview

/profile/appearance
    ├─ Component: AppearanceEditor (in Layout)
    ├─ Purpose: Customize colors, fonts, styles
    └─ UI: Color pickers, font selectors, preview

/profile/analytics
    ├─ Component: AnalyticsDashboard (in Layout)
    ├─ Purpose: View profile statistics
    └─ UI: Charts, metrics, analytics

/profile/dashboard
    ├─ Component: ProfileDashboard
    ├─ Purpose: Summary view, quick actions
    └─ UI: Status cards, action buttons, QR code
```

### After Phase 5 (Current)
```
┌─────────────────────────────────────────────────────────────┐
│                  Unified Profile Route                       │
└─────────────────────────────────────────────────────────────┘

/profile
    └─ Component: VCardPanel (unified)
        ├─ ?tab=portfolio (default)
        │   ├─ Component: Portfolio Tab (was LinksEditor)
        │   ├─ Purpose: Manage social links and portfolio
        │   └─ State: activeTab = 'portfolio'
        │
        ├─ ?tab=aesthetics
        │   ├─ Component: Aesthetics Tab (was AppearanceEditor)
        │   ├─ Purpose: Customize colors, fonts, styles
        │   └─ State: activeTab = 'aesthetics'
        │
        └─ ?tab=insights
            ├─ Component: Insights Tab (was AnalyticsDashboard)
            ├─ Purpose: View profile statistics
            └─ State: activeTab = 'insights'

/profile/dashboard
    ├─ Component: ProfileDashboard (unchanged)
    ├─ Purpose: Summary view, quick actions
    └─ UI: Status cards, action buttons, QR code

Legacy Redirects:
    /profile/edit         → /profile?tab=portfolio
    /profile/appearance   → /profile?tab=aesthetics
    /profile/analytics    → /profile?tab=insights
```

---

## Route Resolution Flow

### New Route Resolution

```
User visits: /profile?tab=aesthetics

├─ App.tsx Routes
│  └─ Match: /profile path
│     └─ Render: <ProtectedRoute><VCardPanel /></ProtectedRoute>
│
├─ VCardPanel
│  └─ useProfileTab hook
│     ├─ Read searchParams: ?tab=aesthetics
│     ├─ Set currentTab = 'aesthetics'
│     └─ Pass activeTab to VCardEditorLayout
│
├─ VCardEditorLayout
│  └─ Render active tab based on activeTab prop
│
└─ Result: Aesthetics tab displayed
```

### Legacy Route Resolution

```
User visits: /profile/appearance

├─ App.tsx Routes
│  └─ Match: /profile/appearance path
│     └─ Render: <Navigate to="/profile?tab=aesthetics" replace />
│
├─ Browser
│  └─ Redirect to: /profile?tab=aesthetics
│
└─ (Repeats new route resolution above)
```

---

## Data Flow: Tab Navigation

### Scenario: User clicks "Aesthetics" tab

```
┌─────────────────────────────────────────────────────────────┐
│  1. User clicks tab button in VCardEditorLayout             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. onTabChange callback triggered: setTab('aesthetics')    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. useProfileTab.setTab() called                           │
│     └─ Updates searchParams via setSearchParams()          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. URL changes: /profile?tab=portfolio → /profile?tab=aesthetics
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. useProfileTab detects URL change                        │
│     └─ Returns new currentTab = 'aesthetics'               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. VCardPanelContent re-renders with activeTab='aesthetics'│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  7. VCardEditorLayout renders Aesthetics tab content       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  8. User sees: Aesthetics tab displayed                     │
│     URL bar shows: /profile?tab=aesthetics                  │
│     Browser history: Updated (back button enabled)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Old Architecture (Phase 4)

```
App
├─ Routes
│  ├─ Route /profile/edit
│  │  └─ ProtectedRoute
│  │     └─ Layout
│  │        └─ LinksEditor
│  │
│  ├─ Route /profile/appearance
│  │  └─ ProtectedRoute
│  │     └─ Layout
│  │        └─ AppearanceEditor
│  │
│  └─ Route /profile/analytics
│     └─ ProtectedRoute
│        └─ Layout
│           └─ AnalyticsDashboard
│
└─ (Multiple component instances)
```

### New Architecture (Phase 5)

```
App
├─ Routes
│  ├─ Route /profile
│  │  └─ ProtectedRoute
│  │     └─ VCardPanel (with ProfileProvider)
│  │        └─ VCardPanelContent
│  │           ├─ useProfileTab() hook
│  │           ├─ useProfile() hook
│  │           └─ VCardEditorLayout (unified UI)
│  │              └─ Active tab component
│  │                 (Portfolio / Aesthetics / Insights)
│  │
│  └─ Route /profile/edit, /profile/appearance, /profile/analytics
│     └─ Navigate (redirect)
│
└─ (Single unified component)
```

---

## State Management Flow

### URL as Source of Truth

```
┌─────────────────────────────────────────────────────────────┐
│                  URL Query Parameters                        │
│          (Primary source of truth for active tab)           │
│              /profile?tab=aesthetics                         │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ (Read/Write via useSearchParams)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              useProfileTab() Hook                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ currentTab: 'aesthetics' (derived from URL)         │   │
│  │ setTab(): Updates URL searchParams                  │   │
│  │ getTabUrl(): Generates URLs for links              │   │
│  │ isTab(): Checks if tab is active                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ (Props passed down)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│         VCardPanelContent Component                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ activeTab = currentTab (from useProfileTab)        │   │
│  │ onTabChange = setTab (from useProfileTab)          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ (Props passed down)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          VCardEditorLayout Component                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Renders tab UI based on activeTab prop            │   │
│  │ Calls onTabChange when user clicks tab            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Benefits of URL-based state:**
- Browser back/forward works natively
- Bookmarks save the exact tab
- Shareable deep links
- Survives page refreshes
- No state sync issues

---

## Navigation Links Update Map

### Header Component

**Before:**
```tsx
<Link to="/profile/dashboard">vCard</Link>
```

**After:**
```tsx
<Link to="/profile">vCard</Link>
```

### Layout Component

**Before:**
```tsx
const navItems = [
  { path: '/profile/edit', label: 'Portfolio' },
  { path: '/profile/appearance', label: 'Aesthetics' },
  { path: '/profile/analytics', label: 'Insights' },
];
```

**After:**
```tsx
const navItems = [
  { path: '/profile?tab=portfolio', label: 'Portfolio' },
  { path: '/profile?tab=aesthetics', label: 'Aesthetics' },
  { path: '/profile?tab=insights', label: 'Insights' },
];
```

### ProfileDashboard Component

**Before:**
```tsx
onClick={() => navigate('/profile/edit')}
```

**After:**
```tsx
onClick={() => navigate('/profile?tab=portfolio')}
```

### LinksManager Component

**Before:**
```tsx
onClick={() => navigate('/profile/edit')}
```

**After:**
```tsx
onClick={() => navigate('/profile?tab=portfolio')}
```

---

## URL Examples

### Basic Navigation

| URL | Result |
|-----|--------|
| `/profile` | Defaults to portfolio tab |
| `/profile?tab=portfolio` | Explicit portfolio tab |
| `/profile?tab=aesthetics` | Aesthetics tab |
| `/profile?tab=insights` | Insights tab |
| `/profile?tab=invalid` | Defaults to portfolio tab |

### Deep Linking

| URL | Result |
|-----|--------|
| `/profile?tab=aesthetics&section=colors` | Aesthetics tab, colors section |
| `/profile?tab=insights&section=monthly` | Insights tab, monthly section |

### Legacy Routes (Redirects)

| Old URL | Redirects To |
|---------|--------------|
| `/profile/edit` | `/profile?tab=portfolio` |
| `/profile/appearance` | `/profile?tab=aesthetics` |
| `/profile/analytics` | `/profile?tab=insights` |

---

## Browser History Example

### User Journey and Browser History

```
Action 1: Click vCard in header
│
├─ Navigate to: /profile
├─ Browser history: [ /profile ]
└─ Active tab: portfolio (default)

Action 2: Click Aesthetics tab
│
├─ Navigate to: /profile?tab=aesthetics
├─ Browser history: [ /profile, /profile?tab=aesthetics ]
└─ Active tab: aesthetics

Action 3: Click Insights tab
│
├─ Navigate to: /profile?tab=insights
├─ Browser history: [ /profile, /profile?tab=aesthetics, /profile?tab=insights ]
└─ Active tab: insights

Action 4: Click browser back button
│
├─ Navigate back: /profile?tab=aesthetics
├─ Browser history: [ /profile, /profile?tab=aesthetics, /profile?tab=insights ]
│                     ^ cursor here
└─ Active tab: aesthetics

Action 5: Click browser back button
│
├─ Navigate back: /profile
├─ Browser history: [ /profile, /profile?tab=aesthetics, /profile?tab=insights ]
│                     ^ cursor here
└─ Active tab: portfolio

Action 6: Click browser forward button
│
├─ Navigate forward: /profile?tab=aesthetics
├─ Browser history: [ /profile, /profile?tab=aesthetics, /profile?tab=insights ]
│                                 ^ cursor here
└─ Active tab: aesthetics
```

---

## Performance Characteristics

### Single Page Load
- **Before:** 3 separate route loads (one per tab)
- **After:** 1 route load, tabs switch via state update
- **Improvement:** No page reloads when switching tabs

### Memory Usage
- **Before:** Multiple component instances in DOM
- **After:** Single component instance, tab UI swapped
- **Improvement:** Reduced memory footprint

### Initial Load Time
- **Before:** Load /profile/edit, then switch tabs = 3x load time
- **After:** Load /profile once, switch tabs instantly
- **Improvement:** Faster perceived performance

### URL Updates
- **Before:** Full page navigation (Layout wrapper reloads)
- **After:** URL update via searchParams (instant, no page reload)
- **Improvement:** Smooth user experience

---

## Testing Checklist By Component

### App.tsx Routes
- [ ] New /profile route renders VCardPanel
- [ ] Old /profile/edit redirects to /profile?tab=portfolio
- [ ] Old /profile/appearance redirects to /profile?tab=aesthetics
- [ ] Old /profile/analytics redirects to /profile?tab=insights
- [ ] Redirect uses `replace` flag (no duplicate history)

### useProfileTab Hook
- [ ] Returns currentTab from URL
- [ ] setTab updates URL correctly
- [ ] getTabUrl generates correct URLs
- [ ] isTab checks work correctly

### VCardPanel Component
- [ ] Uses useProfileTab hook
- [ ] Passes activeTab to VCardEditorLayout
- [ ] onTabChange calls setTab

### Layout Component
- [ ] Navigation items use query param URLs
- [ ] Active tab detection works
- [ ] Mobile nav works with new URLs
- [ ] Desktop nav works with new URLs

### Header Component
- [ ] vCard link points to /profile
- [ ] isActive logic includes /profile
- [ ] Mobile menu vCard link works

### Navigation Links
- [ ] ProfileDashboard buttons navigate to /profile?tab=portfolio
- [ ] LinksManager buttons navigate to /profile?tab=portfolio

---

## Migration Guide

If you need to add new tabs in the future:

1. **Update type definition:**
   ```typescript
   type ProfileTabId = 'portfolio' | 'aesthetics' | 'insights' | 'newTab';
   ```

2. **Add tab component:**
   ```typescript
   // src/components/vcard/NewTabComponent.tsx
   export const NewTabComponent: React.FC = () => {
     return <div>New Tab Content</div>;
   };
   ```

3. **Update VCardEditorLayout:**
   ```typescript
   case 'newTab':
     return <NewTabComponent />;
   ```

4. **Add to layout nav items:**
   ```typescript
   { path: '/profile?tab=newTab', icon: Icon, label: 'New Tab' }
   ```

5. **Update redirect (if needed):**
   ```typescript
   <Route path="/profile/newtab" element={<Navigate to="/profile?tab=newTab" replace />} />
   ```

---

## Conclusion

The Phase 5 routing update modernizes the profile editing experience by:
1. Consolidating 3 routes into 1
2. Using URL as the source of truth
3. Enabling better browser integration
4. Improving user experience
5. Maintaining backwards compatibility

The architecture is clean, maintainable, and ready for future enhancements.
