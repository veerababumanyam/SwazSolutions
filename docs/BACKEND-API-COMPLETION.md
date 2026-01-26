# Backend API Completion - Modern vCard Suite

## Summary

All remaining backend API routes for the Modern vCard Suite have been successfully implemented. This document provides an overview of the completed tasks.

---

## ✅ Task 1.2.4: AI Bio Generation Route

**File:** `backend/routes/ai-bio.js`

**Endpoint:** `POST /api/profiles/me/bio/generate`

**Features:**
- Generates 3 distinct personalized bios using Google Gemini 2.0 Flash Experimental model
- 5 personality vibes: `professional`, `minimalist`, `witty`, `mystical`, `energetic`
- Each bio is 120-150 characters (optimized for digital profiles)
- Rate limited to 5 requests per user per day
- Uses user ID for per-user rate limiting
- Integrates with `@google/generative-ai` package

**Request Body:**
```json
{
  "vibe": "professional",
  "name": "John Doe",
  "profession": "Full Stack Developer",
  "interests": "open source, coffee"
}
```

**Response Format:**
```json
{
  "bios": [
    "Turning coffee into code since 2015. Full-stack wizard who loves clean architecture.",
    "Senior dev crafting digital experiences. Coffee addict. Architecture enthusiast.",
    "Code craftsman with a passion for elegant solutions. Fueled by espresso and curiosity."
  ],
  "vibe": "professional",
  "count": 3
}
```

**Rate Limiting:**
- 5 generations per user per day
- 429 status code with `retryAfter` header when exceeded

---

## ✅ Task 1.2.5: Updated profiles.js Route

**File:** `backend/routes/profiles.js`

**Endpoints Updated:**
- `GET /api/profiles/me` - Now returns `profession`, `seo`, and `linkItems[]`
- `PUT /api/profiles/me` - Now accepts `profession` and `seo` fields

**New Response Fields:**

### Profession Field
```json
{
  "profile": {
    "profession": "Full Stack Developer"
  }
}
```

### SEO Fields
```json
{
  "profile": {
    "seo": {
      "title": "John Doe - Full Stack Developer",
      "description": "Experienced full-stack developer specializing in React and Node.js",
      "keywords": "developer, react, nodejs, javascript"
    }
  }
}
```

### Link Items with Gallery Images
```json
{
  "linkItems": [
    {
      "id": 1,
      "type": "GALLERY",
      "title": "My Portfolio",
      "galleryImages": [
        {
          "id": 1,
          "image_url": "/uploads/gallery/image1.jpg",
          "display_order": 0
        }
      ]
    }
  ]
}
```

**PUT Request Example:**
```json
{
  "profession": "Senior Backend Architect",
  "seo": {
    "title": "Custom SEO Title",
    "description": "Custom meta description",
    "keywords": "architecture, backend, api"
  }
}
```

---

## ✅ Task 1.2.6: Updated publicProfiles.js Route

**File:** `backend/routes/publicProfiles.js`

**Endpoint Updated:** `GET /api/public/profile/:username`

**Changes:**
- Added `linkItems[]` to response (includes `galleryImages` for GALLERY type)
- Kept `customLinks[]` for backward compatibility
- Returns theme customization data

**Response Structure:**
```json
{
  "id": 123,
  "profile": { /* profile data */ },
  "socialProfiles": [ /* social links */ ],
  "customLinks": [ /* legacy custom links */ ],
  "linkItems": [
    {
      "id": 1,
      "type": "GALLERY",
      "title": "Photo Gallery",
      "galleryImages": [
        {
          "id": 1,
          "image_url": "/uploads/gallery/photo1.jpg",
          "display_order": 0
        }
      ]
    }
  ],
  "appearance": { /* appearance settings */ },
  "theme": { /* active theme */ }
}
```

---

## ✅ Task 1.2.7: Upgraded vCardGenerator.js to vCard 4.0

**File:** `backend/services/vCardGenerator.js`

**Changes:**
1. **Version Upgrade:** `VERSION:3.0` → `VERSION:4.0`
2. **Field Format Updates:**
   - Email types: `TYPE=HOME/WORK` → `TYPE=home/work` (lowercase)
   - Phone format: Now uses `VALUE=uri:tel:` format
   - Phone types: `TYPE=CELL` → `TYPE="cell,voice"`
   - Address types: `TYPE=HOME/WORK` → `TYPE=home/work`
3. **Profession Field:** Uses `profession` field for `TITLE` if available, falls back to `headline`
4. **Social Links:** Added `X-SOCIALPROFILE` fields for social media links
5. **REV Field:** Now uses ISO 8601 timestamp format (`YYYY-MM-DDTHH:MM:SS.sssZ`)

**vCard 4.0 Example Output:**
```
BEGIN:VCARD
VERSION:4.0
FN:John Doe
N:Doe;John;;;
ORG:Acme Corp
TITLE:Senior Backend Architect
EMAIL;TYPE=home:john@example.com
EMAIL;TYPE=work:john@acme.com
TEL;TYPE="cell,voice";VALUE=uri:tel:+1234567890
ADR;TYPE=home:;;123 Main St;New York;NY;10001;USA
URL:https://example.com/u/johndoe
X-SOCIALPROFILE;TYPE=LinkedIn:https://linkedin.com/in/johndoe
X-SOCIALPROFILE;TYPE=GitHub:https://github.com/johndoe
REV:2026-01-26T12:34:56.789Z
END:VCARD
```

**Function Signature Update:**
```javascript
// Old (vCard 3.0)
function generateVCard(profile)

// New (vCard 4.0)
function generateVCard(profile, socialLinks = [])
```

---

## ✅ Task 1.2.8: Added Rate Limiting to vCard Endpoint

**File:** `backend/routes/vcards.js`

**Rate Limiter Configuration:**
- **Limit:** 100 requests per IP per hour
- **Key:** SHA-256 hashed IP address (privacy protection)
- **Window:** 1 hour (3600000ms)
- **Response:** 429 status with `retryAfter` header

**Rate Limiter Implementation:**
```javascript
const vCardDownloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 downloads per hour per IP
  keyGenerator: (req) => {
    // Hash IP for privacy (SHA-256)
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return crypto.createHash('sha256').update(ip).digest('hex');
  }
});
```

**Applied to Endpoint:**
```javascript
router.get('/:username/vcard', vCardDownloadLimiter, (req, res) => {
  // ... vCard generation logic
});
```

**429 Response Format:**
```json
{
  "error": "Too many vCard download requests",
  "message": "You have exceeded the vCard download limit. Please try again in an hour.",
  "limit": 100,
  "windowHours": 1,
  "retryAfter": "3600"
}
```

**Additional Changes:**
- Now fetches and passes social links to vCard generator
- Updated comments to reflect vCard 4.0 format

---

## 🔧 Server Registration

**File:** `backend/server.js`

**Added Route Registration:**
```javascript
const aiBioRouter = require('./routes/ai-bio'); // AI bio generation

// Register with authentication and subscription check
app.use('/api/profiles', withAuth, checkSubscription, aiBioRouter);
```

**Full Route Path:**
- `POST /api/profiles/me/bio/generate` (AI bio generation)

**Middleware Stack:**
1. `withAuth` - JWT authentication (conditional based on `ENABLE_AUTH`)
2. `checkSubscription` - Subscription status check
3. `aiBioLimiter` - Per-user rate limiting (5/day)

---

## 📊 Database Schema Requirements

All routes use existing database schema from migrations:

### Required Tables:
- ✅ `profiles` - Extended with `profession`, `seo_title`, `seo_description`, `seo_keywords`
- ✅ `link_items` - Modern vCard link items
- ✅ `gallery_images` - Gallery images for GALLERY type link items
- ✅ `social_profiles` - Social media links for X-SOCIALPROFILE fields
- ✅ `vcard_downloads` - Download tracking

**Migrations Applied:**
- `001-add-link-items.sql`
- `002-add-gallery-images.sql`
- `003-extend-profiles.sql`

---

## 🧪 Testing Checklist

### AI Bio Generation (`/api/profiles/me/bio/generate`)
- [ ] Generate bio with each vibe: professional, minimalist, witty, mystical, energetic
- [ ] Verify 3 bios returned (120-150 characters each)
- [ ] Test rate limiting (6th request in 24 hours should fail with 429)
- [ ] Test with missing API key (should return 500)
- [ ] Test with invalid vibe (should return 400)

### Profiles Route (`/api/profiles/me`)
- [ ] GET returns `profession`, `seo`, and `linkItems[]`
- [ ] PUT accepts and saves `profession` field
- [ ] PUT accepts and saves `seo.title`, `seo.description`, `seo.keywords`
- [ ] `linkItems` includes `galleryImages` for GALLERY type

### Public Profiles Route (`/api/public/profile/:username`)
- [ ] Returns `linkItems[]` alongside `customLinks[]`
- [ ] `linkItems` includes `galleryImages` for GALLERY type
- [ ] Only active link items returned (`is_active = 1`)

### vCard Generation (`/api/public/profile/:username/vcard`)
- [ ] vCard 4.0 format (VERSION:4.0)
- [ ] Profession field used for TITLE (or headline fallback)
- [ ] Social links included as X-SOCIALPROFILE fields
- [ ] Phone numbers in `tel:` URI format
- [ ] REV field in ISO 8601 format
- [ ] Rate limiting works (101st request in 1 hour fails with 429)
- [ ] IP hashing preserves privacy

---

## 📝 API Documentation

### POST /api/profiles/me/bio/generate

**Authentication:** Required (JWT)

**Rate Limit:** 5 requests per user per day

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vibe | string | Yes | One of: professional, minimalist, witty, mystical, energetic |
| name | string | No | Name (falls back to profile) |
| profession | string | No | Profession (falls back to profile) |
| interests | string | No | Additional context |

**Response (200):**
```json
{
  "bios": ["Bio 1", "Bio 2", "Bio 3"],
  "vibe": "professional",
  "count": 3
}
```

**Errors:**
- `400` - Invalid vibe or insufficient context
- `429` - Rate limit exceeded (5/day)
- `500` - API configuration error or generation failed

---

### PUT /api/profiles/me

**Authentication:** Required (JWT)

**New Request Fields:**
```json
{
  "profession": "Senior Backend Architect",
  "seo": {
    "title": "John Doe - Backend Expert",
    "description": "Specializing in scalable backend systems",
    "keywords": "backend, architecture, api, nodejs"
  }
}
```

**Response (200):**
```json
{
  "profile": {
    "profession": "Senior Backend Architect",
    "seo": {
      "title": "John Doe - Backend Expert",
      "description": "Specializing in scalable backend systems",
      "keywords": "backend, architecture, api, nodejs"
    }
  }
}
```

---

### GET /api/profiles/me

**Authentication:** Required (JWT)

**New Response Fields:**
```json
{
  "profile": {
    "profession": "Senior Backend Architect",
    "seo": { /* SEO fields */ }
  },
  "linkItems": [
    {
      "id": 1,
      "type": "GALLERY",
      "title": "Portfolio",
      "galleryImages": [ /* images */ ]
    }
  ]
}
```

---

### GET /api/public/profile/:username

**Authentication:** None

**Response Changes:**
- Added `linkItems[]` array
- Each GALLERY type item includes `galleryImages[]`
- Kept `customLinks[]` for backward compatibility

---

### GET /api/public/profile/:username/vcard

**Authentication:** None

**Rate Limit:** 100 requests per IP per hour

**Response:** vCard 4.0 format (text/vcard)

**Changes:**
- Version upgraded to 4.0
- Includes social links as X-SOCIALPROFILE
- Uses profession field for TITLE
- Phone numbers in tel: URI format

---

## 🔒 Security Features

1. **Rate Limiting:**
   - AI Bio: 5/day per user ID
   - vCard Downloads: 100/hour per hashed IP

2. **IP Privacy:**
   - All IPs hashed with SHA-256 before storage
   - No plaintext IP addresses stored

3. **Input Validation:**
   - Vibe parameter whitelist
   - Character limits enforced (120-150 chars)
   - Profile ownership verification

4. **Authentication:**
   - JWT required for all write operations
   - Subscription check for AI features

---

## 🚀 Deployment Notes

1. **Environment Variables Required:**
   - `GEMINI_API_KEY` - Google Gemini API key (for AI bio generation)
   - `BASE_URL` - Base URL for profile links in vCard

2. **NPM Package Required:**
   - `@google/generative-ai` - Already in package.json

3. **Database Migrations:**
   - Ensure migrations 001-003 are applied
   - Tables: `link_items`, `gallery_images`, profiles columns

4. **Rate Limiting Configuration:**
   - Default limits can be overridden via environment variables
   - IP hashing uses SHA-256 (no configuration needed)

---

## 📦 Files Modified/Created

### Created:
- ✅ `backend/routes/ai-bio.js` - AI bio generation route

### Modified:
- ✅ `backend/routes/profiles.js` - Added profession, seo, linkItems
- ✅ `backend/routes/publicProfiles.js` - Added linkItems with galleryImages
- ✅ `backend/services/vCardGenerator.js` - Upgraded to vCard 4.0
- ✅ `backend/routes/vcards.js` - Added rate limiting, social links
- ✅ `backend/server.js` - Registered ai-bio route

---

## ✨ Key Features Delivered

1. **AI-Powered Bio Generation**
   - 5 personality vibes for customization
   - Gemini 2.0 Flash for fast generation
   - Character-optimized for digital profiles

2. **Modern vCard 4.0 Support**
   - Social media integration (X-SOCIALPROFILE)
   - Professional field support
   - ISO 8601 timestamps
   - tel: URI format for phones

3. **Enhanced Profile Management**
   - SEO metadata support
   - Profession field
   - Link items with gallery support

4. **Rate Limiting & Security**
   - IP privacy protection (SHA-256 hashing)
   - Per-user AI limits
   - Per-IP download limits

---

## 🎯 All Tasks Complete

- ✅ Task 1.2.4: AI Bio Generation Route
- ✅ Task 1.2.5: Updated profiles.js
- ✅ Task 1.2.6: Updated publicProfiles.js
- ✅ Task 1.2.7: Upgraded vCardGenerator.js to 4.0
- ✅ Task 1.2.8: Added Rate Limiting to vCard Endpoint

**All backend API routes for Modern vCard Suite are now complete and ready for integration.**
