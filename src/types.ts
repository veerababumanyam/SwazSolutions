
export interface LanguageProfile {
    primary: string;
    secondary: string;
    tertiary: string;
}

export interface GenerationSettings {
    category: string;
    ceremony: string;
    theme: string;
    customTheme: string;
    mood: string;
    customMood: string;
    style: string;
    customStyle: string;
    singerConfig: string;
    customSingerConfig?: string;
    rhymeScheme: string;
    customRhymeScheme: string;
    complexity: 'Low' | 'Medium' | 'High';
}

export interface AgentStatus {
    active: boolean;
    currentAgent: 'LYRICIST' | 'REVIEW' | 'IDLE';
    progress: number;
}

export interface SavedProfile {
    id: string;
    name: string;
    language: LanguageProfile;
    generation: GenerationSettings;
    timestamp: number;
}

export interface SavedSong {
    id: string;
    title: string;
    content: string;
    language: string;
    timestamp: number;
}

export interface CeremonyDefinition {
    id: string;
    label: string;
    defaultMood: string;
    defaultStyle: string;
    defaultComplexity: 'Low' | 'Medium' | 'High';
    defaultRhyme: string;
    defaultSinger: string;
    promptContext: string;
}

export interface ScenarioCategory {
    id: string;
    label: string;
    events: CeremonyDefinition[];
}

// Music Player Types
export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    cover: string;
    src: string;
    duration: number; // in seconds
    liked?: boolean;
    lyrics?: string; // Path to .lrc file or raw text
    equalizer?: EqualizerSettings;
    genre?: string;
    // Extended metadata
    bitRate?: number | null;      // Bitrate in kbps
    sampleRate?: number | null;   // Sample rate in Hz
    channels?: number | null;     // Number of audio channels
    codec?: string | null;        // Audio codec (e.g., "MP3", "FLAC")
    trackNumber?: number | null;  // Track number in album
    discNumber?: number | null;   // Disc number
    bpm?: number | null;          // Beats per minute
    fileSize?: number | null;     // File size in bytes
    composer?: string | null;     // Composer name
}

export interface EqualizerSettings {
    bass: number;
    mid: number;
    treble: number;
    preamp: number;
}

export interface LyricsLine {
    time: number;
    text: string;
}

export interface LyricsData {
    lines: LyricsLine[];
    source: 'lrc' | 'text' | 'none';
}

export interface Album {
    id: string;
    title: string; // Folder name
    cover?: string;
    trackCount: number;
    tracks: Song[];
}

export interface Playlist {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
    trackIds: string[];
}

export type RepeatMode = 'off' | 'all' | 'one';

// Agent & Analysis Types

export interface LyricSection {
    sectionName: string;
    lines: string[];
}

export interface GeneratedLyrics {
    title: string;
    language: string;
    ragam: string;
    taalam: string;
    structure: string;
    sections: LyricSection[];
}

export interface Message {
    role: 'user' | 'model';
    content: string;
    lyricsData?: GeneratedLyrics;
}

export interface ComplianceReport {
    originalityScore: number;
    flaggedPhrases: string[];
    similarSongs: string[];
    verdict: string;
}

export interface EmotionAnalysis {
    sentiment: string;
    navarasa: string;
    intensity: number;
    suggestedKeywords: string[];
    vibeDescription: string;
}

export interface UserStylePreference {
    preferredThemes: string[];
    preferredComplexity: string;
    vocabularyStyle: string;
}

export interface ThemeColors {
    bgMain: string;
    bgSidebar: string;
    textMain: string;
    textSecondary: string;
    accent: string;
    accentText: string;
    border: string;
}

export interface AppTheme {
    id: string;
    name: string;
    colors: ThemeColors;
}

export interface ApiSong {
    id: number;
    title: string;
    artist?: string;
    album?: string;
    duration?: number;
    file_path: string;
    genre?: string;
    cover_path?: string | null;
    // Extended metadata from music_metadata table
    bit_rate?: number | null;      // Bitrate in kbps
    sample_rate?: number | null;   // Sample rate in Hz
    channels?: number | null;      // Number of audio channels
    codec?: string | null;         // Audio codec (e.g., "MP3", "FLAC")
    track_number?: number | null;  // Track number in album
    disc_number?: number | null;   // Disc number
    bpm?: number | null;           // Beats per minute
    file_size?: number | null;     // File size in bytes
    lyrics?: string | null;        // Song lyrics
    composer?: string | null;      // Composer name
}

export interface ApiAlbum {
    title: string;
    song_ids?: string;
}

// Contact & Inquiry Types
export interface ContactTicket {
    id: number;
    name: string;
    email: string;
    phone: string;
    deviceType: string;
    symptoms: string;
    isEmergency: boolean;
    status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface AgenticAIInquiry {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    companySize?: string;
    serviceType: string;
    projectDescription: string;
    budget?: string;
    timeline?: string;
    status: 'new' | 'contacted' | 'in-discussion' | 'proposal-sent' | 'closed-won' | 'closed-lost';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AgenticAIFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    companySize: string;
    serviceType: string;
    projectDescription: string;
    budget: string;
    timeline: string;
    honeypot: string;
    timestamp: number;
}

export interface ContactFormResponse {
    success: boolean;
    message: string;
    inquiryId?: string;
    ticketId?: string;
    estimatedResponseTime?: string;
    priority?: string;
    error?: string;
    errors?: string[];
}

// ========================================
// COMPREHENSIVE MUSIC DATABASE TYPES
// ========================================

// Artist entity
export interface Artist {
    id: number;
    name: string;
    sortName?: string;
    bio?: string;
    imageUrl?: string;
    websiteUrl?: string;
    spotifyId?: string;
    appleMusicId?: string;
    country?: string;
    formedYear?: number;
    disbandedYear?: number;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
}

// Genre entity with hierarchical support
export interface Genre {
    id: number;
    name: string;
    slug: string;
    parentId?: number;
    description?: string;
    color?: string;
    createdAt: string;
    // Computed/joined fields
    parent?: Genre;
    children?: Genre[];
}

// Album entity
export interface DbAlbum {
    id: number;
    title: string;
    artistId?: number;
    artistName?: string;
    releaseDate?: string;
    releaseYear?: number;
    albumType: 'album' | 'single' | 'ep' | 'compilation' | 'live' | 'remix';
    totalTracks?: number;
    totalDuration?: number;
    coverUrl?: string;
    coverSmallUrl?: string;
    coverLargeUrl?: string;
    label?: string;
    upc?: string;
    spotifyId?: string;
    appleMusicId?: string;
    isCompilation: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
    // Computed/joined fields
    artist?: Artist;
    genres?: Genre[];
    tracks?: DbSong[];
}

// Extended song entity (database representation)
export interface DbSong {
    id: number;
    title: string;
    artist?: string;
    album?: string;
    filePath: string;
    coverPath?: string;
    duration?: number;
    genre?: string;
    playCount: number;
    createdAt: string;
    // Computed/joined fields
    metadata?: MusicMetadata;
    artists?: SongArtist[];
    genres?: Genre[];
}

// Song-Artist relationship
export interface SongArtist {
    songId: number;
    artistId: number;
    artistRole: 'primary' | 'featuring' | 'remixer' | 'producer';
    displayOrder: number;
    // Joined field
    artist?: Artist;
}

// Extended music metadata
export interface MusicMetadata {
    id: number;
    songId: number;
    albumId?: number;
    artistId?: number;
    trackNumber?: number;
    discNumber: number;
    bpm?: number;
    keySignature?: string;
    timeSignature?: string;
    isrc?: string;
    explicit: boolean;
    language?: string;
    lyrics?: string;
    lyricsSynced?: string;
    lyricsSource?: string;
    composer?: string;
    lyricist?: string;
    producer?: string;
    mixer?: string;
    masteringEngineer?: string;
    recordingDate?: string;
    recordingLocation?: string;
    copyright?: string;
    label?: string;
    catalogNumber?: string;
    comment?: string;
    mood?: string;
    energyLevel?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    valence?: number;
    loudness?: number;
    bitRate?: number;
    sampleRate?: number;
    channels?: number;
    codec?: string;
    fileSize?: number;
    fileHash?: string;
    replayGainTrack?: number;
    replayGainAlbum?: number;
    spotifyId?: string;
    appleMusicId?: string;
    musicbrainzId?: string;
    lastScannedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Playback history entry
export interface PlaybackHistoryEntry {
    id: number;
    userId: number;
    songId: number;
    playlistId?: number;
    playedAt: string;
    durationPlayed?: number;
    completed: boolean;
    source?: string;
    deviceType?: string;
    audioQuality?: string;
    contextType?: 'album' | 'playlist' | 'artist' | 'search' | 'library' | 'queue';
    contextId?: string;
    skipReason?: string;
    shuffleMode: boolean;
    repeatMode?: 'off' | 'all' | 'one';
    volumeLevel?: number;
    createdAt: string;
    // Joined fields
    song?: DbSong;
    playlist?: DbPlaylist;
}

// Listening statistics
export interface ListeningStats {
    id: number;
    userId: number;
    songId: number;
    totalPlays: number;
    totalDurationPlayed: number;
    completedPlays: number;
    skipCount: number;
    lastPlayedAt?: string;
    firstPlayedAt?: string;
    avgCompletionRate?: number;
    favoriteTimeOfDay?: string;
    createdAt: string;
    updatedAt: string;
    // Joined field
    song?: DbSong;
}

// User music preferences
export interface UserMusicPreferences {
    id: number;
    userId: number;
    favoriteGenres?: string;
    preferredAudioQuality: 'low' | 'medium' | 'high' | 'lossless';
    crossfadeDuration: number;
    gaplessPlayback: boolean;
    normalizeVolume: boolean;
    equalizerPreset?: string;
    defaultShuffle: boolean;
    defaultRepeat: 'off' | 'all' | 'one';
    autoplayEnabled: boolean;
    explicitContentEnabled: boolean;
    listeningHistoryEnabled: boolean;
    recommendationsEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

// Enhanced playlist entity
export interface DbPlaylist {
    id: number;
    userId: number;
    name: string;
    description?: string;
    coverUrl?: string;
    isPublic: boolean;
    isCollaborative: boolean;
    totalDuration: number;
    trackCount: number;
    playsCount: number;
    likesCount: number;
    colorScheme?: string;
    lastModifiedAt: string;
    createdAt: string;
    // Joined fields
    tracks?: PlaylistTrack[];
    owner?: { id: number; username: string };
}

// Playlist track with position
export interface PlaylistTrack {
    id: number;
    playlistId: number;
    songId: number;
    position: number;
    addedBy?: number;
    addedAt: string;
    // Joined field
    song?: DbSong;
}

// Recently played item
export interface RecentlyPlayedItem {
    id: number;
    userId: number;
    itemType: 'song' | 'album' | 'playlist' | 'artist';
    itemId: number;
    playedAt: string;
    // Joined field based on itemType
    item?: DbSong | DbAlbum | DbPlaylist | Artist;
}

// Play queue entry
export interface PlayQueueEntry {
    id: number;
    userId: number;
    songId: number;
    position: number;
    addedAt: string;
    source?: string;
    // Joined field
    song?: DbSong;
}

// API response types for music endpoints
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface MusicSearchResult {
    songs: DbSong[];
    albums: DbAlbum[];
    artists: Artist[];
    playlists: DbPlaylist[];
}

export interface ListeningHistory {
    entries: PlaybackHistoryEntry[];
    totalPlays: number;
    totalDuration: number;
    topSongs: DbSong[];
    topArtists: Artist[];
    topGenres: Genre[];
}

// Filter/query options for music endpoints
export interface SongFilters {
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
    mood?: string;
    bpmMin?: number;
    bpmMax?: number;
    durationMin?: number;
    durationMax?: number;
    explicit?: boolean;
    sortBy?: 'title' | 'artist' | 'album' | 'playCount' | 'createdAt' | 'duration';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

export interface PlaybackHistoryFilters {
    startDate?: string;
    endDate?: string;
    songId?: number;
    playlistId?: number;
    completed?: boolean;
    source?: string;
    sortBy?: 'playedAt' | 'duration';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}
