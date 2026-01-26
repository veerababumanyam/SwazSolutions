# Phase 3 Components - Quick Start Guide

## 🚀 5-Minute Integration

This guide gets Phase 3 components running in your app quickly.

---

## Step 1: Wrap Your App with ProfileProvider

**File**: `src/App.tsx` or your root component

```typescript
import { ProfileProvider } from '@/contexts/ProfileContext';

function App() {
  return (
    <ProfileProvider>
      {/* Your app routes */}
    </ProfileProvider>
  );
}
```

---

## Step 2: Use LinkItemEditor in Your Profile Editor

**Example**: Add a "New Link" button

```typescript
import { LinkItemEditor } from '@/components/profile/LinkItemEditor';
import { LinkType } from '@/types/modernProfile.types';
import { useState } from 'react';

function YourProfileEditor() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <button onClick={() => setShowEditor(true)}>
        Add Link
      </button>

      {showEditor && (
        <LinkItemEditor
          initialType={LinkType.CLASSIC}
          onClose={() => setShowEditor(false)}
          onSave={() => {
            setShowEditor(false);
            // Refresh your link list if needed
          }}
        />
      )}
    </>
  );
}
```

---

## Step 3: Render Links in Public Profile

**File**: `src/components/public-profile/PublicProfileView.tsx`

```typescript
import { LinkItemRenderer } from './LinkItemRenderer';
import { LinkItem } from '@/types/modernProfile.types';

function PublicProfileView({ profile, links }) {
  return (
    <div>
      {/* Your profile header */}

      {/* Links Section */}
      <div className="space-y-3">
        {links.map((link: LinkItem) => (
          <LinkItemRenderer
            key={link.id}
            link={link}
            buttonStyle="bg-purple-500 text-white hover:bg-purple-600"
            shadowClass="shadow-lg"
            cornerRadius={12}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Step 4: Add Gallery Editor (Optional)

**When to use**: When user clicks "Edit" on a GALLERY link

```typescript
import { GalleryEditor } from '@/components/profile/GalleryEditor';
import { useProfile } from '@/contexts/ProfileContext';

function LinkEditor({ linkId }) {
  const { links } = useProfile();
  const link = links.find(l => l.id === linkId);
  const [showGallery, setShowGallery] = useState(false);

  if (link?.type === 'GALLERY') {
    return (
      <>
        <button onClick={() => setShowGallery(true)}>
          Edit Gallery
        </button>

        {showGallery && (
          <GalleryEditor
            linkId={linkId}
            images={link.galleryImages || []}
            onClose={() => setShowGallery(false)}
          />
        )}
      </>
    );
  }
}
```

---

## Step 5: Add Video Upload Editor (Optional)

**When to use**: When user clicks "Upload Video" on a VIDEO_UPLOAD link

```typescript
import { VideoUploadEditor } from '@/components/profile/VideoUploadEditor';

function VideoLinkEditor({ linkId, currentVideoUrl }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button onClick={() => setShowUpload(true)}>
        Upload Video
      </button>

      {showUpload && (
        <VideoUploadEditor
          linkId={linkId}
          currentVideoUrl={currentVideoUrl}
          onClose={() => setShowUpload(false)}
          onUploadComplete={(url) => {
            console.log('Video uploaded:', url);
            setShowUpload(false);
          }}
        />
      )}
    </>
  );
}
```

---

## Common Use Cases

### Use Case 1: Add Classic Link Button

```typescript
import { useProfile } from '@/contexts/ProfileContext';
import { LinkType } from '@/types/modernProfile.types';

function AddClassicLink() {
  const { addLink, updateLink } = useProfile();

  const handleAddLink = async () => {
    await addLink(LinkType.CLASSIC);
    // Link appears in UI immediately (optimistic update)
  };

  return (
    <button onClick={handleAddLink}>
      Add Link
    </button>
  );
}
```

### Use Case 2: Create Section Header

```typescript
const handleAddHeader = async () => {
  await addLink(LinkType.HEADER);

  // Get the newly created link and set its title
  const newLink = links[0]; // First item after optimistic update
  await updateLink(newLink.id, { title: 'MY PROJECTS' });
};
```

### Use Case 3: Create Gallery with Images

```typescript
const handleCreateGallery = async () => {
  // Step 1: Create the gallery link
  await addLink(LinkType.GALLERY);

  // Step 2: Open GalleryEditor to add images
  const newLink = links[0];
  setEditingGalleryId(newLink.id);
  setShowGalleryEditor(true);
};
```

---

## Props Reference

### LinkItemEditor
```typescript
interface LinkItemEditorProps {
  linkId?: string;           // For editing existing link
  initialType?: LinkType;    // Default: LinkType.CLASSIC
  onClose: () => void;       // Required
  onSave?: () => void;       // Optional callback
}
```

### GalleryEditor
```typescript
interface GalleryEditorProps {
  linkId: string;            // Required: which link to edit
  images: GalleryImage[];    // Current images
  onClose: () => void;       // Required
}
```

### VideoUploadEditor
```typescript
interface VideoUploadEditorProps {
  linkId: string;                    // Required
  currentVideoUrl?: string;          // For editing
  onClose: () => void;               // Required
  onUploadComplete?: (url: string, thumbnail?: string) => void;
}
```

### LinkItemRenderer
```typescript
interface LinkItemRendererProps {
  link: LinkItem;              // Required
  buttonStyle?: string;        // Tailwind classes
  shadowClass?: string;        // Shadow classes
  cornerRadius?: number;       // Border radius
  isDarkBg?: boolean;         // Dark mode
  textColor?: string;         // Text color
}
```

---

## Link Types Quick Reference

| Type | Use For | Required Fields | Optional Fields |
|------|---------|----------------|-----------------|
| **CLASSIC** | Standard buttons/links | title, url | thumbnail, platform |
| **HEADER** | Section dividers | title | - |
| **GALLERY** | Image collections | title | layout, galleryImages |
| **VIDEO_EMBED** | YouTube/Vimeo embeds | title, url | thumbnail |
| **VIDEO_UPLOAD** | Self-hosted videos | title, url | thumbnail |
| **BOOKING** | Calendar/scheduling | title, url | - |

---

## Styling Tips

### Custom Button Styles
```typescript
<LinkItemRenderer
  link={link}
  buttonStyle="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  shadowClass="shadow-2xl shadow-purple-500/50"
  cornerRadius={16}
/>
```

### Dark Mode Support
```typescript
const isDark = document.documentElement.classList.contains('dark');

<LinkItemRenderer
  link={link}
  isDarkBg={isDark}
  textColor={isDark ? '#ffffff' : '#000000'}
/>
```

---

## Testing Your Integration

### Checklist
- [ ] ProfileProvider wraps your app
- [ ] Can create new links via LinkItemEditor
- [ ] Links appear in public profile
- [ ] Gallery editor opens and uploads images
- [ ] Video editor uploads videos successfully
- [ ] All 6 link types render correctly
- [ ] Dark mode works
- [ ] Mobile responsive

### Quick Test Script
```typescript
// Test creating all link types
const testAllTypes = async () => {
  const { addLink, updateLink, links } = useProfile();

  // Test CLASSIC
  await addLink(LinkType.CLASSIC);
  await updateLink(links[0].id, { title: 'Test Link', url: 'https://example.com' });

  // Test HEADER
  await addLink(LinkType.HEADER);
  await updateLink(links[0].id, { title: 'SECTION 1' });

  // Test GALLERY
  await addLink(LinkType.GALLERY);

  // Test BOOKING
  await addLink(LinkType.BOOKING);
  await updateLink(links[0].id, {
    title: 'Book a Call',
    url: 'https://calendly.com/example'
  });

  console.log('All link types created successfully!');
};
```

---

## Troubleshooting

### Issue: "useProfile must be used within ProfileProvider"
**Solution**: Make sure `<ProfileProvider>` wraps your component tree.

### Issue: Links not appearing
**Solution**: Check that `fetchProfile()` is called on mount:
```typescript
const { fetchProfile } = useProfile();

useEffect(() => {
  fetchProfile();
}, []);
```

### Issue: Images not uploading
**Solution**: Verify the gallery API endpoint is configured:
```typescript
POST /api/profiles/me/galleries/:linkId/images
```

### Issue: Video upload fails
**Solution**: Check file size (max 100MB) and format (MP4, MOV, AVI, WebM).

---

## Next Steps

1. ✅ **Test in Development**: Run through all link types
2. ✅ **Connect Backend**: Replace TODO comments in ProfileContext with actual API calls
3. ✅ **Style Customization**: Match your brand colors
4. ✅ **Mobile Testing**: Test on actual devices
5. ✅ **Production Deploy**: Ship it!

---

## Need Help?

- **Documentation**: See `PHASE-3-COMPLETION-SUMMARY.md`
- **Integration Guide**: See `INTEGRATION-GUIDE.md` in `src/components/public-profile/`
- **Type Definitions**: See `src/types/modernProfile.types.ts`
- **Backend API Spec**: See Phase 1 documentation

---

**That's it! You're ready to use Phase 3 components. 🎉**
