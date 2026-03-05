import { ReactNode } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="material-react-table" />,
    useMaterialReactTable: vi.fn(() => ({
        getSelectedRowModel: () => ({ rows: [] }),
        getFilteredRowModel: () => ({ rows: [] }),
        setColumnFilters: vi.fn()
    })),
    MRT_GlobalFilterTextField: () => <input data-testid="global-filter" />,
    MRT_ToggleFiltersButton: () => <button data-testid="toggle-filters" />
}));

vi.mock('@taiger-common/model', () => ({
    PROGRAM_SUBJECTS: {
        CS: { label: 'Computer Science', category: 'Engineering' },
        EE: { label: 'Electrical Engineering', category: 'Engineering' }
    }
}));

vi.mock('@mui/x-date-pickers', () => ({
    LocalizationProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    )
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
    AdapterDayjs: vi.fn()
}));

vi.mock('@pages/MyCourses/CourseAnalysisConfirmDialog', () => ({
    default: () => <div data-testid="course-analysis-dialog" />
}));

import { ProgramRequirementsTable } from './ProgramRequirementsTable';

const mockData = [
    {
        _id: 'p1',
        program_name: 'CS Masters',
        lang: 'en',
        country: 'DE',
        updatedAt: '2024-01-01',
        attributes: ['CS']
    },
    {
        _id: 'p2',
        program_name: 'EE Masters',
        lang: 'de',
        country: 'DE',
        updatedAt: '2024-01-02',
        attributes: []
    }
];

describe('ProgramRequirementsTable', () => {
    beforeEach(() => {
        render(
            <ProgramRequirementsTable
                data={mockData}
                onAnalyseV2={vi.fn(() => Promise.resolve())}
            />
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('material-react-table')).toBeDefined();
    });

    it('renders course analysis dialog', () => {
        expect(screen.getByTestId('course-analysis-dialog')).toBeDefined();
    });
});

describe('ProgramRequirementsTable with empty data', () => {
    it('renders with empty data and shows empty info', () => {
        render(
            <ProgramRequirementsTable
                data={[]}
                onAnalyseV2={vi.fn(() => Promise.resolve())}
            />
        );
        expect(screen.getByTestId('material-react-table')).toBeDefined();
        expect(screen.getByText(/No programs available/i)).toBeDefined();
    });
});
