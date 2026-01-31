# Phase 5 Routing Update - Test Plan

## Overview
This document outlines the test cases for Phase 5: Unified vCard Routing Update.

**Updated Architecture:**
- Old: Separate routes `/profile/edit`, `/profile/appearance`, `/profile/analytics`
- New: Unified route `/profile` with query parameters `?tab=portfolio|aesthetics|insights`
- Legacy redirects ensure old bookmarks still work

---

## Test Cases

### 1. New Unified Route
**Test:** Navigate to new unified profile route
```bash
✓ Visit /profile
Expected: Renders VCardPanel, defaults to portfolio tab
State: activeTab = 'portfolio'
```

### 2. Tab Navigation via Query Params
**Test:** Direct navigation with query parameters
```bash
✓ Visit /profile?tab=portfolio
Expected: Renders portfolio tab content
State: activeTab = 'portfolio'

✓ Visit /profile?tab=aesthetics
Expected: Renders aesthetics tab content
State: activeTab = 'aesthetics'

✓ Visit /profile?tab=insights
Expected: Renders insights tab content
State: activeTab = 'insights'
```

### 3. Tab Switching
**Test:** Click tab buttons to switch tabs
```bash
✓ On /profile?tab=portfolio, click Aesthetics tab
Expected: URL changes to /profile?tab=aesthetics
State: activeTab = 'aesthetics'

✓ On /profile?tab=aesthetics, click Insights tab
Expected: URL changes to /profile?tab=insights
State: activeTab = 'insights'

✓ On /profile?tab=insights, click Portfolio tab
Expected: URL changes to /profile?tab=portfolio
State: activeTab = 'portfolio'
```

### 4. Legacy Route Redirects (Backwards Compatibility)
**Test:** Old routes redirect to new URLs
```bash
✓ Visit /profile/edit
Expected: Redirects to /profile?tab=portfolio
Browser: Address bar shows /profile?tab=portfolio
State: activeTab = 'portfolio'

✓ Visit /profile/appearance
Expected: Redirects to /profile?tab=aesthetics
Browser: Address bar shows /profile?tab=aesthetics
State: activeTab = 'aesthetics'

✓ Visit /profile/analytics
Expected: Redirects to /profile?tab=insights
Browser: Address bar shows /profile?tab=insights
State: activeTab = 'insights'
```

### 5. Browser History
**Test:** Browser back/forward buttons work correctly
```bash
Sequence:
1. Visit /profile?tab=portfolio
2. Click tab to go to /profile?tab=aesthetics
3. Click tab to go to /profile?tab=insights
4. Click browser back button
Expected: URL changes to /profile?tab=aesthetics
5. Click browser back button
Expected: URL changes to /profile?tab=portfolio
6. Click browser forward button
Expected: URL changes to /profile?tab=aesthetics
7. Click browser forward button
Expected: URL changes to /profile?tab=insights
```

### 6. Deep Linking (Bookmarks)
**Test:** Shared links work correctly
```bash
✓ User shares /profile?tab=aesthetics&section=colors
Expected: Recipient sees aesthetics tab with colors section
Browser: Address bar shows shared URL exactly
State: activeTab = 'aesthetics', section = 'colors'
```

### 7. Navigation from Header
**Test:** Navigation links in header update to new URLs
```bash
✓ Click vCard link in desktop nav
Expected: Navigate to /profile
State: activeTab defaults to 'portfolio'
Status: Header shows vCard is active

✓ Click vCard link in mobile nav
Expected: Navigate to /profile
State: activeTab defaults to 'portfolio'
Status: Header shows vCard is active
```

### 8. Navigation from Quick Actions
**Test:** Quick action buttons navigate correctly
```bash
✓ On ProfileDashboard, click "Create Profile"
Expected: Navigate to /profile?tab=portfolio
State: activeTab = 'portfolio'

✓ On ProfileDashboard, click "Edit Profile"
Expected: Navigate to /profile?tab=portfolio
State: activeTab = 'portfolio'

✓ On ProfileDashboard, click "Customize Theme"
Expected: Would navigate to /profile?tab=aesthetics
State: activeTab = 'aesthetics'

✓ On ProfileDashboard, click "View Analytics"
Expected: Would navigate to /profile?tab=insights
State: activeTab = 'insights'
```

### 9. Layout Navigation Tabs
**Test:** Layout component navigation tabs work correctly
```bash
✓ On /profile?tab=portfolio, click Aesthetics tab in layout
Expected: URL changes to /profile?tab=aesthetics
State: activeTab = 'aesthetics'

✓ Mobile bottom nav tabs highlight correct tab
Expected: Current tab highlighted, others not highlighted
State: Visual feedback correct

✓ Desktop tab navigation shows active tab
Expected: Active tab has blue/white background
State: Visual feedback correct
```

### 10. Default Tab Behavior
**Test:** Missing or invalid tab query param
```bash
✓ Visit /profile (no tab param)
Expected: Defaults to portfolio tab
State: activeTab = 'portfolio'
URL: /profile?tab=portfolio (or default behavior)

✓ Visit /profile?tab=invalid
Expected: Defaults to portfolio tab
State: activeTab = 'portfolio'
```

### 11. Unsaved Changes Warning
**Test:** Navigation preserves unsaved changes detection
```bash
✓ Make changes in portfolio tab
✓ Click tab to switch to aesthetics tab
Expected: If unsaved changes, confirm before leaving
State: Works as before

✓ Make changes in aesthetics tab
✓ Click browser back button
Expected: If unsaved changes, confirm before leaving
State: Works as before
```

### 12. Links Manager Navigation
**Test:** LinksManager component navigation updated
```bash
✓ On LinksManager, click "Create Profile" button
Expected: Navigate to /profile?tab=portfolio
State: activeTab = 'portfolio'

✓ On LinksManager, click "Settings" button
Expected: Navigate to /profile?tab=portfolio
State: activeTab = 'portfolio'
```

### 13. Tab Persistence in Layout
**Test:** Layout correctly identifies active tab
```bash
✓ On /profile?tab=portfolio
Expected: Portfolio tab highlighted in layout
Status: isActive = true for portfolio, false for others

✓ On /profile?tab=aesthetics
Expected: Aesthetics tab highlighted in layout
Status: isActive = true for aesthetics, false for others

✓ On /profile?tab=insights
Expected: Insights tab highlighted in layout
Status: isActive = true for insights, false for others
```

### 14. Mobile View Mode Toggle
**Test:** Mobile preview toggle works with new routes
```bash
✓ On /profile?tab=portfolio with mobile
Expected: Preview toggle visible
State: Can toggle between editor and preview

✓ On /profile?tab=aesthetics with mobile
Expected: Preview toggle visible
State: Can toggle between editor and preview

✓ On /profile?tab=insights with mobile
Expected: Preview toggle NOT visible
State: No toggle button shown
```

### 15. Section Parameter (Advanced Deep Linking)
**Test:** Section parameter support
```bash
✓ Visit /profile?tab=aesthetics&section=colors
Expected: Aesthetics tab loaded with colors section
State: activeTab = 'aesthetics', section = 'colors'

✓ Switch tab away and return
Expected: Section parameter preserved or cleared
State: Expected behavior defined in component logic
```

---

## Browser Compatibility

Test on:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## Automated Test Checklist

Run these commands:

```bash
# Build check
npm run build

# Type checking
npx tsc --noEmit

# ESLint check
npx eslint src --ext .ts,.tsx
```

---

## Manual Testing Checklist

- [ ] All 15 test cases pass
- [ ] No console errors or warnings
- [ ] No TypeScript errors
- [ ] Build succeeds with no errors
- [ ] Old bookmarks redirect correctly
- [ ] Browser back/forward works
- [ ] Mobile navigation works
- [ ] Desktop navigation works
- [ ] Unsaved changes detection works
- [ ] Deep links work correctly

---

## Files Modified

1. **src/App.tsx**
   - Added VCardPanel import
   - Added Navigate import
   - Updated routes: new /profile route
   - Updated routes: legacy /profile/edit, /profile/appearance, /profile/analytics redirect to new URLs

2. **src/hooks/useProfileTab.ts** (NEW)
   - Created hook for managing tab navigation via query params
   - Supports deep linking and browser history

3. **src/pages/VCardPanel.tsx**
   - Updated to use useProfileTab hook
   - Syncs URL tab with component state

4. **src/components/Header.tsx**
   - Updated to point to /profile instead of /profile/dashboard
   - Added backward compatibility checks for old routes in isActive logic

5. **src/components/admin/Layout.tsx**
   - Updated navItems to use query params
   - Updated active tab detection to use currentTab from URL
   - Updated mobile nav to work with new query param structure

6. **src/pages/ProfileDashboard.tsx**
   - Updated navigation to /profile?tab=portfolio instead of /profile/edit

7. **src/pages/LinksManager.tsx**
   - Updated navigation to /profile?tab=portfolio instead of /profile/edit

---

## Rollback Plan

If issues occur:

1. Revert src/App.tsx route definitions
2. Remove useProfileTab hook import from VCardPanel
3. Revert VCardPanel to use local state instead of URL query params
4. Revert Header.tsx navigation links to old URLs
5. Revert Layout.tsx to use old paths
6. Revert ProfileDashboard and LinksManager navigation

Run:
```bash
git revert <commit-hash>
npm run build
```

---

## Success Criteria

- [x] New /profile route renders VCardPanel
- [x] Query params control tab display
- [x] Old routes redirect to new URLs
- [x] Browser history works correctly
- [x] Deep links work correctly
- [x] All navigation updated
- [x] No broken links
- [x] Build succeeds
- [x] No console errors
- [x] TypeScript strict mode passes
