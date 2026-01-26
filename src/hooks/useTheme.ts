import { useState, useEffect, useCallback } from 'react';
import themeService from '../services/themeService';
import { Theme, ThemeCategory } from '../types/theme.types';

export const useTheme = () => {
    const [systemThemes, setSystemThemes] = useState<Theme[]>([]);
    const [userThemes, setUserThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchThemes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to load from cache first for instant UI
            const cachedSystem = localStorage.getItem('cache_system_themes');
            const cachedUser = localStorage.getItem('cache_user_themes');

            if (cachedSystem) setSystemThemes(JSON.parse(cachedSystem));
            if (cachedUser) setUserThemes(JSON.parse(cachedUser));

            const data = await themeService.getAllThemes();
            setSystemThemes(data.system);
            setUserThemes(data.custom);

            // Update cache
            localStorage.setItem('cache_system_themes', JSON.stringify(data.system));
            localStorage.setItem('cache_user_themes', JSON.stringify(data.custom));
        } catch (err) {
            console.error('Failed to fetch themes:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch themes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]);

    const getThemesByCategory = useCallback((category: ThemeCategory | 'all') => {
        const allThemes = [...systemThemes, ...userThemes];
        if (category === 'all') return allThemes;
        return allThemes.filter(theme => theme.category === category);
    }, [systemThemes, userThemes]);

    const applyTheme = useCallback(async (id: number) => {
        try {
            const response = await themeService.applyTheme(id);
            return response;
        } catch (err) {
            console.error('Failed to apply theme:', err);
            throw err;
        }
    }, []);

    const saveCustomTheme = useCallback(async (theme: Theme) => {
        try {
            const response = await themeService.saveAITheme(theme);
            await fetchThemes(); // Refresh list
            return response;
        } catch (err) {
            console.error('Failed to save custom theme:', err);
            throw err;
        }
    }, [fetchThemes]);

    const deleteTheme = useCallback(async (id: number) => {
        try {
            await themeService.deleteTheme(id);
            await fetchThemes(); // Refresh list
        } catch (err) {
            console.error('Failed to delete theme:', err);
            throw err;
        }
    }, [fetchThemes]);

    return {
        systemThemes,
        userThemes,
        loading,
        error,
        refresh: fetchThemes,
        getThemesByCategory,
        applyTheme,
        saveCustomTheme,
        deleteTheme
    };
};

export default useTheme;
