import { render, screen } from '@testing-library/react';
import ResetPassword from './ResetPassword';

vi.mock('@/api', () => ({
    resetPassword: vi.fn(() => Promise.resolve({ data: { success: true } }))
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

describe('ResetPassword', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: { search: '?email=test%40example.com&token=reset-token' },
            writable: true
        });
    });

    it('renders the Reset Login Password heading', () => {
        render(<ResetPassword />);
        expect(screen.getByText('Reset Login Password')).toBeInTheDocument();
    });

    it('renders password input fields', () => {
        render(<ResetPassword />);
        expect(document.querySelector('#password-input')).toBeInTheDocument();
        expect(
            document.querySelector('#password-again-input')
        ).toBeInTheDocument();
    });

    it('renders the Reset button', () => {
        render(<ResetPassword />);
        expect(
            screen.getByRole('button', { name: /reset/i })
        ).toBeInTheDocument();
    });
});
