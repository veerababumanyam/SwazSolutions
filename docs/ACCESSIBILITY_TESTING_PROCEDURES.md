# Accessibility Testing Procedures
## vCard Editor Panel - WCAG 2.1 AA Compliance

---

## Table of Contents

1. [Setup & Tools](#setup--tools)
2. [Automated Testing](#automated-testing)
3. [Manual Keyboard Testing](#manual-keyboard-testing)
4. [Screen Reader Testing](#screen-reader-testing)
5. [Color Contrast Testing](#color-contrast-testing)
6. [Focus & Visual Testing](#focus--visual-testing)
7. [Mobile Accessibility Testing](#mobile-accessibility-testing)
8. [Test Reporting](#test-reporting)

---

## Setup & Tools

### Required Tools

#### 1. Browser Extensions
```bash
# Chrome/Edge
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse (built-in)

# Firefox
- axe DevTools
- WAVE

# Safari
- Accessibility Inspector (built-in)
```

#### 2. Screen Readers
```bash
# Windows
NVDA (free): https://www.nvaccess.org/
JAWS (commercial): https://www.freedomscientific.com/

# Mac
VoiceOver (built-in): cmd+F5
```

#### 3. Command Line Tools
```bash
npm install --save-dev \
  axe-core \
  jest-axe \
  pa11y \
  pa11y-ci \
  lighthouse \
  @axe-core/playwright
```

#### 4. Online Tools
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE:** https://wave.webaim.org/
- **Color Blindness Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/

### Environment Setup

```bash
# Clone/setup project
cd c:\Users\admin\Desktop\SwazSolutions
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

---

## Automated Testing

### 1. Run axe DevTools in Browser

**Steps:**
1. Open Chrome DevTools (F12)
2. Find axe DevTools extension tab
3. Click "Scan ALL of my page"
4. Review results by severity

**Expected Results:**
- 0 Critical issues
- 0 Serious issues
- Minimal Minor issues

**Report Issues:**
```markdown
## axe DevTools Findings

Date: ____
Page: vCard Editor
Scan Type: Full Page Scan

### Violations (sorted by severity)
- [Issue]: Description
- Impact: [Critical/Serious/Moderate/Minor]
- Elements Affected: [count]
- WCAG Criterion: [criterion number]

### Passes
- [Feature]: Description
- Elements Checked: [count]

### Needs Review
- [Item]: Description
```

### 2. Run Lighthouse Accessibility Audit

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" audit
4. Click "Analyze page load"
5. Review results

**Scoring:**
- 90-100: Green (Good)
- 50-89: Yellow (Needs Improvement)
- 0-49: Red (Poor)

**Target:** 95+ score

### 3. Run Pa11y Command Line

```bash
# Install Pa11y globally (optional)
npm install -g pa11y-ci

# Run Pa11y on specific URL
pa11y http://localhost:5173/profile

# Run Pa11y with JSON report
pa11y --reporter json http://localhost:5173/profile > report.json

# Run Pa11y CI (batch testing)
pa11y-ci --config .pa11yci.json
```

**Sample .pa11yci.json:**
```json
{
  "runners": ["axe", "htmlcs"],
  "standard": "WCAG2AA",
  "urls": [
    "http://localhost:5173/profile",
    "http://localhost:5173/profile?tab=aesthetics",
    "http://localhost:5173/profile?tab=insights"
  ],
  "timeout": 10000
}
```

### 4. Playwright Accessibility Testing

```typescript
// tests/accessibility/vcard-panel.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('vCard Panel Accessibility', () => {
  test('should not have accessibility violations on profile editor', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');

    // Inject axe
    await injectAxe(page);

    // Check for violations
    const violations = await page.evaluate(() => {
      return (window as any).axe.run();
    });

    expect(violations.violations).toHaveLength(0);
  });

  test('should be accessible when switching tabs', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');

    const aestheticsTab = page.locator('[role="tab"]:has-text("Aesthetics")');
    await aestheticsTab.click();

    await injectAxe(page);
    const violations = await page.evaluate(() => {
      return (window as any).axe.run();
    });

    expect(violations.violations).toHaveLength(0);
  });
});

// Run with: npx playwright test tests/accessibility/
```

---

## Manual Keyboard Testing

### Test 1: Tab Navigation

**Objective:** Verify all interactive elements are reachable via Tab key

**Steps:**
1. Load http://localhost:5173/profile
2. Press Tab repeatedly
3. Document order and focus

**Verification Checklist:**

```markdown
# Tab Navigation Test - Profile Editor

Device: [Windows/Mac]
Browser: [Chrome/Firefox/Safari]
Date: ____

## Tab Order
Sequence of elements when pressing Tab:

1. [ ] Skip link (if present)
2. [ ] Portfolio tab button
3. [ ] Aesthetics tab button
4. [ ] Insights tab button
5. [ ] Display Name input
6. [ ] Professional Title input
7. [ ] Bio textarea
8. [ ] AI Enhance button
9. [ ] Social toggles (first)
10. [ ] Social toggles (rest)
11. [ ] Add block buttons
12. [ ] Block items with controls
13. [ ] Save button
14. [ ] Publish button
15. [ ] Cancel button

## Tab Order Assessment
- [ ] Logical top-to-bottom order
- [ ] Matches visual reading order
- [ ] No jumping backwards
- [ ] No items skipped
- [ ] All interactive elements included
- [ ] No elements receive focus unnecessarily

## Issues Found
- [Issue]: Description
- Severity: [Critical/Major/Minor]
```

### Test 2: Shift+Tab (Reverse Navigation)

**Objective:** Verify backward Tab navigation works

**Steps:**
1. Load page
2. Press Tab to reach middle of page
3. Press Shift+Tab 3 times
4. Verify focus moves backward

**Expected:** Focus moves to previous interactive elements in reverse order

---

### Test 3: Tab Component Keyboard Support

**Objective:** Verify arrow keys switch tabs

**Steps:**
1. Load http://localhost:5173/profile
2. Click on "Portfolio" tab to focus it
3. Press Right Arrow key
4. Observe tab switch

**Verification Checklist:**

```markdown
# Tab Keyboard Navigation Test

## Arrow Key Support
- [ ] Arrow Right moves to next tab
- [ ] Arrow Left moves to previous tab
- [ ] Arrow Down moves to next tab (alternative)
- [ ] Arrow Up moves to previous tab (alternative)
- [ ] Arrows wrap (last → first, first → last)

## Home/End Key Support
- [ ] Home moves to first tab
- [ ] End moves to last tab

## Tab Focus Behavior
- [ ] Pressing Tab enters the tab bar
- [ ] Arrow keys navigate within tabs
- [ ] Focus moves to selected tab panel after switching
- [ ] Tab takes focus out of tab bar (to next element)

## Visual Feedback
- [ ] Focus ring visible on active tab
- [ ] Tab switches visually when using arrows
- [ ] Content updates immediately

## Results
- Pass: [ ] Yes [ ] No
- Issues: [list any]
```

### Test 4: Form Input Navigation

**Objective:** Verify form field keyboard support

**Steps:**
1. Tab to Display Name input
2. Type text
3. Tab to Professional Title
4. Type text
5. Tab to Bio textarea
6. Type text
7. Verify all work

**Verification:**

```markdown
# Form Input Test

## Display Name
- [ ] Can receive focus
- [ ] Can type text
- [ ] Placeholder visible
- [ ] Focus ring visible

## Professional Title
- [ ] Can receive focus
- [ ] Can type text
- [ ] Tab moves to next field

## Bio
- [ ] Can receive focus
- [ ] Can type multiline text
- [ ] Character count updates
- [ ] Shift+Tab goes to previous

## Issues
[List any input issues]
```

### Test 5: Button Keyboard Activation

**Objective:** Verify buttons activate with Space/Enter

**Steps:**
1. Tab to a button (e.g., "AI Enhance")
2. Press Space key
3. Observe action
4. Tab to same button again
5. Press Enter key
6. Observe action

**Verification Checklist:**

```markdown
# Button Keyboard Activation Test

## Save Button
- [ ] Can focus with Tab
- [ ] Activates with Space
- [ ] Activates with Enter
- [ ] Shows loading state
- [ ] Announces save

## Publish Button
- [ ] Can focus with Tab
- [ ] Activates with Space
- [ ] Activates with Enter
- [ ] Shows loading state

## Cancel Button
- [ ] Can focus with Tab
- [ ] Activates with Space
- [ ] Activates with Enter
- [ ] Shows confirmation dialog

## AI Enhance Button
- [ ] Can focus with Tab
- [ ] Activates with Space
- [ ] Activates with Enter
- [ ] Shows loading state

## Block Add Buttons
- [ ] Each can focus
- [ ] Each activates with Space
- [ ] Each activates with Enter

## Issues
[List any issues]
```

### Test 6: Modal/Dialog Keyboard Behavior

**Objective:** Verify dialog keyboard handling

**Steps:**
1. Trigger a dialog (e.g., Delete confirmation)
2. Tab around inside dialog
3. Verify Tab doesn't escape
4. Press Escape
5. Verify dialog closes

**Verification Checklist:**

```markdown
# Dialog Keyboard Test

## Tab Trapping
- [ ] Tab doesn't escape dialog
- [ ] Shift+Tab doesn't escape dialog
- [ ] Tab loops within dialog

## Escape Key
- [ ] Escape closes dialog
- [ ] Focus returns to trigger element
- [ ] No other keys close dialog

## Button Navigation in Dialog
- [ ] First button focused on open
- [ ] All buttons reachable via Tab
- [ ] Cancel/Close button accessible

## Issues
[List any issues]
```

### Test 7: Drag-and-Drop Keyboard Alternative

**Objective:** Verify keyboard alternative to drag-and-drop

**Steps:**
1. Find a block in "Your Blocks" section
2. Locate up/down arrow buttons
3. Tab to up button
4. Press Space to move item up
5. Tab to down button
6. Press Space to move item down

**Verification Checklist:**

```markdown
# Drag-and-Drop Keyboard Test

## Keyboard Controls Present
- [ ] Up/down buttons visible
- [ ] Buttons have descriptive labels
- [ ] Buttons can receive focus
- [ ] Buttons activate with Space/Enter

## Functionality
- [ ] Up button moves item up
- [ ] Down button moves item down
- [ ] Buttons disabled when at edge
- [ ] Reorder announced to screen readers

## Alternative to Mouse
- [ ] Keyboard method works as well as mouse
- [ ] No functionality locked to mouse only

## Issues
[List any issues]
```

---

## Screen Reader Testing

### Prerequisites

**NVDA (Windows - Recommended for testing):**
```bash
# Download from https://www.nvaccess.org/
# Start: nvda.exe
# Keystrokes will be logged automatically
```

**VoiceOver (Mac):**
```bash
# Enable: System Preferences > Accessibility > VoiceOver
# Or: Cmd + F5
```

### Screen Reader Test Procedure

#### Test 1: Page Structure & Landmarks

**Objective:** Verify screen reader understands page structure

**Steps (NVDA - Windows):**
1. Start NVDA (Ctrl + Alt + N)
2. Navigate to http://localhost:5173/profile
3. Press H to navigate by headings
4. Note all headings announced
5. Press D to navigate by landmarks
6. Note main, region, navigation landmarks

**NVDA Keyboard Reference:**
```
H - Next heading
Shift+H - Previous heading
D - Next landmark
Shift+D - Previous landmark
1-6 - Next heading level
G - Next graphic
T - Next table
L - Next list
```

**Verification Checklist:**

```markdown
# Screen Reader Structure Test

## Page Title
- [ ] Page title announced on load
- [ ] Title matches <h1>
- [ ] Document title set correctly

## Heading Structure
- [ ] H1: "Profile Editor"
- [ ] H2: Section headings
- [ ] No skipped levels (not H1 → H3)
- [ ] Proper nesting

Headings found:
- [ ] H1: Profile Editor
- [ ] H2: Portfolio Links
- [ ] H2: Profile Information
- [ ] H2: Socials
- [ ] H2: Content Blocks
- [ ] H3: (subsections, if any)

## Landmarks
- [ ] <main> element present
- [ ] Tablist identified
- [ ] Tab panels identified
- [ ] Regions labeled (e.g., "Live preview")

## Issues
[List any structure issues]
```

#### Test 2: Form Field Accessibility

**Objective:** Verify form fields are properly labeled and announced

**Steps:**
1. Start NVDA
2. Navigate to first input field with Tab
3. NVDA should announce: "[Label], [field type], [value]"
4. Example: "Display Name, edit text"

**Verification Checklist:**

```markdown
# Form Fields Test - NVDA

## Display Name
- [ ] Label announced: "Display Name"
- [ ] Type announced: "edit text"
- [ ] Required indicated (if required)
- [ ] Placeholder NOT used as label
- [ ] Focus ring visible

## Professional Title
- [ ] Label announced correctly
- [ ] Type announced: "edit text"
- [ ] Can type text in field

## Bio Textarea
- [ ] Label announced: "Bio"
- [ ] Type announced: "edit text"
- [ ] Multiline support announced
- [ ] Character count announced
- [ ] Character count updates announced

## Social Toggles
- [ ] Type announced: "toggle button"
- [ ] Platform name announced
- [ ] On/off state announced
- [ ] Activates with Space/Enter

## Form Issues
[List any issues]
```

#### Test 3: Button & Action Accessibility

**Objective:** Verify buttons are properly identified and activated

**Steps:**
1. Tab through buttons
2. NVDA announces: "[Button text], button"
3. Press Space or Enter
4. NVDA announces action result

**Verification Checklist:**

```markdown
# Button Accessibility Test - NVDA

## Save Button
- [ ] Announced as "Save, button"
- [ ] Activates with Space
- [ ] Activates with Enter
- [ ] Loading state: "Saving, button, busy"
- [ ] Success announced

## Publish Button
- [ ] Announced as "Publish, button"
- [ ] Or "Publish, toggle button, pressed/unpressed"
- [ ] Activates with keyboard
- [ ] State change announced

## Cancel Button
- [ ] Announced as "Cancel and discard changes, button"
- [ ] Activates with keyboard

## Block Buttons (Add)
- [ ] Each announced: "Add [type], button"
- [ ] Example: "Add Link, button"

## Block Controls (Edit, Delete, Move)
- [ ] Edit button: "Edit [block name], button"
- [ ] Delete button: "Delete [block name], button"
- [ ] Move up button: "Move [block name] up, button"
- [ ] Move down button: "Move [block name] down, button"

## Button Issues
[List any issues]
```

#### Test 4: Tab Component Accessibility

**Objective:** Verify tab structure is properly announced

**Steps:**
1. Tab to first tab button
2. NVDA announces: "[Tab label], tab, [position], [selected state]"
3. Example: "Portfolio, tab, 1 of 3, selected"
4. Press Arrow Right
5. NVDA announces: "[Next tab], tab, [position], [selected state]"

**Verification Checklist:**

```markdown
# Tab Accessibility Test - NVDA

## Tab Identification
- [ ] Role announced: "tab"
- [ ] Label announced: "[tab name]"
- [ ] Position announced: "1 of 3" etc.
- [ ] State announced: "selected" or "not selected"

## Tab Switching
- [ ] Arrow Right triggers switch announcement
- [ ] Arrow Left triggers switch announcement
- [ ] New tab content identified with announcement
- [ ] Tab panel role announced

## Tab Content
- [ ] Tab panel role announced: "tabpanel"
- [ ] Tab panel label announced
- [ ] Content structure understood
- [ ] Headings within panel announced correctly

## Tab Navigation Issues
[List any issues]
```

#### Test 5: Dynamic Content & Live Regions

**Objective:** Verify live region updates are announced

**Steps:**
1. Make a change to profile (e.g., edit name)
2. Wait for unsaved indicator to appear
3. NVDA should announce: "Unsaved changes"
4. Click Save
5. NVDA should announce: "Profile saved successfully"

**Verification Checklist:**

```markdown
# Live Region Test - NVDA

## Unsaved Changes
- [ ] Indicator appears visually
- [ ] NVDA announces: "Unsaved changes"
- [ ] Announcement uses aria-live

## Save Confirmation
- [ ] Button click doesn't trigger immediate announcement
- [ ] Save action completes
- [ ] NVDA announces success
- [ ] Announcement clear and specific

## Error Messages
- [ ] Error appears visually
- [ ] NVDA announces: "Error: [message]"
- [ ] Role announced: "alert"
- [ ] Associated with field (if applicable)

## Character Count
- [ ] Bio character count updates
- [ ] NVDA announces new count
- [ ] Announcement clear: "[current] characters remaining"

## Tab Switch Announcement
- [ ] Switching tabs announced
- [ ] New content identified
- [ ] No double announcements

## Live Region Issues
[List any issues]
```

#### Test 6: Modal/Dialog Accessibility

**Objective:** Verify dialog is properly announced and navigable

**Steps:**
1. Trigger a dialog (e.g., Delete confirmation)
2. NVDA announces: "[Title], dialog"
3. Tab through dialog elements
4. Press Escape to close
5. Focus returns to trigger element

**Verification Checklist:**

```markdown
# Dialog Accessibility Test - NVDA

## Dialog Announcement
- [ ] Role announced: "dialog" or "alertdialog"
- [ ] Title announced
- [ ] Description announced
- [ ] Modal behavior understood

## Dialog Navigation
- [ ] First button receives focus
- [ ] All buttons navigable via Tab
- [ ] Button purposes clear
- [ ] Escape closes dialog

## Focus Management
- [ ] Focus moves into dialog
- [ ] Focus trapped in dialog (Tab doesn't escape)
- [ ] Focus returns to trigger on close
- [ ] Return focus is announced

## Dialog Issues
[List any issues]
```

#### Test 7: Image Alt Text

**Objective:** Verify images have appropriate alt text

**Steps:**
1. Tab to avatar image
2. NVDA announces alt text
3. Verify text is descriptive
4. Example: "Jane Doe's profile photo" (good)
5. Not: "image" or "avatar" (bad)

**Verification Checklist:**

```markdown
# Image Alt Text Test - NVDA

## Avatar Image
- [ ] Alt text present
- [ ] Descriptive: "[Name]'s profile photo"
- [ ] Not generic: "image", "avatar"

## Other Images
- [ ] All images have alt text
- [ ] Alt text descriptive
- [ ] Decorative images marked with aria-hidden

## Image Issues
[List any issues]
```

### Screen Reader Testing Report Template

```markdown
# Screen Reader Accessibility Test Report

Date: ____
Tester: ____
Screen Reader: [ ] NVDA [ ] JAWS [ ] VoiceOver [ ] Other: ____
Browser: [Chrome/Firefox/Safari/Edge]
Operating System: [Windows/Mac/iOS/Android]

## Summary
- Total Tests: __
- Passed: __
- Failed: __
- Pass Rate: ___%

## Detailed Results

### 1. Page Structure
- [ ] Page title announced
- [ ] Headings structure correct
- [ ] Landmarks identified
- [ ] Reading order logical

**Issues:**
[List any issues]

### 2. Form Fields
- [ ] Labels announced with fields
- [ ] Required fields indicated
- [ ] Placeholder not used as label
- [ ] Helper text announced
- [ ] Error messages announced

**Issues:**
[List any issues]

### 3. Buttons & Controls
- [ ] Button type announced
- [ ] Button text clear
- [ ] State indicated (pressed, disabled, loading)
- [ ] Activation works (Space/Enter)

**Issues:**
[List any issues]

### 4. Tab Component
- [ ] Tab structure understood
- [ ] Tab positions announced
- [ ] Tab state announced
- [ ] Switching announced
- [ ] Content panel identified

**Issues:**
[List any issues]

### 5. Live Regions
- [ ] Status updates announced
- [ ] Errors announced immediately
- [ ] Character count announced
- [ ] Reorders announced

**Issues:**
[List any issues]

### 6. Dialogs
- [ ] Dialog role announced
- [ ] Title announced
- [ ] Focus trapped
- [ ] Escape closes
- [ ] Focus returns

**Issues:**
[List any issues]

### 7. Images & Icons
- [ ] Images have alt text
- [ ] Alt text descriptive
- [ ] Decorative marked aria-hidden
- [ ] Icon purpose clear

**Issues:**
[List any issues]

## Overall Assessment
- Fully Accessible: [ ] Yes [ ] No
- Ready for Production: [ ] Yes [ ] No
- Needs Fixes: [ ] Critical [ ] Major [ ] Minor

## Recommendations
1. [Fix 1]
2. [Fix 2]
3. [Fix 3]

## Sign-off
Tester: ____
Date: ____
Status: [ ] Pass [ ] Fail [ ] Pass with Notes
```

---

## Color Contrast Testing

### Test Procedure

**Tool:** WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)

**Steps:**
1. For each text/background combo:
2. Identify exact colors (hex or RGB)
3. Enter foreground color
4. Enter background color
5. Note contrast ratio
6. Verify against requirements

**Requirements:**
- Normal text: **4.5:1** (WCAG AA)
- Large text (18pt+ or 14pt+ bold): **3:1** (WCAG AA)
- UI Components (borders, focus rings): **3:1**

### Components to Test

```markdown
# Color Contrast Audit Checklist

## Primary UI Elements
- [ ] Text on primary button background
- [ ] Text on secondary button background
- [ ] Text on white/light background
- [ ] Text on dark background
- [ ] Text on gray background

## Form Elements
- [ ] Input text on input background
- [ ] Input text on focus background
- [ ] Label text on background
- [ ] Placeholder text on input background
- [ ] Error text on white background
- [ ] Error text on error background

## Interactive Elements
- [ ] Focus ring on white background
- [ ] Focus ring on dark background
- [ ] Focus ring on colored background
- [ ] Button text (normal state)
- [ ] Button text (hover state)
- [ ] Button text (disabled state)

## Status & Feedback
- [ ] Success text on background
- [ ] Warning text on background
- [ ] Error text on background
- [ ] Info text on background

## Custom Colors
- [ ] [Any custom colors in theme]
- [ ] [Gradient text on gradient]
- [ ] [Icon on background]

## All Components
- [ ] Text: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] Focus ring: 3:1 minimum
- [ ] UI icons: 3:1 minimum
- [ ] All backgrounds tested (light & dark mode)
```

### Contrast Testing Report Template

```markdown
# Color Contrast Testing Report

Date: ____
Tester: ____
Tool: WebAIM Contrast Checker

## Test Results Summary
- Total Combinations: __
- Passed (4.5:1+): __
- Failed: __
- Pass Rate: ___%

## Failing Tests
| Element | Foreground | Background | Actual | Required | Status |
|---------|-----------|------------|--------|----------|--------|
| Button text | #FFFFFF | #2563eb | 4.8:1 | 4.5:1 | ✅ PASS |
| Label | #666666 | #FFFFFF | 4.2:1 | 4.5:1 | ❌ FAIL |

## Issues Found
1. **[Issue 1]**
   - Elements affected: [list]
   - Current ratio: 2.8:1
   - Required: 4.5:1
   - Severity: Critical
   - Fix: Adjust color to [new color]

2. **[Issue 2]**
   - Similar format...

## Recommended Fixes
1. Change button text to darker color
2. Increase label font weight
3. Adjust background lightness

## Final Status
- Ready for Production: [ ] Yes [ ] No
- Needs Fixes: [ ] Critical [ ] Major [ ] Minor
```

---

## Focus & Visual Testing

### Focus Visibility Audit

**Objective:** Verify focus ring is visible at all times

**Verification Checklist:**

```markdown
# Focus Visibility Test

## Visual Focus Indicators
- [ ] All buttons have visible focus ring
- [ ] All inputs have visible focus ring
- [ ] All interactive elements show focus
- [ ] Focus ring visible on light backgrounds
- [ ] Focus ring visible on dark backgrounds
- [ ] Focus ring visible on colored backgrounds

## Focus Ring Properties
- [ ] Ring is at least 2px thick
- [ ] Ring color contrasts with background (3:1+)
- [ ] Ring doesn't obscure content
- [ ] Ring consistent across component types

## Specific Elements
- [ ] Tab buttons: Ring visible
- [ ] Form inputs: Ring visible
- [ ] Block controls: Ring visible
- [ ] Dialog buttons: Ring visible
- [ ] Save/Publish/Cancel: Ring visible

## Issues
- [ ] Missing focus ring: [elements]
- [ ] Low contrast ring: [elements]
- [ ] Obscured focus: [elements]

## Fixes Applied
[List fixes made]
```

### Zoom & Magnification Testing

**Objective:** Test at 200% zoom level

**Steps:**
1. Load page at 100%
2. Zoom to 200%: Ctrl++ (3 times) or Cmd++
3. Verify no horizontal scrolling
4. Verify text readable
5. Verify buttons functional

**Verification Checklist:**

```markdown
# Zoom Testing (200%)

## Layout
- [ ] No horizontal scrolling required
- [ ] Content reflows properly
- [ ] Columns stack on narrow screens
- [ ] All content visible without panning

## Text
- [ ] Text size readable
- [ ] No text truncation
- [ ] Line length appropriate
- [ ] Line spacing adequate

## Interactive Elements
- [ ] Buttons large enough to click
- [ ] Inputs large enough to interact
- [ ] Focus ring visible and clear
- [ ] All controls functional

## Specific Components
- [ ] Tabs navigable
- [ ] Form fields usable
- [ ] Modals visible and functional
- [ ] Buttons clickable

## Issues
[List any issues at 200% zoom]
```

### High Contrast Mode Testing

**Windows High Contrast:**

```
Settings > Ease of Access > Display > High Contrast
Select "High Contrast White" or similar

Verify:
- [ ] Text visible (not same color as background)
- [ ] Focus ring visible
- [ ] Borders visible
- [ ] All content readable
```

---

## Mobile Accessibility Testing

### Touch Target Size Audit

**Objective:** Verify minimum 44x44px touch targets

**Tool:** Browser DevTools or Measure tool

**Verification Checklist:**

```markdown
# Touch Target Size Test

## Button Sizes
- [ ] Primary buttons: 44x44px minimum
- [ ] Secondary buttons: 44x44px minimum
- [ ] Icon buttons: 44x44px minimum
- [ ] Close buttons: 44x44px minimum

## Form Controls
- [ ] Checkboxes: 44x44px minimum
- [ ] Radio buttons: 44x44px minimum
- [ ] Toggle switches: 44x44px minimum
- [ ] Input fields: 44px height minimum

## Specific Elements
- [ ] Tab buttons: [size] ✅/❌
- [ ] Block delete buttons: [size] ✅/❌
- [ ] Drag handles: [size] ✅/❌
- [ ] Avatar upload button: [size] ✅/❌

## Spacing Between Targets
- [ ] Minimum 8px between interactive elements
- [ ] No cramped clusters of buttons
- [ ] Adequate padding around touch areas

## Issues
[List undersized targets]
```

### Mobile Screen Reader Testing

**iOS VoiceOver:**

```
Settings > Accessibility > VoiceOver > On

Gestures:
- Single tap: Select item
- Double tap: Activate
- Three-finger tap: Toggle rotor
- Two-finger Z: Undo
- Two-finger U: Open rotor
```

**Android TalkBack:**

```
Settings > Accessibility > TalkBack > On

Gestures:
- Single tap: Select
- Double tap: Activate
- Swipe right: Next item
- Swipe left: Previous item
- Swipe down: Next setting
- Swipe up: Previous setting
```

**Verification Checklist:**

```markdown
# Mobile Screen Reader Test

Device: [iPhone/Android]
Screen Reader: [VoiceOver/TalkBack]

## Form Fields
- [ ] Fields announced with labels
- [ ] Input type announced
- [ ] Required indicated
- [ ] Help text announced

## Buttons
- [ ] Button purpose clear
- [ ] State announced (pressed, disabled, busy)
- [ ] Actionable via double tap

## Tab Component
- [ ] Tab structure understood
- [ ] Tabs navigable with swipe
- [ ] Active tab indicated
- [ ] Content panel announced

## Dynamic Updates
- [ ] Unsaved status announced
- [ ] Errors announced
- [ ] Success messages announced
- [ ] Loading state announced

## Touch Interaction
- [ ] All buttons tappable
- [ ] No small targets requiring precision
- [ ] Double tap area large enough
- [ ] Target spacing adequate

## Issues
[List mobile-specific issues]
```

---

## Test Reporting

### Test Summary Report

```markdown
# Accessibility Testing Summary Report

Project: Swaz Solutions vCard Editor
Date: ____
Version: 1.0

## Executive Summary
- Testing Completed: [Date range]
- Total Tests: __
- Pass Rate: ___%
- Critical Issues: __
- Major Issues: __
- Minor Issues: __

## Test Coverage

| Test Category | Tests Run | Passed | Failed | Coverage |
|---|---|---|---|---|
| Automated (axe) | 40 | 35 | 5 | 100% |
| Keyboard | 7 | 6 | 1 | 100% |
| Screen Reader | 7 | 5 | 2 | 100% |
| Color Contrast | 25 | 22 | 3 | 100% |
| Focus/Visual | 8 | 7 | 1 | 100% |
| Mobile | 6 | 5 | 1 | 100% |
| **TOTAL** | **93** | **80** | **13** | **100%** |

## Critical Issues

| Issue | Status | Fix Date | Tester |
|---|---|---|---|
| Form labels not associated | Open | [date] | [name] |
| Tab panel ARIA missing | Open | [date] | [name] |
| No keyboard navigation for tabs | Open | [date] | [name] |

## Major Issues

| Issue | Status | Fix Date | Tester |
|---|---|---|---|
| [Issue 1] | [ ] | [ ] | [ ] |
| [Issue 2] | [ ] | [ ] | [ ] |

## Minor Issues

| Issue | Status | Fix Date | Tester |
|---|---|---|---|
| [Issue 1] | [ ] | [ ] | [ ] |

## Test Results by Component

### VCardPanel.tsx
- Keyboard: ❌ FAIL (missing skip link)
- Screen Reader: ❌ FAIL (no live regions)
- Contrast: ✅ PASS
- Focus: ⚠️ PARTIAL
- Overall: 50%

### TabNavigation.tsx
- Keyboard: ❌ FAIL (no arrow key support)
- Screen Reader: ✅ PASS
- Contrast: ✅ PASS
- Focus: ✅ PASS
- Overall: 75%

### ProfileSection.tsx
- Keyboard: ⚠️ PARTIAL (labels missing)
- Screen Reader: ❌ FAIL (no field labels)
- Contrast: ❌ FAIL (placeholder contrast low)
- Focus: ✅ PASS
- Overall: 50%

### [Other components...]

## Overall Accessibility Score

| Metric | Score | Target | Status |
|---|---|---|---|
| Automated Audit (axe) | 87/100 | 95+ | ⚠️ Needs Work |
| Keyboard Navigation | 71% | 100% | ❌ FAIL |
| Screen Reader | 71% | 100% | ❌ FAIL |
| Color Contrast | 88% | 100% | ⚠️ Needs Work |
| Focus Management | 88% | 100% | ⚠️ Needs Work |
| Mobile Accessibility | 83% | 100% | ⚠️ Needs Work |
| **OVERALL WCAG 2.1 AA** | **81%** | **95%** | **❌ NOT COMPLIANT** |

## Compliance Status

| Standard | Compliance | Status |
|---|---|---|
| WCAG 2.1 Level A | 92% | ⚠️ Mostly |
| WCAG 2.1 Level AA | 81% | ❌ Not Compliant |
| WCAG 2.1 Level AAA | 45% | ❌ Not Compliant |

## Remediation Plan

### Phase 1: Critical Issues (Week 1) - 5 issues
1. Add form label associations
2. Add tab panel ARIA
3. Add live regions
4. Add tab keyboard support
5. Add drag-drop keyboard alternative

### Phase 2: Major Issues (Week 2-3) - 8 issues
1. Error message handling
2. Focus management
3. Modal accessibility
4. Image alt text
5. ... (3 more)

### Phase 3: Minor Issues (Week 3-4) - 2 issues
1. Color contrast fixes
2. Placeholder text improvements

## Next Steps

1. **Assign Issues:** Distribute fixes to team members
2. **Create PRs:** Each issue gets a feature branch
3. **Re-test:** Test each fix immediately after
4. **Review:** Code review with accessibility focus
5. **Final Audit:** Full re-test after all fixes
6. **Deploy:** Push to production with confidence

## Sign-off

Conducted by: [Accessibility Specialist]
Date: [Date]
Status: Ready for Remediation

Reviewed by: [Manager]
Date: [Date]
Approved: [ ] Yes [ ] No
```

---

## Continuous Testing

### Automated Testing Setup

```bash
# Add to package.json scripts
{
  "scripts": {
    "test:a11y": "pa11y-ci --config .pa11yci.json",
    "test:axe": "jest --testMatch='**/*.a11y.test.ts'",
    "test:accessibility": "npm run test:a11y && npm run test:axe",
    "audit:lighthouse": "lighthouse http://localhost:5173/profile"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test:accessibility
      - uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: a11y-report
          path: reports/
```

---

## Accessibility Testing Checklist

```markdown
# Pre-Release Accessibility Checklist

Before deploying to production, verify:

## Automated Testing
- [ ] Run axe DevTools - 0 violations
- [ ] Run Lighthouse audit - 95+ score
- [ ] Run Pa11y CLI - 0 errors
- [ ] Playwright tests passing

## Manual Keyboard Testing
- [ ] Tab navigation works
- [ ] Arrow keys navigate tabs
- [ ] All buttons activatable with Space/Enter
- [ ] No keyboard traps
- [ ] Escape closes modals
- [ ] Focus visible everywhere

## Screen Reader Testing
- [ ] Page title announced
- [ ] Heading structure correct
- [ ] Form labels announced
- [ ] Buttons identified correctly
- [ ] Tab structure understood
- [ ] Live regions work
- [ ] Modals announced as dialogs

## Color & Visual
- [ ] Color contrast 4.5:1 minimum
- [ ] Focus ring visible
- [ ] High contrast mode works
- [ ] 200% zoom works
- [ ] No horizontal scroll at zoom

## Mobile
- [ ] Touch targets 44x44px
- [ ] Screen reader works (iOS/Android)
- [ ] Zoom works
- [ ] Reduced motion respected

## Final Verification
- [ ] All tests passing
- [ ] No violations reported
- [ ] Team accessibility review complete
- [ ] Documentation updated
- [ ] Ready for release

**Sign-off:** ____  **Date:** ____
```

---

## Resources

### Testing Tools
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE:** https://wave.webaim.org/
- **Pa11y:** https://pa11y.org/
- **NVDA:** https://www.nvaccess.org/

### Reference
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA APG:** https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

**Document Version:** 1.0
**Last Updated:** 2026-01-31

