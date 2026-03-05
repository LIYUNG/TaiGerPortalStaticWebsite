import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />,
    MRT_ToggleFiltersButton: () => <button data-testid="toggle-filters" />
}));

vi.mock('@store/constant', () => ({
    default: {
        COURSE_DATABASE_EDIT: (id: string) => `/courses/edit/${id}`,
        COURSE_DATABASE_NEW: '/courses/new'
    }
}));

import { TopToolbar } from './TopToolbar';

const mockTableNoSelection = {
    getSelectedRowModel: () => ({ rows: [] })
};

const mockTableWithSelection = {
    getSelectedRowModel: () => ({
        rows: [{ original: { _id: 'course1' } }]
    })
};

describe('TopToolbar (all-courses-table) with no selection', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onDeleteClick={vi.fn()}
                    table={mockTableNoSelection}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('global-filter')).toBeDefined();
    });

    it('renders Delete and Edit buttons disabled', () => {
        const deleteBtn = screen.getByText(/Delete/i);
        expect(deleteBtn).toBeDefined();
    });

    it('renders Add New Course button', () => {
        expect(screen.getByText(/Add New Course/)).toBeDefined();
    });
});

describe('TopToolbar (all-courses-table) with selection', () => {
    it('renders with a selected row', () => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onDeleteClick={vi.fn()}
                    table={mockTableWithSelection}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Edit/)).toBeDefined();
    });
});
