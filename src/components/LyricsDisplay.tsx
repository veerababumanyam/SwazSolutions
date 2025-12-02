
import React, { useEffect, useState, useRef } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { parseLRC, fetchLyrics } from '../utils/lyrics';
import { LyricsData } from '../types';
import { Music, Loader2 } from 'lucide-react';

export const LyricsDisplay: React.FC = () => {
    const { currentSong, progress } = useMusic();
    const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentSong) {
            setLyricsData(null);
            return;
        }

        const loadLyrics = async () => {
            setLoading(true);
            try {
                let rawLyrics = '';
                if (currentSong.lyrics) {
                    if (currentSong.lyrics.startsWith('http') || currentSong.lyrics.startsWith('/')) {
                        const fetched = await fetchLyrics(currentSong.lyrics);
                        if (fetched) rawLyrics = fetched;
                    } else {
                        rawLyrics = currentSong.lyrics;
                    }
                }

                if (rawLyrics) {
                    setLyricsData(parseLRC(rawLyrics));
                } else {
                    setLyricsData(null);
                }
            } catch (e) {
                console.error("Error loading lyrics", e);
                setLyricsData(null);
            } finally {
                setLoading(false);
            }
        };

        loadLyrics();
    }, [currentSong]);

    // Find active line
    useEffect(() => {
        if (!lyricsData) return;

        // Find the last line that has a time <= current progress
        const index = lyricsData.lines.findLastIndex(line => line.time <= progress);
        setActiveLineIndex(index);
    }, [progress, lyricsData]);

    // Auto-scroll
    useEffect(() => {
        if (activeLineIndex !== -1 && scrollRef.current) {
            const activeEl = scrollRef.current.children[activeLineIndex] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeLineIndex]);

    if (!currentSong) return null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-secondary animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading Lyrics...</p>
            </div>
        );
    }

    if (!lyricsData || lyricsData.lines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted opacity-50">
                <Music className="w-16 h-16 mb-4" />
                <p className="text-xl font-bold">No Lyrics Available</p>
                <p className="text-sm">Enjoy the music!</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-hide px-4 py-10 text-center" ref={scrollRef}>
            <div className="space-y-6 max-w-2xl mx-auto">
                {lyricsData.lines.map((line, index) => {
                    const isActive = index === activeLineIndex;
                    const isPast = index < activeLineIndex;

                    return (
                        <p
                            key={index}
                            className={`
                                transition-all duration-500 text-2xl md:text-3xl font-bold leading-relaxed cursor-pointer hover:opacity-100
                                ${isActive ? 'text-accent scale-105 opacity-100' : isPast ? 'text-primary opacity-40 blur-[1px]' : 'text-primary opacity-30'}
                            `}
                            onClick={() => {
                                // Optional: Seek to this line
                                // seek(line.time);
                            }}
                        >
                            {line.text}
                        </p>
                    );
                })}
            </div>
        </div>
    );
};
