/**
 * Suno.com Export Utility
 *
 * Provides export functionality for generated lyrics in Suno.com compatible format.
 * Supports metadata embedding, multiple export formats, and proper section tagging.
 */

export interface LyricSection {
  sectionName: string;
  lines: string[];
}

export interface GeneratedLyricsForExport {
  title: string;
  language: string;
  mood?: string;
  genre?: string;
  sections: LyricSection[];
  stylePrompt?: string;
  coverUrl?: string;
  ragam?: string;
  taalam?: string;
  structure?: string;
}

export interface SunoExportOptions {
  includeMetadata?: boolean;
  includeStylePrompt?: boolean;
  includeSectionDividers?: boolean;
  includeInstrumentalTags?: boolean;
  format?: 'suno' | 'udio' | 'plain' | 'json';
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * Valid Suno.com section tags
 */
const SUNO_SECTION_TAGS = [
  '[Intro]',
  '[Verse]',
  '[Verse 1]',
  '[Verse 2]',
  '[Verse 3]',
  '[Chorus]',
  '[Pre-Chorus]',
  '[Post-Chorus]',
  '[Bridge]',
  '[Outro]',
  '[Hook]',
  '[Break]',
  '[Instrumental]',
  '[Interlude]',
  '[Drop]',
  '[Build]',
  '[Ad-lib]',
  '[Refrain]',
] as const;

/**
 * Normalize section name to Suno-compatible format
 */
const normalizeSectionName = (name: string): string => {
  // Remove extra whitespace and ensure proper bracket format
  let normalized = name.trim();

  // Add brackets if missing
  if (!normalized.startsWith('[')) {
    normalized = '[' + normalized;
  }
  if (!normalized.endsWith(']')) {
    normalized = normalized + ']';
  }

  // Capitalize first letter after bracket
  normalized = normalized.replace(/\[(\w)/, (_, char) => `[${char.toUpperCase()}`);

  return normalized;
};

/**
 * Generate Suno.com compatible style prompt from lyrics metadata
 */
const generateSunoStylePrompt = (lyrics: GeneratedLyricsForExport): string => {
  const tags: string[] = [];

  if (lyrics.genre) {
    tags.push(lyrics.genre);
  }

  if (lyrics.mood) {
    tags.push(lyrics.mood.toLowerCase());
  }

  if (lyrics.language && lyrics.language !== 'English') {
    tags.push(`${lyrics.language} vocals`);
  }

  // Add quality tags for better generation
  tags.push('high quality', 'professional', 'studio recording');

  // Add ragam/taalam for Indian classical music
  if (lyrics.ragam && lyrics.ragam !== 'N/A') {
    tags.push(`${lyrics.ragam} ragam`);
  }

  return tags.join(', ');
};

/**
 * Export lyrics in Suno.com compatible format
 * This is the primary format for music production
 */
export const exportToSunoFormat = (
  lyrics: GeneratedLyricsForExport,
  options: SunoExportOptions = {}
): ExportResult => {
  const {
    includeMetadata = true,
    includeStylePrompt = true,
    includeSectionDividers = false,
    includeInstrumentalTags = true,
  } = options;

  const lines: string[] = [];

  // Add metadata header as comments (Suno ignores lines starting with //)
  if (includeMetadata) {
    lines.push(`// Title: ${lyrics.title}`);
    lines.push(`// Language: ${lyrics.language}`);
    if (lyrics.mood) lines.push(`// Mood: ${lyrics.mood}`);
    if (lyrics.genre) lines.push(`// Genre: ${lyrics.genre}`);
    if (lyrics.ragam && lyrics.ragam !== 'N/A') lines.push(`// Ragam: ${lyrics.ragam}`);
    if (lyrics.taalam && lyrics.taalam !== 'N/A') lines.push(`// Taalam: ${lyrics.taalam}`);
    if (lyrics.structure) lines.push(`// Structure: ${lyrics.structure}`);
    lines.push('');
  }

  // Add style prompt for Suno's "Style of Music" input
  if (includeStylePrompt) {
    const stylePrompt = lyrics.stylePrompt || generateSunoStylePrompt(lyrics);
    lines.push(`// Style Prompt for Suno: ${stylePrompt}`);
    lines.push('');
  }

  // Add section divider before lyrics
  if (includeSectionDividers) {
    lines.push('// === LYRICS START ===');
    lines.push('');
  }

  // Process each section
  lyrics.sections.forEach((section, index) => {
    const sectionTag = normalizeSectionName(section.sectionName);

    // Add instrumental intro tag if this is the first section and option enabled
    if (index === 0 && includeInstrumentalTags && !sectionTag.toLowerCase().includes('intro')) {
      lines.push('[Instrumental Intro]');
      lines.push('');
    }

    // Add section tag
    lines.push(sectionTag);

    // Add section lines
    section.lines.forEach(line => {
      if (line.trim()) {
        lines.push(line);
      }
    });

    // Add blank line between sections
    lines.push('');
  });

  // Add instrumental outro tag if enabled
  if (includeInstrumentalTags) {
    const lastSection = lyrics.sections[lyrics.sections.length - 1];
    if (lastSection && !lastSection.sectionName.toLowerCase().includes('outro')) {
      lines.push('[Instrumental Outro]');
      lines.push('');
    }
  }

  // Add section divider after lyrics
  if (includeSectionDividers) {
    lines.push('// === LYRICS END ===');
  }

  const content = lines.join('\n').trim();
  const filename = `${sanitizeFilename(lyrics.title)}_suno.txt`;

  return {
    content,
    filename,
    mimeType: 'text/plain'
  };
};

/**
 * Export lyrics in Udio.com compatible format
 * Similar to Suno but with slight differences
 */
export const exportToUdioFormat = (
  lyrics: GeneratedLyricsForExport,
  options: SunoExportOptions = {}
): ExportResult => {
  const { includeMetadata = true, includeStylePrompt = true } = options;

  const lines: string[] = [];

  // Udio uses similar format but prefers simpler tags
  if (includeMetadata) {
    lines.push(`Title: ${lyrics.title}`);
    lines.push(`Language: ${lyrics.language}`);
    if (lyrics.mood) lines.push(`Mood: ${lyrics.mood}`);
    if (lyrics.genre) lines.push(`Genre: ${lyrics.genre}`);
    lines.push('---');
    lines.push('');
  }

  if (includeStylePrompt) {
    const stylePrompt = lyrics.stylePrompt || generateSunoStylePrompt(lyrics);
    lines.push(`Style: ${stylePrompt}`);
    lines.push('---');
    lines.push('');
  }

  // Process sections
  lyrics.sections.forEach((section) => {
    lines.push(normalizeSectionName(section.sectionName));
    section.lines.forEach(line => {
      if (line.trim()) {
        lines.push(line);
      }
    });
    lines.push('');
  });

  const content = lines.join('\n').trim();
  const filename = `${sanitizeFilename(lyrics.title)}_udio.txt`;

  return {
    content,
    filename,
    mimeType: 'text/plain'
  };
};

/**
 * Export lyrics in plain text format
 * Simple format without metadata or comments
 */
export const exportToPlainFormat = (
  lyrics: GeneratedLyricsForExport
): ExportResult => {
  const lines: string[] = [];

  // Just the title
  lines.push(lyrics.title);
  lines.push('');

  // Process sections
  lyrics.sections.forEach((section) => {
    lines.push(section.sectionName);
    section.lines.forEach(line => {
      if (line.trim()) {
        lines.push(line);
      }
    });
    lines.push('');
  });

  const content = lines.join('\n').trim();
  const filename = `${sanitizeFilename(lyrics.title)}.txt`;

  return {
    content,
    filename,
    mimeType: 'text/plain'
  };
};

/**
 * Export lyrics as JSON with full metadata
 * Useful for programmatic access and backup
 */
export const exportToJsonFormat = (
  lyrics: GeneratedLyricsForExport
): ExportResult => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    platform: 'SwazSolutions Lyric Studio',
    metadata: {
      title: lyrics.title,
      language: lyrics.language,
      mood: lyrics.mood || null,
      genre: lyrics.genre || null,
      ragam: lyrics.ragam || null,
      taalam: lyrics.taalam || null,
      structure: lyrics.structure || null,
      stylePrompt: lyrics.stylePrompt || generateSunoStylePrompt(lyrics),
      coverUrl: lyrics.coverUrl || null,
    },
    sections: lyrics.sections.map(section => ({
      tag: normalizeSectionName(section.sectionName),
      lines: section.lines.filter(line => line.trim()),
      lineCount: section.lines.filter(line => line.trim()).length,
    })),
    stats: {
      totalSections: lyrics.sections.length,
      totalLines: lyrics.sections.reduce((sum, s) => sum + s.lines.filter(l => l.trim()).length, 0),
      totalWords: lyrics.sections.reduce((sum, s) =>
        sum + s.lines.reduce((lineSum, line) => lineSum + line.trim().split(/\s+/).length, 0), 0
      ),
    },
    sunoCompatible: {
      lyrics: lyrics.sections
        .map(s => `${normalizeSectionName(s.sectionName)}\n${s.lines.filter(l => l.trim()).join('\n')}`)
        .join('\n\n'),
      stylePrompt: lyrics.stylePrompt || generateSunoStylePrompt(lyrics),
    }
  };

  const content = JSON.stringify(exportData, null, 2);
  const filename = `${sanitizeFilename(lyrics.title)}.json`;

  return {
    content,
    filename,
    mimeType: 'application/json'
  };
};

/**
 * Main export function that dispatches to the appropriate format
 */
export const exportLyrics = (
  lyrics: GeneratedLyricsForExport,
  options: SunoExportOptions = {}
): ExportResult => {
  const format = options.format || 'suno';

  switch (format) {
    case 'suno':
      return exportToSunoFormat(lyrics, options);
    case 'udio':
      return exportToUdioFormat(lyrics, options);
    case 'plain':
      return exportToPlainFormat(lyrics);
    case 'json':
      return exportToJsonFormat(lyrics);
    default:
      return exportToSunoFormat(lyrics, options);
  }
};

/**
 * Download exported lyrics as a file
 */
export const downloadLyrics = (
  lyrics: GeneratedLyricsForExport,
  options: SunoExportOptions = {}
): void => {
  const result = exportLyrics(lyrics, options);

  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  a.click();

  URL.revokeObjectURL(url);
};

/**
 * Copy lyrics to clipboard in specified format
 */
export const copyLyricsToClipboard = async (
  lyrics: GeneratedLyricsForExport,
  options: SunoExportOptions = {}
): Promise<boolean> => {
  try {
    const result = exportLyrics(lyrics, options);
    await navigator.clipboard.writeText(result.content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Get just the Suno-ready lyrics content (no metadata)
 * For pasting directly into Suno.com lyrics input
 */
export const getSunoLyricsOnly = (lyrics: GeneratedLyricsForExport): string => {
  return lyrics.sections
    .map(section => {
      const tag = normalizeSectionName(section.sectionName);
      const lines = section.lines.filter(line => line.trim()).join('\n');
      return `${tag}\n${lines}`;
    })
    .join('\n\n');
};

/**
 * Get the style prompt for Suno.com's "Style of Music" input
 */
export const getSunoStylePrompt = (lyrics: GeneratedLyricsForExport): string => {
  return lyrics.stylePrompt || generateSunoStylePrompt(lyrics);
};

/**
 * Sanitize filename for safe file system use
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100); // Limit length
};

/**
 * Export formats available
 */
export const EXPORT_FORMATS = [
  { id: 'suno', name: 'Suno.com', description: 'Optimized for Suno.com music generation', extension: '.txt' },
  { id: 'udio', name: 'Udio', description: 'Optimized for Udio music generation', extension: '.txt' },
  { id: 'plain', name: 'Plain Text', description: 'Simple text format', extension: '.txt' },
  { id: 'json', name: 'JSON', description: 'Full metadata in JSON format', extension: '.json' },
] as const;

export type ExportFormat = typeof EXPORT_FORMATS[number]['id'];
