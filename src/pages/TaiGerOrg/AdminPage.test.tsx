import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('@hooks/useTeamMembers', () => ({
    useTeamMembers: vi.fn(() => ({
        teams: { firstname: 'Alice', lastname: 'Admin' },
        isLoading: false,
        isError: false,
        error: null,
        success: true,
        status: 200
    }))
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: ({ res_status }: { res_status: number }) => (
        <div data-testid="error-page">{res_status}</div>
    )
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

import AdminPage from './AdminPage';

describe('AdminPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        expect(
            document.querySelector('[aria-label="breadcrumb"]')
        ).toBeTruthy();
    });

    it('does not render error page initially', () => {
        expect(screen.queryByTestId('error-page')).toBeNull();
    });

    it('renders admin label', () => {
        expect(screen.getByText('Admin:')).toBeTruthy();
    });
});
