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
        useNavigate: () => vi.fn()
    };
});

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(() => ({
            data: { data: { success: true, data: [] }, status: 200 },
            isLoading: false,
            isError: false,
            error: null
        }))
    };
});

vi.mock('@/api/query', () => ({
    getApplicationConflictsQuery: vi.fn(() => ({ queryKey: ['conflicts'], queryFn: vi.fn() }))
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

vi.mock('@pages/Dashboard/MainViewTab/ProgramConflict/TabProgramConflict', () => ({
    default: () => <div data-testid="tab-program-conflict" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import ProgramConflictDashboard from './index';

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

describe('ProgramConflictDashboard', () => {
    beforeEach(() => {
        render(<ProgramConflictDashboard />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        expect(document.querySelector('[aria-label="breadcrumb"]')).toBeTruthy();
    });

    it('renders program conflict tab', () => {
        expect(screen.getByTestId('tab-program-conflict')).toBeTruthy();
    });

    it('does not render error page when data loads successfully', () => {
        expect(screen.queryByTestId('error-page')).toBeNull();
    });
});
