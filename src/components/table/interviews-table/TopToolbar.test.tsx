import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />,
    MRT_ToggleFiltersButton: () => <button data-testid="toggle-filters" />
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

import { TopToolbar } from './TopToolbar';

const mockTableNoSelection = {
    getSelectedRowModel: () => ({ rows: [] })
};

const mockTableWithSelection = {
    getSelectedRowModel: () => ({ rows: [{ original: { _id: 'i1' } }] })
};

const mockAdminUser = { role: 'Admin' };

describe('TopToolbar (interviews-table) as admin, no selection', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onAssignClick={vi.fn()}
                    table={mockTableNoSelection}
                    user={mockAdminUser}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('global-filter')).toBeDefined();
    });

    it('renders Assign button', () => {
        expect(screen.getByText(/Assign/)).toBeDefined();
    });

    it('renders toggle filters button', () => {
        expect(screen.getByTestId('toggle-filters')).toBeDefined();
    });
});

describe('TopToolbar (interviews-table) with selection', () => {
    it('renders with a selected row', () => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onAssignClick={vi.fn()}
                    table={mockTableWithSelection}
                    user={mockAdminUser}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Assign/)).toBeDefined();
    });
});
