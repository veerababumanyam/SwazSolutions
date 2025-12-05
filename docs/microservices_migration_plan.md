# Microservices Migration Plan

## 1. Goal
Migrate the current monolithic Express.js application to a scalable, robust microservices architecture backed by a common PostgreSQL database and Redis for caching/messaging. The goal is to ensure high availability, easier maintenance, and independent scaling of services.

## 2. Architecture Overview

### Core Components
- **API Gateway (Nginx/Express):** Single entry point routing traffic to appropriate microservices. Handles rate limiting, SSL termination, and static file serving.
- **Service Mesh / Communication:** REST APIs for synchronous communication. Redis for asynchronous tasks (email, notifications) and caching.
- **Database:** Single PostgreSQL instance with separate schemas (logical isolation) for each service to ensure data integrity while allowing future physical separation.
- **Storage:** Shared Volume (Local/Docker) or Object Storage (S3-compatible) for media files (Music, Covers, Uploads).

### Services
1.  **Auth Service:** User identity, authentication (JWT), and authorization.
2.  **Music Service:** Song management, playlists, file scanning, and real-time playback synchronization (Socket.io).
3.  **Profile Service:** Public profiles, vCards, themes, social links, QR codes, and appearance settings.
4.  **Tools Service:** Camera updates scraper, visitor tracking, and system utilities.
5.  **Notification Service:** Email sending, contact form submissions.
6.  **Analytics Service:** Tracking profile views, shares, and downloads.

## 3. Technology Stack
-   **Runtime:** Node.js (v18+)
-   **Database:** PostgreSQL 15+ (with `pgvector` extension for future AI features)
-   **Caching/Messaging:** Redis 7+
-   **Containerization:** Docker & Docker Compose
-   **Gateway:** Nginx (Production) / Express Proxy (Development)

## 4. Microservices Breakdown & File Mapping

### 4.1. Auth Service (`services/auth`)
-   **Responsibilities:** Registration, Login, Token Refresh, Password Reset.
-   **Files to Migrate:**
    -   `backend/routes/auth.js`
    -   `backend/middleware/auth.js` (Copy/Shared Lib)
-   **Database Schema:** `auth`
    -   Tables: `users`
-   **Interdependencies:**
    -   **Refactor Required:** Currently `auth.js` writes directly to `profiles` table on registration. This MUST be changed to emit a `USER_REGISTERED` event to Redis. The Profile Service will listen to this event and create the profile.

### 4.2. Music Service (`services/music`)
-   **Responsibilities:** Manage Songs, Playlists, File Scanning, Real-time Sync.
-   **Files to Migrate:**
    -   `backend/routes/songs.js`
    -   `backend/routes/playlists.js`
    -   `backend/services/musicScanner.js`
    -   `backend/services/musicMetadata.js` (if exists)
-   **Database Schema:** `music`
    -   Tables: `songs`, `playlists`, `playlist_songs`, `user_likes`
-   **Interdependencies:**
    -   **Auth:** Uses `optionalAuth` middleware. Needs to verify JWT tokens using shared secret.
    -   **Storage:** Requires read/write access to `data/MusicFiles` and `data/covers`.

### 4.3. Profile Service (`services/profile`)
-   **Responsibilities:** User Profiles, vCards, Themes, QR Codes.
-   **Files to Migrate:**
    -   `backend/routes/profiles.js`
    -   `backend/routes/publicProfiles.js`
    -   `backend/routes/social-links.js`
    -   `backend/routes/themes.js`
    -   `backend/routes/fonts.js`
    -   `backend/routes/qr-codes.js`
    -   `backend/routes/vcards.js`
    -   `backend/routes/appearance.js`
    -   `backend/routes/uploads.js`
    -   `backend/services/vCardGenerator.js`
-   **Database Schema:** `profile`
    -   Tables: `profiles`, `themes`, `social_profiles`, `custom_links`, `qr_codes`, `fonts`
-   **Interdependencies:**
    -   **Auth:** Heavily relies on `req.user.id`.
    -   **Events:** Must listen for `USER_REGISTERED` event to create initial profile.

### 4.4. Tools Service (`services/tools`)
-   **Responsibilities:** Camera Updates, Visitor Tracking.
-   **Files to Migrate:**
    -   `backend/routes/cameraUpdates.js`
    -   `backend/services/cameraUpdatesScraper.js`
    -   `backend/routes/visitors.js`
-   **Database Schema:** `tools`
    -   Tables: `camera_updates`, `visitors`
-   **Interdependencies:**
    -   **Scheduler:** Runs periodic scraping tasks.

### 4.5. Notification Service (`services/notification`)
-   **Responsibilities:** Email Sending.
-   **Files to Migrate:**
    -   `backend/routes/contact.js`
    -   `backend/services/emailService.js`
-   **Queue:**
    -   Listens to `SEND_EMAIL` job queue in Redis.
-   **Interdependencies:**
    -   **All Services:** Any service needing to send email (Auth, Contact Form) will publish a message to the Redis queue instead of importing `emailService.js` directly.

### 4.6. Analytics Service (`services/analytics`)
-   **Responsibilities:** Event Tracking.
-   **Files to Migrate:**
    -   `backend/routes/analytics.js`
-   **Database Schema:** `analytics`
    -   Tables: `events`, `daily_stats`, `share_events`
-   **Interdependencies:**
    -   **Profile Service:** `profiles.js` currently writes to `share_events`. This should be refactored to call Analytics Service API or emit an event.

## 5. Shared Libraries & Common Code
To avoid code duplication, we will create a local NPM package or shared folder structure:
-   **`shared/middleware/auth.js`**: JWT verification logic.
-   **`shared/config/database.js`**: PostgreSQL connection pool configuration.
-   **`shared/utils/logger.js`**: Standardized logging.
-   **`shared/utils/constants.js`**: Shared constants (e.g., event names).

## 6. Data Migration Strategy

> [!WARNING]
> **CRITICAL:** Backup `music.db` and `virtual-profiles.db` before starting migration.

### Phase 1: Schema Creation
Create a unified PostgreSQL schema with logical separation:
```sql
CREATE SCHEMA auth;
CREATE SCHEMA music;
CREATE SCHEMA profile;
CREATE SCHEMA tools;
CREATE SCHEMA analytics;
```

### Phase 2: Data Transfer
Develop a migration script (`scripts/migrate_all_to_postgres.js`) to:
1.  **Connect** to SQLite databases (`music.db`, `virtual-profiles.db`) and PostgreSQL.
2.  **Read & Transform** data:
    -   `music.db`: Users -> `auth.users`, Songs -> `music.songs`, Playlists -> `music.playlists`.
    -   `virtual-profiles.db`: Profiles -> `profile.profiles`, Themes -> `profile.themes`, etc.
3.  **Insert** into PostgreSQL using transactions to ensure atomicity.
4.  **Verify** row counts and data integrity.

## 7. Infrastructure & Deployment

### Directory Structure
```
/
├── docker-compose.yml
├── gateway/
├── services/
│   ├── auth/
│   ├── music/
│   ├── profile/
│   ├── tools/
│   ├── notification/
│   └── analytics/
├── shared/
│   ├── config/
│   ├── middleware/
│   └── utils/
└── scripts/
```

### Docker Compose Configuration
-   **Postgres:** Port 5432, Volume `pgdata`.
-   **Redis:** Port 6379.
-   **Gateway:** Port 3000 (Maps to internal services).
-   **Services:** Internal ports (e.g., Auth: 3001, Music: 3002, Profile: 3003, Tools: 3004, Notification: 3005, Analytics: 3006).
-   **Volumes:**
    -   `./data/MusicFiles:/data/music`
    -   `./data/covers:/data/covers`
    -   `./public/uploads:/data/uploads`

## 8. Implementation Steps

### Step 1: Foundation
1.  Set up `docker-compose.yml` with Postgres and Redis.
2.  Create shared library (DB connection, Auth middleware, Logger).
3.  Implement `scripts/migrate_all_to_postgres.js`.

### Step 2: Core Services Migration
1.  **Auth Service:** Extract auth logic, connect to Postgres.
    -   *Refactor:* Replace direct profile creation with Event emission.
2.  **Music Service:** Extract song/playlist logic, implement Socket.io adapter (Redis).
3.  **Gateway:** Route `/api/auth` and `/api/songs` to respective services.

### Step 3: Profile & Features Migration
1.  **Profile Service:** Migrate vCard, Themes, QR logic.
    -   *Refactor:* Listen for `USER_REGISTERED` event.
2.  **Tools Service:** Move Camera Scraper and Visitor logic.
3.  **Notification Service:** Setup Email worker (Redis consumer).

### Step 4: Verification
1.  Run Migration Script.
2.  Start all services via Docker Compose.
3.  Run Integration Tests.

## 9. Verification Plan

### Automated Tests
-   **Unit Tests:** Test individual service logic (e.g., vCard generation, Token validation).
-   **Integration Tests:**
    -   **Auth:** Register -> Login -> Verify Token.
    -   **Music:** Upload -> Scan -> Play -> Sync (Socket).
    -   **Profile:** Update Profile -> View Public URL -> Download vCard.
    -   **Tools:** Trigger Camera Scrape -> Verify DB update.

### Manual Verification Checklist
-   [ ] **Login/Register:** Works with new Auth Service.
-   [ ] **Music Player:** Plays songs, covers load, seeking works.
-   [ ] **Real-time:** Open two tabs, verify play/pause sync.
-   [ ] **Public Profile:** Access `http://localhost:3000/u/username`.
-   [ ] **vCard:** Click "Save Contact", verify `.vcf` download and content.
-   [ ] **QR Code:** Scan QR code, verify it redirects to profile.
-   [ ] **Camera Updates:** Verify latest data is present.
-   [ ] **Contact Form:** Submit form, verify email/log.