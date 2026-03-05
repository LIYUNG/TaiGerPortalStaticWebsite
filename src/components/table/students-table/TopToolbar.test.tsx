import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />,
    MRT_ToggleFiltersButton: () => <button data-testid="toggle-filters" />
}));

import { TopToolbar } from './TopToolbar';

const mockTableEmpty = {
    getSelectedRowModel: () => ({ rows: [] }),
    getRowModel: () => ({ rows: [{ original: { id: 's1' } }] }),
    getPrePaginationRowModel: () => ({ rows: [{ original: { id: 's1' } }] })
};

const mockTableWithSelection = {
    getSelectedRowModel: () => ({
        rows: [{ original: { id: 's1' } }]
    }),
    getRowModel: () => ({ rows: [{ original: { id: 's1' } }] }),
    getPrePaginationRowModel: () => ({ rows: [{ original: { id: 's1' } }] })
};

describe('TopToolbar (students-table) with no selection', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onAgentClick={vi.fn()}
                    onArchiveClick={vi.fn()}
                    onAttributesClick={vi.fn()}
                    onEditorClick={vi.fn()}
                    onExportClick={vi.fn()}
                    table={mockTableEmpty}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('global-filter')).toBeDefined();
    });

    it('renders Export CSV button', () => {
        expect(screen.getByText('Export CSV')).toBeDefined();
    });

    it('renders Archive button', () => {
        expect(screen.getByText(/Archive/)).toBeDefined();
    });

    it('renders Assign Agents button', () => {
        expect(screen.getByText(/Assign Agents/)).toBeDefined();
    });
});

describe('TopToolbar (students-table) with selection', () => {
    it('renders with one row selected', () => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onAgentClick={vi.fn()}
                    onArchiveClick={vi.fn()}
                    onAttributesClick={vi.fn()}
                    onEditorClick={vi.fn()}
                    onExportClick={vi.fn()}
                    table={mockTableWithSelection}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Assign Editors/)).toBeDefined();
    });
});
