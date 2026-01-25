
export interface LanguageProfile {
    primary: string;
    secondary: string;
    tertiary: string;
}

/**
 * Language Metadata for proper multi-language support
 * Contains script information, encoding details, and formatting guidelines
 */
export interface LanguageMetadata {
    code: string;              // ISO 639-1 or 639-3 language code
    nativeName: string;        // Language name in its native script
    script: string;            // Script name (e.g., "Devanagari", "Bengali", "Tamil")
    scriptCode: string;        // ISO 15924 script code (e.g., "Deva", "Beng", "Taml")
    direction: 'ltr' | 'rtl';  // Text direction
    encoding: string;          // Character encoding (always UTF-8)
    unicodeRange: string;      // Unicode block range for the script
    specialCharacters: string[]; // Language-specific special characters
    formatGuidelines: string;  // Guidelines for proper formatting in this language
    poeticTraditions: string[]; // Traditional poetic forms in this language
    commonRhymePatterns: string[]; // Common rhyme schemes used
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
    complexity: 'Simple' | 'Moderate' | 'Complex' | 'Auto';
}

export interface AgentStatus {
    active: boolean;
    currentAgent: 'LYRICIST' | 'REVIEW' | 'IDLE' | 'ARTIST' | 'MAGIC' | 'COMPLIANCE' | 'CHAT' |
                  'MELODY' | 'RHYME_MASTER' | 'MAGIC_RHYME_OPTIMIZER' | 'CULTURAL_TRANSLATOR' |
                  'CULTURAL_METAPHOR' | 'HOOK_GENERATOR' | 'STRUCTURE_ARCHITECT' |
                  'QUALITY_ASSURANCE' | 'PROMPT_ENGINEER' | 'EMOTION' | 'RESEARCH' | 'FORMATTER';
    progress: number;
}

// New agent output types for the 13-agent system

export interface MelodyAnalysis {
    suggestedTempo: string;
    suggestedKey: string;
    suggestedMeter: string;
    rhythmicPattern: string;
    melodicContour: string;
    musicalNotes: string;
}

export interface RhymeSuggestions {
    primaryRhymes: string[];
    alternateRhymes: string[];
    internalRhymes: string[];
    rhymeMap: Record<string, string[]>;
    schemeValidation: boolean;
    suggestions: string[];
}

/**
 * Magic Rhyme Optimizer Output
 * Provides advanced phonetic optimization and musicality enhancement
 * for rhymes and lyrical flow
 */
export interface MagicRhymeOptimization {
    /** Enhanced multi-syllabic and mosaic rhyme pairs */
    enhancedRhymes: string[];
    /** Assonance, consonance, and phonetic flow patterns */
    phoneticPatterns: string[];
    /** Recommended syllable counts per section for rhythmic consistency */
    syllableOptimization: Record<string, number | string>;
    /** Alliterative phrases for hooks and emphasis */
    alliterationSuggestions: string[];
    /** How rhymes should align with melodic contour */
    melodicAlignment: string;
    /** Overall phonetic flow quality score (1-10) */
    flowScore: number;
    /** Specific optimization recommendations for the lyricist */
    optimizationNotes: string[];
}

export interface CulturalAdaptation {
    localizedPhrases: string[];
    culturalMetaphors: string[];
    regionSpecificIdioms: string[];
    adaptationNotes: string;
    culturalSensitivityCheck: boolean;
}

export interface HookSuggestion {
    mainHook: string;
    alternateHooks: string[];
    tagline: string;
    memorabilityScore: number;
    hookPlacement: string[];
}

export interface StructureRecommendation {
    recommendedStructure: string;
    sectionOrder: string[];
    sectionLengths: Record<string, number>;
    dynamicFlow: string;
    climaxPoint: string;
}

export interface QualityReport {
    overallScore: number;
    languageAccuracy: number;
    rhymeConsistency: number;
    emotionalCoherence: number;
    culturalAuthenticity: number;
    structuralIntegrity: number;
    issues: string[];
    recommendations: string[];
    approved: boolean;
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
    coverArt?: string;
    stylePrompt?: string;
    structure?: string;
    timestamp: number;
}

export interface CeremonyDefinition {
    id: string;
    label: string;
    defaultMood: string;
    defaultStyle: string;
    defaultComplexity: 'Simple' | 'Moderate' | 'Complex';
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
    coverArt?: string; // New field
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
    issues?: string[];
    recommendations?: string[];
}

export interface EmotionAnalysis {
    sentiment: string;
    navarasa: string;
    intensity: number;
    suggestedKeywords: string[];
    vibeDescription: string;
    // Configuration Suggestions
    suggestedMood: string;
    suggestedStyle: string;
    suggestedTheme: string;
    suggestedRhymeScheme: string;
    suggestedComplexity: 'Simple' | 'Moderate' | 'Complex';
    suggestedSingerConfig: string;
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

// Prompt Engineer Agent Types
export interface PromptEnhancementResult {
    enhancedPrompt: string;
    stylePrompt: string; // NEW: Style prompt for music generation
    inferredSettings: Partial<GenerationSettings>;
    confidenceScore: number;
    reasoningLog: string;
}

// Review Agent Enhanced Types
export interface RhymeValidation {
    scheme: string;
    violations: { line: number; issue: string }[];
}

export interface MeterAnalysis {
    consistent: boolean;
    issues: string[];
}

export interface ReviewReport {
    refinedLyrics: string;
    hallucinationIssues: string[];
    rhymeValidation: RhymeValidation;
    meterAnalysis: MeterAnalysis;
    suggestions: string[];
}

/**
 * Cultural Metaphor Engine Output
 * Provides region-specific metaphors, cultural context, and idiomatic expressions
 * for enhancing lyrics with authentic cultural flavor
 */
export interface CulturalMetaphorAnalysis {
    /** Primary cultural metaphors for the theme, region-specific */
    primaryMetaphors: CulturalMetaphor[];
    /** Cultural symbols and imagery relevant to the region */
    culturalSymbols: CulturalSymbol[];
    /** Region-specific idiomatic expressions */
    idiomaticExpressions: IdiomaticExpression[];
    /** Mythology and folklore references appropriate for the theme */
    mythologyReferences: MythologyReference[];
    /** Nature and environment metaphors from the target region */
    natureMetaphors: string[];
    /** Festival and celebration references */
    festivalReferences: FestivalReference[];
    /** Regional dialect variations and colloquialisms */
    dialectVariations: DialectVariation[];
    /** Cultural context summary for the lyricist */
    culturalContextSummary: string;
    /** Recommendations for culturally appropriate expression */
    usageRecommendations: string[];
    /** Cultural authenticity score (0-100) */
    authenticityScore: number;
}

export interface CulturalMetaphor {
    /** The metaphor in native script */
    metaphor: string;
    /** English translation/explanation */
    meaning: string;
    /** Cultural context or origin */
    context: string;
    /** Best use cases (love, celebration, devotion, etc.) */
    useCases: string[];
    /** Region/state where this is commonly used */
    region: string;
}

export interface CulturalSymbol {
    /** Symbol name in native script */
    symbol: string;
    /** What it represents */
    symbolism: string;
    /** Cultural significance */
    significance: string;
    /** When/how to use in lyrics */
    usageGuidance: string;
}

export interface IdiomaticExpression {
    /** The idiom in native script */
    expression: string;
    /** Literal translation */
    literalMeaning: string;
    /** Actual meaning/usage */
    actualMeaning: string;
    /** Emotional tone (joyful, melancholic, etc.) */
    tone: string;
}

export interface MythologyReference {
    /** Name/title of the reference */
    reference: string;
    /** Story or context */
    story: string;
    /** Emotional themes it evokes */
    themes: string[];
    /** How to incorporate in lyrics */
    incorporation: string;
}

export interface FestivalReference {
    /** Festival name */
    festival: string;
    /** Associated emotions and imagery */
    imagery: string[];
    /** Traditional elements */
    traditions: string[];
    /** Lyrical usage suggestions */
    lyricSuggestions: string[];
}

export interface DialectVariation {
    /** Standard form */
    standard: string;
    /** Regional variation */
    regional: string;
    /** Region/area where used */
    area: string;
    /** Connotation (formal, casual, poetic, etc.) */
    connotation: string;
}