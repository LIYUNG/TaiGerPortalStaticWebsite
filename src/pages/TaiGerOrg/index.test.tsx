import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_role: vi.fn(() => true),
    Role: { Admin: 'Admin', Agent: 'Agent', Editor: 'Editor' }
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        TEAM_AGENT_LINK: (id: string) => `/agent/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editor/${id}`,
        TEAM_ADMIN_LINK: (id: string) => `/admin/${id}`,
        TEAM_MEMBER_LINK: (id: string) => `/member/${id}`
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '123' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@hooks/useTeamMembers', () => ({
    useTeamMembers: () => ({
        teams: [
            {
                _id: { toString: () => 'u0' },
                firstname: 'Admin',
                lastname: 'User',
                role: 'Admin',
                permissions: [{}]
            },
            {
                _id: { toString: () => 'u1' },
                firstname: 'Alice',
                lastname: 'Smith',
                role: 'Agent',
                permissions: [{}]
            },
            {
                _id: { toString: () => 'u2' },
                firstname: 'Bob',
                lastname: 'Jones',
                role: 'Editor',
                permissions: [{}]
            }
        ],
        isLoading: false,
        isError: false,
        error: null,
        success: true,
        status: 200,
        queryKey: ['team']
    })
}));

vi.mock('@/api', () => ({
    updateUserPermission: vi.fn(() => Promise.resolve({})),
    queryClient: { invalidateQueries: vi.fn() }
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

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn(() => ({ sx: {}, children: 'AB' }))
}));

vi.mock('./GrantPermissionModal', () => ({
    default: () => <div data-testid="grant-permission-modal" />
}));

vi.mock('./GrantManagerModal', () => ({
    default: () => <div data-testid="grant-manager-modal" />
}));

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

import TaiGerOrg from './index';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
    );
};

describe('TaiGerOrg', () => {
    beforeEach(() => {
        render(<TaiGerOrg />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders the team sections', () => {
        expect(screen.queryByTestId('loading')).toBeNull();
        expect(screen.queryByTestId('error-page')).toBeNull();
    });

    it('renders breadcrumbs', () => {
        expect(
            document.querySelector('[aria-label="breadcrumb"]')
        ).toBeTruthy();
    });

    it('renders admin section when admin user', () => {
        expect(screen.getByText('Administrators')).toBeTruthy();
    });
});
