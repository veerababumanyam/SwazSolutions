
import React, { useState, useMemo, useEffect } from 'react';
import { MusicSidebar, ViewType } from '../components/MusicSidebar';
import { MusicPlayer } from '../components/MusicPlayer';
import { LyricsDisplay } from '../components/LyricsDisplay';
import { RecentlyPlayedView } from '../components/RecentlyPlayedView';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { SearchHistoryDropdown } from '../components/SearchHistoryDropdown';
import { useMusic } from '../contexts/MusicContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
    Menu, Music, Play, Pause, Heart, MoreHorizontal,
    PlusCircle, Radio, Disc, ChevronDown, ChevronUp, Trash2,
    Folder, ListMusic, RefreshCw, Library, Clock, Mic2, Search
} from 'lucide-react';
import { Song } from '../types';

interface BaseViewData {
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    songs: Song[];
}

interface PlaylistViewData extends BaseViewData {
    type: 'playlist';
    playlistId: string;
}

interface AlbumViewData extends BaseViewData {
    type: 'album-detail';
    albumId: string;
    cover?: string;
}

interface GenericViewData extends BaseViewData {
    type: 'generic';
}

type ViewData = PlaylistViewData | AlbumViewData | GenericViewData;

// Helper to format seconds to MM:SS
const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const MusicPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>({ type: 'all' });
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Listen for help toggle
    useEffect(() => {
        const handleToggleHelp = () => setShowHelp(prev => !prev);
        window.addEventListener('toggle-help', handleToggleHelp);
        return () => window.removeEventListener('toggle-help', handleToggleHelp);
    }, []);

    const {
        currentSong, isPlaying, playTrack, playPlaylist, playAlbum,
        likedSongs, toggleLike, playlists, library, albums, isScanning,
        addToQueue, addSongToPlaylist, removeSongFromPlaylist, moveSongInPlaylist,
        setQueue, playTrackByIndex
    } = useMusic();

    // Context Menu State for Songs
    const [songMenu, setSongMenu] = useState<{ id: string, x: number, y: number } | null>(null);
    const [addToPlaylistMode, setAddToPlaylistMode] = useState<string | null>(null); // Song ID being added

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    // Handle broken images
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/placeholder-album.png';
    };

    // --- Data Filtering ---
    const getViewData = (): ViewData => {
        if (currentView.type === 'all') {
            return { type: 'generic', title: 'All Songs', subtitle: 'Library', icon: Music, songs: library };
        }
        if (currentView.type === 'recently-played') {
            return {
                type: 'generic',
                title: 'Recently Played',
                subtitle: 'History',
                icon: Clock,
                songs: [] // Handled by component
            };
        }
        if (currentView.type === 'favorites') {
            return {
                type: 'generic',
                title: 'Liked Songs',
                subtitle: 'Your Collection',
                icon: Heart,
                songs: library.filter(s => likedSongs.has(s.id))
            };
        }
        if (currentView.type === 'playlist') {
            const playlist = playlists.find(p => p.id === currentView.id);
            if (!playlist) return { type: 'generic', title: 'Playlist Not Found', icon: Disc, songs: [] };

            // Resolve IDs to Songs using getSongById equivalent logic
            const songs = playlist.trackIds
                .map(id => library.find(s => s.id === id))
                .filter((s): s is Song => !!s);

            return {
                type: 'playlist',
                title: playlist.name,
                subtitle: 'Playlist',
                icon: Disc,
                songs,
                playlistId: playlist.id
            };
        }
        if (currentView.type === 'album-detail') {
            const album = albums.find(a => a.id === currentView.id);
            if (!album) return { type: 'generic', title: 'Album Not Found', icon: Disc, songs: [] };
            return {
                type: 'album-detail',
                title: album.title,
                subtitle: 'Album',
                icon: Disc,
                songs: album.tracks,
                albumId: album.id,
                cover: album.cover
            };
        }
        if (currentView.type === 'albums') {
            return { type: 'generic', title: 'Albums', subtitle: 'Library', icon: Disc, songs: [] };
        }
        if (currentView.type === 'lyrics') {
            return { type: 'generic', title: 'Lyrics', subtitle: 'Now Playing', icon: Mic2, songs: [] };
        }
        return { type: 'generic', title: 'Now Playing', icon: Radio, songs: [] };
    };

    const viewData = getViewData();

    // Filter by Search
    const displayedSongs = useMemo(() => {
        if (!viewData.songs) return [];
        return viewData.songs.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.album.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [viewData.songs, searchQuery]);

    // --- Render Helpers ---
    const renderSongRow = (song: Song, index: number, playlistId?: string) => {
        const isCurrent = currentSong?.id === song.id;
        const isLiked = likedSongs.has(song.id);

        return (
            <div
                key={`${song.id}-${index}`}
                className={`group flex items-center gap-3 p-2 rounded-xl transition-all border border-transparent ${isCurrent ? 'bg-accent/5 border-accent/10' : 'hover:bg-surface border-b-border/50 hover:border-transparent'}`}
            >
                {/* Number / Play Btn */}
                <div className="w-8 text-center text-xs font-bold text-muted group-hover:hidden">
                    {index + 1}
                </div>
                <button
                    onClick={() => {
                        // Queue all displayed songs and play from clicked index for auto-play support
                        if (playlistId) {
                            playPlaylist(playlistId, index);
                        } else if (viewData.type === 'album-detail') {
                            playAlbum(viewData.albumId, index);
                        } else {
                            // For song list views, set queue to all displayed songs
                            setQueue(displayedSongs);
                            playTrackByIndex(index, displayedSongs);
                        }
                    }}
                    className="w-8 h-8 hidden group-hover:flex items-center justify-center bg-accent text-white rounded-full shadow-md hover:scale-105 transition-transform"
                >
                    {isCurrent && isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                </button>

                {/* Cover (Hide in Album View since it's redundant) */}
                {viewData.type !== 'album-detail' && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm bg-surface">
                        {song.cover ? (
                            <img
                                src={song.cover || '/placeholder-album.png'}
                                onError={handleImageError}
                                alt={song.album}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-orange/20 flex items-center justify-center">
                                <Music className="w-4 h-4 text-accent" />
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${isCurrent ? 'text-accent' : 'text-primary'}`}>{song.title}</div>
                    <div className="text-xs text-secondary truncate">{song.artist}</div>
                </div>

                {/* Album (Desktop) - Hide in Album View */}
                {viewData.type !== 'album-detail' && (
                    <div className="hidden md:block w-1/3 text-xs text-secondary truncate opacity-70">{song.album}</div>
                )}

                {/* Duration */}
                <div className="hidden sm:block w-12 text-right text-xs text-secondary font-mono opacity-70">
                    {formatDuration(song.duration)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleLike(song.id)} className={`p-2 rounded-full hover:bg-background ${isLiked ? 'text-accent' : 'text-secondary'}`}>
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Playlist Specific Actions */}
                    {playlistId && (
                        <>
                            <div className="flex flex-col">
                                <button
                                    disabled={index === 0}
                                    onClick={() => moveSongInPlaylist(playlistId, index, 'up')}
                                    className="p-1 hover:text-accent disabled:opacity-30"
                                >
                                    <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                    disabled={index === displayedSongs.length - 1}
                                    onClick={() => moveSongInPlaylist(playlistId, index, 'down')}
                                    className="p-1 hover:text-accent disabled:opacity-30"
                                >
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                            </div>
                            <button
                                onClick={() => removeSongFromPlaylist(playlistId, song.id)}
                                className="p-2 hover:text-red-500 hover:bg-red-50 rounded-full"
                                title="Remove from Playlist"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setSongMenu({ id: song.id, x: rect.left - 150, y: rect.top });
                            setAddToPlaylistMode(null);
                        }}
                        className="p-2 text-secondary hover:text-primary hover:bg-background rounded-full"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-80px)] bg-background flex flex-col lg:flex-row relative overflow-hidden">

            <MusicSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                currentView={currentView}
                onNavigate={(v) => { setCurrentView(v); setSearchQuery(''); }}
            />

            <main className="flex-1 flex flex-col relative pb-24 overflow-hidden">

                {/* Mobile Toggle FAB */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden fixed bottom-24 right-6 z-30 p-4 bg-accent text-white rounded-full shadow-xl hover:scale-110 transition-transform shadow-accent/30 flex items-center justify-center"
                        aria-label="Open Library"
                    >
                        <Library className="w-6 h-6" />
                    </button>
                )}

                {/* Header Content */}
                <div className="p-6 md:p-10 pb-4 pt-8 md:pt-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                        <div className="flex items-center gap-6">
                            {/* Header Image / Icon */}
                            <div className={`
                                ${viewData.type === 'album-detail' && viewData.cover ? 'w-32 h-32 md:w-48 md:h-48 shadow-2xl' : 'w-16 h-16 md:w-24 md:h-24 shadow-lg'} 
                                rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-accent/20 flex-shrink-0 overflow-hidden transition-all duration-300
                            `}>
                                {viewData.type === 'album-detail' && viewData.cover ? (
                                    <img
                                        src={viewData.cover || '/placeholder-album.png'}
                                        onError={handleImageError}
                                        alt={viewData.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <viewData.icon className="w-8 h-8 md:w-12 md:h-12" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-accent uppercase text-xs tracking-wider mb-1">
                                        {viewData.subtitle || 'Library'}
                                    </h4>
                                    {isScanning && <RefreshCw className="w-3 h-3 text-accent animate-spin" />}
                                </div>
                                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-primary line-clamp-2">{viewData.title}</h1>
                                <p className="text-secondary text-sm font-medium mt-1 flex items-center gap-2">
                                    <span>{currentView.type === 'albums' ? albums.length : displayedSongs.length} items</span>
                                    {viewData.type === 'album-detail' && displayedSongs.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>{displayedSongs[0].artist}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {displayedSongs.length > 0 && currentView.type !== 'albums' && (
                                <button
                                    onClick={() => {
                                        if (currentView.type === 'playlist') playPlaylist(currentView.id);
                                        else if (currentView.type === 'album-detail') playAlbum(currentView.id);
                                        else playTrack(displayedSongs[0]);
                                    }}
                                    className="btn btn-primary px-8 py-3 rounded-full shadow-lg shadow-accent/30 hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <Play className="w-5 h-5 fill-current" /> Play All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Bar (Hidden in Album Detail for cleaner look, or keep it) */}
                    {currentView.type !== 'album-detail' && (
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                            <input
                                type="text"
                                placeholder="Search songs, artists, albums..."
                                className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSearchHistory(true)}
                                // Delay blur to allow clicking on dropdown items
                                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                            />
                            {showSearchHistory && !searchQuery && (
                                <SearchHistoryDropdown
                                    onSelect={(query) => setSearchQuery(query)}
                                    onClose={() => setShowSearchHistory(false)}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-20 scrollbar-thin">

                    {currentView.type === 'albums' ? (
                        // Album Grid View
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {albums
                                .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((album) => (
                                    <div
                                        key={album.id}
                                        onClick={() => setCurrentView({ type: 'album-detail', id: album.id })}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl shadow-md border border-border bg-surface">
                                            {album.cover ? (
                                                <img
                                                    src={album.cover || '/placeholder-album.png'}
                                                    onError={handleImageError}
                                                    alt={album.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-accent/10 to-accent-orange/10 flex items-center justify-center">
                                                    <Disc className="w-12 h-12 text-accent opacity-50" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); playAlbum(album.id); }}
                                                    className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                                                >
                                                    <Play className="w-6 h-6 fill-current ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-primary truncate">{album.title}</h3>
                                        <p className="text-xs text-secondary">{album.trackCount} Tracks</p>
                                    </div>
                                ))}
                            {albums.length === 0 && (
                                <div className="col-span-full text-center py-20 opacity-50">
                                    <Folder className="w-12 h-12 mx-auto mb-4 text-muted" />
                                    <p className="text-secondary">No albums found in data/MusicFiles.</p>
                                </div>
                            )}
                        </div>
                    ) : currentView.type === 'lyrics' ? (
                        <LyricsDisplay />
                    ) : currentView.type === 'recently-played' ? (
                        <div className="p-6">
                            <RecentlyPlayedView />
                        </div>
                    ) : (
                        // List View
                        <div className="space-y-1">
                            {/* List Header (Only for Album View to mimic standard player columns) */}
                            {viewData.type === 'album-detail' && displayedSongs.length > 0 && (
                                <div className="flex items-center gap-3 px-2 py-2 text-xs font-bold text-secondary uppercase tracking-wider border-b border-border mb-2">
                                    <div className="w-8 text-center">#</div>
                                    <div className="flex-1">Title</div>
                                    <div className="hidden sm:block w-12 text-right"><Clock className="w-4 h-4 ml-auto" /></div>
                                    <div className="w-8"></div>
                                </div>
                            )}

                            {displayedSongs.length > 0 ? (
                                displayedSongs.map((song, idx) => renderSongRow(song, idx, viewData.type === 'playlist' ? viewData.playlistId : undefined))
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <Music className="w-12 h-12 mx-auto mb-4 text-muted" />
                                    <p className="text-secondary">No songs found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main >

            {/* Song Context Menu */}
            {
                songMenu && (
                    <>
                        <div className="fixed inset-0 z-50" onClick={() => setSongMenu(null)} />
                        <div
                            className="fixed z-[60] bg-surface border border-border shadow-xl rounded-xl p-1 min-w-[180px] animate-scale-in"
                            style={{ top: songMenu.y, left: songMenu.x }}
                        >
                            {addToPlaylistMode ? (
                                <>
                                    <div className="px-3 py-2 text-xs font-bold text-secondary uppercase border-b border-border mb-1">
                                        Add to...
                                    </div>
                                    {playlists.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                addSongToPlaylist(p.id, addToPlaylistMode);
                                                setSongMenu(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-background rounded-lg text-left"
                                        >
                                            <Folder className="w-4 h-4 text-accent" /> {p.name}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setAddToPlaylistMode(null)}
                                        className="w-full text-left px-3 py-2 text-xs text-secondary hover:text-primary mt-1"
                                    >
                                        ← Back
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            const song = library.find(s => s.id === songMenu.id);
                                            if (song) addToQueue(song);
                                            setSongMenu(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-background rounded-lg text-left"
                                    >
                                        <ListMusic className="w-4 h-4" /> Add to Queue
                                    </button>
                                    <button
                                        onClick={() => setAddToPlaylistMode(songMenu.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-background rounded-lg text-left"
                                    >
                                        <PlusCircle className="w-4 h-4" /> Add to Playlist
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )
            }

            <MusicPlayer />

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div >
    );
};
