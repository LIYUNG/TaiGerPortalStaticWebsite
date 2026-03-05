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
        TEAM_ADMIN_LINK: (id: string) => `/admin/${id}`,
        TEAM_AGENT_LINK: (id: string) => `/agent/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editor/${id}`
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('@hooks/useTeamMembers', () => ({
    useTeamMembers: () => ({
        teams: [
            { _id: { toString: () => 'a1' }, firstname: 'Alice', lastname: 'Admin', role: 'Admin', email: 'alice@example.com' },
            { _id: { toString: () => 'ag1' }, firstname: 'Bob', lastname: 'Agent', role: 'Agent', email: 'bob@example.com' },
            { _id: { toString: () => 'e1' }, firstname: 'Carol', lastname: 'Editor', role: 'Editor', email: 'carol@example.com' }
        ],
        isLoading: false,
        isError: false,
        error: null,
        success: true,
        status: 200
    })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../../Utils/ErrorPage', () => ({
    default: ({ res_status }: { res_status: number }) => <div data-testid="error-page">{res_status}</div>
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, opts?: Record<string, unknown>) => opts?.tenant ? `${opts.tenant} ${key}` : key })
}));

import TaiGerMember from './index';

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

describe('TaiGerMember', () => {
    beforeEach(() => {
        render(<TaiGerMember />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        expect(document.querySelector('[aria-label="breadcrumb"]')).toBeTruthy();
    });

    it('renders member sections for agent and editor', () => {
        expect(screen.getByText('Agent')).toBeTruthy();
        expect(screen.getByText('Editor')).toBeTruthy();
    });

    it('renders admin section when admin user', () => {
        expect(screen.getByText('Admin')).toBeTruthy();
    });
});
