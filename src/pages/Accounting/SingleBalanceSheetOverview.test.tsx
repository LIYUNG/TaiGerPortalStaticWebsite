import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null
    }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        ACCOUNTING_LINK: '/accounting',
        TEAM_AGENT_ARCHIV_LINK: (id: string) => `/team/agent/${id}/archiv`
    }
}));

vi.mock('../../config', () => ({ appConfig: { companyName: 'TaiGer' } }));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: () => <nav data-testid="breadcrumbs" />
}));

vi.mock('@/api/query', () => ({
    getExpenseQuery: vi.fn(() => ({ queryKey: ['expense'], queryFn: vi.fn() }))
}));

vi.mock('@components/ExtendableTable/ExtendableTable', () => ({
    ExtendableTable: () => <div data-testid="extendable-table" />
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn(() => ({ sx: {}, children: 'AB' }))
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import SingleBalanceSheetOverview from './SingleBalanceSheetOverview';

describe('SingleBalanceSheetOverview', () => {
    it('shows loading spinner while fetching', () => {
        render(
            <MemoryRouter initialEntries={['/accounting/user123']}>
                <Routes>
                    <Route
                        path="/accounting/:taiger_user_id"
                        element={<SingleBalanceSheetOverview />}
                    />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders without crashing for a known user id', () => {
        render(
            <MemoryRouter initialEntries={['/accounting/user123']}>
                <Routes>
                    <Route
                        path="/accounting/:taiger_user_id"
                        element={<SingleBalanceSheetOverview />}
                    />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
