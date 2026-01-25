/**
 * Lyric Studio UI - "Cinematic Soundwave" Aesthetic
 *
 * A dark, atmospheric interface with neon accents that evokes
 * professional music production. Features glowing visualizations,
 * grain textures, and dynamic soundwave animations.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Mic2, Music, Sparkles, Wand2, Languages, Heart, Palette,
  Copy, Check, Download, Edit3, RefreshCw, Loader2,
  ChevronDown, Play, Pause, Volume2, X, Save, Trash2,
  Zap, Waves, Radio, Settings2, AlertCircle, Image, ImagePlus,
  FileText, FileJson, Share2
} from 'lucide-react';
import { loadApiKey, saveApiKey as persistApiKey } from '../utils/storage';
import { ALL_LANGUAGES } from '../agents/constants';
import {
  exportLyrics,
  downloadLyrics as downloadLyricsUtil,
  copyLyricsToClipboard,
  getSunoLyricsOnly,
  getSunoStylePrompt,
  EXPORT_FORMATS,
  type ExportFormat,
  type GeneratedLyricsForExport
} from '../utils/sunoExport';

// Types
interface LyricSection {
  sectionName: string;
  lines: string[];
  isEditing?: boolean;
}

interface GeneratedLyrics {
  title: string;
  language: string;
  mood: string;
  genre: string;
  sections: LyricSection[];
  stylePrompt?: string;
  coverUrl?: string;
}

interface GeneratedCover {
  url: string;
  filename: string;
}

interface GenerationInputs {
  theme: string;
  mood: string;
  genre: string;
  language: string;
  customPrompt: string;
}

// Constants
const MOODS = [
  'Joyful', 'Melancholic', 'Romantic', 'Energetic', 'Devotional',
  'Nostalgic', 'Aggressive', 'Chill', 'Ethereal', 'Epic',
  'Heartbroken', 'Hopeful', 'Mysterious', 'Playful', 'Spiritual'
];

const GENRES = [
  'Cinematic', 'Folk', 'Classical', 'Pop', 'Rap/Hip-Hop',
  'EDM', 'R&B', 'Lofi', 'Rock', 'Bollywood', 'Carnatic',
  'Bhajan', 'Ghazal', 'Sufi', 'Jazz', 'Blues'
];

// Use the comprehensive language list from constants (23 languages including all Indian languages)
const LANGUAGES = ALL_LANGUAGES;

const THEMES = [
  'Love', 'Heartbreak', 'Nature', 'Celebration', 'Devotion',
  'Friendship', 'Journey', 'Revolution', 'Philosophy', 'Fantasy'
];

// Album cover style presets
const COVER_STYLES = [
  'Cinematic', 'Folk', 'Electronic', 'Classical', 'Hiphop',
  'Bollywood', 'Devotional', 'Rock', 'Jazz', 'Lofi',
  'Minimalist', 'Abstract', 'Vintage', 'Watercolor', 'Digital',
  'Photography', 'Illustration', 'Surreal'
];

// Soundwave Animation Component
const SoundwaveVisualizer: React.FC<{ isActive: boolean; className?: string }> = ({ isActive, className }) => (
  <div className={`flex items-end justify-center gap-[3px] h-6 ${className}`}>
    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((height, i) => (
      <div
        key={i}
        className={`w-[3px] rounded-full transition-all duration-150 ${
          isActive
            ? 'bg-gradient-to-t from-cyan-500 to-violet-500 animate-pulse'
            : 'bg-slate-600'
        }`}
        style={{
          height: isActive ? `${height * 4 + Math.random() * 8}px` : `${height * 2}px`,
          animationDelay: `${i * 50}ms`,
          animationDuration: isActive ? '0.3s' : '0s'
        }}
      />
    ))}
  </div>
);

// Glow Card Component
const GlowCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'violet' | 'rose' | 'amber';
}> = ({ children, className = '', glowColor = 'cyan' }) => {
  const glowClasses = {
    cyan: 'hover:shadow-cyan-500/20 hover:border-cyan-500/30',
    violet: 'hover:shadow-violet-500/20 hover:border-violet-500/30',
    rose: 'hover:shadow-rose-500/20 hover:border-rose-500/30',
    amber: 'hover:shadow-amber-500/20 hover:border-amber-500/30',
  };

  return (
    <div className={`
      relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50
      rounded-2xl transition-all duration-500
      hover:shadow-2xl ${glowClasses[glowColor]}
      ${className}
    `}>
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Select Input Component with custom styling
const StyledSelect: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  glowColor?: 'cyan' | 'violet' | 'rose' | 'amber';
}> = ({ label, icon, value, options, onChange, glowColor = 'cyan' }) => {
  const colorClasses = {
    cyan: 'focus:ring-cyan-500/50 focus:border-cyan-500',
    violet: 'focus:ring-violet-500/50 focus:border-violet-500',
    rose: 'focus:ring-rose-500/50 focus:border-rose-500',
    amber: 'focus:ring-amber-500/50 focus:border-amber-500',
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 tracking-wide">
        <span className={`text-${glowColor}-400`}>{icon}</span>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full bg-slate-800/60 border border-slate-600/50 rounded-xl
            px-4 py-3 text-slate-200 font-medium
            appearance-none cursor-pointer
            transition-all duration-300
            focus:outline-none focus:ring-2 ${colorClasses[glowColor]}
            hover:bg-slate-800/80 hover:border-slate-500/50
          `}
        >
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};

// Lyric Line Component with inline editing
const LyricLine: React.FC<{
  line: string;
  index: number;
  sectionIndex: number;
  onEdit: (sectionIndex: number, lineIndex: number, newText: string) => void;
  isGenerating: boolean;
}> = ({ line, index, sectionIndex, onEdit, isGenerating }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(line);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(line);
  }, [line]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onEdit(sectionIndex, index, editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(line);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 group animate-fade-in">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-slate-800/80 border border-cyan-500/50 rounded-lg px-3 py-2
                     text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
        <button
          onClick={handleSave}
          className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        group flex items-center gap-3 px-4 py-2 rounded-xl
        transition-all duration-300 cursor-pointer
        hover:bg-slate-800/50 hover:pl-6
        ${isGenerating ? 'animate-pulse' : ''}
      `}
      onClick={() => !isGenerating && setIsEditing(true)}
    >
      <span className="text-slate-400 text-sm font-mono opacity-50 w-6 text-right">
        {String(index + 1).padStart(2, '0')}
      </span>
      <p className="flex-1 text-slate-200 font-medium leading-relaxed">
        {line || <span className="text-slate-500 italic">Empty line</span>}
      </p>
      <Edit3 className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

// Section Component
const LyricSectionCard: React.FC<{
  section: LyricSection;
  sectionIndex: number;
  onEditLine: (sectionIndex: number, lineIndex: number, newText: string) => void;
  onDeleteSection: (sectionIndex: number) => void;
  isGenerating: boolean;
}> = ({ section, sectionIndex, onEditLine, onDeleteSection, isGenerating }) => {
  const sectionColors: Record<string, { bg: string; border: string; text: string }> = {
    '[Intro]': { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
    '[Verse]': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    '[Verse 1]': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    '[Verse 2]': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    '[Chorus]': { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
    '[Bridge]': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    '[Outro]': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    '[Hook]': { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
  };

  const colors = sectionColors[section.sectionName] || {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400'
  };

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden border ${colors.border}
        transition-all duration-500 animate-fade-in
      `}
      style={{ animationDelay: `${sectionIndex * 100}ms` }}
    >
      {/* Section Header */}
      <div className={`${colors.bg} px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Music className={`w-4 h-4 ${colors.text}`} />
          <span className={`font-bold tracking-wide ${colors.text}`}>
            {section.sectionName}
          </span>
          <span className="text-slate-500 text-sm">
            {section.lines.length} lines
          </span>
        </div>
        <button
          onClick={() => onDeleteSection(sectionIndex)}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10
                     rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Section Lines */}
      <div className="py-3 space-y-1">
        {section.lines.map((line, lineIndex) => (
          <LyricLine
            key={lineIndex}
            line={line}
            index={lineIndex}
            sectionIndex={sectionIndex}
            onEdit={onEditLine}
            isGenerating={isGenerating}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
export const LyricStudioUI: React.FC = () => {
  // State
  const [inputs, setInputs] = useState<GenerationInputs>({
    theme: 'Love',
    mood: 'Romantic',
    genre: 'Cinematic',
    language: 'Telugu',
    customPrompt: ''
  });

  const [lyrics, setLyrics] = useState<GeneratedLyrics | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState(() => loadApiKey() || '');
  const [showSettings, setShowSettings] = useState(false);

  // Album cover state
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverStyle, setCoverStyle] = useState('Cinematic');
  const [coverPrompt, setCoverPrompt] = useState('');

  // Export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>('suno');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedSunoLyrics, setCopiedSunoLyrics] = useState(false);
  const [copiedStylePrompt, setCopiedStylePrompt] = useState(false);

  // Refs
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Handlers
  const handleInputChange = (field: keyof GenerationInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const generateLyrics = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key in settings');
      setShowSettings(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build prompt
      const prompt = inputs.customPrompt.trim() ||
        `Write a ${inputs.mood.toLowerCase()} ${inputs.genre.toLowerCase()} song about ${inputs.theme.toLowerCase()} in ${inputs.language}`;

      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKey
        },
        body: JSON.stringify({
          userRequest: prompt,
          languageProfile: {
            primary: inputs.language,
            secondary: inputs.language,
            tertiary: inputs.language
          },
          generationSettings: {
            theme: inputs.theme,
            mood: inputs.mood,
            style: inputs.genre,
            complexity: 'Moderate'
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to generate lyrics');
      }

      // Parse the response
      const lyricsText = data.data.lyrics || data.data;
      let sections: LyricSection[] = [];

      if (typeof lyricsText === 'string') {
        // Parse sections from text
        const lines = lyricsText.split('\n');
        let currentSection: LyricSection = { sectionName: '[Verse]', lines: [] };

        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.match(/^\[.+\]$/)) {
            if (currentSection.lines.length > 0) {
              sections.push(currentSection);
            }
            currentSection = { sectionName: trimmed, lines: [] };
          } else if (trimmed) {
            currentSection.lines.push(trimmed);
          }
        });

        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
      } else if (data.data.sections) {
        sections = data.data.sections;
      }

      // Ensure we have at least one section
      if (sections.length === 0) {
        sections = [{ sectionName: '[Lyrics]', lines: [lyricsText || 'No lyrics generated'] }];
      }

      setLyrics({
        title: data.data.title || `${inputs.theme} Song`,
        language: inputs.language,
        mood: inputs.mood,
        genre: inputs.genre,
        sections,
        stylePrompt: data.data.stylePrompt || `${inputs.genre}, ${inputs.mood}, ${inputs.language}`
      });

      // Scroll to lyrics
      setTimeout(() => {
        lyricsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate lyrics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, inputs]);

  const handleEditLine = (sectionIndex: number, lineIndex: number, newText: string) => {
    if (!lyrics) return;

    const newSections = [...lyrics.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      lines: newSections[sectionIndex].lines.map((line, i) =>
        i === lineIndex ? newText : line
      )
    };

    setLyrics({ ...lyrics, sections: newSections });
  };

  const handleDeleteSection = (sectionIndex: number) => {
    if (!lyrics) return;

    const newSections = lyrics.sections.filter((_, i) => i !== sectionIndex);
    setLyrics({ ...lyrics, sections: newSections });
  };

  // Convert current lyrics to export format
  const getLyricsForExport = useCallback((): GeneratedLyricsForExport | null => {
    if (!lyrics) return null;
    return {
      title: lyrics.title,
      language: lyrics.language,
      mood: lyrics.mood,
      genre: lyrics.genre,
      sections: lyrics.sections,
      stylePrompt: lyrics.stylePrompt,
      coverUrl: coverImage || lyrics.coverUrl,
    };
  }, [lyrics, coverImage]);

  const copyToClipboard = async () => {
    const lyricsForExport = getLyricsForExport();
    if (!lyricsForExport) return;

    const success = await copyLyricsToClipboard(lyricsForExport, { format: exportFormat });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Copy just the Suno-ready lyrics (no metadata)
  const copySunoLyrics = async () => {
    const lyricsForExport = getLyricsForExport();
    if (!lyricsForExport) return;

    const sunoLyrics = getSunoLyricsOnly(lyricsForExport);
    await navigator.clipboard.writeText(sunoLyrics);
    setCopiedSunoLyrics(true);
    setTimeout(() => setCopiedSunoLyrics(false), 2000);
  };

  // Copy the style prompt for Suno
  const copyStylePrompt = async () => {
    const lyricsForExport = getLyricsForExport();
    if (!lyricsForExport) return;

    const stylePrompt = getSunoStylePrompt(lyricsForExport);
    await navigator.clipboard.writeText(stylePrompt);
    setCopiedStylePrompt(true);
    setTimeout(() => setCopiedStylePrompt(false), 2000);
  };

  const downloadLyrics = () => {
    const lyricsForExport = getLyricsForExport();
    if (!lyricsForExport) return;

    downloadLyricsUtil(lyricsForExport, { format: exportFormat });
  };

  const saveApiKeyHandler = () => {
    persistApiKey(apiKey);
    setShowSettings(false);
    setError(null);
  };

  // Album cover generation handler
  const generateCover = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key in settings');
      setShowSettings(true);
      return;
    }

    if (!lyrics) {
      setError('Generate lyrics first before creating album cover');
      return;
    }

    setIsGeneratingCover(true);
    setError(null);

    try {
      const response = await fetch('/api/album-covers/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKey
        },
        body: JSON.stringify({
          lyrics: lyrics,
          style: coverStyle.toLowerCase(),
          genre: lyrics.genre || inputs.genre,
          mood: lyrics.mood || inputs.mood,
          customPrompt: coverPrompt.trim() || undefined,
          aspectRatio: '1:1',
          numberOfImages: 1
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to generate album cover');
      }

      // Validate response has covers
      if (!data.data?.covers?.length) {
        throw new Error('No cover images were generated');
      }

      // Set the cover image URL
      const generatedCover = data.data.covers[0];
      setCoverImage(generatedCover.url);

      // Update lyrics with cover URL
      setLyrics(prev => prev ? { ...prev, coverUrl: generatedCover.url } : prev);

    } catch (err: any) {
      console.error('Cover generation error:', err);
      setError(err.message || 'Failed to generate album cover. Please try again.');
    } finally {
      setIsGeneratingCover(false);
    }
  }, [apiKey, lyrics, coverStyle, coverPrompt, inputs.genre, inputs.mood]);

  // Download album cover
  const downloadCover = () => {
    if (!coverImage) return;

    const a = document.createElement('a');
    a.href = coverImage;
    a.download = `${lyrics?.title?.replace(/\s+/g, '_') || 'album'}_cover.png`;
    a.click();
  };

  // Regenerate cover with new variation
  const regenerateCover = useCallback(async () => {
    if (!apiKey.trim() || !lyrics) return;

    setIsGeneratingCover(true);
    setError(null);

    try {
      const response = await fetch('/api/album-covers/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKey
        },
        body: JSON.stringify({
          prompt: coverPrompt.trim() || `Album cover for ${lyrics.title}, ${lyrics.genre} style, ${lyrics.mood} mood`,
          style: coverStyle.toLowerCase(),
          aspectRatio: '1:1'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to regenerate album cover');
      }

      // Validate response has cover
      if (!data.data?.cover?.url) {
        throw new Error('No cover image was generated');
      }

      setCoverImage(data.data.cover.url);
      setLyrics(prev => prev ? { ...prev, coverUrl: data.data.cover.url } : prev);

    } catch (err: any) {
      console.error('Cover regeneration error:', err);
      setError(err.message || 'Failed to regenerate album cover. Please try again.');
    } finally {
      setIsGeneratingCover(false);
    }
  }, [apiKey, lyrics, coverStyle, coverPrompt]);

  return (
    <>
      <Helmet>
        <title>Lyric Studio | Swaz Solutions</title>
        <meta name="description" content="AI-powered lyric generation studio. Create songs in multiple languages with customizable themes, moods, and genres." />
      </Helmet>

      {/* Main Container - Dark atmospheric background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-2xl border border-cyan-500/20">
                <Radio className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                  Lyric Studio
                </span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              AI-powered songwriting with emotional intelligence. Create, edit, and export production-ready lyrics.
            </p>
            <SoundwaveVisualizer isActive={isGenerating} className="mt-6" />
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <GlowCard className="w-full max-w-md p-6" glowColor="violet">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-100">Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl
                                 px-4 py-3 text-slate-200 placeholder-slate-500
                                 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Get your free API key from{' '}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  <button
                    onClick={saveApiKeyHandler}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500
                               text-white font-bold rounded-xl
                               hover:from-violet-500 hover:to-violet-400
                               transition-all duration-300 shadow-lg shadow-violet-500/25"
                  >
                    Save API Key
                  </button>
                </div>
              </GlowCard>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-200 font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-400 text-sm hover:underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-2 space-y-6">
              <GlowCard className="p-6" glowColor="cyan">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Generation Settings
                  </h2>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
                               rounded-lg transition-all"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Theme */}
                  <StyledSelect
                    label="Theme"
                    icon={<Palette className="w-4 h-4" />}
                    value={inputs.theme}
                    options={THEMES}
                    onChange={(v) => handleInputChange('theme', v)}
                    glowColor="cyan"
                  />

                  {/* Mood */}
                  <StyledSelect
                    label="Mood"
                    icon={<Heart className="w-4 h-4" />}
                    value={inputs.mood}
                    options={MOODS}
                    onChange={(v) => handleInputChange('mood', v)}
                    glowColor="rose"
                  />

                  {/* Genre */}
                  <StyledSelect
                    label="Genre"
                    icon={<Music className="w-4 h-4" />}
                    value={inputs.genre}
                    options={GENRES}
                    onChange={(v) => handleInputChange('genre', v)}
                    glowColor="violet"
                  />

                  {/* Language */}
                  <StyledSelect
                    label="Language"
                    icon={<Languages className="w-4 h-4" />}
                    value={inputs.language}
                    options={LANGUAGES}
                    onChange={(v) => handleInputChange('language', v)}
                    glowColor="amber"
                  />

                  {/* Custom Prompt */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 tracking-wide">
                      <Wand2 className="w-4 h-4 text-emerald-400" />
                      Custom Prompt (Optional)
                    </label>
                    <textarea
                      value={inputs.customPrompt}
                      onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                      placeholder="Describe your song idea in detail..."
                      rows={3}
                      className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl
                                 px-4 py-3 text-slate-200 placeholder-slate-500 resize-none
                                 transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                                 hover:bg-slate-800/80 hover:border-slate-500/50"
                    />
                    <p className="text-xs text-slate-500">
                      Leave empty to use settings above, or describe exactly what you want.
                    </p>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateLyrics}
                    disabled={isGenerating}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg
                      flex items-center justify-center gap-3
                      transition-all duration-500 shadow-xl
                      ${isGenerating
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-cyan-500 via-violet-500 to-rose-500 text-white hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]'
                      }
                    `}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Composing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6" />
                        Generate Lyrics
                      </>
                    )}
                  </button>
                </div>
              </GlowCard>

              {/* Quick Tips Card */}
              <GlowCard className="p-5" glowColor="violet">
                <h3 className="text-sm font-bold text-violet-400 mb-3 flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  Pro Tips
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Click any line to edit it directly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400">•</span>
                    Use custom prompts for specific requests
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">•</span>
                    Copy lyrics for Suno.com or Udio export
                  </li>
                </ul>
              </GlowCard>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-3" ref={lyricsContainerRef}>
              <GlowCard className="p-6 min-h-[500px]" glowColor="violet">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {lyrics?.title || 'Generated Lyrics'}
                    </h2>
                    {lyrics && (
                      <p className="text-sm text-slate-400 mt-1">
                        {lyrics.language} • {lyrics.mood} • {lyrics.genre}
                      </p>
                    )}
                  </div>

                  {lyrics && (
                    <div className="flex items-center gap-2">
                      {/* Copy button */}
                      <button
                        onClick={copyToClipboard}
                        className={`
                          p-2.5 rounded-xl transition-all duration-300
                          ${copied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }
                        `}
                        title={`Copy as ${EXPORT_FORMATS.find(f => f.id === exportFormat)?.name || 'Suno'} format`}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>

                      {/* Export dropdown */}
                      <div className="relative" ref={exportMenuRef}>
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800/50 text-slate-400 rounded-xl
                                     hover:text-slate-200 hover:bg-slate-800 transition-all"
                          title="Export options"
                        >
                          <Download className="w-5 h-5" />
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Export dropdown menu */}
                        {showExportMenu && (
                          <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                            <div className="p-2 border-b border-slate-700">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                                Export Format
                              </p>
                            </div>
                            <div className="p-1">
                              {EXPORT_FORMATS.map((format) => (
                                <button
                                  key={format.id}
                                  onClick={() => {
                                    setExportFormat(format.id as ExportFormat);
                                    downloadLyrics();
                                    setShowExportMenu(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                                    ${exportFormat === format.id
                                      ? 'bg-cyan-500/20 text-cyan-300'
                                      : 'text-slate-300 hover:bg-slate-700/50'
                                    }`}
                                >
                                  {format.id === 'json' ? (
                                    <FileJson className="w-4 h-4" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{format.name}</p>
                                    <p className="text-xs text-slate-500">{format.description}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="p-2 border-t border-slate-700">
                              <button
                                onClick={() => {
                                  copySunoLyrics();
                                  setShowExportMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
                              >
                                <Share2 className="w-4 h-4 text-violet-400" />
                                <div>
                                  <p className="text-sm font-medium">Copy for Suno</p>
                                  <p className="text-xs text-slate-500">Lyrics only, ready to paste</p>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Regenerate button */}
                      <button
                        onClick={generateLyrics}
                        disabled={isGenerating}
                        className="p-2.5 bg-slate-800/50 text-slate-400 rounded-xl
                                   hover:text-cyan-400 hover:bg-cyan-500/10 transition-all
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Regenerate"
                      >
                        <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Lyrics Display */}
                {lyrics ? (
                  <div className="space-y-6">
                    {/* Style Prompt Banner - Suno.com ready */}
                    {lyrics.stylePrompt && (
                      <div className="p-4 bg-gradient-to-r from-slate-800/80 to-slate-800/40
                                      rounded-xl border border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic2 className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                              Suno Style Prompt
                            </span>
                            <span className="text-xs text-slate-500">
                              (paste into "Style of Music")
                            </span>
                          </div>
                          <button
                            onClick={copyStylePrompt}
                            className={`text-xs transition-colors ${
                              copiedStylePrompt
                                ? 'text-emerald-400'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {copiedStylePrompt ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-sm text-slate-300 mt-2 font-mono">
                          {lyrics.stylePrompt}
                        </p>
                      </div>
                    )}

                    {/* Quick Export Panel for Suno */}
                    <div className="p-4 bg-gradient-to-r from-violet-900/20 to-rose-900/20
                                    rounded-xl border border-violet-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-bold text-violet-300">
                            Quick Export to Suno.com
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={copySunoLyrics}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            copiedSunoLyrics
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
                          }`}
                        >
                          {copiedSunoLyrics ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedSunoLyrics ? 'Lyrics Copied!' : 'Copy Lyrics'}
                        </button>
                        <button
                          onClick={copyStylePrompt}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            copiedStylePrompt
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
                          }`}
                        >
                          {copiedStylePrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedStylePrompt ? 'Style Copied!' : 'Copy Style'}
                        </button>
                        <button
                          onClick={() => {
                            setExportFormat('suno');
                            downloadLyrics();
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-violet-600/30 text-violet-200
                                     border border-violet-500/30 rounded-lg text-sm font-medium
                                     hover:bg-violet-600/40 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download Suno File
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Copy lyrics and style prompt separately for Suno.com, or download a complete file with metadata.
                      </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                      {lyrics.sections.map((section, sectionIndex) => (
                        <LyricSectionCard
                          key={sectionIndex}
                          section={section}
                          sectionIndex={sectionIndex}
                          onEditLine={handleEditLine}
                          onDeleteSection={handleDeleteSection}
                          isGenerating={isGenerating}
                        />
                      ))}
                    </div>

                    {/* Album Cover Section */}
                    <div className="mt-8 pt-8 border-t border-slate-700/50">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <ImagePlus className="w-5 h-5 text-violet-400" />
                          Album Artwork
                        </h3>
                        {coverImage && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={downloadCover}
                              className="p-2 bg-slate-800/50 text-slate-400 rounded-xl
                                         hover:text-slate-200 hover:bg-slate-800 transition-all"
                              title="Download cover"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={regenerateCover}
                              disabled={isGeneratingCover}
                              className="p-2 bg-slate-800/50 text-slate-400 rounded-xl
                                         hover:text-violet-400 hover:bg-violet-500/10 transition-all
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Regenerate cover"
                            >
                              <RefreshCw className={`w-5 h-5 ${isGeneratingCover ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        )}
                      </div>

                      {coverImage ? (
                        <div className="space-y-4">
                          {/* Cover Preview */}
                          <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
                            <img
                              src={coverImage}
                              alt={lyrics.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                            opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white text-sm font-medium truncate">
                                  {lyrics.title}
                                </p>
                                <p className="text-slate-300 text-xs">
                                  {coverStyle} • {lyrics.genre}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Style selector for regeneration */}
                          <div className="space-y-3">
                            <StyledSelect
                              label="Cover Style"
                              icon={<Palette className="w-4 h-4" />}
                              value={coverStyle}
                              options={COVER_STYLES}
                              onChange={setCoverStyle}
                              glowColor="violet"
                            />
                            <button
                              onClick={regenerateCover}
                              disabled={isGeneratingCover}
                              className={`
                                w-full py-3 rounded-xl font-medium
                                flex items-center justify-center gap-2
                                transition-all duration-300
                                ${isGeneratingCover
                                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-800/50 text-slate-300 hover:bg-violet-500/20 hover:text-violet-300'
                                }
                              `}
                            >
                              {isGeneratingCover ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-5 h-5" />
                                  Generate New Variation
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Cover Generation Form */
                        <div className="space-y-5">
                          {/* Empty State Preview */}
                          <div className="aspect-square bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700/50
                                          flex flex-col items-center justify-center p-8 text-center">
                            <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                              <Image className="w-12 h-12 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium mb-1">No Cover Generated</p>
                            <p className="text-xs text-slate-500 max-w-[200px]">
                              Generate AI album artwork based on your lyrics
                            </p>
                          </div>

                          {/* Style Selector */}
                          <StyledSelect
                            label="Cover Style"
                            icon={<Palette className="w-4 h-4" />}
                            value={coverStyle}
                            options={COVER_STYLES}
                            onChange={setCoverStyle}
                            glowColor="violet"
                          />

                          {/* Custom Prompt (Optional) */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 tracking-wide">
                              <Wand2 className="w-4 h-4 text-violet-400" />
                              Custom Description (Optional)
                            </label>
                            <textarea
                              value={coverPrompt}
                              onChange={(e) => setCoverPrompt(e.target.value)}
                              placeholder="Describe specific visual elements you want..."
                              rows={2}
                              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl
                                         px-4 py-3 text-slate-200 placeholder-slate-500 resize-none
                                         transition-all duration-300
                                         focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
                                         hover:bg-slate-800/80 hover:border-slate-500/50"
                            />
                          </div>

                          {/* Generate Button */}
                          <button
                            onClick={generateCover}
                            disabled={isGeneratingCover}
                            className={`
                              w-full py-4 rounded-xl font-bold text-lg
                              flex items-center justify-center gap-3
                              transition-all duration-500 shadow-xl
                              ${isGeneratingCover
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 text-white hover:shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98]'
                              }
                            `}
                          >
                            {isGeneratingCover ? (
                              <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Creating Artwork...
                              </>
                            ) : (
                              <>
                                <ImagePlus className="w-6 h-6" />
                                Generate Album Cover
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="p-6 bg-slate-800/30 rounded-full mb-6 animate-pulse">
                      <Radio className="w-12 h-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">
                      Ready to Create
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      Configure your settings and click Generate to create AI-powered lyrics
                    </p>
                    <SoundwaveVisualizer isActive={false} className="mt-8 opacity-30" />
                  </div>
                )}
              </GlowCard>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-slate-600 text-sm">
              Powered by Gemini AI • Swaz Solutions
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LyricStudioUI;
