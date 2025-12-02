
import { LyricsData, LyricsLine } from '../types';

export const parseLRC = (lrc: string): LyricsData => {
    const lines = lrc.split('\n');
    const parsed: LyricsLine[] = [];
    // Regex for [mm:ss.xx] or [mm:ss.xxx]
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

    for (const line of lines) {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0; // Handle missing ms
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = line.replace(timeRegex, '').trim();

            // Skip empty lines unless you want them as spacers
            if (text) {
                parsed.push({ time, text });
            }
        }
    }

    // Sort by time just in case
    parsed.sort((a, b) => a.time - b.time);

    return { lines: parsed, source: 'lrc' };
};

export const fetchLyrics = async (src: string): Promise<string | null> => {
    try {
        const response = await fetch(src);
        if (!response.ok) return null;
        return await response.text();
    } catch (e) {
        console.error("Failed to fetch lyrics:", e);
        return null;
    }
};
