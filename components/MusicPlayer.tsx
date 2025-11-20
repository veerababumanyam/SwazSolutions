
import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Heart, AlertCircle, ListMusic } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

const Visualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        // Initialize bars with some variation
        let bars = Array(32).fill(0).map((_, i) => Math.sin(i * 0.5) * 5 + 5);

        const render = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bars.length) - 2;
            const color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-main').trim().replace('rgb(', '').replace(')', '');

            bars = bars.map((h, i) => {
                if (!isPlaying) return Math.max(2, h * 0.95); // Smooth decay when paused

                // Simulate frequency data: combines sine waves with noise
                // Use time to create moving wave patterns
                const wave = Math.sin(time * 0.005 + i * 0.2) * 0.3 + 0.5;
                const noise = Math.random() * 0.5;
                const targetHeight = (wave + noise) * height * 0.8;

                // Smooth transition to target
                return h + (targetHeight - h) * 0.2;
            });

            bars.forEach((h, i) => {
                const x = i * (barWidth + 2);
                const y = (height - h) / 2; // Center vertically

                // Gradient fill
                const gradient = ctx.createLinearGradient(0, y, 0, y + h);
                // Convert space-separated RGB to comma-separated for rgba()
                const rgbaColor = color.replace(/ /g, ', ');
                gradient.addColorStop(0, `rgba(${rgbaColor}, 0.8)`);
                gradient.addColorStop(1, `rgba(${rgbaColor}, 0.2)`);

                ctx.fillStyle = gradient;
                // Rounded bars
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, h, 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying]);

    return <canvas ref={canvasRef} width={240} height={40} className="opacity-80" />;
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
        likedSongs
    } = useMusic();

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300">
            {/* Error Notification */}
            {error && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-slide-up cursor-pointer" onClick={clearError}>
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            {/* Progress Bar */}
            <div className="absolute -top-1 left-0 right-0 h-1 bg-background group cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seek(percent * duration);
            }}>
                <div
                    className="h-full bg-accent transition-all duration-100 relative"
                    style={{ width: `${(progress / duration) * 100}%` }}
                >
                    <div className="absolute right-0 -top-1.5 w-3 h-3 bg-accent rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-2 md:py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* 1. Track Info */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="relative group flex-shrink-0">
                            <img
                                src={currentSong.cover || "https://via.placeholder.com/150"}
                                alt={currentSong.title}
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
                        >
                            <Heart className={`w-4 h-4 ${likedSongs.has(currentSong.id) ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* 2. Controls (Center) */}
                    <div className="flex flex-col items-center gap-1 flex-[2]">
                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                onClick={toggleShuffle}
                                className={`hidden md:block p-2 rounded-full transition-all ${isShuffling ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary hover:bg-background'}`}
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>

                            <button onClick={prev} className="p-2 text-primary hover:text-accent transition-colors">
                                <SkipBack className="w-5 h-5 fill-current" />
                            </button>

                            <button
                                onClick={isPlaying ? pause : play}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                            </button>

                            <button onClick={next} className="p-2 text-primary hover:text-accent transition-colors">
                                <SkipForward className="w-5 h-5 fill-current" />
                            </button>

                            <button
                                onClick={toggleRepeat}
                                className={`hidden md:block p-2 rounded-full transition-all relative ${repeatMode !== 'off' ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary hover:bg-background'}`}
                            >
                                <Repeat className="w-4 h-4" />
                                {repeatMode === 'one' && <span className="absolute top-1 right-1 text-[8px] font-bold leading-none">1</span>}
                            </button>
                        </div>

                        {/* Desktop Progress Time */}
                        <div className="hidden md:flex items-center justify-between w-full max-w-xs text-[10px] text-secondary font-medium">
                            <span>{formatTime(progress)}</span>
                            <span className="mx-2 opacity-50">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* 3. Volume & Visualizer (Right) */}
                    <div className="flex items-center justify-end gap-2 flex-1 min-w-0">

                        <div className="hidden lg:block mr-4">
                            <Visualizer isPlaying={isPlaying} />
                        </div>

                        <div className="hidden md:flex items-center gap-2 group">
                            <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-secondary">
                                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input
                                type="range" min="0" max="1" step="0.01" value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
