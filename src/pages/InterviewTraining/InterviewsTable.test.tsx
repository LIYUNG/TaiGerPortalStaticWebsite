import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@components/table', () => ({
    getTableConfig: vi.fn(() => ({})),
    useTableStyles: vi.fn(() => ({ toolbarStyle: {} }))
}));

vi.mock('@components/table/interviews-table/TopToolbar', () => ({
    TopToolbar: () => <div data-testid="top-toolbar" />
}));

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt-table" />,
    useMaterialReactTable: vi.fn(() => ({
        getSelectedRowModel: vi.fn(() => ({ rows: [] })),
        resetRowSelection: vi.fn(),
        options: {}
    }))
}));

vi.mock('@/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/api')>();
    return {
        ...actual,
        getUsers: vi.fn().mockResolvedValue({
            data: { data: [], success: true }
        })
    };
});

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: vi.fn(() => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    }))
}));

import { InterviewsTable } from './InterviewsTable';

describe('InterviewsTable', () => {
    it('renders the MaterialReactTable', () => {
        render(
            <MemoryRouter>
                <InterviewsTable isLoading={false} data={[]} columns={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mrt-table')).toBeTruthy();
    });

    it('renders with isLoading true', () => {
        render(
            <MemoryRouter>
                <InterviewsTable
                    isLoading={true}
                    data={undefined}
                    columns={[]}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mrt-table')).toBeTruthy();
    });
});
