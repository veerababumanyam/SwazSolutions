# Phase 3: New Block Types Implementation

## Overview

Phase 3 introduces three new block types for the modern vCard suite:

1. **CONTACT_FORM** - Collect form submissions with validation and email notifications
2. **FILE_DOWNLOAD** - Host downloadable files with optional password protection and analytics
3. **MAP_LOCATION** - Display embedded Google Maps locations with direction links and analytics

## Architecture

### Database Schema

#### New Tables

1. **contact_form_submissions** - Stores form submissions with privacy considerations
   - Hashed IP addresses (SHA256) instead of raw IPs
   - Separate `read_at` field for inbox status
   - Foreign keys to link_items and profiles

2. **file_uploads** - Metadata for uploaded files
   - Supports password-protected downloads
   - Tracks download counts and expiration dates
   - Stores file URLs (S3 or local)

3. **file_downloads** - Download analytics
   - Tracks each download event with hashed IP
   - Device type detection from user agent
   - Date-based analytics

4. **map_location_views** - Map location analytics
   - View tracking with device type detection
   - Unique visitor counting via IP hash
   - Time-series analytics

#### Updated Tables

- **link_items**: Added styling columns
  - `metadata` (JSON) - Block-specific configuration
  - `backgroundColor` - Custom background color
  - `textColor` - Custom text color
  - `borderRadius` - Custom border radius

### Services

#### `contactFormService.js`

Handles form submission lifecycle:

```javascript
// Validation
validateFormFields(formConfig, data) // Validate required fields
sanitizeInput(input) // XSS prevention
checkRateLimit(ipHash, linkId) // 5 per hour per IP

// Processing
storeSubmission(linkId, profileId, data, ipHash, userAgent)
sendFormSubmissionEmail(profile, submission, linkTitle)
markAsRead(submissionId, profileId)
deleteSubmission(submissionId, profileId)

// Analytics
getSubmissions(linkId, profileId, options) // Paginated results
getSubmissionAnalytics(linkId, profileId) // Counts and trends
```

**Security Features:**
- Email validation (RFC 5322)
- HTML entity escaping
- Control character removal
- Field size limits
- Rate limiting (5 submissions/hour/IP)
- IP hashing (SHA256)

#### `fileUploadService.js`

Handles file uploads with storage abstraction:

```javascript
// Upload
uploadFile(file, linkId, profileId, password?) // Handles S3/local
validateFile(file) // Type & size validation

// Access Control
verifyFilePassword(fileId, password)
getFileForDownload(fileId, profileId) // With expiration checking

// Analytics
trackDownload(linkId, profileId, ipHash, userAgent)
getFileAnalytics(linkId, profileId) // Downloads by date, top files

// Cleanup
deleteFile(fileId, profileId) // Deletes from storage & DB
```

**Supported File Types:**
- PDF, DOC, DOCX, XLS, XLSX
- ZIP archives
- Images (JPEG, PNG, GIF)
- Text (TXT, CSV)
- Max size: 10MB

**Storage Options:**
- Local: `/uploads/files/` directory (default)
- S3/Cloudflare R2: Uses R2Service if `USE_S3=true`

#### `mapLocationService.js`

Handles map location display and analytics:

```javascript
// Geocoding
geocodeAddress(address) // Google Geocoding API
validateAddress(address) // Validates & geocodes

// Display
getMapStaticImage(lat, lng, zoom) // Static preview image
getEmbeddedMapHTML(lat, lng, address, zoom) // Responsive embed
getDirectionsURL(lat, lng, address) // Google Maps directions link

// Metadata
updateMapLocationMetadata(linkId, address, lat, lng, zoom)

// Analytics
trackMapView(linkId, profileId, ip, userAgent)
getMapAnalytics(linkId, profileId) // Views, unique visitors, trends
```

**Requirements:**
- `GOOGLE_MAPS_API_KEY` environment variable
- Enables: geocoding, static maps, embedded maps, directions

### API Endpoints

#### Contact Form Endpoints

**Public - Submit Form**
```http
POST /api/profiles/:username/links/:linkId/contact-form/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-1234",
  "subject": "Inquiry",
  "message": "Hello, I'm interested..."
}

Response: 201
{
  "success": true,
  "message": "Thank you for your submission",
  "submissionId": 42
}
```

**Rate Limit:** 5 submissions per hour per IP

**Auth - Get Submissions**
```http
GET /api/profiles/me/links/:linkId/submissions?page=1&limit=20&unreadOnly=false
Authorization: Bearer {token}

Response: 200
{
  "submissions": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-1234",
      "subject": "Inquiry",
      "message": "...",
      "created_at": "2025-01-31T10:00:00Z",
      "read_at": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "pages": 3 },
  "analytics": {
    "total": 42,
    "unread": 5,
    "uniqueEmails": 38,
    "unreadPercentage": 12
  }
}
```

**Auth - Mark as Read**
```http
PATCH /api/profiles/me/submissions/:submissionId
Authorization: Bearer {token}
Content-Type: application/json

{ "read": true }

Response: 200
{
  "id": 1,
  "email": "john@example.com",
  "read_at": "2025-01-31T10:05:00Z"
}
```

**Auth - Delete Submission**
```http
DELETE /api/profiles/me/submissions/:submissionId
Authorization: Bearer {token}

Response: 200
{ "success": true, "message": "Submission deleted" }
```

#### File Download Endpoints

**Auth - Upload File**
```http
POST /api/profiles/me/links/:linkId/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
password: "optional-password"

Response: 201
{
  "id": 1,
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "fileUrl": "s3://bucket/files/...",
  "passwordProtected": false
}
```

**Public - List Files**
```http
GET /api/profiles/:username/links/:linkId/files

Response: 200
[
  {
    "id": 1,
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "downloadCount": 5,
    "createdAt": "2025-01-31T10:00:00Z",
    "isPasswordProtected": false
  }
]
```

**Public - Download File**
```http
GET /api/profiles/:username/links/:linkId/files/:fileId/download?password=optional

Response: 200
{
  "success": true,
  "fileUrl": "s3://bucket/files/...",
  "fileName": "document.pdf"
}

// 403 if password required and incorrect
```

**Auth - Delete File**
```http
DELETE /api/profiles/me/files/:fileId
Authorization: Bearer {token}

Response: 200
{ "success": true, "message": "File deleted" }
```

**Auth - File Analytics**
```http
GET /api/profiles/me/links/:linkId/files/analytics
Authorization: Bearer {token}

Response: 200
{
  "totalFiles": 5,
  "totalDownloads": 42,
  "avgDownloadsPerFile": 8.4,
  "filesByDate": [
    { "date": "2025-01-31", "count": 1 },
    { "date": "2025-01-30", "count": 2 }
  ],
  "downloadTrends": [
    { "date": "2025-01-31", "count": 5 },
    { "date": "2025-01-30", "count": 3 }
  ],
  "topFiles": [
    { "file_name": "popular.pdf", "download_count": 15 }
  ]
}
```

#### Map Location Endpoints

**Auth - Update Address**
```http
POST /api/profiles/me/links/:linkId/map/address
Authorization: Bearer {token}
Content-Type: application/json

{ "address": "123 Main St, New York, NY 10001" }

Response: 200
{
  "address": "123 Main Street, New York, NY 10001, USA",
  "lat": 40.7128,
  "lng": -74.0060,
  "zoom": 15,
  "staticImageUrl": "https://maps.googleapis.com/maps/api/staticmap?..."
}
```

**Public - Get Map Location**
```http
GET /api/profiles/:username/links/:linkId/map

Response: 200
{
  "title": "Office Location",
  "address": "123 Main Street, New York, NY 10001, USA",
  "lat": 40.7128,
  "lng": -74.0060,
  "zoom": 15,
  "embedHTML": "<div style=\"...\"><iframe src=\"...\" /></div>",
  "directionsURL": "https://www.google.com/maps/dir/?..."
}
```

**Auth - Map Analytics**
```http
GET /api/profiles/me/links/:linkId/map/analytics
Authorization: Bearer {token}

Response: 200
{
  "totalViews": 125,
  "uniqueVisitors": 98,
  "engagementRate": 78,
  "viewsByDevice": [
    { "device_type": "desktop", "count": 75 },
    { "device_type": "mobile", "count": 50 }
  ],
  "viewsByDate": [
    { "date": "2025-01-31", "count": 15 },
    { "date": "2025-01-30", "count": 12 }
  ]
}
```

### Security Considerations

#### Input Validation

- **Email:** RFC 5322 validation via `validator` library
- **Phone:** International phone format validation
- **Text Fields:** Max length enforcement (100-5000 chars)
- **Files:** MIME type whitelist, max 10MB
- **Address:** Max 500 chars, geocoding validation

#### Data Privacy

- **IP Hashing:** Uses SHA256 (one-way hash, not reversible)
- **Password Protection:** Uses bcrypt (10 rounds) for file passwords
- **PII Handling:** Never log raw email addresses, use hashes
- **Data Retention:** No automatic deletion (manual via endpoints)

#### Rate Limiting

- **Form Submissions:** 5 per hour per IP
- **File Uploads:** 20 per hour per user (via existing uploadLimiter)
- **General API:** 100 per minute per user (via apiLimiter)

#### CORS & Headers

- Same CORS policy as rest of API
- Helmet.js security headers applied
- Content-Type validation on all endpoints
- CSRF token validation (inherited from auth middleware)

### Environment Variables

Required for all features:
```bash
# Email notifications
EMAIL_USER=info@swazdatarecovery.com
EMAIL_PASSWORD=app-specific-password
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465

# Google Maps (required for map block type)
GOOGLE_MAPS_API_KEY=your-key

# Optional: S3 storage
USE_S3=true
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=your-bucket

# Optional: Upload directory
UPLOAD_DIR=/var/www/swazsolutions/backend/uploads/files
```

### File Structure

```
backend/
├── config/
│   └── database.js                 (Updated with new tables)
├── services/
│   ├── contactFormService.js       (NEW)
│   ├── fileUploadService.js        (NEW)
│   └── mapLocationService.js       (NEW)
├── routes/
│   ├── block-types.js              (NEW - all endpoints)
│   └── link-items.js               (Existing)
├── migrations/
│   ├── 001-add-link-items.sql      (Existing)
│   └── 002-add-block-types.sql     (NEW)
└── server.js                        (Updated with route mounting)
```

### Integration with Existing Systems

#### Link Items Type
New valid types added to validation:
- Existing: `CLASSIC`, `GALLERY`, `VIDEO_EMBED`, `HEADER`, `BOOKING`, `VIDEO_UPLOAD`
- New: `CONTACT_FORM`, `FILE_DOWNLOAD`, `MAP_LOCATION`

#### Metadata Storage
Block-specific config stored in `link_items.metadata` as JSON:
```json
{
  "contactForm": {
    "includeNameField": true,
    "includePhoneField": true,
    "includeSubjectField": true,
    "successMessage": "Thank you for your submission"
  },
  "mapLocation": {
    "address": "123 Main St, NY",
    "lat": 40.7128,
    "lng": -74.0060,
    "zoom": 15
  }
}
```

#### Profile Settings
Form owner can receive submissions at:
1. `profile.public_email` (priority)
2. `profile.company_email` (fallback)
3. Swaz team email (if neither configured)

#### Analytics
Integrated into existing `/api/analytics` flow:
- Form submissions counted
- File downloads tracked
- Map views recorded
- All data available via new analytics endpoints

## Testing Checklist

### Contact Form Tests
- [ ] Submit form with all fields
- [ ] Submit form with minimal fields (only email + message)
- [ ] Test email validation
- [ ] Test rate limiting (6th submission rejected)
- [ ] Verify sanitization (test with HTML/scripts)
- [ ] Check email notifications sent
- [ ] Verify form shows in dashboard
- [ ] Mark submission as read
- [ ] Delete submission
- [ ] Check unread count updates

### File Upload Tests
- [ ] Upload valid PDF
- [ ] Upload valid image
- [ ] Reject invalid file type (e.g., .exe)
- [ ] Reject oversized file (>10MB)
- [ ] Upload with password
- [ ] Download without password (if not protected)
- [ ] Download with wrong password (rejected)
- [ ] Download with correct password
- [ ] Track download count
- [ ] Delete file (verify removed from storage)
- [ ] Check file analytics

### Map Location Tests
- [ ] Update address with valid US address
- [ ] Update address with international address
- [ ] Verify geocoding returns coordinates
- [ ] View map location (public)
- [ ] Verify embed HTML generated
- [ ] Verify directions URL works
- [ ] Check map analytics tracking
- [ ] View analytics dashboard

### Database Tests
- [ ] Verify all tables created
- [ ] Check indexes created
- [ ] Test cascading deletes (delete profile → all submissions gone)
- [ ] Verify IP hashing consistent
- [ ] Check password hashing different each time

### Performance Tests
- [ ] Load 100 form submissions
- [ ] Load 50 files
- [ ] Get analytics for busy link
- [ ] Concurrent submissions don't conflict
- [ ] Large file upload doesn't timeout

## Deployment Notes

### Migration Steps
1. Pull latest code with new migrations
2. Database auto-migrates on first run
3. Tables and indexes created automatically
4. No manual SQL execution needed

### Environment Setup
```bash
# Required for email notifications
export EMAIL_USER=your-email
export EMAIL_PASSWORD=your-app-password

# Required for maps
export GOOGLE_MAPS_API_KEY=your-key

# Optional S3
export USE_S3=true
export R2_ACCESS_KEY_ID=your-id
export R2_SECRET_ACCESS_KEY=your-secret
```

### Post-Deployment Verification
```bash
# Test contact form endpoint
curl -X POST http://localhost:3000/api/profiles/testuser/links/1/contact-form/submit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","message":"Test"}'

# Test file upload
curl -X POST http://localhost:3000/api/profiles/me/links/1/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@test.pdf"

# Test map update
curl -X POST http://localhost:3000/api/profiles/me/links/1/map/address \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"address":"123 Main St, New York"}'
```

## Future Enhancements

### Phase 3.1
- Email templates (customize success messages)
- Conditional fields (show/hide based on user selections)
- Form validation rules (min/max length, regex patterns)
- Redirect after submission

### Phase 3.2
- File versioning (multiple versions of same file)
- Download expiration notifications
- Form submission webhooks
- Custom file icons

### Phase 3.3
- Form export (CSV, JSON)
- File bandwidth analytics
- Map route planning
- Location clustering for multiple addresses

## Support & Troubleshooting

### Email not sending
- Check `EMAIL_USER` and `EMAIL_PASSWORD` set
- Verify SMTP credentials correct
- Check firewall allows SMTP port 465

### Maps not working
- Verify `GOOGLE_MAPS_API_KEY` set
- Check quota not exceeded
- Enable Maps Static API, Geocoding API, Embed API

### File uploads failing
- Check `UPLOAD_DIR` writable
- Verify file size < 10MB
- Check allowed MIME types

### Forms not tracking
- Verify IP hashing working (check console)
- Check contact_form_submissions table created
- Verify profile_id and link_id correct

---

**Version:** 1.0
**Last Updated:** 2025-01-31
**Status:** Ready for Production
