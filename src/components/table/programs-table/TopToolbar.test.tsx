import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />,
    MRT_ToggleFiltersButton: () => <button data-testid="toggle-filters" />
}));

vi.mock('@taiger-common/model', () => ({
    PROGRAM_SUBJECTS: {
        CS: { label: 'Computer Science', category: 'Engineering' }
    },
    SCHOOL_TAGS: {
        TU: { label: 'Technical University', category: 'Type' }
    }
}));

vi.mock('@store/constant', () => ({
    default: {
        NEW_PROGRAM: '/programs/new',
        PROGRAM_ANALYSIS: '/program-analysis',
        SCHOOL_CONFIG: '/school-config'
    }
}));

import { TopToolbar } from './TopToolbar';

const mockTable = {
    setColumnFilters: vi.fn(),
    getSelectedRowModel: () => ({ rows: [] })
};

describe('TopToolbar (programs-table)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onAssignClick={vi.fn()}
                    table={mockTable}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('global-filter')).toBeDefined();
    });

    it('renders Add New Program button', () => {
        expect(screen.getByText(/Add New Program/)).toBeDefined();
    });

    it('renders Program Requirements button', () => {
        expect(screen.getByText(/Program Requirements/)).toBeDefined();
    });

    it('renders Assign button', () => {
        expect(screen.getByText(/Assign/)).toBeDefined();
    });
});

describe('TopToolbar (programs-table) school config', () => {
    it('renders School Configuration button', () => {
        render(
            <MemoryRouter>
                <TopToolbar
                    onAssignClick={vi.fn()}
                    table={mockTable}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/School Configuration/)).toBeDefined();
    });
});
