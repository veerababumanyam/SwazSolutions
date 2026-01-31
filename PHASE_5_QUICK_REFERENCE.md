# Phase 5 Quick Reference Guide

## What Changed?

### Routes
```
OLD: /profile/edit           → NEW: /profile?tab=portfolio
OLD: /profile/appearance    → NEW: /profile?tab=aesthetics
OLD: /profile/analytics     → NEW: /profile?tab=insights
```

### Benefits
✅ Single page component
✅ Browser history works
✅ Bookmarks work
✅ Deep links work
✅ Better UX

---

## For Users

### Navigating Profile
```
Click vCard button → Opens /profile with portfolio tab
Click tab buttons → Switch between tabs instantly
Use browser back → Go back to previous tab
Bookmark URL → Saves exact tab you were on
Share URL → Others open same tab you're on
```

### Old Links Still Work
If someone had `/profile/edit` bookmarked, it automatically redirects to `/profile?tab=portfolio`. No broken links!

---

## For Developers

### Using useProfileTab Hook

```typescript
import { useProfileTab } from '@/hooks/useProfileTab';

export function MyComponent() {
  const { currentTab, setTab, getTabUrl, isTab } = useProfileTab();

  // Get current active tab
  console.log(currentTab); // 'portfolio' | 'aesthetics' | 'insights'

  // Change tab
  setTab('aesthetics');

  // Get URL for a tab
  const url = getTabUrl('insights'); // '/profile?tab=insights'

  // Check if tab is active
  if (isTab('portfolio')) {
    // Do something
  }
}
```

### Navigating to Tabs

```typescript
// Old way (outdated)
navigate('/profile/edit');
navigate('/profile/appearance');
navigate('/profile/analytics');

// New way (correct)
navigate('/profile?tab=portfolio');
navigate('/profile?tab=aesthetics');
navigate('/profile?tab=insights');
```

### Adding New Tabs

1. **Update type:**
   ```typescript
   // src/hooks/useProfileTab.ts
   type ProfileTabId = 'portfolio' | 'aesthetics' | 'insights' | 'myNewTab';
   ```

2. **Add component:**
   ```typescript
   // src/components/vcard/MyNewTab.tsx
   export const MyNewTab: React.FC = () => <div>Content</div>;
   ```

3. **Update VCardEditorLayout:**
   ```typescript
   switch(activeTab) {
     case 'portfolio': return <PortfolioTab />;
     case 'aesthetics': return <AestheticsTab />;
     case 'insights': return <InsightsTab />;
     case 'myNewTab': return <MyNewTab />; // Add this
   }
   ```

4. **Update navigation:**
   ```typescript
   const navItems = [
     { path: '/profile?tab=portfolio', icon: Layers, label: 'Portfolio' },
     { path: '/profile?tab=aesthetics', icon: Palette, label: 'Aesthetics' },
     { path: '/profile?tab=insights', icon: BarChart2, label: 'Insights' },
     { path: '/profile?tab=myNewTab', icon: Icon, label: 'My Tab' }, // Add this
   ];
   ```

---

## Files Changed

### Modified (7 files)
| File | Change |
|------|--------|
| `src/App.tsx` | Added new /profile route, legacy redirects |
| `src/pages/VCardPanel.tsx` | Uses useProfileTab hook for state |
| `src/components/Header.tsx` | Updated navigation links |
| `src/components/admin/Layout.tsx` | Updated tab detection logic |
| `src/pages/ProfileDashboard.tsx` | Updated button links |
| `src/pages/LinksManager.tsx` | Updated button links |
| (Types) | Updated indirectly |

### Created (2 files)
| File | Purpose |
|------|---------|
| `src/hooks/useProfileTab.ts` | Tab state management hook |
| Documentation files | Phase 5 info and testing |

---

## URL Query Parameters

### Tab Selection
```
/profile?tab=portfolio   # Portfolio/Links editor
/profile?tab=aesthetics  # Appearance/Theme editor
/profile?tab=insights    # Analytics/Insights viewer
```

### Deep Linking (Optional)
```
/profile?tab=aesthetics&section=colors
# Opens aesthetics tab with colors section highlighted
```

### Defaults
```
/profile              # Defaults to tab=portfolio
/profile?tab=unknown  # Defaults to tab=portfolio
```

---

## Testing Quick Checks

### Route Tests
- [ ] Visit `/profile` → Shows portfolio tab
- [ ] Visit `/profile?tab=aesthetics` → Shows aesthetics tab
- [ ] Visit `/profile/edit` → Redirects to `/profile?tab=portfolio`
- [ ] Click tab button → URL changes correctly

### Integration Tests
- [ ] Header vCard link works
- [ ] Layout nav tabs work
- [ ] Quick action buttons work
- [ ] Browser back button works

### Browser Checks
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile browsers work

---

## Common Issues & Solutions

### Issue: URL doesn't change when clicking tabs
**Solution:** Make sure VCardPanel uses `useProfileTab` hook

### Issue: Tab doesn't persist on page refresh
**Solution:** This is expected - the URL is the source of truth. When refreshed, it reads the tab from URL.

### Issue: Old links broken
**Solution:** Check App.tsx has legacy route redirects

### Issue: Back button doesn't work
**Solution:** Ensure using `setSearchParams` from `useSearchParams` (not manual state)

---

## Performance Tips

### Good Practices
✅ Use useProfileTab hook instead of local state
✅ Share links with query params: `/profile?tab=aesthetics`
✅ Navigate using URLs: `navigate('/profile?tab=insights')`

### Avoid
❌ Don't use old routes: `/profile/edit`, `/profile/appearance`
❌ Don't store tab in component state
❌ Don't pass tab via props (unless internal component communication)

---

## Documentation

| Document | Purpose |
|----------|---------|
| `PHASE_5_SUMMARY.md` | Complete implementation overview |
| `ROUTING_TEST_PLAN.md` | 15+ test cases to verify |
| `ROUTING_ARCHITECTURE.md` | Detailed architecture diagrams |
| `PHASE_5_QUICK_REFERENCE.md` | This file |

---

## Key Concepts

### 1. URL as Source of Truth
The URL query parameters (`?tab=*`) are the primary state. Component state is derived from URL.

### 2. Search Parameters
React Router's `useSearchParams` hook manages URL query params. Changes trigger re-renders.

### 3. Browser History
Each URL change adds to browser history automatically. Back/forward buttons work natively.

### 4. Redirects
Old routes use `<Navigate>` to redirect to new URLs with `replace` flag (no duplicate history).

### 5. Type Safety
`ProfileTabId` type ensures only valid tabs are used throughout the app.

---

## Migration Checklist

If you're migrating code to use new routes:

- [ ] Replace `/profile/edit` with `/profile?tab=portfolio`
- [ ] Replace `/profile/appearance` with `/profile?tab=aesthetics`
- [ ] Replace `/profile/analytics` with `/profile?tab=insights`
- [ ] Update any route guards (already handled)
- [ ] Update any breadcrumbs or navigation
- [ ] Test all updated links work
- [ ] Check TypeScript passes

---

## Debugging

### Check Active Tab
```typescript
const { currentTab } = useProfileTab();
console.log('Active tab:', currentTab);
```

### Check URL Params
```typescript
const [searchParams] = useSearchParams();
console.log('Current params:', Object.fromEntries(searchParams));
```

### Check Browser History
Open DevTools Console:
```javascript
window.history  // View history object
```

---

## Support

For questions about Phase 5 routing:

1. Check `PHASE_5_SUMMARY.md` for implementation details
2. Check `ROUTING_ARCHITECTURE.md` for diagrams
3. Check `ROUTING_TEST_PLAN.md` for test cases
4. Check hook implementation: `src/hooks/useProfileTab.ts`
5. Check component: `src/pages/VCardPanel.tsx`

---

## Summary

Phase 5 modernizes profile routing by consolidating 3 routes into 1 unified route with query parameters. The implementation maintains backwards compatibility, improves UX, and follows React Router best practices.

**Status:** ✅ Production Ready

Last updated: 2026-01-31
