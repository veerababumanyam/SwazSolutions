# Digital Invitation Integration Plan

## Executive Summary

This document outlines the comprehensive integration of the DigitalInvite feature set into the SwazSolutions platform. The integration adds a complete digital invitation system with AI-powered text generation, multi-language support, guest management, and analytics.

## Feature Inventory from DigitalInvite

### Core Features
1. **Multi-Language Support** - 12 Indian languages with native script enforcement
2. **Bilingual Layouts** - Side-by-side, stacked, and tab-based layouts
3. **Multi-Event Itinerary** - Indian wedding ceremonies (Sangeet, Mehendi, Haldi, etc.)
4. **AI Text Generation** - Gemini-powered invitation text generation
5. **Template System** - Custom templates + community marketplace
6. **Guest Management** - CRUD operations, categories, groups, import/export
7. **QR Code System** - Generation, check-in scanner
8. **Analytics Dashboard** - Engagement tracking, RSVP analytics, device breakdown
9. **RSVP Management** - Status tracking, reminders
10. **Media Manager** - Background music, video embed, voice notes
11. **Cultural Features** - Muhurat timing, religious symbols, regional greetings
12. **Countdown Timer** - Event countdown display
13. **Social Sharing** - WhatsApp, Instagram Stories, Email
14. **Glassmorphism UI** - Premium glass-effect components
15. **Mobile Preview** - Real-time device frame preview

## Architecture Design

### 1. Database Schema Additions

```sql
-- Digital Invitations Table
CREATE TABLE digital_invites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL, -- wedding, birthday, engagement, etc.
  host_name TEXT NOT NULL,
  primary_lang TEXT DEFAULT 'en',
  secondary_lang TEXT,
  bilingual_enabled INTEGER DEFAULT 0,
  bilingual_layout TEXT, -- sideBySide, stacked, tabs

  -- Single Event Fields
  event_date TEXT,
  event_time TEXT,
  venue TEXT,
  map_link TEXT,
  details TEXT,

  -- Configurations (JSON)
  sections_json TEXT, -- Card sections with styles
  events_json TEXT, -- Multi-event itinerary
  indian_config_json TEXT, -- Cultural config
  media_config_json TEXT, -- Media settings

  -- Visual Settings
  template_id TEXT,
  custom_bg TEXT,
  custom_font TEXT,

  -- Features
  show_qr INTEGER DEFAULT 0,
  show_countdown INTEGER DEFAULT 1,
  show_rsvp INTEGER DEFAULT 1,
  auto_expiry INTEGER DEFAULT 0,

  -- Generated Content
  generated_text TEXT,
  ai_tone TEXT,

  -- Gallery
  gallery_images TEXT, -- JSON array of image URLs

  -- Status
  status TEXT DEFAULT 'draft', -- draft, published, expired
  slug TEXT UNIQUE, -- URL slug for public access
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Guest Lists
CREATE TABLE invite_guests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  invite_id TEXT REFERENCES digital_invites(id),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT, -- Family, Friends, Work, VIP, Other
  status TEXT DEFAULT 'Pending', -- Pending, Accepted, Declined
  plus_ones INTEGER DEFAULT 0,
  dietary TEXT,
  is_invited INTEGER DEFAULT 0,

  -- Tracking
  last_contacted TEXT,
  open_count INTEGER DEFAULT 0,
  last_open TEXT,
  device_info TEXT,
  location TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Guest Groups
CREATE TABLE invite_guest_groups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  guest_ids TEXT, -- JSON array of guest IDs
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Saved Templates
CREATE TABLE invite_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT, -- JSON array
  thumbnail_url TEXT,
  is_public INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  data TEXT NOT NULL, -- Full template configuration JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- RSVP Responses
CREATE TABLE invite_rsvps (
  id TEXT PRIMARY KEY,
  invite_id TEXT REFERENCES digital_invites(id),
  guest_id TEXT REFERENCES invite_guests(id),
  response TEXT, -- Accepted, Declined
  plus_ones INTEGER DEFAULT 0,
  dietary TEXT,
  message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events
CREATE TABLE invite_analytics (
  id TEXT PRIMARY KEY,
  invite_id TEXT REFERENCES digital_invites(id),
  event_type TEXT, -- open, click, rsvp, view
  guest_id TEXT,
  metadata TEXT, -- JSON: device, location, referrer
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins
CREATE TABLE invite_checkins (
  id TEXT PRIMARY KEY,
  invite_id TEXT REFERENCES digital_invites(id),
  guest_id TEXT REFERENCES invite_guests(id),
  checked_in_at TEXT DEFAULT CURRENT_TIMESTAMP,
  checked_in_by TEXT REFERENCES users(id)
);

-- Reminder Rules
CREATE TABLE invite_reminders (
  id TEXT PRIMARY KEY,
  invite_id TEXT REFERENCES digital_invites(id),
  name TEXT NOT NULL,
  days_offset INTEGER NOT NULL,
  offset_type TEXT, -- before, after
  trigger_event TEXT, -- event_date, rsvp_deadline
  target_audience TEXT, -- all, pending, accepted, declined
  channels TEXT, -- JSON: email, sms, whatsapp, push
  message TEXT,
  is_active INTEGER DEFAULT 1,
  next_run TEXT
);
```

### 2. API Routes Structure

```
/backend/routes/invites.js
├── POST   /api/invites                    - Create new invitation
├── GET    /api/invites                    - List user's invitations
├── GET    /api/invites/:id                - Get invitation details
├── PUT    /api/invites/:id                - Update invitation
├── DELETE /api/invites/:id                - Delete invitation
├── POST   /api/invites/:id/publish        - Publish invitation
├── GET    /api/invites/slug/:slug         - Public invite view
├── POST   /api/invites/:id/ai-generate    - Generate AI text
├── POST   /api/invites/:id/duplicate      - Duplicate invitation

/backend/routes/invite-guests.js
├── POST   /api/invites/:id/guests         - Add guest
├── GET    /api/invites/:id/guests         - List guests
├── PUT    /api/invites/:id/guests/:gid    - Update guest
├── DELETE /api/invites/:id/guests/:gid    - Delete guest
├── POST   /api/invites/:id/guests/import  - Import guests (CSV)
├── POST   /api/invites/:id/guests/export  - Export guests (CSV)

/backend/routes/invite-groups.js
├── POST   /api/invites/groups             - Create group
├── GET    /api/invites/groups             - List groups
├── PUT    /api/invites/groups/:gid        - Update group
├── DELETE /api/invites/groups/:gid        - Delete group
├── POST   /api/invites/groups/:gid/assign  - Assign guests to group

/backend/routes/invite-rsvp.js
├── POST   /api/invites/:slug/rsvp         - Submit RSVP
├── GET    /api/invites/:id/rsvps          - List RSVPs
├── PUT    /api/invites/:id/rsvps/:rid     - Update RSVP

/backend/routes/invite-templates.js
├── GET    /api/invites/templates          - List templates (marketplace)
├── GET    /api/invites/templates/my       - My saved templates
├── POST   /api/invites/templates          - Save template
├── DELETE /api/invites/templates/:tid     - Delete template
├── POST   /api/invites/templates/:id/use  - Use template

/backend/routes/invite-analytics.js
├── GET    /api/invites/:id/analytics      - Get analytics
├── GET    /api/invites/:id/analytics/guests - Guest activity
├── GET    /api/invites/:id/analytics/geo   - Geographic data
├── GET    /api/invites/:id/analytics/export - Export report

/backend/routes/invite-checkin.js
├── POST   /api/invites/:id/checkin        - Check-in guest
├── GET    /api/invites/:id/checkin        - List check-ins
├── GET    /api/invites/:id/checkin/stats  - Check-in statistics

/backend/routes/invite-sharing.js
├── GET    /api/invites/:id/qr             - Generate QR code
├── POST   /api/invites/:id/share/whatsapp - WhatsApp share
├── POST   /api/invites/:id/share/instagram - Instagram story image
└── POST   /api/invites/:id/share/email     - Bulk email send
```

### 3. Frontend Component Structure

```
/src/features/digital-invites/
├── index.ts
├── components/
│   ├── InviteDashboard.tsx           - Main dashboard
│   ├── InviteEditor/
│   │   ├── InviteEditor.tsx          - Main editor wizard
│   │   ├── LanguageStep.tsx          - Language configuration
│   │   ├── ScheduleStep.tsx          - Event schedule
│   │   ├── DetailsStep.tsx           - Event details
│   │   ├── VisualsStep.tsx           - Template & styling
│   │   ├── FeaturesStep.tsx          - Features & modules
│   │   └── InvitePreview.tsx         - Mobile preview
│   ├── GuestManager/
│   │   ├── GuestManager.tsx          - Main guest manager
│   │   ├── GuestList.tsx             - Guest table
│   │   ├── GuestForm.tsx             - Add/Edit guest
│   │   ├── GuestGroups.tsx           - Group management
│   │   └── GuestImport.tsx           - Import/Export
│   ├── Templates/
│   │   ├── TemplateLibrary.tsx       - My templates
│   │   ├── TemplateMarketplace.tsx   - Community templates
│   │   └── TemplateCreator.tsx       - Save template modal
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.tsx    - Main analytics
│   │   ├── EngagementChart.tsx       - Engagement overview
│   │   ├── GuestActivity.tsx         - Guest activity table
│   │   └── GeoDistribution.tsx       - Geographic data
│   ├── CheckIn/
│   │   ├── CheckInScanner.tsx        - QR scanner
│   │   └── CheckInList.tsx           - Recent check-ins
│   ├── Sharing/
│   │   ├── SocialShare.tsx           - Share modal
│   │   ├── WhatsAppShare.tsx         - WhatsApp integration
│   │   └── InstagramStory.tsx        - Story generator
│   ├── Culture/
│   │   ├── IndianCulture.tsx         - Cultural features
│   │   └── ReligiousSymbols.tsx       - Religious icon selector
│   ├── Media/
│   │   ├── MediaManager.tsx          - Media upload/selection
│   │   ├── MusicPicker.tsx           - Background music
│   │   └── VideoEmbed.tsx            - Video embedding
│   └── Public/
│       ├── PublicInviteView.tsx      - Public invite page
│       ├── RSVPForm.tsx              - RSVP submission
│       └── InviteGallery.tsx         - Photo gallery
├── hooks/
│   ├── useInviteEditor.ts            - Editor state management
│   ├── useGuestManager.ts            - Guest operations
│   ├── useAnalytics.ts               - Analytics data
│   └── useTemplateSystem.ts          - Template operations
├── services/
│   ├── inviteApi.ts                  - API client
│   ├── geminiInviteService.ts        - AI text generation
│   ├── qrCodeService.ts              - QR generation
│   └── analyticsService.ts           - Analytics tracking
├── types/
│   └── invites.types.ts              - TypeScript definitions
└── utils/
    ├── inviteTemplates.ts            - Template presets
    ├── languageUtils.ts              - Language helpers
    └── inviteConstants.ts            - Constants & config
```

### 4. Integration Points with Existing SwazSolutions

#### 4.1 Authentication Integration
- Use existing `AuthContext` for user authentication
- Extend user profile with invitation preferences
- Leverage existing JWT middleware

#### 4.2 Navigation Integration
- Add "Digital Invites" to main navigation
- Create `/invites` route section
- Add quick action button in dashboard

#### 4.3 Media Integration
- Use existing R2 storage for images/media
- Integrate with existing upload system
- Share media gallery with profile system

#### 4.4 AI Integration
- Extend existing `geminiService.js` for invitation text
- Add new prompt templates for invitations
- Share API key configuration

#### 4.5 Theme Integration
- Integrate with existing `themeService.ts`
- Use existing theme tokens for consistency
- Share color palette system

#### 4.6 Subscription Integration
- Add invitation quotas to subscription tiers
- Track invitation usage in billing
- Add invitation features to subscription management

### 5. Configuration Changes

#### Environment Variables (.env)
```bash
# Digital Invites
VITE_INVITE_ENABLED=true
VITE_INVITE_MAX_FREE=3
VITE_INVITE_MAX_GUESTS_FREE=50
VITE_INVITE_DEFAULT_LANG=en

# QR Code Service
VITE_QR_CODE_API=https://api.qrserver.com/v1/create-qr-code/

# Email Service (for bulk sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp Business API (optional)
WHATSAPP_BUSINESS_API=https://wa.me/
WHATSAPP_PHONE_NUMBER=XXXXXXXXXX
```

#### Vite Config Updates
```js
// vite.config.ts - Add proxy for invite APIs
server: {
  proxy: {
    '/api/invites': 'http://localhost:3000',
    '/uploads/invites': 'http://localhost:3000'
  }
}
```

### 6. Implementation Phases

#### Phase 1: Core Infrastructure (Week 1)
- Database schema setup
- Basic API routes
- Type definitions
- Navigation integration

#### Phase 2: Editor & Templates (Week 2)
- Invite editor wizard
- Template system
- Mobile preview
- AI text generation

#### Phase 3: Guest Management (Week 3)
- Guest CRUD operations
- Group management
- Import/Export functionality
- Bulk operations

#### Phase 4: Features & Integrations (Week 4)
- RSVP system
- QR code generation
- Check-in scanner
- Media manager
- Cultural features

#### Phase 5: Analytics & Sharing (Week 5)
- Analytics dashboard
- Social sharing
- Email integration
- WhatsApp integration

#### Phase 6: Polish & Testing (Week 6)
- UI/UX refinement
- Performance optimization
- Testing (E2E, unit)
- Documentation

### 7. Testing Strategy

#### Unit Tests
- Component testing (Vitest)
- Hook testing
- Service layer testing
- Utility function testing

#### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow
- Payment integration

#### E2E Tests (Playwright)
- Create invitation flow
- Guest management flow
- RSVP submission
- Check-in process
- Sharing flows

#### Manual Testing Checklist
- [ ] Multi-language rendering
- [ ] Bilingual layouts
- [ ] Mobile preview accuracy
- [ ] QR code scanning
- [ ] Guest import/export
- [ ] Email delivery
- [ ] WhatsApp sharing
- [ ] Analytics accuracy
- [ ] Check-in flow
- [ ] All template styles

### 8. Migration Strategy

#### Data Migration
```sql
-- Migration script for existing users
ALTER TABLE users ADD COLUMN invites_quota INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN invites_used INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN max_invites INTEGER DEFAULT 3;
```

#### Feature Rollout
1. Beta release to selected users
2. Gather feedback and iterate
3. Full rollout to all users
4. Marketing launch

### 9. Success Metrics

- **User Adoption**: 30% of active users create invitations
- **Engagement**: Average 50% RSVP rate
- **Performance**: Page load < 2s, editor < 100ms interactions
- **Quality**: < 1% bug rate in production
- **Revenue**: 15% increase in paid subscriptions

### 10. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Rate Limits | High | Implement caching, use enterprise plan |
| Storage Costs | Medium | Image optimization, CDN usage |
| Email Deliverability | High | Use professional email service |
| QR Code Scanning Issues | Low | Test on multiple devices |
| Multi-language Support | Medium | Use professional translation service |

### 11. Post-Launch Enhancements

1. Video invitation support
2. Collaborative editing
3. Advanced analytics with AI insights
4. Integration with calendar apps
5. Virtual event integration
6. AR invitation preview
7. Voice assistant integration
8. Advanced design tools
9. White-label solution
10. Mobile apps (iOS/Android)
