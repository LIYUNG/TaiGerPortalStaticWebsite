import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="material-react-table" />,
    useMaterialReactTable: vi.fn(() => ({
        getFilteredRowModel: () => ({ rows: [] })
    }))
}));

vi.mock('export-to-csv', () => ({
    mkConfig: vi.fn(() => ({})),
    generateCsv: vi.fn(() => () => ''),
    download: vi.fn(() => () => {})
}));

import { MuiDataGrid } from './index';

const mockColumns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'role', headerName: 'Role', width: 100 }
];

const mockRows = [
    { id: '1', name: 'Alice Smith', role: 'Agent' },
    { id: '2', name: 'Bob Jones', role: 'Student' }
];

describe('MuiDataGrid', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MuiDataGrid columns={mockColumns} rows={mockRows} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });
});

describe('MuiDataGrid with empty rows', () => {
    it('renders with empty rows', () => {
        render(
            <MemoryRouter>
                <MuiDataGrid columns={mockColumns} rows={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });

    it('renders in simple mode', () => {
        render(
            <MemoryRouter>
                <MuiDataGrid columns={mockColumns} rows={mockRows} simple={true} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });

    it('renders in loading mode', () => {
        render(
            <MemoryRouter>
                <MuiDataGrid
                    columns={mockColumns}
                    isLoading={true}
                    rows={mockRows}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });
});
