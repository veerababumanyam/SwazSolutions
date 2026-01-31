import { Page, expect } from '@playwright/test';

export class VCardHelper {
  constructor(private page: Page) {}

  async navigateToProfile() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
    // Wait for VCardPanel to load
    await this.page.waitForSelector('[data-testid="vcard-panel"]', { timeout: 10000 });
  }

  async switchTab(tab: 'portfolio' | 'aesthetics' | 'insights') {
    await this.page.click(`button:has-text("${tab.charAt(0).toUpperCase() + tab.slice(1)}")`);
    await this.page.waitForTimeout(300); // Wait for tab animation
  }

  async saveChanges() {
    const saveButton = this.page.locator('button:has-text("Save")');
    await saveButton.click();
    // Wait for success toast
    await this.page.waitForSelector('.toast:has-text("saved")', { timeout: 5000 });
  }

  async togglePublish() {
    const publishToggle = this.page.locator('[data-testid="publish-toggle"]');
    await publishToggle.click();
    await this.page.waitForSelector('.toast', { timeout: 5000 });
  }

  async hasUnsavedChanges(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="unsaved-changes-indicator"]', { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async addBlock(type: string) {
    await this.page.click('button:has-text("Add Block")');
    await this.page.click(`button:has-text("${type}")`);
    await this.page.waitForSelector(`[data-block-type="${type.toLowerCase()}"]`, { timeout: 5000 });
  }

  async editBlock(index: number) {
    const blocks = this.page.locator('[data-testid="block-item"]');
    await blocks.nth(index).locator('button:has-text("Edit")').click();
    await this.page.waitForSelector('[data-testid="block-editor"]', { timeout: 3000 });
  }

  async deleteBlock(index: number) {
    const blocks = this.page.locator('[data-testid="block-item"]');
    await blocks.nth(index).locator('button[aria-label="Delete"]').click();
    // Confirm deletion
    await this.page.click('button:has-text("Confirm")');
    await this.page.waitForTimeout(300);
  }

  async reorderBlock(fromIndex: number, toIndex: number) {
    const blocks = this.page.locator('[data-testid="block-item"]');
    const sourceBlock = blocks.nth(fromIndex);
    const targetBlock = blocks.nth(toIndex);

    const sourceBbox = await sourceBlock.boundingBox();
    const targetBbox = await targetBlock.boundingBox();

    if (!sourceBbox || !targetBbox) {
      throw new Error('Cannot get block positions for drag and drop');
    }

    await this.page.mouse.move(sourceBbox.x + sourceBbox.width / 2, sourceBbox.y + sourceBbox.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(targetBbox.x + targetBbox.width / 2, targetBbox.y + targetBbox.height / 2, { steps: 10 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(500);
  }

  async toggleBlockVisibility(index: number) {
    const blocks = this.page.locator('[data-testid="block-item"]');
    await blocks.nth(index).locator('button[aria-label="Toggle visibility"]').click();
    await this.page.waitForTimeout(300);
  }

  async selectTemplate(templateName: string, mode: 'replace' | 'merge' | 'theme-only' = 'replace') {
    await this.page.click('button:has-text("Browse Templates")');
    await this.page.waitForSelector('[data-testid="template-gallery"]', { timeout: 3000 });

    // Find and click template
    await this.page.click(`[data-testid="template-card"]:has-text("${templateName}")`);
    await this.page.waitForSelector('[data-testid="template-preview-modal"]', { timeout: 3000 });

    // Select mode
    await this.page.click(`button:has-text("${mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}")`);

    // Apply template
    await this.page.click('button:has-text("Apply Template")');
    await this.page.waitForSelector('.toast:has-text("applied")', { timeout: 5000 });
  }

  async changeTheme(themeName: string) {
    await this.switchTab('aesthetics');
    await this.page.click(`[data-testid="theme-option"]:has-text("${themeName}")`);
    await this.page.waitForTimeout(500);
  }

  async customizeColor(colorType: 'button' | 'accent' | 'background', color: string) {
    await this.switchTab('aesthetics');
    const colorPicker = this.page.locator(`[data-testid="color-picker-${colorType}"]`);
    await colorPicker.click();
    await colorPicker.fill(color);
    await this.page.waitForTimeout(300);
  }

  async getPublicProfileUrl(): Promise<string> {
    const urlDisplay = this.page.locator('[data-testid="public-profile-url"]');
    return await urlDisplay.textContent() || '';
  }

  async assertPreviewUpdated(selector: string, expectedValue: string) {
    const previewElement = this.page.locator('[data-testid="mobile-preview"]').locator(selector);
    await expect(previewElement).toHaveText(expectedValue);
  }

  async assertBlockCount(expectedCount: number) {
    const blocks = this.page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(expectedCount);
  }
}
