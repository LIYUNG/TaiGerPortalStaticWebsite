import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({
        data: {
            data: {
                byRole: [{ role: 'Student', count: 10 }],
                byTargetDegree: [{ degree: 'Master', count: 8 }],
                byApplicationSemester: [{ semester: 'WS2024', count: 5 }],
                byProgramLanguage: [{ language: 'English', count: 6 }],
                byTargetField: [],
                byUniversity: []
            }
        },
        isLoading: false,
        isError: false,
        error: null
    }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => true),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@/api/query', () => ({
    getUsersOverviewQuery: vi.fn(() => ({
        queryKey: ['users-overview'],
        queryFn: vi.fn()
    }))
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        STUDENT_DATABASE_LINK: '/student-database'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

import StudentDatabaseOverview from './StudentDatabaseOverview';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('StudentDatabaseOverview', () => {
    beforeEach(() => {
        render(<StudentDatabaseOverview />, { wrapper });
    });

    it('renders without crashing', () => {
        expect(document.body.innerHTML).not.toBe('');
    });

    it('renders the Distribution Analysis heading', () => {
        expect(screen.getByText('Distribution Analysis')).toBeTruthy();
    });

    it('renders the Student Database Overview heading', () => {
        expect(screen.getByText('Student Database Overview')).toBeTruthy();
    });
});
