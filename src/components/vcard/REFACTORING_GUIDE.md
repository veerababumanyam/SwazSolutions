# vCard Links Editor - Refactoring Guide

## Overview

This guide demonstrates how the existing `LinksEditor.tsx` page component would be refactored to use the newly extracted vCard components, reducing code duplication and improving maintainability.

## Extracted Components

### 1. **SortableLinkItem.tsx**
Individual link/block item with drag handle and action buttons.

**Location:** `src/components/vcard/links/SortableLinkItem.tsx`

**Props:**
```typescript
interface SortableLinkItemProps {
  link: LinkItem;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string) => void;
}
```

**Features:**
- @dnd-kit/sortable integration (drag handle)
- Visibility toggle (Eye/EyeOff icons)
- Edit button
- Delete button with confirmation
- Active state visual indicator
- Full dark mode support
- Accessibility: ARIA labels, keyboard support

### 2. **AddLinkMenu.tsx**
Modal dialog for selecting link/block type to add.

**Location:** `src/components/vcard/links/AddLinkMenu.tsx`

**Props:**
```typescript
interface AddLinkMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: LinkType) => void;
}
```

**Features:**
- 6 link type options (CLASSIC, HEADER, GALLERY, VIDEO_EMBED, VIDEO_UPLOAD, BOOKING)
- Icon grid layout
- Smooth Framer Motion animations
- Backdrop click to close
- Full keyboard accessibility
- Dark mode support

### 3. **LinksPanel.tsx**
Main container managing the drag-and-drop list of links.

**Location:** `src/components/vcard/links/LinksPanel.tsx`

**Props:**
```typescript
interface LinksPanelProps {
  links: LinkItem[];
  onAddClick: () => void;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string) => void;
  onReorder: (newOrder: LinkItem[]) => Promise<void>;
  isLoading?: boolean;
}
```

**Features:**
- @dnd-kit DndContext with PointerSensor and KeyboardSensor
- Drag-and-drop reordering with backend sync
- Haptic feedback on interactions
- Staggered Framer Motion animations
- Empty state with CTA
- Handles all link operations (edit, delete, toggle active)
- Full dark mode support

### 4. **Shared Utilities**
Helper functions for link type icons, labels, and descriptions.

**Location:** `src/components/vcard/shared/linkTypeUtils.ts`

**Exports:**
- `getLinkTypeIcon(type: LinkType): string`
- `getLinkTypeLabel(type: LinkType): string`
- `getLinkTypeDescription(type: LinkType): string`

---

## Refactored LinksEditor.tsx

This demonstrates how `src/pages/LinksEditor.tsx` would be refactored using the new components:

```typescript
/**
 * LinksEditor - Refactored version using extracted vCard components
 * Reduced from 330+ lines to ~150 lines
 * Maintains all existing functionality
 */

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { LinkType } from '@/types/modernProfile.types';
import { LinksPanel, AddLinkMenu } from '@/components/vcard/links';
import { useHaptic } from '@/hooks/useHaptic';
import { LinkItemEditor } from '@/components/profile/LinkItemEditor';

const LinksEditor: React.FC = () => {
  // Context hooks
  const { links, addLink, reorderLinks, updateLink, removeLink } = useProfile();
  const { trigger } = useHaptic();

  // Local state
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  /**
   * Add new link of specified type
   */
  const handleAddLink = async (type: LinkType) => {
    await addLink(type);
    setShowAddMenu(false);
    trigger(10);
  };

  /**
   * Open edit modal for link
   */
  const handleEdit = (linkId: string) => {
    setEditingLinkId(linkId);
    trigger(10);
  };

  /**
   * Delete link with confirmation
   */
  const handleDelete = async (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      await removeLink(linkId);
      trigger(20);
    }
  };

  /**
   * Toggle link visibility
   */
  const handleToggleActive = async (linkId: string) => {
    const link = links.find((l) => l.id === linkId);
    if (link) {
      await updateLink(linkId, { isActive: !link.isActive });
      trigger(10);
    }
  };

  /**
   * Reorder links via backend sync
   */
  const handleReorderLinks = async (newOrder) => {
    await reorderLinks(newOrder);
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Portfolio Links
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage your links, galleries, and content blocks
            </p>
          </div>
          <button
            onClick={() => setShowAddMenu(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Plus size={18} />
            <span className="font-medium">Add Block</span>
          </button>
        </div>
      </div>

      {/* Main Links Panel - Handles all list functionality */}
      <LinksPanel
        links={links}
        onAddClick={() => setShowAddMenu(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onReorder={handleReorderLinks}
      />

      {/* Add Link Type Modal */}
      <AddLinkMenu
        isOpen={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onSelectType={handleAddLink}
      />

      {/* Link Item Editor Modal */}
      {editingLinkId && (
        <LinkItemEditor
          linkId={editingLinkId}
          onClose={() => setEditingLinkId(null)}
          onSave={() => {
            setEditingLinkId(null);
            trigger(20);
          }}
        />
      )}
    </div>
  );
};

export default LinksEditor;
```

---

## Key Improvements

### 1. **Separation of Concerns**
- ✅ LinksEditor focuses on orchestration and page-level logic
- ✅ LinksPanel handles list rendering and drag-drop
- ✅ SortableLinkItem handles individual item display
- ✅ AddLinkMenu handles type selection

### 2. **Code Reusability**
- ✅ Each component can be used independently
- ✅ Utilities (linkTypeUtils) are shared
- ✅ No duplication of drag-drop logic
- ✅ Consistent styling and animations across app

### 3. **Reduced Lines of Code**
- **Before:** 330+ lines in LinksEditor.tsx
- **After:** ~150 lines in LinksEditor.tsx
- **Extracted:** ~600 lines in reusable components

### 4. **Maintainability**
- ✅ Single responsibility principle
- ✅ Easier to test individual components
- ✅ Changes to styling/behavior isolated to component
- ✅ Clear prop interfaces for each component

### 5. **Testability**
- ✅ SortableLinkItem: Unit test drag behavior, visibility toggle, delete confirmation
- ✅ AddLinkMenu: Unit test type selection, modal animations, keyboard handling
- ✅ LinksPanel: Integration test drag-drop reordering, empty state
- ✅ LinksEditor: Integration test full workflow (add, edit, delete, reorder)

---

## Migration Checklist

To migrate the existing LinksEditor.tsx:

- [ ] Import the new components from `@/components/vcard/links`
- [ ] Replace local state management with new component props
- [ ] Replace SortableLinkItem JSX with `<SortableLinkItem />` component
- [ ] Replace modal JSX with `<AddLinkMenu />` component
- [ ] Replace DndContext+SortableContext with `<LinksPanel />` component
- [ ] Update event handlers to match new component prop signatures
- [ ] Test all interactions (drag, add, edit, delete, toggle, reorder)
- [ ] Verify dark mode works correctly
- [ ] Verify haptic feedback triggers appropriately
- [ ] Test on mobile (touch, keyboard navigation)
- [ ] Run accessibility audit (axe, keyboard nav)
- [ ] Update unit/integration tests

---

## File Structure

```
src/components/vcard/
├── links/
│   ├── SortableLinkItem.tsx    # Individual item component
│   ├── AddLinkMenu.tsx         # Type selection modal
│   ├── LinksPanel.tsx          # Main list container
│   └── index.ts                # Barrel export
├── shared/
│   └── linkTypeUtils.ts        # Shared utilities
└── index.ts                    # Main barrel export

src/pages/
└── LinksEditor.tsx             # Refactored page (150 lines)
```

---

## Import Examples

```typescript
// Import individual components
import { SortableLinkItem, AddLinkMenu, LinksPanel } from '@/components/vcard/links';

// Or from main barrel export
import { SortableLinkItem, AddLinkMenu, LinksPanel } from '@/components/vcard';

// Import utilities
import { getLinkTypeIcon, getLinkTypeLabel, getLinkTypeDescription } from '@/components/vcard';
```

---

## Component Props Reference

### SortableLinkItem

```typescript
interface SortableLinkItemProps {
  // The link data to display
  link: LinkItem;

  // Callback when edit button clicked
  onEdit: (linkId: string) => void;

  // Callback when delete button clicked
  onDelete: (linkId: string) => void;

  // Callback when visibility toggle clicked
  onToggleActive: (linkId: string) => void;
}
```

### AddLinkMenu

```typescript
interface AddLinkMenuProps {
  // Whether modal is visible
  isOpen: boolean;

  // Callback when close is triggered
  onClose: () => void;

  // Callback when a type is selected
  onSelectType: (type: LinkType) => void;
}
```

### LinksPanel

```typescript
interface LinksPanelProps {
  // Array of links to display
  links: LinkItem[];

  // Callback when "Add Block" button clicked
  onAddClick: () => void;

  // Callback when edit button clicked
  onEdit: (linkId: string) => void;

  // Callback when delete button clicked
  onDelete: (linkId: string) => void;

  // Callback when visibility toggle clicked
  onToggleActive: (linkId: string) => void;

  // Callback when links are reordered (receives new order)
  onReorder: (newOrder: LinkItem[]) => Promise<void>;

  // Optional loading state
  isLoading?: boolean;
}
```

---

## Accessibility Features

All components include:
- ✅ ARIA labels and roles (`aria-label`, `aria-modal`, `role="dialog"`)
- ✅ Semantic HTML (`<button>`, `<div role="presentation">`)
- ✅ Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ✅ Focus management and visible focus indicators
- ✅ Color contrast compliance (WCAG AA)
- ✅ Touch target size (44px minimum)
- ✅ Haptic feedback for interactions

---

## Dark Mode Support

All components fully support dark mode via Tailwind's `dark:` prefix:
- ✅ Background colors adjusted
- ✅ Text colors adjusted
- ✅ Border colors adjusted
- ✅ Hover states adjusted
- ✅ Shadows adjusted

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Dependencies:**
- React 19+ (with hooks support)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- framer-motion
- lucide-react (icons)
- TailwindCSS 3+
