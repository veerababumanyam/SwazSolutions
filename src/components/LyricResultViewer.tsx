
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import {
    Wand2, Image as ImageIcon, Save, Copy, Download, Printer, Share2,
    Play, Pause, Edit3, Code, Eye, RefreshCw, Music,
    Clock, ListMusic, Mic2, User, Users, Baby, ShieldCheck, AlertTriangle, X
} from 'lucide-react';
import { LazyImage } from './LazyImage';
import { GeneratedLyrics, SavedSong, ComplianceReport } from '../agents/types';
// import { runArtAgent } from '../agents/art'; // TODO: Create art agent
// import { runStyleAgent } from '../agents/style'; // TODO: Create style agent
// import { runMagicRhymesAgent } from '../agents/magic_rhymes'; // TODO: Create magic_rhymes agent
import { MODEL_FAST } from '../agents/config';

// Temporary stubs for missing agents
const runArtAgent = async (title: string, snippet: string, style: string, apiKey: string): Promise<string | null> => {
    console.warn('Art agent not implemented yet');
    return null;
};

const runStyleAgent = async (...args: any[]): Promise<any> => {
    console.warn('Style agent not implemented yet');
    return null;
};

const runMagicRhymesAgent = async (sections: any[], language: string, apiKey: string): Promise<any[]> => {
    console.warn('Magic rhymes agent not implemented yet');
    return sections; // Return unchanged sections
};

interface LyricResultViewerProps {
    lyricsData: GeneratedLyrics;
    stylePrompt: string;
    complianceData?: ComplianceReport;
    apiKey: string;
    onSaveToLibrary: (song: SavedSong) => void;
}

type ViewMode = 'VISUAL' | 'STUDIO' | 'SUNO';

export const LyricResultViewer: React.FC<LyricResultViewerProps> = ({
    lyricsData: initialLyrics,
    stylePrompt: initialStyle,
    complianceData,
    apiKey,
    onSaveToLibrary
}) => {
    const { showToast } = useToast();
    // State
    const [lyrics, setLyrics] = useState<GeneratedLyrics>(initialLyrics);
    const [stylePrompt, setStylePrompt] = useState(initialStyle);
    const [coverArt, setCoverArt] = useState<string | null>(initialLyrics.coverArt || null);
    const [viewMode, setViewMode] = useState<ViewMode>('VISUAL');
    const [showComplianceModal, setShowComplianceModal] = useState(false);

    // Editing State
    const [studioText, setStudioText] = useState('');

    // Loading States
    const [isGeneratingArt, setIsGeneratingArt] = useState(false);
    const [isFixingRhymes, setIsFixingRhymes] = useState(false);
    const [isEnhancingStyle, setIsEnhancingStyle] = useState(false);

    // Playback State
    const [playingSection, setPlayingSection] = useState<number | null>(null);
    const synth = window.speechSynthesis;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Sync Studio Text on Load
    useEffect(() => {
        const text = lyrics.sections.map(s => `${s.sectionName}\n${s.lines.join('\n')}`).join('\n\n');
        setStudioText(text);
    }, [lyrics]);

    // Update local state when props change (re-generation)
    useEffect(() => {
        setLyrics(initialLyrics);
        setStylePrompt(initialStyle);
        setCoverArt(initialLyrics.coverArt || null);
    }, [initialLyrics, initialStyle]);

    // --- Helpers ---

    const handlePlaySection = (text: string, index: number) => {
        if (playingSection === index) {
            synth.cancel();
            setPlayingSection(null);
            return;
        }

        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        // Simple heuristic for lang
        if (lyrics.language.toLowerCase().includes('hindi')) utterance.lang = 'hi-IN';
        else if (lyrics.language.toLowerCase().includes('tamil')) utterance.lang = 'ta-IN';
        else if (lyrics.language.toLowerCase().includes('telugu')) utterance.lang = 'te-IN';
        else utterance.lang = 'en-US';

        utterance.rate = 0.9;
        utterance.onend = () => setPlayingSection(null);

        utteranceRef.current = utterance;
        setPlayingSection(index);
        synth.speak(utterance);
    };

    const getSectionColor = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('chorus') || lower.includes('hook')) return 'border-amber-500/50 bg-amber-500/5 text-amber-900 dark:text-amber-100';
        if (lower.includes('female') || lower.includes('whisper')) return 'border-pink-500/50 bg-pink-500/5 text-pink-900 dark:text-pink-100';
        if (lower.includes('male') || lower.includes('rap')) return 'border-blue-500/50 bg-blue-500/5 text-blue-900 dark:text-blue-100';
        if (lower.includes('duet') || lower.includes('both')) return 'border-purple-500/50 bg-purple-500/5 text-purple-900 dark:text-purple-100';
        if (lower.includes('instrumental') || lower.includes('intro') || lower.includes('drop')) return 'border-emerald-500/50 bg-emerald-500/5 text-emerald-900 dark:text-emerald-100 dashed border-2';
        return 'border-border bg-surface text-primary';
    };

    const getTagIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('female')) return <User className="w-3 h-3" />;
        if (lower.includes('male')) return <User className="w-3 h-3" />;
        if (lower.includes('duet') || lower.includes('chorus')) return <Users className="w-3 h-3" />;
        if (lower.includes('child')) return <Baby className="w-3 h-3" />;
        if (lower.includes('instrumental')) return <Music className="w-3 h-3" />;
        return <Mic2 className="w-3 h-3" />;
    };

    // --- Actions ---

    const handleMagicRhymes = async () => {
        if (!apiKey) return showToast("API Key Required", "error");
        setIsFixingRhymes(true);
        try {
            const fixedSections = await runMagicRhymesAgent(lyrics.sections, lyrics.language, apiKey);
            setLyrics(prev => ({ ...prev, sections: fixedSections }));
        } catch (e) {
            console.error(e);
            showToast("Failed to fix rhymes.", "error");
        } finally {
            setIsFixingRhymes(false);
        }
    };

    const handleAlbumArt = async () => {
        if (!apiKey) return showToast("API Key Required", "error");
        setIsGeneratingArt(true);
        try {
            const lyricSnippet = lyrics.sections[0]?.lines.join(" ") || "";
            const artUrl = await runArtAgent(lyrics.title, lyricSnippet, lyrics.ragam || "Cinematic", apiKey);
            if (artUrl) setCoverArt(artUrl);
        } catch (e) {
            console.error(e);
            showToast("Failed to generate art.", "error");
        } finally {
            setIsGeneratingArt(false);
        }
    };

    const handleSave = () => {
        const songData: SavedSong = {
            id: Date.now().toString(),
            title: lyrics.title,
            content: studioText,
            language: lyrics.language,
            coverArt: coverArt || undefined,
            stylePrompt: stylePrompt,
            structure: lyrics.structure,
            timestamp: Date.now()
        };
        onSaveToLibrary(songData);
        showToast("Song saved to library!", "success");
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!", "success");
    };

    // --- Renders ---

    return (
        <div className="flex flex-col h-full max-h-full overflow-hidden bg-background/50 rounded-3xl shadow-2xl border border-border animate-fade-in relative">

            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 border-b border-border bg-surface/80 backdrop-blur-md gap-3 z-20">

                {/* View Tabs */}
                <div className="flex p-1 bg-background border border-border rounded-xl overflow-x-auto no-scrollbar">
                    {[
                        { id: 'VISUAL', icon: Eye, label: 'Visual' },
                        { id: 'STUDIO', icon: Edit3, label: 'Studio' },
                        { id: 'SUNO', icon: Code, label: 'Suno' }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as ViewMode)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === mode.id
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-secondary hover:text-primary hover:bg-surface'
                                }`}
                        >
                            <mode.icon className="w-3.5 h-3.5" />
                            <span>{mode.label}</span>
                        </button>
                    ))}
                </div>

                {/* AI Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMagicRhymes}
                        disabled={isFixingRhymes || !apiKey}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50"
                        title="Fix Rhymes"
                    >
                        <Wand2 className={`w-4 h-4 ${isFixingRhymes ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={handleAlbumArt}
                        disabled={isGeneratingArt || !apiKey}
                        className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors disabled:opacity-50"
                        title="Generate Art"
                    >
                        <ImageIcon className={`w-4 h-4 ${isGeneratingArt ? 'animate-pulse' : ''}`} />
                    </button>

                    <button
                        onClick={handleSave}
                        className="p-2 text-secondary hover:text-primary hover:bg-surface border border-transparent hover:border-border rounded-xl transition-colors"
                        title="Save"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin relative print:p-0 print:overflow-visible">

                <div className="max-w-3xl mx-auto relative z-10 space-y-6">

                    {/* Metadata & Art Header */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Album Art */}
                        <div className="group relative w-32 h-32 sm:w-40 sm:h-40 aspect-square rounded-2xl shadow-lg bg-gradient-to-br from-surface to-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {coverArt ? (
                                <>
                                    <LazyImage src={coverArt} alt="Cover" className="w-full h-full object-cover" blurPlaceholder />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => { const a = document.createElement('a'); a.href = coverArt; a.download = 'cover.jpg'; a.click(); }} className="p-2 bg-white rounded-full hover:scale-110 transition-transform"><Download className="w-4 h-4 text-black" /></button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-2">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-1 text-muted" />
                                    <button onClick={handleAlbumArt} disabled={!apiKey} className="text-[10px] text-accent font-bold hover:underline">Generate Art</button>
                                </div>
                            )}
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 space-y-3 min-w-0">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight leading-tight truncate">{lyrics.title}</h1>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-secondary flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> {lyrics.language}
                                    </span>
                                    {lyrics.ragam && (
                                        <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-secondary flex items-center gap-1">
                                            <Wand2 className="w-3 h-3 text-purple-500" /> {lyrics.ragam}
                                        </span>
                                    )}
                                </div>

                                {/* Compliance Badge */}
                                {complianceData && (
                                    <button
                                        onClick={() => setShowComplianceModal(true)}
                                        className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-transform hover:scale-105 cursor-pointer ${complianceData.originalityScore > 80
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                            }`}
                                    >
                                        {complianceData.originalityScore > 80 ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                        <div className="flex flex-col leading-none items-start">
                                            <span className="text-[10px] font-bold uppercase opacity-70">Originality</span>
                                            <span className="text-xs font-black">{complianceData.originalityScore}%</span>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Style Prompt Mini */}
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 font-mono text-[10px] relative group cursor-pointer" onClick={() => setViewMode('SUNO')}>
                                <div className="text-accent mb-1 font-bold flex items-center gap-1">// Style Prompt</div>
                                <p className="line-clamp-2 opacity-80 group-hover:opacity-100">{stylePrompt}</p>
                            </div>
                        </div>
                    </div>

                    {/* MODE CONTENT */}
                    <div className="min-h-[300px]">

                        {/* VISUAL MODE */}
                        {viewMode === 'VISUAL' && (
                            <div className="space-y-4">
                                {lyrics.sections.map((section, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-5 rounded-2xl border transition-all hover:shadow-sm group relative ${getSectionColor(section.sectionName)}`}
                                    >
                                        <div className="flex justify-between items-center mb-3 border-b border-black/5 pb-2">
                                            <span className="font-black uppercase tracking-wider text-xs flex items-center gap-2 opacity-70">
                                                {getTagIcon(section.sectionName)}
                                                {section.sectionName.replace(/[\[\]]/g, '')}
                                            </span>
                                            <button
                                                onClick={() => handlePlaySection(section.lines.join('. '), idx)}
                                                className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-current opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {playingSection === idx ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                                            </button>
                                        </div>
                                        <div className="space-y-2 font-medium text-base leading-relaxed">
                                            {section.lines.map((line, lIdx) => (
                                                <p key={lIdx} className="opacity-90 hover:opacity-100">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STUDIO MODE */}
                        {viewMode === 'STUDIO' && (
                            <div className="h-full">
                                <textarea
                                    value={studioText}
                                    onChange={(e) => setStudioText(e.target.value)}
                                    className="w-full h-[500px] p-4 rounded-xl bg-surface border-2 border-dashed border-border focus:border-accent focus:ring-0 font-mono text-sm leading-loose resize-none shadow-inner"
                                    placeholder="Edit your lyrics here..."
                                ></textarea>
                            </div>
                        )}

                        {/* SUNO MODE */}
                        {viewMode === 'SUNO' && (
                            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-2xl overflow-hidden">
                                <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                                    <span className="text-xs font-bold text-slate-500">Suno.com Format</span>
                                    <button onClick={() => handleCopy(studioText)} className="text-[10px] font-bold text-accent hover:text-white flex items-center gap-1">
                                        <Copy className="w-3 h-3" /> Copy
                                    </button>
                                </div>
                                <div className="font-mono text-xs text-slate-300 space-y-4">
                                    <div>
                                        <span className="text-purple-400 font-bold">[Style]</span>
                                        <div className="mt-1 p-2 bg-slate-900 rounded text-emerald-300 break-words border border-slate-800">
                                            {stylePrompt}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-purple-400 font-bold">[Lyrics]</span>
                                        <div className="mt-1 pl-2 border-l-2 border-slate-800 text-slate-400 whitespace-pre-wrap leading-relaxed">
                                            {studioText}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Compliance Report Modal */}
            {showComplianceModal && complianceData && (
                <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-accent" /> Compliance Report
                            </h3>
                            <button onClick={() => setShowComplianceModal(false)} className="p-1 hover:bg-background rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center">
                                <div className={`text-4xl font-black mb-2 ${complianceData.originalityScore > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {complianceData.originalityScore}%
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-secondary">Originality Score</div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-secondary uppercase mb-2">Verdict</h4>
                                <div className="p-3 bg-surface border border-border rounded-lg text-sm font-medium">
                                    {complianceData.verdict}
                                </div>
                            </div>

                            {complianceData.flaggedPhrases && complianceData.flaggedPhrases.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-secondary uppercase mb-2">Flagged Phrases</h4>
                                    <div className="space-y-1">
                                        {complianceData.flaggedPhrases.map((p, i) => (
                                            <div key={i} className="text-xs p-2 bg-red-50 text-red-700 rounded border border-red-100">
                                                "{p}"
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
