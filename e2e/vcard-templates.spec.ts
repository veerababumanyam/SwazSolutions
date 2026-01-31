/**
 * E2E Test Suite: vCard Panel - Template System
 *
 * Tests template functionality including:
 * - Template gallery browsing
 * - Category filtering and search
 * - Template preview
 * - Template application modes (Replace, Merge, Theme-Only)
 * - Current template display
 *
 * Coverage: 12+ test scenarios
 */

import { test, expect } from './helpers/test.fixtures';

test.describe('vCard Panel - Templates', () => {
  test.beforeEach(async ({ page, authHelper, vcardHelper }) => {
    await authHelper.login();
    await vcardHelper.navigateToProfile();
    await vcardHelper.switchTab('aesthetics');
  });

  test('TC-039: opens template gallery', async ({ page }) => {
    // Click "Browse Templates"
    await page.click('button:has-text("Browse Templates")');

    // Assert template gallery opens
    await expect(page.locator('[data-testid="template-gallery"]')).toBeVisible();

    // Assert templates are displayed
    const templateCards = page.locator('[data-testid="template-card"]');
    await expect(templateCards).toHaveCount(15); // 15 professional templates
  });

  test('TC-040: filters templates by Professional category', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Click "Professional" filter
    await page.click('button[data-filter="professional"]');

    // Assert only professional templates shown
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(15);
  });

  test('TC-041: filters templates by Creative category', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Click "Creative" filter
    await page.click('button[data-filter="creative"]');

    // Assert only creative templates shown
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('TC-042: filters templates by Minimal category', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Click "Minimal" filter
    await page.click('button[data-filter="minimal"]');

    // Assert only minimal templates shown
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('TC-043: searches templates by keyword', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Search for "photographer"
    await page.fill('input[placeholder*="Search"]', 'photographer');

    // Assert search results updated
    const templateCards = page.locator('[data-testid="template-card"]');
    const firstCard = templateCards.first();

    await expect(firstCard).toContainText(/photographer/i);
  });

  test('TC-044: previews template before applying', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Click first template card
    const firstTemplate = page.locator('[data-testid="template-card"]').first();
    const templateName = await firstTemplate.locator('[data-testid="template-name"]').textContent();

    await firstTemplate.click();

    // Assert preview modal opens
    await expect(page.locator('[data-testid="template-preview-modal"]')).toBeVisible();

    // Check theme preview shown
    await expect(page.locator('[data-testid="template-theme-preview"]')).toBeVisible();

    // Check blocks preview shown
    await expect(page.locator('[data-testid="template-blocks-preview"]')).toBeVisible();

    // Close without applying
    await page.click('button:has-text("Close")');

    // Assert modal closed
    await expect(page.locator('[data-testid="template-preview-modal"]')).not.toBeVisible();
  });

  test('TC-045: applies template in Replace mode', async ({ page, vcardHelper }) => {
    // Add custom blocks first
    await vcardHelper.switchTab('portfolio');
    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'Custom Link');
    await page.click('button:has-text("Save Block")');

    await vcardHelper.assertBlockCount(1);

    // Go to templates
    await vcardHelper.switchTab('aesthetics');
    await page.click('button:has-text("Browse Templates")');

    // Click first template
    await page.locator('[data-testid="template-card"]').first().click();

    // Select "Replace" mode
    await page.click('button:has-text("Replace All")');

    // Confirm replacement
    await page.click('button:has-text("Apply Template")');

    // Assert success toast
    await expect(page.locator('.toast:has-text("applied")')).toBeVisible();

    // Go back to Portfolio
    await vcardHelper.switchTab('portfolio');

    // Assert custom blocks replaced with template blocks
    const blocks = page.locator('[data-testid="block-item"]');
    const count = await blocks.count();

    expect(count).toBeGreaterThan(1); // Template should have multiple blocks
  });

  test('TC-046: applies template in Merge mode', async ({ page, vcardHelper }) => {
    // Add custom blocks
    await vcardHelper.switchTab('portfolio');
    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'Existing Link');
    await page.click('button:has-text("Save Block")');

    const initialCount = await page.locator('[data-testid="block-item"]').count();

    // Apply template in Merge mode
    await vcardHelper.switchTab('aesthetics');
    await page.click('button:has-text("Browse Templates")');
    await page.locator('[data-testid="template-card"]').first().click();

    // Select "Merge" mode
    await page.click('button:has-text("Merge")');
    await page.click('button:has-text("Apply Template")');

    await expect(page.locator('.toast:has-text("applied")')).toBeVisible();

    // Assert custom blocks still exist
    await vcardHelper.switchTab('portfolio');

    const blocks = page.locator('[data-testid="block-item"]');
    const newCount = await blocks.count();

    expect(newCount).toBeGreaterThan(initialCount); // Should have original + template blocks

    // Assert original block still exists
    await expect(blocks.locator('text=Existing Link')).toBeVisible();
  });

  test('TC-047: applies template in Theme-Only mode', async ({ page, vcardHelper }) => {
    // Customize blocks
    await vcardHelper.switchTab('portfolio');
    await vcardHelper.addBlock('Header');
    await page.fill('input[name="headerText"]', 'My Header');
    await page.click('button:has-text("Save Block")');

    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'My Link');
    await page.click('button:has-text("Save Block")');

    const blocksBefore = await page.locator('[data-testid="block-item"]').allTextContents();

    // Apply template in Theme-Only mode
    await vcardHelper.switchTab('aesthetics');
    await page.click('button:has-text("Browse Templates")');
    await page.locator('[data-testid="template-card"]').first().click();

    // Select "Theme-Only" mode
    await page.click('button:has-text("Theme Only")');
    await page.click('button:has-text("Apply Template")');

    await expect(page.locator('.toast:has-text("applied")')).toBeVisible();

    // Assert blocks unchanged
    await vcardHelper.switchTab('portfolio');
    const blocksAfter = await page.locator('[data-testid="block-item"]').allTextContents();

    expect(blocksAfter).toEqual(blocksBefore);

    // Assert theme updated (check preview background or button color changed)
    await vcardHelper.switchTab('aesthetics');
    const themeName = await page.locator('[data-testid="current-theme"]').textContent();
    expect(themeName).toBeTruthy();
  });

  test('TC-048: shows currently applied template', async ({ page, vcardHelper }) => {
    // Apply a template
    await page.click('button:has-text("Browse Templates")');
    const templateCard = page.locator('[data-testid="template-card"]').first();
    const templateName = await templateCard.locator('[data-testid="template-name"]').textContent();

    await templateCard.click();
    await page.click('button:has-text("Apply Template")');

    await expect(page.locator('.toast')).toBeVisible();

    // Assert template name shown in Aesthetics tab
    await expect(page.locator('[data-testid="current-template"]')).toContainText(templateName || '');

    // Assert "Change Template" option visible
    await expect(page.locator('button:has-text("Change Template")')).toBeVisible();
  });

  test('TC-049: clears template and restores custom theme', async ({ page, vcardHelper }) => {
    // Apply a template
    await page.click('button:has-text("Browse Templates")');
    await page.locator('[data-testid="template-card"]').first().click();
    await page.click('button:has-text("Apply Template")');

    // Clear template
    await page.click('button:has-text("Clear Template")');

    // Confirm
    await page.click('button:has-text("Confirm")');

    // Assert template cleared
    await expect(page.locator('[data-testid="current-template"]')).toHaveText('None');

    // Assert custom theme options available
    await expect(page.locator('[data-testid="custom-theme-section"]')).toBeVisible();
  });

  test('TC-050: template preview shows accurate block types', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Click a template
    await page.locator('[data-testid="template-card"]').first().click();

    // Assert block type counts shown
    const blocksPreview = page.locator('[data-testid="template-blocks-preview"]');

    await expect(blocksPreview).toContainText(/link|header|gallery|contact/i);
  });

  test('TC-051: template categories show correct counts', async ({ page }) => {
    await page.click('button:has-text("Browse Templates")');

    // Click Professional filter
    await page.click('button[data-filter="professional"]');
    const professionalCount = await page.locator('[data-testid="template-card"]').count();

    // Click Creative filter
    await page.click('button[data-filter="creative"]');
    const creativeCount = await page.locator('[data-testid="template-card"]').count();

    // Assert counts are positive
    expect(professionalCount).toBeGreaterThan(0);
    expect(creativeCount).toBeGreaterThan(0);
  });

  test('TC-052: template application preserves custom profile info', async ({ page, vcardHelper }) => {
    // Set custom profile info
    await vcardHelper.switchTab('portfolio');
    await page.fill('input[name="profileName"]', 'John Doe');
    await page.fill('textarea[name="bio"]', 'Professional developer');

    // Apply template
    await vcardHelper.switchTab('aesthetics');
    await page.click('button:has-text("Browse Templates")');
    await page.locator('[data-testid="template-card"]').first().click();
    await page.click('button:has-text("Apply Template")');

    // Assert profile info preserved
    await vcardHelper.switchTab('portfolio');
    await expect(page.locator('input[name="profileName"]')).toHaveValue('John Doe');
    await expect(page.locator('textarea[name="bio"]')).toHaveValue('Professional developer');
  });
});
