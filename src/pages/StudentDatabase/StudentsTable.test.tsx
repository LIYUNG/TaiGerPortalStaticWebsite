import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({
        getSelectedRowModel: vi.fn(() => ({ rows: [] })),
        resetRowSelection: vi.fn(),
        options: {}
    })),
    createMRTColumnHelper: vi.fn(() => ({
        accessor: vi.fn((key: string, opts: Record<string, unknown>) => ({
            accessorKey: key,
            ...opts
        }))
    }))
}));

vi.mock('@components/table', () => ({
    getTableConfig: vi.fn(() => ({})),
    useTableStyles: vi.fn(() => ({ toolbarStyle: {} }))
}));

vi.mock('@components/table/students-table/TopToolbar', () => ({
    TopToolbar: () => <div data-testid="top-toolbar" />
}));

vi.mock(
    '@pages/Dashboard/MainViewTab/StudDocsOverview/EditUserListSubpage',
    () => ({
        default: () => <div data-testid="edit-user-list-subpage" />
    })
);

vi.mock(
    '@pages/Dashboard/MainViewTab/StudDocsOverview/EditAttributesSubpage',
    () => ({
        default: () => <div data-testid="edit-attributes-subpage" />
    })
);

vi.mock('../Utils/util_functions', () => ({
    is_User_Archived: vi.fn(() => false)
}));

vi.mock('export-to-csv', () => ({
    mkConfig: vi.fn(() => ({})),
    generateCsv: vi.fn(() => () => ''),
    download: vi.fn(() => () => undefined)
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/123'),
        PROFILE_HASH: '#profile'
    }
}));

import { StudentsTable } from './StudentsTable';

const defaultProps = {
    isLoading: false,
    data: [],
    submitUpdateAgentlist: vi.fn(),
    submitUpdateEditorlist: vi.fn(),
    submitUpdateAttributeslist: vi.fn(),
    updateStudentArchivStatus: vi.fn()
};

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('StudentsTable', () => {
    it('renders without crashing', () => {
        render(<StudentsTable {...defaultProps} />, { wrapper });
        expect(screen.getByTestId('mrt')).toBeTruthy();
    });

    it('renders with empty data array', () => {
        render(<StudentsTable {...defaultProps} data={[]} />, { wrapper });
        expect(screen.getByTestId('mrt')).toBeTruthy();
    });

    it('renders in loading state', () => {
        render(<StudentsTable {...defaultProps} isLoading={true} />, {
            wrapper
        });
        expect(screen.getByTestId('mrt')).toBeTruthy();
    });
});
