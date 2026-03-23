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

vi.mock('@hooks/useActiveThreads', () => ({
    useActiveThreads: () => ({
        data: [],
        isLoading: false
    })
}));

vi.mock('@pages/Utils/util_functions', () => ({
    file_category_const: { essay_required: 'essay_required' }
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: ({ items }: { items: { label: string }[] }) => (
        <nav data-testid="breadcrumbs">
            {items.map((item, i) => (
                <span key={i}>{item.label}</span>
            ))}
        </nav>
    )
}));

vi.mock('./AssignEssayWritersPage', () => ({
    default: () => <div data-testid="assign-essay-writers-page" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import AssignEssayWriters from './index';

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

describe('AssignEssayWriters', () => {
    beforeEach(() => {
        render(<AssignEssayWriters />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs navigation', () => {
        expect(screen.getByTestId('breadcrumbs')).toBeTruthy();
    });

    it('renders company name in breadcrumb', () => {
        expect(screen.getByText('TaiGer')).toBeTruthy();
    });

    it('renders the assign essay writers page content', () => {
        expect(screen.getByTestId('assign-essay-writers-page')).toBeTruthy();
    });
});
