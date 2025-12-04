
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
    cover_path?: string | null; // Added: backend-provided cover path
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
