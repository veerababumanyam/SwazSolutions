# Music Player Architecture Decision: File System vs Database

## Executive Summary

**Recommendation: Hybrid Approach** - File system for audio files + IndexedDB for metadata

## Detailed Analysis

### Option 1: Pure File System (Current)

**How it works:**
- Music files stored in `data/MusicFiles/[AlbumName]/[song.mp3]`
- Scanned via `import.meta.glob` at build time
- Folder structure = Album organization

**Pros:**
✅ Simple and intuitive (drag & drop files)
✅ No data migration or sync issues
✅ Easy backup (just copy folder)
✅ Users can manage files with file explorer
✅ Browsers can play files directly via URLs
✅ Natural album organization (folders = albums)

**Cons:**
❌ Must re-scan folder on every app load
❌ No persistent metadata (play counts, ratings)
❌ Limited search/filter capabilities
❌ Can't store complex playlists offline
❌ No cross-session state preservation

**Best for:** Simple music libraries, minimal metadata needs

---

### Option 2: SQLite Database

**How it works:**
- SQLite via `sql.js` (WASM) in browser
- Store file paths + metadata in database
- Still need files in file system for playback

**Pros:**
✅ SQL querying (complex filters, joins)
✅ Persistent metadata storage
✅ Desktop-like database features

**Cons:**
❌ Large library size (~800KB wasm overhead)
❌ Must still keep files in file system (can't store audio in DB efficiently)
❌ Complex setup and maintenance
❌ Browser storage limits (few GB max)
❌ Overkill for music player use case
❌ Audio files can't be stored as BLOBs (too large)

**Best for:** Desktop apps with Node.js, complex relational data

---

### Option 3: IndexedDB (Browser Native)

**How it works:**
- NoSQL database built into browsers
- Store metadata, playlists, user preferences
- Audio files remain in file system

**Pros:**
✅ Native browser API (no external libraries)
✅ Fast key-value lookups
✅ Can store structured data + blobs
✅ Async operations (non-blocking)
✅ Good browser support
✅ Can cache file metadata between sessions

**Cons:**
❌ NoSQL (no complex SQL queries)
❌ Verbose API (need wrapper library)
❌ Still need file system for audio files
❌ Storage quota limits

**Best for:** Web apps needing persistent structured data

---

### Option 4: **HYBRID APPROACH** (Recommended)

**Architecture:**
```
File System (data/MusicFiles/)
├── album1/
│   ├── song1.mp3  ← Actual audio files
│   ├── song2.mp3
│   └── cover.jpg

IndexedDB (Browser)
├── songs_metadata     ← Title, artist, duration, file path
├── albums_metadata    ← Album info, cover URLs
├── playlists         ← User-created playlists
├── user_preferences  ← Play counts, ratings, favorites
└── scan_cache        ← Last scan timestamp, file hashes
```

**How it works:**
1. Audio files stored in `data/MusicFiles/` (file system)
2. On first scan: Parse files, extract metadata, cache in IndexedDB
3. On subsequent loads: Check cache timestamp, only re-scan if files changed
4. Playlists, favorites, ratings stored in IndexedDB
5. Audio playback uses file system URLs

**Benefits:**
✅ **Fast startup** (load from cache, scan in background)
✅ **Persistent metadata** (play counts, ratings survive refresh)
✅ **Rich playlists** (complex playlist data without re-scanning)
✅ **Easy file management** (users still drag/drop files)
✅ **Efficient** (only scan files that changed)
✅ **Offline-first** (works without re-scanning every time)

**Implementation:**
```typescript
// Cache structure
interface CachedSong {
  id: string;
  filePath: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  fileHash: string;      // To detect changes
  lastModified: number;  // File modified timestamp
  playCount: number;
  rating: number;
  lastPlayed: number;
}

// On app start:
1. Load cache from IndexedDB (instant)
2. Display cached songs immediately
3. Background: Check file system for changes
4. Update cache if files added/removed/modified
5. Refresh UI with new data
```

---

## Recommendation for Your Music Player

**Use Hybrid Approach because:**

1. **User Experience**: Fast app startup (cached data)
2. **Simplicity**: Users still manage files via folders
3. **Features**: Can add play counts, ratings, smart playlists
4. **Performance**: Only scan changed files
5. **Scalability**: Works with 1,000+ songs efficiently

**Implementation Priority:**
- Phase 1 (Current): File system with periodic scanning ✅ DONE
- Phase 2: Add IndexedDB caching for metadata
- Phase 3: Add user preferences (play counts, ratings)
- Phase 4: Smart playlists based on metadata

---

## Alternatives Considered

- **LocalStorage**: Too limited (5-10MB max) ❌
- **SessionStorage**: Clears on tab close ❌  
- **Cookies**: Not designed for structured data ❌
- **Server Backend**: Requires server, defeats purpose ❌

---

## Conclusion

**For your music player, the hybrid approach is optimal:**
- Keep audio files in `data/MusicFiles/` (simple, user-friendly)
- Cache metadata in IndexedDB (fast, persistent)
- Best of both worlds with minimal complexity

**Next Steps:**
1. Keep current file system implementation ✅
2. Add IndexedDB layer for caching (optional enhancement)
3. Avoid SQLite (unnecessary complexity for this use case)
