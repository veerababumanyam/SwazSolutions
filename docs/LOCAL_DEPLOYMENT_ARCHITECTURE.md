# Self-Hosted Local Music Streaming Platform

## Executive Summary

**Architecture:** Fully self-contained, local deployment with no external dependencies  
**Target:** 100-10,000 concurrent users on local network or self-hosted server  
**Cost:** Hardware + electricity only (no monthly cloud fees!)

---

## 1. Local Deployment Architecture

### System Architecture

```
                    ┌─────────────────────────────┐
                    │   Users (100-10K)          │
                    │   Web Browser / App        │
                    └──────────────┬──────────────┘
                                   │ HTTP/WebSocket
                    ┌──────────────▼──────────────┐
                    │   Nginx Reverse Proxy       │
                    │   - Load Balancing          │
                    │   - SSL/TLS                 │
                    │   - Static File Serving     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Docker Compose Stack      │
                    │                             │
                    │  ┌──────────────────────┐  │
                    │  │  Backend API         │  │
                    │  │  (Node.js/Express)   │  │
                    │  │  - 3-5 instances     │  │
                    │  └──────────┬───────────┘  │
                    │             │               │
                    │  ┌──────────▼───────────┐  │
                    │  │  PostgreSQL          │  │
                    │  │  (or SQLite for <1K) │  │
                    │  └──────────────────────┘  │
                    │                             │
                    │  ┌──────────────────────┐  │
                    │  │  Redis Cache         │  │
                    │  │  (Session/Metadata)  │  │
                    │  └──────────────────────┘  │
                    │                             │
                    │  ┌──────────────────────┐  │
                    │  │  Local File System   │  │
                    │  │  /var/music/         │  │
                    │  │  - songs/            │  │
                    │  │  - covers/           │  │
                    │  └──────────────────────┘  │
                    └─────────────────────────────┘
```

---

## 2. Hardware Requirements

### For 100 Concurrent Users

**Minimum Specs:**
- CPU: 4-core (Intel i5 or AMD Ryzen 5)
- RAM: 8 GB
- Storage: 500 GB SSD
- Network: 100 Mbps upload
- Cost: ~$500 mini PC or repurposed server

**Example Hardware:**
- Intel NUC 11 Pro
- Raspberry Pi 4 (8GB) - for very light loads
- Old desktop/workstation

### For 1,000 Concurrent Users

**Recommended Specs:**
- CPU: 8-core (Intel Xeon or AMD EPYC)
- RAM: 32 GB
- Storage: 2 TB NVMe SSD
- Network: 1 Gbps upload
- Cost: ~$1,500-2,000 server

**Example Hardware:**
- Dell PowerEdge R340
- HP ProLiant DL20
- Custom build server

### For 10,000 Concurrent Users

**Enterprise Specs:**
- CPU: 16-32 core (Dual Xeon or EPYC)
- RAM: 64-128 GB
- Storage: 10 TB SSD RAID
- Network: 10 Gbps fiber
- Cost: ~$5,000-10,000 server

**Example Hardware:**
- Dell PowerEdge R640/R740
- HPE ProLiant DL380
- Dedicated server rack

### Bandwidth Calculation

```
Concurrent Users × Audio Bitrate = Required Bandwidth

100 users × 128 kbps = 12.8 Mbps (minimum)
1,000 users × 128 kbps = 128 Mbps (1 Gbps recommended)
10,000 users × 128 kbps = 1,280 Mbps (10 Gbps required)
```

---

## 3. Technology Stack (All Self-Hosted)

### Backend Server

```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Express.js",
  "database": "PostgreSQL 15",
  "cache": "Redis 7",
  "authentication": "JWT + bcrypt",
  "file_serving": "Nginx",
  "containerization": "Docker Compose"
}
```

### Database: PostgreSQL (Local)

**Why PostgreSQL over SQLite:**
- SQLite: Good for <1,000 users, single-file database
- PostgreSQL: Better for 1K-10K users, concurrent writes, better indexing

**Installation:**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Or via Docker (recommended)
docker run -d \
  --name music-db \
  -e POSTGRES_PASSWORD=secure_password \
  -v music-db-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15
```

### File Storage: Local File System

**Directory Structure:**
```
/var/music-streaming/
├── songs/
│   ├── original/          # Original uploads
│   ├── 320kbps/          # High quality
│   ├── 128kbps/          # Standard quality
│   └── 64kbps/           # Mobile/low bandwidth
├── covers/
│   ├── albums/
│   ├── playlists/
│   └── artists/
├── avatars/
└── backups/              # Automated backups
```

### Reverse Proxy: Nginx

**Configuration:**
```nginx
# /etc/nginx/sites-available/music-streaming

upstream api_backend {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name music.yourdomain.local;

    # SSL certificates (self-signed for local)
    ssl_certificate /etc/ssl/certs/music-streaming.crt;
    ssl_certificate_key /etc/ssl/private/music-streaming.key;

    # Static files (music)
    location /music/ {
        alias /var/music-streaming/songs/;
        
        # Enable caching
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Enable range requests for seeking
        add_header Accept-Ranges bytes;
        
        # Enable compression for metadata files
        gzip on;
        gzip_types application/json text/plain;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket for real-time features
    location /ws {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    # Frontend
    location / {
        root /var/www/music-streaming;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 4. Complete Docker Compose Setup

Create **docker-compose.yml**:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: music-db
    restart: always
    environment:
      POSTGRES_DB: music_streaming
      POSTGRES_USER: musicuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U musicuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: music-cache
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API (Multiple instances for load balancing)
  api-1:
    build: ./backend
    container_name: music-api-1
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://musicuser:${DB_PASSWORD}@postgres:5432/music_streaming
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      MUSIC_DIR: /music
    volumes:
      - music-files:/music
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  api-2:
    build: ./backend
    container_name: music-api-2
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3002
      DATABASE_URL: postgresql://musicuser:${DB_PASSWORD}@postgres:5432/music_streaming
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      MUSIC_DIR: /music
    volumes:
      - music-files:/music
    ports:
      - "3002:3002"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  api-3:
    build: ./backend
    container_name: music-api-3
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3003
      DATABASE_URL: postgresql://musicuser:${DB_PASSWORD}@postgres:5432/music_streaming
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      MUSIC_DIR: /music
    volumes:
      - music-files:/music
    ports:
      - "3003:3003"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: music-nginx
    restart: always
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/var/www/music-streaming
      - music-files:/var/music-streaming/songs:ro
      - ./ssl:/etc/ssl/certs:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api-1
      - api-2
      - api-3

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  music-files:
    driver: local
    driver_opts:
      type: none
      device: /var/music-streaming
      o: bind
```

**Environment Variables (.env):**
```bash
DB_PASSWORD=your_secure_db_password_here
REDIS_PASSWORD=your_secure_redis_password_here
JWT_SECRET=your_jwt_secret_key_minimum_32_chars
```

---

## 5. Backend Implementation (Node.js + TypeScript)

**Full backend structure** in `/backend`:

```
backend/
├── src/
│   ├── server.ts              # Main server entry
│   ├── config/
│   │   ├── database.ts
│   │   └── redis.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── songs.ts
│   │   ├── playlists.ts
│   │   └── users.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Song.ts
│   │   └── Playlist.ts
│   └── services/
│       ├── transcode.ts       # FFmpeg for quality conversion
│       └── search.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

**Key Backend Features:**

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression()); // Reduce bandwidth
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎵 Music API running on port ${PORT}`);
});
```

---

## 6. Performance Optimizations for Local Deployment

### 1. Audio Transcoding (FFmpeg)

Install FFmpeg for on-the-fly or batch transcoding:

```bash
# Transcode to multiple bitrates
ffmpeg -i original.mp3 \
  -b:a 320k output_320.mp3 \
  -b:a 128k output_128.mp3 \
  -b:a 64k output_64.mp3
```

**Auto-transcode on upload:**
```typescript
import ffmpeg from 'fluent-ffmpeg';

async function transcodeAudio(inputPath: string, songId: string) {
  const qualities = [320, 128, 64];
  
  for (const bitrate of qualities) {
    const outputPath = `/music/songs/${bitrate}kbps/${songId}.mp3`;
    
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioBitrate(bitrate)
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
  }
}
```

### 2. Caching Strategy

```typescript
// Cache frequently accessed songs metadata
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache popular songs for 1 hour
async function getPopularSongs() {
  const cached = await redis.get('popular_songs');
  if (cached) return JSON.parse(cached);
  
  const songs = await db.query(`
    SELECT * FROM songs 
    ORDER BY play_count DESC 
    LIMIT 50
  `);
  
  await redis.setex('popular_songs', 3600, JSON.stringify(songs));
  return songs;
}
```

### 3. Database Optimization

```sql
-- Create indexes for fast queries
CREATE INDEX idx_songs_title_search ON songs USING gin(to_tsvector('english', title));
CREATE INDEX idx_songs_play_count ON songs(play_count DESC);
CREATE INDEX idx_playlists_user ON playlists(user_id);

-- Periodic vacuum
VACUUM ANALYZE;
```

---

## 7. Deployment Steps

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create directories
sudo mkdir -p /var/music-streaming/{songs,covers,avatars,backups}
sudo chmod 755 /var/music-streaming
```

### Step 2: Clone & Configure

```bash
# Clone your repository
git clone https://github.com/yourname/swaz-music.git
cd swaz-music

# Set environment variables
cp .env.example .env
nano .env  # Edit with your passwords

# Generate SSL certificates (self-signed for local)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/music-streaming.key \
  -out ssl/music-streaming.crt
```

### Step 3: Build & Start

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api-1
```

### Step 4: Initialize Database

```bash
# Run migrations
docker-compose exec api-1 npm run db:migrate

# Create admin user
docker-compose exec api-1 npm run create-admin
```

---

## 8. Cost Comparison

### Cloud vs Self-Hosted

**100 Users:**
- Cloud (AWS): $70/month = **$840/year**
- Self-Hosted: $500 hardware + $50 electricity = **$550 first year**, $50/year after

**1,000 Users:**
- Cloud (AWS): $500/month = **$6,000/year**
- Self-Hosted: $2,000 hardware + $100 electricity = **$2,100 first year**, $100/year after

**10,000 Users:**
- Cloud (AWS): $5,000/month = **$60,000/year**
- Self-Hosted: $8,000 hardware + $200 electricity = **$8,200 first year**, $200/year after

**ROI Timeline:**
- 100 users: Break-even at ~8 months
- 1K users: Break-even at ~4 months
- 10K users: Break-even at ~2 months

**Self-hosting saves 85-95% after year 1!**

---

## 9. Monitoring & Maintenance

### Prometheus + Grafana (Self-Hosted)

```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
```

**Monitor:**
- CPU/RAM usage
- Active connections
- Database queries/sec
- Network bandwidth
- Disk I/O

---

## 10. Scaling Strategies

### Horizontal Scaling (Add more servers)

```nginx
# Add more backend instances in nginx
upstream api_backend {
    server server1.local:3001;
    server server2.local:3001;
    server server3.local:3001;
}
```

### Database Replication

```yaml
# Master-slave replication
postgres-master:
  image: postgres:15
  environment:
    POSTGRES_REPLICA_MODE: master

postgres-slave:
  image: postgres:15
  environment:
    POSTGRES_REPLICA_MODE: slave
    POSTGRES_MASTER_HOST: postgres-master
```

---

## Conclusion

**Self-Hosted Local Solution:**

✅ **One-time hardware cost** instead of monthly fees  
✅ **Full control** over data and infrastructure  
✅ **No vendor lock-in** or external dependencies  
✅ **Better privacy** - data never leaves your network  
✅ **Predictable costs** - just electricity after initial setup  

**Next Steps:**
1. Choose hardware based on user count
2. Set up Docker Compose infrastructure
3. Deploy backend + database
4. Migrate frontend to use local API
5. Test with 10-20 users first
6. Gradually scale up

Would you like me to start building the local backend infrastructure with Docker Compose setup?
