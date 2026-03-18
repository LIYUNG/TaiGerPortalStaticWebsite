import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Student',
            _id: 'u1',
            firstname: 'Alice',
            lastname: 'Wang',
            firstname_chinese: '愛麗絲',
            lastname_chinese: '王',
            birthday: '2000-01-01',
            email: 'alice@example.com',
            lineId: '',
            linkedIn: ''
        }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student',
        PROFILE_HASH: '#profile'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ user_id: undefined }) };
});

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div>Modal</div>
}));
vi.mock('../Utils/util_functions', () => ({
    is_personal_data_filled: vi.fn(() => true)
}));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));
vi.mock('@/api', () => ({
    updatePersonalData: vi.fn(),
    getUser: vi.fn()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('Profile', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
    });

    it('renders breadcrumb with company name', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders personal data label', () => {
        expect(screen.getByText(/personal data/i)).toBeInTheDocument();
    });

    it('renders first name field', () => {
        expect(screen.getAllByLabelText(/first name/i).length).toBeGreaterThan(
            0
        );
    });

    it('renders update button', () => {
        expect(
            screen.getByRole('button', { name: /update/i })
        ).toBeInTheDocument();
    });
});
