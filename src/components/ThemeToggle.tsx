import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useMusic();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-background transition-colors text-secondary hover:text-primary"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
};
