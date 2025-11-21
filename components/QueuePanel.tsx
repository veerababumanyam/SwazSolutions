import React, { useState } from 'react';
import { X, Play, Pause, Trash2, Save, Music } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { Song } from '../types';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose }) => {
    const {
        queue,
        currentIndex,
        currentSong,
        isPlaying,
        playTrackByIndex,
        setQueue,
        createPlaylist
    } = useMusic();

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    const upNext = queue.slice(currentIndex + 1);
    const previous = queue.slice(0, currentIndex);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index + currentIndex + 1); // Offset for upNext
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        const targetActualIndex = targetIndex + currentIndex + 1;
        if (draggedIndex === targetActualIndex) return;

        const newQueue = [...queue];
        const [draggedSong] = newQueue.splice(draggedIndex, 1);
        newQueue.splice(targetActualIndex, 0, draggedSong);
        setQueue(newQueue);
        setDraggedIndex(null);
    };

    const removeFromQueue = (index: number) => {
        const actualIndex = index + currentIndex + 1;
        setQueue(queue.filter((_, i) => i !== actualIndex));
    };

    const clearQueue = () => {
        if (confirm('Clear all upcoming songs from queue?')) {
            setQueue(queue.slice(0, currentIndex + 1));
        }
    };

    const saveAsPlaylist = () => {
        const name = prompt('Enter playlist name:');
        if (name?.trim()) {
            createPlaylist(name.trim(), `Saved from queue on ${new Date().toLocaleDateString()}`);
            // Note: Would need to add songs to playlist after creation in a real scenario
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-surface/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-primary flex items-center gap-2">
                            <Music className="w-5 h-5 text-accent" />
                            Queue
                        </h2>
                        <p className="text-xs text-secondary mt-1">
                            {queue.length} song{queue.length !== 1 ? 's' : ''} • {upNext.length} up next
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Actions */}
                <div className="px-6 py-3 border-b border-border flex items-center gap-2">
                    <button
                        onClick={clearQueue}
                        disabled={upNext.length === 0}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-background hover:bg-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-3 h-3" />
                        Clear Queue
                    </button>
                    <button
                        onClick={saveAsPlaylist}
                        disabled={queue.length === 0}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-3 h-3" />
                        Save as Playlist
                    </button>
                </div>

                {/* Queue List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">

                    {/* Now Playing */}
                    {currentSong && (
                        <div className="p-4 border-b border-border">
                            <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Now Playing</h3>
                            <div className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-xl">
                                <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-surface">
                                    {currentSong.cover ? (
                                        <img
                                            src={currentSong.cover}
                                            alt={currentSong.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                                            <Music className="w-5 h-5 text-accent" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-accent truncate">{currentSong.title}</h4>
                                    <p className="text-xs text-secondary truncate">{currentSong.artist}</p>
                                </div>
                                {isPlaying && (
                                    <div className="flex gap-0.5 items-end h-4">
                                        <div className="w-1 bg-accent rounded-full animate-music-bar-1" style={{ height: '100%' }} />
                                        <div className="w-1 bg-accent rounded-full animate-music-bar-2" style={{ height: '60%' }} />
                                        <div className="w-1 bg-accent rounded-full animate-music-bar-3" style={{ height: '80%' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Up Next */}
                    {upNext.length > 0 ? (
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Up Next</h3>
                            <div className="space-y-1">
                                {upNext.map((song, idx) => (
                                    <div
                                        key={`${song.id}-${idx}`}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-border"
                                    >
                                        <div className="w-4 text-xs font-bold text-muted text-center">{idx + 1}</div>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm flex-shrink-0 bg-background">
                                            {song.cover ? (
                                                <img
                                                    src={song.cover}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                                                    <Music className="w-3 h-3 text-accent" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-primary truncate">{song.title}</h4>
                                            <p className="text-xs text-secondary truncate">{song.artist}</p>
                                        </div>
                                        <div className="hidden sm:block text-xs text-secondary font-mono">
                                            {formatDuration(song.duration)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playTrackByIndex(idx + currentIndex + 1, queue);
                                                }}
                                                className="p-1.5 hover:bg-accent/10 hover:text-accent rounded-full transition-colors"
                                                title="Play Now"
                                            >
                                                <Play className="w-3 h-3 fill-current" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromQueue(idx);
                                                }}
                                                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Music className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" />
                            <p className="text-secondary text-sm">Queue is empty</p>
                            <p className="text-muted text-xs mt-1">Add songs to start playing</p>
                        </div>
                    )}

                    {/* Previously Played (Optional) */}
                    {previous.length > 0 && (
                        <div className="p-4 border-t border-border">
                            <details className="group">
                                <summary className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 cursor-pointer list-none flex items-center gap-2">
                                    Previously Played ({previous.length})
                                    <span className="text-muted group-open:rotate-90 transition-transform">›</span>
                                </summary>
                                <div className="space-y-1 mt-3">
                                    {previous.reverse().map((song, idx) => (
                                        <div
                                            key={`${song.id}-prev-${idx}`}
                                            className="flex items-center gap-3 p-2 rounded-xl opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-background">
                                                {song.cover ? (
                                                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                                                        <Music className="w-3 h-3 text-accent" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-xs text-primary truncate">{song.title}</h4>
                                                <p className="text-[10px] text-secondary truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
