import { type ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import themeLight from './themeLight';
import themeDark from './themeDark';
import { GlobalStyles, ThemeProvider } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

interface CustomThemeContextValue {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextValue | undefined>(
    undefined
);

interface CustomThemeProviderProps {
    children: ReactNode;
}

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
    const isStoredDarkMode = localStorage.getItem('mode') === 'dark';
    const [isDarkMode, setIsDarkMode] = useState(isStoredDarkMode);

    const toggleDarkMode = () => {
        localStorage.setItem('mode', !isDarkMode ? 'dark' : 'light');
        setIsDarkMode(!isDarkMode);
    };

    const themeData: CustomThemeContextValue = {
        isDarkMode,
        toggleDarkMode
    };

    return (
        <CustomThemeContext.Provider value={themeData}>
            <ThemeProvider theme={isDarkMode ? themeDark : themeLight}>
                <GlobalStyles styles={scrollbarStyles} />
                {children}
            </ThemeProvider>
        </CustomThemeContext.Provider>
    );
};

// Thin, rounded, theme-aware scrollbar consistent with the MUI aesthetic.
// Transparent track, translucent thumb that darkens on hover, adapting to the
// active (light/dark) palette. Applied app-wide.
const scrollbarStyles = (theme: Theme) => {
    const thumb = alpha(
        theme.palette.text.primary,
        theme.palette.mode === 'dark' ? 0.3 : 0.2
    );
    const thumbHover = alpha(
        theme.palette.text.primary,
        theme.palette.mode === 'dark' ? 0.45 : 0.35
    );
    return {
        '*': {
            scrollbarWidth: 'thin' as const,
            scrollbarColor: `${thumb} transparent`
        },
        '*::-webkit-scrollbar': {
            width: 8,
            height: 8
        },
        '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
        },
        '*::-webkit-scrollbar-thumb': {
            backgroundColor: thumb,
            borderRadius: 8,
            border: '2px solid transparent',
            backgroundClip: 'content-box'
        },
        '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: thumbHover
        }
    };
};

export const useCustomTheme = (): CustomThemeContextValue => {
    const context = useContext(CustomThemeContext);
    if (context === undefined) {
        throw new Error(
            'useCustomTheme must be used within a CustomThemeProvider'
        );
    }
    return context;
};
