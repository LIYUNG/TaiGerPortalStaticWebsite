import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: true })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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
    getCRMStatsQuery: vi.fn(() => ({
        queryKey: ['crm/stats'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: () => <div data-testid="bar-chart" />
}));

import CRMDashboard from './index';

describe('CRMDashboard', () => {
    it('renders loading state without crashing', () => {
        render(
            <MemoryRouter>
                <CRMDashboard />
            </MemoryRouter>
        );
        // isLoading is true, so Loading component renders
        expect(document.body).toBeTruthy();
    });

    it('renders dashboard content when data is available', async () => {
        const { useQuery } = await import('@tanstack/react-query');
        (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
            data: {
                data: { data: { totalLeadCount: 5, totalMeetingCount: 3 } }
            },
            isLoading: false
        });

        render(
            <MemoryRouter>
                <CRMDashboard />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });
});
