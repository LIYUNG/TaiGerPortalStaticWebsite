import { render, screen } from '@testing-library/react';
import ResetPasswordRequest from './ResetPasswordRequest';

vi.mock('@/api', () => ({
    forgotPassword: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

vi.mock('@components/AuthWrapper', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    )
}));

vi.mock('@store/constant', () => ({
    default: {
        LOGIN_LINK: '/account/login',
        DASHBOARD_LINK: '/dashboard/default',
        LANDING_PAGE_LINK: '/account/home',
        FORGOT_PASSWORD_LINK: '/account/forgot-password'
    }
}));

vi.mock('react-router-dom', () => ({
    NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => vi.fn()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

describe('ResetPasswordRequest', () => {
    it('renders the heading and email field', () => {
        render(<ResetPasswordRequest />);
        expect(screen.getByText('Reset Login Password')).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders the Reset button', () => {
        render(<ResetPasswordRequest />);
        expect(
            screen.getByRole('button', { name: /reset/i })
        ).toBeInTheDocument();
    });

    it('renders a link to Login page', () => {
        render(<ResetPasswordRequest />);
        expect(
            screen.getByRole('link', { name: /login/i })
        ).toBeInTheDocument();
    });
});
