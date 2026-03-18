import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InterviewTraining from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    isProgramAdmitted: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false),
    isProgramRejected: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student',
        PROFILE_HASH: '#profile',
        INTERVIEW_ADD_LINK: '/interview/add',
        INTERVIEW_SINGLE_LINK: () => '/interview'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div>Modal</div>
}));
vi.mock('./InterviewsTable', () => ({
    InterviewsTable: () => (
        <div data-testid="interviews-table">InterviewsTable</div>
    )
}));

vi.mock('@/api', () => ({
    getMyInterviews: vi.fn(),
    getAllInterviews: vi.fn(() =>
        Promise.resolve({
            data: { success: true, data: [], student: null },
            status: 200
        })
    )
}));

vi.mock('@utils/contants', () => ({
    convertDate: (d: string) => d,
    showTimezoneOffset: () => 'UTC+0'
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('InterviewTraining', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <InterviewTraining />
            </MemoryRouter>
        );
    });

    it('renders breadcrumb with company name', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders Interview Center breadcrumb label', () => {
        expect(screen.getByText(/interview center/i)).toBeInTheDocument();
    });

    it('renders interviews table', () => {
        expect(screen.getByTestId('interviews-table')).toBeInTheDocument();
    });

    it('renders Add button for TaiGer role', () => {
        expect(
            screen.getByRole('button', { name: /add/i })
        ).toBeInTheDocument();
    });
});
