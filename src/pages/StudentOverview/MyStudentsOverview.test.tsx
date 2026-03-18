import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyStudentsOverview from './MyStudentsOverview';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: { role: 'Agent', _id: 'a1' }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));
vi.mock('@components/StudentOverviewTable', () => ({
    default: () => (
        <div data-testid="student-overview-table">StudentOverviewTable</div>
    )
}));

vi.mock('@hooks/useActiveStudents', () => ({
    useActiveStudents: () => ({
        data: [
            {
                _id: 's1',
                firstname: 'Bob',
                lastname: 'Chen',
                editors: [{ _id: 'a1' }],
                agents: []
            }
        ],
        isLoading: false
    })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('MyStudentsOverview', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MyStudentsOverview />
            </MemoryRouter>
        );
    });

    it('renders breadcrumb with company name', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders student overview label', () => {
        expect(
            screen.getByText(/my active student overview/i)
        ).toBeInTheDocument();
    });

    it('renders StudentOverviewTable', () => {
        expect(
            screen.getByTestId('student-overview-table')
        ).toBeInTheDocument();
    });
});
