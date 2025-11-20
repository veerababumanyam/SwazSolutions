
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Song, RepeatMode, Playlist, Album } from '../agents/types';
import { api } from '../src/services/api';

interface MusicContextType {
    // Playback State
    currentSong: Song | null;
    isPlaying: boolean;
    queue: Song[];
    currentIndex: number;
    volume: number;
    progress: number;
    duration: number;
    isShuffling: boolean;
    repeatMode: RepeatMode;
    error: string | null;
    likedSongs: Set<string>;

    // Library & Playlists
    library: Song[];
    albums: Album[];
    playlists: Playlist[];
    isScanning: boolean;
    lastScanTime: number;

    // Actions
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    seek: (time: number) => void;
    setVolume: (vol: number) => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    playTrack: (song: Song) => void;
    playPlaylist: (playlistId: string, startIndex?: number) => void;
    playAlbum: (albumId: string, startIndex?: number) => void;
    toggleLike: (id: string) => void;
    addToQueue: (song: Song) => void;
    clearError: () => void;

    // Data Actions
    refreshLibrary: () => Promise<void>;
    connectLocalLibrary: () => Promise<void>;

    // Playlist Actions
    createPlaylist: (name: string, description?: string) => void;
    deletePlaylist: (id: string) => void;
    renamePlaylist: (id: string, name: string) => void;
    addSongToPlaylist: (playlistId: string, songId: string) => void;
    removeSongFromPlaylist: (playlistId: string, songId: string) => void;
    moveSongInPlaylist: (playlistId: string, fromIndex: number, direction: 'up' | 'down') => void;
    getSongById: (id: string) => Song | undefined;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // State
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [volume, setVolumeState] = useState(0.8);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [error, setError] = useState<string | null>(null);

    const [library, setLibrary] = useState<Song[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const [lastScanTime, setLastScanTime] = useState<number>(0);

    // --- Safe Playback ---
    const safePlay = async () => {
        if (!audioRef.current) return;
        try {
            await audioRef.current.play();
            setIsPlaying(true);
            setError(null);
        } catch (e: any) {
            // AbortError happens when pause() is called while play() is pending. We can ignore it.
            if (e.name === 'AbortError') {
                return;
            }
            if (e.name === 'NotAllowedError') {
                setError("Autoplay blocked. Please interact with the page.");
            } else {
                console.error("Playback failed", e);
                setError("Playback error: " + e.message);
            }
            setIsPlaying(false);
        }
    };

    const refreshLibrary = async () => {
        setIsScanning(true);
        console.log('🔄 Refreshing library from backend...');
        try {
            // Trigger backend scan first
            console.log('📡 Scanning backend for music files...');
            await api.songs.scan();

            // Then fetch songs from API
            console.log('📡 Fetching songs from backend API...');
            const { songs } = await api.songs.list({ limit: 1000 });
            console.log(`✅ Received ${songs.length} songs from backend:`, songs);

            const albumsData = await api.songs.getAlbums();
            console.log(`✅ Received ${albumsData.length} albums from backend:`, albumsData);

            // Convert API response to Song format
            const formattedSongs: Song[] = songs.map((s: any) => ({
                id: s.id.toString(),
                title: s.title,
                artist: s.artist || 'Unknown Artist',
                album: s.album || 'Unknown Album',
                duration: s.duration || 0,
                cover: '/placeholder-album.jpg', // You can add album art later
                src: `http://localhost:3000${s.file_path}`, // Fixed: was 'url', should be 'src'
                genre: s.genre,
            }));

            // Convert albums and link songs
            const formattedAlbums: Album[] = albumsData.map((a: any) => {
                // Get all songs for this album
                const albumSongIds = a.song_ids?.split(',').map((id: string) => id.trim()) || [];
                const albumTracks = formattedSongs.filter(song =>
                    albumSongIds.includes(song.id)
                );

                return {
                    id: a.title,
                    title: a.title,
                    cover: '/placeholder-album.jpg',
                    trackCount: albumTracks.length,
                    tracks: albumTracks,
                };
            });

            console.log(`✅ Formatted ${formattedSongs.length} songs and ${formattedAlbums.length} albums`);
            console.log('Album details:', formattedAlbums.map(a => ({
                title: a.title,
                trackCount: a.trackCount,
                trackIds: a.tracks.map(t => t.id)
            })));
            setLibrary(formattedSongs);
            setAlbums(formattedAlbums);
            setLastScanTime(Date.now());
            console.log('✅ Library updated successfully!');
        } catch (e) {
            console.error("❌ Failed to load library from backend:", e);
            console.error("Error details:", e);
            setError("Failed to connect to backend server: " + (e as Error).message);
        } finally {
            setIsScanning(false);
        }
    };

    const connectLocalLibrary = async () => {
        // Not needed for backend approach - just refresh from server
        await refreshLibrary();
    };

    // --- Initialization ---
    useEffect(() => {
        refreshLibrary();

        const storedPlaylists = localStorage.getItem('swaz_playlists');
        if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));

        const storedLikes = localStorage.getItem('swaz_liked_songs');
        if (storedLikes) setLikedSongs(new Set(JSON.parse(storedLikes)));

        // Poll backend for changes every 60 seconds
        const pollInterval = setInterval(() => {
            refreshLibrary();
        }, 60000);

        // Cleanup on unmount
        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('swaz_playlists', JSON.stringify(playlists));
    }, [playlists]);

    useEffect(() => {
        localStorage.setItem('swaz_liked_songs', JSON.stringify(Array.from(likedSongs)));
    }, [likedSongs]);

    // --- Audio Engine Setup ---
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        const audio = audioRef.current;

        const handleTimeUpdate = () => setProgress(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => handleTrackEnd();
        const handleError = () => {
            if (audio.src) setError("Error playing file. It may be missing.");
            setIsPlaying(false);
        };
        const handlePause = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('play', handlePlay);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('play', handlePlay);
        };
    }, []);

    // Keep refs updated for 'ended' event callback closure
    const queueRef = useRef(queue);
    const indexRef = useRef(currentIndex);
    const repeatRef = useRef(repeatMode);
    const shuffleRef = useRef(isShuffling);

    useEffect(() => {
        queueRef.current = queue;
        indexRef.current = currentIndex;
        repeatRef.current = repeatMode;
        shuffleRef.current = isShuffling;
    }, [queue, currentIndex, repeatMode, isShuffling]);

    const handleTrackEnd = () => {
        const q = queueRef.current;
        const idx = indexRef.current;
        const repeat = repeatRef.current;
        const shuffle = shuffleRef.current;

        if (q.length === 0) return;

        if (repeat === 'one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                safePlay();
            }
            return;
        }

        let nextIndex;
        if (shuffle) {
            nextIndex = Math.floor(Math.random() * q.length);
        } else {
            nextIndex = idx + 1;
        }

        if (nextIndex >= q.length) {
            if (repeat === 'all') {
                playTrackByIndex(0, q);
            } else {
                setIsPlaying(false); // Stop
            }
        } else {
            playTrackByIndex(nextIndex, q);
        }
    };

    const playTrackByIndex = (index: number, list: Song[]) => {
        if (!audioRef.current || !list[index]) return;

        const song = list[index];
        setCurrentIndex(index);
        setCurrentSong(song);
        setError(null);

        audioRef.current.src = song.src;
        audioRef.current.load();
        safePlay();
    };

    // --- Public Actions ---
    const play = () => safePlay();
    const pause = () => audioRef.current?.pause();

    const next = () => handleTrackEnd();

    const prev = () => {
        if (!audioRef.current) return;
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }
        let prevIndex = isShuffling
            ? Math.floor(Math.random() * queue.length)
            : currentIndex - 1;

        if (prevIndex < 0) prevIndex = queue.length - 1;
        playTrackByIndex(prevIndex, queue);
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const setVolume = (vol: number) => {
        setVolumeState(vol);
        if (audioRef.current) audioRef.current.volume = vol;
    };

    const toggleShuffle = () => setIsShuffling(!isShuffling);

    const toggleRepeat = () => {
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
    };

    const playTrack = (song: Song) => {
        const newQueue = [song]; // Simple play for now, or smarter context
        setQueue(newQueue);
        playTrackByIndex(0, newQueue);
    };

    const playPlaylist = (playlistId: string, startIndex = 0) => {
        const pl = playlists.find(p => p.id === playlistId);
        if (!pl || pl.trackIds.length === 0) return;
        const songs = pl.trackIds.map(id => getSongById(id)).filter((s): s is Song => !!s);
        setQueue(songs);
        playTrackByIndex(startIndex, songs);
    };

    const playAlbum = (albumId: string, startIndex = 0) => {
        const album = albums.find(a => a.id === albumId);
        if (!album) return;
        setQueue(album.tracks);
        playTrackByIndex(startIndex, album.tracks);
    };

    const toggleLike = (id: string) => {
        const next = new Set(likedSongs);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setLikedSongs(next);
    };

    const addToQueue = (song: Song) => setQueue(prev => [...prev, song]);
    const clearError = () => setError(null);

    const createPlaylist = (name: string, description?: string) => {
        const pl: Playlist = {
            id: Date.now().toString(),
            name,
            description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            trackIds: []
        };
        setPlaylists(prev => [...prev, pl]);
    };

    const deletePlaylist = (id: string) => setPlaylists(prev => prev.filter(p => p.id !== id));
    const renamePlaylist = (id: string, name: string) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p));

    const addSongToPlaylist = (pid: string, sid: string) => {
        setPlaylists(prev => prev.map(p => p.id === pid && !p.trackIds.includes(sid) ? { ...p, trackIds: [...p.trackIds, sid] } : p));
    };

    const removeSongFromPlaylist = (pid: string, sid: string) => {
        setPlaylists(prev => prev.map(p => p.id === pid ? { ...p, trackIds: p.trackIds.filter(x => x !== sid) } : p));
    };

    const moveSongInPlaylist = (pid: string, fromIdx: number, direction: 'up' | 'down') => {
        setPlaylists(prev => prev.map(p => {
            if (p.id !== pid) return p;
            const tracks = [...p.trackIds];
            const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
            if (toIdx < 0 || toIdx >= tracks.length) return p;
            const [item] = tracks.splice(fromIdx, 1);
            tracks.splice(toIdx, 0, item);
            return { ...p, trackIds: tracks };
        }));
    };

    const getSongById = (id: string) => library.find(s => s.id === id);

    return (
        <MusicContext.Provider value={{
            currentSong, isPlaying, queue, currentIndex, volume, progress, duration, isShuffling, repeatMode, error, likedSongs,
            library, albums, playlists, isScanning, lastScanTime,
            play, pause, next, prev, seek, setVolume, toggleShuffle, toggleRepeat, playTrack, playPlaylist, playAlbum,
            toggleLike, addToQueue, clearError, refreshLibrary, connectLocalLibrary,
            createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist, removeSongFromPlaylist, moveSongInPlaylist, getSongById
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (context === undefined) throw new Error('useMusic must be used within MusicProvider');
    return context;
};
