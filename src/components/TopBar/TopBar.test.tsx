import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { TopBar } from './TopBar';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('TopBar', () => {
    it('renders without crashing', () => {
        renderWithTheme(<TopBar />);
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('renders message when provided', () => {
        renderWithTheme(<TopBar message="Test message" />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });
});
