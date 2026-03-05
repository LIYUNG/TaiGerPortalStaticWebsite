import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />
}));

import { TopToolbar } from './TopToolbar';

const mockTableNoSelection = {
    getSelectedRowModel: () => ({ rows: [] })
};

const mockTableWithSelection = {
    getSelectedRowModel: () => ({
        rows: [
            {
                original: {
                    _id: 'u1',
                    firstname: 'Alice',
                    lastname: 'Smith',
                    role: 'Agent',
                    archiv: false
                }
            }
        ]
    })
};

describe('TopToolbar (users-table) with no selection', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onArchiveClick={vi.fn()}
                    onDeleteClick={vi.fn()}
                    onEditClick={vi.fn()}
                    table={mockTableNoSelection}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('global-filter')).toBeDefined();
    });

    it('renders Delete button', () => {
        expect(screen.getByText(/Delete/)).toBeDefined();
    });

    it('renders Edit button', () => {
        expect(screen.getByText(/Edit/)).toBeDefined();
    });

    it('renders Archive button', () => {
        expect(screen.getByText(/Archive/)).toBeDefined();
    });
});

describe('TopToolbar (users-table) with selection', () => {
    it('renders with a selected user row', () => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onArchiveClick={vi.fn()}
                    onDeleteClick={vi.fn()}
                    onEditClick={vi.fn()}
                    table={mockTableWithSelection}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Edit/)).toBeDefined();
    });
});
