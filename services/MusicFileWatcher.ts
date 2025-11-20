
import { Song, Album } from '../types';

interface ScanResult {
    albums: Album[];
    songs: Song[];
}

interface WatcherOptions {
    pollInterval?: number; // milliseconds
    onUpdate?: (result: ScanResult) => void;
}

/**
 * Music File Watcher Service
 * 
 * Provides automatic music file discovery with multiple strategies:
 * 1. Vite glob (build-time discovery)
 * 2. Periodic polling with hash comparison
 * 3. Manual refresh trigger
 */
export class MusicFileWatcher {
    private static pollIntervalId: number | null = null;
    private static directoryHandle: FileSystemDirectoryHandle | null = null;
    private static lastScanHash: string = '';
    private static onUpdateCallback: ((result: ScanResult) => void) | null = null;

    /**
     * Scan using Vite's import.meta.glob (build-time discovery)
     */
    static async viteGlobScan(): Promise<ScanResult> {
        const albumsMap = new Map<string, Album>();
        const songs: Song[] = [];

        let audioFiles: Record<string, string> = {};
        let coverFiles: Record<string, string> = {};
        let hasAutoDiscovered = false;

        try {
            // @ts-ignore - Check if Vite's import.meta.glob is available
            if (typeof import.meta !== 'undefined' && typeof import.meta.glob === 'function') {
                // @ts-ignore - Using new query syntax instead of deprecated 'as'
                audioFiles = import.meta.glob('/data/MusicFiles/**/*.{mp3,wav,ogg,m4a}', {
                    eager: true,
                    query: '?url',
                    import: 'default'
                });
                // @ts-ignore
                coverFiles = import.meta.glob('/data/MusicFiles/**/*.{jpg,png,jpeg,webp}', {
                    eager: true,
                    query: '?url',
                    import: 'default'
                });
                hasAutoDiscovered = true;
            }
        } catch (e) {
            console.warn("Vite glob not available:", e);
        }

        if (hasAutoDiscovered && Object.keys(audioFiles).length > 0) {
            // Helper to find cover image for a specific folder path
            const findCover = (folderPath: string): string => {
                // Priority: cover.* > folder.* > album.* > first image in folder
                const priorityNames = ['cover', 'folder', 'album'];

                for (const name of priorityNames) {
                    for (const [path, url] of Object.entries(coverFiles)) {
                        if (path.includes(folderPath) && path.toLowerCase().includes(name)) {
                            return url as string;
                        }
                    }
                }

                // Fallback: any image in the same folder
                for (const [path, url] of Object.entries(coverFiles)) {
                    if (path.includes(folderPath)) return url as string;
                }

                return '';
            };

            for (const [path, url] of Object.entries(audioFiles)) {
                const parts = path.split('/');
                let albumTitle = 'Singles';
                let fileName = parts[parts.length - 1];

                // Assuming structure: /data/MusicFiles/AlbumName/Song.mp3
                if (parts.length >= 4) {
                    albumTitle = parts[parts.length - 2];
                }

                // Clean title: remove extension and leading numbers/dashes
                const title = fileName
                    .replace(/\.(mp3|wav|ogg|m4a)$/i, '')
                    .replace(/^[\d\s\-_.]+/, '') // Remove track numbers
                    .trim();

                // Reconstruct folder path to find matching cover
                const folderPath = parts.slice(0, parts.length - 1).join('/');
                const cover = findCover(folderPath);

                const song: Song = {
                    id: path,
                    title: title || fileName,
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
    }

    /**
     * Select a directory using the browser's file picker
     * Returns a handle that can be used for future scans
     */
    static async selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
        return new Promise((resolve) => {
            // Create a hidden input element
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.webkitdirectory = true;
            // @ts-ignore
            input.directory = true;
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = async (e: any) => {
                const files = Array.from(e.target.files as FileList);
                document.body.removeChild(input);

                if (files.length === 0) {
                    resolve(null);
                    return;
                }

                // Store files for scanning
                this.directoryHandle = { files } as any;
                resolve(this.directoryHandle);
            };

            input.oncancel = () => {
                document.body.removeChild(input);
                resolve(null);
            };

            input.click();
        });
    }

    /**
     * Scan a selected directory handle
     */
    static async scanDirectoryHandle(handle: any): Promise<ScanResult> {
        const albumsMap = new Map<string, Album>();
        const songs: Song[] = [];
        const coversMap = new Map<string, string>();

        const files = handle.files || [];

        // Pass 1: Find Covers
        files.forEach((file: File) => {
            const name = file.name.toLowerCase();
            if (name.match(/\.(jpg|jpeg|png|webp)$/)) {
                const path = file.webkitRelativePath || '';
                const folder = path.substring(0, path.lastIndexOf('/'));

                // Priority for cover images
                if (name.includes('cover') || name.includes('folder') || name.includes('album')) {
                    coversMap.set(folder + '_priority', URL.createObjectURL(file));
                } else if (!coversMap.has(folder + '_priority')) {
                    coversMap.set(folder, URL.createObjectURL(file));
                }
            }
        });

        // Pass 2: Find Songs
        for (const file of files) {
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
                const cover = coversMap.get(folder + '_priority') || coversMap.get(folder) || '';

                // Extract duration from audio file
                const duration = await this.extractDuration(file);

                const song: Song = {
                    id: path,
                    title: file.name.replace(/\.(mp3|wav|ogg|m4a)$/i, '').replace(/^[\d\s\-_.]+/, '').trim(),
                    artist: 'Local File',
                    album: albumTitle,
                    cover: cover,
                    src: URL.createObjectURL(file),
                    duration: duration,
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
        }

        return {
            songs,
            albums: Array.from(albumsMap.values())
        };
    }

    /**
     * Extract audio duration from file
     */
    private static async extractDuration(file: File): Promise<number> {
        return new Promise((resolve) => {
            const audio = new Audio();
            const url = URL.createObjectURL(file);

            audio.addEventListener('loadedmetadata', () => {
                URL.revokeObjectURL(url);
                resolve(audio.duration || 0);
            });

            audio.addEventListener('error', () => {
                URL.revokeObjectURL(url);
                resolve(0);
            });

            audio.src = url;
        });
    }

    /**
     * Generate a simple hash of the scan result for change detection
     */
    private static hashScanResult(result: ScanResult): string {
        const data = {
            songCount: result.songs.length,
            albumCount: result.albums.length,
            songIds: result.songs.map(s => s.id).sort().join(','),
            albumIds: result.albums.map(a => a.id).sort().join(',')
        };
        return JSON.stringify(data);
    }

    /**
     * Start periodic polling for changes
     */
    static startPolling(options: WatcherOptions = {}): void {
        const { pollInterval = 30000, onUpdate } = options;

        if (this.pollIntervalId !== null) {
            this.stopPolling();
        }

        this.onUpdateCallback = onUpdate || null;

        this.pollIntervalId = window.setInterval(async () => {
            await this.checkForUpdates();
        }, pollInterval);

        console.log(`🎵 Music file watcher started (polling every ${pollInterval / 1000}s)`);
    }

    /**
     * Stop periodic polling
     */
    static stopPolling(): void {
        if (this.pollIntervalId !== null) {
            clearInterval(this.pollIntervalId);
            this.pollIntervalId = null;
            console.log('🎵 Music file watcher stopped');
        }
    }

    /**
     * Check for updates and trigger callback if changes detected
     */
    static async checkForUpdates(): Promise<ScanResult | null> {
        try {
            const result = await this.viteGlobScan();
            const currentHash = this.hashScanResult(result);

            if (currentHash !== this.lastScanHash) {
                this.lastScanHash = currentHash;

                if (this.onUpdateCallback) {
                    this.onUpdateCallback(result);
                }

                return result;
            }
        } catch (e) {
            console.warn('Scan update check failed:', e);
        }

        return null;
    }

    /**
     * Manual refresh - always returns latest data
     */
    static async refresh(): Promise<ScanResult> {
        const result = await this.viteGlobScan();
        this.lastScanHash = this.hashScanResult(result);
        return result;
    }

    /**
     * Select and scan a new directory
     */
    static async selectAndScan(): Promise<ScanResult | null> {
        const handle = await this.selectDirectory();
        if (handle) {
            const result = await this.scanDirectoryHandle(handle);
            this.lastScanHash = this.hashScanResult(result);
            return result;
        }
        return null;
    }
}
