# E2E Test Suite - Quick Start Guide

## Installation

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Quick Commands

```bash
# Run all tests (recommended)
npm run test:e2e

# Run with UI (interactive debugging)
npm run test:e2e:ui

# View last report
npx playwright show-report test-results/html-report
```

### Advanced Commands

```bash
# Single test file
npx playwright test e2e/vcard-panel.spec.ts

# Specific browser
npx playwright test --project=chromium-desktop
npx playwright test --project=mobile-chrome

# Specific test by ID
npx playwright test -g "TC-001"

# Debug mode (step through)
npx playwright test --debug

# Headed mode (watch tests)
npx playwright test --headed

# Update snapshots
npx playwright test --update-snapshots
```

## Test Files

| File | Scenarios | What It Tests |
|------|-----------|---------------|
| `vcard-panel.spec.ts` | 17 | Main editor, tabs, save/publish |
| `vcard-blocks.spec.ts` | 21 | All 8 block types, CRUD operations |
| `vcard-templates.spec.ts` | 14 | Template gallery, 3 application modes |
| `vcard-appearance.spec.ts` | 12 | Themes, colors, typography |
| `vcard-public-profile.spec.ts` | 10 | Public viewing, downloads, SEO |

**Total: 74 test scenarios**

## Test Case IDs

Quick lookup for specific tests:

### Panel Tests (TC-001 to TC-017)
- TC-001: Load panel with all tabs
- TC-004: Save changes successfully
- TC-005: Publish profile
- TC-007: Real-time preview updates
- TC-015: Mobile responsive

### Block Tests (TC-018 to TC-038)
- TC-018 to TC-025: Add all 8 block types
- TC-026: Edit block configuration
- TC-027: Delete block
- TC-028: Drag-and-drop reorder
- TC-030: Gallery with multiple images

### Template Tests (TC-039 to TC-052)
- TC-039: Open template gallery
- TC-045: Apply in Replace mode
- TC-046: Apply in Merge mode
- TC-047: Apply in Theme-Only mode

### Appearance Tests (TC-053 to TC-064)
- TC-054: Customize button color
- TC-056: Customize typography
- TC-059: Apply gradient background
- TC-064: Dark mode toggle

### Public Profile Tests (TC-065 to TC-074)
- TC-065: Published profile accessible
- TC-067: Submit contact form
- TC-069: Download QR code
- TC-070: Download vCard file

## Troubleshooting

### Tests won't start
```bash
# Reinstall browsers
npx playwright install --force

# Check dev server
npm run dev
# Should start on http://localhost:5173
```

### Tests failing
```bash
# Run in debug mode
npx playwright test --debug

# Check HTML report for details
npx playwright show-report test-results/html-report

# View video of failure
# Videos are in test-results/artifacts/
```

### Slow tests
```bash
# Run sequentially (slower but more stable)
npx playwright test --workers=1

# Run specific file only
npx playwright test e2e/vcard-panel.spec.ts
```

## Test Data

Default test user:
- **Email:** test@example.com
- **Password:** Test123!@#

Tests create unique data using timestamps.

## Browser Projects

| Project | Description |
|---------|-------------|
| `chromium-desktop` | Desktop Chrome (1280x720) |
| `firefox-desktop` | Desktop Firefox (1280x720) |
| `webkit-desktop` | Desktop Safari (1280x720) |
| `mobile-chrome` | Mobile Chrome (Pixel 5) |
| `mobile-safari` | Mobile Safari (iPhone 13) |

## Reports

After running tests, view:

```bash
# HTML report (interactive)
npx playwright show-report test-results/html-report

# JSON report (machine-readable)
cat test-results/results.json

# JUnit XML (CI integration)
cat test-results/junit.xml
```

## Expected Results

- **Total tests:** 74 scenarios
- **Total executions:** 370 (74 × 5 browsers)
- **Time:** ~8-10 minutes for all browsers
- **Pass rate:** Should be 100%

## CI/CD

Tests automatically run on:
- Every push
- Every pull request
- Retries: 2 times on failure

## More Info

See full documentation:
- `e2e/README.md` - Complete test suite docs
- `PHASE_7_E2E_TEST_SUITE.md` - Implementation details
- `playwright.config.ts` - Configuration options

## Quick Tips

1. **Always run UI mode first** for new tests: `npm run test:e2e:ui`
2. **Check videos** when tests fail: `test-results/artifacts/`
3. **Use test IDs** to run specific tests: `npx playwright test -g "TC-001"`
4. **Run single browser** for speed during development: `--project=chromium-desktop`
5. **Keep dev server running** to avoid restart delays

---

**Ready to test? Run:** `npm run test:e2e:ui`
