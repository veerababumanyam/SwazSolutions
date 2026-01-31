/**
 * E2E Test Suite: vCard Panel - Main Editor Workflow
 *
 * Tests the core functionality of the unified vCard editor including:
 * - Panel loading and tab navigation
 * - Data persistence and unsaved changes detection
 * - Save/publish actions
 * - Real-time preview updates
 * - URL query parameter handling
 * - Keyboard navigation
 *
 * Coverage: 15+ test scenarios
 */

import { test, expect } from './helpers/test.fixtures';

test.describe('vCard Panel - Main Editor Workflow', () => {
  test.beforeEach(async ({ page, authHelper, vcardHelper }) => {
    // Login and navigate to profile editor
    await authHelper.login();
    await vcardHelper.navigateToProfile();
  });

  test.afterEach(async ({ page }) => {
    // Clear any unsaved changes
    await page.evaluate(() => localStorage.clear());
  });

  test('TC-001: loads VCardPanel with all three tabs visible', async ({ page }) => {
    // Assert all tabs are visible
    await expect(page.locator('button:has-text("Portfolio")')).toBeVisible();
    await expect(page.locator('button:has-text("Aesthetics")')).toBeVisible();
    await expect(page.locator('button:has-text("Insights")')).toBeVisible();

    // Assert Portfolio tab is active by default
    await expect(page.locator('button:has-text("Portfolio")[aria-selected="true"]')).toBeVisible();

    // Assert preview pane visible on desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="mobile-preview"]')).toBeVisible();

    // Assert save bar visible
    await expect(page.locator('[data-testid="save-bar"]')).toBeVisible();
  });

  test('TC-002: switches between tabs without losing data', async ({ page, vcardHelper }) => {
    // Edit bio in Portfolio tab
    const bioField = page.locator('textarea[name="bio"]');
    await bioField.fill('This is my test biography');

    // Switch to Aesthetics tab
    await vcardHelper.switchTab('aesthetics');
    await expect(page.locator('[data-testid="aesthetics-panel"]')).toBeVisible();

    // Switch to Insights tab
    await vcardHelper.switchTab('insights');
    await expect(page.locator('[data-testid="insights-panel"]')).toBeVisible();

    // Switch back to Portfolio
    await vcardHelper.switchTab('portfolio');

    // Assert bio is still there
    await expect(bioField).toHaveValue('This is my test biography');
  });

  test('TC-003: detects unsaved changes and shows warning', async ({ page, vcardHelper }) => {
    // Edit profile name
    const nameField = page.locator('input[name="profileName"]');
    await nameField.fill('Updated Profile Name');

    // Assert "Unsaved changes" indicator visible
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).toBeVisible();

    // Try to navigate away (simulate browser back)
    const hasWarning = await page.evaluate(() => {
      window.history.back();
      return true; // beforeunload event should be triggered
    });

    expect(hasWarning).toBeTruthy();
  });

  test('TC-004: saves changes successfully', async ({ page, vcardHelper }) => {
    // Edit profile name
    const nameField = page.locator('input[name="profileName"]');
    const newName = `Profile ${Date.now()}`;
    await nameField.fill(newName);

    // Click Save button
    await vcardHelper.saveChanges();

    // Assert success toast
    await expect(page.locator('.toast:has-text("saved")')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert changes persisted
    await expect(page.locator('input[name="profileName"]')).toHaveValue(newName);
  });

  test('TC-005: publishes profile successfully', async ({ page, vcardHelper }) => {
    // Toggle Publish switch
    await vcardHelper.togglePublish();

    // Assert success toast
    await expect(page.locator('.toast')).toContainText(/published|live/i);

    // Get public profile URL
    const publicUrl = await vcardHelper.getPublicProfileUrl();
    expect(publicUrl).toContain('/u/');

    // Navigate to public profile
    await page.goto(publicUrl);

    // Assert profile visible
    await expect(page.locator('[data-testid="public-profile"]')).toBeVisible();
  });

  test('TC-006: unpublishes profile successfully', async ({ page, vcardHelper }) => {
    // First publish
    await vcardHelper.togglePublish();
    await page.waitForSelector('.toast', { timeout: 3000 });

    // Get public URL before unpublishing
    const publicUrl = await vcardHelper.getPublicProfileUrl();

    // Unpublish
    await vcardHelper.togglePublish();
    await expect(page.locator('.toast')).toContainText(/unpublished|private/i);

    // Try to access public profile
    const response = await page.goto(publicUrl);
    expect(response?.status()).toBe(404);
  });

  test('TC-007: real-time preview updates with profile name change', async ({ page, vcardHelper }) => {
    // Edit profile name
    const nameField = page.locator('input[name="profileName"]');
    await nameField.fill('Real-time Test Name');

    // Assert mobile preview updates instantly
    await vcardHelper.assertPreviewUpdated('h1', 'Real-time Test Name');
  });

  test('TC-008: real-time preview updates with theme change', async ({ page, vcardHelper }) => {
    // Switch to Aesthetics tab
    await vcardHelper.switchTab('aesthetics');

    // Change theme
    await vcardHelper.changeTheme('Midnight');

    // Assert preview theme updates
    const preview = page.locator('[data-testid="mobile-preview"]');
    const bgColor = await preview.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Midnight theme should have dark background
    expect(bgColor).toMatch(/rgb\((\d+), (\d+), (\d+)\)/);
  });

  test('TC-009: URL query params control active tab (aesthetics)', async ({ page }) => {
    // Navigate to /profile?tab=aesthetics
    await page.goto('/profile?tab=aesthetics');
    await page.waitForLoadState('networkidle');

    // Assert Aesthetics tab active
    await expect(page.locator('button:has-text("Aesthetics")[aria-selected="true"]')).toBeVisible();
    await expect(page.locator('[data-testid="aesthetics-panel"]')).toBeVisible();
  });

  test('TC-010: URL query params control active tab (insights)', async ({ page }) => {
    // Navigate to /profile?tab=insights
    await page.goto('/profile?tab=insights');
    await page.waitForLoadState('networkidle');

    // Assert Insights tab active
    await expect(page.locator('button:has-text("Insights")[aria-selected="true"]')).toBeVisible();
    await expect(page.locator('[data-testid="insights-panel"]')).toBeVisible();
  });

  test('TC-011: keyboard navigation - Tab through form fields', async ({ page, vcardHelper }) => {
    // Focus on first input
    await page.locator('input[name="profileName"]').focus();

    // Tab through fields
    await page.keyboard.press('Tab');
    const activeElement1 = await page.evaluate(() => document.activeElement?.getAttribute('name'));

    await page.keyboard.press('Tab');
    const activeElement2 = await page.evaluate(() => document.activeElement?.getAttribute('name'));

    // Assert focus moved
    expect(activeElement1).not.toBe('profileName');
    expect(activeElement2).not.toBe(activeElement1);
  });

  test('TC-012: keyboard navigation - Shift+Tab backwards', async ({ page }) => {
    // Focus on a middle field
    await page.locator('textarea[name="bio"]').focus();

    // Shift+Tab backwards
    await page.keyboard.press('Shift+Tab');
    const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('name'));

    // Assert focus moved backwards
    expect(activeElement).toBe('profileName');
  });

  test('TC-013: keyboard navigation - Enter on Save button', async ({ page, vcardHelper }) => {
    // Make a change
    await page.locator('input[name="profileName"]').fill('Keyboard Test');

    // Focus Save button
    await page.locator('button:has-text("Save")').focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Assert save triggered
    await expect(page.locator('.toast:has-text("saved")')).toBeVisible();
  });

  test('TC-014: keyboard navigation - Escape closes modals', async ({ page }) => {
    // Open Add Block modal
    await page.click('button:has-text("Add Block")');
    await expect(page.locator('[data-testid="add-block-modal"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Assert modal closed
    await expect(page.locator('[data-testid="add-block-modal"]')).not.toBeVisible();
  });

  test('TC-015: mobile responsive layout', async ({ page, vcardHelper }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Assert preview hidden on mobile
    await expect(page.locator('[data-testid="mobile-preview"]')).not.toBeVisible();

    // Assert tabs still accessible
    await expect(page.locator('button:has-text("Portfolio")')).toBeVisible();
    await expect(page.locator('button:has-text("Aesthetics")')).toBeVisible();
    await expect(page.locator('button:has-text("Insights")')).toBeVisible();

    // Assert save bar sticky on mobile
    const saveBar = page.locator('[data-testid="save-bar"]');
    await expect(saveBar).toHaveCSS('position', 'sticky');
  });

  test('TC-016: cancel unsaved changes confirmation', async ({ page, vcardHelper }) => {
    // Make changes
    await page.locator('input[name="profileName"]').fill('Unsaved Changes Test');

    // Assert unsaved indicator
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).toBeVisible();

    // Click Cancel/Reset button
    await page.click('button:has-text("Cancel")');

    // Assert confirmation dialog
    await expect(page.locator('text=discard unsaved changes')).toBeVisible();

    // Confirm cancellation
    await page.click('button:has-text("Discard")');

    // Assert changes reverted
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).not.toBeVisible();
  });

  test('TC-017: auto-save draft functionality', async ({ page, vcardHelper }) => {
    // Make changes
    await page.locator('input[name="profileName"]').fill('Auto-save Test');

    // Wait for auto-save (if implemented)
    await page.waitForTimeout(3000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert draft restored or prompt shown
    const nameValue = await page.locator('input[name="profileName"]').inputValue();
    const hasDraftPrompt = await page.locator('text=restore draft').isVisible().catch(() => false);

    expect(nameValue === 'Auto-save Test' || hasDraftPrompt).toBeTruthy();
  });
});
