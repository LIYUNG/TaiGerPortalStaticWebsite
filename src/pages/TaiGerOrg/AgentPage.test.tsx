import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        TEAM_MEMBERS_LINK: '/team',
        TEAM_AGENT_ARCHIV_LINK: (id: string) => `/agent/${id}/archiv`
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ user_id: 'agent1' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@hooks/useMyStudentsApplicationsV2', () => ({
    useMyStudentsApplicationsV2: () => ({
        data: {
            user: { _id: 'agent1', firstname: 'Alice', lastname: 'Agent', pictureUrl: '' },
            applications: []
        },
        isLoading: false
    })
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: () => ({
        data: [],
        isLoading: false
    })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/util_functions', () => ({
    formatDate: vi.fn(() => '2025-01-01')
}));

vi.mock('../ApplicantsOverview/ApplicationOverviewTabs', () => ({
    default: () => <div data-testid="app-overview-tabs" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import AgentPage from './AgentPage';

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

describe('AgentPage', () => {
    beforeEach(() => {
        render(<AgentPage />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        expect(document.querySelector('[aria-label="breadcrumb"]')).toBeTruthy();
    });

    it('renders agent stats cards', () => {
        expect(screen.getByText('Active Students')).toBeTruthy();
    });

    it('renders archived students button', () => {
        expect(screen.getByText('View Archived Students')).toBeTruthy();
    });
});
