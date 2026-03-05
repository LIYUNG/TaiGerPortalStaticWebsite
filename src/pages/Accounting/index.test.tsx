import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@hooks/useTeamMembers', () => ({
    useTeamMembers: vi.fn(() => ({
        teams: [],
        isLoading: false,
        isError: false,
        error: null,
        success: true,
        status: 200
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
        ACCOUNTING_USER_ID_LINK: (id: string) => `/accounting/${id}`
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

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn(() => ({ sx: {}, children: 'AB' }))
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import Accounting from './index';

describe('Accounting', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Accounting />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('renders agents and editors sections', () => {
        render(
            <MemoryRouter>
                <Accounting />
            </MemoryRouter>
        );
        // The component renders "Agents (0)" and "Editors (0)" as h6 headings
        const agentsHeadings = screen.getAllByText(/Agents/i);
        expect(agentsHeadings.length).toBeGreaterThan(0);
        const editorsHeadings = screen.getAllByText(/Editors/i);
        expect(editorsHeadings.length).toBeGreaterThan(0);
    });

    it('shows loading spinner when data is loading', async () => {
        const { useTeamMembers } = await import('@hooks/useTeamMembers');
        vi.mocked(useTeamMembers).mockReturnValue({
            teams: [],
            isLoading: true,
            isError: false,
            error: null,
            success: false,
            status: undefined
        } as never);
        render(
            <MemoryRouter>
                <Accounting />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
