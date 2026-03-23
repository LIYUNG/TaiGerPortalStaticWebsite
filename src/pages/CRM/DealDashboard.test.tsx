import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
        variables: null
    })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        setQueryData: vi.fn()
    }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Guest: vi.fn(() => false)
}));

vi.mock('@/api/query', () => ({
    getCRMDealsQuery: vi.fn(() => ({
        queryKey: ['crm/deals'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@/api', () => ({
    updateCRMDeal: vi.fn().mockResolvedValue({ data: {} })
}));

vi.mock('@pages/CRM/components/DealModal', () => ({
    default: () => <div data-testid="deal-modal" />
}));

vi.mock('@pages/CRM/components/StatusMenu', () => ({
    default: () => <div data-testid="status-menu" />
}));

vi.mock('material-react-table', () => ({
    MaterialReactTable: ({ data }: { data: unknown[] }) => (
        <div data-testid="material-react-table">rows: {data.length}</div>
    )
}));

import DealDashboard from './DealDashboard';

describe('DealDashboard', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <DealDashboard />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });

    it('renders the table', () => {
        render(
            <MemoryRouter>
                <DealDashboard />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeTruthy();
    });

    it('renders create deal button', () => {
        render(
            <MemoryRouter>
                <DealDashboard />
            </MemoryRouter>
        );
        // button text comes from translation key
        expect(screen.getByRole('button')).toBeTruthy();
    });
});
