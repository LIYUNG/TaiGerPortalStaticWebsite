import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthWrapper from './index';

const theme = createTheme();

describe('AuthWrapper', () => {
    it('renders children without crashing', () => {
        render(
            <ThemeProvider theme={theme}>
                <AuthWrapper>
                    <div>Login form</div>
                </AuthWrapper>
            </ThemeProvider>
        );
        expect(screen.getByText('Login form')).toBeInTheDocument();
    });

    it('renders logo', () => {
        render(
            <ThemeProvider theme={theme}>
                <AuthWrapper>
                    <span>Child</span>
                </AuthWrapper>
            </ThemeProvider>
        );
        expect(screen.getByRole('img', { name: /Logo/i })).toBeInTheDocument();
    });
});
