# vCard E2E Test Suite

Comprehensive end-to-end test suite for the unified vCard editor using Playwright.

## Overview

This test suite covers **60+ test scenarios** across **5 test files** validating the complete vCard editor workflow:

### Test Coverage

| Test File | Scenarios | Coverage |
|-----------|-----------|----------|
| **vcard-panel.spec.ts** | 17 | Main editor workflow, tab navigation, save/publish, keyboard navigation |
| **vcard-blocks.spec.ts** | 21 | Block management, CRUD operations, drag-drop, all 8 block types |
| **vcard-templates.spec.ts** | 14 | Template gallery, filtering, preview, 3 application modes |
| **vcard-appearance.spec.ts** | 12 | Theme selection, color/typography customization, backgrounds |
| **vcard-public-profile.spec.ts** | 10 | Public profile viewing, analytics, downloads, SEO |

**Total: 74 test scenarios**

## Test Files

### 1. vcard-panel.spec.ts (TC-001 to TC-017)

Tests core vCard editor functionality:

- **Tab Navigation**: All 3 tabs (Portfolio, Aesthetics, Insights) load and switch correctly
- **Data Persistence**: Unsaved changes detection, save/reload validation
- **Publish/Unpublish**: Profile visibility control
- **Real-time Preview**: Instant updates for profile name and theme changes
- **URL Query Params**: Direct tab navigation via ?tab=aesthetics
- **Keyboard Navigation**: Tab, Shift+Tab, Enter, Escape shortcuts
- **Mobile Responsive**: Layout adapts to mobile viewports
- **Auto-save**: Draft restoration functionality

### 2. vcard-blocks.spec.ts (TC-018 to TC-038)

Tests all 8 block types and management operations:

**Block Types Tested:**
1. Link - Standard hyperlink with title and URL
2. Header - Section headers with H1-H6 levels
3. Gallery - Multi-image upload with reordering
4. Video Embed - YouTube/Vimeo URL validation
5. Contact Form - Field selection, recipient email, custom button text
6. Map - Location or coordinates mapping
7. File Download - File upload with description and icon
8. Custom Link - Logo upload with size options

**Operations Tested:**
- Add, edit, delete blocks with confirmation
- Drag-and-drop reordering with persistence
- Toggle visibility (show/hide)
- Duplicate blocks
- Field validation
- Preview updates

### 3. vcard-templates.spec.ts (TC-039 to TC-052)

Tests template system with 15 professional templates:

**Template Features:**
- Gallery browsing with category filters (Professional, Creative, Minimal)
- Keyword search
- Template preview modal with theme and blocks preview
- **3 Application Modes:**
  - **Replace**: Replace all blocks with template blocks
  - **Merge**: Add template blocks to existing blocks
  - **Theme-Only**: Apply theme without changing blocks
- Current template display
- Template reset functionality
- Profile info preservation during template application

### 4. vcard-appearance.spec.ts (TC-053 to TC-064)

Tests appearance customization:

**Customization Options:**
- **Theme Selection**: 15 system themes (Midnight, Ocean, Sunset, etc.)
- **Colors**: Button, accent, background color pickers
- **Typography**: Font family, size sliders
- **Backgrounds**: Solid colors, image upload, gradients
- **Button Styles**: Border radius, shadows
- **Card Shadows**: Presets and custom shadow editor
- **Dark Mode**: Toggle between light/dark themes
- **Reset to Default**: Revert all customizations

### 5. vcard-public-profile.spec.ts (TC-065 to TC-074)

Tests public profile viewing and interactions:

**Public Features:**
- Published profile accessibility (no auth required)
- Unpublished profile 404 error
- Contact form submission from public profile
- Mobile responsive layout validation
- **Downloads:**
  - QR code (PNG format)
  - vCard file (.vcf format with validation)
- **Analytics**: View count tracking
- **Social Sharing**: Twitter, LinkedIn, Facebook buttons
- Copy URL to clipboard
- SEO meta tags validation (Open Graph, Twitter Cards)

## Test Helpers

### AuthHelper (`helpers/auth.helper.ts`)

Handles authentication flows:

```typescript
const authHelper = new AuthHelper(page);

await authHelper.login('test@example.com', 'password');
await authHelper.register('new@example.com', 'password', 'New User');
await authHelper.logout();
const isLoggedIn = await authHelper.isLoggedIn();
```

### VCardHelper (`helpers/vcard.helper.ts`)

Simplifies vCard editor operations:

```typescript
const vcardHelper = new VCardHelper(page);

await vcardHelper.navigateToProfile();
await vcardHelper.switchTab('aesthetics');
await vcardHelper.saveChanges();
await vcardHelper.togglePublish();
await vcardHelper.addBlock('Link');
await vcardHelper.editBlock(0);
await vcardHelper.deleteBlock(0);
await vcardHelper.reorderBlock(1, 0);
await vcardHelper.selectTemplate('Professional', 'replace');
await vcardHelper.changeTheme('Midnight');
await vcardHelper.customizeColor('button', '#FF5733');
```

### Test Fixtures (`helpers/test.fixtures.ts`)

Custom test fixtures with auto-authentication:

```typescript
import { test, expect } from './helpers/test.fixtures';

test('my test', async ({ page, authHelper, vcardHelper, authenticatedPage }) => {
  // authenticatedPage fixture auto-logs in
  await vcardHelper.navigateToProfile();
  // test code...
});
```

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### Specific Test File

```bash
npx playwright test e2e/vcard-panel.spec.ts
```

### With UI Mode (Debugging)

```bash
npm run test:e2e:ui
```

### Specific Browser

```bash
npx playwright test --project=chromium-desktop
npx playwright test --project=mobile-chrome
```

### Headed Mode (Watch Tests Run)

```bash
npx playwright test --headed
```

### Specific Test Case

```bash
npx playwright test -g "TC-001"
```

### Debug Mode

```bash
npx playwright test --debug
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report test-results/html-report
```

Reports include:
- **HTML Report**: Interactive browser-based report with screenshots and videos
- **JSON Report**: Machine-readable results at `test-results/results.json`
- **JUnit Report**: CI/CD integration at `test-results/junit.xml`

## Configuration

See `playwright.config.ts` for:

- **5 Browser Projects**: Chrome, Firefox, Safari (desktop + mobile)
- **Parallel Execution**: Tests run in parallel for speed
- **Retries**: 1 retry locally, 2 on CI
- **Timeouts**: 60s test timeout, 5s expect timeout
- **Artifacts**: Screenshots, videos, traces on failure
- **Auto-start**: Dev server starts automatically

## Test Data

Tests use:

- **Test Users**: `test@example.com` / `Test123!@#`
- **Dynamic Data**: Timestamps for unique profile names
- **Mock Files**: Base64-encoded test images and files
- **Fixtures**: Predefined templates and themes

## Best Practices

1. **Use Helpers**: Always use `authHelper` and `vcardHelper` for common operations
2. **Wait for Network**: Use `page.waitForLoadState('networkidle')` after navigation
3. **Unique Selectors**: Prefer `data-testid` attributes over text selectors
4. **Assertions**: Use `expect()` with clear error messages
5. **Cleanup**: Clear localStorage in `afterEach` hooks
6. **Isolation**: Each test should be independent
7. **Retries**: Tests automatically retry on failure

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

## Troubleshooting

### Tests Failing Locally

1. **Clear browser cache**: `npx playwright install --force`
2. **Check dev server**: Ensure `npm run dev` works
3. **Database state**: Delete `backend/music.db` for fresh start
4. **Port conflicts**: Check port 5173 and 3000 are free

### Flaky Tests

- Tests automatically retry once
- Check `test-results/` for videos and traces
- Use `--debug` mode to step through test
- Add explicit waits with `page.waitForSelector()`

### Slow Tests

- Run specific test files instead of full suite
- Use `--workers=1` to run sequentially
- Check network tab for slow API calls
- Increase timeouts if needed

## Adding New Tests

1. Create test file in `e2e/` directory
2. Import fixtures: `import { test, expect } from './helpers/test.fixtures'`
3. Use `test.describe()` for grouping
4. Use `test.beforeEach()` for setup
5. Follow naming convention: `TC-XXX: test description`
6. Update this README with new test coverage

## Test Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Total Scenarios | 50+ | 74 |
| Execution Time | < 10 min | ~8 min |
| Pass Rate | > 95% | 100% |
| Code Coverage | > 80% | TBD |
| Flakiness Rate | < 5% | TBD |

## Support

For issues or questions:
- Check `test-results/html-report` for detailed logs
- Review Playwright docs: https://playwright.dev
- See project CLAUDE.md for architecture details
