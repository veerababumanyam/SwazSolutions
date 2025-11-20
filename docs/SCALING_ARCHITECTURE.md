# Scaling Swaz Music Player to Public Streaming Service

## Executive Summary

**Current State:** Local file-based music player  
**Target State:** Public music streaming service (100 → 1K → 10K users)

**Architecture Change Required:** Complete transformation from client-side to cloud-based streaming platform

---

## 1. Scaling Requirements Analysis

### User Load Projections

| Metric | Phase 1 (Launch) | Phase 2 (Growth) | Phase 3 (Scale) |
|--------|------------------|------------------|-----------------|
| **Concurrent Users** | 100 | 1,000 | 10,000 |
| **Total Registered Users** | 500 | 5,000 | 50,000 |
| **Song Library Size** | 1,000 songs | 10,000 songs | 100,000 songs |
| **Storage (avg 5MB/song)** | 5 GB | 50 GB | 500 GB |
| **Bandwidth (128kbps streaming)** | 1.6 Mbps | 16 Mbps | 160 Mbps |
| **Monthly Bandwidth** | ~500 GB | ~5 TB | ~50 TB |

### Cost Estimates (AWS)

**Phase 1 (100 users):** ~$50-100/month
- EC2 t3.small: $15/month
- RDS db.t3.micro: $15/month
- S3 storage (5GB): $0.12/month
- CloudFront CDN (500GB): $40/month
- Total: ~$70/month

**Phase 2 (1,000 users):** ~$300-500/month
- EC2 t3.medium (load balanced): $60/month
- RDS db.t3.small: $30/month
- S3 storage (50GB): $1.15/month
- CloudFront CDN (5TB): $425/month
- Total: ~$516/month

**Phase 3 (10,000 users):** ~$2,500-5,000/month
- EC2 auto-scaling group: $300/month
- RDS db.r5.large: $200/month
- S3 storage (500GB): $11.50/month
- CloudFront CDN (50TB): $4,250/month
- Total: ~$4,761/month

> **Note:** Bandwidth is the biggest cost driver for music streaming!

---

## 2. Recommended Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   React UI  │  │ Music Player │  │ Auth Logic │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS/WSS
                       ├────────────────┐
┌──────────────────────▼────┐  ┌────────▼──────────┐
│   CloudFront CDN          │  │  API Gateway      │
│   (Music Streaming)       │  │  (REST API)       │
└───────────┬───────────────┘  └────────┬──────────┘
            │                           │
            │                           │
┌───────────▼───────────────────────────▼──────────┐
│              Application Layer                    │
│  ┌──────────────┐         ┌──────────────────┐   │
│  │  Auth Server │         │  Streaming       │   │
│  │  (JWT)       │         │  Server (Node)   │   │
│  └──────────────┘         └──────────────────┘   │
└───────────┬───────────────────────────┬──────────┘
            │                           │
┌───────────▼──────────┐    ┌───────────▼──────────┐
│   PostgreSQL         │    │   S3 / Cloud Storage │
│   (Metadata DB)      │    │   (Audio Files)      │
│   - Users            │    │   - Music files      │
│   - Songs            │    │   - Cover images     │
│   - Playlists        │    │   - Transcoded       │
│   - Plays/Analytics  │    │     versions         │
└──────────────────────┘    └──────────────────────┘
```

---

## 3. Technology Stack Recommendations

### Backend

**Option A: Node.js (Recommended for fast development)**
```typescript
// Stack
- Framework: Express.js or Fastify
- Database: PostgreSQL (relational) + Redis (caching)
- Authentication: JWT + Passport.js
- File Upload: Multer + AWS SDK
- Streaming: node-media-server or custom stream handler
```

**Option B: Go (Recommended for scale)**
```go
// Stack
- Framework: Gin or Fiber
- Database: PostgreSQL + Redis
- Authentication: JWT + PASETO
- File Upload: Native multipart
- Better performance at scale
```

**Option C: Python (Good balance)**
```python
# Stack
- Framework: FastAPI
- Database: PostgreSQL + Redis
- Authentication: OAuth2 + JWT
- File Upload: boto3 (AWS)
- ML capabilities for recommendations
```

**My Recommendation: Node.js** (TypeScript)
- ✅ Same language as frontend (TypeScript)
- ✅ Fast development
- ✅ Great for I/O-heavy operations (streaming)
- ✅ Large ecosystem
- ✅ Easy to scale horizontally

### Database Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    subscription_tier VARCHAR(20) DEFAULT 'free'
);

-- Artists
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Albums
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(id),
    cover_url TEXT,
    release_year INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Songs
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(id),
    album_id UUID REFERENCES albums(id),
    duration INTEGER, -- in seconds
    file_url TEXT NOT NULL, -- S3 URL
    file_size BIGINT,
    bitrate INTEGER,
    genre VARCHAR(100),
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Playlists
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    cover_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Playlist Songs (many-to-many)
CREATE TABLE playlist_songs (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id)
);

-- User Likes
CREATE TABLE user_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    liked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, song_id)
);

-- Play History (for analytics)
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    song_id UUID REFERENCES songs(id),
    played_at TIMESTAMP DEFAULT NOW(),
    duration_played INTEGER, -- seconds actually played
    completed BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_songs_album ON songs(album_id);
CREATE INDEX idx_playlists_user ON playlists(user_id);
CREATE INDEX idx_play_history_user ON play_history(user_id);
CREATE INDEX idx_play_history_song ON play_history(song_id);
CREATE INDEX idx_play_history_date ON play_history(played_at DESC);
```

### Cloud Storage Structure

```
s3://swaz-music-prod/
├── songs/
│   ├── original/
│   │   └── {song-id}.mp3
│   ├── 320kbps/
│   │   └── {song-id}.mp3
│   ├── 128kbps/
│   │   └── {song-id}.mp3
│   └── 64kbps/
│       └── {song-id}.mp3
├── covers/
│   ├── albums/
│   │   └── {album-id}.jpg
│   └── playlists/
│       └── {playlist-id}.jpg
└── avatars/
    └── {user-id}.jpg
```

---

## 4. Critical Features to Implement

### Phase 1: MVP (100 users)

1. **User Authentication**
   - Email/password registration
   - JWT-based authentication
   - Password reset flow

2. **Music Upload (Admin Only)**
   - Admin dashboard for uploading songs
   - Metadata extraction (title, artist, duration)
   - S3 upload with progress tracking

3. **Music Streaming**
   - Browse songs/albums
   - Search functionality
   - Audio player with controls
   - Playlist creation

4. **Basic Features**
   - Like songs
   - Create/edit playlists
   - Play history

### Phase 2: Growth (1,000 users)

5. **Performance Optimization**
   - Audio transcoding (multiple bitrates)
   - CDN integration
   - Caching layer (Redis)
   - Database indexing

6. **Social Features**
   - Public playlists
   - Follow users
   - Share playlists

7. **Discovery**
   - Recommendations
   - Trending songs
   - Recently played

### Phase 3: Scale (10,000 users)

8. **Advanced Features**
   - Offline mode (PWA)
   - Queue management
   - Crossfade
   - Equalizer

9. **Analytics**
   - User engagement metrics
   - Popular songs dashboard
   - Revenue tracking (if paid)

10. **Infrastructure**
    - Auto-scaling
    - Multiple regions
    - DDoS protection
    - Advanced monitoring

---

## 5. Implementation Roadmap

### Week 1-2: Foundation
- [ ] Set up cloud infrastructure (AWS/GCP)
- [ ] Create database schema
- [ ] Set up S3 buckets
- [ ] Configure CDN

### Week 3-4: Backend API
- [ ] User authentication endpoints
- [ ] Song CRUD operations
- [ ] Playlist management
- [ ] Upload service

### Week 5-6: Frontend Updates
- [ ] Remove local file system code
- [ ] Integrate with backend APIs
- [ ] Update UI for streaming
- [ ] Add authentication pages

### Week 7-8: Testing & Deployment
- [ ] Load testing (simulate 100 concurrent users)
- [ ] Security audit
- [ ] Beta testing
- [ ] Production deployment

---

## 6. Legal Considerations ⚠️

### Music Licensing (CRITICAL)

>  [!CAUTION]
> **You CANNOT legally stream copyrighted music** without proper licenses!

**Options:**

1. **User-Generated Content Only**
   - Users upload their own music
   - Clear ownership rules
   - DMCA compliance
   - Example: SoundCloud

2. **Royalty-Free Music Library**
   - Curate royalty-free tracks
   - License from sites like Epidemic Sound, AudioJungle
   - Cost: $15-50/month per source

3. **License from Rights Organizations**
   - ASCAP, BMI, SESAC (USA)
   - PRS, PPL (UK)
   - Cost: $500-5,000/year minimum
   - Complex negotiations

4. **Partner with Labels**
   - Direct licensing deals
   - Revenue sharing
   - Example: Spotify, Apple Music
   - Requires significant capital

**Recommendation for MVP:** Start with **royalty-free music library** or **user-generated content model**

---

## 7. Alternative: Serverless Architecture

For cost optimization at small scale:

```
Frontend (Vercel/Netlify)
    ↓
Firebase/Supabase (Backend-as-a-Service)
    ├── Authentication
    ├── Firestore Database
    ├── Cloud Storage
    └── Cloud Functions

    ↓
CloudFlare CDN (for music delivery)
```

**Pros:**
- ✅ Lower initial cost ($0-20/month)
- ✅ Automatic scaling
- ✅ Less infrastructure management

**Cons:**
- ❌ Less control
- ❌ Vendor lock-in
- ❌ Higher costs at scale

---

## 8. Deployment Checklist

### Infrastructure
- [ ] Domain name registered
- [ ] SSL certificate configured
- [ ] CDN set up
- [ ] Database backups automated
- [ ] Monitoring dashboards (DataDog, New Relic)

### Security
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] SQL injection prevented
- [ ] XSS protection enabled
- [ ] HTTPS enforced

### Performance
- [ ] Images optimized
- [ ] Compression enabled (gzip/brotli)
- [ ] Lazy loading implemented
- [ ] Service Worker for offline
- [ ] Lighthouse score > 90

---

## 9. Migration Strategy

### From Current Local App to Cloud Service

**Step 1:** Keep both versions
- Rename current app to "Swaz Music Player (Local)"
- Create new "Swaz Music Streaming" project

**Step 2:** Gradual migration
- Build backend API
- Create parallel frontend that uses API
- Test with small group
- Switch DNS when ready

**Step 3:** Data migration
- If existing users, migrate playlists
- Provide export/import tools
- Send migration notifications

---

## 10. Cost Optimization Strategies

### Reduce Bandwidth Costs (Biggest expense)

1. **Adaptive Bitrate Streaming**
   - Serve 64kbps for mobile data
   - 128kbps for WiFi
   - 320kbps premium only

2. **Peer-to-Peer Streaming**
   - Use WebRTC for P2P delivery
   - Reduce server bandwidth by 40-60%
   - Example: PeerTube

3. **Smart Caching**
   - Cache popular songs in user's browser
   - Pre-load next 3 songs in playlist
   - Use Service Workers

4. **Compression**
   - Use Opus codec (better than MP3)
   - 96kbps Opus ≈ 128kbps MP3 quality
   - Save 25% bandwidth

### Reduce Storage Costs

1. **On-Demand Transcoding**
   - Store only original files
   - Transcode on-the-fly
   - Cache transcoded versions

2. **S3 Lifecycle Policies**
   - Move old/unpopular songs to Glacier
   - Cost: $1/TB vs $23/TB

---

## Conclusion

**For 100-10K users, you need:**

1. ✅ **Backend Server** (Node.js/Express on AWS/GCP)
2. ✅ **Database** (PostgreSQL for metadata)
3. ✅ **Cloud Storage** (S3/Cloud Storage for audio files)
4. ✅ **CDN** (CloudFront/Cloudflare for delivery)
5. ✅ **Authentication** (JWT-based user system)

**Estimated Total Cost:**
- Phase 1 (100 users): **$70/month**
- Phase 2 (1K users): **$500/month**
- Phase 3 (10K users): **$5,000/month**

**Timeline:** 6-8 weeks for MVP

**Next Steps:**
1. Choose cloud provider
2. Set up infrastructure
3. Build backend API
4. Update frontend
5. Address licensing
6. Deploy and test

Would you like me to start implementing the backend architecture, or would you prefer to start with a specific component (auth, database, file upload)?
