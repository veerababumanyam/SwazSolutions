import React from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

interface MiniPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ isOpen, onClose }) => {
    const {
        currentSong,
        isPlaying,
        play,
        pause,
        next,
        prev,
        progress,
        duration,
        volume,
        setVolume
    } = useMusic();

    if (!isOpen || !currentSong) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-20 right-4 w-80 bg-surface/98 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-50 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="text-xs font-medium text-secondary">Mini Player</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Song Info */}
            <div className="p-4 space-y-3">
                {currentSong.cover ? (
                    <img
                        src={currentSong.cover}
                        alt={currentSong.title}
                        className="w-full aspect-square object-cover rounded-lg"
                    />
                ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg flex items-center justify-center">
                        <span className="text-4xl text-accent/30">♪</span>
                    </div>
                )}

                <div className="text-center">
                    <h3 className="font-bold text-primary truncate">{currentSong.title}</h3>
                    <p className="text-sm text-secondary truncate">{currentSong.artist || 'Unknown Artist'}</p>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="h-1 bg-background rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                            style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-secondary mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={prev}
                        className="p-2 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => isPlaying ? pause() : play()}
                        className="p-3 bg-accent hover:bg-accent/90 rounded-full text-white shadow-lg transition-all hover:scale-105"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={next}
                        className="p-2 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                        className="text-secondary"
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
                        className="flex-1 h-1 bg-background rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                    />
                    <span className="text-xs text-secondary w-8 text-right">{Math.round(volume * 100)}%</span>
                </div>
            </div>
        </div>
    );
};
