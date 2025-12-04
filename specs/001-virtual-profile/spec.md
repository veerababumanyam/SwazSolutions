# Feature Specification: Virtual Profile & Smart Sharing

**Feature Branch**: `001-virtual-profile`  
**Created**: December 2, 2025  
**Status**: Draft  
**Input**: User description: "architect, design virtual profile docs/vCardPRD.md as mention in the prd for users to share with others which should open without logging into the application, the vCards should open and mobile first design. simple to manage, easy to share with qr code, backgrounds, logos, etc. AI managable themes where users can select existing themes or there should be ai button which can generate the themes for the users."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public Profile Creation & Publishing (Priority: P1)

A user wants to create a professional public profile that can be shared with anyone without requiring them to log in or create an account. The profile should showcase their professional identity, contact information, and social links.

**Why this priority**: This is the foundational capability - without a publishable profile, no sharing or theming features can exist. It delivers immediate value by giving users a shareable digital presence.

**Independent Test**: Can be fully tested by creating a profile, toggling publish on, and accessing the public URL in an incognito browser window. Delivers value as a standalone digital business card.

**Acceptance Scenarios**:

1. **Given** a logged-in user has not created a public profile, **When** they navigate to profile settings, **Then** they see a form to enter profile information (username, display name, headline, bio, contact details, social links) and a "Publish Profile" toggle (default: OFF)
2. **Given** a user has entered profile information, **When** they toggle "Publish Profile" to ON and save, **Then** their public profile URL (app.com/u/{username}) becomes accessible without authentication
3. **Given** a user has published their profile, **When** they toggle "Publish Profile" to OFF, **Then** their public URL returns 404 and is no longer accessible
4. **Given** a guest visits a published profile URL, **When** the page loads, **Then** they see the user's profile information without any login prompts or authentication barriers

---

### User Story 2 - Mobile-First Profile Viewing (Priority: P1)

A guest receives a profile link on their mobile device and wants to view the profile quickly with an optimal mobile experience that loads fast and displays beautifully on any screen size.

**Why this priority**: Most profile shares happen via mobile messaging (WhatsApp, SMS). Poor mobile experience means lost opportunities and negative first impressions.

**Independent Test**: Can be tested by opening any published profile URL on mobile devices (iOS/Android) in various screen sizes and checking load times, responsive layout, and touch interactions.

**Acceptance Scenarios**:

1. **Given** a guest opens a profile URL on a mobile device, **When** the page loads, **Then** content is optimized for mobile viewport with touch-friendly buttons, readable text sizes, and no horizontal scrolling
2. **Given** a guest views a profile on mobile, **When** the page loads, **Then** it achieves a Lighthouse mobile performance score of 90+ and loads within 2 seconds on 3G connection
3. **Given** a guest views a profile with long content, **When** they scroll, **Then** the layout remains stable with smooth scrolling and proper touch responsiveness
4. **Given** a guest views a profile on different mobile devices (iPhone, Android, tablets), **When** they load the page, **Then** the layout adapts appropriately with consistent design across devices

---

### User Story 3 - vCard Contact Download (Priority: P1)

A guest viewing a profile wants to save the person as a contact on their phone with one tap, importing all available contact information (name, phone, email, company, website) directly into their device's contact app.

**Why this priority**: This is a core value proposition from the PRD - enabling frictionless contact exchange. Without this, the "virtual business card" concept is incomplete.

**Independent Test**: Can be tested by viewing any profile on mobile, tapping "Save as Contact", and verifying the vCard file downloads and opens in the native contact app with correct information.

**Acceptance Scenarios**:

1. **Given** a guest views a published profile, **When** they tap the "Save as Contact" button, **Then** a vCard (.vcf) file downloads containing all public contact information (name, email, phone, company, job title, website)
2. **Given** a vCard file is downloaded on iOS, **When** the file opens, **Then** the iOS Contacts app opens with a new contact pre-filled with the profile information
3. **Given** a vCard file is downloaded on Android, **When** the file opens, **Then** the Android Contacts app opens with a new contact pre-filled with the profile information
4. **Given** a user has not enabled certain contact fields (email/phone), **When** a vCard is generated, **Then** only publicly visible fields are included in the vCard

---

### User Story 4 - QR Code Generation & Sharing (Priority: P2)

A user wants to generate a QR code for their profile that can be displayed at events, printed on business cards, or shown on their phone screen for quick scanning and profile access.

**Why this priority**: QR codes enable in-person networking and physical-to-digital bridge. High value but depends on having a working profile first (P1).

**Independent Test**: Can be tested by generating a QR code, downloading it, printing it, and scanning it with various mobile camera apps to verify it opens the correct profile URL.

**Acceptance Scenarios**:

1. **Given** a user has a published profile, **When** they navigate to the sharing section and click "Show QR Code", **Then** a modal displays a QR code that encodes their public profile URL
2. **Given** a QR code is displayed, **When** the user clicks "Download QR Code", **Then** they can download the QR code as PNG (high resolution) or SVG (vector) format
3. **Given** someone scans the QR code with a mobile device camera, **When** the scan completes, **Then** their phone opens the profile URL in their default browser
4. **Given** a user wants to customize their QR code, **When** they access QR settings, **Then** they can adjust size, add a logo/avatar in the center, and choose error correction level

---

### User Story 5 - Multi-Channel Sharing (Priority: P2)

A user wants to share their profile through multiple channels (copy link, WhatsApp, email, system share) with one-click actions optimized for each platform.

**Why this priority**: Reduces friction in sharing and reaches users across their preferred communication channels. Depends on P1 profile existing.

**Independent Test**: Can be tested by clicking each share option and verifying the correct behavior (link copied, WhatsApp opens with pre-filled message, system share dialog appears with proper content).

**Acceptance Scenarios**:

1. **Given** a user views their profile sharing options, **When** they click "Copy Link", **Then** their public profile URL is copied to clipboard and a toast notification confirms "Link copied"
2. **Given** a user clicks "Share on WhatsApp", **When** the action triggers, **Then** WhatsApp opens (web or app) with a pre-filled message "Check out my profile: {url}"
3. **Given** a user clicks "System Share" on a supported device, **When** the action triggers, **Then** the native share dialog opens with profile title, description, and URL for sharing to any installed app
4. **Given** a user is on a device that doesn't support system share, **When** they click "System Share", **Then** they see a fallback message: "Sharing not supported. Use Copy Link or QR Code"

---

### User Story 6 - Theme Selection & Customization (Priority: P2)

A user wants to customize the visual appearance of their profile by selecting from pre-designed themes that match their personal or professional brand identity.

**Why this priority**: Visual customization increases user engagement and satisfaction. However, a functional profile with default styling (P1) is more critical than aesthetic choices.

**Independent Test**: Can be tested by selecting different themes and viewing the profile in guest mode to verify visual changes are applied correctly and maintain mobile responsiveness.

**Acceptance Scenarios**:

1. **Given** a user accesses profile customization, **When** they view available themes, **Then** they see a gallery of 8-12 pre-designed themes with preview thumbnails showing different color schemes, layouts, and styles
2. **Given** a user selects a theme, **When** they apply it and save, **Then** their public profile immediately reflects the new theme's colors, fonts, spacing, and layout
3. **Given** a user wants to fine-tune a theme, **When** they access theme settings, **Then** they can adjust background color/gradient, primary/accent colors, font family, card opacity, and avatar style
4. **Given** a theme is applied, **When** the profile is viewed on mobile, **Then** the theme maintains responsive design principles and mobile-first optimization

---

### User Story 7 - AI Theme Generation (Priority: P3)

A user wants to automatically generate a unique theme based on their profile content, brand colors, or personal preferences using AI, without manually configuring design elements.

**Why this priority**: This is an advanced, delightful feature that enhances user experience but isn't essential for core functionality. Can be built after P1 and P2 features are stable.

**Independent Test**: Can be tested by clicking "Generate AI Theme", providing optional inputs (keywords, colors, mood), and verifying a unique theme is created and can be applied to the profile.

**Acceptance Scenarios**:

1. **Given** a user accesses theme customization, **When** they click "Generate AI Theme" button, **Then** they see a dialog to optionally input theme preferences (keywords like "professional", "creative", "minimal"; brand colors; mood/vibe)
2. **Given** a user submits AI theme generation request, **When** processing completes (within 10 seconds), **Then** a unique theme is generated with coordinated colors, typography, and layout that reflects the input preferences
3. **Given** an AI theme is generated, **When** the user previews it, **Then** they can see a side-by-side comparison of their current theme and the AI-generated theme before applying
4. **Given** a user likes the AI theme but wants adjustments, **When** they click "Regenerate" or "Refine", **Then** they can provide additional guidance and get a new variation
5. **Given** a user applies an AI-generated theme, **When** they save it, **Then** the theme is stored and can be accessed in their "My Themes" collection for future use

---

### User Story 8 - Background & Logo Customization (Priority: P3)

A user wants to add custom background images, patterns, or gradients and upload a personal/company logo to make their profile more distinctive and branded.

**Why this priority**: Enhances personalization but requires P1 (profile) and P2 (themes) to be in place first. Nice-to-have for branding.

**Independent Test**: Can be tested by uploading a background image and logo, applying them to the profile, and viewing in guest mode to verify proper display and mobile optimization.

**Acceptance Scenarios**:

1. **Given** a user accesses profile customization, **When** they click "Background Settings", **Then** they can choose between solid color, gradient, pattern, or custom image upload
2. **Given** a user uploads a custom background image, **When** the upload completes, **Then** the image is optimized for web (compressed, resized) and applied to the profile with proper mobile responsiveness
3. **Given** a user wants to add a logo, **When** they upload a logo image, **Then** it appears prominently on the profile (e.g., header or footer) and is properly sized for mobile and desktop viewing
4. **Given** a user applies a background/logo, **When** the profile loads on mobile, **Then** images are lazy-loaded and optimized to maintain fast performance (no degradation in Lighthouse scores)

---

### User Story 9 - Profile Analytics & Insights (Priority: P3)

A user wants to see how many people have viewed their profile, which sharing channels are most effective, and how many contacts have been saved, to understand the reach and impact of their profile.

**Why this priority**: Analytics provide value but are not required for core profile sharing functionality. Can be added after users have active profiles to analyze.

**Independent Test**: Can be tested by sharing a profile via multiple channels, having guests view and download vCard, then checking the analytics dashboard for accurate tracking of views, shares, and downloads.

**Acceptance Scenarios**:

1. **Given** a user accesses their profile dashboard, **When** they view analytics, **Then** they see total profile views, unique visitors, and views over time (daily/weekly/monthly charts)
2. **Given** guests interact with the profile, **When** they perform actions (view, share, download vCard, scan QR), **Then** these events are tracked and displayed in the user's analytics dashboard
3. **Given** a user has shared their profile via multiple channels, **When** they view share analytics, **Then** they see breakdown by channel (copy link, WhatsApp, QR code, system share) with counts for each
4. **Given** a user wants to understand engagement, **When** they view analytics, **Then** they see conversion metrics like "view-to-contact-save ratio" and average time on profile

---

### User Story 10 - Search Engine & Directory Opt-In (Priority: P3)

A user wants to make their profile discoverable through search engines (Google) and in-app public directory, increasing their professional visibility and networking opportunities.

**Why this priority**: Discoverability is valuable for some users but not required for direct sharing use cases. Can be added after core features are stable.

**Independent Test**: Can be tested by enabling public indexing, submitting profile URL to search engines, waiting for indexing, and searching for the user's name/username to verify profile appears in results.

**Acceptance Scenarios**:

1. **Given** a user has a published profile, **When** they access privacy settings, **Then** they see a clear "Allow search engine indexing" checkbox with explanation of what it means
2. **Given** a user enables search engine indexing, **When** search engines crawl the site, **Then** the profile page includes proper meta tags (title, description, Open Graph, Twitter Card) and no "noindex" directive
3. **Given** a user disables search engine indexing, **When** search engines access the profile, **Then** the page includes "noindex" meta tag and is excluded from sitemaps
4. **Given** a user opts into the public directory, **When** other users search within the app, **Then** this user's profile can appear in search results based on name, username, skills, or tags

---

### Edge Cases

- **What happens when a username is already taken?** System validates username uniqueness in real-time during profile creation and suggests available alternatives (e.g., username2, username_pro).
- **What happens when a guest tries to access an unpublished profile URL?** System returns 404 error page with message "Profile not available" without revealing whether the username exists.
- **What happens when profile images (avatar, background, logo) fail to load?** System displays graceful fallbacks (default avatar icon, solid color background, no logo) without breaking layout.
- **What happens when a user's profile URL is shared but they later change their username?** Old URL redirects to new URL for 90 days, after which it returns 404. System warns user before username change about link breaking.
- **What happens when QR code is scanned by a device with poor internet connection?** Profile page loads progressively with critical content first (name, title, contact button), then enhanced styling and images.
- **What happens when a user uploads oversized images (avatar, background, logo)?** System automatically compresses and resizes images to optimal web sizes (avatar: 400x400px, background: 1920x1080px max) before storing.
- **What happens when AI theme generation fails or times out?** System shows error message "Unable to generate theme. Please try again" and user can retry or manually select a theme.
- **What happens when vCard download fails on a particular device?** System provides alternative download methods (email vCard to self, copy vCard data as text) and logs error for troubleshooting.
- **What happens when multiple users share the same external links (LinkedIn, website)?** System validates URLs but allows duplicates since multiple users can have profiles on the same platforms.
- **What happens when a user wants to temporarily disable their profile without deleting it?** The "Publish Profile" toggle allows instant on/off switching, preserving all profile data and settings.

## Requirements *(mandatory)*

### Functional Requirements

#### Profile Management

- **FR-001**: System MUST allow authenticated users to create a single public profile with fields: username (unique, slug format), displayName, firstName, lastName, avatarImage, headline, company, bio, profileTags, publicEmail, publicPhone, website, socialProfiles (top 5 featured), customLinks (unlimited additional links), languages, pronouns, timezone, and contactPreferences
- **FR-002**: System MUST validate username uniqueness in real-time during profile creation and prevent duplicate usernames
- **FR-003**: System MUST provide a "Publish Profile" toggle that controls whether the public URL is accessible (OFF = 404, ON = visible)
- **FR-004**: System MUST generate a public profile URL in format: app.com/u/{username} for each user
- **FR-005**: System MUST allow users to mark individual fields (email, phone, social profiles) as public or private with "Show in public profile" toggles
- **FR-005a**: System MUST allow users to select up to 5 social profiles as "featured" links displayed prominently on profile
- **FR-005b**: System MUST allow users to add unlimited custom links beyond the featured social profiles
- **FR-005c**: System MUST automatically detect and download logos for known social platforms (LinkedIn, Twitter, GitHub, Instagram, Facebook, TikTok, YouTube, Spotify, Medium, Behance, Dribbble, Twitch, Discord, Telegram, WhatsApp Business) from logo store or CDN
- **FR-005d**: System MUST allow users to upload custom logos (PNG, SVG, max 500KB) for unknown platforms or personal branding
- **FR-005e**: System MUST display featured social links (top 5) in primary section and additional custom links in expandable "More Links" section on profile page

#### Public Access & Privacy

- **FR-006**: System MUST serve public profile pages without requiring authentication or login from guests
- **FR-007**: System MUST return 404 error page when a guest attempts to access an unpublished profile URL
- **FR-008**: System MUST provide a separate "Allow search engine indexing" opt-in toggle (independent from "Publish Profile")
- **FR-009**: System MUST include "noindex" meta tags when search engine indexing is disabled and exclude profile from sitemaps
- **FR-010**: System MUST include proper SEO meta tags (title, description, Open Graph, Twitter Card) when search engine indexing is enabled

#### Mobile-First Design & Performance

- **FR-011**: System MUST render public profile pages with mobile-first responsive design that works on viewport widths from 320px to 1920px
- **FR-012**: System MUST achieve Lighthouse mobile performance score of 90+ for public profile pages
- **FR-013**: System MUST load public profile pages within 2 seconds on 3G mobile connection
- **FR-014**: System MUST use touch-friendly UI elements with minimum tap target size of 44x44px
- **FR-015**: System MUST optimize all images (avatar, background, logo) for web delivery with automatic compression and responsive sizing

#### vCard Generation & Download

- **FR-016**: System MUST generate valid vCard 3.0 (.vcf) files containing user's public profile information
- **FR-017**: System MUST include in vCard: full name (FN), structured name (N), public email (EMAIL), public phone (TEL), organization (ORG), title (TITLE), and URL (website)
- **FR-018**: System MUST exclude fields from vCard that user has marked as private
- **FR-019**: System MUST trigger vCard download on mobile devices that opens in native Contacts app (iOS Contacts, Android Contacts)
- **FR-020**: System MUST display prominent "Save as Contact" button on public profile page

#### QR Code Generation

- **FR-021**: System MUST generate QR codes that encode the user's public profile URL
- **FR-022**: System MUST provide QR code download in PNG (high resolution, 1000x1000px minimum) and SVG (vector) formats
- **FR-023**: System MUST support QR code customization: size adjustment, error correction level (L, M, Q, H), and optional logo/avatar in center
- **FR-024**: System MUST cache generated QR codes per user and regenerate only when username/URL changes
- **FR-025**: System MUST display QR code in a modal with clear scanning instructions

#### Multi-Channel Sharing

- **FR-026**: System MUST provide "Copy Link" action that copies public profile URL to clipboard using Clipboard API
- **FR-027**: System MUST provide "Share on WhatsApp" action that opens WhatsApp (web or app) with pre-filled message containing profile URL
- **FR-028**: System MUST provide "System Share" action that uses Web Share API (when supported) to open native share dialog
- **FR-029**: System MUST display fallback message when Web Share API is not supported, directing users to Copy Link or QR Code
- **FR-030**: System MUST show toast notification confirming successful link copy

#### Theme System

- **FR-031**: System MUST provide 8-12 pre-designed themes with distinct visual styles (professional, creative, minimal, bold, etc.)
- **FR-032**: System MUST allow users to preview themes before applying them
- **FR-033**: System MUST apply selected theme to public profile immediately upon saving
- **FR-034**: System MUST allow theme customization: background color/gradient, primary/accent colors, font family, card opacity, avatar shape/size
- **FR-035**: System MUST ensure all themes maintain mobile-first responsive design and accessibility standards (WCAG AA minimum)

#### AI Theme Generation

- **FR-036**: System MUST provide "Generate AI Theme" feature that creates unique themes based on user inputs
- **FR-037**: System MUST accept optional AI theme inputs with validation: keywords (max 10 words, alphanumeric), brand colors (1-3 valid hex codes), mood/vibe (predefined list: professional, creative, minimal, bold, elegant, modern)
- **FR-038**: System MUST generate AI themes within 10 seconds (server-side processing timeout) and show loading state during generation
- **FR-039**: System MUST allow users to preview, regenerate, or refine AI-generated themes before applying
- **FR-040**: System MUST save AI-generated themes to user's "My Themes" collection for future reuse
- **FR-040a**: System MUST treat each AI theme generation as independent (no learning from past preferences or user history)
- **FR-040b**: System MUST provide consistent theme generation quality without requiring preference tracking or ML infrastructure
- **FR-040c**: System MUST include pre-built theme library alongside AI generation (8-12 professionally designed themes available immediately)

#### Background & Logo Customization

- **FR-041**: System MUST support background options: solid color, linear/radial gradient, pattern library, and custom image upload
- **FR-042**: System MUST accept custom background image uploads (JPEG, PNG, WebP) up to 10MB and automatically optimize for web
- **FR-043**: System MUST allow logo/brand image upload (PNG, SVG preferred) and display it prominently on profile
- **FR-044**: System MUST maintain image aspect ratios and provide cropping tools for proper fitting
- **FR-045**: System MUST lazy-load background and logo images to maintain fast initial page load

#### Analytics & Tracking

- **FR-046**: System MUST track and display total profile views, unique visitors, and views over time (daily, weekly, monthly)
- **FR-047**: System MUST track sharing events by channel: copy link, WhatsApp, system share, QR view, QR download
- **FR-048**: System MUST track vCard downloads and provide conversion metrics (view-to-download ratio)
- **FR-049**: System MUST track QR code scans (when possible via URL parameters) and display in analytics
- **FR-050**: System MUST display analytics in user dashboard with charts and breakdowns by date and channel
- **FR-050a**: System MUST update analytics data once per day (batch process) and display "Last updated: [date/time]" timestamp to users
- **FR-050b**: System MUST run analytics refresh during low-traffic hours (e.g., 2-4 AM UTC) to minimize performance impact on live profiles

#### Search & Discovery

- **FR-051**: System MUST provide in-app public directory where opted-in profiles can be searched by name, username, skills, or tags
- **FR-052**: System MUST exclude profiles from public directory when user has not opted in
- **FR-053**: System MUST generate sitemap.xml including all profiles with search engine indexing enabled
- **FR-054**: System MUST update sitemap automatically when profile indexing settings change

### Key Entities

- **User**: Represents an authenticated user of the platform who can create and manage their public profile. Attributes include: userId, username, displayName, email (private), authentication credentials, account creation date, subscription/plan status.

- **PublicProfile**: Represents the public-facing profile information for a user. Attributes include: profileId, userId (foreign key), username (unique), displayName, firstName, lastName, avatarImageUrl, headline, company, bio, profileTags[], publicEmail, publicPhone, website, socialProfiles[] (references SocialProfile), customLinks[] (references CustomLink), languages[], pronouns, timezone, contactPreferences, publishedStatus (boolean), indexingOptIn (boolean), createdAt, updatedAt.

- **SocialProfile**: Represents a featured social media link (max 5 per profile). Attributes include: socialProfileId, profileId (foreign key), platform_name (LinkedIn, Twitter, GitHub, Instagram, Facebook, TikTok, YouTube, etc.), platform_url, logoUrl (auto-detected from logo store or user-uploaded), displayOrder (1-5), isPublic (boolean), createdAt. **Implementation Note**: Stored in `social_profiles` table in database.

- **CustomLink**: Represents additional custom links beyond the top 5 featured social profiles (unlimited). Attributes include: linkId, profileId (foreign key), linkTitle, linkUrl, customLogoUrl (optional, user-uploaded PNG/SVG max 500KB), displayOrder, isPublic (boolean), createdAt, updatedAt. **Implementation Note**: Stored in `custom_links` table in database, separate from social_profiles to enforce the 5-featured-link constraint at database level.

- **Theme**: Represents a visual theme configuration for a profile. Attributes include: themeId, userId (foreign key, nullable for system themes), themeName, themeType (system, custom, ai-generated), colors (JSON: background, primary, accent, text), typography (JSON: fontFamily, sizes), layout (JSON: spacing, cardStyle), backgroundImage (URL or pattern ID), logoUrl, isActive (boolean), createdAt.

- **ShareEvent**: Represents a profile sharing action. Attributes include: eventId, userId, shareChannel (copyLink, whatsapp, systemShare, qrView, qrDownload), timestamp, sourceLocation (optional: web, mobile), ipAddress (for unique visitor tracking).

- **ProfileView**: Represents a profile view by a guest. Attributes include: viewId, userId (profile owner), viewerIpHash (anonymized), timestamp, referrer, deviceType (mobile, desktop, tablet), location (country, city from IP).

- **VCardDownload**: Represents a vCard download event. Attributes include: downloadId, userId (profile owner), timestamp, deviceType, ipAddress (anonymized).

- **QRCode**: Represents a generated QR code for a profile. Attributes include: qrCodeId, userId, profileUrl, imageUrlPng, imageUrlSvg, generatedAt, customization (JSON: size, errorCorrectionLevel, logo, colors).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and publish a complete public profile in under 5 minutes from account creation
- **SC-002**: Public profile pages load in under 2 seconds on 3G mobile connection with Lighthouse mobile performance score of 90+
- **SC-003**: 90% of profile shares successfully complete (link copied, WhatsApp opened, system share dialog shown, QR code displayed) on first attempt
- **SC-004**: vCard downloads successfully open in native contact apps on iOS and Android devices with 95% success rate
- **SC-005**: QR codes successfully scan and open correct profile URL on 95% of mobile devices tested (iOS, Android cameras)
- **SC-006**: Users can select and apply a theme to their profile in under 1 minute with immediate visual update
- **SC-007**: AI theme generation completes within 10 seconds and produces visually coherent themes in 90% of attempts
- **SC-008**: Profile pages maintain responsive design with no horizontal scrolling on screen widths from 320px to 1920px
- **SC-009**: Users attempting to access unpublished profiles receive 404 error 100% of the time, maintaining privacy
- **SC-010**: Profile analytics track at least 95% of genuine visitor interactions (views, shares, downloads) without false positives
- **SC-011**: 80% of users who create a profile successfully share it via at least one channel within first session
- **SC-012**: Profile creation completion rate (started to published) reaches 70% or higher

### User Satisfaction Metrics

- **SC-013**: 85% of users successfully complete their primary task (view profile, save contact, share link) on first attempt without errors
- **SC-014**: Profile load times meet or exceed industry standards with 95th percentile load time under 3 seconds
- **SC-015**: Theme customization features are used by 60% of users within first week of profile creation
- **SC-016**: Guest-to-contact conversion rate (profile views to vCard downloads) reaches 15% or higher

## Assumptions

- Users have stable internet connection for profile creation and management (guest viewing should work on slower connections)
- Users have modern web browsers (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+) for optimal experience
- AI theme generation uses existing AI/LLM services accessible via API (e.g., OpenAI GPT, Claude) to generate color schemes and design recommendations
- Profile images (avatar, background, logo) are stored in cloud object storage (e.g., AWS S3, Cloudflare R2) with CDN delivery
- vCard format 3.0 is sufficient for compatibility with modern mobile contact apps (iOS 12+, Android 9+)
- QR codes use standard QR specification with UTF-8 encoding for URL data
- Analytics tracking uses privacy-friendly methods (IP hashing, no third-party cookies) and complies with GDPR/CCPA
- WhatsApp sharing via URL works on both WhatsApp Web and mobile apps (using wa.me protocol)
- Web Share API support varies by browser/device, requiring robust fallback to Copy Link
- Default theme provides professional, accessible design that works for 80% of users without customization
- Username changes are rare events (less than 5% of users change username after initial creation)
- Public directory search uses simple text matching initially (full-text search, no complex NLP required)
- Profile URLs are permanent unless user explicitly changes username (with redirect grace period)
- System can handle 10,000 concurrent profile views without performance degradation
- Background image uploads are limited to 10MB to balance quality and performance
- AI theme generation may occasionally fail or produce unexpected results, requiring user retry option
- Most profile sharing happens via mobile devices (70%+), justifying mobile-first design priority
- Users understand the difference between "Publish Profile" (makes URL work) and "Allow Indexing" (makes it searchable)
- Contact information formats vary globally; vCard standard handles international phone numbers and addresses
- QR code error correction level "M" (15% recovery) provides good balance between size and reliability for most use cases

## Dependencies

- **Authentication System**: Must have user authentication and session management in place before users can create profiles
- **Image Upload & Storage**: Requires cloud storage integration (S3, Cloudflare R2, etc.) for avatar, background, and logo uploads
- **CDN**: Requires CDN configuration for fast image delivery globally
- **AI/LLM API**: AI theme generation requires integration with AI service (OpenAI, Claude, or similar) with API access
- **Analytics Infrastructure**: Requires event tracking system (could be custom or third-party like PostHog, Mixpanel)
- **QR Code Library**: Requires QR code generation library (e.g., qrcode.js, node-qrcode) for backend or client-side generation
- **vCard Generation Library**: Requires vCard formatting library (e.g., vcard-creator, vcf) for proper .vcf file generation
- **URL Routing**: Requires dynamic routing support for /u/{username} pattern in web framework
- **Database**: Requires relational database (PostgreSQL, MySQL) or document database (MongoDB) for storing profile and theme data

## Out of Scope

- **Multiple profiles per user**: Each user gets exactly one public profile (no personal vs. professional split)
- **Private/personal profiles**: Only public profiles are supported (no authenticated-only profiles)
- **Profile messaging/contact forms**: Profiles display contact info but don't include built-in messaging
- **Profile comments or reactions**: No social engagement features on profiles (likes, comments, shares counters)
- **Profile portfolio/gallery sections**: Focus is on contact info and links, not content showcasing
- **Advanced analytics**: No heatmaps, session recordings, funnel analysis, or cohort analysis
- **A/B testing of profile layouts**: Users pick one theme at a time, no testing variants
- **Team/organization profiles**: Only individual profiles supported in this version
- **Profile verification/badges**: No verification checkmarks or credibility indicators
- **Integration with external CRMs**: No automatic sync with Salesforce, HubSpot, etc.
- **Profile expiration/scheduling**: Profiles stay published until manually unpublished
- **Multilingual profile content**: Single language per profile (no translation features)
- **Video backgrounds or animations**: Static images and gradients only for backgrounds
- **Custom domain mapping**: Profiles always use app.com/u/{username}, no custom domains
- **Profile templates beyond themes**: No industry-specific or role-specific profile templates
- **Bulk profile creation/management**: Admin tools for managing multiple profiles not in scope
- **Profile import from LinkedIn/social media**: Manual entry only, no OAuth import of profile data

## Clarifications Resolved

**Q1: Social Profile Link Limits** ✅
- **Decision**: Display top 5 social links prominently with option to add more via "custom links"
- **Rationale**: Keeps profile clean while allowing flexibility. Users can add unlimited custom links beyond the top 5.
- **Implementation Note**: System should automatically detect and download logos for known platforms (LinkedIn, Twitter, GitHub, Instagram, Facebook, TikTok, YouTube, etc.) from a logo store/CDN. For unknown platforms, users can upload custom logos.

**Q2: AI Theme Learning & Personalization** ✅
- **Decision**: No learning - each AI theme generation is independent (Option A)
- **Rationale**: Simpler to implement for MVP, no ML infrastructure needed, users get fresh suggestions each time. Can add learning capability in future iterations based on user feedback.

**Q3: Profile Analytics Update Frequency** ✅
- **Decision**: Batch updates once per day (daily refresh)
- **Rationale**: Simplest infrastructure, lowest server load, sufficient for profile analytics use case. Most users check analytics periodically, not in real-time. Daily updates are standard for similar features.
- **Implementation Note**: Analytics refresh overnight (e.g., 2 AM local time or UTC) with clear "Last updated" timestamp shown to users.
