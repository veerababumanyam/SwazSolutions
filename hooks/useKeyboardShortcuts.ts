import { useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';

export const useKeyboardShortcuts = () => {
    const {
        isPlaying,
        play,
        pause,
        next,
        prev,
        seek,
        volume,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        currentSong,
        toggleLike,
        progress,
        duration
    } = useMusic();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts when typing in inputs/textareas
            const target = e.target as HTMLElement;
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
                return;
            }

            // Prevent default for handled shortcuts
            const handled = [
                'Space', 'KeyN', 'KeyP', 'KeyL', 'KeyS', 'KeyR', 'KeyM', 'KeyQ',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
            ];

            if (handled.includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                // Playback Controls
                case 'Space':
                    isPlaying ? pause() : play();
                    break;
                case 'KeyN':
                    next();
                    break;
                case 'KeyP':
                    prev();
                    break;

                // Seek Controls
                case 'ArrowLeft':
                    seek(Math.max(0, progress - 10));
                    break;
                case 'ArrowRight':
                    seek(Math.min(duration, progress + 10));
                    break;
                case 'Home':
                    seek(0);
                    break;
                case 'End':
                    seek(duration);
                    break;

                // Volume Controls
                case 'ArrowUp':
                    setVolume(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    setVolume(Math.max(0, volume - 0.1));
                    break;
                case 'KeyM':
                    setVolume(volume > 0 ? 0 : 0.8);
                    break;

                // Feature Toggles
                case 'KeyL':
                    if (currentSong) toggleLike(currentSong.id);
                    break;
                case 'KeyS':
                    toggleShuffle();
                    break;
                case 'KeyR':
                    toggleRepeat();
                    break;

                // Navigation (handled by parent components)
                case 'KeyQ':
                    // Queue toggle - will be handled by MusicPlayer
                    window.dispatchEvent(new CustomEvent('toggle-queue'));
                    break;
                case 'Slash':
                    if (e.shiftKey) {
                        // ? key (Shift + /) - Show keyboard shortcuts
                        window.dispatchEvent(new CustomEvent('toggle-help'));
                    } else {
                        // / key - Focus search
                        window.dispatchEvent(new CustomEvent('focus-search'));
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isPlaying,
        play,
        pause,
        next,
        prev,
        seek,
        volume,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        currentSong,
        toggleLike,
        progress,
        duration
    ]);
};
