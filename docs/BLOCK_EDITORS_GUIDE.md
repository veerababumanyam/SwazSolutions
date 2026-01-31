# Block Editors Guide

This guide documents the three new block editor components for vCard profile customization.

## Overview

Three modular block editors have been created to extend the vCard profile system with advanced functionality:

1. **ContactFormEditor** - Embeddable contact form builder
2. **MapLocationEditor** - Interactive map with location display
3. **FileDownloadEditor** - Secure file hosting and downloads

These editors integrate seamlessly with the `LinkItemEditor` modal and use the `LinkMetadata` type system for configuration persistence.

---

## 1. ContactFormEditor

**Location:** `/src/components/profile/ContactFormEditor.tsx`

### Features

- **Field Management**
  - Predefined field types: Name, Email, Phone, Subject, Message
  - Automatic "Message" field as textarea
  - Required field designation
  - Drag-and-drop field reordering
  - Field visibility toggling

- **Form Customization**
  - Recipient email configuration (required)
  - Custom submit button text
  - Custom success message
  - Optional reCAPTCHA v3 integration

- **Preview**
  - Mobile-responsive form layout preview
  - Shows all selected fields
  - Demonstrates final button and success state

### Props

```typescript
interface ContactFormEditorProps {
  config?: ContactFormConfig;
  onChange: (config: ContactFormConfig) => void;
}

interface ContactFormConfig {
  recipientEmail: string;
  fields: ContactFormField[];
  submitButtonText?: string;
  successMessage?: string;
  recaptchaSiteKey?: string;
}

interface ContactFormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}
```

### Default Configuration

```typescript
{
  recipientEmail: '',
  fields: [
    { id: 'name', label: 'Name', type: 'text', required: true, order: 0 },
    { id: 'email', label: 'Email', type: 'email', required: true, order: 1 },
    { id: 'message', label: 'Message', type: 'textarea', required: true, order: 2 }
  ],
  submitButtonText: 'Send Message',
  successMessage: 'Thanks for reaching out! We\'ll get back to you soon.'
}
```

### Usage

```tsx
import { ContactFormEditor } from '@/components/profile/ContactFormEditor';

<ContactFormEditor
  config={existingConfig}
  onChange={(config) => {
    setMetadata({
      type: 'contact_form',
      config
    });
  }}
/>
```

### Validation

- Recipient email is required and must be valid
- At least one field must be selected
- Fields can be reordered but order is auto-calculated

### Styling

- Dark mode support with Tailwind CSS
- Responsive checkbox list interface
- Drag handle indicators on hover
- Color-coded required field badges

---

## 2. MapLocationEditor

**Location:** `/src/components/profile/MapLocationEditor.tsx`

### Features

- **Address Management**
  - Free-text address input
  - OpenStreetMap Nominatim geocoding (free, no API key)
  - Automatic latitude/longitude extraction
  - Read-only coordinate display

- **Map Configuration**
  - Provider selection (Google Maps, OpenStreetMap, Mapbox)
  - Zoom level control (1-20 scale)
  - Dynamic zoom adjustment

- **Marker Customization**
  - Marker visibility toggle
  - Color picker with hex input
  - Custom title/label for marker
  - Shows on hover in embedded map

- **Preview**
  - Map preview area (placeholder for actual map rendering)
  - Address and coordinates display
  - Current zoom level indicator

### Props

```typescript
interface MapLocationEditorProps {
  config?: MapLocationConfig;
  onChange: (config: MapLocationConfig) => void;
}

interface MapLocationConfig {
  address: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  provider?: 'google' | 'openstreetmap' | 'mapbox';
  showMarker?: boolean;
  markerLabel?: string;
}
```

### Default Configuration

```typescript
{
  address: '',
  provider: 'openstreetmap',
  zoom: 15,
  showMarker: true,
  markerColor: '#ef4444'
}
```

### Usage

```tsx
import { MapLocationEditor } from '@/components/profile/MapLocationEditor';

<MapLocationEditor
  config={existingConfig}
  onChange={(config) => {
    setMetadata({
      type: 'map_location',
      config
    });
  }}
/>
```

### Geocoding

- Uses OpenStreetMap Nominatim API (free)
- Triggered by "Search" button
- Populates latitude/longitude automatically
- Shows error if address not found

### Validation

- Address field is required
- Geocoding must succeed before map displays
- Coordinates must be valid numbers

### API Information

- **OpenStreetMap (Free)**
  - No API key required
  - Rate limited to ~1 request/sec
  - Great for development and testing

- **Google Maps** (Requires API key)
  - More precise results
  - Better address parsing
  - Requires backend configuration

- **Mapbox** (Requires API key)
  - Beautiful map styling
  - Good performance
  - Requires backend configuration

### Styling

- Slider control for zoom level
- Color picker for marker
- Address search with loading state
- Map preview placeholder

---

## 3. FileDownloadEditor

**Location:** `/src/components/profile/FileDownloadEditor.tsx`

### Features

- **File Upload**
  - Drag-and-drop file upload zone
  - Click-to-browse file selection
  - Upload progress bar with percentage
  - Supported types: PDF, DOC, DOCX, XLS, XLSX, ZIP
  - Maximum file size: 10MB
  - Real-time progress tracking

- **File Metadata**
  - Auto-detected filename and extension
  - Auto-detected file type with icons
  - File size display (formatted as KB/MB)
  - Custom download button label
  - Optional description text

- **Security Options**
  - Optional password protection
  - Expiration date configuration
  - Download tracking toggle
  - Date validation (minimum tomorrow)

- **Download Preview**
  - Visual preview of the download button
  - Shows description text if provided
  - File icon display
  - Button styling preview

### Props

```typescript
interface FileDownloadEditorProps {
  config?: FileDownloadConfig;
  onChange: (config: FileDownloadConfig) => void;
  linkId?: string; // Required for file upload
}

interface FileDownloadConfig {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  displayName?: string;
  description?: string;
  icon?: string;
  passwordProtected?: boolean;
  password?: string;
  expiresAt?: string;
  trackDownloads?: boolean;
}
```

### Default Configuration

```typescript
{
  fileUrl: '',
  fileName: '',
  trackDownloads: true
}
```

### Usage

```tsx
import { FileDownloadEditor } from '@/components/profile/FileDownloadEditor';

<FileDownloadEditor
  config={existingConfig}
  onChange={(config) => {
    setMetadata({
      type: 'file_download',
      config
    });
  }}
  linkId={linkId}
/>
```

### Supported File Types

| Type | Mime Type | Icon |
|------|-----------|------|
| PDF | `application/pdf` | 📄 |
| Word | `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 📝 |
| Excel | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | 📊 |
| ZIP | `application/zip`, `application/x-zip-compressed` | 📦 |

### Upload Process

1. User selects file via drag-drop or file dialog
2. File type and size are validated
3. Upload starts with progress tracking
4. Progress bar shows percentage completion
5. On success, file URL is saved to config
6. File info card displays with option to remove

### Upload Endpoint

```
POST /api/profiles/me/files/{linkId}/upload
```

**Request:** FormData with `file` field
**Response:** `{ fileUrl: string }`

### Validation

- File type must be in SUPPORTED_TYPES
- File size must be ≤ 10MB
- LinkId required for new file uploads
- Password (if enabled) can be any string
- Expiration date must be tomorrow or later

### Icons

Files are displayed with emoji icons based on type:
- PDF: 📄
- Word: 📝
- Excel: 📊
- ZIP: 📦
- Default: 📥

### Styling

- Drag-drop zone with hover effects
- Upload progress visualization
- File info card with quick remove button
- Toggle switches for optional features
- Button preview with actual styling

---

## Integration with LinkItemEditor

All three editors integrate with `LinkItemEditor` through the metadata system:

### Type Selector

The link type selector now includes:
- `CONTACT_FORM` - "Contact Form"
- `MAP_LOCATION` - "Map & Location"
- `FILE_DOWNLOAD` - "File Download"
- `CUSTOM_LINK` - "Custom Link" (reserved for future)

### Conditional Rendering

```tsx
{type === LinkType.CONTACT_FORM && (
  <ContactFormEditor
    config={metadata?.type === 'contact_form' ? metadata.config : undefined}
    onChange={(config) => {
      setMetadata({
        type: 'contact_form',
        config
      });
    }}
  />
)}

{type === LinkType.MAP_LOCATION && (
  <MapLocationEditor
    config={metadata?.type === 'map_location' ? metadata.config : undefined}
    onChange={(config) => {
      setMetadata({
        type: 'map_location',
        config
      });
    }}
  />
)}

{type === LinkType.FILE_DOWNLOAD && linkId && (
  <FileDownloadEditor
    config={metadata?.type === 'file_download' ? metadata.config : undefined}
    onChange={(config) => {
      setMetadata({
        type: 'file_download',
        config
      });
    }}
    linkId={linkId}
  />
)}
```

### Validation Updates

The `isValid()` function was updated to handle new block types:

```typescript
case LinkType.CONTACT_FORM:
  return metadata?.type === 'contact_form' && !!metadata?.config?.recipientEmail;
case LinkType.MAP_LOCATION:
  return metadata?.type === 'map_location' && !!metadata?.config?.address;
case LinkType.FILE_DOWNLOAD:
  return metadata?.type === 'file_download' && !!metadata?.config?.fileUrl;
```

### Submission Updates

The submit handler saves metadata along with link data:

```typescript
const updates: Partial<LinkItem> = {
  title,
  ...(metadata && { metadata })
};
await updateLink(linkId, updates);
```

---

## Backend Integration

### API Endpoints Required

#### Contact Form Submission
```
POST /api/links/{linkId}/submit-form
Body: { fields: { [fieldId]: value } }
```

#### Map Embedding
```
GET /api/links/{linkId}/map-embed
Response: iframe HTML or map object
```

#### File Download
```
POST /api/profiles/me/files/{linkId}/upload
Body: FormData with file
Response: { fileUrl: string }

GET /api/files/{fileId}/download
Query: { password?: string }
```

---

## Styling & Customization

All editors follow the same design system:

### Colors
- Primary: Purple (`#a855f7`)
- Background: White/Dark gray
- Borders: Gray 200/700
- Error: Red 600/400
- Success: Green 600/400

### Components
- Input fields: `px-4 py-3 rounded-xl`
- Labels: `text-sm font-medium`
- Buttons: `px-6 py-3 rounded-xl`
- Cards: `bg-{color}-50 dark:bg-{color}-900/20`

### Dark Mode
All components include full dark mode support via Tailwind's `dark:` prefix.

### Accessibility

- ARIA labels on all form inputs
- Proper label associations
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliant
- Screen reader friendly

---

## Common Patterns

### Adding New Block Types

1. **Create Editor Component**
   - Create new file: `src/components/profile/{BlockType}Editor.tsx`
   - Export props interface and default export
   - Use existing editors as template

2. **Add Type Definition**
   - Update `LinkType` enum in `modernProfile.types.ts`
   - Define config interface
   - Add to `LinkMetadata` union type

3. **Integrate with LinkItemEditor**
   - Import new editor component
   - Add case to validation switch
   - Add conditional rendering section
   - Add type label/description

4. **Backend Implementation**
   - Create API endpoint for form submission
   - Handle file uploads
   - Manage expiration/password logic

---

## Troubleshooting

### File Upload Issues

**Problem:** "Upload failed" error
- Check file size (max 10MB)
- Verify file type is supported
- Ensure linkId is provided
- Check network connectivity

**Problem:** Upload progress stuck
- Try refreshing and re-uploading
- Check browser console for errors
- Verify backend endpoint is accessible

### Map Issues

**Problem:** "Address not found"
- Try more specific address format
- Include city and state/country
- Check for typos
- Try alternative spelling

**Problem:** Map not displaying
- Verify provider API key is configured
- Check that coordinates were geocoded
- Zoom level should be 1-20

### Form Issues

**Problem:** Form submission fails
- Verify recipient email is valid
- Check that required fields are configured
- Ensure form fields are saved before submission
- Check network tab for API errors

---

## Performance Considerations

### File Upload
- Large files (5-10MB) may take time
- Progress bar updates every 0.1 second
- Consider server upload limits
- Implement chunked upload for very large files

### Geocoding
- OpenStreetMap API has rate limits
- Cache geocoding results when possible
- Debounce address input if auto-geocoding

### Map Rendering
- Static maps preferred for profile pages
- Consider lazy loading for performance
- Use appropriate zoom levels (1-20)

---

## Future Enhancements

### ContactFormEditor
- Custom field types (date, time, number)
- Field conditions/dependencies
- Email templates for confirmations
- Slack/webhook integrations

### MapLocationEditor
- Multiple locations support
- Route directions
- Business hours display
- Directions link to Apple Maps/Google Maps

### FileDownloadEditor
- File versioning
- Bulk download (ZIP)
- Folder/collection support
- Download statistics dashboard
- Bandwidth usage tracking

---

## Code Examples

### Complete Contact Form Block

```tsx
// In LinkItemEditor
{type === LinkType.CONTACT_FORM && (
  <ContactFormEditor
    config={metadata?.type === 'contact_form' ? metadata.config : undefined}
    onChange={(config) => {
      setMetadata({
        type: 'contact_form',
        config
      });
    }}
  />
)}

// Resulting LinkItem
{
  id: 'link-123',
  type: LinkType.CONTACT_FORM,
  title: 'Get in Touch',
  isActive: true,
  clicks: 0,
  metadata: {
    type: 'contact_form',
    config: {
      recipientEmail: 'contact@example.com',
      fields: [
        { id: 'name', type: 'text', label: 'Name', required: true, order: 0 },
        { id: 'email', type: 'email', label: 'Email', required: true, order: 1 },
        { id: 'message', type: 'textarea', label: 'Message', required: true, order: 2 }
      ],
      submitButtonText: 'Send Message',
      successMessage: 'Thanks for reaching out!'
    }
  }
}
```

### Complete File Download Block

```tsx
// Resulting LinkItem
{
  id: 'link-456',
  type: LinkType.FILE_DOWNLOAD,
  title: 'Resume Download',
  isActive: true,
  clicks: 0,
  metadata: {
    type: 'file_download',
    config: {
      fileUrl: 'https://cdn.example.com/resume.pdf',
      fileName: 'resume.pdf',
      fileSize: 2097152,
      mimeType: 'application/pdf',
      displayName: 'Download My Resume',
      description: 'PDF version of my professional resume',
      icon: '📄',
      trackDownloads: true,
      expiresAt: '2025-12-31'
    }
  }
}
```

---

## References

- **Types:** `/src/types/modernProfile.types.ts`
- **Link Editor:** `/src/components/profile/LinkItemEditor.tsx`
- **Gallery Editor:** `/src/components/profile/GalleryEditor.tsx` (reference implementation)
- **Profile Context:** `/src/contexts/ProfileContext.tsx`
