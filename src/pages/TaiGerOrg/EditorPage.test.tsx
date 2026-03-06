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
    default: {
        DASHBOARD_LINK: '/',
        TEAM_MEMBERS_LINK: '/team',
        TEAM_EDITOR_ARCHIV_LINK: (id: string) => `/editor/${id}/archiv`,
        CV_ML_RL_DASHBOARD_LINK: '/cvmlrl'
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ user_id: 'editor1' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(() => ({
            data: {
                user: { _id: { toString: () => 'editor1' }, firstname: 'Bob', lastname: 'Editor', pictureUrl: '' },
                threads: []
            },
            isLoading: false
        }))
    };
});

vi.mock('@/api/query', () => ({
    getMyStudentsThreadsQuery: vi.fn(() => ({ queryKey: ['threads'], queryFn: vi.fn() }))
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
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'essay_required' },
    formatDate: vi.fn(() => '2025-01-01'),
    frequencyDistribution: vi.fn(() => ({})),
    open_tasks_v2: vi.fn(() => [])
}));

vi.mock('@utils/contants', () => ({
    is_my_fav_message_status: vi.fn(() => false),
    is_new_message_status: vi.fn(() => false),
    is_pending_status: vi.fn(() => false)
}));

vi.mock('@components/Charts/TasksDistributionBarChart', () => ({
    default: () => <div data-testid="tasks-chart" />
}));

vi.mock('../CVMLRLCenter/CVMLRLOverview', () => ({
    default: () => <div data-testid="cvmlrl-overview" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('query-string', () => ({
    default: { stringify: vi.fn(() => '') }
}));

import EditorPage from './EditorPage';

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

describe('EditorPage', () => {
    beforeEach(() => {
        render(<EditorPage />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        expect(document.querySelector('[aria-label="breadcrumb"]')).toBeTruthy();
    });

    it('renders editor stats cards', () => {
        expect(screen.getByText('Open Tasks')).toBeTruthy();
    });

    it('renders archived students button', () => {
        expect(screen.getByText('View Archived Students')).toBeTruthy();
    });
});
