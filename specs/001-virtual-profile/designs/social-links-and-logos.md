# Social Links & Auto Logo Detection Design

**Feature**: Virtual Profile - Social Links Management
**Created**: December 2, 2025
**Status**: Design Specification

## Overview

This design document details the implementation of the social links system with automatic logo detection and management. Users can add up to 5 featured social profiles prominently displayed on their profile, plus unlimited custom links in an expandable section.

## User Experience Flow

### Adding Featured Social Links (Top 5)

```
1. User clicks "Add Social Link" button
2. System shows dropdown/autocomplete with known platforms:
   - LinkedIn
   - Twitter (X)
   - GitHub
   - Instagram
   - Facebook
   - TikTok
   - YouTube
   - Spotify
   - Medium
   - Behance
   - Dribbble
   - Twitch
   - Discord
   - Telegram
   - WhatsApp Business
   [+ more...]

3. User selects platform (e.g., "LinkedIn")
4. System shows:
   - Platform logo (auto-loaded) ✅
   - Input field: "Enter your LinkedIn profile URL or username"
   - Preview of how it will appear on profile

5. User enters URL: "https://linkedin.com/in/johndoe"
6. System validates URL format
7. Link added to "Featured Links" (max 5)
```

### Managing Featured Links

```
Featured Links (3/5):
┌─────────────────────────────────┐
│ 🔵 LinkedIn                     │  [Edit] [Remove]
│ linkedin.com/in/johndoe         │  [⬆️] [⬇️] (reorder)
├─────────────────────────────────┤
│ 🐦 Twitter                      │  [Edit] [Remove]
│ twitter.com/johndoe             │  [⬆️] [⬇️]
├─────────────────────────────────┤
│ 😺 GitHub                       │  [Edit] [Remove]
│ github.com/johndoe              │  [⬆️] [⬇️]
└─────────────────────────────────┘

[+ Add Featured Link] (visible when < 5)
```

### Adding Custom Links (Unlimited)

```
Custom Links (2):
┌─────────────────────────────────┐
│ 📦 My Portfolio                 │  [Edit] [Remove]
│ johndoe.design                  │  [Upload Logo]
├─────────────────────────────────┤
│ 🎨 Online Store                 │  [Edit] [Remove]
│ shop.johndoe.com                │  [Upload Logo]
└─────────────────────────────────┘

[+ Add Custom Link]

When adding:
- Link Title: [__________]
- Link URL: [__________]
- Logo: [Choose from library] or [Upload custom (PNG/SVG, max 500KB)]
```

## Logo System Architecture

### Logo Store Structure

```
/assets/social-logos/
├── linkedin.svg
├── twitter.svg
├── github.svg
├── instagram.svg
├── facebook.svg
├── tiktok.svg
├── youtube.svg
├── spotify.svg
├── medium.svg
├── behance.svg
├── dribbble.svg
├── twitch.svg
├── discord.svg
├── telegram.svg
├── whatsapp-business.svg
├── default-link.svg (fallback)
└── ... (expandable)
```

### Logo Detection Algorithm

```javascript
// Pseudo-code
function detectAndLoadLogo(url, platformName) {
  // 1. Platform name provided (from dropdown)
  if (platformName && KNOWN_PLATFORMS[platformName]) {
    return LOGO_STORE[platformName];
  }
  
  // 2. URL pattern matching
  const domain = extractDomain(url);
  const matches = [
    { pattern: /linkedin\.com/, logo: 'linkedin.svg' },
    { pattern: /twitter\.com|x\.com/, logo: 'twitter.svg' },
    { pattern: /github\.com/, logo: 'github.svg' },
    { pattern: /instagram\.com/, logo: 'instagram.svg' },
    // ... more patterns
  ];
  
  for (const match of matches) {
    if (match.pattern.test(domain)) {
      return LOGO_STORE[match.logo];
    }
  }
  
  // 3. Favicon fallback (optional)
  // Try to fetch favicon from the domain
  const faviconUrl = `https://${domain}/favicon.ico`;
  
  // 4. Default fallback
  return LOGO_STORE['default-link.svg'];
}
```

### Logo Storage Options

**Option 1: CDN-Hosted Static Assets** (Recommended for MVP)
- Store all logos as SVG files in `/public/assets/social-logos/`
- Serve via CDN for fast global delivery
- Version control with logo updates
- Pros: Simple, fast, no external dependencies
- Cons: Manual updates when adding new platforms

**Option 2: Third-Party Logo API**
- Use services like Clearbit Logo API, Brandfetch, or similar
- Fetch logos dynamically based on domain
- Pros: Always up-to-date, supports any domain
- Cons: External dependency, API costs, rate limits

**Option 3: Hybrid Approach** (Best for Scale)
- Use static CDN for known platforms (primary)
- Fall back to third-party API for unknown domains
- Cache fetched logos in object storage
- Pros: Best of both worlds, scalable
- Cons: More complex implementation

**Recommendation**: Start with Option 1 (static CDN) for MVP, migrate to Option 3 as user base grows.

## Data Model

### Database Schema

```sql
-- Featured Social Profiles (max 5 per user)
CREATE TABLE social_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_name VARCHAR(100) NOT NULL, -- 'LinkedIn', 'Twitter', etc.
  platform_url TEXT NOT NULL,
  logo_url TEXT NOT NULL, -- CDN URL to logo
  display_order INTEGER NOT NULL, -- 1-5 for featured
  is_featured BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT max_featured CHECK (
    (SELECT COUNT(*) FROM social_profiles 
     WHERE user_id = social_profiles.user_id 
     AND is_featured = true) <= 5
  )
);

-- Custom Links (unlimited)
CREATE TABLE custom_links (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  link_title VARCHAR(255) NOT NULL,
  link_url TEXT NOT NULL,
  custom_logo_url TEXT, -- User-uploaded or NULL
  display_order INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Logo Cache (for third-party fetched logos)
CREATE TABLE logo_cache (
  id UUID PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'cdn', 'api', 'user-upload'
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Cache TTL
  
  INDEX idx_domain (domain)
);
```

## Public Profile Display

### Mobile Layout (Featured Links)

```
┌─────────────────────────────┐
│  👤 John Doe                │
│  Software Engineer          │
│                             │
│  📧 john@example.com        │
│  📱 +1-555-0123             │
│                             │
│  Connect with me:           │
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ LI  │ │  X  │ │ GH  │  │ ← Touch-friendly
│  └─────┘ └─────┘ └─────┘  │   icons (60x60px)
│  ┌─────┐ ┌─────┐           │
│  │ IG  │ │ YT  │           │
│  └─────┘ └─────┘           │
│                             │
│  [⋯ More Links (2)]        │ ← Expandable
│                             │
│  [💾 Save as Contact]      │
└─────────────────────────────┘
```

### Desktop Layout (Featured Links)

```
┌───────────────────────────────────────────────┐
│                                               │
│         John Doe                              │
│         Software Engineer                     │
│                                               │
│  📧 john@example.com  📱 +1-555-0123          │
│                                               │
│  Connect:                                     │
│  [LI] LinkedIn  [X] Twitter  [GH] GitHub      │ ← Horizontal
│  [IG] Instagram  [YT] YouTube                 │   layout
│                                               │
│  ⋯ More Links (2) ▼                           │
│                                               │
│  [💾 Save as Contact]                         │
└───────────────────────────────────────────────┘
```

### Expanded "More Links" Section

```
More Links:
┌─────────────────────────────────┐
│ 📦 My Portfolio                 │ ← Custom logo
│ johndoe.design                  │
├─────────────────────────────────┤
│ 🎨 Online Store                 │
│ shop.johndoe.com                │
└─────────────────────────────────┘
```

## Logo Upload Specifications

### User-Uploaded Logos

**Accepted Formats**: PNG, SVG
**Max File Size**: 500KB
**Recommended Dimensions**: 
- Square: 512x512px minimum
- Will be displayed at: 60x60px (mobile), 40x40px (desktop)

**Upload Flow**:
1. User clicks "Upload Logo" for custom link
2. File picker opens (PNG/SVG only)
3. Client-side validation:
   - Check file type
   - Check file size (< 500KB)
   - Preview image
4. Upload to object storage (S3/R2)
5. Generate CDN URL
6. Save to `custom_links.custom_logo_url`

**Image Processing**:
- Resize to 512x512px (maintain aspect ratio)
- Compress PNG (lossy if needed to meet 500KB)
- Optimize SVG (remove unnecessary metadata)
- Generate WebP version for modern browsers

## Known Platforms Registry

### Platform Configuration

```javascript
const KNOWN_PLATFORMS = {
  linkedin: {
    name: 'LinkedIn',
    logo: 'linkedin.svg',
    urlPatterns: [/linkedin\.com\/in\//],
    placeholder: 'linkedin.com/in/username',
    color: '#0A66C2' // Brand color for UI
  },
  twitter: {
    name: 'Twitter',
    logo: 'twitter.svg',
    urlPatterns: [/twitter\.com\//, /x\.com\//],
    placeholder: 'twitter.com/username',
    color: '#1DA1F2'
  },
  github: {
    name: 'GitHub',
    logo: 'github.svg',
    urlPatterns: [/github\.com\//],
    placeholder: 'github.com/username',
    color: '#181717'
  },
  instagram: {
    name: 'Instagram',
    logo: 'instagram.svg',
    urlPatterns: [/instagram\.com\//],
    placeholder: 'instagram.com/username',
    color: '#E4405F'
  },
  // ... 20+ more platforms
};
```

### Adding New Platforms

To add a new known platform:

1. **Add SVG logo** to `/public/assets/social-logos/`
2. **Update registry** in `KNOWN_PLATFORMS` config
3. **Add URL validation** pattern
4. **Test** logo detection and display

This is a **living registry** - new platforms can be added without code changes by updating the config file.

## API Endpoints

### Social Profiles

```
POST   /api/users/:userId/social-profiles
GET    /api/users/:userId/social-profiles
PUT    /api/users/:userId/social-profiles/:profileId
DELETE /api/users/:userId/social-profiles/:profileId
PATCH  /api/users/:userId/social-profiles/reorder
```

### Custom Links

```
POST   /api/users/:userId/custom-links
GET    /api/users/:userId/custom-links
PUT    /api/users/:userId/custom-links/:linkId
DELETE /api/users/:userId/custom-links/:linkId
POST   /api/users/:userId/custom-links/:linkId/upload-logo
```

### Logo Detection

```
POST /api/logos/detect
Body: { url: "https://linkedin.com/in/johndoe" }
Response: { 
  platform: "linkedin",
  logoUrl: "https://cdn.app.com/logos/linkedin.svg",
  detectedBy: "url-pattern"
}
```

## Performance Considerations

### Logo Loading

- All social logos are SVG (small file size, scalable)
- Lazy load logos below the fold
- Preload featured social logos (top 5) for instant display
- Use CSS sprites for system logos (single request)

### Mobile Optimization

- Touch targets: 60x60px minimum (44x44px iOS guideline)
- Swipe gestures for reordering (drag handle)
- Haptic feedback on interactions
- Progressive enhancement (works without JS)

## Accessibility

- **Alt text** for all logos: `[Platform Name] profile link`
- **ARIA labels** for interactive elements
- **Keyboard navigation** for reordering links
- **Screen reader** announcements for add/remove actions
- **High contrast mode** support with SVG color overrides
- **Focus indicators** for all clickable elements

## Security Considerations

### URL Validation

```javascript
function validateProfileUrl(url) {
  // 1. Must be valid URL format
  if (!isValidUrl(url)) return false;
  
  // 2. Must use HTTPS (except localhost for testing)
  if (!url.startsWith('https://')) return false;
  
  // 3. Prevent javascript: and data: URLs
  if (url.match(/^(javascript|data):/i)) return false;
  
  // 4. Sanitize for XSS
  url = sanitizeUrl(url);
  
  // 5. Check against blacklist (spam domains)
  if (BLACKLISTED_DOMAINS.includes(extractDomain(url))) {
    return false;
  }
  
  return true;
}
```

### Logo Upload Security

- Validate file type (magic number, not just extension)
- Scan for malware (if SVG, parse and sanitize XML)
- Strip EXIF data from images
- Rate limit uploads (5 per hour per user)
- Virus scan on upload
- Store in isolated object storage (not web server)

## Testing Strategy

### Unit Tests

- Logo detection algorithm (20+ platforms)
- URL validation (valid/invalid cases)
- Display order logic (reordering)
- File upload validation

### Integration Tests

- Add/edit/delete social profiles
- Featured links limit enforcement (max 5)
- Custom link uploads
- Public profile rendering

### E2E Tests

- Complete user flow: Add LinkedIn → Preview → Publish → View public profile
- Mobile responsive layout
- Logo fallback scenarios
- Accessibility (keyboard navigation, screen reader)

## Migration & Rollout

### Phase 1: Featured Links (MVP)
- 5 featured social links
- Auto logo detection for 15+ platforms
- Static CDN-hosted logos

### Phase 2: Custom Links
- Unlimited custom links
- User logo uploads
- Expandable "More Links" section

### Phase 3: Advanced Features
- Third-party logo API integration
- Animated logos (subtle hover effects)
- Link analytics (clicks per link)
- Link verification (prove ownership)

## Success Metrics

- **Adoption**: % of users who add at least 1 social link
- **Engagement**: Average number of links per profile (target: 3-5)
- **Featured vs Custom**: Ratio of featured to custom links
- **Logo Detection Rate**: % of links with auto-detected logos (target: 90%+)
- **Mobile Clicks**: CTR on social links (mobile vs desktop)
- **Time to Add Link**: Average time from click to save (target: < 30 seconds)

---

## Implementation Checklist

- [ ] Create `/assets/social-logos/` directory with 15+ SVG logos
- [ ] Implement logo detection algorithm
- [ ] Build `social_profiles` and `custom_links` tables
- [ ] Create API endpoints for CRUD operations
- [ ] Build UI for adding/editing social links
- [ ] Implement logo upload for custom links
- [ ] Build public profile display (mobile-first)
- [ ] Add reordering functionality (drag & drop)
- [ ] Implement URL validation and sanitization
- [ ] Add accessibility features (ARIA, keyboard nav)
- [ ] Write unit and integration tests
- [ ] Performance testing (logo load times)
- [ ] Security audit (XSS, file uploads)
- [ ] Deploy to staging and user acceptance testing
