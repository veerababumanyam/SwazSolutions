/**
 * E2E Test Suite: vCard Panel - Block Management
 *
 * Tests block functionality including:
 * - Adding blocks of all 8 types
 * - Editing block configurations
 * - Deleting blocks with confirmation
 * - Drag-and-drop reordering
 * - Block visibility toggling
 * - Type-specific block features (Gallery, Contact Form, Custom Link, etc.)
 *
 * Coverage: 18+ test scenarios
 */

import { test, expect } from './helpers/test.fixtures';

test.describe('vCard Panel - Block Management', () => {
  test.beforeEach(async ({ page, authHelper, vcardHelper }) => {
    await authHelper.login();
    await vcardHelper.navigateToProfile();
  });

  const BLOCK_TYPES = ['Link', 'Header', 'Gallery', 'Video Embed', 'Contact Form', 'Map', 'File', 'Custom Link'];

  test('TC-018: adds Link block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Link');

    // Assert block appears in list
    await vcardHelper.assertBlockCount(1);

    // Assert correct editor opens
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[name="url"]')).toBeVisible();
    await expect(page.locator('input[name="title"]')).toBeVisible();
  });

  test('TC-019: adds Header block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Header');

    await vcardHelper.assertBlockCount(1);

    // Assert header editor with text and style options
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[name="headerText"]')).toBeVisible();
    await expect(page.locator('select[name="headerLevel"]')).toBeVisible();
  });

  test('TC-020: adds Gallery block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Gallery');

    await vcardHelper.assertBlockCount(1);

    // Assert gallery editor with upload option
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[type="file"][accept="image/*"]')).toBeVisible();
  });

  test('TC-021: adds Video Embed block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Video Embed');

    await vcardHelper.assertBlockCount(1);

    // Assert video URL input
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[name="videoUrl"]')).toBeVisible();
  });

  test('TC-022: adds Contact Form block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Contact Form');

    await vcardHelper.assertBlockCount(1);

    // Assert form configuration options
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('text=Form Fields')).toBeVisible();
  });

  test('TC-023: adds Map Location block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Map');

    await vcardHelper.assertBlockCount(1);

    // Assert map editor with location input
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[name="location"]')).toBeVisible();
  });

  test('TC-024: adds File Download block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('File');

    await vcardHelper.assertBlockCount(1);

    // Assert file upload option
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('TC-025: adds Custom Link block successfully', async ({ page, vcardHelper }) => {
    await vcardHelper.addBlock('Custom Link');

    await vcardHelper.assertBlockCount(1);

    // Assert custom link editor with logo upload
    await expect(page.locator('[data-testid="block-editor"]')).toBeVisible();
    await expect(page.locator('input[name="url"]')).toBeVisible();
    await expect(page.locator('input[type="file"][accept="image/*"]')).toBeVisible();
  });

  test('TC-026: edits Link block configuration', async ({ page, vcardHelper }) => {
    // Add a Link block
    await vcardHelper.addBlock('Link');

    // Fill in details
    await page.fill('input[name="title"]', 'My Portfolio');
    await page.fill('input[name="url"]', 'https://example.com');

    // Save block
    await page.click('button:has-text("Save Block")');

    // Edit block
    await vcardHelper.editBlock(0);

    // Change URL
    await page.fill('input[name="url"]', 'https://updated.example.com');
    await page.click('button:has-text("Save Block")');

    // Assert change persists
    await vcardHelper.saveChanges();
    await page.reload();
    await page.waitForLoadState('networkidle');

    await vcardHelper.editBlock(0);
    await expect(page.locator('input[name="url"]')).toHaveValue('https://updated.example.com');
  });

  test('TC-027: deletes block with confirmation', async ({ page, vcardHelper }) => {
    // Add a block
    await vcardHelper.addBlock('Link');
    await page.click('button:has-text("Save Block")');

    await vcardHelper.assertBlockCount(1);

    // Click Delete
    await vcardHelper.deleteBlock(0);

    // Assert block removed
    await vcardHelper.assertBlockCount(0);
  });

  test('TC-028: reorders blocks with drag-and-drop', async ({ page, vcardHelper }) => {
    // Add 3 blocks
    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'First Link');
    await page.click('button:has-text("Save Block")');

    await vcardHelper.addBlock('Header');
    await page.fill('input[name="headerText"]', 'Middle Header');
    await page.click('button:has-text("Save Block")');

    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'Last Link');
    await page.click('button:has-text("Save Block")');

    await vcardHelper.assertBlockCount(3);

    // Get initial order
    const initialOrder = await page.locator('[data-testid="block-item"]').allTextContents();

    // Drag middle block to top
    await vcardHelper.reorderBlock(1, 0);

    // Assert order changed
    const newOrder = await page.locator('[data-testid="block-item"]').allTextContents();
    expect(newOrder[0]).toContain('Middle Header');
    expect(newOrder).not.toEqual(initialOrder);

    // Save and reload
    await vcardHelper.saveChanges();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert order persisted
    const persistedOrder = await page.locator('[data-testid="block-item"]').allTextContents();
    expect(persistedOrder[0]).toContain('Middle Header');
  });

  test('TC-029: toggles block visibility', async ({ page, vcardHelper }) => {
    // Add a block
    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'Visible Link');
    await page.click('button:has-text("Save Block")');

    // Toggle visibility to hide
    await vcardHelper.toggleBlockVisibility(0);

    // Assert block hidden on preview
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview.locator('text=Visible Link')).not.toBeVisible();

    // Toggle again to show
    await vcardHelper.toggleBlockVisibility(0);

    // Assert block visible
    await expect(preview.locator('text=Visible Link')).toBeVisible();
  });

  test('TC-030: gallery block handles multiple images', async ({ page, vcardHelper }) => {
    // Add Gallery block
    await vcardHelper.addBlock('Gallery');

    // Upload multiple images (simulated with data URLs)
    const fileInput = page.locator('input[type="file"][accept="image/*"]');

    // Create test image files
    const images = [
      Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
      Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
    ];

    await fileInput.setInputFiles(
      images.map((img, i) => ({
        name: `test-image-${i}.png`,
        mimeType: 'image/png',
        buffer: img,
      }))
    );

    // Assert all images shown
    await expect(page.locator('[data-testid="gallery-image"]')).toHaveCount(2);

    // Delete one image
    await page.locator('[data-testid="gallery-image"]').first().locator('button[aria-label="Remove"]').click();

    // Assert changes reflected
    await expect(page.locator('[data-testid="gallery-image"]')).toHaveCount(1);
  });

  test('TC-031: contact form block configuration', async ({ page, vcardHelper }) => {
    // Add Contact Form block
    await vcardHelper.addBlock('Contact Form');

    // Select fields
    await page.check('input[type="checkbox"][value="name"]');
    await page.check('input[type="checkbox"][value="email"]');
    await page.check('input[type="checkbox"][value="message"]');

    // Set recipient email
    await page.fill('input[name="recipientEmail"]', 'contact@example.com');

    // Customize submit button text
    await page.fill('input[name="submitButtonText"]', 'Send Message');

    // Save block
    await page.click('button:has-text("Save Block")');

    // Assert form preview updated
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview.locator('button:has-text("Send Message")')).toBeVisible();
  });

  test('TC-032: custom link block with logo', async ({ page, vcardHelper }) => {
    // Add Custom Link block
    await vcardHelper.addBlock('Custom Link');

    // Set URL
    await page.fill('input[name="url"]', 'https://custom.example.com');

    // Upload logo image
    const logoInput = page.locator('input[type="file"][accept="image/*"]');
    const logoImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    await logoInput.setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: logoImage,
    });

    // Set size
    await page.selectOption('select[name="logoSize"]', 'medium');

    // Save block
    await page.click('button:has-text("Save Block")');

    // Assert logo preview updated
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview.locator('img[alt*="logo"]')).toBeVisible();
  });

  test('TC-033: video embed block validates URLs', async ({ page, vcardHelper }) => {
    // Add Video Embed block
    await vcardHelper.addBlock('Video Embed');

    // Try invalid URL
    await page.fill('input[name="videoUrl"]', 'not-a-valid-url');

    // Assert error shown
    await expect(page.locator('text=valid video URL')).toBeVisible();

    // Enter valid YouTube URL
    await page.fill('input[name="videoUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    // Assert no error
    await expect(page.locator('text=valid video URL')).not.toBeVisible();
  });

  test('TC-034: map block with coordinates', async ({ page, vcardHelper }) => {
    // Add Map block
    await vcardHelper.addBlock('Map');

    // Enter location
    await page.fill('input[name="location"]', 'Times Square, New York');

    // Or enter coordinates
    await page.fill('input[name="latitude"]', '40.758896');
    await page.fill('input[name="longitude"]', '-73.985130');

    // Save block
    await page.click('button:has-text("Save Block")');

    // Assert map preview shown
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview.locator('[data-testid="map-embed"]')).toBeVisible();
  });

  test('TC-035: file download block with metadata', async ({ page, vcardHelper }) => {
    // Add File block
    await vcardHelper.addBlock('File');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    const testFile = Buffer.from('Test file content', 'utf-8');

    await fileInput.setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: testFile,
    });

    // Set file description
    await page.fill('input[name="fileDescription"]', 'Download my resume');

    // Set file icon
    await page.selectOption('select[name="fileIcon"]', 'document');

    // Save block
    await page.click('button:has-text("Save Block")');

    // Assert file download shown in preview
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview.locator('text=Download my resume')).toBeVisible();
  });

  test('TC-036: header block with different levels', async ({ page, vcardHelper }) => {
    // Add Header block
    await vcardHelper.addBlock('Header');

    // Set header text
    await page.fill('input[name="headerText"]', 'Section Title');

    // Select H2
    await page.selectOption('select[name="headerLevel"]', 'h2');

    // Save block
    await page.click('button:has-text("Save Block")');

    // Assert preview shows H2
    const preview = page.locator('[data-testid="mobile-preview"]');
    await expect(preview.locator('h2:has-text("Section Title")')).toBeVisible();

    // Edit to H3
    await vcardHelper.editBlock(0);
    await page.selectOption('select[name="headerLevel"]', 'h3');
    await page.click('button:has-text("Save Block")');

    // Assert preview updates to H3
    await expect(preview.locator('h3:has-text("Section Title")')).toBeVisible();
  });

  test('TC-037: duplicate block functionality', async ({ page, vcardHelper }) => {
    // Add a Link block with data
    await vcardHelper.addBlock('Link');
    await page.fill('input[name="title"]', 'Original Link');
    await page.fill('input[name="url"]', 'https://original.com');
    await page.click('button:has-text("Save Block")');

    // Duplicate block
    await page.locator('[data-testid="block-item"]').first().locator('button[aria-label="Duplicate"]').click();

    // Assert 2 blocks exist
    await vcardHelper.assertBlockCount(2);

    // Assert duplicate has same data
    await vcardHelper.editBlock(1);
    await expect(page.locator('input[name="title"]')).toHaveValue('Original Link');
    await expect(page.locator('input[name="url"]')).toHaveValue('https://original.com');
  });

  test('TC-038: block validation prevents empty required fields', async ({ page, vcardHelper }) => {
    // Add Link block
    await vcardHelper.addBlock('Link');

    // Try to save without required fields
    await page.click('button:has-text("Save Block")');

    // Assert validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=URL is required')).toBeVisible();

    // Fill required fields
    await page.fill('input[name="title"]', 'Valid Link');
    await page.fill('input[name="url"]', 'https://valid.com');

    // Save should succeed
    await page.click('button:has-text("Save Block")');
    await expect(page.locator('[data-testid="block-editor"]')).not.toBeVisible();
  });
});
