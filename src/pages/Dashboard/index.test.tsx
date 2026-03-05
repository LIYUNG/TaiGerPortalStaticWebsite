import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
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
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Guest: vi.fn(() => false),
    is_TaiGer_Manager: vi.fn(() => false),
    is_TaiGer_External: vi.fn(() => false)
}));

// Mock child dashboard views so this test only covers the Dashboard wrapper
vi.mock('./DashboardBody', () => ({
    default: () => <div data-testid="dashboard-body" />
}));

import Dashboard from './index';

describe('Dashboard', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });

    it('renders the dashboard body', () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
        expect(screen.getByTestId('dashboard-body')).toBeTruthy();
    });

    it('renders with data-testid on wrapper', () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
        expect(screen.getByTestId('dashoboard_component')).toBeTruthy();
    });
});
