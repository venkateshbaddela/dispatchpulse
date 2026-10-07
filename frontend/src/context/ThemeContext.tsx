import React, { useEffect, useState } from 'react';
import { ThemeContext } from './useTheme';

type Theme = 'dark' | 'light';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('dispatchpulse_theme') as Theme | null;
                if (saved === 'dark' || saved === 'light') {
                    return saved;
                }
            } catch {
                // Ignore localStorage errors
            }
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        const isCurrentDark = root.classList.contains('dark');
        const shouldBeDark = theme === 'dark';

        // ALWAYS persist theme to localStorage and set color-scheme before any conditional logic
        try {
            localStorage.setItem('dispatchpulse_theme', theme);
        } catch {
            // Ignore localStorage errors
        }
        root.style.colorScheme = theme;

        // Synchronize DOM class if it differs from desired state
        if (isCurrentDark !== shouldBeDark) {
            // Temporarily disable CSS transitions during manual theme toggle to prevent border/background luminance flares
            const css = document.createElement('style');
            css.appendChild(
                document.createTextNode(
                    '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
                )
            );
            document.head.appendChild(css);

            if (shouldBeDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }

            // Force style recalculation before removing the blocker
            if (document.body) {
                void window.getComputedStyle(document.body).opacity;
            }

            const timer = setTimeout(() => {
                if (document.head.contains(css)) {
                    document.head.removeChild(css);
                }
            }, 1);

            return () => clearTimeout(timer);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
