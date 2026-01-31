# Template API - Quick Reference

Fast reference for developers implementing the vCard template system frontend.

## Base URL
```
http://localhost:3000/api/templates
```

## Authentication
- Add `Authorization: Bearer {JWT_TOKEN}` header for protected endpoints
- Public endpoints don't require authentication

---

## Endpoints Overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | No | List templates |
| GET | `/categories` | No | Category counts |
| GET | `/:id` | No | Get template |
| GET | `/:id/preview` | No | HTML preview |
| POST | `/:id/apply` | Yes | Apply template |
| POST | `/` | Yes | Create template |
| POST | `/:id/duplicate` | Yes | Duplicate template |
| PUT | `/:id` | Yes | Update template |
| DELETE | `/:id` | Yes | Delete template |
| GET | `/user/my-templates` | Yes | Get user's templates |

---

## GET /api/templates - List Templates

**Query Parameters:**
```javascript
category: 'Professional' | 'Creative' | 'Business' | 'Hospitality' | 'Technical'
tags: 'tag1,tag2,tag3' // comma-separated
search: 'photographer' // search name/description
limit: 1-100 (default: 20)
offset: 0+ (default: 0)
sortBy: 'popular' | 'newest' | 'oldest' | 'name' (default: 'popular')
```

**Example:**
```bash
curl "http://localhost:3000/api/templates?category=Professional&limit=10&offset=0"
```

**Response:**
```json
{
  "templates": [
    {
      "id": 1,
      "name": "Corporate Executive",
      "description": "Clean, modern design for executives...",
      "category": "Professional",
      "thumbnail": "/thumbnails/template-1-corporate-executive.svg",
      "is_system": 1,
      "tags": "corporate,executive,formal,professional,dark",
      "popularity": 42,
      "created_at": "2026-01-31T00:00:00Z"
    }
  ],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

---

## GET /api/templates/categories - Get Categories

**Example:**
```bash
curl "http://localhost:3000/api/templates/categories"
```

**Response:**
```json
{
  "categories": [
    { "category": "Professional", "count": 5 },
    { "category": "Creative", "count": 5 },
    { "category": "Business", "count": 2 },
    { "category": "Hospitality", "count": 2 },
    { "category": "Technical", "count": 1 }
  ]
}
```

---

## GET /api/templates/:id - Get Template

**Example:**
```bash
curl "http://localhost:3000/api/templates/1"
```

**Response:**
```json
{
  "id": 1,
  "name": "Corporate Executive",
  "description": "...",
  "category": "Professional",
  "thumbnail": "/thumbnails/...",
  "is_system": 1,
  "is_ai_generated": 0,
  "tags": "corporate,executive,formal",
  "popularity": 42,
  "created_by": null,
  "is_public": 0,
  "created_at": "2026-01-31T00:00:00Z",
  "updated_at": "2026-01-31T00:00:00Z",
  "theme_config": {
    "colors": {
      "primary": "#1F2937",
      "secondary": "#3B82F6",
      "background": "#FFFFFF",
      "text": "#111827",
      "blockBg": "#F3F4F6",
      "accent": "#DC2626"
    },
    "typography": {
      "fontFamily": "Georgia, serif",
      "headingSize": 36,
      "bodySize": 14,
      "weight": "bold"
    },
    "layout": {
      "style": "corporate",
      "spacing": "comfortable",
      "borderRadius": 4,
      "alignment": "center"
    },
    "avatar": "square-rounded",
    "headerBackground": "gradient-dark"
  },
  "blocks_config": [
    {
      "type": "TEXT",
      "title": "Professional Bio",
      "url": null,
      "displayOrder": 1
    },
    {
      "type": "LINK",
      "title": "LinkedIn Profile",
      "url": "https://linkedin.com",
      "displayOrder": 2
    }
  ],
  "social_profiles_config": [
    { "platform": "LinkedIn", "displayOrder": 1 },
    { "platform": "Twitter", "displayOrder": 2 },
    { "platform": "Email", "displayOrder": 3 }
  ]
}
```

---

## GET /api/templates/:id/preview - HTML Preview

**Example:**
```bash
curl "http://localhost:3000/api/templates/1/preview"
```

**Response:**
```
Content-Type: text/html
Status: 200

<html>
  <body>
    <div class="preview-container">
      <!-- SVG preview of template -->
    </div>
  </body>
</html>
```

**Use:** Embed in iframe for live preview
```html
<iframe src="http://localhost:3000/api/templates/1/preview" width="400" height="500"></iframe>
```

---

## POST /api/templates/:id/apply - Apply Template

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "profileId": 1,
  "mode": "replace" | "merge" | "theme-only"
}
```

**Modes:**
- `replace`: Delete blocks, apply template blocks + theme
- `merge`: Keep blocks, add new block types + theme
- `theme-only`: Keep blocks, apply theme only

**Example:**
```bash
curl -X POST "http://localhost:3000/api/templates/1/apply" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profileId": 1, "mode": "replace"}'
```

**Response:**
```json
{
  "success": true,
  "appliedTemplate": { /* full template object */ },
  "changes": {
    "appliedAt": "2026-01-31T12:00:00Z",
    "mode": "replace",
    "previousState": {
      "blocks": [ /* previous blocks */ ]
    },
    "newState": {
      "blocks": [ /* new blocks */ ],
      "theme": { /* theme object */ }
    }
  }
}
```

**Errors:**
```json
// 403 - Permission denied
{ "error": "Profile not found or you do not have permission" }

// 404 - Not found
{ "error": "Template not found" }

// 400 - Invalid mode
{ "error": "Invalid apply mode", "validModes": ["replace", "merge", "theme-only"] }
```

---

## POST /api/templates - Create Custom Template

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "profileId": 1,
  "name": "My Custom Template",
  "description": "A custom template I created from my profile",
  "category": "Professional",
  "tags": "custom,professional,business",
  "isPublic": false
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": 1,
    "name": "My Template",
    "category": "Professional"
  }'
```

**Response:** Full template object (Status: 201)
```json
{
  "id": 16,
  "name": "My Custom Template",
  "description": "...",
  "category": "Professional",
  "created_by": 1,
  "is_public": 0,
  ...
}
```

**Errors:**
```json
// 400 - Validation error
{ "error": "Required fields: profileId, name, category" }

// 400 - Invalid category
{ "error": "Invalid category. Must be one of: Professional, Creative, Business, Hospitality, Technical" }

// 404 - Profile not found
{ "error": "Profile not found or you do not have permission" }
```

**Valid Categories:**
- Professional
- Creative
- Business
- Hospitality
- Technical

---

## POST /api/templates/:id/duplicate - Duplicate Template

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body (Optional):**
```json
{
  "newName": "My Corporate Executive Copy"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/templates/1/duplicate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newName": "My Copy"}'
```

**Response:** New template object (Status: 201)
```json
{
  "id": 17,
  "name": "My Corporate Executive Copy",
  "description": "Clean, modern design...",
  "category": "Professional",
  "created_by": 1,
  "is_public": 0,
  ...
}
```

---

## PUT /api/templates/:id - Update Template

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body (Partial):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "category": "Creative",
  "tags": "updated,tags",
  "isPublic": true
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/templates/5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name", "isPublic": true}'
```

**Response:** Updated template object
```json
{
  "id": 5,
  "name": "New Name",
  "isPublic": 1,
  ...
}
```

**Note:** Cannot update `theme_config` or `blocks_config` directly (immutable)

---

## DELETE /api/templates/:id - Delete Template

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/templates/5" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Template deleted"
}
```

**Errors:**
```json
// 403 - Cannot delete system templates
{ "error": "Template not found, you do not have permission, or cannot delete system templates" }

// 404 - Not found
{ "error": "Template not found" }
```

---

## GET /api/templates/user/my-templates - Get User's Templates

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters:**
```javascript
limit: 1-100 (default: 20)
offset: 0+ (default: 0)
```

**Example:**
```bash
curl "http://localhost:3000/api/templates/user/my-templates?limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "templates": [
    {
      "id": 16,
      "name": "My Custom Template",
      "description": "...",
      "category": "Professional",
      "thumbnail": "/thumbnails/template-16-my-custom-template.svg",
      "is_public": 0,
      "popularity": 0,
      "created_at": "2026-01-31T12:00:00Z",
      "updated_at": "2026-01-31T12:00:00Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

---

## Error Responses

### Status 400 - Bad Request
```json
{
  "error": "Invalid input description",
  "details": "Expected field to be of type X"
}
```

### Status 403 - Forbidden
```json
{
  "error": "Permission denied or resource protected",
  "message": "You do not own this template"
}
```

### Status 404 - Not Found
```json
{
  "error": "Template not found"
}
```

### Status 500 - Server Error
```json
{
  "error": "Failed to apply template",
  "message": "Database error (development only)"
}
```

---

## Rate Limiting

All endpoints are rate limited to **100 requests/minute**.

**Headers in Response:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1706705400
```

**When Limit Exceeded:**
```
Status: 429 Too Many Requests
```

---

## JavaScript Examples

### List Templates
```javascript
const response = await fetch('/api/templates?category=Professional&limit=10');
const { templates, total } = await response.json();
```

### Get Template
```javascript
const template = await fetch(`/api/templates/${id}`)
  .then(r => r.json());
```

### Show Preview
```javascript
const preview = await fetch(`/api/templates/${id}/preview`)
  .then(r => r.text());
document.getElementById('preview').innerHTML = preview;
```

### Apply Template
```javascript
const result = await fetch(`/api/templates/${id}/apply`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profileId: 1,
    mode: 'replace'
  })
}).then(r => r.json());
```

### Create Template
```javascript
const newTemplate = await fetch('/api/templates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profileId: 1,
    name: 'My Template',
    category: 'Professional',
    isPublic: false
  })
}).then(r => r.json());
```

### Update Template
```javascript
const updated = await fetch(`/api/templates/${id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Name',
    isPublic: true
  })
}).then(r => r.json());
```

### Delete Template
```javascript
const result = await fetch(`/api/templates/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json());
```

---

## TypeScript Interfaces

```typescript
interface Template {
  id: number;
  name: string;
  description: string;
  category: 'Professional' | 'Creative' | 'Business' | 'Hospitality' | 'Technical';
  thumbnail: string;
  theme_config: ThemeConfig;
  blocks_config: TemplateBlock[];
  social_profiles_config: SocialProfile[];
  is_system: number;
  is_ai_generated: number;
  tags: string;
  popularity: number;
  created_by: number | null;
  is_public: number;
  created_at: string;
  updated_at: string;
}

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    blockBg?: string;
    accent?: string;
  };
  typography: {
    fontFamily: string;
    headingSize: number;
    bodySize: number;
    weight?: string;
  };
  layout: {
    style: string;
    spacing: string;
    borderRadius: number;
    alignment?: string;
  };
  avatar?: string;
  headerBackground?: string;
}

interface TemplateBlock {
  type: 'TEXT' | 'LINK' | 'CONTACT_FORM' | 'MAP_LOCATION';
  title: string;
  url?: string;
  displayOrder: number;
  metadata?: Record<string, any>;
}

interface SocialProfile {
  platform: string;
  displayOrder: number;
}

interface ApplyTemplateResponse {
  success: boolean;
  appliedTemplate: Template;
  changes: {
    appliedAt: string;
    mode: 'replace' | 'merge' | 'theme-only';
    previousState: Record<string, any>;
    newState: Record<string, any>;
  };
}
```

---

## Common Use Cases

### Display Template Browser
1. Fetch categories: `GET /categories`
2. List templates: `GET /?category={selected}`
3. Show in grid with thumbnails

### Apply Template Flow
1. Load template: `GET /:id`
2. Show preview: `GET /:id/preview` in iframe
3. Apply: `POST /:id/apply`
4. Show confirmation with changes

### Create Custom Template
1. Form with name, description, category
2. Submit: `POST /`
3. Redirect to template details

### Manage Templates
1. List user templates: `GET /user/my-templates`
2. Edit: `PUT /:id`
3. Delete: `DELETE /:id`

---

**Last Updated:** January 31, 2026
**Backend Version:** Phase 4 Complete
