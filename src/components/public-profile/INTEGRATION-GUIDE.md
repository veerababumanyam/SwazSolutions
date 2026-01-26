# Modern vCard Suite - Link Rendering Integration Guide

## Overview
This guide explains how to integrate the new `LinkItemRenderer` component into existing profile renderers to support all 6 link types.

## Quick Integration Steps

### 1. Import the new components

```typescript
import { LinkItemRenderer } from './LinkItemRenderer';
import { LinkItem, LinkType } from '@/types/modernProfile.types';
```

### 2. Convert legacy SocialLink to LinkItem (if needed)

If you're working with legacy `SocialLink[]` data, add a conversion helper:

```typescript
const convertToLinkItem = (socialLink: SocialLink): LinkItem => ({
  id: socialLink.id.toString(),
  type: LinkType.CLASSIC,
  title: socialLink.displayLabel || 'Link',
  url: socialLink.url,
  thumbnail: socialLink.customLogo || undefined,
  isActive: socialLink.isFeatured,
  clicks: socialLink.clicks || 0,
  platform: (socialLink.platform as any) || 'generic'
});
```

### 3. Replace renderLinkCard usage

**Before:**
```typescript
{links.map((link) => renderLinkCard(link))}
```

**After:**
```typescript
{links.map((link) => (
  <LinkItemRenderer
    key={link.id}
    link={convertToLinkItem(link)} // or use link directly if already LinkItem
    buttonStyle={buttonStyle}
    shadowClass={shadowClass}
    cornerRadius={settings.cornerRadius}
    isDarkBg={isDarkBg}
    textColor={textColor}
  />
))}
```

## Full Example: ProfileRenderer.tsx

```typescript
import { LinkItemRenderer } from './LinkItemRenderer';
import { LinkItem, LinkType } from '@/types/modernProfile.types';

// ... inside component ...

// Helper to convert legacy data
const convertToLinkItem = (socialLink: SocialLink): LinkItem => ({
  id: socialLink.id.toString(),
  type: LinkType.CLASSIC,
  title: socialLink.displayLabel || 'Link',
  url: socialLink.url,
  thumbnail: socialLink.customLogo || undefined,
  isActive: socialLink.isFeatured,
  clicks: socialLink.clicks || 0,
  platform: (socialLink.platform as any) || 'generic'
});

// ... in render ...

{/* Links Section */}
<div className="space-y-3 mt-8">
  {links.map((link) => (
    <LinkItemRenderer
      key={link.id}
      link={convertToLinkItem(link)}
      buttonStyle={buttonStyle}
      shadowClass={shadowClass}
      cornerRadius={settings.cornerRadius}
      isDarkBg={isDarkBg}
      textColor={nameColor}
    />
  ))}
</div>
```

## Rendering Logic by LinkType

The `LinkItemRenderer` automatically handles all 6 types:

| Type | Rendering |
|------|-----------|
| **CLASSIC** | Standard button with icon/thumbnail |
| **HEADER** | Section heading (text only) |
| **GALLERY** | Uses `GalleryRenderer` with grid/carousel/list layouts |
| **VIDEO_EMBED** | Embeds YouTube, Vimeo, TikTok videos |
| **VIDEO_UPLOAD** | Uses `VideoRenderer` for uploaded videos |
| **BOOKING** | Special button with calendar icon |

## Props Reference

```typescript
interface LinkItemRendererProps {
  link: LinkItem;                  // The link item to render
  buttonStyle?: string;            // Tailwind classes for button styling
  shadowClass?: string;            // Shadow classes
  cornerRadius?: number;           // Border radius in pixels
  isDarkBg?: boolean;             // Dark background optimization
  textColor?: string;             // Text color for headers
}
```

## Feature Flags

If you need to gradually roll out features, use type checking:

```typescript
{links.map((link) => {
  const linkItem = convertToLinkItem(link);

  // Only render new types if feature flag is enabled
  if ([LinkType.GALLERY, LinkType.VIDEO_UPLOAD, LinkType.VIDEO_EMBED].includes(linkItem.type)) {
    if (!featureFlags.modernLinks) {
      return null; // Skip rendering
    }
  }

  return (
    <LinkItemRenderer
      key={link.id}
      link={linkItem}
      // ... props
    />
  );
})}
```

## Testing Checklist

- [ ] CLASSIC links render as before
- [ ] HEADER creates section dividers
- [ ] GALLERY shows images with lightbox
- [ ] VIDEO_EMBED loads YouTube/Vimeo iframes
- [ ] VIDEO_UPLOAD plays uploaded videos
- [ ] BOOKING shows calendar icon
- [ ] Click tracking works
- [ ] Dark mode compatibility
- [ ] Mobile responsiveness

## Notes

1. **Backward Compatibility**: The `LinkItemRenderer` is fully backward compatible with CLASSIC links.

2. **Performance**: Gallery and video components lazy-load content.

3. **Analytics**: Click tracking is built-in via the `trackClick()` function.

4. **Accessibility**: All components follow WCAG 2.1 AA standards.

5. **Responsive**: Components adapt to mobile and desktop viewports.
