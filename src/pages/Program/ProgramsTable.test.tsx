import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProgramsTable } from './ProgramsTable';

// IMPORTANT: these mock return values are module-scoped constants so they
// keep referential identity across every render. Returning a fresh object
// from the mock on each render would cause the component's
// `useEffect(..., [rowSelection, data?.programs])` to fire every render and
// loop forever, exhausting the worker heap.
const mockUseProgramsResult = {
    data: {
        programs: [
            {
                _id: 'p1',
                school: 'TU Berlin',
                program_name: 'Computer Science',
                programSubjects: ['CS'],
                tags: ['top']
            }
        ],
        total: 1,
        page: 1,
        limit: 20
    },
    isLoading: false,
    isFetching: false
};
vi.mock('@hooks/usePrograms', () => ({
    usePrograms: () => mockUseProgramsResult
}));

const mockUseMaterialReactTableResult = {
    getSelectedRowModel: () => ({ rows: [] }),
    resetRowSelection: vi.fn(),
    options: {} as Record<string, unknown>
};
vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="material-react-table" />,
    useMaterialReactTable: () => mockUseMaterialReactTableResult
}));

vi.mock('@components/table', () => ({
    getTableConfig: vi.fn(() => ({})),
    useTableStyles: vi.fn(() => ({ toolbarStyle: {} }))
}));

vi.mock('@components/table/programs-table/TopToolbar', () => ({
    TopToolbar: () => <div data-testid="top-toolbar" />
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`
    }
}));

vi.mock('./AssignProgramsToStudentDialog', () => ({
    AssignProgramsToStudentDialog: () => <div data-testid="assign-dialog" />
}));

vi.mock('@utils/contants', () => ({
    COUNTRIES_ARRAY_OPTIONS: [{ value: 'DE', label: 'Germany' }],
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false }))
}));

vi.mock('@taiger-common/model', () => ({
    PROGRAM_SUBJECTS: {
        CS: { label: 'Computer Science', category: 'Engineering' }
    },
    SCHOOL_TAGS: {
        TOP50: { label: 'QS Top 50 Universities', category: 'TOP50' }
    }
}));

vi.mock('../Utils/util_functions', () => ({
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false }))
}));

const defaultProps = {
    student: { _id: 's1' }
};

describe('ProgramsTable', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <ProgramsTable {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeInTheDocument();
        expect(screen.getByTestId('assign-dialog')).toBeInTheDocument();
    });

    it('renders with student prop omitted', () => {
        render(
            <MemoryRouter>
                <ProgramsTable />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeInTheDocument();
    });
});
