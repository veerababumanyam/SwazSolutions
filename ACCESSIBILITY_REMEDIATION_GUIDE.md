# Accessibility Remediation Implementation Guide
## vCard Editor Panel - WCAG 2.1 AA Compliance

---

## Quick Reference: Common Fixes

### 1. Form Label Association Pattern

```typescript
// ❌ BAD - Label not associated
<label>Display Name</label>
<input type="text" />

// ✅ GOOD - Proper label association
<label htmlFor="display-name">
  Display Name <span aria-label="required">*</span>
</label>
<input
  id="display-name"
  type="text"
  aria-required="true"
  required
/>
```

---

### 2. ARIA Live Region Pattern

```typescript
// ✅ For polite announcements (non-urgent)
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  Profile saved 5 minutes ago
</div>

// ✅ For urgent announcements (errors, alerts)
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  Error: Profile name is required
</div>
```

---

### 3. Keyboard-Only Button Pattern

```typescript
// ✅ Keyboard-accessible button
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  tabIndex={0}
  aria-label="Descriptive action"
>
  Button Text
</button>
```

---

### 4. Accessible Modal Pattern

```typescript
const AccessibleModal: React.FC<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, title, onClose, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      const firstButton = dialogRef.current?.querySelector('button');
      firstButton?.focus();

      // Close on Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full m-4">
        <h2 id="dialog-title" className="text-xl font-bold mb-4">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
};
```

---

### 5. Accessible Switch/Toggle Pattern

```typescript
const AccessibleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}> = ({ checked, onChange, label, id = `switch-${Math.random()}` }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <label htmlFor={id} className="text-sm font-medium cursor-pointer">
        {label}
      </label>
    </div>
  );
};
```

---

### 6. Keyboard-Navigable Tab Pattern

```typescript
const AccessibleTabs: React.FC<{
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleTabKeyDown = (e: KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      onTabChange(tabs[nextIndex].id);
      // Move focus to the newly selected tab
      setTimeout(() => {
        tabRefs.current[tabs[nextIndex].id]?.focus();
      }, 0);
    }
  };

  const currentIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div role="tablist" aria-label="Profile editor tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => {
            if (el) tabRefs.current[tab.id] = el;
          }}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleTabKeyDown(e as any, index)}
          className={`
            px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500
            ${activeTab === tab.id ? 'border-b-2 border-blue-500' : ''}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
```

---

### 7. Accessible Form Input Pattern

```typescript
interface AccessibleInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  maxLength?: number;
  helpText?: string;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = 'text',
  maxLength,
  helpText,
}) => {
  const inputId = `input-${id}`;
  const errorId = `error-${id}`;
  const helpId = `help-${id}`;
  const descriptionIds = [error && errorId, helpText && helpId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={descriptionIds || undefined}
        className={`
          w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2
          ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }
        `}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}

      {helpText && (
        <p id={helpId} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}

      {maxLength && (
        <p aria-live="polite" className="text-xs text-gray-500">
          {value.length} / {maxLength} characters
        </p>
      )}
    </div>
  );
};
```

---

### 8. Accessible Icon Button Pattern

```typescript
interface AccessibleIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'hover:bg-blue-100 text-blue-600',
    secondary: 'hover:bg-gray-100 text-gray-600',
    danger: 'hover:bg-red-100 text-red-600',
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors
      `}
    >
      <span className="w-5 h-5 flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};
```

---

### 9. Keyboard-Accessible Drag-and-Drop Alternative

```typescript
interface DraggableItemProps {
  id: string;
  title: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: React.ReactNode;
}

const KeyboardAccessibleDraggable: React.FC<DraggableItemProps> = ({
  id,
  title,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}) => {
  return (
    <div className="flex gap-2 items-start">
      {/* Keyboard controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label={`Move "${title}" up`}
          title={`Move "${title}" up`}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label={`Move "${title}" down`}
          title={`Move "${title}" down`}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Item content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};
```

---

### 10. Accessible Live Region Manager

```typescript
// Utility for managing live region announcements
class AccessibleAnnouncer {
  private static instance: AccessibleAnnouncer;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    this.initializeLiveRegion();
  }

  static getInstance(): AccessibleAnnouncer {
    if (!AccessibleAnnouncer.instance) {
      AccessibleAnnouncer.instance = new AccessibleAnnouncer();
    }
    return AccessibleAnnouncer.instance;
  }

  private initializeLiveRegion() {
    if (typeof document !== 'undefined') {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'sr-only';
      document.body.appendChild(this.liveRegion);
    }
  }

  announce(message: string, assertive: boolean = false) {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute(
      'aria-live',
      assertive ? 'assertive' : 'polite'
    );
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  announceError(message: string) {
    this.announce(message, true);
  }

  announceSuccess(message: string) {
    this.announce(message, false);
  }
}

// Usage
const announcer = AccessibleAnnouncer.getInstance();
announcer.announceSuccess('Profile saved successfully');
announcer.announceError('Error: Name is required');
```

---

### 11. Accessible Skip Link Component

```typescript
const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-50 focus:p-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
};

// Usage in VCardPanel
export const VCardPanel: React.FC = () => {
  return (
    <ProfileProvider>
      <SkipLink />
      <main id="main-content">
        <VCardPanelContent />
      </main>
    </ProfileProvider>
  );
};
```

---

### 12. Accessible Confirmation Dialog

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const AccessibleConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus cancel button (safer default)
      confirmButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full m-4 shadow-lg"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-description"
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          {description}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`
              px-4 py-2 rounded text-white font-medium
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 13. Accessible Range Slider

```typescript
interface AccessibleRangeSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const AccessibleRangeSlider: React.FC<AccessibleRangeSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}) => {
  const formattedValue = formatValue ? formatValue(value) : `${value}`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="text-sm font-mono text-gray-500"
        >
          {formattedValue}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formattedValue}
        className="w-full"
      />
    </div>
  );
};
```

---

### 14. Accessible Toast/Notification

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss: () => void;
}

const AccessibleToast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        px-4 py-3 rounded border
        ${typeClasses[type]}
        flex items-center justify-between gap-4
      `}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-current rounded"
      >
        ×
      </button>
    </div>
  );
};
```

---

### 15. Screen Reader Only Class (sr-only)

Add to your Tailwind CSS or use this utility:

```css
/* In your global CSS or Tailwind config */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus,
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## Implementation Checklist by Component

### ✅ ProfileSection.tsx

- [ ] Add `htmlFor` attributes to labels
- [ ] Add `id` attributes to inputs
- [ ] Add `aria-required="true"` to required fields
- [ ] Add `aria-live="polite"` to character count
- [ ] Add `aria-label` to AI enhance button
- [ ] Add `alt` text to avatar image
- [ ] Ensure placeholder is not only label

### ✅ TabNavigation.tsx

- [ ] Verify `role="tablist"` on container
- [ ] Verify `role="tab"` on each tab button
- [ ] Verify `aria-selected="true/false"`
- [ ] Add keyboard handler for Arrow/Home/End keys
- [ ] Move focus to first element in tab panel
- [ ] Update unsaved indicator aria-label to be on button

### ✅ SocialsSection.tsx

- [ ] Change toggles to `role="switch"` with `aria-checked`
- [ ] Add `htmlFor` to toggle labels
- [ ] Add keyboard support (Space/Enter) to toggles
- [ ] Add `aria-label` to edit/delete buttons
- [ ] Ensure URL edit modal has focus management
- [ ] Ensure delete confirmation is `role="alertdialog"`

### ✅ BlocksSection.tsx

- [ ] Verify `aria-label` on block type buttons
- [ ] Add drag handle `aria-label`
- [ ] Add keyboard alternative (up/down buttons)
- [ ] Add `aria-live="assertive"` for reorder announcements
- [ ] Add `aria-label` to edit/delete buttons
- [ ] Make delete confirmation a proper `alertdialog`

### ✅ GlobalSaveBar.tsx

- [ ] Add `aria-live="polite"` to status text
- [ ] Change publish to `role="switch"`
- [ ] Add error message container with `role="alert"`
- [ ] Verify `aria-label` on all buttons
- [ ] Add `aria-busy="true"` during save/publish

### ✅ VCardEditorLayout.tsx

- [ ] Verify `role="main"` on editor pane
- [ ] Verify `role="tabpanel"` on content area
- [ ] Add `aria-labelledby` to tab panel
- [ ] Add skip link to main content
- [ ] Replace `window.confirm()` with custom dialog
- [ ] Ensure focus management on tab change

### ✅ EditorPaneContent.tsx

- [ ] Wrap content in `role="tabpanel"`
- [ ] Add `aria-labelledby` to panel
- [ ] Add `aria-label` to loading spinner
- [ ] Verify heading hierarchy (no skipped levels)

### ✅ RangeSlider.tsx

- [ ] Add `htmlFor` to label
- [ ] Add `id` to input
- [ ] Add `aria-label` to input
- [ ] Add `aria-valuetext` for custom formats
- [ ] Add `aria-live="polite"` to value display

### ✅ ColorPicker.tsx

- [ ] Add `aria-label` to color input
- [ ] Verify contrast of color preview
- [ ] Add keyboard support if custom
- [ ] Announce copied-to-clipboard

---

## Testing Templates

### Keyboard Navigation Test Template

```markdown
# Keyboard Navigation Test - [Component Name]
Date: ____
Tester: ____

## Tab Navigation
- [ ] Tab moves to next element
- [ ] Shift+Tab moves to previous element
- [ ] Focus order is logical
- [ ] All interactive elements reachable

## Tab Component (if applicable)
- [ ] Arrow Right/Down switches to next tab
- [ ] Arrow Left/Up switches to previous tab
- [ ] Home goes to first tab
- [ ] End goes to last tab
- [ ] Focus moves to tab panel content
- [ ] Tab switches on arrow key, not just focus

## Form Fields (if applicable)
- [ ] Can tab to all inputs
- [ ] Enter submits form
- [ ] Required fields indicated

## Modals (if applicable)
- [ ] Tab trapped inside modal
- [ ] Escape closes modal
- [ ] Focus returns to trigger

## Results
- Total: __/__ (Pass rate: _%)
- Issues: [list any issues]
```

### Screen Reader Test Template

```markdown
# Screen Reader Test - [Component Name]
Date: ____
Tester: ____
Screen Reader: [ ] NVDA [ ] JAWS [ ] VoiceOver

## Page Structure
- [ ] Page title announced
- [ ] Main content identified (role="main")
- [ ] Skip links available
- [ ] Heading structure correct (no skips)

## Form Fields
- [ ] Label announced with field
- [ ] Required indicated
- [ ] Error announced
- [ ] Help text announced
- [ ] Placeholder not used as label

## Buttons
- [ ] Button type announced
- [ ] Label clear and descriptive
- [ ] Loading state announced
- [ ] Disabled state indicated

## Tabs
- [ ] Tab structure understood
- [ ] Active tab indicated
- [ ] Tab switching announced
- [ ] Content panel identified

## Status Updates
- [ ] Save notification announced
- [ ] Error messages announced
- [ ] Loading state announced
- [ ] No announcements missed

## Results
- Total: __/__ (Pass rate: _%)
- Issues: [list any issues]
```

### Color Contrast Test Template

```markdown
# Color Contrast Test - [Component Name]
Date: ____
Tool: WebAIM Contrast Checker

## Text Elements
- [ ] Normal text: 4.5:1 (measured: __:1)
- [ ] Large text: 3:1 (measured: __:1)
- [ ] Disabled text: 4.5:1 (measured: __:1)

## UI Components
- [ ] Focus ring: 3:1 (measured: __:1)
- [ ] Button borders: 3:1 (measured: __:1)
- [ ] Icons: 3:1 (measured: __:1)

## Results
- Pass: [ ] Yes [ ] No
- Issues: [list any issues]
```

---

## Quick Implementation Steps

### Step 1: Prepare Workspace (30 mins)
```bash
# Create feature branch
git checkout -b feat/accessibility-remediation

# Install accessibility testing tools
npm install --save-dev axe-core jest-axe pa11y
```

### Step 2: Fix Critical Issues (Week 1)
1. Form label associations (2 hours)
2. Tab panel ARIA structure (2 hours)
3. Live regions for status (2 hours)
4. Tab keyboard navigation (3 hours)
5. Drag-drop keyboard alternative (4 hours)
6. Replace window.confirm (3 hours)
7. Fix switch toggles (3 hours)
8. Character count live region (1 hour)

### Step 3: Fix Major Issues (Week 2-3)
1. Error message association (4 hours)
2. Heading hierarchy verification (2 hours)
3. Skip link implementation (1 hour)
4. Focus management on tab change (2 hours)
5. Modal implementation (4 hours)
6. Reorder announcements (2 hours)
7. Publish toggle switch (1 hour)
8. Image alt text (2 hours)

### Step 4: Fix Minor Issues (Week 3-4)
1. Color contrast audit (4 hours)
2. Reduced motion support (2 hours)
3. Touch target sizing (2 hours)
4. Toast notifications (1 hour)
5. Final testing (2 hours)

### Step 5: Testing & Validation
- [ ] Automated axe testing
- [ ] Manual keyboard navigation
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Color contrast validation
- [ ] Focus visibility audit
- [ ] Mobile/touch testing

### Step 6: Documentation & Sign-off
- [ ] Update component documentation
- [ ] Add accessibility notes to README
- [ ] Create accessibility testing guide
- [ ] Submit for accessibility review

---

## Validation Commands

```bash
# Test for accessibility issues with axe
npm run test:accessibility

# Run Lighthouse audit
npm run audit:lighthouse

# Check with Pa11y
npm run test:a11y

# Build and test
npm run build
npm start
```

---

## Resources

### Tools
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE:** https://wave.webaim.org/
- **NVDA Screen Reader:** https://www.nvaccess.org/
- **Pa11y CLI:** https://pa11y.org/

### Learning
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices Guide:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Articles:** https://webaim.org/articles/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Components
- **Headless UI:** https://headlessui.dev/
- **Radix UI:** https://www.radix-ui.com/
- **React Aria:** https://react-aria.adobe.com/

---

## Support & Questions

For questions about implementing accessibility fixes:
1. Review the ACCESSIBILITY_AUDIT.md for detailed issue descriptions
2. Check the relevant sections in this guide
3. Test with actual assistive technologies
4. Refer to WCAG 2.1 guidelines for edge cases

---

**Document Version:** 1.0
**Last Updated:** 2026-01-31

