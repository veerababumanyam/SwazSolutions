import { defineConfig, devices } from '@playwright/test';

/**
 * Optimized Playwright Configuration for vCard E2E Tests
 *
 * Features:
 * - Parallel execution for speed
 * - Retries for flaky test resilience
 * - HTML and JSON reporters
 * - Video recording for failed tests
 * - Screenshots on failure
 * - Multiple browser testing
 * - Mobile viewport testing
 */

export default defineConfig({
  testDir: './e2e',

  // Run tests in parallel for speed
  fullyParallel: true,

  // Fail the build on CI if you accidentally leave test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI for flaky test resilience
  retries: process.env.CI ? 2 : 1,

  // Limit workers on CI for stability
  workers: process.env.CI ? 2 : undefined,

  // Multiple reporters for comprehensive output
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Global test timeout (10 minutes max per test)
  timeout: 60000,

  // Expect timeout (5 seconds for assertions)
  expect: {
    timeout: 5000,
  },

  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry for debugging
    trace: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Test multiple browsers and viewports
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],

  // Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Output folder for test artifacts
  outputDir: 'test-results/artifacts',
});
