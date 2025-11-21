import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Heart, AlertCircle, Sliders, List, Minimize2, Maximize2 } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { AdvancedEqualizer } from './AdvancedEqualizer';
import { QueuePanel } from './QueuePanel';
import { ThemeToggle } from './ThemeToggle';
import { MiniPlayer } from './MiniPlayer';

const Visualizer: React.FC<{ analyser: AnalyserNode | null, isPlaying: boolean }> = ({ analyser, isPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        // Use a safe default if analyser is missing to prevent crashes, though it won't animate
        const bufferLength = analyser ? analyser.frequencyBinCount : 128;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const width = canvas.width;
            const height = canvas.height;

            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                // Smooth decay to zero
                for (let i = 0; i < dataArray.length; i++) {
                    dataArray[i] = Math.max(0, dataArray[i] - 5);
                }
            }

            // Render more bars for better detail
            const bars = 60;
            const barWidth = (width / bars) - 1;
            let x = 0;

            // Get accent color from CSS variable or fallback
            const style = getComputedStyle(document.documentElement);
            const accentColor = style.getPropertyValue('--color-accent-main').trim() || '#ff4b4b';

            for (let i = 0; i < bars; i++) {
                // Map bars to frequency range (focus on bass/mids)
                const index = Math.floor(i * (bufferLength / (bars * 2)));
                const value = dataArray[index] || 0;

                const barHeight = (value / 255) * height;

                if (barHeight > 0) {
                    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                    gradient.addColorStop(0, accentColor);
                    gradient.addColorStop(1, `${accentColor}33`); // 20% opacity

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
                    } else {
                        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                    }
                    ctx.fill();
                }

                x += barWidth + 1;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [analyser, isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={40}
            className="opacity-90"
            role="img"
            aria-label="Audio visualizer showing frequency spectrum"
        />
    );
};

export const MusicPlayer: React.FC = () => {
    const {
        currentSong,
        isPlaying,
        play,
        pause,
        next,
        prev,
        seek,
        volume,
        setVolume,
        progress,
        duration,
        isShuffling,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        error,
        clearError,
        toggleLike,
        likedSongs,
        analyser
    } = useMusic();

    const [isEqOpen, setIsEqOpen] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);

    // Listen for keyboard shortcut events
    useEffect(() => {
        const handleToggleQueue = () => setIsQueueOpen(prev => !prev);
        window.addEventListener('toggle-queue', handleToggleQueue);
        return () => window.removeEventListener('toggle-queue', handleToggleQueue);
    }, []);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                seek(Math.max(0, progress - 5));
                break;
            case 'ArrowRight':
                e.preventDefault();
                seek(Math.min(duration, progress + 5));
                break;
            case 'Home':
                e.preventDefault();
                seek(0);
                break;
            case 'End':
                e.preventDefault();
                seek(duration);
                break;
        }
    };

    if (!currentSong) return null;

    const remainingTime = duration - progress;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300">
            {/* Error Notification */}
            {error && (
                <div
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-slide-up cursor-pointer"
                    onClick={clearError}
                    role="alert"
                    aria-live="assertive"
                >
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            <div className="container mx-auto px-4 py-2 md:py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* 1. Track Info */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="relative group flex-shrink-0">
                            <img
                                src={currentSong.cover || "/placeholder-album.png"}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-album.png";
                                }}
                                alt={`Album cover for ${currentSong.title}`}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-sm border border-border ${isPlaying ? 'animate-pulse' : ''}`}
                            />
                        </div>
                        <div className="min-w-0 hidden sm:block">
                            <h4 className="font-bold text-primary truncate text-sm">{currentSong.title}</h4>
                            <p className="text-xs text-secondary truncate">{currentSong.artist}</p>
                        </div>
                        <button
                            onClick={() => toggleLike(currentSong.id)}
                            className={`p-2 rounded-full hover:bg-background transition-colors ${likedSongs.has(currentSong.id) ? 'text-accent' : 'text-muted'}`}
                            aria-label={likedSongs.has(currentSong.id) ? `Unlike ${currentSong.title}` : `Like ${currentSong.title}`}
                            aria-pressed={likedSongs.has(currentSong.id)}
                        >
                            <Heart className={`w-4 h-4 ${likedSongs.has(currentSong.id) ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* 2. Controls (Center) */}
                    <div className="flex flex-col items-center gap-2 flex-[2] max-w-md w-full">
                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                onClick={toggleShuffle}
                                className={`hidden md:block p-2 rounded-full transition-all ${isShuffling ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary hover:bg-background'}`}
                                aria-label={isShuffling ? "Disable shuffle" : "Enable shuffle"}
                                aria-pressed={isShuffling}
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>

                            <button
                                onClick={prev}
                                className="p-2 text-primary hover:text-accent transition-colors"
                                aria-label="Previous track"
                            >
                                <SkipBack className="w-5 h-5 fill-current" />
                            </button>

                            <button
                                onClick={isPlaying ? pause : play}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 fill-current" />
                                ) : (
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                )}
                            </button>

                            <button
                                onClick={next}
                                className="p-2 text-primary hover:text-accent transition-colors"
                                aria-label="Next track"
                            >
                                <SkipForward className="w-5 h-5 fill-current" />
                            </button>

                            <button
                                onClick={toggleRepeat}
                                className={`hidden md:block p-2 rounded-full transition-all relative ${repeatMode !== 'off' ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary hover:bg-background'}`}
                                aria-label={`Repeat mode: ${repeatMode === 'off' ? 'off' : repeatMode === 'all' ? 'all songs' : 'one song'}`}
                                aria-pressed={repeatMode !== 'off'}
                            >
                                <Repeat className="w-4 h-4" />
                                {repeatMode === 'one' && <span className="absolute top-1 right-1 text-[8px] font-bold leading-none">1</span>}
                            </button>
                        </div>

                        {/* Scrubber Bar */}
                        <div className="w-full flex items-center gap-3 px-4 md:px-0">
                            <span
                                className="text-xs font-semibold text-primary w-10 text-right tabular-nums"
                                aria-label={`Current time: ${formatTime(progress)}`}
                            >
                                {formatTime(progress)}
                            </span>
                            <div
                                role="slider"
                                aria-label="Seek position"
                                aria-valuemin={0}
                                aria-valuemax={Math.floor(duration)}
                                aria-valuenow={Math.floor(progress)}
                                aria-valuetext={`${formatTime(progress)} of ${formatTime(duration)}`}
                                tabIndex={0}
                                className="flex-1 h-1.5 bg-secondary/30 rounded-full cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    seek(percent * duration);
                                }}
                                onKeyDown={handleProgressKeyDown}
                            >
                                <div
                                    className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-100"
                                    style={{ width: `${(progress / duration) * 100}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
                                    style={{ left: `${(progress / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                />
                            </div>
                            <span
                                className="text-xs font-semibold text-primary w-12 tabular-nums"
                                aria-label={`Time remaining: ${formatTime(remainingTime)}`}
                            >
                                -{formatTime(remainingTime)}
                            </span>
                        </div>
                    </div>

                    {/* 3. Volume & Visualizer (Right) */}
                    <div className="flex items-center justify-end gap-2 flex-1 min-w-0 relative">

                        <div className="hidden lg:block mr-4">
                            <Visualizer analyser={analyser} isPlaying={isPlaying} />
                        </div>

                        {/* EQ Toggle */}
                        <button
                            onClick={() => setIsEqOpen(!isEqOpen)}
                            className={`p-2 rounded-full transition-all ${isEqOpen ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary'}`}
                            aria-label={isEqOpen ? "Close equalizer" : "Open equalizer"}
                            aria-pressed={isEqOpen}
                        >
                            <Sliders className="w-4 h-4" />
                        </button>

                        <div className="hidden md:flex items-center gap-2 group">
                            <button
                                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                                className="text-secondary"
                                aria-label={volume === 0 ? "Unmute" : "Mute"}
                            >
                                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
                                aria-label="Volume"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(volume * 100)}
                                aria-valuetext={`${Math.round(volume * 100)} percent`}
                            />
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Mini Player Toggle */}
                        <button
                            onClick={() => setShowMiniPlayer(true)}
                            className="px-3 py-1.5 bg-background hover:bg-border rounded-lg text-sm text-primary hover:text-accent transition-colors flex items-center gap-2"
                            title="Mini Player"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>

                        {/* Queue Button */}
                        <button
                            onClick={() => setIsQueueOpen(true)}
                            className="px-3 py-1.5 bg-background hover:bg-border rounded-lg text-sm text-primary hover:text-accent transition-colors flex items-center gap-2"
                            title="Queue"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced Equalizer Panel */}
            <AdvancedEqualizer isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />

            {/* Mini Player */}
            <MiniPlayer isOpen={showMiniPlayer} onClose={() => setShowMiniPlayer(false)} />

            {/* Queue Panel */}
            <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
        </div>
    );
};
