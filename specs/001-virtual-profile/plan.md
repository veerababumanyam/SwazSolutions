# Implementation Plan: Virtual Profile & Smart Sharing

**Feature**: Virtual Profile & Smart Sharing  
**Branch**: `001-virtual-profile`  
**Created**: December 2, 2025  
**Status**: Planning

## Technology Stack

### Frontend
- **Framework**: React 18+ (existing in workspace - see src/App.tsx)
- **Routing**: React Router v6 (for /u/{username} public routes)
- **Styling**: Tailwind CSS (existing in workspace - see tailwind.config.cjs)
- **State Management**: React Context API (existing - see src/contexts/)
- **Build Tool**: Vite (existing - see vite.config.ts)
- **Responsive Breakpoints**: 320px (mobile), 768px (tablet), 1024px (desktop), 1920px (max-width)

### Backend
- **Runtime**: Node.js + Express (existing - see backend/server.js)
- **Database**: SQLite (existing in workspace) → Consider PostgreSQL for production
- **ORM**: Custom SQL queries (see backend/config/database.js)
- **File Storage**: Local filesystem → Cloudflare R2 or AWS S3 for production
- **Authentication**: Existing auth system (backend/middleware/auth.js)

### Libraries & Tools
- **QR Code Generation**: `qrcode` (npm package)
- **vCard Generation**: `vcard-creator` (npm package)
- **Image Processing**: `sharp` (server-side compression/optimization)
- **AI Integration**: OpenAI API or Claude API (for theme generation)
- **Analytics**: Custom implementation with batch processing

## Project Structure

```
src/
├── pages/
│   ├── ProfileEditor.tsx        # Authenticated profile creation/editing
│   ├── PublicProfile.tsx        # Guest-facing profile view (/u/{username})
│   ├── ProfileDashboard.tsx     # User's profile management dashboard
│   └── ProfileAnalytics.tsx     # Analytics view for profile owner
├── components/
│   ├── profile/
│   │   ├── ProfileForm.tsx      # Profile information form
│   │   ├── SocialLinksManager.tsx  # Featured + custom links management
│   │   ├── ThemeSelector.tsx    # Theme gallery and selection
│   │   ├── ThemeCustomizer.tsx  # Manual theme customization
│   │   ├── AIThemeGenerator.tsx # AI theme generation dialog
│   │   ├── QRCodeModal.tsx      # QR code display and download
│   │   └── SharePanel.tsx       # Multi-channel sharing options
│   └── public-profile/
│       ├── ProfileCard.tsx      # Main profile display component
│       ├── SocialLinks.tsx      # Social links display
│       ├── ContactButton.tsx    # vCard download button
│       └── ThemeRenderer.tsx    # Dynamic theme application
├── services/
│   ├── profileService.ts        # Profile CRUD API calls
│   ├── themeService.ts          # Theme management API
│   ├── qrCodeService.ts         # QR code generation
│   ├── vCardService.ts          # vCard generation
│   ├── shareService.ts          # Share functionality
│   └── analyticsService.ts      # Analytics tracking
├── hooks/
│   ├── useProfile.ts            # Profile data fetching
│   ├── useTheme.ts              # Theme management
│   └── useShareTracking.ts     # Share event tracking
└── utils/
    ├── logoDetector.ts          # Auto logo detection
    ├── urlValidator.ts          # URL validation and sanitization
    └── imageOptimizer.ts        # Client-side image utilities

backend/
├── routes/
│   ├── publicProfiles.js        # Public profile routes (no auth)
│   ├── profiles.js              # Authenticated profile routes
│   ├── themes.js                # Theme management routes
│   ├── social-links.js          # Social links CRUD
│   ├── qr-codes.js              # QR code generation
│   ├── vcards.js                # vCard generation
│   └── analytics.js             # Analytics endpoints
├── services/
│   ├── vCardGenerator.js        # Server-side vCard creation
│   ├── qrCodeGenerator.js       # Server-side QR generation
│   ├── imageProcessor.js        # Sharp-based image optimization
│   ├── logoService.js           # Logo detection and fetching
│   ├── aiThemeService.js        # OpenAI/Claude integration
│   └── analyticsProcessor.js    # Daily batch analytics
├── middleware/
│   ├── publicAccess.js          # No-auth middleware for public profiles
│   ├── profileOwnership.js      # Verify user owns profile
│   └── rateLimit.js             # Rate limiting for uploads/AI
└── migrations/
    ├── 001_create_profiles.sql
    ├── 002_create_social_links.sql
    ├── 003_create_themes.sql
    ├── 004_create_analytics.sql
    └── 005_create_qr_codes.sql

public/
└── assets/
    └── social-logos/              # CDN-ready social platform logos
        ├── linkedin.svg
        ├── twitter.svg
        ├── github.svg
        └── ... (15+ logos)
```

## Database Schema

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar_url TEXT,
  headline VARCHAR(200),
  company VARCHAR(100),
  bio TEXT,
  profile_tags TEXT[], -- or JSON
  public_email VARCHAR(100),
  public_phone VARCHAR(20),
  website TEXT,
  languages TEXT[], -- or JSON
  pronouns VARCHAR(50),
  timezone VARCHAR(50),
  contact_preferences TEXT,
  
  -- Privacy settings
  published BOOLEAN DEFAULT false,
  indexing_opt_in BOOLEAN DEFAULT false,
  
  -- Theme
  active_theme_id UUID REFERENCES themes(id),
  background_image_url TEXT,
  logo_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]{3,50}$')
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_published ON profiles(published) WHERE published = true;
```

### social_profiles table
```sql
CREATE TABLE social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform_name VARCHAR(100) NOT NULL,
  platform_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT max_featured CHECK (
    display_order <= 5 OR is_featured = false
  )
);

CREATE INDEX idx_social_profiles_profile ON social_profiles(profile_id);
```

### custom_links table
```sql
CREATE TABLE custom_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  link_title VARCHAR(255) NOT NULL,
  link_url TEXT NOT NULL,
  custom_logo_url TEXT,
  display_order INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_links_profile ON custom_links(profile_id);
```

### themes table
```sql
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- NULL for system themes
  theme_name VARCHAR(100) NOT NULL,
  theme_type VARCHAR(50) NOT NULL, -- 'system', 'custom', 'ai-generated'
  category VARCHAR(50), -- 'professional', 'creative', 'minimal', 'bold'
  colors JSONB NOT NULL,
  typography JSONB NOT NULL,
  layout JSONB NOT NULL,
  avatar JSONB NOT NULL,
  background_image_url TEXT,
  logo_url TEXT,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_themes_type ON themes(theme_type);
CREATE INDEX idx_themes_user ON themes(user_id);
```

### Analytics tables
```sql
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_ip_hash VARCHAR(64) NOT NULL,
  referrer TEXT,
  device_type VARCHAR(20),
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  share_channel VARCHAR(50) NOT NULL,
  source_location VARCHAR(20),
  ip_hash VARCHAR(64),
  shared_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vcard_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_type VARCHAR(20),
  ip_hash VARCHAR(64),
  downloaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  vcard_downloads INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  qr_scans INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(profile_id, date)
);
```

### qr_codes table
```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_url TEXT NOT NULL,
  image_url_png TEXT NOT NULL,
  image_url_svg TEXT NOT NULL,
  customization JSONB,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Cache TTL: 30 days or until username change
);

CREATE INDEX idx_qr_codes_profile ON qr_codes(profile_id);
```

**Naming Convention**: Use snake_case for database column names (profile_id, display_name), camelCase for API contracts and frontend code (profileId, displayName). This ensures SQL compatibility while maintaining JavaScript conventions.

## API Contracts

### Public Profile Routes (No Auth Required)

```
GET /api/public/profile/:username
  Response: { profile, socialProfiles, customLinks, theme }
  Status: 200 (success), 404 (not found/unpublished)

GET /api/public/profile/:username/vcard
  Response: vCard file (.vcf)
  Status: 200, 404

POST /api/public/profile/:username/view
  Body: { referrer?, deviceType?, location? }
  Response: { tracked: true }
  Status: 200
```

### Authenticated Profile Routes

```
GET /api/profiles/me
  Response: { profile, socialProfiles, customLinks, theme }
  Status: 200

POST /api/profiles
  Body: { username, displayName, firstName?, lastName?, ... }
  Response: { profile }
  Status: 201, 400 (validation), 409 (username taken)

PUT /api/profiles/me
  Body: { displayName?, headline?, bio?, ... }
  Response: { profile }
  Status: 200, 400

DELETE /api/profiles/me
  Response: { deleted: true }
  Status: 200

PATCH /api/profiles/me/publish
  Body: { published: boolean }
  Response: { profile }
  Status: 200

POST /api/profiles/me/username-check
  Body: { username }
  Response: { available: boolean, suggestions?: string[] }
  Status: 200
```

### Social Links Routes

```
GET /api/profiles/me/social-links
  Response: { featured: [], custom: [] }
  Status: 200

POST /api/profiles/me/social-links
  Body: { platformName, platformUrl, isFeatured }
  Response: { socialProfile }
  Status: 201, 400

PUT /api/profiles/me/social-links/:id
  Body: { platformUrl?, displayOrder? }
  Response: { socialProfile }
  Status: 200

DELETE /api/profiles/me/social-links/:id
  Status: 204

POST /api/profiles/me/social-links/reorder
  Body: { linkIds: [] }
  Response: { success: true }
  Status: 200

POST /api/profiles/me/social-links/detect-logo
  Body: { url }
  Response: { platform?, logoUrl, detectedBy }
  Status: 200
```

### Theme Routes

```
GET /api/themes/system
  Response: { themes: [] }
  Status: 200

GET /api/themes/me
  Response: { themes: [] }
  Status: 200

POST /api/themes/generate-ai
  Body: { keywords?, colors?, mood? }
  Response: { theme }
  Status: 200, 400, 429 (rate limit)

POST /api/themes
  Body: { themeName, colors, typography, layout, avatar }
  Response: { theme }
  Status: 201

PUT /api/themes/:id
  Body: { themeName?, colors?, ... }
  Response: { theme }
  Status: 200

DELETE /api/themes/:id
  Status: 204

POST /api/themes/:id/apply
  Response: { profile }
  Status: 200
```

### QR Code Routes

```
GET /api/profiles/me/qr-code
  Query: { size?, errorLevel?, includeLogo? }
  Response: { qrCode: { imagePng, imageSvg } }
  Status: 200

POST /api/profiles/me/qr-code/regenerate
  Body: { size?, errorLevel?, customization? }
  Response: { qrCode }
  Status: 200
```

### Analytics Routes

```
GET /api/profiles/me/analytics
  Query: { startDate?, endDate?, granularity? }
  Response: { 
    summary: { totalViews, uniqueVisitors, vCardDownloads },
    timeSeries: [],
    shareBreakdown: {},
    lastUpdated 
  }
  Status: 200
```

## Implementation Phases

### Phase 0: Setup & Foundation (Week 1)
- Database migrations
- API route structure
- Authentication integration
- Basic frontend routing

### Phase 1: Core Profile (Week 2)
- Profile CRUD functionality
- Username validation
- Public profile page (basic)
- Publish/unpublish toggle

### Phase 2: vCard & Mobile Optimization (Week 3)
- vCard generation
- Mobile-first responsive design
- Contact download functionality
- Performance optimization

### Phase 3: Social Links & Logos (Week 4)
- Featured social links (top 5)
- Custom links (unlimited)
- Auto logo detection
- Logo upload functionality

### Phase 4: QR Codes & Sharing (Week 5)
- QR code generation
- Multi-channel sharing
- Copy link, WhatsApp, system share
- QR customization

### Phase 5: Theme System (Week 6)
- Pre-built themes (8-12)
- Theme selection UI
- Manual customization
- CSS variable system

### Phase 6: AI Theme Generation (Week 7)
- OpenAI/Claude integration
- Theme generation prompt
- Preview and refinement
- My Themes collection

### Phase 7: Background & Logo Customization (Week 8)
- Custom background images and patterns
- Logo upload and display
- Image optimization
- Lazy loading

### Phase 8: Analytics (Week 9)
- Event tracking
- Daily batch processing
- Analytics dashboard
- Charts and metrics

### Phase 9: Search Engine & Directory (Week 10)
- SEO meta tags and sitemap
- In-app public directory
- Indexing opt-in controls
- Search functionality

### Phase 10: Polish & Launch (Week 11)
- Performance optimization
- Security audit
- Accessibility testing
- Bug fixes and refinements

## Development Guidelines

### Code Style
- TypeScript for all new frontend code
- ESLint + Prettier for formatting
- React functional components with hooks
- Tailwind CSS utility classes

### Testing Strategy
- Unit tests: Vitest for utilities and services
- Integration tests: API endpoint testing
- E2E tests: Playwright for critical flows
- Visual regression: Percy or Chromatic

### Performance Targets
- Lighthouse mobile score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB (gzipped)

### Security Checklist
- Input validation on all user inputs
- URL sanitization (prevent XSS)
- Rate limiting on uploads and AI calls
- CSRF protection on state-changing operations
- SQL injection prevention (parameterized queries)
- File upload validation (magic number check)
- Image virus scanning (production)

## Deployment Strategy

### Development
- Local SQLite database
- Local file storage
- Mock AI API (fallback to random themes)

### Staging
- PostgreSQL database
- Cloudflare R2 for images
- Real AI API with rate limits
- Full analytics enabled

### Production
- PostgreSQL with read replicas
- CDN for static assets
- Redis for caching
- Automated backups
- Monitoring and alerting

## Success Metrics & Monitoring

### Technical Metrics
- API response times (p50, p95, p99)
- Database query performance
- Image optimization effectiveness
- QR code generation speed
- Theme application latency

### Business Metrics
- Profile creation rate
- Publish rate (created → published)
- Share events per profile
- vCard download conversion
- Theme customization adoption
- AI theme generation success rate

### User Experience Metrics
- Lighthouse scores (mobile & desktop)
- Core Web Vitals (LCP, FID, CLS)
- Error rates by feature
- User satisfaction (surveys)

## Risk Assessment

### High Risk
- **AI API costs**: Implement rate limiting and caching
- **Image storage costs**: Aggressive compression and CDN
- **Mobile performance**: Lazy loading and code splitting

### Medium Risk
- **Username squatting**: Implement reclaim policy
- **vCard compatibility**: Extensive device testing
- **QR code scanning**: Test across camera apps

### Low Risk
- **Theme complexity**: Start simple, add features incrementally
- **Analytics accuracy**: Daily batch is acceptable trade-off
- **Logo detection**: Graceful fallbacks for unknown platforms

---

**Next Step**: Generate detailed task breakdown for each phase
