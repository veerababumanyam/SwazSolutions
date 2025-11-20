
import { Song, Album } from '../agents/types';

// Placeholder/Demo Tracks so the app isn't empty
const DEMO_ALBUMS: Album[] = [
    {
        id: 'demo-alb-1',
        title: 'Swaz Originals',
        cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        trackCount: 4,
        tracks: []
    },
    {
        id: 'demo-alb-2',
        title: 'Lofi Study',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        trackCount: 1,
        tracks: []
    }
];

const DEMO_SONGS: Song[] = [
    {
        id: 'demo-1',
        title: 'Cyberpunk Dreams',
        artist: 'Swaz AI',
        album: 'Swaz Originals',
        cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_822fcfbc9a.mp3', // Open source audio
        duration: 120,
        liked: true
    },
    {
        id: 'demo-2',
        title: 'Deep Focus',
        artist: 'Swaz AI',
        album: 'Swaz Originals',
        cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        duration: 145,
        liked: false
    },
    {
        id: 'demo-3',
        title: 'Neon Highway',
        artist: 'SynthWave Bot',
        album: 'Swaz Originals',
        cover: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d0.mp3',
        duration: 180,
        liked: true
    },
    {
        id: 'demo-4',
        title: 'Midnight Rain',
        artist: 'Lofi Maker',
        album: 'Lofi Study',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        src: 'https://cdn.pixabay.com/download/audio/2023/01/10/audio_c273682811.mp3',
        duration: 160,
        liked: false
    }
];

// Link tracks to albums
DEMO_ALBUMS[0].tracks = [DEMO_SONGS[0], DEMO_SONGS[1], DEMO_SONGS[2]];
DEMO_ALBUMS[1].tracks = [DEMO_SONGS[3]];

export const MusicFileSystem = {
    /**
     * Auto-discovers music files from local project directory.
     * Includes safeguards for environments where import.meta.glob is not available.
     */
    scanLibrary: async (): Promise<{ albums: Album[], songs: Song[] }> => {
        const albumsMap = new Map<string, Album>();
        const songs: Song[] = [...DEMO_SONGS]; // Start with demo songs
        
        // Add Demo Albums to Map
        DEMO_ALBUMS.forEach(a => albumsMap.set(a.title, a));

        let audioFiles: Record<string, string> = {};
        let coverFiles: Record<string, string> = {};
        let hasAutoDiscovered = false;

        try {
            // @ts-ignore - Check if Vite's import.meta.glob is available
            if (typeof import.meta !== 'undefined' && typeof import.meta.glob === 'function') {
                // @ts-ignore
                audioFiles = import.meta.glob('./MusicFiles/**/*.{mp3,wav,ogg,m4a}', { eager: true, as: 'url' });
                // @ts-ignore
                coverFiles = import.meta.glob('./MusicFiles/**/*.{jpg,png,jpeg,webp}', { eager: true, as: 'url' });
                hasAutoDiscovered = true;
            }
        } catch (e) {
            console.warn("Auto-discovery not available in this environment.");
        }

        if (hasAutoDiscovered) {
            // Helper to find cover image for a specific folder path
            const findCover = (folderPath: string) => {
                for (const [path, url] of Object.entries(coverFiles)) {
                    if (path.includes(folderPath)) return url as string;
                }
                return '';
            };

            for (const [path, url] of Object.entries(audioFiles)) {
                const parts = path.split('/');
                let albumTitle = 'Singles';
                let fileName = parts[parts.length - 1];

                // Assuming structure: ./MusicFiles/AlbumName/Song.mp3
                if (parts.length >= 3) {
                    albumTitle = parts[parts.length - 2];
                }

                const title = fileName.replace(/\.(mp3|wav|ogg|m4a)$/i, '').replace(/^\d+[\s-.]*/, '');
                
                // Reconstruct folder path to find matching cover
                const folderPath = parts.slice(0, parts.length - 1).join('/');
                const cover = findCover(folderPath);

                const song: Song = {
                    id: path,
                    title: title,
                    artist: 'Unknown Artist',
                    album: albumTitle,
                    cover: cover,
                    src: url as string,
                    duration: 0,
                    liked: false
                };

                songs.push(song);

                if (!albumsMap.has(albumTitle)) {
                    albumsMap.set(albumTitle, {
                        id: `alb-${albumTitle}`,
                        title: albumTitle,
                        cover: cover,
                        trackCount: 0,
                        tracks: []
                    });
                }

                const album = albumsMap.get(albumTitle)!;
                album.tracks.push(song);
                album.trackCount++;
            }
        }

        return {
            songs,
            albums: Array.from(albumsMap.values())
        };
    },

    /**
     * Fallback: Uses <input type="file" webkitdirectory> which works in iframes/sandboxes
     * where window.showDirectoryPicker is blocked.
     */
    selectLocalDirectory: async (): Promise<{ albums: Album[], songs: Song[] } | null> => {
        return new Promise((resolve) => {
            // Create a hidden input element
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.webkitdirectory = true;
            // @ts-ignore
            input.directory = true; // Standard, though less supported
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = (e: any) => {
                const files = Array.from(e.target.files as FileList);
                if (files.length === 0) {
                    document.body.removeChild(input);
                    resolve(null);
                    return;
                }

                const albumsMap = new Map<string, Album>();
                const songs: Song[] = [];
                const coversMap = new Map<string, string>();

                // Pass 1: Find Covers
                files.forEach(file => {
                    const name = file.name.toLowerCase();
                    if (name.match(/\.(jpg|jpeg|png|webp)$/)) {
                        if (name.includes('cover') || name.includes('folder') || name.includes('front')) {
                            const path = file.webkitRelativePath || '';
                            const folder = path.substring(0, path.lastIndexOf('/'));
                            coversMap.set(folder, URL.createObjectURL(file));
                        }
                    }
                });

                // Pass 2: Find Songs
                files.forEach(file => {
                    const name = file.name.toLowerCase();
                    if (name.match(/\.(mp3|wav|ogg|m4a)$/)) {
                        const path = file.webkitRelativePath || file.name;
                        const parts = path.split('/');
                        
                        // Determine Album Name from Folder
                        let albumTitle = 'Singles';
                        if (parts.length >= 2) {
                            albumTitle = parts[parts.length - 2];
                        }
                        
                        // Determine Cover
                        const folder = path.substring(0, path.lastIndexOf('/'));
                        const cover = coversMap.get(folder) || '';

                        const song: Song = {
                            id: path,
                            title: file.name.replace(/\.(mp3|wav|ogg|m4a)$/i, ''),
                            artist: 'Local File',
                            album: albumTitle,
                            cover: cover,
                            src: URL.createObjectURL(file),
                            duration: 0,
                            liked: false
                        };

                        songs.push(song);

                        if (!albumsMap.has(albumTitle)) {
                            albumsMap.set(albumTitle, {
                                id: `alb-${albumTitle}`,
                                title: albumTitle,
                                cover: cover,
                                trackCount: 0,
                                tracks: []
                            });
                        }
                        
                        const alb = albumsMap.get(albumTitle)!;
                        alb.tracks.push(song);
                        alb.trackCount++;
                    }
                });

                document.body.removeChild(input);
                resolve({
                    songs,
                    albums: Array.from(albumsMap.values())
                });
            };

            input.oncancel = () => {
                document.body.removeChild(input);
                resolve(null);
            };

            input.click();
        });
    }
};
