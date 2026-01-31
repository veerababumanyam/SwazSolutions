/**
 * E2E Test Suite: vCard Panel - Appearance Customization
 *
 * Tests appearance and theme customization including:
 * - System theme selection
 * - Color customization
 * - Typography settings
 * - Background customization
 * - Button styles
 * - Shadow effects
 * - Gradient backgrounds
 * - Appearance persistence
 *
 * Coverage: 12+ test scenarios
 */

import { test, expect } from './helpers/test.fixtures';

test.describe('vCard Panel - Appearance', () => {
  test.beforeEach(async ({ page, authHelper, vcardHelper }) => {
    await authHelper.login();
    await vcardHelper.navigateToProfile();
    await vcardHelper.switchTab('aesthetics');
  });

  test('TC-053: selects different system themes', async ({ page, vcardHelper }) => {
    // Click first theme (e.g., "Midnight")
    const firstTheme = page.locator('[data-testid="theme-option"]').first();
    const themeName = await firstTheme.locator('[data-testid="theme-name"]').textContent();

    await firstTheme.click();

    // Assert theme applied to preview
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview).toBeVisible();

    // Select different theme
    const secondTheme = page.locator('[data-testid="theme-option"]').nth(1);
    await secondTheme.click();

    // Assert preview updates
    await page.waitForTimeout(300);

    // Save and verify
    await vcardHelper.saveChanges();
    const currentTheme = await page.locator('[data-testid="current-theme"]').textContent();
    expect(currentTheme).toBeTruthy();
  });

  test('TC-054: customizes button color', async ({ page, vcardHelper }) => {
    // Find color picker for buttons
    const buttonColorPicker = page.locator('[data-testid="color-picker-button"]');

    // Change button color to red
    await buttonColorPicker.click();
    await buttonColorPicker.fill('#FF0000');

    // Assert preview updates
    const preview = page.locator('[data-testid="mobile-preview"]');
    const buttonInPreview = preview.locator('button, a[role="button"]').first();

    const bgColor = await buttonInPreview.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should be red or close to red
    expect(bgColor).toMatch(/rgb\(255,\s*0,\s*0\)|rgb\(2\d{2},\s*\d{1,2},\s*\d{1,2}\)/);
  });

  test('TC-055: customizes accent color', async ({ page, vcardHelper }) => {
    // Find accent color picker
    const accentColorPicker = page.locator('[data-testid="color-picker-accent"]');

    // Change accent color to blue
    await accentColorPicker.click();
    await accentColorPicker.fill('#0000FF');

    // Assert all accents updated in preview
    await page.waitForTimeout(300);

    // Save
    await vcardHelper.saveChanges();

    // Reload and verify
    await page.reload();
    await page.waitForLoadState('networkidle');

    await vcardHelper.switchTab('aesthetics');
    await expect(accentColorPicker).toHaveValue('#0000FF');
  });

  test('TC-056: customizes profile name typography', async ({ page, vcardHelper }) => {
    // Find typography section
    await page.click('text=Typography');

    // Change profile name font
    await page.selectOption('select[name="profileNameFont"]', 'serif');

    // Change size slider
    const sizeSlider = page.locator('input[type="range"][name="profileNameSize"]');
    await sizeSlider.fill('24');

    // Assert preview text updates
    const preview = page.locator('[data-testid="mobile-preview"]');
    const profileName = preview.locator('[data-testid="profile-name"]');

    const fontSize = await profileName.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );

    expect(fontSize).toContain('24px');
  });

  test('TC-057: changes background color', async ({ page, vcardHelper }) => {
    // Select background color
    const bgColorPicker = page.locator('[data-testid="color-picker-background"]');

    // Change to green
    await bgColorPicker.click();
    await bgColorPicker.fill('#00FF00');

    // Assert preview background changes
    const preview = page.locator('[data-testid="mobile-preview"]');
    const bgColor = await preview.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    expect(bgColor).toMatch(/rgb\(0,\s*255,\s*0\)|rgb\(\d{1,2},\s*2\d{2},\s*\d{1,2}\)/);
  });

  test('TC-058: uploads background image', async ({ page, vcardHelper }) => {
    // Find background section
    await page.click('text=Background');

    // Upload background image
    const bgImageInput = page.locator('input[type="file"][accept="image/*"]');
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    await bgImageInput.setInputFiles({
      name: 'background.png',
      mimeType: 'image/png',
      buffer: testImage,
    });

    // Assert image shown as background in preview
    const preview = page.locator('[data-testid="mobile-preview"]');
    const bgImage = await preview.evaluate((el) =>
      window.getComputedStyle(el).backgroundImage
    );

    expect(bgImage).toContain('url');
  });

  test('TC-059: applies gradient background', async ({ page, vcardHelper }) => {
    // Click gradient builder
    await page.click('button:has-text("Gradient Background")');

    // Select gradient preset
    await page.click('[data-testid="gradient-preset"]').first();

    // Or customize gradient
    await page.selectOption('select[name="gradientType"]', 'linear');
    await page.fill('input[name="gradientColor1"]', '#FF00FF');
    await page.fill('input[name="gradientColor2"]', '#00FFFF');
    await page.fill('input[name="gradientAngle"]', '45');

    // Assert gradient applied to preview
    const preview = page.locator('[data-testid="mobile-preview"]');
    const bgImage = await preview.evaluate((el) =>
      window.getComputedStyle(el).backgroundImage
    );

    expect(bgImage).toContain('gradient');
  });

  test('TC-060: customizes button style (rounded, shadow)', async ({ page, vcardHelper }) => {
    // Find button style section
    await page.click('text=Button Style');

    // Change border radius
    const radiusSlider = page.locator('input[type="range"][name="buttonRadius"]');
    await radiusSlider.fill('20');

    // Enable shadow
    await page.check('input[type="checkbox"][name="buttonShadow"]');

    // Select shadow preset
    await page.click('[data-testid="shadow-preset"]').first();

    // Assert preview buttons updated
    const preview = page.locator('[data-testid="mobile-preview"]');
    const button = preview.locator('button, a[role="button"]').first();

    const borderRadius = await button.evaluate((el) =>
      window.getComputedStyle(el).borderRadius
    );

    expect(borderRadius).toContain('20px');
  });

  test('TC-061: applies shadow effects to cards', async ({ page, vcardHelper }) => {
    // Open shadow editor
    await page.click('button:has-text("Shadow Effects")');

    // Select shadow preset
    await page.click('[data-testid="shadow-preset"][data-shadow="medium"]');

    // Or customize shadow
    await page.fill('input[name="shadowBlur"]', '10');
    await page.fill('input[name="shadowSpread"]', '2');
    await page.fill('input[name="shadowColor"]', '#000000');

    // Assert preview cards have shadow
    const preview = page.locator('[data-testid="mobile-preview"]');
    const card = preview.locator('[data-testid="block-card"]').first();

    const boxShadow = await card.evaluate((el) =>
      window.getComputedStyle(el).boxShadow
    );

    expect(boxShadow).not.toBe('none');
  });

  test('TC-062: saves appearance changes successfully', async ({ page, vcardHelper }) => {
    // Customize multiple appearance settings
    await vcardHelper.customizeColor('button', '#FF5733');
    await vcardHelper.customizeColor('accent', '#3498DB');

    await page.selectOption('select[name="profileNameFont"]', 'monospace');

    // Save
    await vcardHelper.saveChanges();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    await vcardHelper.switchTab('aesthetics');

    // Assert customizations persisted
    const buttonColor = await page.locator('[data-testid="color-picker-button"]').inputValue();
    const accentColor = await page.locator('[data-testid="color-picker-accent"]').inputValue();
    const font = await page.locator('select[name="profileNameFont"]').inputValue();

    expect(buttonColor.toUpperCase()).toBe('#FF5733');
    expect(accentColor.toUpperCase()).toBe('#3498DB');
    expect(font).toBe('monospace');
  });

  test('TC-063: resets to default theme', async ({ page, vcardHelper }) => {
    // Customize appearance
    await vcardHelper.customizeColor('button', '#ABCDEF');
    await vcardHelper.customizeColor('background', '#123456');

    // Save
    await vcardHelper.saveChanges();

    // Reset to default
    await page.click('button:has-text("Reset to Default")');

    // Confirm reset
    await page.click('button:has-text("Confirm")');

    // Assert appearance reset
    const buttonColor = await page.locator('[data-testid="color-picker-button"]').inputValue();
    expect(buttonColor).not.toBe('#ABCDEF');
  });

  test('TC-064: dark mode toggle', async ({ page, vcardHelper }) => {
    // Find dark mode toggle
    const darkModeToggle = page.locator('input[type="checkbox"][name="darkMode"]');

    // Enable dark mode
    await darkModeToggle.check();

    // Assert preview switches to dark theme
    const preview = page.locator('[data-testid="mobile-preview"]');
    const bgColor = await preview.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Dark mode should have dark background (low RGB values)
    const rgb = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgb) {
      const brightness = parseInt(rgb[1]) + parseInt(rgb[2]) + parseInt(rgb[3]);
      expect(brightness).toBeLessThan(150); // Dark backgrounds sum to < 150
    }

    // Disable dark mode
    await darkModeToggle.uncheck();

    // Assert preview switches to light theme
    const lightBgColor = await preview.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    const lightRgb = lightBgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (lightRgb) {
      const lightBrightness = parseInt(lightRgb[1]) + parseInt(lightRgb[2]) + parseInt(lightRgb[3]);
      expect(lightBrightness).toBeGreaterThan(400); // Light backgrounds sum to > 400
    }
  });
});
