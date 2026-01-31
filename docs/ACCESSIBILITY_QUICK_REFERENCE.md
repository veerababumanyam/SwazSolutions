# Accessibility Quick Reference Card
## vCard Editor Panel - Common Patterns

---

## 1-Minute Checklist

Before committing accessibility code:

```
□ Form labels have htmlFor and inputs have id
□ ARIA roles applied (tab, tabpanel, switch, dialog, alert)
□ Live regions for dynamic updates (aria-live, role="status")
□ Keyboard handlers for arrow keys and Enter/Space
□ Focus visible on all interactive elements
□ Alt text on all images
□ Error messages associated with fields (aria-describedby)
□ Color contrast meets 4.5:1 (text) or 3:1 (UI)
□ Touch targets at least 44x44px
□ No keyboard traps or focus management issues
```

---

## Common ARIA Patterns

### Form Label Pattern
```typescript
// ✅ CORRECT
<label htmlFor="input-id">Label Text *</label>
<input id="input-id" aria-required="true" />

// ❌ WRONG
<label>Label Text</label>
<input placeholder="Label Text" />
```

### Live Region Pattern
```typescript
// ✅ Status update (polite)
<div role="status" aria-live="polite" aria-atomic="true">
  Profile saved
</div>

// ✅ Error message (assertive)
<div role="alert" aria-live="assertive" aria-atomic="true">
  Error: Name required
</div>
```

### Tab Pattern
```typescript
// Tab list
<div role="tablist" aria-label="Tabs">
  {/* Tab buttons */}
</div>

// Tab button
<button role="tab" aria-selected={isSelected} aria-controls={`panel-${id}`}>
  Label
</button>

// Tab panel
<div role="tabpanel" aria-labelledby={`tab-${id}`}>
  Content
</div>
```

### Switch Pattern
```typescript
<button
  role="switch"
  aria-checked={checked}
  aria-label="Label text"
  onClick={toggle}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }}
>
  Toggle UI
</button>
```

### Modal Pattern
```typescript
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
  <button onClick={close} aria-label="Close">×</button>
</div>
```

### Button Pattern
```typescript
// Icon button (MUST have aria-label)
<button aria-label="Delete item">🗑️</button>

// Text button (aria-label optional)
<button>Save</button>

// Button with icon + text
<button aria-label="Save profile changes">
  <SaveIcon /> Save
</button>
```

---

## Color Contrast Quick Reference

**Text on Background:**
- Normal text: **4.5:1** minimum ✅
- Large text (18pt+): **3:1** minimum ✅
- UI components: **3:1** minimum ✅

**WebAIM Checker:** https://webaim.org/resources/contrastchecker/

**Quick Test:** If you can't read it at arm's length, contrast is too low.

---

## Keyboard Support Quick Reference

### What Users Expect

| Component | Keyboard | Behavior |
|-----------|----------|----------|
| Button | Enter, Space | Activate |
| Link | Enter | Navigate |
| Tab | Arrow Right/Left | Switch tab |
| Select | Arrow Up/Down | Change option |
| Switch | Space, Enter | Toggle |
| Dialog | Escape | Close |
| Modal | Tab | Trap focus |

### Accessibility Checklist

```typescript
// ✅ All buttons keyboard accessible
<button onClick={handleClick}>Save</button>

// ✅ Tab navigation works
<input type="text" />

// ✅ Escape closes dialog
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);

// ✅ Arrow keys navigate
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') goToNextTab();
  if (e.key === 'ArrowLeft') goToPreviousTab();
};
```

---

## Screen Reader Announcements

### What You Need

```typescript
// ✅ Labels
<label htmlFor="id">Name</label>
<input id="id" />
// Announced: "Name, edit text"

// ✅ Buttons
<button aria-label="Delete item">🗑️</button>
// Announced: "Delete item, button"

// ✅ Disabled state
<button disabled>Save</button>
// Announced: "Save, button, disabled"

// ✅ Loading state
<button aria-busy="true">Saving...</button>
// Announced: "Saving, button, busy"

// ✅ Required field
<input aria-required="true" />
// Announced: "Name, edit text, required"

// ✅ Error message
<input aria-invalid="true" aria-describedby="error" />
<span id="error">Email is required</span>
// Announced: "Email, edit text, error: Email is required"
```

---

## Touch Target Size

**Minimum Size:** 44px × 44px

```css
/* ✅ Good */
button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px; /* at least 44px when combined */
}

/* ❌ Bad */
button {
  width: 30px;
  height: 30px; /* Too small for touch */
}
```

---

## Focus Management

### Focus Visible
```typescript
// ✅ Always show focus ring
button {
  focus: outline-none; /* Remove browser default */
  focus: ring-2; /* Add strong focus ring */
  focus: ring-blue-500; /* Use color with 3:1+ contrast */
}

// ❌ Don't hide focus
button {
  focus: outline-none; /* Without replacement is bad */
}
```

### Focus Movement
```typescript
// ✅ Move focus after action
const handleTabChange = (tabId: string) => {
  setActiveTab(tabId);

  // Move focus to first element in tab panel
  setTimeout(() => {
    const panel = document.querySelector(`#panel-${tabId}`);
    const firstFocusable = panel?.querySelector('button, input, [tabindex="0"]');
    (firstFocusable as HTMLElement)?.focus();
  }, 0);
};
```

### Focus Trap (Modal)
```typescript
// ✅ Trap focus in modal
useEffect(() => {
  if (isOpen) {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [];

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }
}, [isOpen]);
```

---

## Quick Fixes (Copy & Paste)

### Fix 1: Form Label
```typescript
// BEFORE
<input type="text" placeholder="Name" />

// AFTER
<label htmlFor="name">Name *</label>
<input id="name" aria-required="true" />
```

### Fix 2: Icon Button
```typescript
// BEFORE
<button onClick={delete}>🗑️</button>

// AFTER
<button onClick={delete} aria-label="Delete item">🗑️</button>
```

### Fix 3: Status Update
```typescript
// BEFORE
<div>Saved!</div>

// AFTER
<div role="status" aria-live="polite" aria-atomic="true">
  Saved!
</div>
```

### Fix 4: Loading Button
```typescript
// BEFORE
<button disabled>{loading ? 'Saving...' : 'Save'}</button>

// AFTER
<button
  disabled={loading}
  aria-busy={loading}
  aria-label={loading ? 'Saving...' : 'Save'}
>
  {loading ? <Spinner /> : null}
  Save
</button>
```

### Fix 5: Skip Link
```typescript
// Add at top of page
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Content */}
</main>
```

### Fix 6: Error Message
```typescript
// BEFORE
<input type="text" />
{error && <p>{error}</p>}

// AFTER
<input
  type="text"
  aria-invalid={!!error}
  aria-describedby={error ? 'error-msg' : undefined}
/>
{error && <p id="error-msg" role="alert">{error}</p>}
```

### Fix 7: Tab Navigation
```typescript
// BEFORE - no keyboard support
<button onClick={() => setTab('tab1')}>Tab 1</button>

// AFTER - keyboard support
<button
  onClick={() => setTab('tab1')}
  onKeyDown={(e) => {
    if (e.key === 'ArrowRight') setTab('tab2');
    if (e.key === 'ArrowLeft') setTab('tab3');
  }}
  role="tab"
  aria-selected={activeTab === 'tab1'}
>
  Tab 1
</button>
```

### Fix 8: Toggle/Switch
```typescript
// BEFORE - not accessible
<div onClick={toggle} className="toggle">On/Off</div>

// AFTER - accessible
<button
  role="switch"
  aria-checked={isOn}
  onClick={toggle}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }}
  aria-label="Enable feature"
>
  {isOn ? 'On' : 'Off'}
</button>
```

---

## Testing Checklist (5 Minutes)

Run before committing:

```bash
# Automated test
npx axe-core [url]  # Should show 0 violations

# Manual keyboard test (30 seconds)
- Tab through page
- Try arrow keys on tabs
- Try Escape on dialogs
- Try Space/Enter on buttons

# Quick visual check
- Focus rings visible?
- Colors readable?
- No tiny buttons?
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| `<div onClick={fn}>` as button | Use `<button>` |
| `<input placeholder="Label">` | Add `<label>` |
| No focus ring | Add `focus:ring-2` |
| Color only to convey info | Add icon or text |
| `<div role="button">` | Use `<button>` |
| Image with no alt text | Add `alt="description"` |
| `window.alert()` for errors | Use `role="alert"` div |
| Disabled state unclear | Add `aria-disabled` |
| No ARIA labels on toggles | Add `role="switch"` + `aria-checked` |
| Forget Escape closes modal | Add keyboard handler |

---

## Essential Resources

### Tools (Bookmarks These)
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/
- **NVDA:** https://www.nvaccess.org/ (free screen reader)

### References
- **WCAG Quick Ref:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns:** https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Learn More
- **Full Audit:** See `ACCESSIBILITY_AUDIT.md`
- **Implementation Guide:** See `ACCESSIBILITY_REMEDIATION_GUIDE.md`
- **Testing Guide:** See `ACCESSIBILITY_TESTING_PROCEDURES.md`

---

## Keyboard Shortcuts (NVDA)

```
Insert + F1 = NVDA Help
Insert + O = NVDA Options
H = Next heading
Shift+H = Previous heading
D = Next landmark
1-6 = Heading level
Tab = Next item
Shift+Tab = Previous item
Arrow keys = Navigate
```

---

## Remember

✅ **Accessibility is:**
- About **including people**, not excluding
- A **legal requirement** (ADA/WCAG)
- **Easy to implement** with patterns
- **Testable** with free tools
- **Good for everyone** (benefits all users)

❌ **Accessibility is NOT:**
- An afterthought
- Expensive
- Hard to learn
- Only for disabled users
- A redesign

---

**Last Updated:** 2026-01-31
**Version:** 1.0

Use this card as a quick reference while implementing accessibility fixes.
For detailed information, see the full audit and remediation documents.

