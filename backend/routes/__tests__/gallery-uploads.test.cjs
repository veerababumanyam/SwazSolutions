/**
 * Unit tests for backend/routes/gallery-uploads.js
 *
 * Tests:
 *  POST   /me/galleries/:linkId/images         - Upload image to gallery
 *  DELETE /me/galleries/:linkId/images/:imageId - Delete gallery image
 *  POST   /me/galleries/:linkId/images/reorder  - Reorder gallery images
 *
 * Also tests:
 *  - Validation: file type, gallery limit (max 20), non-gallery link rejection
 *  - Authorization: link must belong to user's profile
 *  - Image processing through sharp (mocked)
 *  - Delete reorders remaining images
 */

const request = require('supertest');
const {
  createTestDb,
  createTestApp,
  seedUserAndProfile,
  seedLinkItem,
  seedGalleryImage,
} = require('../../__tests__/testHelper.cjs');

// Mock database
jest.mock('../../config/database', () => {
  const placeholder = {
    ready: Promise.resolve(),
    prepare: jest.fn(),
    exec: jest.fn(),
    close: jest.fn(),
  };
  return placeholder;
});

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req, _res, next) => {
    req.user = { id: req._testUserId || 1, username: 'testuser', role: 'user' };
    next();
  },
}));

// Mock sharp to avoid native binary dependency in CI
// Sharp returns a chainable API, so each method must return 'this'.
// We must create the object first, then set up chaining to avoid TDZ errors.
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => {
    const api = {
      resize: jest.fn(),
      jpeg: jest.fn(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-optimized-image-data')),
    };
    api.resize.mockReturnValue(api);
    api.jpeg.mockReturnValue(api);
    return api;
  });
  return mockSharp;
});

const db = require('../../config/database');
const galleryUploadsRouter = require('../../routes/gallery-uploads');

let testDb;
let app;
let userId;
let profileId;
let galleryLink;

beforeEach(async () => {
  const { db: memDb } = await createTestDb();
  testDb = memDb;

  db.ready = testDb.ready;
  db.prepare = (sql) => testDb.prepare(sql);
  db.exec = (sql) => testDb.exec(sql);

  const seeded = seedUserAndProfile(testDb);
  userId = seeded.userId;
  profileId = seeded.profileId;

  // Create a GALLERY type link for upload tests
  galleryLink = seedLinkItem(testDb, profileId, {
    type: 'GALLERY',
    title: 'Test Gallery',
    url: 'https://example.com',
  });

  app = createTestApp();
  app.use('/', galleryUploadsRouter);
});

/**
 * Helper to build an app with overridden user id
 */
function appWithUserId(overrideUserId) {
  const ghostApp = createTestApp();
  ghostApp.use((req, _res, next) => {
    req._testUserId = overrideUserId;
    next();
  });
  ghostApp.use('/', galleryUploadsRouter);
  return ghostApp;
}

// ------------------------------------------------------------------
// Helper: create a fake image buffer for upload
// ------------------------------------------------------------------

function createFakeImageBuffer(sizeBytes = 100) {
  return Buffer.alloc(sizeBytes, 0xff);
}

// ------------------------------------------------------------------
// POST /me/galleries/:linkId/images
// ------------------------------------------------------------------

describe('POST /me/galleries/:linkId/images', () => {
  test('uploads an image and returns 201 with created image data', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      })
      .field('caption', 'Test photo');

    if (res.status !== 201) {
      console.log('Upload failed with status:', res.status);
      console.log('Error body:', res.body);
    }
    expect(res.status).toBe(201);
    // link_item_id comes from req.params.linkId which is a string
    expect(Number(res.body.link_item_id)).toBe(galleryLink.id);
    expect(res.body.caption).toBe('Test photo');
    expect(res.body.display_order).toBe(1);
    expect(res.body.url).toContain('data:image/jpeg;base64,');
  });

  test('auto-increments display_order for new images', async () => {
    // Seed two existing images
    seedGalleryImage(testDb, galleryLink.id, { displayOrder: 1 });
    seedGalleryImage(testDb, galleryLink.id, { displayOrder: 2 });

    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test3.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.display_order).toBe(3);
  });

  test('returns 400 when no image file is provided', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('No image file');
  });

  test('returns 404 when link item does not exist', async () => {
    const res = await request(app)
      .post('/me/galleries/99999/images')
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Link item not found');
  });

  test('returns 400 when link item is not a GALLERY type', async () => {
    const classicLink = seedLinkItem(testDb, profileId, {
      type: 'CLASSIC',
      title: 'Classic',
      url: 'https://example.com',
      displayOrder: 2,
    });

    const res = await request(app)
      .post(`/me/galleries/${classicLink.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('not a gallery type');
  });

  test('returns 400 when gallery already has 20 images (max limit)', async () => {
    // Seed 20 images
    for (let i = 1; i <= 20; i++) {
      seedGalleryImage(testDb, galleryLink.id, { displayOrder: i });
    }

    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test21.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Maximum 20 images');
  });

  test('returns 404 when link belongs to another user', async () => {
    const other = seedUserAndProfile(testDb, { userId: 2, username: 'otheruser' });
    const otherGallery = seedLinkItem(testDb, other.profileId, {
      type: 'GALLERY',
      title: 'Other Gallery',
      url: 'https://example.com',
    });

    const res = await request(app)
      .post(`/me/galleries/${otherGallery.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Link item not found');
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999))
      .post(`/me/galleries/${galleryLink.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Profile not found');
  });

  test('rejects non-image file types via multer filter', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images`)
      .attach('image', Buffer.from('not an image'), {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });

    // multer file filter throws an error for non-image types
    expect(res.status).toBe(500);
  });

  test('handles sharp processing failure with 400', async () => {
    // Override sharp mock to throw
    const sharp = require('sharp');
    sharp.mockImplementationOnce(() => ({
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockRejectedValue(new Error('Invalid image')),
    }));

    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images`)
      .attach('image', createFakeImageBuffer(1024), {
        filename: 'corrupt.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Failed to process image');
  });
});

// ------------------------------------------------------------------
// DELETE /me/galleries/:linkId/images/:imageId
// ------------------------------------------------------------------

describe('DELETE /me/galleries/:linkId/images/:imageId', () => {
  let image1, image2, image3;

  beforeEach(() => {
    image1 = seedGalleryImage(testDb, galleryLink.id, { displayOrder: 1, caption: 'First' });
    image2 = seedGalleryImage(testDb, galleryLink.id, { displayOrder: 2, caption: 'Second' });
    image3 = seedGalleryImage(testDb, galleryLink.id, { displayOrder: 3, caption: 'Third' });
  });

  test('deletes an image and returns success message', async () => {
    const res = await request(app)
      .delete(`/me/galleries/${galleryLink.id}/images/${image1.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted successfully');

    // Verify image is gone
    const row = testDb.prepare('SELECT * FROM gallery_images WHERE id = ?').get(image1.id);
    expect(row).toBeNull();
  });

  test('reorders remaining images after deletion (fills gap)', async () => {
    await request(app)
      .delete(`/me/galleries/${galleryLink.id}/images/${image2.id}`);

    // image3 had display_order 3, should now be 2
    const remaining = testDb.prepare(
      'SELECT * FROM gallery_images WHERE link_item_id = ? ORDER BY display_order ASC'
    ).all(galleryLink.id);

    expect(remaining).toHaveLength(2);
    expect(remaining[0].display_order).toBe(1);
    expect(remaining[1].display_order).toBe(2);
  });

  test('returns 404 when image does not exist', async () => {
    const res = await request(app)
      .delete(`/me/galleries/${galleryLink.id}/images/99999`);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Gallery image not found');
  });

  test('returns 404 when link does not belong to user', async () => {
    const other = seedUserAndProfile(testDb, { userId: 2, username: 'otheruser' });
    const otherGallery = seedLinkItem(testDb, other.profileId, {
      type: 'GALLERY',
      title: 'Other',
      url: 'https://x.com',
    });
    const otherImage = seedGalleryImage(testDb, otherGallery.id, { displayOrder: 1 });

    const res = await request(app)
      .delete(`/me/galleries/${otherGallery.id}/images/${otherImage.id}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Link item not found');
  });

  test('returns 404 when link item does not exist', async () => {
    const res = await request(app)
      .delete(`/me/galleries/99999/images/${image1.id}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999))
      .delete(`/me/galleries/${galleryLink.id}/images/${image1.id}`);

    expect(res.status).toBe(404);
  });
});

// ------------------------------------------------------------------
// POST /me/galleries/:linkId/images/reorder
// ------------------------------------------------------------------

describe('POST /me/galleries/:linkId/images/reorder', () => {
  let image1, image2, image3;

  beforeEach(() => {
    image1 = seedGalleryImage(testDb, galleryLink.id, { displayOrder: 1 });
    image2 = seedGalleryImage(testDb, galleryLink.id, { displayOrder: 2 });
    image3 = seedGalleryImage(testDb, galleryLink.id, { displayOrder: 3 });
  });

  test('reorders images and returns updated list', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images/reorder`)
      .send([
        { id: image3.id, displayOrder: 1 },
        { id: image1.id, displayOrder: 2 },
        { id: image2.id, displayOrder: 3 },
      ]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    // Verify order: image3 first, then image1, then image2
    expect(res.body[0].id).toBe(image3.id);
    expect(res.body[1].id).toBe(image1.id);
    expect(res.body[2].id).toBe(image2.id);
  });

  test('rejects non-array body with 400', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images/reorder`)
      .send({ id: 1, displayOrder: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('array');
  });

  test('rejects items missing id or displayOrder with 400', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images/reorder`)
      .send([{ id: image1.id }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('id and displayOrder');
  });

  test('rejects items with non-numeric displayOrder with 400', async () => {
    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images/reorder`)
      .send([{ id: image1.id, displayOrder: 'first' }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('id and displayOrder');
  });

  test('returns 404 when an image id does not belong to this gallery', async () => {
    // Create another gallery with its own image
    const otherGallery = seedLinkItem(testDb, profileId, {
      type: 'GALLERY',
      title: 'Other Gallery',
      url: 'https://x.com',
      displayOrder: 2,
    });
    const otherImage = seedGalleryImage(testDb, otherGallery.id, { displayOrder: 1 });

    const res = await request(app)
      .post(`/me/galleries/${galleryLink.id}/images/reorder`)
      .send([{ id: otherImage.id, displayOrder: 1 }]);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  test('returns 404 when link does not belong to user', async () => {
    const other = seedUserAndProfile(testDb, { userId: 2, username: 'otheruser' });
    const otherGallery = seedLinkItem(testDb, other.profileId, {
      type: 'GALLERY',
      title: 'Other',
      url: 'https://x.com',
    });

    const res = await request(app)
      .post(`/me/galleries/${otherGallery.id}/images/reorder`)
      .send([{ id: image1.id, displayOrder: 1 }]);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Link item not found');
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999))
      .post(`/me/galleries/${galleryLink.id}/images/reorder`)
      .send([{ id: image1.id, displayOrder: 1 }]);

    expect(res.status).toBe(404);
  });
});
