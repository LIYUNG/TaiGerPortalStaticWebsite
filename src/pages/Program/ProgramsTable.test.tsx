import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgramsTable } from './ProgramsTable';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="material-react-table" />,
    useMaterialReactTable: () => ({
        getSelectedRowModel: () => ({ rows: [] }),
        resetRowSelection: vi.fn(),
        options: {}
    })
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
    }
}));

vi.mock('../Utils/util_functions', () => ({
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false }))
}));

const defaultProps = {
    isLoading: false,
    data: [
        {
            _id: 'p1',
            school: 'TU Berlin',
            program_name: 'Computer Science',
            programSubjects: ['CS'],
            tags: ['top']
        }
    ],
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
    });

    it('renders assign dialog', () => {
        render(
            <MemoryRouter>
                <ProgramsTable {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('assign-dialog')).toBeInTheDocument();
    });

    it('renders with empty data array', () => {
        render(
            <MemoryRouter>
                <ProgramsTable isLoading={false} data={[]} student={{ _id: 's1' }} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeInTheDocument();
    });

    it('renders in loading state', () => {
        render(
            <MemoryRouter>
                <ProgramsTable isLoading={true} data={undefined} student={null} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('material-react-table')).toBeInTheDocument();
    });
});
