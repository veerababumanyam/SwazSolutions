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

### Important Gotchas

1. **API Key Security:** Never hardcode API keys. Client-side keys should be in localStorage or proxied through backend. Vite config explicitly prevents exposure in bundle.

2. **Database SQLite:** Uses SQL.js which is async-first. Database operations return Promises. DB file can become locked - ensure proper connection handling.

3. **14-Agent Pipeline:** Order matters. Some agents run in parallel (Promise.all), some sequential. Dependencies documented in `orchestrator.ts`.

4. **Rate Limiting:** Gemini API has rate limits. The `RATE_LIMIT_DELAY` (800ms) between agent calls prevents throttling.

5. **Language Script Enforcement:** Agents must output native scripts only. Script mixing is flagged as hallucination by Review and QA agents.

6. **Settings Resolution Priority:** User explicit choice → Prompt Engineer inference → Ceremony settings → Defaults. See `resolveSettings()` in orchestrator.

7. **Socket.io Namespaces:** Music player controls use socket events - ensure bidirectional event naming consistency between client and server.
