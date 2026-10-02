import React, {useEffect, useState} from 'react';
import { ThemeContext } from './useTheme';

type Theme = 'dark' | 'light';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}


export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('dispatchpulse_theme') as Theme | null;
        return saved || 'dark';
});

useEffect(() => {
    const root = document.documentElement;
    if(theme === 'dark') {
        root.classList.add('dark')
    } else {
        root.classList.remove('dark')
    }
    localStorage.setItem('dispatchpulse_theme', theme);
}, [theme]);

const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
};

return (
    <ThemeContext.Provider value={{theme, toggleTheme}}>
        {children}
    </ThemeContext.Provider>
);

};

