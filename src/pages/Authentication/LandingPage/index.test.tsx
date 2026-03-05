import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LandingPage from './index';

vi.mock('@store/constant', () => ({
    default: {
        LOGIN_LINK: '/account/login',
        DASHBOARD_LINK: '/dashboard/default',
        LANDING_PAGE_LINK: '/account/home',
        FORGOT_PASSWORD_LINK: '/account/forgot-password'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: {
        companyName: 'TaiGer',
        companyLandingPage: 'https://taiger.com',
        LoginPageLightLogo: '/logo-light',
        LoginPageDarkLogo: '/logo-dark'
    }
}));

vi.mock('@components/Footer/Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

const renderWithTheme = (
    ui: React.ReactElement,
    mode: 'light' | 'dark' = 'light'
) => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('LandingPage', () => {
    it('renders a login link and footer', () => {
        renderWithTheme(<LandingPage />);
        // The header has a "Login" button and the hero section has "Student Login"
        expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders the welcome heading', () => {
        renderWithTheme(<LandingPage />);
        expect(
            screen.getByText(/Welcome to TaiGer Consultancy Portal/i)
        ).toBeInTheDocument();
    });

    it('renders feature cards', () => {
        renderWithTheme(<LandingPage />);
        expect(screen.getByText('Our Services')).toBeInTheDocument();
        expect(screen.getByText('Testimonials')).toBeInTheDocument();
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });
});
