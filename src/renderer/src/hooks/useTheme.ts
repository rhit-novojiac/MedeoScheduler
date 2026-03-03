import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'medeo-theme';

/**
 * Hook to manage light/dark theme state.
 * Persists preference to localStorage and toggles the `.dark` class on `<html>`.
 * Defaults to light mode.
 */
export const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Read stored preference, default to light
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        return stored === 'dark' ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));

    return { theme, toggleTheme } as const;
};
