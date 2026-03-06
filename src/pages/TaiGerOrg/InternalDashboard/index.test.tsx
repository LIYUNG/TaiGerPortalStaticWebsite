import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
        useLocation: () => ({ hash: '' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(() => ({
            data: {
                agents_data: [],
                editors_data: [],
                documents: {},
                students_creation_dates: [],
                students_years_pair: [],
                agentStudentDistribution: [],
                finished_docs: []
            },
            isLoading: false,
            refetch: vi.fn()
        }))
    };
});

vi.mock('@/api/query', () => ({
    getStatisticsOverviewQuery: vi.fn(() => ({ queryKey: ['overview'], queryFn: vi.fn() })),
    getStatisticsAgentsQuery: vi.fn(() => ({ queryKey: ['agents'], queryFn: vi.fn() })),
    getStatisticsKPIQuery: vi.fn(() => ({ queryKey: ['kpi'], queryFn: vi.fn() })),
    getStatisticsResponseTimeQuery: vi.fn(() => ({ queryKey: ['response'], queryFn: vi.fn() }))
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    a11yProps: () => ({})
}));

vi.mock('@utils/contants', () => ({
    INTERNAL_DASHBOARD_TABS: {},
    INTERNAL_DASHBOARD_REVERSED_TABS: {}
}));

vi.mock('./OverviewDashboardTab', () => ({
    default: () => <div data-testid="overview-tab" />
}));

vi.mock('./AgentDashboard', () => ({
    default: () => <div data-testid="agent-dashboard" />
}));

vi.mock('./KPIDashboardTab', () => ({
    default: () => <div data-testid="kpi-tab" />
}));

vi.mock('./ResponseTimeDashboardTab', () => ({
    default: () => <div data-testid="response-time-tab" />
}));

vi.mock('../../Utils/util_functions', () => ({
    calculateDuration: vi.fn(() => 0)
}));

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

import InternalDashboard from './index';

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

describe('InternalDashboard', () => {
    beforeEach(() => {
        render(<InternalDashboard />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders the tabs', () => {
        expect(screen.getByText('Overview')).toBeTruthy();
        expect(screen.getByText('Agents')).toBeTruthy();
        expect(screen.getByText('KPI')).toBeTruthy();
        expect(screen.getByText('Response Time')).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        expect(document.querySelector('[aria-label="breadcrumb"]')).toBeTruthy();
    });

    it('renders overview tab content', () => {
        expect(screen.getByTestId('overview-tab')).toBeTruthy();
    });
});
