import { render, screen } from '@testing-library/react';
import SignIn from './SignIn';

vi.mock('@/api', () => ({
    login: vi.fn(() => Promise.resolve({ status: 200, data: { data: {} } }))
}));

vi.mock('@components/AuthWrapper', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    )
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ login: vi.fn() })
}));

vi.mock('@store/constant', () => ({
    default: {
        LOGIN_LINK: '/account/login',
        DASHBOARD_LINK: '/dashboard/default',
        LANDING_PAGE_LINK: '/account/home',
        FORGOT_PASSWORD_LINK: '/account/forgot-password'
    }
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    const React = require('react');
    const NavLinkMock = React.forwardRef<
        HTMLAnchorElement,
        { children?: React.ReactNode; to: string; [key: string]: unknown }
    >(function NavLinkMock(props, ref) {
        const { children, to, focusRipple, focusVisibleClassName, ...rest } =
            props;
        return (
            <a ref={ref} href={to} {...rest}>
                {children}
            </a>
        );
    });
    NavLinkMock.displayName = 'NavLinkMock';
    return {
        ...actual,
        NavLink: NavLinkMock,
        useNavigate: () => vi.fn()
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@components/Buttons/GoolgeSignInButton', () => ({
    GoogleLoginButton: () => <button>Continue with Google</button>
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('@tanstack/react-query');
    return {
        ...actual,
        useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false,
            isError: false
        }))
    };
});

describe('SignIn', () => {
    it('renders sign in form with email and password fields', () => {
        render(<SignIn />);
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the Login submit button', () => {
        render(<SignIn />);
        expect(
            screen.getByRole('button', { name: /login/i })
        ).toBeInTheDocument();
    });

    it('renders Google login button', () => {
        render(<SignIn />);
        expect(
            screen.getByRole('button', { name: /continue with google/i })
        ).toBeInTheDocument();
    });
});
