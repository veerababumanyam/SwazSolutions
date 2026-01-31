# Block Editors Quick Start

Three new block editors for vCard profiles - ready to use!

## Components Created

### ContactFormEditor
**Location:** `src/components/profile/ContactFormEditor.tsx`

Quick usage:
```tsx
import { ContactFormEditor } from '@/components/profile/ContactFormEditor';

<ContactFormEditor
  config={metadata?.type === 'contact_form' ? metadata.config : undefined}
  onChange={(config) => {
    setMetadata({ type: 'contact_form', config });
  }}
/>
```

What it does:
- Let users create contact forms with customizable fields
- Drag-drop to reorder fields (Name, Email, Phone, Subject, Message)
- Set recipient email and success message
- Optional reCAPTCHA protection

### MapLocationEditor
**Location:** `src/components/profile/MapLocationEditor.tsx`

Quick usage:
```tsx
import { MapLocationEditor } from '@/components/profile/MapLocationEditor';

<MapLocationEditor
  config={metadata?.type === 'map_location' ? metadata.config : undefined}
  onChange={(config) => {
    setMetadata({ type: 'map_location', config });
  }}
/>
```

What it does:
- Embed location on interactive map
- Free geocoding via OpenStreetMap (no API key needed)
- Multiple provider support (Google, OpenStreetMap, Mapbox)
- Customize zoom level and marker

### FileDownloadEditor
**Location:** `src/components/profile/FileDownloadEditor.tsx`

Quick usage:
```tsx
import { FileDownloadEditor } from '@/components/profile/FileDownloadEditor';

<FileDownloadEditor
  config={metadata?.type === 'file_download' ? metadata.config : undefined}
  onChange={(config) => {
    setMetadata({ type: 'file_download', config });
  }}
  linkId={linkId}  // Required for upload
/>
```

What it does:
- Drag-drop file uploads (PDF, DOC, DOCX, XLS, XLSX, ZIP)
- Progress bar with percentage
- Custom download button label and description
- Optional password protection and expiration dates
- Download tracking

## Integration with LinkItemEditor

Already integrated! Just add the link types to your UI:

```tsx
// In LinkItemEditor type selector
[LinkType.CONTACT_FORM]: 'Contact Form',
[LinkType.MAP_LOCATION]: 'Map & Location',
[LinkType.FILE_DOWNLOAD]: 'File Download',
```

## Features at a Glance

| Feature | Contact Form | Map | File |
|---------|---|---|---|
| Drag-drop | Fields | - | Files |
| Validation | Email, fields | Address | Type, size |
| Customization | Button text, message | Zoom, marker | Label, expiration |
| Preview | Form layout | Map | Button |
| Security | reCAPTCHA | - | Password |
| Dark mode | ✓ | ✓ | ✓ |
| Accessible | ✓ | ✓ | ✓ |
| Mobile | ✓ | ✓ | ✓ |

## Data Structure

Each block stores config in `LinkItem.metadata`:

```typescript
LinkItem {
  id: string;
  type: LinkType;
  title: string;
  metadata?: LinkMetadata;  // Contains editor config
}

// Contact Form
{ type: 'contact_form', config: ContactFormConfig }

// Map Location
{ type: 'map_location', config: MapLocationConfig }

// File Download
{ type: 'file_download', config: FileDownloadConfig }
```

## File Types Supported

**FileDownloadEditor accepts:**
- PDF (📄)
- Word: .doc, .docx (📝)
- Excel: .xls, .xlsx (📊)
- ZIP archives (📦)
- Max size: 10MB

## API Integration Needed

Three endpoints must be implemented:

### 1. Contact Form Submission
```
POST /api/links/{linkId}/submit-form
Body: { fields: { [fieldId]: value } }
Response: { success: boolean }
```

### 2. File Upload
```
POST /api/profiles/me/files/{linkId}/upload
Body: FormData with 'file' field
Response: { fileUrl: string }
```

### 3. File Download
```
GET /api/files/{fileId}/download
Query: { password?: string }
Response: File binary
```

## Validation Rules

### ContactFormEditor
- Recipient email required and valid format
- At least one field must be selected
- Fields auto-ordered by drag position

### MapLocationEditor
- Address required and must geocode successfully
- Zoom: 1-20
- Marker customizable when enabled

### FileDownloadEditor
- File type must be supported
- File size max 10MB
- Expiration date (if set) must be tomorrow or later
- Password optional, only needed if protection enabled

## Common Tasks

### Add a Contact Form to Profile
1. Create new link, select "Contact Form"
2. Enter recipient email
3. Select which fields to include
4. Reorder fields by dragging
5. Customize button text and success message
6. Save

### Embed a Location Map
1. Create new link, select "Map & Location"
2. Enter address and click Search
3. Adjust zoom level with slider
4. Customize marker color and title (optional)
5. Select map provider
6. Save

### Add a File Download
1. Create new link, select "File Download"
2. Save the link first (creates it in database)
3. Drag file or click to upload
4. Watch progress bar complete
5. Customize button label and add description
6. Optional: Set password, expiration date
7. Save

## Styling & Customization

All components use Tailwind CSS:
- Primary color: Purple 500
- Dark mode: Full support via `dark:` prefix
- Border radius: `rounded-xl`
- Responsive: Mobile-first design

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome mobile

## Performance

- File uploads use XHR for progress tracking
- Geocoding is debounced
- No unnecessary re-renders
- Lazy loading for large files

## Troubleshooting

**File upload fails:**
- Check file size (max 10MB)
- Verify file type supported
- Ensure linkId is provided
- Check network tab for errors

**Geocoding doesn't work:**
- Try more specific address (e.g., "123 Main St, New York, NY")
- Check for typos
- Alternative spelling sometimes helps

**Form validation error:**
- Ensure recipient email is valid format
- At least one field must be selected
- Refresh and try again

## Next Steps

1. Implement backend APIs (3 endpoints)
2. Add email service for contact forms
3. Configure file storage
4. Set up download tracking
5. Test end-to-end

See `BLOCK_EDITORS_GUIDE.md` for detailed documentation.
