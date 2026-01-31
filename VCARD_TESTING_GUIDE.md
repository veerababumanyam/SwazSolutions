# VCardPanel Phase 2 - Testing Guide

## Prerequisites

- Development server running: `npm run dev`
- Browser DevTools open
- Test data loaded via ProfileContext

## Test Categories

### 1. Layout Responsiveness Tests

#### Test 1.1: Desktop Layout (1280px+)

**Setup:**
1. Open http://localhost:5173/profile
2. DevTools → Responsive Mode (Ctrl+Shift+M)
3. Set viewport to 1440x900

**Expected Results:**
- Editor pane on left (60% width)
- Preview pane on right (40% width, fixed 480px)
- Save bar at bottom, full width
- Gap of 24px between panes
- Max width container at 7xl (80rem)

**Test Steps:**
```
1. Scroll editor content → preview stays visible
2. Scroll preview content → preview scrolls independently
3. Resize window slightly → no layout jank
4. Refresh page → layout correct on load
5. Check padding/margins are consistent
```

**Pass Criteria:**
- ✅ Split pane visible and properly sized
- ✅ Preview sticky when scrolling editor
- ✅ No layout shift on scroll
- ✅ All content readable
- ✅ Save bar stays at bottom

---

#### Test 1.2: Tablet Layout (768-1279px)

**Setup:**
1. DevTools → Set viewport to 1024x768

**Expected Results:**
- Editor pane on left (50% width)
- Preview pane on right (50% width)
- Save bar at bottom, full width
- Gap of 24px between panes
- Proper padding adjustments

**Test Steps:**
```
1. Scroll editor → preview sticky
2. Resize to 800px → responsive
3. Resize to 1100px → still tablet layout
4. Scroll to bottom → save bar visible
```

**Pass Criteria:**
- ✅ 50/50 split visible
- ✅ Preview sticky
- ✅ Readable at all tablet sizes
- ✅ Touch targets 48px+ (if mobile testing)

---

#### Test 1.3: Mobile Layout (<768px)

**Setup:**
1. DevTools → Set viewport to 375x667 (iPhone SE)

**Expected Results:**
- Single column layout
- Editor pane at top (full width)
- Preview pane below editor
- Preview collapsed by default
- Save bar at bottom (condensed)
- Touch-friendly buttons (48px minimum)

**Test Steps:**
```
1. Load page → editor visible, preview hidden
2. Scroll editor content → editor scrolls
3. Find "Show Preview" button → visible
4. Click "Show Preview" → preview expands with animation
5. Scroll preview → preview scrolls independently
6. Click "Hide Preview" → preview collapses
7. Scroll to bottom → save bar visible
8. Resize to 500px → still mobile layout
9. Resize to 768px → switches to tablet layout
```

**Pass Criteria:**
- ✅ Mobile layout when < 768px
- ✅ Preview toggle works
- ✅ Smooth expand/collapse animation
- ✅ All buttons touch-friendly (48px+)
- ✅ No horizontal scroll
- ✅ Text readable without zoom

---

### 2. Tab Navigation Tests

#### Test 2.1: Tab Switching

**Setup:**
1. Load page with all content visible
2. DevTools → Responsive mode at 1440x900

**Test Steps:**
```
1. Click "Portfolio" tab
   → Content transitions to Portfolio
   → Animation smooth (200ms)
   → Tab has active styling
   → Content visible in editor pane

2. Click "Aesthetics" tab
   → Smooth transition to Aesthetics
   → Previous content hidden
   → Aesthetics content shows
   → Save bar shows "Unsaved changes" if any

3. Click "Insights" tab
   → Transitions to Insights
   → All interactive elements visible

4. Click "Portfolio" again
   → Returns to Portfolio content
   → State preserved (scroll position)
```

**Pass Criteria:**
- ✅ All three tabs clickable
- ✅ Content transitions smoothly
- ✅ Tab shows active state (bg color, text color)
- ✅ Animation completes in ~200ms
- ✅ No jank or stuttering

---

#### Test 2.2: Keyboard Navigation

**Setup:**
1. Load page at desktop resolution
2. Click somewhere in the page to give focus

**Test Steps:**
```
1. Press Tab repeatedly
   → Focus moves: Portfolio tab → Aesthetics → Insights → Save button → Cancel → Publish → (back to Portfolio)
   → Focus ring visible on each element (purple/blue ring)

2. With focus on a tab, press Enter
   → Tab activates (content changes)
   → Focus stays on tab

3. With focus on Save button, press Enter
   → Save operation triggers (if unsaved changes)

4. With focus on Cancel button, press Enter
   → Confirmation dialog appears (if unsaved changes)

5. With focus on Publish button, press Enter
   → Publish operation triggers
```

**Pass Criteria:**
- ✅ Tab key navigates forward
- ✅ Shift+Tab navigates backward
- ✅ Enter activates buttons
- ✅ Focus ring always visible
- ✅ Focus order logical (top to bottom, left to right)

---

### 3. Change Detection Tests

#### Test 3.1: Unsaved Changes Indicator

**Setup:**
1. Load page at desktop
2. Ensure no pending changes

**Test Steps:**
```
1. Initial state
   → Save button: DISABLED (grayed out)
   → Status: "Saved X minutes ago"
   → Unsaved dot: NOT visible on active tab

2. Simulate profile change (via ProfileContext)
   → Save button: ENABLED (blue)
   → Status: "Unsaved changes" (amber color)
   → Unsaved dot: VISIBLE on active tab (small red dot)

3. Switch tabs while unsaved
   → Unsaved dot follows active tab
   → Status shows "Unsaved changes"
   → All 3 tabs can show unsaved (if changes across all)

4. Click Save
   → Save button: DISABLED again
   → Status: "Saved now" (green)
   → Unsaved dot: DISAPPEARS
   → Timestamp updates

5. Wait 1 minute
   → Status updates: "Saved 1m ago"
   → Timestamp continues updating
```

**Pass Criteria:**
- ✅ Indicator appears when changes made
- ✅ Indicator disappears after save
- ✅ Indicator shows on active tab
- ✅ Status message accurate
- ✅ Save button enabled/disabled correctly

---

#### Test 3.2: Browser Close Warning

**Setup:**
1. Load page at desktop
2. Make some changes (simulate via profile context)

**Test Steps:**
```
1. With unsaved changes, close browser tab
   → Browser shows confirmation dialog
   → Message: "You have unsaved changes. Do you want to leave?"
   → Options: "Cancel" / "Leave"

2. Click "Cancel"
   → Page stays open
   → No changes lost
   → Can save changes

3. Make changes again
4. Close tab and click "Leave"
   → Page closes
   → No error

5. Reload page (make changes)
6. Navigate to different URL
   → Same confirmation appears
   → Can stay or leave
```

**Pass Criteria:**
- ✅ Warning shows with unsaved changes
- ✅ Warning uses browser's native dialog
- ✅ Cancel keeps page open
- ✅ Leave closes page
- ✅ No warning when no changes
- ✅ Works on tab close and navigation

---

### 4. Save/Publish/Cancel Tests

#### Test 4.1: Save Button

**Setup:**
1. Load page with changes in progress
2. Make a profile change

**Test Steps:**
```
1. Click Save button
   → Button shows loading spinner
   → Button disabled
   → Save bar shows "Saving..."
   → API call happens (check Network tab)

2. After API response (successful)
   → Loading spinner disappears
   → Button re-enables
   → Status shows "Saved now" (green)
   → Save button becomes disabled again
   → Unsaved indicator disappears

3. Wait 5 seconds
   → Status updates: "Saved 5s ago"

4. Wait 1 minute
   → Status updates: "Saved 1m ago"

5. Wait 1 hour
   → Status updates: "Saved 1h ago"
```

**Pass Criteria:**
- ✅ Button shows loading state
- ✅ API called (POST /api/profile/save)
- ✅ Status updates correctly
- ✅ Timestamp format correct (just now, 5s ago, 1m ago, etc.)
- ✅ Button disabled after save
- ✅ Changes tracked in backend

---

#### Test 4.2: Cancel Button

**Setup:**
1. Load page with changes
2. Make profile changes

**Test Steps:**
```
1. With unsaved changes, click Cancel
   → Confirmation dialog appears
   → Message: "You have unsaved changes. Are you sure you want to discard them?"
   → Buttons: "Cancel" / "Discard"

2. Click "Cancel" in dialog
   → Dialog closes
   → Page stays on /profile
   → Unsaved changes still present

3. Make changes again
4. Click Cancel button
5. Click "Discard" in dialog
   → Changes reverted to last saved state
   → Page navigates to /profile/dashboard
   → Unsaved indicator disappears

6. If no unsaved changes and click Cancel
   → No dialog appears
   → Navigates to /profile/dashboard directly
```

**Pass Criteria:**
- ✅ Confirmation dialog appears with unsaved changes
- ✅ Cancel keeps page open
- ✅ Discard reverts changes
- ✅ Navigation works correctly
- ✅ No dialog when no changes

---

#### Test 4.3: Publish Button

**Setup:**
1. Load page with saved profile

**Test Steps:**
```
1. Click Publish button
   → Button shows loading spinner
   → Status shows "Publishing..."
   → API call: POST /api/profile/publish with {published: true}

2. After successful publish
   → Spinner disappears
   → Status shows "Published" (success message)
   → Button re-enables
   → Profile is now public at /u/{username}

3. Can verify by checking:
   → Profile URL: http://localhost:5173/#/u/username
   → Should show published profile
```

**Pass Criteria:**
- ✅ Publish triggers API
- ✅ Loading state shown
- ✅ Success message displayed
- ✅ Profile becomes public
- ✅ Public URL works

---

### 5. Dark Mode Tests

#### Test 5.1: Light Mode

**Setup:**
1. Load page
2. DevTools → No theme override (should use system preference)

**Expected Colors:**
```
Background:    bg-gray-50 (light gray)
Surfaces:      bg-white
Text:          text-gray-900 (dark gray/black)
Borders:       border-gray-200 (light gray)
Accents:       purple/blue buttons
Tab Active:    bg-white with shadow
Tabs Inactive: light background, gray text
```

**Test Steps:**
```
1. Check tab navigation
   → Active tab: white background, dark text
   → Inactive tabs: light background, gray text

2. Check content area
   → Background light gray
   → Text dark and readable

3. Check buttons
   → Primary: purple gradient
   → Secondary: dark button
   → Save bar: light background, dark text

4. Check contrast
   → All text readable
   → No text on dark background without light color
```

**Pass Criteria:**
- ✅ All light mode colors applied
- ✅ Contrast sufficient (WCAG AA: 4.5:1)
- ✅ No dark text on dark background
- ✅ Buttons clearly visible

---

#### Test 5.2: Dark Mode

**Setup:**
1. DevTools → Rendering tab
2. Check "Emulate CSS media feature prefers-color-scheme"
3. Select "dark"

**Expected Colors:**
```
Background:    dark:bg-gray-950 (almost black)
Surfaces:      dark:bg-gray-900 (dark gray)
Text:          dark:text-white
Borders:       dark:border-white/5 (subtle white)
Accents:       purple/blue (same)
Tab Active:    dark:bg-white/10 with glow
Tabs Inactive: dark background, light gray text
```

**Test Steps:**
```
1. Check overall appearance
   → Dark background applied
   → All text light colored
   → Readable without eye strain

2. Check tabs
   → Active: subtle white background, white text
   → Inactive: dark background, gray text

3. Check content area
   → Dark gray background
   → White/light text
   → Readable

4. Check buttons
   → Primary: purple (same as light mode)
   → Secondary: darker shade of original color
   → Publish: has dark mode styling

5. Check preview pane
   → Mobile preview frame dark
   → Device preview shows correctly

6. Check save bar
   → Dark background with subtle border
   → Status text visible
   → Buttons clearly visible
```

**Pass Criteria:**
- ✅ All dark colors applied
- ✅ Contrast sufficient (WCAG AA: 4.5:1)
- ✅ Text readable in dark mode
- ✅ No light background/light text issues
- ✅ Consistent styling across all elements

---

### 6. Accessibility Tests

#### Test 6.1: Semantic HTML

**Setup:**
1. Open DevTools
2. Inspect Element on various parts

**Test Steps:**
```
1. Check main content area
   → <main role="main"> or similar
   → Proper structure

2. Check tabs
   → <nav> or <div role="tablist">
   → Tab buttons have role="tab"
   → aria-selected properly set

3. Check preview area
   → <div role="region"> or <aside>
   → Proper semantic tags

4. Check buttons
   → <button> elements (not <div>)
   → aria-label on icon buttons
   → Proper button attributes
```

**Pass Criteria:**
- ✅ Proper HTML5 semantic elements
- ✅ ARIA roles present where needed
- ✅ No divs used as buttons
- ✅ Proper heading hierarchy

---

#### Test 6.2: Screen Reader Testing

**Setup:**
- Chrome: Use Chrome Vox (free screen reader extension)
- Firefox: Use NVDA (free screen reader)
- Mac: Use VoiceOver (built-in)

**Test Steps:**
```
1. Enable screen reader
2. Tab through page from top to bottom
3. Listen for:
   - "VCardPanel" or page title
   - Tab buttons announced: "Portfolio tab, selected"
   - Content in active tab read
   - "Unsaved changes" indicator announced
   - Button labels: "Save changes" "Cancel changes"

4. Tab to Save button with unsaved changes
   → Should announce: "Save changes button"
   → Screen reader can focus and activate

5. Tab to Status area
   → Should announce: "Unsaved changes" or "Saved 2 minutes ago"

6. Switch tabs using keyboard
   → New content announced
   → Tab selection announced
```

**Pass Criteria:**
- ✅ All content readable by screen reader
- ✅ Button labels clear and descriptive
- ✅ Status messages announced
- ✅ Tab changes announced
- ✅ Interactive elements can be tabbed to

---

#### Test 6.3: Color Contrast

**Tool:** WebAIM Contrast Checker or WAVE

**Setup:**
1. Open DevTools → Colors tool or use https://webaim.org/resources/contrastchecker/
2. Check various color combinations

**Test Results Expected:**
```
Light Mode:
- Dark text on white: 8.59:1 ✅ (AAA)
- Dark text on light gray: 7.5:1+ ✅ (AA)
- Purple text on white: 3.5:1+ ✅ (AA)
- Gray text on white: 5.5:1+ ✅ (AA)

Dark Mode:
- White text on dark gray: 8.0:1+ ✅ (AAA)
- Light text on dark: 7.0:1+ ✅ (AA)
- Purple on dark: readable ✅
```

**Pass Criteria:**
- ✅ All text 4.5:1 minimum (WCAG AA)
- ✅ Large text 3:1 minimum
- ✅ Buttons readable in both modes
- ✅ No color-only information (always supported by text)

---

### 7. Performance Tests

#### Test 7.1: Tab Switching Speed

**Setup:**
1. DevTools → Performance tab
2. Load page at desktop resolution

**Test Steps:**
```
1. Click "Aesthetics" tab
   → Record performance
   → Watch frame rate
   → Check FPS meter

2. Click "Insights" tab
   → Record
   → Check FPS

3. Rapidly click tabs (5 times in 2 seconds)
   → All animations smooth
   → No dropped frames
```

**Pass Criteria:**
- ✅ Tab switch < 200ms
- ✅ 60 FPS during animations
- ✅ No jank or stutter
- ✅ Memory usage < 10MB for state

---

#### Test 7.2: Bundle Size

**Setup:**
1. npm run build
2. Check dist/assets files

**Expected:**
```
index-[hash].js: ~2.5MB (before gzip)
               : ~630KB (gzipped)
index-[hash].css: ~200KB (before gzip)
                : ~30KB (gzipped)

New files add ~18KB gzipped total
```

**Pass Criteria:**
- ✅ Bundle sizes within expected range
- ✅ No significant increase
- ✅ Gzip compression working

---

### 8. Edge Cases & Error Handling

#### Test 8.1: Rapid Save Clicks

**Setup:**
1. Make a change
2. Click Save button multiple times quickly

**Expected:**
```
- Only one API call
- Subsequent clicks ignored (button disabled during save)
- No duplicate saves
```

**Pass Criteria:**
- ✅ No duplicate API calls
- ✅ Button disabled during save
- ✅ Only one success message

---

#### Test 8.2: Network Errors (Simulated)

**Setup:**
1. DevTools → Network tab
2. Set throttling to "Offline"
3. Make a change and try to save

**Expected:**
```
- API call fails
- Error caught
- Console shows error message
- State preserved (not lost)
- User can retry
```

**Pass Criteria:**
- ✅ No unhandled errors in console
- ✅ Changes not lost on error
- ✅ User can retry save
- ✅ Graceful error handling

---

#### Test 8.3: Very Long Content

**Setup:**
1. Simulate profile with many links/properties
2. Test with long text in fields

**Expected:**
```
- Content still readable
- Layout doesn't break
- Scrolling works
- Performance acceptable
```

**Pass Criteria:**
- ✅ No layout breaks
- ✅ No overflow issues
- ✅ Text wraps properly
- ✅ 60 FPS scrolling

---

### 9. Cross-Browser Testing

#### Test 9.1: Chrome

**Version:** 90+
**Test:** Load page and run Tests 1-8
**Expected:** All pass

#### Test 9.2: Firefox

**Version:** 88+
**Test:** Load page and run Tests 1-8
**Expected:** All pass

#### Test 9.3: Safari

**Version:** 14+
**Test:** Load page and run Tests 1-8
**Expected:** All pass

#### Test 9.4: Mobile Safari (iOS)

**Version:** 14+
**Device:** iPhone 12+
**Test:** Load on mobile, run touch tests
**Expected:** All pass

---

## Test Execution Checklist

### Before Starting
- [ ] Dev server running (`npm run dev`)
- [ ] ProfileContext has mock data
- [ ] No console errors on page load
- [ ] Network tab shows requests properly

### During Testing
- [ ] Create test report document
- [ ] Screenshot failed tests
- [ ] Note any visual inconsistencies
- [ ] Check console for warnings
- [ ] Test on at least 3 browsers

### After Testing
- [ ] Summarize results
- [ ] Document any bugs found
- [ ] Create issues for bugs
- [ ] Update documentation if needed
- [ ] Test Phase 3 components when ready

---

## Test Report Template

```markdown
# VCardPanel Phase 2 - Test Report

## Date: [date]
## Tester: [name]
## Environment: [browser, OS, resolution]

### Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Blocked: XX

### Test Results

#### Layout Tests
- [x] Desktop layout
- [x] Tablet layout
- [x] Mobile layout

#### Tab Tests
- [x] Tab switching
- [x] Keyboard navigation

#### Save Tests
- [x] Save button
- [x] Cancel button
- [x] Publish button

#### Accessibility Tests
- [x] Semantic HTML
- [x] Screen reader
- [x] Color contrast

#### Performance Tests
- [x] Tab switching speed
- [x] Bundle size
- [x] Memory usage

### Issues Found
1. [Bug title] - [Severity: Critical/Major/Minor]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshot

### Recommendations
- [Suggestion for improvement]

### Sign-Off
Tested by: [name]
Date: [date]
Status: ✅ Ready / ❌ Needs fixes
```

---

**Testing Guide Complete**
**Last Updated:** January 31, 2026
**Phase:** 2 - Container & Layout
