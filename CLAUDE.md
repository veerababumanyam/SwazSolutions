# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swaz Solutions is a full-stack digital platform combining music streaming, AI-powered lyric generation (Lyric Studio), and digital identity management. It's a monorepo with React 19/TypeScript frontend and Node.js/Express backend.

**Core Tech Stack:**
- Frontend: React 19, TypeScript, Vite, TailwindCSS, Socket.io-client
- Backend: Node.js, Express, SQLite (via SQL.js), Socket.io
- AI: Google Gemini 3.0 (Flash/Pro models) for 14-agent lyric generation system

## Development Commands

```bash
# Development (starts both frontend on :5173 and backend on :3000)
npm run dev

# Individual servers
npm run dev:frontend  # Vite dev server
npm run dev:backend   # Nodemon + Express

# Production
npm run build         # Build frontend with Vite
npm start            # Start production server (serves built frontend + backend API)
npm run deploy       # Build + start in one command

# Testing
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run tests with Playwright UI
```

**Database:** SQLite file at `backend/music.db` (auto-created if missing). Seed test users with `node backend/scripts/seed-test-users.js`.

## Architecture

### Frontend Structure

```
src/
├── agents/          # 14-agent AI system for Lyric Studio
├── components/      # React components (common/ + appearance/)
├── contexts/        # React Context for state (Auth, Music, Toast)
├── hooks/           # Custom React hooks
├── pages/           # Route-level page components
├── services/        # API service layer
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

**Key Contexts:**
- `AuthContext` - JWT authentication, Google OAuth, user session
- `MusicContext` - Music player state, playlists, queue management
- `ToastContext` - Global notification system

### Backend Structure

```
backend/
├── routes/          # API endpoints (auth, songs, playlists, lyrics, profiles, etc.)
├── middleware/      # Auth validation, rate limiting (apiLimiter, authLimiter)
├── services/        # Business logic (email, encryption, music scanning, vCard)
├── config/          # Database initialization (SQL.js)
└── scripts/         # DB seeding, utilities
```

**Database (SQLite):** Schema includes users, songs, playlists, profiles, contact_tickets, agentic_ai_inquiries. Uses SQL.js for in-memory DB with file persistence.

### 14-Agent AI Lyric Generation System

The core innovation. Agents execute in orchestrated pipeline with parallelization:

**Pipeline Phases:**
1. **Prompt Engineer** - Enhances user request, infers missing settings
2. **Emotion + Research** (parallel) - Navarasa analysis + cultural context
3. **Melody + Rhyme Master + Cultural Translator + Cultural Metaphor Engine** (parallel)
4. **Magic Rhyme Optimizer** - Phonetic enhancement, depends on phase 3
5. **Hook Generator + Structure Architect** (parallel)
6. **Lyricist** - Core composition using enriched context from all prior agents
7. **Review** - Quality control, rhyme validation
8. **Quality Assurance** - Final comprehensive check
9. **Formatter** - Suno.com tag formatting

**Agent Configuration:** `src/agents/config.ts` defines temperatures (0.1-0.9), top-P values, system prompts per agent. Rate limiting via `RATE_LIMIT_DELAY` (800ms between calls).

**Models:**
- Fast: `gemini-3.0-flash` (Emotion, Research, Formatter)
- Quality: `gemini-3.0-pro` (Lyricist, Review, most agents)

**Multi-language Support:** 23 Indian languages with native script enforcement (no script mixing). Language profiles include metadata for script, poetic traditions, rhyme patterns.

### Real-time Architecture

**Socket.io Integration:**
- Music player remote control across devices
- Real-time analytics tracking
- Camera updates system

Frontend connects via `socket.io-client` to backend Socket.io server.

### Security

- **Authentication:** JWT with refresh tokens, Google OAuth support
- **Rate Limiting:** Three tiers - apiLimiter (100/min), authLimiter (30/15min), strictAuthLimiter (5/15min for login/register)
- **CORS:** Origin whitelist via `CORS_ALLOWED_ORIGINS` env var
- **Headers:** Helmet.js for security headers
- **API Keys:** Gemini API key passed via `X-Gemini-API-Key` header or localStorage (never expose in client bundle)

### Key Files for Common Tasks

**Adding/modifying AI agents:**
- `src/agents/` - Individual agent implementations
- `src/agents/orchestrator.ts` - Pipeline coordination
- `src/agents/config.ts` - Prompts, temperatures, model selection
- `src/agents/types.ts` - Agent output interfaces

**Authentication changes:**
- `backend/routes/auth.js` - Login, register, OAuth endpoints
- `backend/middleware/auth.js` - JWT validation middleware
- `src/contexts/AuthContext.tsx` - Frontend auth state

**Music player features:**
- `src/contexts/MusicContext.tsx` - Player state, queue, playlists
- `backend/routes/songs.js` - Music library endpoints
- `backend/routes/playlists.js` - Playlist CRUD

**Digital identity/vCard:**
- `backend/routes/vcards.js` - vCard generation
- `backend/routes/qr-codes.js` - QR code generation
- `backend/routes/publicProfiles.js` - Public profile serving at `/u/:username`

### Environment Variables

Required in `.env`:
- `VITE_GEMINI_API_KEY` or client-side localStorage (for AI generation)
- `VITE_GOOGLE_CLIENT_ID` (for Google OAuth)
- `GOOGLE_CLIENT_SECRET` (backend OAuth)
- `CORS_ALLOWED_ORIGINS` (comma-separated whitelist)
- `DB_PATH` (optional, defaults to `backend/music.db`)
- `VITE_GEMINI_MODEL_FAST`, `VITE_GEMINI_MODEL_QUALITY` (optional model overrides)

### Path Aliases

`tsconfig.json` configures `@/*` → `./src/*` for imports.

### Proxy Configuration

Vite proxies API calls to backend:
- `/api/*` → `http://localhost:3000`
- `/covers`, `/music`, `/uploads` → backend static routes

### Testing

Playwright E2E tests in `tests/e2e/` (if present). Configure in `playwright.config.js`.

### Production Deployment

Build outputs to `dist/`. Express serves static files from `dist/` and handles API routes. PM2 ecosystem config at `ecosystem.config.js` (if present).

## Production Server Access

**CRITICAL: Always use SSH key authentication as primary method. Only use password login if SSH fails.**

### Server Details
- **IP Address:** 185.199.52.230
- **Domain:** https://swazdatarecovery.com
- **Hostname:** srv1035265.hstgr.cloud
- **OS:** Ubuntu 22.04.5 LTS
- **Hosting:** Hostinger

### SSH Access (Primary Method)
```bash
# Primary connection method - ALWAYS TRY THIS FIRST
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230
```

**SSH Key Locations:**
- Private key: `C:\Users\admin\.ssh\id_ed25519_swazsolutions` (NEVER commit to Git)
- Public key: `C:\Users\admin\.ssh\id_ed25519_swazsolutions.pub`
- SSH keys are protected in `.gitignore` and will never be committed

### Fallback Password Login
**Only use if SSH key fails:**
```bash
ssh root@185.199.52.230
# Password: Veeru@098765
```

### Server Configuration

**Installed Software:**
- Node.js v20.20.0 (LTS)
- npm 10.8.2
- PM2 6.0.14 (Process Manager)
- nginx 1.18.0 (Reverse Proxy)
- Certbot (SSL/TLS certificates)
- Fail2ban (Intrusion prevention)

**Application Location:** `/var/www/swazsolutions/`

**Security Hardening Applied:**
- ✅ SSH password authentication disabled (SSH key only)
- ✅ UFW firewall active (ports 22, 80, 443)
- ✅ Fail2ban with 4 active jails (SSH, nginx-http-auth, nginx-limit-req, nginx-botsearch)
- ✅ Kernel security hardening (SYN flood, IP spoofing protection)
- ✅ nginx rate limiting (10 req/s general, 100 req/min API, 5 req/min login)
- ✅ Security headers (X-Frame-Options, X-XSS-Protection, CSP-ready)
- ✅ Automatic security updates enabled

### Deployment Procedure

**1. Build locally:**
```bash
npm run build
```

**2. Deploy to server:**
```bash
# Using SSH key (primary method)
tar czf - --exclude='node_modules' --exclude='.git' --exclude='coverage' --exclude='.cache' . | \
  ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && tar xzf -'
```

**3. Install dependencies on server:**
```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230
cd /var/www/swazsolutions
npm install --omit=dev
```

**4. Configure environment (if not already done):**
```bash
nano /var/www/swazsolutions/.env
```

Required variables:
```bash
NODE_ENV=production
PORT=3000
VITE_GEMINI_API_KEY=your_key
VITE_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
CORS_ALLOWED_ORIGINS=https://swazdatarecovery.com,https://swazsolutions.com
JWT_SECRET=your_random_secret_min_32_chars
DB_PATH=/var/www/swazsolutions/backend/music.db
```

**5. Start/restart application:**
```bash
pm2 restart swazsolutions || pm2 start npm --name "swazsolutions" -- start
pm2 save
```

### Useful Server Commands

**Application Management:**
```bash
pm2 logs swazsolutions         # View application logs
pm2 restart swazsolutions      # Restart application
pm2 stop swazsolutions         # Stop application
pm2 list                       # List all PM2 processes
pm2 monit                      # Monitor CPU/memory usage
```

**nginx:**
```bash
systemctl status nginx         # Check nginx status
nginx -t                       # Test configuration
systemctl restart nginx        # Restart nginx
tail -f /var/log/nginx/access.log    # Access logs
tail -f /var/log/nginx/error.log     # Error logs
```

**Security Monitoring:**
```bash
fail2ban-client status sshd    # Check SSH bans
fail2ban-client status         # All jails status
ufw status numbered            # Firewall rules
journalctl -u fail2ban -f      # Monitor fail2ban
```

**Database Backup:**
```bash
cp /var/www/swazsolutions/backend/music.db \
   /var/www/swazsolutions/backend/music.db.backup.$(date +%Y%m%d)
```

**SSL Certificate Management:**
```bash
certbot certificates           # List certificates
certbot renew --dry-run        # Test renewal
certbot renew                  # Force renewal (auto-renews at expiry)
```

### Database Auto-Initialization

The SQLite database auto-initializes on first run with all tables:
- Users, Songs, Albums, Artists, Genres, Playlists
- Profiles, Themes, Social Profiles, Custom Links
- Analytics (views, shares, downloads, QR codes)
- Digital Invites, Support Tickets, Contact Forms
- Playback History, Listening Stats, User Preferences
- Camera Updates, Refresh Tokens, Visitor Counter

All migrations run automatically. No manual database setup required.

### Important Gotchas

1. **API Key Security:** Never hardcode API keys. Client-side keys should be in localStorage or proxied through backend. Vite config explicitly prevents exposure in bundle.

2. **Database SQLite:** Uses SQL.js which is async-first. Database operations return Promises. DB file can become locked - ensure proper connection handling.

3. **14-Agent Pipeline:** Order matters. Some agents run in parallel (Promise.all), some sequential. Dependencies documented in `orchestrator.ts`.

4. **Rate Limiting:** Gemini API has rate limits. The `RATE_LIMIT_DELAY` (800ms) between agent calls prevents throttling.

5. **Language Script Enforcement:** Agents must output native scripts only. Script mixing is flagged as hallucination by Review and QA agents.

6. **Settings Resolution Priority:** User explicit choice → Prompt Engineer inference → Ceremony settings → Defaults. See `resolveSettings()` in orchestrator.

7. **Socket.io Namespaces:** Music player controls use socket events - ensure bidirectional event naming consistency between client and server.
