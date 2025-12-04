# Implementation Tasks: Virtual Profile & Smart Sharing

**Feature**: Virtual Profile & Smart Sharing  
**Branch**: `001-virtual-profile`  
**Created**: December 2, 2025

---

## Phase 0: Setup & Foundation

### Database & Infrastructure

- [X] T001 Create database migration for `profiles` table with all fields from spec
- [X] T002 Create database migration for `social_profiles` table with featured/custom distinction
- [X] T003 Create database migration for `custom_links` table
- [X] T004 Create database migration for `themes` table with JSONB columns
- [X] T005 Create database migration for `profile_views` analytics table
- [X] T006 Create database migration for `share_events` analytics table
- [X] T007 Create database migration for `vcard_downloads` analytics table
- [X] T008 Create database migration for `analytics_summary` table for daily aggregation
- [X] T009 Create database migration for `qr_codes` cache table
- [X] T010 [P] Create database indexes for performance (username, profile_id, published status)
- [X] T011 [P] Set up image storage directory structure for avatars, backgrounds, logos
- [ ] T012 [P] Configure CDN or static asset serving for `/assets/social-logos/`

### Backend Routes Structure

- [X] T013 Create `backend/routes/publicProfiles.js` with route structure (no auth middleware)
- [X] T014 Create `backend/routes/profiles.js` with auth middleware for owner operations
- [X] T015 Create `backend/routes/social-links.js` for social profile CRUD
- [X] T016 Create `backend/routes/themes.js` for theme management
- [X] T017 Create `backend/routes/qr-codes.js` for QR generation
- [X] T018 Create `backend/routes/vcards.js` for vCard generation
- [X] T019 Create `backend/routes/analytics.js` for analytics endpoints
- [X] T020 [P] Create `backend/middleware/publicAccess.js` for no-auth public routes
- [X] T021 [P] Create `backend/middleware/profileOwnership.js` to verify user owns profile
- [X] T022 [P] Create `backend/middleware/rateLimit.js` for upload and AI rate limiting

### Frontend Routing

- [X] T023 Add React Router route for `/profile/edit` (authenticated profile editor)
- [X] T024 Add React Router route for `/profile/dashboard` (profile management)
- [X] T025 Add React Router route for `/u/:username` (public profile view, no auth)
- [X] T026 Add React Router route for `/profile/analytics` (analytics dashboard)
- [X] T027 [P] Create ProtectedRoute component for authenticated routes
- [X] T028 [P] Create PublicRoute component for guest-accessible routes

---

## Phase 1: Core Profile (User Story 1 - P1)

**Goal**: Enable users to create, edit, and publish basic profiles accessible via public URL

**Independent Test**: Create profile with username/bio, toggle publish ON, access /u/{username} in incognito → profile visible

### Backend Implementation

- [X] T029 [US1] Implement POST `/api/profiles` endpoint to create new profile in `backend/routes/profiles.js`
- [X] T030 [US1] Implement GET `/api/profiles/me` endpoint to fetch authenticated user's profile
- [X] T031 [US1] Implement PUT `/api/profiles/me` endpoint to update profile fields
- [X] T032 [US1] Implement DELETE `/api/profiles/me` endpoint to delete profile
- [X] T033 [US1] Implement PATCH `/api/profiles/me/publish` endpoint to toggle published status
- [X] T034 [US1] Implement POST `/api/profiles/me/username-check` for real-time username validation
- [X] T035 [US1] Implement GET `/api/public/profile/:username` in `backend/routes/publicProfiles.js`
- [X] T036 [US1] Add username validation logic (3-50 chars, alphanumeric + underscore/hyphen, unique)
- [X] T037 [US1] Add logic to return 404 for unpublished profiles in public route
- [X] T038 [P] [US1] Add username suggestion algorithm when username taken (append numbers, variations)
- [X] T038a [US1] Create `username_history` table to track username changes for redirect support
- [ ] T038b [US1] Implement 301 redirect logic for old usernames (90-day expiry)
- [ ] T038c [US1] Add username change confirmation dialog with warning about breaking existing links
- [ ] T038d [US1] Create scheduled job to clean up expired username redirects (> 90 days)

### Frontend Implementation

- [X] T039 [US1] Create `src/pages/ProfileEditor.tsx` component with form layout
- [X] T040 [US1] Create `src/components/profile/ProfileForm.tsx` with all profile fields
- [X] T041 [US1] Implement username input with real-time validation and availability check
- [X] T042 [US1] Add form fields: displayName, firstName, lastName, headline, company, bio
- [X] T043 [US1] Add form fields: publicEmail, publicPhone, website with privacy toggles
- [X] T043a [US1] Add pronouns field with common options (he/him, she/her, they/them) and custom input
- [X] T044 [US1] Add "Publish Profile" toggle switch with clear ON/OFF states
- [X] T045 [US1] Implement profile save functionality with API integration
- [X] T046 [US1] Create `src/pages/PublicProfile.tsx` for guest viewing (/u/{username})
- [X] T047 [US1] Create `src/components/public-profile/ProfileCard.tsx` to display profile data
- [X] T048 [US1] Add 404 error page for unpublished or non-existent profiles
- [X] T049 [P] [US1] Create `src/services/profileService.ts` with API call wrappers
- [X] T050 [P] [US1] Create `src/hooks/useProfile.ts` hook for profile data management
- [X] T051 [P] [US1] Add loading states and error handling for profile operations
- [X] T052 [US1] Implement profile preview functionality (view as guest before publishing)

### Testing & Validation

- [X] T053 [US1] Test profile creation flow end-to-end
- [X] T054 [US1] Test username uniqueness validation and suggestions
- [X] T055 [US1] Test publish/unpublish toggle (verify 404 when OFF)
- [X] T056 [US1] Test public profile access without authentication
- [X] T057 [US1] Verify profile data persistence across sessions

---

## Phase 2: Mobile-First & vCard (User Stories 2-3 - P1)

**Goal**: Optimize profile for mobile devices and enable one-tap contact saving

**Independent Test**: Open profile on mobile, check responsiveness and load speed, tap "Save as Contact" → vCard downloads and opens in iOS/Android Contacts app

### Mobile Optimization (User Story 2)

- [X] T058 [US2] Apply mobile-first CSS to `PublicProfile.tsx` (320px-1920px responsive)
- [X] T059 [US2] Ensure touch targets are minimum 44x44px for all interactive elements
- [X] T060 [US2] Optimize images for mobile (responsive sizes, lazy loading)
- [X] T061 [US2] Implement progressive loading (critical content first, then styling)
- [X] T062 [US2] Add smooth scrolling and touch responsiveness
- [ ] T063 [US2] Test layout on iPhone (various sizes), Android phones, tablets
- [ ] T064 [US2] Run Lighthouse mobile audit and achieve 90+ score
- [ ] T065 [US2] Test page load on simulated 3G connection (< 2 seconds target)
- [ ] T066 [P] [US2] Implement code splitting for non-critical profile features
- [ ] T067 [P] [US2] Add service worker for offline profile caching (optional enhancement)

### vCard Generation (User Story 3)

- [X] T068 [US3] Install `vcard-creator` npm package in backend
- [X] T069 [US3] Create `backend/services/vCardGenerator.js` service class
- [X] T070 [US3] Implement vCard 3.0 generation with FN, N, EMAIL, TEL, ORG, TITLE, URL fields
- [X] T071 [US3] Add logic to exclude private fields from vCard based on privacy toggles
- [X] T072 [US3] Implement GET `/api/public/profile/:username/vcard` endpoint
- [X] T073 [US3] Set correct Content-Type header: `text/vcard` and filename
- [X] T074 [US3] Create `src/components/public-profile/ContactButton.tsx` component
- [X] T075 [US3] Implement vCard download trigger on button click
- [X] T076 [US3] Style "Save as Contact" button prominently for mobile (touch-friendly)
- [X] T077 [US3] Track vCard download events in `vcard_downloads` table
- [ ] T078 [US3] Test vCard download on iOS (iPhone Contacts app opens)
- [ ] T079 [US3] Test vCard download on Android (Contacts app opens)
- [ ] T080 [US3] Test vCard with partial data (email only, phone only, etc.)
- [ ] T081 [P] [US3] Add error handling for failed downloads with alternative methods

---

## Phase 3: Social Links & Logo Detection (User Story 1 Enhancement - P1)

**Goal**: Enable users to add top 5 featured social links + unlimited custom links with auto logo detection

**Independent Test**: Add LinkedIn, Twitter, GitHub links → logos auto-detected, add custom link with uploaded logo → displays correctly on public profile

### Backend Social Links

- [X] T082 [US1] Implement POST `/api/profiles/me/social-links` to create social profile
- [X] T083 [US1] Implement GET `/api/profiles/me/social-links` to fetch all links (featured + custom)
- [X] T084 [US1] Implement PUT `/api/profiles/me/social-links/:id` to update link
- [X] T085 [US1] Implement DELETE `/api/profiles/me/social-links/:id` to remove link
- [X] T086 [US1] Implement POST `/api/profiles/me/social-links/reorder` for drag-drop ordering
- [X] T087 [US1] Add validation: max 5 featured links per profile
- [X] T088 [P] [US1] Create `backend/services/logoService.js` for logo detection (using placeholder paths)
- [X] T089 [P] [US1] Implement logo detection algorithm with regex patterns for 15+ platforms
- [X] T090 [P] [US1] Implement POST `/api/profiles/me/social-links/detect-logo` endpoint
- [ ] T091 [P] [US1] Add custom logo upload endpoint with file validation (PNG/SVG, max 500KB)
- [ ] T092 [P] [US1] Implement image optimization for uploaded logos using Sharp

### Frontend Social Links

- [X] T093 [US1] Create `src/components/profile/SocialLinksManager.tsx` component
- [X] T094 [US1] Build UI for adding featured social links (dropdown with known platforms)
- [X] T095 [US1] Implement auto logo detection on URL input (call detect-logo API)
- [X] T096 [US1] Display featured links (top 5) with large icons and reorder controls
- [X] T097 [US1] Build UI for adding custom links beyond top 5
- [X] T098 [US1] Implement custom logo upload with file picker and preview
- [X] T099 [US1] Add drag-and-drop reordering for featured links
- [X] T100 [US1] Create `src/components/public-profile/SocialLinks.tsx` for display
- [X] T101 [US1] Render featured links prominently on public profile (60x60px icons mobile)
- [X] T102 [US1] Create expandable "More Links" section for custom links
- [X] T103 [P] [US1] Create `src/utils/logoDetector.ts` with platform detection logic (client-side)
- [X] T104 [P] [US1] Add validation for social profile URLs (https only, sanitized)

### Logo Assets

- [X] T105 [US1] Download/create SVG logos for 15+ platforms (LinkedIn, Twitter, GitHub, Instagram, Facebook, TikTok, YouTube, Spotify, Medium, Behance, Dribbble, Twitch, Discord, Telegram, WhatsApp Business)
- [X] T106 [US1] Place logos in `public/assets/social-logos/` directory
- [X] T107 [US1] Create `default-link.svg` fallback logo
- [X] T108 [P] [US1] Optimize all SVG files (remove metadata, minimize size)
- [ ] T109 [P] [US1] Configure CDN caching headers for logo assets

### Testing

- [ ] T110 [US1] Test featured link limit enforcement (max 5) - attempt to add 6th featured link, verify rejection with error message
- [ ] T110a [US1] Test featured vs custom link distinction - verify featured links appear in primary section, custom links in expandable "More Links" section
- [ ] T111 [US1] Test logo auto-detection for all 15+ platforms
- [ ] T112 [US1] Test custom logo upload and display
- [ ] T113 [US1] Test link reordering (drag-drop)
- [ ] T114 [US1] Test mobile responsive layout for social links

---

## Phase 4: QR Codes & Multi-Channel Sharing (User Stories 4-5 - P2)

**Goal**: Enable QR code generation and multi-channel profile sharing

**Independent Test**: Generate QR code, download PNG/SVG, scan with mobile camera → opens profile. Click share options → link copies, WhatsApp opens, system share dialog appears

### QR Code Generation (User Story 4)

- [X] T115 [US4] Install `qrcode` npm package in backend
- [ ] T116 [US4] Create `backend/services/qrCodeGenerator.js` service class
- [X] T117 [US4] Implement QR code generation in PNG format (1000x1000px minimum)
- [X] T118 [US4] Implement QR code generation in SVG format (vector)
- [X] T119 [US4] Implement GET `/api/profiles/me/qr-code` endpoint with caching
- [X] T120 [US4] Implement POST `/api/profiles/me/qr-code/regenerate` for customization
- [X] T121 [US4] Add QR code customization: size, error correction level (L/M/Q/H), logo in center
- [X] T122 [US4] Store generated QR codes in `qr_codes` table for caching
- [X] T123 [US4] Implement cache invalidation when username changes
- [X] T124 [US4] Create `src/components/profile/QRCodeModal.tsx` component
- [X] T125 [US4] Display QR code in modal with preview
- [X] T126 [US4] Add download buttons for PNG and SVG formats
- [X] T127 [US4] Add QR customization controls (size, error level, include logo toggle)
- [X] T128 [US4] Add scanning instructions text in modal
- [X] T129 [P] [US4] Create `src/services/qrCodeService.ts` for API calls
- [ ] T130 [US4] Test QR code scanning with iOS camera app
- [ ] T131 [US4] Test QR code scanning with Android camera app
- [ ] T132 [US4] Test QR code download in both formats
- [ ] T133 [P] [US4] Test QR with logo customization (avatar in center)

### Multi-Channel Sharing (User Story 5)

- [X] T134 [US5] Create `src/components/profile/SharePanel.tsx` component
- [X] T135 [US5] Implement "Copy Link" button using Clipboard API
- [X] T136 [US5] Add toast notification on successful link copy
- [X] T137 [US5] Implement "Share on WhatsApp" button with wa.me URL scheme
- [X] T138 [US5] Implement "System Share" button using Web Share API
- [X] T139 [US5] Add fallback message when Web Share API not supported
- [X] T140 [US5] Track share events in `share_events` table
- [X] T141 [P] [US5] Create `src/services/shareService.ts` for share functionality
- [X] T142 [P] [US5] Create `src/hooks/useShareTracking.ts` for event tracking
- [ ] T143 [US5] Test copy link on desktop browsers
- [ ] T144 [US5] Test WhatsApp share on mobile (opens app/web)
- [ ] T145 [US5] Test system share on iOS (opens share sheet)
- [ ] T146 [US5] Test system share on Android (opens share dialog)
- [ ] T147 [US5] Test fallback behavior on unsupported browsers

---

## Phase 5: Theme System (User Story 6 - P2)

**Goal**: Provide 8-12 pre-built themes and manual customization

**Independent Test**: Select different themes from gallery → profile updates immediately. Customize colors/fonts → changes apply in real-time preview

### Backend Theme Management

- [ ] T148 [US6] Create system theme JSON files for 8-12 pre-built themes
- [ ] T149 [US6] Create database seed script to populate `themes` table with system themes
- [X] T150 [US6] Implement GET `/api/themes/system` to fetch all system themes
- [X] T151 [US6] Implement GET `/api/themes/me` to fetch user's custom themes
- [X] T152 [US6] Implement POST `/api/themes` to save custom theme
- [X] T153 [US6] Implement PUT `/api/themes/:id` to update custom theme
- [X] T154 [US6] Implement DELETE `/api/themes/:id` to delete custom theme
- [X] T155 [US6] Implement POST `/api/themes/:id/apply` to set active theme for profile
- [X] T156 [P] [US6] Validate theme JSON structure and WCAG AA contrast ratios

### Frontend Theme System

- [ ] T157 [US6] Create `src/components/profile/ThemeSelector.tsx` component
- [ ] T158 [US6] Build theme gallery UI with preview thumbnails
- [ ] T159 [US6] Implement theme preview functionality (side-by-side view)
- [ ] T160 [US6] Implement theme application (apply selected theme to profile)
- [ ] T161 [US6] Create `src/components/profile/ThemeCustomizer.tsx` component
- [ ] T162 [US6] Add color picker inputs for background, primary, accent, text colors
- [ ] T163 [US6] Add typography controls (font family dropdown, size options)
- [ ] T164 [US6] Add layout controls (spacing slider, card radius, opacity)
- [ ] T165 [US6] Add avatar controls (shape selection, size slider)
- [ ] T166 [US6] Implement real-time preview of customizations
- [ ] T167 [US6] Create `src/components/public-profile/ThemeRenderer.tsx` component
- [ ] T168 [US6] Implement CSS variable injection for dynamic theme application
- [ ] T169 [US6] Create theme caching in localStorage for instant load
- [ ] T170 [P] [US6] Create `src/services/themeService.ts` for API calls
- [ ] T171 [P] [US6] Create `src/hooks/useTheme.ts` for theme state management
- [ ] T172 [P] [US6] Implement theme validation (contrast ratios, accessibility)

### Theme Designs

- [ ] T173 [US6] Design "Classic Blue" theme (professional category)
- [ ] T174 [US6] Design "Executive Gray" theme (professional category)
- [ ] T175 [US6] Design "Corporate Teal" theme (professional category)
- [ ] T176 [US6] Design "Vibrant Gradient" theme (creative category)
- [ ] T177 [US6] Design "Neon Night" theme (creative category)
- [ ] T178 [US6] Design "Pastel Dream" theme (creative category)
- [ ] T179 [US6] Design "Pure White" theme (minimal category)
- [ ] T180 [US6] Design "Dark Elegance" theme (minimal category)
- [ ] T181 [US6] Design "Monochrome" theme (minimal category)
- [ ] T182 [US6] Design "Sunset Orange" theme (bold category)
- [ ] T183 [US6] Design "Electric Purple" theme (bold category)
- [ ] T184 [P] [US6] Design "Forest Green" theme (bold category)

### Testing

- [ ] T185 [US6] Test theme selection and application
- [ ] T186 [US6] Test manual customization with real-time preview
- [ ] T187 [US6] Test theme persistence across sessions
- [ ] T188 [US6] Test all 12 themes for mobile responsiveness
- [ ] T189 [US6] Validate WCAG AA compliance for all system themes
- [ ] T190 [US6] Test theme switching performance (instant update)

---

## Phase 6: AI Theme Generation (User Story 7 - P3)

**Goal**: Enable AI-powered theme generation based on user preferences

**Independent Test**: Click "Generate AI Theme", input keywords "professional, tech, blue", submit → unique theme generated in <10s, preview and apply

### Backend AI Integration

- [ ] T191 [US7] Set up OpenAI API or Claude API credentials and configuration
- [ ] T192 [US7] Create `backend/services/aiThemeService.js` service class
- [ ] T193 [US7] Design AI prompt template for theme generation
- [ ] T194 [US7] Implement theme generation with AI API call
- [ ] T195 [US7] Parse and validate AI response (JSON theme structure)
- [ ] T196 [US7] Implement color contrast validation on AI-generated themes
- [ ] T197 [US7] Implement POST `/api/themes/generate-ai` endpoint
- [ ] T198 [US7] Add rate limiting: max 5 AI generations per hour per user
- [ ] T199 [US7] Add timeout handling (10 second limit)
- [ ] T200 [US7] Add error handling and retry logic
- [ ] T201 [P] [US7] Implement fallback to random theme if AI fails
- [ ] T202 [P] [US7] Add AI cost monitoring and logging

### Frontend AI Theme UI

- [ ] T203 [US7] Create `src/components/profile/AIThemeGenerator.tsx` component
- [ ] T204 [US7] Build AI theme input dialog with optional fields
- [ ] T205 [US7] Add keywords input (e.g., "professional", "creative", "minimal")
- [ ] T206 [US7] Add brand colors input (color picker for 1-3 colors)
- [ ] T207 [US7] Add mood/vibe selection (radio buttons or chips)
- [ ] T208 [US7] Implement loading state during AI generation (10s max)
- [ ] T209 [US7] Display generated theme in preview
- [ ] T210 [US7] Add "Regenerate" button to create new variation
- [ ] T211 [US7] Add "Refine" button with additional guidance input
- [ ] T212 [US7] Implement "Save to My Themes" functionality
- [ ] T213 [US7] Display error message if generation fails
- [ ] T214 [P] [US7] Add AI generation history (last 3-5 attempts)

### Testing

- [ ] T215 [US7] Test AI theme generation with various keyword combinations
- [ ] T216 [US7] Test with brand colors input
- [ ] T217 [US7] Test with different mood selections
- [ ] T218 [US7] Test regeneration and refinement
- [ ] T219 [US7] Test timeout handling (> 10 seconds)
- [ ] T220 [US7] Test rate limiting (5 per hour)
- [ ] T221 [US7] Verify generated themes meet WCAG AA standards
- [ ] T222 [US7] Test saving AI themes to "My Themes" collection

---

## Phase 7: Background & Logo Customization (User Story 8 - P3)

**Goal**: Enable custom background images/patterns and logo uploads

**Independent Test**: Upload background image → optimized and applied, upload logo → displays in header, profile loads fast on mobile

### Backend Image Handling

- [ ] T223 [US8] Install `sharp` npm package for image processing
- [ ] T224 [US8] Create `backend/services/imageProcessor.js` service class
- [ ] T225 [US8] Implement background image upload endpoint with validation
- [ ] T226 [US8] Add file type validation (JPEG, PNG, WebP, max 10MB)
- [ ] T227 [US8] Implement image optimization: resize to 1920x1080px max, compress (85% JPEG quality, generate WebP at 80%)
- [ ] T228 [US8] Generate multiple sizes for responsive images (mobile: 768px, tablet: 1024px, desktop: 1920px)
- [ ] T229 [US8] Implement logo upload endpoint with validation (PNG, SVG, max 500KB)
- [ ] T230 [US8] Optimize logo images (resize to 512x512px, compress PNG with pngquant, optimize SVG with SVGO)
- [ ] T231 [US8] Store images in designated directories with unique filenames
- [ ] T232 [P] [US8] Implement image cropping API for proper aspect ratios
- [ ] T233 [P] [US8] Add virus scanning for uploaded images (production)

### Frontend Customization UI

- [ ] T234 [US8] Add "Background Settings" section to theme customizer
- [ ] T235 [US8] Add radio options: Solid Color, Gradient, Pattern, Custom Image
- [ ] T236 [US8] Implement gradient builder UI (color stops, direction)
- [ ] T237 [US8] Create pattern library with 5-10 pre-made patterns
- [ ] T238 [US8] Implement background image upload with file picker
- [ ] T239 [US8] Add image preview before applying
- [ ] T240 [US8] Add "Logo Upload" section to profile editor
- [ ] T241 [US8] Implement logo upload with file picker and preview
- [ ] T242 [US8] Display logo in profile header or footer (configurable position)
- [ ] T243 [US8] Implement lazy loading for background and logo images
- [ ] T244 [P] [US8] Add image cropping tool for backgrounds
- [ ] T245 [P] [US8] Create `src/utils/imageOptimizer.ts` for client-side utilities

### Testing

- [ ] T246 [US8] Test background image upload and optimization
- [ ] T247 [US8] Test various image formats (JPEG, PNG, WebP)
- [ ] T248 [US8] Test oversized image handling (10MB+ rejected)
- [ ] T249 [US8] Test logo upload and display
- [ ] T250 [US8] Test gradient backgrounds
- [ ] T251 [US8] Test pattern backgrounds
- [ ] T252 [US8] Verify mobile performance with background images (Lighthouse score maintained)
- [ ] T253 [US8] Test lazy loading effectiveness

---

## Phase 8: Profile Analytics (User Story 9 - P3)

**Goal**: Track profile views, shares, and downloads with daily batch updates

**Independent Test**: Share profile, have guests view and download vCard → next day analytics dashboard shows accurate counts and charts

### Backend Analytics

- [X] T254 [US9] Implement POST `/api/public/profile/:username/view` to track views
- [X] T255 [US9] Hash visitor IP addresses for privacy (anonymized tracking)
- [X] T256 [US9] Extract device type, referrer, location from request headers
- [X] T257 [US9] Insert view event into `profile_views` table
- [ ] T258 [US9] Track share events when users click share buttons (already tracked in Phase 4)
- [X] T259 [US9] Track vCard downloads (already tracked in Phase 2)
- [ ] T260 [US9] Create daily batch job to aggregate analytics
- [ ] T261 [US9] Implement analytics aggregation script: count views, unique visitors, downloads, shares
- [ ] T262 [US9] Insert aggregated data into `analytics_summary` table
- [ ] T263 [US9] Schedule batch job to run daily at 2-4 AM UTC (cron or scheduled task)
- [X] T264 [US9] Implement GET `/api/profiles/me/analytics` endpoint
- [X] T265 [US9] Return analytics summary with time series data
- [X] T266 [US9] Add query params for date range filtering (startDate, endDate)
- [X] T267 [P] [US9] Calculate conversion metrics (view-to-download ratio)
- [X] T268 [P] [US9] Add "Last updated" timestamp to analytics response

### Frontend Analytics Dashboard

- [ ] T269 [US9] Create `src/pages/ProfileAnalytics.tsx` component
- [ ] T270 [US9] Install chart library (e.g., Chart.js, Recharts, or D3)
- [ ] T271 [US9] Display total profile views, unique visitors, vCard downloads
- [ ] T272 [US9] Create line chart for views over time (daily/weekly/monthly)
- [ ] T273 [US9] Create pie chart for share channel breakdown
- [ ] T274 [US9] Display conversion metrics (view-to-download ratio)
- [ ] T275 [US9] Add date range selector (last 7 days, 30 days, 90 days, all time)
- [ ] T276 [US9] Display "Last updated: [timestamp]" with explanation of daily refresh
- [ ] T277 [P] [US9] Create `src/services/analyticsService.ts` for API calls
- [ ] T278 [P] [US9] Add export analytics data as CSV functionality

### Testing

- [ ] T279 [US9] Test view tracking (multiple views, unique visitors)
- [ ] T280 [US9] Test share event tracking across all channels
- [ ] T281 [US9] Test vCard download tracking
- [ ] T282 [US9] Run batch aggregation manually and verify data
- [ ] T283 [US9] Test analytics dashboard displays correct data
- [ ] T284 [US9] Test date range filtering
- [ ] T285 [US9] Verify IP anonymization (hashed, not stored raw)
- [ ] T286 [US9] Test GDPR/CCPA compliance of analytics tracking

---

## Phase 9: Search Engine & Directory (User Story 10 - P3)

**Goal**: Enable opt-in search engine indexing and in-app public directory

**Independent Test**: Enable "Allow search engine indexing", check meta tags present → submit to Google Search Console, verify profile indexed. Opt into directory → profile appears in in-app search

### Backend SEO & Directory

- [ ] T287 [US10] Implement GET `/api/public/directory` endpoint for public profile search
- [ ] T288 [US10] Add query params: search (text), filters (tags, skills)
- [ ] T289 [US10] Query published profiles with `indexing_opt_in = true`
- [ ] T290 [US10] Implement text search on name, username, headline, bio, tags
- [ ] T291 [US10] Return paginated results (10-20 per page)
- [ ] T292 [US10] Generate `sitemap.xml` including all indexed profiles
- [ ] T293 [US10] Implement sitemap auto-update when profile indexing settings change
- [ ] T294 [US10] Add SEO meta tags to public profile page (title, description, Open Graph, Twitter Card)
- [ ] T295 [US10] Conditionally include `noindex` meta tag when indexing disabled
- [ ] T296 [US10] Exclude non-indexed profiles from sitemap
- [ ] T297 [P] [US10] Add structured data (JSON-LD) for rich snippets

### Frontend SEO & Directory

- [ ] T298 [US10] Add "Allow search engine indexing" checkbox to profile privacy settings
- [ ] T299 [US10] Add clear explanation text about what indexing means
- [ ] T300 [US10] Implement toggle to save indexing preference via API
- [ ] T301 [US10] Create `src/pages/PublicDirectory.tsx` for in-app directory
- [ ] T302 [US10] Build search bar with text input and filters
- [ ] T303 [US10] Display search results in grid or list view
- [ ] T304 [US10] Implement pagination for search results
- [ ] T305 [US10] Add link to profile from search results
- [ ] T306 [US10] Add meta tags to `PublicProfile.tsx` using React Helmet or similar
- [ ] T307 [P] [US10] Add filtering by tags, skills, location (optional)

### Testing

- [ ] T308 [US10] Test indexing opt-in toggle (on/off)
- [ ] T309 [US10] Verify `noindex` tag present when disabled
- [ ] T310 [US10] Verify proper meta tags when indexing enabled
- [ ] T311 [US10] Test sitemap generation and content
- [ ] T312 [US10] Test in-app directory search functionality
- [ ] T313 [US10] Test profile appears/disappears from directory based on opt-in
- [ ] T314 [US10] Submit test profile to Google Search Console (staging)
- [ ] T315 [US10] Verify profile can be found in Google search (after indexing period)

---

## Phase 10: Polish & Launch

### Performance Optimization

- [ ] T316 Implement code splitting for non-critical routes
- [ ] T317 Optimize bundle size (< 200KB gzipped target)
- [ ] T318 Implement lazy loading for images, themes, and analytics charts
- [ ] T319 Add service worker for offline profile caching (optional PWA)
- [ ] T320 [P] Configure CDN caching headers for all static assets
- [ ] T321 [P] Implement Redis caching for frequently accessed profiles (optional)
- [ ] T322 Run Lighthouse audits on all pages (mobile & desktop)
- [ ] T323 Achieve Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Security Audit

- [ ] T324 Review all input validation (username, URLs, file uploads)
- [ ] T325 Verify URL sanitization prevents XSS attacks
- [ ] T326 Test rate limiting on uploads, AI calls, and analytics endpoints
- [ ] T327 Verify CSRF protection on all state-changing operations
- [ ] T328 Test SQL injection prevention (parameterized queries)
- [ ] T329 Verify file upload security (magic number validation, virus scanning)
- [ ] T330 Review authentication and authorization flows
- [ ] T331 [P] Conduct penetration testing (manual or automated tools)

### Accessibility Testing

- [ ] T332 Run automated accessibility tests with axe-core or Lighthouse
- [ ] T333 Verify WCAG AA compliance for all themes
- [ ] T334 Test keyboard navigation (all interactive elements reachable)
- [ ] T335 Test screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] T336 Verify color contrast ratios for text and interactive elements
- [ ] T337 Test with high contrast mode enabled
- [ ] T338 Add ARIA labels and alt text where needed
- [ ] T339 [P] Test with assistive technologies (screen magnifiers, voice control)

### Cross-Browser & Device Testing

- [ ] T340 Test on Chrome (Windows, macOS, Android)
- [ ] T341 Test on Safari (macOS, iOS)
- [ ] T342 Test on Firefox (Windows, macOS)
- [ ] T343 Test on Edge (Windows)
- [ ] T344 Test on mobile devices (iPhone 12+, Samsung Galaxy, Pixel)
- [ ] T345 Test on tablets (iPad, Android tablets)
- [ ] T346 Test QR code scanning across different camera apps
- [ ] T347 Test vCard download on multiple device/OS combinations

### Bug Fixes & Refinements

- [ ] T348 Fix any bugs discovered during testing phases
- [ ] T349 Improve error messages and user feedback
- [ ] T350 Polish UI animations and transitions
- [ ] T351 Optimize form validation and user guidance
- [ ] T352 Improve loading states and skeleton screens
- [ ] T353 Enhance mobile touch interactions (haptic feedback, gestures)
- [ ] T354 [P] Add tooltips and contextual help where needed

### Documentation & Deployment

- [ ] T355 Write API documentation for all endpoints
- [ ] T356 Create user guide for profile creation and customization
- [ ] T357 Document theme system for designers
- [ ] T358 Write deployment guide for production environment
- [ ] T359 Create database migration scripts for production
- [ ] T360 Set up monitoring and alerting (error tracking, performance)
- [ ] T361 Configure analytics and logging (application-level)
- [ ] T362 [P] Create admin dashboard for profile management (optional)

### Launch Preparation

- [ ] T363 Conduct user acceptance testing (UAT) with beta users
- [ ] T364 Gather feedback and make final adjustments
- [ ] T365 Prepare launch announcement and marketing materials
- [ ] T366 Set up customer support channels (email, chat, docs)
- [ ] T367 Create rollback plan in case of issues
- [ ] T368 Perform final staging deployment and smoke tests
- [ ] T369 Deploy to production
- [ ] T370 Monitor launch day metrics and user feedback

---

## Summary

- **Total Tasks**: 377 (updated after analysis fixes)
- **Phase 0 (Setup)**: 28 tasks
- **Phase 1 (Core Profile)**: 35 tasks (added username redirect, pronouns field)
- **Phase 2 (Mobile & vCard)**: 24 tasks
- **Phase 3 (Social Links)**: 34 tasks (added featured link distinction test)
- **Phase 4 (QR & Sharing)**: 33 tasks
- **Phase 5 (Themes)**: 43 tasks
- **Phase 6 (AI Themes)**: 32 tasks
- **Phase 7 (Backgrounds)**: 31 tasks
- **Phase 8 (Analytics)**: 33 tasks
- **Phase 9 (SEO & Directory)**: 29 tasks
- **Phase 10 (Polish)**: 55 tasks

**Parallelizable Tasks**: 87 tasks marked with [P] can be worked on independently

**Estimated Timeline**: 10-11 weeks for full implementation (all 10 user stories)

**MVP Scope** (Phases 0-3): Core profile, mobile optimization, vCard, social links = ~4-5 weeks

---

## Task Dependencies

### Critical Path
```
Setup (Phase 0) 
  → Core Profile (Phase 1) 
  → Mobile & vCard (Phase 2) 
  → Social Links (Phase 3)
  → QR & Sharing (Phase 4)
  → Themes (Phase 5)
  → AI Themes (Phase 6)
  → Backgrounds (Phase 7)
  → Analytics (Phase 8)
  → SEO (Phase 9)
  → Polish (Phase 10)
```

### Parallel Opportunities
- Frontend and backend tasks within each phase can run in parallel
- Theme design (T173-T184) can happen alongside Phase 5 development
- Logo asset creation (T105-T109) can happen early in project
- Documentation (T355-T358) can be written throughout development

---

**Next Step**: Begin Phase 0 setup tasks or focus on MVP (Phases 0-3) for faster initial launch
