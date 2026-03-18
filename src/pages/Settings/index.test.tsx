import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'a1',
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@example.com',
            firstname_chinese: '',
            lastname_chinese: '',
            birthday: ''
        },
        logout: vi.fn()
    })
}));

vi.mock('@components/ThemeProvider', () => ({
    useCustomTheme: () => ({ isDarkMode: false, toggleDarkMode: vi.fn() })
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div>Modal</div>
}));
vi.mock('@/api', () => ({ updateCredentials: vi.fn() }));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('Settings', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );
    });

    it('renders settings page breadcrumb', () => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders password reset section', () => {
        expect(screen.getByText(/reset login password/i)).toBeInTheDocument();
    });

    it('renders theme preference section', () => {
        expect(screen.getByText(/preference/i)).toBeInTheDocument();
    });

    it('renders reset password button', () => {
        expect(
            screen.getByRole('button', { name: /reset password/i })
        ).toBeInTheDocument();
    });
});
