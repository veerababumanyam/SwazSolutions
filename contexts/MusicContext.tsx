
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Howl, Howler } from 'howler';
import { Song, RepeatMode, Playlist, Album, EqualizerSettings, ApiSong, ApiAlbum } from '../types'; // Fixed import path
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

    // Advanced Audio
    analyser: AnalyserNode | null;
    equalizer: EqualizerSettings;
    setEqualizer: (settings: EqualizerSettings) => void;

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
    // Theme
    theme: 'light' | 'dark';
    toggleTheme: () => void;

    // Recently Played
    recentlyPlayed: Array<{ songId: string; playedAt: number }>;

    // Search History  
    searchHistory: string[];
    addSearchQuery: (query: string) => void;
    clearSearchHistory: () => void;
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

const DEFAULT_EQ: EqualizerSettings = { bass: 0, mid: 0, treble: 0, preamp: 0 };

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Refs
    const soundRef = useRef<Howl | null>(null);
    const soundIdRef = useRef<number | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const isSocketAction = useRef(false);
    const sessionRestored = useRef(false); // Prevent double-restore
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const eqNodesRef = useRef<{ bass: BiquadFilterNode, mid: BiquadFilterNode, treble: BiquadFilterNode } | null>(null);

    // Socket State
    const [socket, setSocket] = useState<Socket | null>(null);
    const isRemoteUpdate = useRef(false);

    // State
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [volume, setVolumeState] = useState(() => {
        const saved = localStorage.getItem('swaz_volume');
        return saved ? parseFloat(saved) : 0.8;
    });
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isShuffling, setIsShuffling] = useState(() => {
        const saved = localStorage.getItem('swaz_shuffle');
        return saved === 'true';
    });
    const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => {
        const saved = localStorage.getItem('swaz_repeat');
        return (saved as RepeatMode) || 'off';
    });
    const [error, setError] = useState<string | null>(null);
    const [equalizer, setEqualizerState] = useState<EqualizerSettings>(DEFAULT_EQ);

    const [library, setLibrary] = useState<Song[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [likedSongs, setLikedSongs] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('swaz_liked_songs');
        try {
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });
    const [playlists, setPlaylists] = useState<Playlist[]>(() => {
        const saved = localStorage.getItem('swaz_playlists');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isScanning, setIsScanning] = useState(true);

    const [lastScanTime, setLastScanTime] = useState<number>(0);
    const [history, setHistory] = useState<string[]>([]); // Track played song IDs

    // Theme
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('swaz_theme');
        return (saved as 'light' | 'dark') || 'light';
    });

    // Recently Played
    const [recentlyPlayed, setRecentlyPlayed] = useState<Array<{ songId: string; playedAt: number }>>(() => {
        const saved = localStorage.getItem('swaz_recently_played');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Search History
    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('swaz_search_history');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // --- Audio Node Setup (EQ & Analyser) ---
    const setupAudioNodes = () => {
        if (!Howler.ctx) return;

        // Note: AudioContext may be suspended due to autoplay policy
        // It will automatically resume on first user interaction (play button)
        if (Howler.ctx.state === 'suspended') {
            console.log('AudioContext suspended, will resume on user interaction');
        }

        if (eqNodesRef.current) return;

        const ctx = Howler.ctx;
        const masterGain = Howler.masterGain;

        if (!masterGain) {
            console.warn("Howler masterGain not available");
            return;
        }

        // Create Analyser
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; // 128 data points
        setAnalyserNode(analyser);

        // Create EQ Nodes
        const bass = ctx.createBiquadFilter();
        bass.type = 'lowshelf';
        bass.frequency.value = 320;

        const mid = ctx.createBiquadFilter();
        mid.type = 'peaking';
        mid.frequency.value = 1000;
        mid.Q.value = 0.5;

        const treble = ctx.createBiquadFilter();
        treble.type = 'highshelf';
        treble.frequency.value = 3200;

        try {
            // Re-route: Master -> Bass -> Mid -> Treble -> Analyser -> Destination
            // disconnect() can throw if not connected, so we wrap in try/catch
            try {
                masterGain.disconnect();
            } catch (e) {
                // Ignore if already disconnected or not connected
            }

            masterGain.connect(bass);
            bass.connect(mid);
            mid.connect(treble);
            treble.connect(analyser);
            analyser.connect(ctx.destination);

            eqNodesRef.current = { bass, mid, treble };
            applyEqualizer(equalizer); // Apply current settings, not default
            console.log("Audio nodes setup successfully");
        } catch (e) {
            console.error("Error setting up audio nodes:", e);
        }
    };

    const applyEqualizer = (settings: EqualizerSettings) => {
        if (!eqNodesRef.current) return;
        const { bass, mid, treble } = eqNodesRef.current;
        bass.gain.value = settings.bass;
        mid.gain.value = settings.mid;
        treble.gain.value = settings.treble;
        // Preamp could be handled by master volume or a separate gain node
    };

    const setEqualizer = (settings: EqualizerSettings) => {
        setEqualizerState(settings);
        applyEqualizer(settings);
    };

    // --- Library Management ---
    const refreshLibrary = async () => {
        setIsScanning(true);
        try {
            // Trigger backend scan first
            await api.songs.scan();

            // Then fetch songs from API
            const { songs } = await api.songs.list({ limit: 1000 });
            const albumsData = await api.songs.getAlbums();

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Convert API response to Song format
            const formattedSongs: Song[] = songs.map((s: ApiSong) => ({
                id: s.id.toString(),
                title: s.title,
                artist: s.artist || 'Unknown Artist',
                album: s.album || 'Unknown Album',
                duration: s.duration || 0,
                // Use relative URLs in development to leverage Vite proxy
                // In production, these should be absolute URLs
                cover: s.cover_path || '/placeholder-album.png',
                src: s.file_path,
                genre: s.genre,
            }));

            // Convert albums and link songs
            const formattedAlbums: Album[] = albumsData.map((a: ApiAlbum) => {
                const albumSongIds = a.song_ids?.split(',').map((id: string) => id.trim()) || [];
                const albumTracks = formattedSongs.filter(song =>
                    albumSongIds.includes(song.id)
                );

                // Use the cover of the first track as album cover
                const albumCover = albumTracks.length > 0 ? albumTracks[0].cover : '/placeholder-album.png';

                return {
                    id: a.title,
                    title: a.title,
                    cover: albumCover,
                    trackCount: albumTracks.length,
                    tracks: albumTracks,
                };
            });

            setLibrary(formattedSongs);
            setAlbums(formattedAlbums);
            setLastScanTime(Date.now());
        } catch (e) {
            console.error("Failed to load library:", e);
            setError("Failed to connect to backend server.");
        } finally {
            setIsScanning(false);
        }
    };

    const connectLocalLibrary = async () => {
        await refreshLibrary();
    };

    // --- Initialization ---
    useEffect(() => {
        const initialize = async () => {
            await refreshLibrary();
            // Setup Audio Nodes
            setupAudioNodes();
            // Session restore now happens in separate useEffect when library loads
        };

        initialize();

        const pollInterval = setInterval(refreshLibrary, 60000);
        return () => clearInterval(pollInterval);
    }, []);

    // Event-based session restore - triggers when library loads
    useEffect(() => {
        if (library.length > 0 && !sessionRestored.current) {
            console.log('Library loaded, restoring session...');
            restoreSession();
            sessionRestored.current = true;
        }
    }, [library]);

    // --- Session Restoration ---
    const restoreSession = () => {
        try {
            const sessionData = localStorage.getItem('swaz_music_session');
            if (!sessionData) return;

            const session = JSON.parse(sessionData);

            // Restore queue from IDs
            if (session.queueIds && session.queueIds.length > 0) {
                const restoredQueue = session.queueIds
                    .map((id: string) => library.find(s => s.id === id))
                    .filter((s): s is Song => !!s);

                if (restoredQueue.length > 0) {
                    setQueue(restoredQueue);

                    // Restore current song and position
                    const validIndex = Math.min(session.currentIndex || 0, restoredQueue.length - 1);
                    setCurrentIndex(validIndex);
                    setCurrentSong(restoredQueue[validIndex]);

                    // Create the sound but don't auto-play
                    const song = restoredQueue[validIndex];

                    // Validate the audio source
                    if (!song.src || typeof song.src !== 'string') {
                        console.warn('Invalid audio source in session, clearing session');
                        localStorage.removeItem('swaz_music_session');
                        return;
                    }

                    const sound = new Howl({
                        src: [song.src],
                        html5: true,
                        volume: 0, // Start muted to prevent autoplay
                        format: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
                        onload: () => {
                            // Seek to saved position once loaded
                            if (session.progress && session.progress > 0) {
                                sound.seek(session.progress);
                                setProgress(session.progress);
                            }
                            setDuration(sound.duration());
                            // Restore volume after successful load
                            sound.volume(session.volume || 0.8);
                        },
                        onloaderror: (_id, err) => {
                            console.warn('Session restore skipped - audio unavailable');
                            // Clear invalid session to prevent repeated errors
                            localStorage.removeItem('swaz_music_session');
                            // Unload the failed sound
                            sound.unload();
                            soundRef.current = null;
                        }
                    });

                    soundRef.current = sound;

                    console.log('✅ Session restored:', {
                        song: song.title,
                        position: session.progress,
                        queueLength: restoredQueue.length
                    });
                }
            }

            // Restore playback settings
            if (session.volume !== undefined) setVolumeState(session.volume);
            if (session.isShuffling !== undefined) setIsShuffling(session.isShuffling);
            if (session.repeatMode !== undefined) setRepeatMode(session.repeatMode);

        } catch (error) {
            console.error('Failed to restore session:', error);
            // Clear corrupted session data
            localStorage.removeItem('swaz_music_session');
        }
    };

    // --- Socket.io Connection ---
    useEffect(() => {
        const newSocket = io(); // Connects to origin by default
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            newSocket.emit('join_room', 'global');
        });

        newSocket.on('play', () => {
            if (soundRef.current && !soundRef.current.playing()) {
                isRemoteUpdate.current = true;
                soundRef.current.play();
                setIsPlaying(true);
                isRemoteUpdate.current = false;
            }
        });

        newSocket.on('pause', () => {
            if (soundRef.current && soundRef.current.playing()) {
                isRemoteUpdate.current = true;
                soundRef.current.pause();
                setIsPlaying(false);
                isRemoteUpdate.current = false;
            }
        });

        newSocket.on('seek', (data: { time: number }) => {
            if (soundRef.current) {
                isRemoteUpdate.current = true;
                soundRef.current.seek(data.time);
                setProgress(data.time);
                isRemoteUpdate.current = false;
            }
        });

        newSocket.on('change_song', (data: { song: Song }) => {
            isRemoteUpdate.current = true;
            playTrack(data.song);
            isRemoteUpdate.current = false;
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('swaz_playlists', JSON.stringify(playlists));
    }, [playlists]);

    useEffect(() => {
        localStorage.setItem('swaz_liked_songs', JSON.stringify(Array.from(likedSongs)));
    }, [likedSongs]);

    // --- Session Persistence: Save state on every change ---
    useEffect(() => {
        if (!currentSong) return; // Don't save empty session

        const session = {
            currentSongId: currentSong.id,
            progress: progress,
            queueIds: queue.map(s => s.id),
            currentIndex,
            volume,
            isShuffling,
            repeatMode,
            // Don't save isPlaying - user must manually resume
        };
        localStorage.setItem('swaz_music_session', JSON.stringify(session));
    }, [currentSong, progress, queue, currentIndex, volume, isShuffling, repeatMode]);

    // --- Persist Individual Settings ---
    useEffect(() => {
        localStorage.setItem('swaz_volume', volume.toString());
    }, [volume]);

    useEffect(() => {
        localStorage.setItem('swaz_shuffle', isShuffling.toString());
    }, [isShuffling]);

    useEffect(() => {
        localStorage.setItem('swaz_repeat', repeatMode);
    }, [repeatMode]);

    // Theme persistence
    useEffect(() => {
        localStorage.setItem('swaz_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Persist recently played
    useEffect(() => {
        localStorage.setItem('swaz_recently_played', JSON.stringify(recentlyPlayed));
    }, [recentlyPlayed]);

    // Persist search history
    useEffect(() => {
        localStorage.setItem('swaz_search_history', JSON.stringify(searchHistory));
    }, [searchHistory]);

    // Track song when it starts playing
    useEffect(() => {
        if (currentSong && isPlaying) {
            const entry = { songId: currentSong.id, playedAt: Date.now() };
            setRecentlyPlayed(prev => {
                // Remove duplicates and keep last 50
                const filtered = prev.filter(item => item.songId !== currentSong.id);
                return [entry, ...filtered].slice(0, 50);
            });
        }
    }, [currentSong?.id, isPlaying]);

    const addSearchQuery = (query: string) => {
        if (!query.trim()) return;
        setSearchHistory(prev => {
            const filtered = prev.filter(q => q !== query);
            return [query, ...filtered].slice(0, 10); // Keep last 10
        });
    };

    const clearSearchHistory = () => {
        setSearchHistory([]);
    };

    // --- Playback Logic ---

    // Timer for progress update
    useEffect(() => {
        let rafId: number;
        const updateProgress = () => {
            if (soundRef.current && isPlaying) {
                const seek = soundRef.current.seek();
                if (typeof seek === 'number') {
                    setProgress(seek);
                }
                rafId = requestAnimationFrame(updateProgress);
            }
        };
        if (isPlaying) {
            rafId = requestAnimationFrame(updateProgress);
        }
        return () => cancelAnimationFrame(rafId);
    }, [isPlaying]);

    const playTrackByIndex = (index: number, list: Song[]) => {
        if (!list[index]) return;

        // Stop previous sound
        if (soundRef.current) {
            // Crossfade out?
            soundRef.current.fade(volume, 0, 500); // 500ms fade out
            // Stop after fade
            const oldSound = soundRef.current;
            setTimeout(() => oldSound.unload(), 500);
        }

        const song = list[index];
        setCurrentIndex(index);
        setCurrentSong(song);

        if (!isRemoteUpdate.current && socket) {
            socket.emit('change_song', { room: 'global', song });
        }

        setError(null);
        setProgress(0);

        setDuration(song.duration);

        // Add to history
        setHistory(prev => {
            const newHistory = [...prev, song.id];
            if (newHistory.length > 50) newHistory.shift();
            return newHistory;
        });

        const sound = new Howl({
            src: [song.src],
            html5: true, // Force HTML5 Audio for large files/streaming
            volume: 0, // Start at 0 for fade in
            onplay: () => {
                setIsPlaying(true);
                setDuration(sound.duration());
                sound.fade(0, volume, 500); // Fade in

                // Ensure AudioContext is running and nodes are connected
                if (Howler.ctx && Howler.ctx.state === 'suspended') {
                    Howler.ctx.resume();
                }
                setupAudioNodes();
            },
            onend: () => {
                handleTrackEnd();
            },
            onpause: () => {
                setIsPlaying(false);
            },
            onstop: () => {
                setIsPlaying(false);
                setProgress(0);
            },
            onloaderror: (_id, err) => {
                console.error("Load Error:", err);
                setError("Error loading track.");
                setIsPlaying(false);
            },
            onplayerror: (_id, err) => {
                console.error("Play Error:", err);
                setError("Error playing track.");
                setIsPlaying(false);
            }
        });

        soundRef.current = sound;
        soundIdRef.current = sound.play();
    };

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

    }, [queue, currentIndex, repeatMode, isShuffling, history]);

    const handleTrackEnd = () => {
        const q = queueRef.current;
        const idx = indexRef.current;
        const repeat = repeatRef.current;
        const shuffle = shuffleRef.current;

        if (q.length === 0) return;

        if (repeat === 'one') {
            playTrackByIndex(idx, q);
            return;
        }

        let nextIndex;

        if (shuffle) {
            // Smart Shuffle Logic
            const currentSong = q[idx];
            // Candidates: not current, not in recent history (last 10)
            const recentHistory = history.slice(-10);
            const candidates = q.map((s, i) => ({ s, i })).filter(item => item.i !== idx && !recentHistory.includes(item.s.id));

            if (candidates.length > 0) {
                // Score candidates
                const scored = candidates.map(item => {
                    let score = Math.random(); // Base randomness
                    if (item.s.artist === currentSong.artist) score += 0.3;
                    if (item.s.genre === currentSong.genre) score += 0.2;
                    if (likedSongs.has(item.s.id)) score += 0.2;
                    return { ...item, score };
                });
                scored.sort((a, b) => b.score - a.score);
                // Pick top 3 weighted random to avoid repetition loop
                const top3 = scored.slice(0, 3);
                nextIndex = top3[Math.floor(Math.random() * top3.length)].i;
            } else {
                // Fallback to pure random if all played recently
                nextIndex = Math.floor(Math.random() * q.length);
            }
        } else {
            nextIndex = idx + 1;
        }

        if (nextIndex >= q.length) {
            if (repeat === 'all') {
                playTrackByIndex(0, q);
            } else {
                setIsPlaying(false);
                setProgress(0);
            }
        } else {
            playTrackByIndex(nextIndex, q);
        }
    };

    // --- Public Actions ---
    const play = () => {
        if (soundRef.current) {
            if (!isRemoteUpdate.current && socket) socket.emit('play', { room: 'global' });
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume();
            }
            soundRef.current.play();
        } else if (queue.length > 0 && currentIndex >= 0) {
            playTrackByIndex(currentIndex, queue);
        }
    };

    const pause = () => {
        if (!isRemoteUpdate.current && socket) socket.emit('pause', { room: 'global' });
        soundRef.current?.pause();
    };

    const next = () => {
        if (queue.length === 0) return;
        
        let nextIndex;
        
        if (isShuffling) {
            // Smart Shuffle Logic
            const recentHistory = history.slice(-10);
            const candidates = queue.map((s, i) => ({ s, i }))
                .filter(item => item.i !== currentIndex && !recentHistory.includes(item.s.id));

            if (candidates.length > 0) {
                const currentSong = queue[currentIndex];
                const scored = candidates.map(item => {
                    let score = Math.random();
                    if (currentSong && item.s.artist === currentSong.artist) score += 0.3;
                    if (currentSong && item.s.genre === currentSong.genre) score += 0.2;
                    if (likedSongs.has(item.s.id)) score += 0.2;
                    return { ...item, score };
                });
                scored.sort((a, b) => b.score - a.score);
                const top3 = scored.slice(0, Math.min(3, scored.length));
                nextIndex = top3[Math.floor(Math.random() * top3.length)].i;
            } else {
                nextIndex = (currentIndex + 1) % queue.length;
            }
        } else {
            nextIndex = currentIndex + 1;
        }

        if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
                playTrackByIndex(0, queue);
            } else {
                pause();
            }
        } else {
            playTrackByIndex(nextIndex, queue);
        }
    };

    const prev = () => {
        if (soundRef.current && soundRef.current.seek() > 3) {
            soundRef.current.seek(0);
            return;
        }
        let prevIndex = isShuffling
            ? Math.floor(Math.random() * queue.length)
            : currentIndex - 1;

        if (prevIndex < 0) prevIndex = queue.length - 1;
        playTrackByIndex(prevIndex, queue);
    };

    const seek = (time: number) => {
        if (soundRef.current) {
            if (!isRemoteUpdate.current && socket) socket.emit('seek', { room: 'global', time });
            soundRef.current.seek(time);
            setProgress(time);
        }
    };

    const setVolume = (vol: number) => {
        setVolumeState(vol);
        Howler.volume(vol); // Global volume
    };

    const toggleShuffle = () => setIsShuffling(!isShuffling);

    const toggleRepeat = () => {
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
    };

    const playTrack = (song: Song) => {
        const newQueue = [song];
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
            analyser: analyserNode, equalizer, setEqualizer,
            theme, toggleTheme,
            recentlyPlayed, searchHistory, addSearchQuery, clearSearchHistory,
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
