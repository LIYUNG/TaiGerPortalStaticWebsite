import React from 'react';
import { createContext, useContext, useState } from 'react';
import themeLight from './themeLight';
import themeDark from './themeDark';
import { ThemeProvider } from '@mui/material';

interface CustomThemeContextValue {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextValue | undefined>(
    undefined
);

interface CustomThemeProviderProps {
    children: React.ReactNode;
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
                {children}
            </ThemeProvider>
        </CustomThemeContext.Provider>
    );
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
