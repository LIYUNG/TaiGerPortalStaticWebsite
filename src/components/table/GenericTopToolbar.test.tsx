import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@mui/material';

vi.mock('material-react-table', () => ({
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />,
    MRT_ToggleFiltersButton: () => <button data-testid="toggle-filters" />
}));

import { GenericTopToolbar } from './GenericTopToolbar';

const mockTable = {
    getSelectedRowModel: () => ({ rows: [] })
};

describe('GenericTopToolbar (default layout)', () => {
    it('renders global filter', () => {
        render(
            <GenericTopToolbar
                actions={<Button>Action</Button>}
                table={mockTable}
            />
        );
        expect(screen.getByTestId('global-filter')).toBeDefined();
    });

    it('renders toggle filters button', () => {
        render(
            <GenericTopToolbar
                actions={<Button>Action</Button>}
                table={mockTable}
            />
        );
        expect(screen.getByTestId('toggle-filters')).toBeDefined();
    });

    it('renders passed actions', () => {
        render(
            <GenericTopToolbar
                actions={<Button>My Action</Button>}
                table={mockTable}
            />
        );
        expect(screen.getByText('My Action')).toBeDefined();
    });

    it('renders filterExtras when provided', () => {
        render(
            <GenericTopToolbar
                filterExtras={<div data-testid="extra-filter">Filter</div>}
                table={mockTable}
            />
        );
        expect(screen.getByTestId('extra-filter')).toBeDefined();
    });
});

describe('GenericTopToolbar (inline layout)', () => {
    it('renders global filter without toggle-filters button', () => {
        render(
            <GenericTopToolbar
                actions={<Button>Delete</Button>}
                layout="inline"
                table={mockTable}
            />
        );
        expect(screen.getByTestId('global-filter')).toBeDefined();
        expect(screen.queryByTestId('toggle-filters')).toBeNull();
    });

    it('renders passed actions', () => {
        render(
            <GenericTopToolbar
                actions={<Button>Delete</Button>}
                layout="inline"
                table={mockTable}
            />
        );
        expect(screen.getByText('Delete')).toBeDefined();
    });
});
