import { useContext, createContext } from "react";
import { type ThemeContextType } from "./ThemeContext";


export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
