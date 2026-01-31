# Template System - Quick Start Guide

## Installation & Setup

### 1. Verify Components Are Created
```bash
ls -la src/components/templates/
# Should show:
# - TemplateGallery.tsx
# - TemplatePreviewModal.tsx
# - TemplateApplyModal.tsx
# - index.ts
```

### 2. Check Service File
```bash
ls src/services/templateService.ts
# Service should be ready to use
```

### 3. Review Integration
```bash
grep -n "TemplateGallery\|TemplatePreviewModal\|TemplateApplyModal" \
  src/components/vcard/AestheticsTab.tsx
# Should show integration in AestheticsTab
```

## Component Locations

| Component | Path | Size | Status |
|-----------|------|------|--------|
| TemplateGallery | `src/components/templates/TemplateGallery.tsx` | 16KB | ✅ Ready |
| TemplatePreviewModal | `src/components/templates/TemplatePreviewModal.tsx` | 15KB | ✅ Ready |
| TemplateApplyModal | `src/components/templates/TemplateApplyModal.tsx` | 15KB | ✅ Ready |
| templateService | `src/services/templateService.ts` | 9KB | ✅ Ready |
| AestheticsTab Integration | `src/components/vcard/AestheticsTab.tsx` | Updated | ✅ Complete |

## Quick Import Guide

### Import Individual Components
```tsx
import { TemplateGallery } from '@/components/templates/TemplateGallery';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { TemplateApplyModal } from '@/components/templates/TemplateApplyModal';
```

### Import from Barrel Export
```tsx
import { TemplateGallery, TemplatePreviewModal, TemplateApplyModal } from '@/components/templates';
```

### Import Service
```tsx
import { templateService } from '@/services/templateService';
```

## Feature Checklist

### TemplateGallery Features
- [x] Category filter tabs
  - All, Personal, Business, Portfolio, Event, Restaurant, Real-estate, Healthcare, Education, Nonprofit, Entertainment
- [x] Search functionality
  - Searches name, description, and tags
  - Debounced for performance
- [x] Sort options
  - Popular (by usageCount)
  - Recent (by createdAt)
  - A-Z (by name)
- [x] Responsive grid
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- [x] Pagination
  - 20 templates per page
  - Previous/Next buttons
  - Page number buttons
- [x] Template cards
  - Thumbnail image with fallback
  - Title and category
  - Description preview
  - Tags (max 3 visible + count)
  - Statistics (usage + rating)
  - Preview & Apply buttons
  - Featured/Premium badges
- [x] Loading state
  - Spinner animation
  - "Loading templates..." message
- [x] Error state
  - Error message display
  - Retry button
  - Toast notification
- [x] Empty state
  - No results message
  - Clear search button if applicable

### TemplatePreviewModal Features
- [x] Modal dialog
  - Smooth entrance/exit animation
  - Click outside to close
  - ESC key to close
- [x] Header section
  - Template name
  - Category and author
  - Close button
- [x] Two tabs
  - Theme Preview tab
  - Block Types tab
- [x] Theme Preview content
  - Color palette section
    - Accent color swatch
    - Button colors swatches
    - Social icons color swatch
    - Hex code display
  - Typography section
    - Name typography sample
    - Profession typography sample
    - Font family and weight display
  - Button styles section
    - Sample button rendering
- [x] Block Types content
  - List of all blocks in template
  - Block type icons
  - Block names and descriptions
  - Help text for each block
  - Required/Optional indicators
- [x] Statistics
  - Usage count
  - Average rating
  - Premium indicator
- [x] Tags display
  - All tags shown
  - Blue tag styling
- [x] Apply button
  - Triggers apply mode selection
  - Loading state during apply
- [x] Keyboard navigation
  - Tab through content
  - Enter on buttons
  - ESC to close

### TemplateApplyModal Features
- [x] Three mode options
  - Replace mode
    - Clear all current blocks
    - Red warning styling
    - Confirmation checkbox required
    - Description of action
  - Merge mode
    - Keep existing blocks
    - Add template blocks
    - Update theme
    - "Recommended" badge
    - Two toggles for keep options
  - Theme-Only mode
    - Only styling applied
    - Content preserved
    - Green info styling
- [x] Mode descriptions
  - Clear explanation of each mode
  - Block count for replace mode
- [x] Mode-specific options
  - Replace: Confirmation checkbox
  - Merge: Keep blocks/socials toggles
  - Theme-only: No options
- [x] Selected mode summary
  - Shows selected mode name
  - Shows detailed description
  - Updates dynamically
- [x] Apply button
  - Disabled until valid selection
  - Loading state with spinner
  - Proper error handling
- [x] Notifications
  - Success toast after apply
  - Error toast on failure
  - Mode name in notification

## Data Types Used

### VCardTemplate
```typescript
{
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  previewImageUrl?: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  isFeatured: boolean;
  version: string;
  author?: string;
  tags: string[];
  sections: TemplateSection[];
  defaultTheme?: Partial<Theme>;
  suggestedSocials?: SocialPlatform[];
  defaultProfile?: Partial<ProfileData>;
  usageCount?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### TemplateCategory
```typescript
'personal' | 'business' | 'portfolio' | 'event' | 'restaurant' | 'real-estate' | 'healthcare' | 'education' | 'nonprofit' | 'entertainment' | 'custom'
```

## API Endpoints Reference

### Get Templates
```bash
GET /api/templates
GET /api/templates?category=business
GET /api/templates?search=minimal
GET /api/templates?sortBy=usageCount
GET /api/templates?offset=0&limit=20

# Returns:
{
  templates: VCardTemplate[];
  total: number;
  pages: number;
}
```

### Apply Template
```bash
POST /api/templates/:templateId/apply

Body:
{
  mode: 'replace' | 'merge' | 'theme-only';
  keepExistingBlocks?: boolean;
  keepSocialProfiles?: boolean;
}

# Returns:
{
  message: string;
  appliedAt: string;
}
```

## Styling Guide

### Color Scheme
- Primary Button: `bg-blue-500 hover:bg-blue-600`
- Secondary Button: `bg-gray-200 dark:bg-gray-700`
- Success: `text-green-600 dark:text-green-400`
- Warning: `text-red-600 dark:text-red-400`
- Info: `text-blue-600 dark:text-blue-400`

### Dark Mode
All components automatically support dark mode with `dark:` prefixes:
- Dark background: `dark:bg-gray-900`
- Dark text: `dark:text-white`
- Dark borders: `dark:border-gray-800`

### Responsive Classes
- Mobile: Default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

## State Management Example

```tsx
// In your component
const [previewTemplate, setPreviewTemplate] = useState<VCardTemplate | null>(null);
const [showPreview, setShowPreview] = useState(false);
const [showApply, setShowApply] = useState(false);

// Handle preview
const handlePreviewTemplate = (templateId: string) => {
  setPreviewTemplate(template); // After fetching
  setShowPreview(true);
};

// Handle apply mode selection
const handleShowApplyMode = () => {
  setShowPreview(false);
  setShowApply(true);
};

// Handle template application
const handleApplyTemplate = async (mode, options) => {
  await templateService.applyTemplate(previewTemplate.id, mode, options);
  setShowApply(false);
  showToast('Template applied!', 'success');
};
```

## Common Issues & Solutions

### Problem: "Module not found"
```bash
# Solution: Ensure import paths are correct
import { TemplateGallery } from '@/components/templates';
# @ = /src alias configured in tsconfig.json
```

### Problem: "Cannot read property of null"
```typescript
// Make sure to check if data exists before accessing
if (template?.defaultTheme?.accentColor) {
  // Safe to use
}
```

### Problem: "Modal not appearing"
```typescript
// Ensure modal state is being set
const [showPreview, setShowPreview] = useState(false);

// And isOpen prop is connected
<TemplatePreviewModal
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
/>
```

### Problem: "Styles not applied"
```bash
# Ensure TailwindCSS is processing the file
# Add to tailwind.config.js if needed:
content: [
  './src/components/templates/**/*.{tsx,ts}'
]
```

## Performance Tips

1. **Lazy Load Images**
   - Thumbnails already use `loading="lazy"`
   - No additional setup needed

2. **Debounce Search**
   - Search is debounced at 300ms
   - Prevents excessive API calls

3. **Pagination**
   - Only 20 templates rendered per page
   - Reduces DOM nodes

4. **Memoization**
   - Use `useMemo` for filtered results
   - Already implemented in TemplateGallery

## Testing Helpers

### Test Data
```typescript
const mockTemplate: VCardTemplate = {
  id: 'test-1',
  name: 'Test Template',
  description: 'Test description',
  category: 'business',
  isPremium: false,
  isFeatured: false,
  version: '1.0',
  tags: ['test'],
  sections: [],
  usageCount: 0,
  rating: 5
};
```

### Mock Service
```typescript
jest.mock('@/services/templateService', () => ({
  templateService: {
    getTemplates: jest.fn().mockResolvedValue({
      templates: [mockTemplate],
      total: 1,
      pages: 1
    }),
    applyTemplate: jest.fn().mockResolvedValue({
      message: 'Applied',
      appliedAt: new Date().toISOString()
    })
  }
}));
```

## File Structure

```
src/
├── components/
│   ├── templates/
│   │   ├── TemplateGallery.tsx          (Main browsing UI)
│   │   ├── TemplatePreviewModal.tsx     (Preview modal)
│   │   ├── TemplateApplyModal.tsx       (Apply mode selection)
│   │   └── index.ts                     (Barrel export)
│   └── vcard/
│       └── AestheticsTab.tsx            (Integration point)
├── services/
│   └── templateService.ts               (API client)
├── types/
│   └── modernProfile.types.ts           (Type definitions)
└── contexts/
    └── ProfileContext.tsx               (State management)
```

## Build & Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Test build
npm run preview

# The components are automatically included in the build
# No separate configuration needed
```

## Checklist for Implementation

- [x] Components created and typed
- [x] Service layer implemented
- [x] Integration with AestheticsTab
- [x] Full dark mode support
- [x] Mobile responsiveness
- [x] Accessibility compliance
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] TypeScript strict mode
- [x] Documentation complete
- [x] Build passing

## Next Steps

1. **Implement Backend API**
   - Create `/api/templates` endpoints
   - Set up template database schema
   - Implement application logic

2. **Add Test Coverage**
   - Unit tests for components
   - Integration tests for workflows
   - E2E tests for user flows

3. **Create Template Data**
   - Design 10-15 starter templates
   - Create preview images
   - Set metadata and descriptions

4. **Monitor Usage**
   - Track template applications
   - Collect user ratings
   - Gather feedback

## Support & Debugging

### Enable Debug Logging
```typescript
// In templateService.ts, uncomment for debugging:
console.log('Fetching templates:', filters);
console.log('Templates received:', data);
```

### Check Component Props
```tsx
// Add console.log in component
console.log('TemplateGallery props:', { onApplyTemplate, onPreviewTemplate });
```

### Network Inspection
Open DevTools → Network tab and look for:
- `GET /api/templates` - Template list requests
- `POST /api/templates/:id/apply` - Apply requests

## Documentation Files

1. **TEMPLATE_SYSTEM.md** - Complete system documentation
2. **TEMPLATE_IMPLEMENTATION_GUIDE.md** - Implementation details
3. **TEMPLATE_QUICK_START.md** - This file

---

**Ready to Use**: ✅ Yes
**Build Status**: ✅ Passing
**TypeScript**: ✅ Strict Mode
**Dark Mode**: ✅ Supported
**Mobile**: ✅ Responsive
