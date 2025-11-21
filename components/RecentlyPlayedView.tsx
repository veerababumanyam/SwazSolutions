import React from 'react';
import { Play, Clock } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

export const RecentlyPlayedView: React.FC = () => {
    const { recentlyPlayed, library, playTrack } = useMusic();

    // Get song details for each played song
    const recentSongs = recentlyPlayed
        .map(({ songId, playedAt }) => {
            const song = library.find(s => s.id === songId);
            return song ? { song, playedAt } : null;
        })
        .filter((item): item is { song: any; playedAt: number } => item !== null);

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    if (recentSongs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="w-16 h-16 text-secondary/30 mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No Recent Plays</h3>
                <p className="text-sm text-secondary">Your recently played tracks will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Recently Played
                </h2>
                <span className="text-sm text-secondary">{recentSongs.length} tracks</span>
            </div>

            <div className="space-y-2">
                {recentSongs.map(({ song, playedAt }, index) => (
                    <div
                        key={`${song.id}-${playedAt}-${index}`}
                        className="group list-item-interactive"
                        onClick={() => playTrack(song)}
                    >
                        {/* Album Cover */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                            {song.cover ? (
                                <img
                                    src={song.cover}
                                    alt={song.title}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 rounded-md flex items-center justify-center">
                                    <span className="text-accent/30 text-lg">♪</span>
                                </div>
                            )}

                            {/* Play overlay on hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-primary truncate group-hover:text-accent transition-colors">
                                {song.title}
                            </h3>
                            <p className="text-sm text-secondary truncate">
                                {song.artist || 'Unknown Artist'}
                            </p>
                        </div>

                        {/* Time Ago */}
                        <div className="text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatTime(playedAt)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
