/**
 * Unit tests for backend/routes/link-items.js
 *
 * Tests all 5 endpoints:
 *  GET    /me/links          - Fetch all link items for authenticated user
 *  POST   /me/links          - Create a new link item
 *  PUT    /me/links/:id      - Update an existing link item
 *  DELETE /me/links/:id      - Delete a link item
 *  POST   /me/links/reorder  - Bulk reorder link items
 *
 * Also tests:
 *  - Validation errors (invalid type, missing title, etc.)
 *  - Authorization (user can only access own resources)
 *  - Profile-not-found edge case
 */

const request = require('supertest');
const {
  createTestDb,
  createTestApp,
  seedUserAndProfile,
  seedLinkItem,
} = require('../../__tests__/testHelper.cjs');

// Mock database - must be called before requiring the router
jest.mock('../../config/database', () => {
  const placeholder = {
    ready: Promise.resolve(),
    prepare: jest.fn(),
    exec: jest.fn(),
    close: jest.fn(),
  };
  return placeholder;
});

// Mock auth middleware to inject req.user
// req._testUserId can be set by test-specific middleware to override user id
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req, _res, next) => {
    req.user = { id: req._testUserId || 1, username: 'testuser', role: 'user' };
    next();
  },
}));

const db = require('../../config/database');
const linkItemsRouter = require('../../routes/link-items');

let testDb;
let app;
let userId;
let profileId;

beforeEach(async () => {
  const { db: memDb } = await createTestDb();
  testDb = memDb;

  // Wire up the mocked database module to delegate to the in-memory db
  db.ready = testDb.ready;
  db.prepare = (sql) => testDb.prepare(sql);
  db.exec = (sql) => testDb.exec(sql);

  // Seed a user + profile
  const seeded = seedUserAndProfile(testDb);
  userId = seeded.userId;
  profileId = seeded.profileId;

  // Build express app
  app = createTestApp();
  app.use('/', linkItemsRouter);
});

/**
 * Helper to build an app where the authenticated user id is overridden
 * so the "profile not found" scenario can be tested.
 */
function appWithUserId(overrideUserId) {
  const ghostApp = createTestApp();
  ghostApp.use((req, _res, next) => {
    req._testUserId = overrideUserId;
    next();
  });
  ghostApp.use('/', linkItemsRouter);
  return ghostApp;
}

// ------------------------------------------------------------------
// GET /me/links
// ------------------------------------------------------------------

describe('GET /me/links', () => {
  test('returns empty array when user has no links', async () => {
    const res = await request(app).get('/me/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all links ordered by display_order', async () => {
    seedLinkItem(testDb, profileId, { title: 'Second', displayOrder: 2 });
    seedLinkItem(testDb, profileId, { title: 'First', displayOrder: 1 });

    const res = await request(app).get('/me/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('First');
    expect(res.body[1].title).toBe('Second');
  });

  test('includes galleryImages for GALLERY type links', async () => {
    const galleryLink = seedLinkItem(testDb, profileId, {
      type: 'GALLERY', title: 'My Gallery', url: 'https://example.com',
    });

    testDb.prepare(
      'INSERT INTO gallery_images (link_item_id, url, caption, display_order) VALUES (?, ?, ?, ?)'
    ).run(galleryLink.id, 'data:image/jpeg;base64,test', 'Photo 1', 1);

    const res = await request(app).get('/me/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].galleryImages).toBeDefined();
    expect(res.body[0].galleryImages).toHaveLength(1);
    expect(res.body[0].galleryImages[0].caption).toBe('Photo 1');
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999)).get('/me/links');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Profile not found');
  });
});

// ------------------------------------------------------------------
// POST /me/links
// ------------------------------------------------------------------

describe('POST /me/links', () => {
  test('creates a CLASSIC link item and returns 201', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'CLASSIC', title: 'My Website', url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('CLASSIC');
    expect(res.body.title).toBe('My Website');
    expect(res.body.url).toBe('https://example.com');
    expect(res.body.display_order).toBe(1);
  });

  test('auto-increments display_order', async () => {
    seedLinkItem(testDb, profileId, { displayOrder: 3 });

    const res = await request(app)
      .post('/me/links')
      .send({ type: 'CLASSIC', title: 'New Link', url: 'https://new.com' });

    expect(res.status).toBe(201);
    expect(res.body.display_order).toBe(4);
  });

  test('creates HEADER without url (url not required for HEADER)', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'HEADER', title: 'Section Header' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('HEADER');
  });

  test('creates GALLERY link with layout', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'GALLERY', title: 'Photos', url: 'https://photos.com', layout: 'grid' });

    expect(res.status).toBe(201);
    expect(res.body.layout).toBe('grid');
  });

  test('creates VIDEO_EMBED link', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'VIDEO_EMBED', title: 'My Video', url: 'https://youtube.com/watch?v=123' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('VIDEO_EMBED');
  });

  test('creates BOOKING link', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'BOOKING', title: 'Book Me', url: 'https://calendly.com/me' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('BOOKING');
  });

  // -- Validation errors --

  test('rejects invalid type with 400', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'INVALID', title: 'Bad Type', url: 'https://x.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid link type');
  });

  test('rejects missing type with 400', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ title: 'No Type', url: 'https://x.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid link type');
  });

  test('rejects missing title with 400', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'CLASSIC', url: 'https://x.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Title is required');
  });

  test('rejects title longer than 200 characters with 400', async () => {
    const longTitle = 'A'.repeat(201);
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'CLASSIC', title: longTitle, url: 'https://x.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Title is required');
  });

  test('rejects missing url for non-HEADER types with 400', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'CLASSIC', title: 'No URL' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('URL is required');
  });

  test('rejects invalid gallery layout with 400', async () => {
    const res = await request(app)
      .post('/me/links')
      .send({ type: 'GALLERY', title: 'Gallery', url: 'https://x.com', layout: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid layout');
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999))
      .post('/me/links')
      .send({ type: 'CLASSIC', title: 'Ghost Link', url: 'https://ghost.com' });

    expect(res.status).toBe(404);
  });
});

// ------------------------------------------------------------------
// PUT /me/links/:id
// ------------------------------------------------------------------

describe('PUT /me/links/:id', () => {
  let linkItem;

  beforeEach(() => {
    linkItem = seedLinkItem(testDb, profileId, { title: 'Original' });
  });

  test('updates title and returns updated link', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  test('updates multiple fields at once', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({
        title: 'New Title',
        url: 'https://new-url.com',
        isActive: false,
        platform: 'youtube',
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');
    expect(res.body.url).toBe('https://new-url.com');
    expect(res.body.is_active).toBe(0);
    expect(res.body.platform).toBe('youtube');
  });

  test('returns gallery images when updating a GALLERY link', async () => {
    const galleryLink = seedLinkItem(testDb, profileId, {
      type: 'GALLERY', title: 'Gallery', url: 'https://x.com', displayOrder: 2,
    });
    testDb.prepare(
      'INSERT INTO gallery_images (link_item_id, url, caption, display_order) VALUES (?, ?, ?, ?)'
    ).run(galleryLink.id, 'data:image/jpeg;base64,test', 'Img 1', 1);

    const res = await request(app)
      .put(`/me/links/${galleryLink.id}`)
      .send({ title: 'Updated Gallery' });

    expect(res.status).toBe(200);
    expect(res.body.galleryImages).toBeDefined();
    expect(res.body.galleryImages).toHaveLength(1);
  });

  test('updates schedule fields', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({ scheduleEnabled: true, scheduleStartTime: '2024-01-01', scheduleEndTime: '2024-12-31' });

    expect(res.status).toBe(200);
    expect(res.body.schedule_enabled).toBe(1);
  });

  // -- Validation errors --

  test('rejects invalid type with 400', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({ type: 'BADTYPE' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid link type');
  });

  test('rejects empty title with 400', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Title must be');
  });

  test('rejects title longer than 200 chars with 400', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({ title: 'X'.repeat(201) });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Title must be');
  });

  test('rejects invalid layout with 400', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({ layout: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid layout');
  });

  test('rejects request with no updatable fields with 400', async () => {
    const res = await request(app)
      .put(`/me/links/${linkItem.id}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('No fields to update');
  });

  // -- Authorization --

  test('returns 404 when link belongs to another user', async () => {
    const other = seedUserAndProfile(testDb, { userId: 2, username: 'otheruser' });
    const otherLink = seedLinkItem(testDb, other.profileId, { title: 'Other Link' });

    // Request as user 1 trying to update user 2's link
    const res = await request(app)
      .put(`/me/links/${otherLink.id}`)
      .send({ title: 'Hacked' });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Link item not found');
  });

  test('returns 404 for non-existent link id', async () => {
    const res = await request(app)
      .put('/me/links/99999')
      .send({ title: 'Missing' });

    expect(res.status).toBe(404);
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999))
      .put(`/me/links/${linkItem.id}`)
      .send({ title: 'Ghost Update' });

    expect(res.status).toBe(404);
  });
});

// ------------------------------------------------------------------
// DELETE /me/links/:id
// ------------------------------------------------------------------

describe('DELETE /me/links/:id', () => {
  let linkItem;

  beforeEach(() => {
    linkItem = seedLinkItem(testDb, profileId);
  });

  test('deletes a link item and returns success message', async () => {
    const res = await request(app).delete(`/me/links/${linkItem.id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted successfully');

    // Verify it is gone
    const row = testDb.prepare('SELECT * FROM link_items WHERE id = ?').get(linkItem.id);
    expect(row).toBeNull();
  });

  test('returns 404 when link belongs to another user', async () => {
    const other = seedUserAndProfile(testDb, { userId: 2, username: 'otheruser' });
    const otherLink = seedLinkItem(testDb, other.profileId, { title: 'Other Link' });

    const res = await request(app).delete(`/me/links/${otherLink.id}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Link item not found');
  });

  test('returns 404 for non-existent link id', async () => {
    const res = await request(app).delete('/me/links/99999');
    expect(res.status).toBe(404);
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999)).delete(`/me/links/${linkItem.id}`);
    expect(res.status).toBe(404);
  });
});

// ------------------------------------------------------------------
// POST /me/links/reorder
// ------------------------------------------------------------------

describe('POST /me/links/reorder', () => {
  let link1, link2, link3;

  beforeEach(() => {
    link1 = seedLinkItem(testDb, profileId, { title: 'A', displayOrder: 1 });
    link2 = seedLinkItem(testDb, profileId, { title: 'B', displayOrder: 2 });
    link3 = seedLinkItem(testDb, profileId, { title: 'C', displayOrder: 3 });
  });

  test('reorders links and returns updated list', async () => {
    const res = await request(app)
      .post('/me/links/reorder')
      .send([
        { id: link3.id, displayOrder: 1 },
        { id: link1.id, displayOrder: 2 },
        { id: link2.id, displayOrder: 3 },
      ]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].title).toBe('C');
    expect(res.body[1].title).toBe('A');
    expect(res.body[2].title).toBe('B');
  });

  test('rejects non-array body with 400', async () => {
    const res = await request(app)
      .post('/me/links/reorder')
      .send({ id: 1, displayOrder: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('array');
  });

  test('rejects items without id or displayOrder with 400', async () => {
    const res = await request(app)
      .post('/me/links/reorder')
      .send([{ id: link1.id }]); // missing displayOrder

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('id and displayOrder');
  });

  test('rejects items with non-numeric displayOrder with 400', async () => {
    const res = await request(app)
      .post('/me/links/reorder')
      .send([{ id: link1.id, displayOrder: 'first' }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('id and displayOrder');
  });

  test('returns 404 when a link id does not belong to user', async () => {
    const other = seedUserAndProfile(testDb, { userId: 2, username: 'otheruser' });
    const otherLink = seedLinkItem(testDb, other.profileId, { title: 'Other' });

    const res = await request(app)
      .post('/me/links/reorder')
      .send([{ id: otherLink.id, displayOrder: 1 }]);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  test('returns 404 when profile does not exist', async () => {
    const res = await request(appWithUserId(999))
      .post('/me/links/reorder')
      .send([{ id: link1.id, displayOrder: 1 }]);

    expect(res.status).toBe(404);
  });
});
