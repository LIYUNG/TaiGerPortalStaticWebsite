import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GaugeCard from './index';

const theme = createTheme();

describe('GaugeCard', () => {
    it('renders without crashing', () => {
        render(
            <ThemeProvider theme={theme}>
                <GaugeCard score={75} title="Score" />
            </ThemeProvider>
        );
        expect(screen.getByText('Score')).toBeInTheDocument();
    });

    it('renders score', () => {
        render(
            <ThemeProvider theme={theme}>
                <GaugeCard score={50} />
            </ThemeProvider>
        );
        expect(screen.getByText(/50/)).toBeInTheDocument();
    });
});
