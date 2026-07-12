import { render, screen, fireEvent, within } from '@testing-library/react';
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
                tags: ['TOP50'],
                degree: 'MSc',
                country: 'de',
                ielts: '6.5'
            },
            {
                _id: 'p2',
                school: 'RWTH Aachen',
                program_name: 'Data Science',
                programSubjects: ['CS'],
                tags: [],
                degree: 'MSc',
                country: 'de'
            }
        ],
        total: 2,
        page: 1,
        limit: 20
    },
    isLoading: false,
    isFetching: false
};
vi.mock('@hooks/usePrograms', () => ({
    usePrograms: () => mockUseProgramsResult
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`,
        NEW_PROGRAM: '/programs/create',
        PROGRAM_ANALYSIS: '/program-analysis',
        SCHOOL_CONFIG: '/programs/config'
    }
}));

vi.mock('./AssignProgramsToStudentDialog', () => ({
    AssignProgramsToStudentDialog: ({ programs }: { programs: unknown[] }) => (
        <div data-testid="assign-dialog">{programs.length}</div>
    )
}));

vi.mock('@utils/contants', () => ({
    COUNTRIES_ARRAY_OPTIONS: [{ value: 'de', label: 'Germany' }],
    COUNTRIES_MAPPING: { de: 'Germany' },
    // The rail builds its Degree/Semester/Language dropdowns from these, and
    // strips the leading "Please Select" placeholder.
    DEGREE_CATOGARY_ARRAY_OPTIONS: [
        { value: '-', label: 'Please Select' },
        { value: 'Master', label: 'Master' }
    ],
    SEMESTER_ARRAY_OPTIONS: [
        { value: '-', label: 'Please Select' },
        { value: 'WS', label: 'Winter Semester' }
    ],
    LANGUAGES_ARRAY_OPTIONS: [
        { value: '-', label: 'Please Select' },
        { value: 'English', label: 'English' }
    ]
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

const renderTable = (props = {}) =>
    render(
        <MemoryRouter>
            <ProgramsTable {...props} />
        </MemoryRouter>
    );

describe('ProgramsTable (desktop card results)', () => {
    it('renders a card per program', () => {
        renderTable({ student: { _id: 's1' } });
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Data Science')).toBeInTheDocument();
        expect(screen.getByText('TU Berlin')).toBeInTheDocument();
        expect(screen.getByTestId('assign-dialog')).toBeInTheDocument();
    });

    it('renders with student prop omitted', () => {
        renderTable();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });

    it('shows the country as a flag + name, not the raw code', () => {
        renderTable();
        const flags = screen.getAllByRole('img', { name: 'de' });
        expect(flags[0]).toHaveAttribute(
            'src',
            '/assets/logo/country_logo/svg/de.svg'
        );
        // "de" would be meaningless to a reader.
        expect(screen.getAllByText('Germany').length).toBeGreaterThan(0);
    });

    it('keeps every page action available, now in the rail', () => {
        renderTable();
        expect(
            screen.getByRole('button', { name: /assign/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /add new program/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /program requirements/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /school configuration/i })
        ).toBeInTheDocument();
    });

    it('Assign is disabled until selection, then carries the selected programs', () => {
        renderTable({ student: { _id: 's1' } });
        expect(screen.getByRole('button', { name: /assign/i })).toBeDisabled();

        // Selecting a card must feed the assign flow — the capability staff
        // rely on to assign programs to a student.
        fireEvent.click(
            screen.getByRole('checkbox', { name: /select computer science/i })
        );

        expect(
            screen.getByRole('button', { name: /assign \(1\)/i })
        ).toBeEnabled();
        expect(screen.getByTestId('assign-dialog')).toHaveTextContent('1');
    });

    it('select-all picks every program on the page', () => {
        renderTable({ student: { _id: 's1' } });
        fireEvent.click(
            screen.getByRole('checkbox', { name: /select all on this page/i })
        );
        expect(screen.getByTestId('assign-dialog')).toHaveTextContent('2');
    });

    it('exposes the server-sortable fields in the sort control', () => {
        renderTable();
        fireEvent.mouseDown(screen.getByRole('combobox', { name: /sort by/i }));
        const options = within(screen.getByRole('listbox'))
            .getAllByRole('option')
            .map((option) => option.textContent);
        // Every backend-sortable field, both directions — the sorting the old
        // column headers used to provide.
        expect(options).toEqual(
            expect.arrayContaining([
                'School ↑',
                'School ↓',
                'Deadline ↑',
                'Deadline ↓',
                'Last update ↓'
            ])
        );
    });
});
