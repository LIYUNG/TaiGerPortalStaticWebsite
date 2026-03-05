import { render, screen } from '@testing-library/react';
import GoogleOAuthCallback from './index';

vi.mock('@/api', () => ({
    googleOAuthCallback: vi.fn(() => new Promise(() => {})) // never resolves — stays isPending
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ login: vi.fn() })
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
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('?code=oauth-code')]
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('@tanstack/react-query');
    return {
        ...actual,
        useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: true,
            isError: false,
            isSuccess: false,
            error: null
        }))
    };
});

describe('GoogleOAuthCallback', () => {
    it('renders loading state when isPending is true', () => {
        render(<GoogleOAuthCallback />);
        expect(
            screen.getByText(/verifying your google account/i)
        ).toBeInTheDocument();
    });
});
