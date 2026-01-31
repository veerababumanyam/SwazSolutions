# Template System Documentation

## Overview

The Template System is a comprehensive template discovery and application interface that allows users to browse, preview, and apply pre-configured vCard templates to their profiles. It's integrated into the Aesthetics tab and provides three different application modes.

## Components

### 1. TemplateGallery (`src/components/templates/TemplateGallery.tsx`)

Main browsing interface for discovering templates.

**Features:**
- Category filtering (Personal, Business, Portfolio, Event, etc.)
- Full-text search by name, description, and tags
- Sorting options (Popular, Recent, A-Z)
- Pagination (20 templates per page)
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Template cards with thumbnails, metadata, and ratings
- Loading and error states
- Empty state handling

**Props:**
```typescript
interface TemplateGalleryProps {
  onApplyTemplate: (templateId: string, mode: 'replace' | 'merge' | 'theme-only') => void;
  onPreviewTemplate: (templateId: string) => void;
}
```

**API Calls:**
- `GET /api/templates` - Fetch templates with filters
- `GET /api/templates?category=personal` - Filter by category
- `GET /api/templates?search=query` - Search templates

**Usage:**
```tsx
import { TemplateGallery } from '@/components/templates';

export function MyComponent() {
  const handlePreview = (templateId: string) => {
    // Open preview modal
  };

  const handleApply = (templateId: string, mode: string) => {
    // Apply template
  };

  return (
    <TemplateGallery
      onPreviewTemplate={handlePreview}
      onApplyTemplate={handleApply}
    />
  );
}
```

### 2. TemplatePreviewModal (`src/components/templates/TemplatePreviewModal.tsx`)

Detailed preview of a template before application.

**Features:**
- Template name, description, category
- Statistics (usage count, rating)
- Two preview tabs:
  - **Theme Preview**: Shows color palette, typography samples, button styles
  - **Block Types**: Lists all block types included in the template
- Visual color swatches with hex codes
- Typography examples with family and weight info
- Block type icons and descriptions
- Required block indicators
- Apply button that opens apply mode selection
- Smooth modal animations
- Keyboard accessible (ESC to close)

**Props:**
```typescript
interface TemplatePreviewModalProps {
  template: VCardTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
}
```

**Keyboard Navigation:**
- ESC - Close modal
- Tab - Navigate through content
- Enter - Trigger apply action

**Usage:**
```tsx
import { TemplatePreviewModal } from '@/components/templates';

export function MyComponent() {
  const [template, setTemplate] = useState<VCardTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TemplatePreviewModal
      template={template}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onApply={(templateId) => {
        // Handle application
      }}
    />
  );
}
```

### 3. TemplateApplyModal (`src/components/templates/TemplateApplyModal.tsx`)

Mode selection and confirmation for template application.

**Features:**
- Three application modes:
  1. **Replace**: Clear all blocks and use template blocks (with confirmation)
  2. **Merge**: Keep existing blocks, add template blocks, update theme (recommended)
  3. **Theme-Only**: Apply only styling, keep all content
- Clear descriptions for each mode
- Conditional options based on mode:
  - Replace: Confirmation checkbox required
  - Merge: Keep existing blocks, keep social profiles (toggles)
  - Theme-Only: No additional options
- Mode-specific warnings and info messages
- Loading state during application
- Toast notifications for success/error

**Props:**
```typescript
interface TemplateApplyModalProps {
  template: VCardTemplate;
  hasExistingBlocks: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApply: (
    mode: 'replace' | 'merge' | 'theme-only',
    options: ApplyOptions
  ) => Promise<void>;
}

interface ApplyOptions {
  keepExistingBlocks?: boolean;
  keepSocialProfiles?: boolean;
}
```

**Usage:**
```tsx
import { TemplateApplyModal } from '@/components/templates';

export function MyComponent() {
  const [template, setTemplate] = useState<VCardTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = async (mode: string, options: ApplyOptions) => {
    await templateService.applyTemplate(template.id, mode, options);
  };

  return (
    <TemplateApplyModal
      template={template}
      hasExistingBlocks={links.length > 0}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onApply={handleApply}
    />
  );
}
```

## Services

### TemplateService (`src/services/templateService.ts`)

API client for all template-related operations.

**Methods:**

```typescript
// Fetch all templates with optional filtering
getTemplates(filters?: TemplateFilterOptions): Promise<{
  templates: VCardTemplate[];
  total: number;
  pages: number;
}>

// Get a specific template by ID
getTemplate(templateId: string): Promise<VCardTemplate>

// Get templates by category
getTemplatesByCategory(category: TemplateCategory): Promise<VCardTemplate[]>

// Get featured templates
getFeaturedTemplates(limit?: number): Promise<VCardTemplate[]>

// Apply a template to user's profile
applyTemplate(
  templateId: string,
  mode: 'replace' | 'merge' | 'theme-only',
  options?: ApplyOptions
): Promise<{ message: string; appliedAt: string }>

// Track template usage
trackTemplateUsage(templateId: string): Promise<TemplateUsage>

// Rate a template (1-5)
rateTemplate(templateId: string, rating: number): Promise<{ message: string; rating: number }>

// Get user's applied templates
getAppliedTemplates(): Promise<{ templates: VCardTemplate[]; total: number }>

// Get available categories
getTemplateCategories(): Promise<TemplateCategory[]>

// Search templates
searchTemplates(query: string, limit?: number): Promise<VCardTemplate[]>
```

**Error Handling:**
All methods include comprehensive error handling with appropriate error messages. Failed requests will throw an Error with a descriptive message.

**Usage:**
```typescript
import { templateService } from '@/services/templateService';

// Fetch templates
const { templates, total } = await templateService.getTemplates({
  category: 'business',
  sortBy: 'usageCount',
  limit: 20
});

// Apply template
await templateService.applyTemplate('template-123', 'merge', {
  keepExistingBlocks: true,
  keepSocialProfiles: true
});

// Rate template
await templateService.rateTemplate('template-123', 5);
```

## Integration with AestheticsTab

The template system is integrated into the Aesthetics tab of the vCard editor:

**Location:** `src/components/vcard/AestheticsTab.tsx`

**Features:**
- Browse Templates section at the top
- Shows currently applied template (if any)
- Ability to browse other templates
- Template Gallery component embedded
- Template Preview Modal for detailed preview
- Template Apply Modal for mode selection
- Integration with existing theme system

**State Management:**
- Uses ProfileContext for profile data
- Uses ToastContext for notifications
- Local state for modals and previewing

## Types

### VCardTemplate
```typescript
interface VCardTemplate {
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
type TemplateCategory =
  | 'personal'
  | 'business'
  | 'portfolio'
  | 'event'
  | 'restaurant'
  | 'real-estate'
  | 'healthcare'
  | 'education'
  | 'nonprofit'
  | 'entertainment'
  | 'custom';
```

### TemplateFilterOptions
```typescript
interface TemplateFilterOptions {
  category?: TemplateCategory;
  isPremium?: boolean;
  isFeatured?: boolean;
  searchQuery?: string;
  sortBy?: 'name' | 'usageCount' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}
```

## Styling

All components use TailwindCSS with full dark mode support.

**Color Scheme:**
- Primary: Blue-500 (#3B82F6)
- Success: Green-500 (#10B981)
- Warning: Red-500 (#EF4444)
- Dark backgrounds: Gray-900 (#111827)
- Light backgrounds: White (#FFFFFF)

**Responsive Breakpoints:**
- Mobile: Default (1 column)
- Tablet (md): 2 columns
- Desktop (lg): 3 columns

## Accessibility

All components include:
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly descriptions
- Color contrast compliance (WCAG AA)

## Performance Optimizations

- Image lazy loading with `loading="lazy"`
- Debounced search (300ms)
- Pagination to limit rendered items
- Motion animations with Framer Motion for smooth UX
- Optimistic UI updates where applicable

## API Endpoints

### Backend Routes Required

```bash
# Get all templates
GET /api/templates
Query params: category, search, isPremium, isFeatured, sortBy, sortOrder, offset, limit

# Get single template
GET /api/templates/:templateId

# Apply template
POST /api/templates/:templateId/apply
Body: { mode, keepExistingBlocks?, keepSocialProfiles? }

# Track usage
POST /api/templates/:templateId/usage

# Rate template
POST /api/templates/:templateId/rate
Body: { rating: number }

# Get user's applied templates
GET /api/templates/me/applied

# Get categories
GET /api/templates/categories
```

## Error Handling

All components include:
- Loading states with spinner animation
- Error states with retry button
- Empty states with helpful messages
- Toast notifications for actions
- Proper error propagation

## Future Enhancements

1. **Template Creation**: Allow users to create custom templates
2. **Template Sharing**: Share templates with other users
3. **AI Template Generation**: Generate templates based on user preferences
4. **Template Variations**: Show variants of each template
5. **Preview Customization**: Interactive preview editor
6. **Template Analytics**: Track which templates are most popular
7. **Recommendations**: Suggest templates based on user profile
8. **Template Scheduling**: Apply templates at specific times

## Troubleshooting

### Templates not loading
- Check API endpoint `/api/templates` is accessible
- Verify user is authenticated if accessing private templates
- Check browser console for error messages

### Template not applying
- Ensure template data includes defaultTheme if applying theme
- Check backend has implemented template application logic
- Verify user has necessary permissions

### Modal not opening
- Ensure onPreviewTemplate callback is properly connected
- Check that template data is properly initialized
- Verify modal state is being updated correctly

## Related Documentation

- [vCard Profile System](./VCARD_PROFILE.md)
- [Theme System](./THEME_SYSTEM.md)
- [Profile Context](./CONTEXT_DOCUMENTATION.md)
- [API Documentation](./API.md)
