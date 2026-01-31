# Phase 3 Block Types - API Quick Reference

## Endpoint Summary

### Contact Form Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/profiles/:username/links/:linkId/contact-form/submit` | Public | Submit form (rate limited 5/hr) |
| GET | `/api/profiles/me/links/:linkId/submissions` | Required | List submissions with pagination |
| PATCH | `/api/profiles/me/submissions/:submissionId` | Required | Mark as read |
| DELETE | `/api/profiles/me/submissions/:submissionId` | Required | Delete submission |

### File Download Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/profiles/me/links/:linkId/files/upload` | Required | Upload file with optional password |
| GET | `/api/profiles/:username/links/:linkId/files` | Public | List files for download |
| GET | `/api/profiles/:username/links/:linkId/files/:fileId/download` | Public | Download file (check password) |
| DELETE | `/api/profiles/me/files/:fileId` | Required | Delete uploaded file |
| GET | `/api/profiles/me/links/:linkId/files/analytics` | Required | Get download analytics |

### Map Location Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/profiles/me/links/:linkId/map/address` | Required | Update location address |
| GET | `/api/profiles/:username/links/:linkId/map` | Public | Get map location with embed code |
| GET | `/api/profiles/me/links/:linkId/map/analytics` | Required | Get location view analytics |

## Database Tables

### contact_form_submissions
```sql
id INTEGER PRIMARY KEY
link_id INTEGER (FK: link_items)
profile_id INTEGER (FK: profiles)
name TEXT
email TEXT
phone TEXT
subject TEXT
message TEXT
ip_hash TEXT
user_agent TEXT
created_at DATETIME
read_at DATETIME
```

### file_uploads
```sql
id INTEGER PRIMARY KEY
link_id INTEGER (FK: link_items)
profile_id INTEGER (FK: profiles)
file_url TEXT
file_name TEXT
file_size INTEGER
mime_type TEXT
password_hash TEXT
expires_at DATETIME
download_count INTEGER
created_at DATETIME
```

### file_downloads
```sql
id INTEGER PRIMARY KEY
link_id INTEGER (FK: link_items)
profile_id INTEGER (FK: profiles)
downloaded_at DATETIME
ip_hash TEXT
user_agent TEXT
```

### map_location_views
```sql
id INTEGER PRIMARY KEY
link_id INTEGER (FK: link_items)
profile_id INTEGER (FK: profiles)
viewed_at DATETIME
ip_hash TEXT
device_type TEXT
```

## Service Functions

### contactFormService

```javascript
// Validation & Sanitization
validateFormFields(formConfig, data) → errors[]
sanitizeInput(input) → string
hashIP(ip) → hash

// Rate Limiting
checkRateLimit(ipHash, linkId) → { isRateLimited, count, limit, remainingAttempts }

// Processing
storeSubmission(linkId, profileId, data, ipHash, userAgent) → submission
sendFormSubmissionEmail(profile, submission, linkTitle) → { sent, messageId }

// Management
markAsRead(submissionId, profileId) → boolean
deleteSubmission(submissionId, profileId) → boolean

// Analytics
getSubmissions(linkId, profileId, options) → { submissions, pagination }
getSubmissionAnalytics(linkId, profileId) → { total, unread, uniqueEmails, byDate, unreadPercentage }
```

### fileUploadService

```javascript
// Validation
validateFile(file) → errors[]

// Upload
uploadFile(file, linkId, profileId, password?) → { id, fileUrl, fileName, fileSize, mimeType, passwordProtected }

// Access
verifyFilePassword(fileId, password) → boolean
getFileForDownload(fileId, profileId) → file

// Analytics
trackDownload(linkId, profileId, ipHash, userAgent) → void
getFileAnalytics(linkId, profileId) → { totalFiles, totalDownloads, filesByDate, downloadTrends, topFiles, avgDownloadsPerFile }

// Cleanup
deleteFile(fileId, profileId) → boolean
```

### mapLocationService

```javascript
// Geocoding
geocodeAddress(address) → { lat, lng, formattedAddress, placeId }
validateAddress(address) → { valid, lat?, lng?, formattedAddress?, error? }

// Display
getMapStaticImage(lat, lng, zoom) → urlString
getEmbeddedMapHTML(lat, lng, address, zoom) → htmlString
getDirectionsURL(lat, lng, address) → urlString

// Metadata
updateMapLocationMetadata(linkId, address, lat, lng, zoom) → mapData

// Analytics
trackMapView(linkId, profileId, ip, userAgent) → boolean
getMapAnalytics(linkId, profileId) → { totalViews, uniqueVisitors, viewsByDevice, viewsByDate, engagementRate }
```

## Request/Response Examples

### Form Submission
```http
POST /api/profiles/alice/links/5/contact-form/submit
Content-Type: application/json

{
  "name": "Bob",
  "email": "bob@example.com",
  "phone": "+1-555-1234",
  "subject": "Inquiry",
  "message": "Hello, interested in your services."
}
```

### File Upload
```http
POST /api/profiles/me/links/7/files/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [binary PDF data]
password: "optional-password"
```

### Map Update
```http
POST /api/profiles/me/links/9/map/address
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "address": "Times Square, New York, NY"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    "Email is required",
    "Message must be 5000 characters or less"
  ]
}
```

### 403 Forbidden
```json
{
  "error": "Password required",
  "message": "This file is password protected"
}
```

### 404 Not Found
```json
{
  "error": "Profile not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many form submissions",
  "message": "Maximum 5 submissions per hour. Please try again later.",
  "remainingAttempts": 0,
  "retryAfter": 3600
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to submit form",
  "message": "An unexpected error occurred"
}
```

## Configuration

### Environment Variables
```bash
# Email (required for form notifications)
EMAIL_USER=info@swazdatarecovery.com
EMAIL_PASSWORD=app-specific-password
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465

# Google Maps (required for map features)
GOOGLE_MAPS_API_KEY=your-api-key

# S3/R2 Storage (optional, defaults to local)
USE_S3=true
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=your-bucket

# Upload directory
UPLOAD_DIR=/var/www/swazsolutions/backend/uploads/files
```

### File Constraints
- **Max Size:** 10MB
- **Allowed Types:** PDF, DOC, DOCX, XLS, XLSX, ZIP, JPEG, PNG, GIF, TXT, CSV

### Form Constraints
- **Rate Limit:** 5 submissions per hour per IP
- **Email Field:** Required, max 255 chars
- **Message Field:** Required, max 5000 chars
- **Other Fields:** Max 100 chars (name, phone, subject)

## Pagination

All list endpoints support pagination:
```http
GET /api/profiles/me/links/5/submissions?page=2&limit=50
```

Parameters:
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `unreadOnly` (default: false) - Only unread submissions

Response includes:
```json
{
  "submissions": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation failed |
| 403 | Forbidden - Password required or unauthorized |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Authentication

Bearer token in Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Public endpoints don't require authentication but IP-based rate limiting still applies.

## CORS

All endpoints follow existing CORS policy:
- Allowed origins from `CORS_ALLOWED_ORIGINS` env var
- Credentials supported
- Methods: GET, POST, PUT, DELETE, OPTIONS

---

For full documentation, see: `PHASE3_IMPLEMENTATION.md`
