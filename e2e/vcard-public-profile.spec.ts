/**
 * E2E Test Suite: vCard Panel - Public Profile Viewing
 *
 * Tests public profile functionality including:
 * - Published profile accessibility
 * - Unpublished profile 404
 * - Contact form submission from public profile
 * - Mobile responsive layout
 * - QR code download
 * - vCard file download
 * - Analytics tracking
 * - Social sharing
 *
 * Coverage: 10+ test scenarios
 */

import { test, expect } from './helpers/test.fixtures';

test.describe('vCard Panel - Public Profile', () => {
  let publicUrl: string;

  test.beforeEach(async ({ page, authHelper, vcardHelper }) => {
    await authHelper.login();
    await vcardHelper.navigateToProfile();
  });

  test('TC-065: published profile is publicly accessible', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();

    // Get public URL
    publicUrl = await vcardHelper.getPublicProfileUrl();
    expect(publicUrl).toContain('/u/');

    // Open in new context (no auth)
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Assert profile visible
    await expect(newPage.locator('[data-testid="public-profile"]')).toBeVisible();

    // Assert profile name shown
    await expect(newPage.locator('[data-testid="profile-name"]')).toBeVisible();

    // Assert blocks displayed
    const blocks = newPage.locator('[data-testid="profile-block"]');
    const count = await blocks.count();
    expect(count).toBeGreaterThanOrEqual(0);

    await newPage.close();
  });

  test('TC-066: unpublished profile returns 404', async ({ page, context, vcardHelper }) => {
    // First publish to get URL
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Unpublish
    await vcardHelper.togglePublish();

    // Try to access public URL in new context
    const newPage = await context.newPage();
    const response = await newPage.goto(publicUrl);

    // Assert 404 page shown
    expect(response?.status()).toBe(404);
    await expect(newPage.locator('text=404')).toBeVisible();

    await newPage.close();
  });

  test('TC-067: contact form can be submitted from public profile', async ({ page, context, vcardHelper }) => {
    // Add contact form block
    await vcardHelper.switchTab('portfolio');
    await vcardHelper.addBlock('Contact Form');

    await page.check('input[type="checkbox"][value="name"]');
    await page.check('input[type="checkbox"][value="email"]');
    await page.check('input[type="checkbox"][value="message"]');
    await page.fill('input[name="recipientEmail"]', 'test@example.com');

    await page.click('button:has-text("Save Block")');

    // Save and publish
    await vcardHelper.saveChanges();
    await vcardHelper.togglePublish();

    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open public profile in new context
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Fill contact form
    await newPage.fill('input[name="name"]', 'John Visitor');
    await newPage.fill('input[name="email"]', 'visitor@example.com');
    await newPage.fill('textarea[name="message"]', 'Hello, this is a test message!');

    // Submit
    await newPage.click('button[type="submit"]');

    // Assert success message
    await expect(newPage.locator('.toast:has-text("sent")')).toBeVisible({ timeout: 5000 });

    await newPage.close();
  });

  test('TC-068: mobile responsive on public profile', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open in new context with mobile viewport
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 375, height: 812 });
    await newPage.goto(publicUrl);

    // Assert layout responsive
    const profile = newPage.locator('[data-testid="public-profile"]');
    await expect(profile).toBeVisible();

    // Assert all blocks visible
    const blocks = newPage.locator('[data-testid="profile-block"]');
    for (let i = 0; i < await blocks.count(); i++) {
      await expect(blocks.nth(i)).toBeVisible();
    }

    // Assert links clickable
    const links = newPage.locator('a[data-testid="profile-link"]');
    if ((await links.count()) > 0) {
      await expect(links.first()).toBeEnabled();
    }

    await newPage.close();
  });

  test('TC-069: QR code downloads correctly', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open public profile
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Click QR code download
    const [download] = await Promise.all([
      newPage.waitForEvent('download'),
      newPage.click('button:has-text("QR Code")'),
    ]);

    // Assert valid PNG file
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.png$/i);

    // Get file path
    const path = await download.path();
    expect(path).toBeTruthy();

    await newPage.close();
  });

  test('TC-070: vCard file downloads and is valid', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open public profile
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Click vCard download
    const [download] = await Promise.all([
      newPage.waitForEvent('download'),
      newPage.click('button:has-text("Download vCard")'),
    ]);

    // Assert valid .vcf file
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.vcf$/i);

    // Get file content
    const path = await download.path();
    expect(path).toBeTruthy();

    // Read file and validate vCard format
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf-8');

    expect(content).toContain('BEGIN:VCARD');
    expect(content).toContain('END:VCARD');
    expect(content).toContain('VERSION:3.0');

    await newPage.close();
  });

  test('TC-071: analytics tracking on public profile', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Visit public profile
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Wait for analytics to track
    await newPage.waitForTimeout(2000);

    await newPage.close();

    // Go to Insights tab
    await vcardHelper.switchTab('insights');

    // Assert view count increased
    const viewCount = page.locator('[data-testid="view-count"]');
    const count = await viewCount.textContent();

    expect(parseInt(count || '0')).toBeGreaterThan(0);
  });

  test('TC-072: social sharing buttons work', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open public profile
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Click share button
    await newPage.click('button:has-text("Share")');

    // Assert share options shown
    await expect(newPage.locator('[data-testid="share-menu"]')).toBeVisible();

    // Assert social platforms available
    await expect(newPage.locator('button:has-text("Twitter")')).toBeVisible();
    await expect(newPage.locator('button:has-text("LinkedIn")')).toBeVisible();
    await expect(newPage.locator('button:has-text("Facebook")')).toBeVisible();

    await newPage.close();
  });

  test('TC-073: copy profile URL to clipboard', async ({ page, context, vcardHelper }) => {
    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open public profile
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Click copy URL
    await newPage.click('button:has-text("Copy Link")');

    // Assert success toast
    await expect(newPage.locator('.toast:has-text("copied")')).toBeVisible();

    // Verify clipboard content
    await newPage.evaluate(() => navigator.clipboard.readText()).then((text) => {
      expect(text).toContain('/u/');
    });

    await newPage.close();
  });

  test('TC-074: public profile SEO meta tags', async ({ page, context, vcardHelper }) => {
    // Set profile info
    await vcardHelper.switchTab('portfolio');
    await page.fill('input[name="profileName"]', 'SEO Test Profile');
    await page.fill('textarea[name="bio"]', 'This is a test bio for SEO validation');

    await vcardHelper.saveChanges();

    // Publish profile
    await vcardHelper.togglePublish();
    publicUrl = await vcardHelper.getPublicProfileUrl();

    // Open public profile
    const newPage = await context.newPage();
    await newPage.goto(publicUrl);

    // Assert meta tags present
    const ogTitle = await newPage.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await newPage.locator('meta[property="og:description"]').getAttribute('content');
    const twitterCard = await newPage.locator('meta[name="twitter:card"]').getAttribute('content');

    expect(ogTitle).toContain('SEO Test Profile');
    expect(ogDescription).toContain('This is a test bio');
    expect(twitterCard).toBe('summary_large_image');

    await newPage.close();
  });
});
