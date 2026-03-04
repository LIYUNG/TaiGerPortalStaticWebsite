import { render, screen } from '@testing-library/react';
import { AllCoursesTable } from './AllCoursesTable';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({
        resetRowSelection: vi.fn(),
        getSelectedRowModel: vi.fn(() => ({ rows: [] }))
    })),
    MRT_ColumnDef: {}
}));

vi.mock('@components/table', () => ({
    getTableConfig: vi.fn(() => ({})),
    useTableStyles: vi.fn(() => ({ toolbarStyle: {} }))
}));

vi.mock('@components/table/all-courses-table/TopToolbar', () => ({
    TopToolbar: () => <div data-testid="top-toolbar" />
}));

vi.mock('./DeleteCourseDialog', () => ({
    DeleteCourseDialog: () => <div data-testid="delete-course-dialog" />
}));

describe('AllCoursesTable', () => {
    it('renders MaterialReactTable', () => {
        render(<AllCoursesTable data={[]} isLoading={false} />);
        expect(screen.getByTestId('mrt')).toBeInTheDocument();
    });

    it('renders DeleteCourseDialog', () => {
        render(<AllCoursesTable data={[]} isLoading={false} />);
        expect(screen.getByTestId('delete-course-dialog')).toBeInTheDocument();
    });
});
