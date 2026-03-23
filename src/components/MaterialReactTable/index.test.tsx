import { ReactNode } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="material-react-table" />,
    useMaterialReactTable: vi.fn(() => ({}))
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
    LocalizationProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    )
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
    AdapterDayjs: vi.fn()
}));

import ExampleWithLocalizationProvider from './index';

const mockColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' }
];

const mockData = [
    { name: 'Alice Smith', role: 'Agent' },
    { name: 'Bob Jones', role: 'Student' }
];

describe('ExampleWithLocalizationProvider', () => {
    beforeEach(() => {
        render(
            <ExampleWithLocalizationProvider
                col={mockColumns}
                data={mockData}
            />
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });
});

describe('ExampleWithLocalizationProvider with row selection', () => {
    it('renders with row selection enabled', () => {
        render(
            <ExampleWithLocalizationProvider
                col={mockColumns}
                data={mockData}
                enableRowSelection={true}
                rowSelection={{}}
            />
        );
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });

    it('renders with empty data', () => {
        render(<ExampleWithLocalizationProvider col={mockColumns} data={[]} />);
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });
});
