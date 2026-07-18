import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Surfaces application_idx so tests can assert the row still carries its index
// in the *unfiltered* list — every handler resolves its target through it.
vi.mock('./components/ApplicationTableRow', () => ({
    default: ({
        application,
        application_idx
    }: {
        application: { programId?: { program_name?: string } };
        application_idx: number;
    }) => (
        <tr>
            <td
                data-testid={`row-${application.programId?.program_name}`}
                data-idx={application_idx}
                data-variant="table"
            >
                Row
            </td>
        </tr>
    )
}));

// Student-view counterpart of ApplicationTableRow. Both mocks emit the same
// `row-<program>` testid and data-idx so the filtering/index assertions stay
// presentation-agnostic; data-variant tells them apart where it matters.
vi.mock('./components/StudentApplicationCard', () => ({
    default: ({
        application,
        application_idx
    }: {
        application: { programId?: { program_name?: string } };
        application_idx: number;
    }) => (
        <div
            data-testid={`row-${application.programId?.program_name}`}
            data-idx={application_idx}
            data-variant="card"
        >
            Card
        </div>
    )
}));

vi.mock('./components/ApplicationsTableBanners', () => ({
    default: () => <div>Banners</div>
}));

// Reports which programs it was handed, so tests can assert the comparison
// view honours the active status/search filter.
vi.mock('../Program/ProgramDetailsComparisonTable', () => ({
    default: ({
        applications
    }: {
        applications: { programId?: { program_name?: string } }[];
    }) => (
        <div data-testid="comparison-table">
            {applications.map((a) => a.programId?.program_name).join(',')}
        </div>
    )
}));

vi.mock('@components/ConfirmDialog', () => ({
    ConfirmDialog: () => null
}));

// Field-accurate stand-ins (matching the real @taiger-common/core impls) so the
// status filter under test derives real buckets rather than constants.
vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    isProgramDecided: (a: { decided?: string }) => a.decided === 'O',
    isProgramSubmitted: (a: { closed?: string }) => a.closed === 'O',
    isProgramAdmitted: (a: { admission?: string }) => a.admission === 'O',
    isProgramRejected: (a: { admission?: string }) => a.admission === 'X',
    isProgramWithdraw: (a: { closed?: string }) => a.closed === 'X'
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'stu1' } })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('./ImportStudentProgramsCard', () => ({
    ImportStudentProgramsCard: () => <div data-testid="import-card" />
}));

vi.mock('./StudentPreferenceCard', () => ({
    StudentPreferenceCard: () => <div data-testid="preference-card" />
}));

vi.mock('@components/Modal/ConfirmationModal', () => ({
    ConfirmationModal: () => null
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../Utils/util_functions', () => ({
    isProgramNotSelectedEnough: vi.fn(() => false),
    is_num_Program_Not_specified: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        STUDENT_DATABASE_LINK: '/students',
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    IS_SUBMITTED_STATE_OPTIONS: [{ value: '-', label: 'Not Yet' }],
    APPLICATION_YEARS_FUTURE: () => [{ value: 2025, label: '2025' }],
    programstatuslist: [
        { name: 'School' },
        { name: 'Program' },
        { name: 'Deadline' }
    ]
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    updateStudentApplications: vi.fn(),
    deleteApplicationStudentV2: vi.fn(),
    updateStudentApplication: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

import StudentApplicationsTableTemplate from './StudentApplicationsTableTemplate';

const queryClient = new QueryClient();

const mockStudent = {
    _id: 'stu1',
    firstname: 'John',
    lastname: 'Doe',
    applications: [],
    applying_program_count: 5
};

const renderTemplate = (props = {}) =>
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <StudentApplicationsTableTemplate
                    student={mockStudent}
                    {...props}
                />
            </MemoryRouter>
        </QueryClientProvider>
    );

describe('StudentApplicationsTableTemplate', () => {
    it('renders the applications table with banners', () => {
        renderTemplate();
        expect(screen.getByText('Banners')).toBeInTheDocument();
    });

    it('renders No University placeholder when applications list is empty', () => {
        renderTemplate();
        expect(screen.getByText('No University')).toBeInTheDocument();
    });

    it('renders the student preference card', () => {
        renderTemplate();
        fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
        expect(screen.getByTestId('preference-card')).toBeInTheDocument();
    });

    describe('status filtering', () => {
        const program = (name: string) => ({
            _id: `p-${name}`,
            school: `${name} University`,
            program_name: name,
            degree: 'M. Sc.',
            semester: 'WS'
        });

        // idx 0 pending, idx 1 decided, idx 2 submitted, idx 3 admitted
        const applications = [
            {
                _id: 'a0',
                decided: '-',
                closed: '-',
                admission: '-',
                programId: program('Alpha')
            },
            {
                _id: 'a1',
                decided: 'O',
                closed: '-',
                admission: '-',
                programId: program('Beta')
            },
            {
                _id: 'a2',
                decided: 'O',
                closed: 'O',
                admission: '-',
                programId: program('Gamma')
            },
            {
                _id: 'a3',
                decided: 'O',
                closed: 'O',
                admission: 'O',
                programId: program('Delta')
            }
        ];

        const renderWithApplications = () =>
            renderTemplate({
                student: { ...mockStudent, applications }
            });

        const rowIdx = (programName: string) =>
            screen.getByTestId(`row-${programName}`).getAttribute('data-idx');

        // Chips render label and count as separate nodes, so match on the
        // accessible name rather than a single text node.
        const chip = (name: string) => screen.getByRole('button', { name });
        const queryChip = (name: string) =>
            screen.queryByRole('button', { name });

        it('counts stages cumulatively so later stages roll up', () => {
            renderWithApplications();
            expect(chip('All 4')).toBeInTheDocument();
            expect(chip('Not decided 1')).toBeInTheDocument();
            // Beta + Gamma + Delta are all decided.
            expect(chip('Decided 3')).toBeInTheDocument();
            // Gamma + Delta are both submitted.
            expect(chip('Submitted 2')).toBeInTheDocument();
            expect(chip('Admitted 1')).toBeInTheDocument();
            // No rejected/enrolled/withdrawn applications -> no empty chips.
            expect(queryChip('Rejected 0')).not.toBeInTheDocument();
        });

        it('includes admitted rows when filtering by an earlier stage', () => {
            renderWithApplications();
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(4);

            fireEvent.click(chip('Submitted 2'));
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(2);
            expect(screen.getByTestId('row-Gamma')).toBeInTheDocument();
            // The admitted one is still a submitted one.
            expect(screen.getByTestId('row-Delta')).toBeInTheDocument();

            fireEvent.click(chip('Decided 3'));
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(3);
            expect(screen.queryByTestId('row-Alpha')).not.toBeInTheDocument();
        });

        // Regression guard: handlers do
        // `studentToShow.applications[application_idx]`, so a filtered row must
        // keep its original index or edits land on the wrong application.
        it('keeps each row original index while filtered', () => {
            renderWithApplications();
            expect(rowIdx('Alpha')).toBe('0');
            expect(rowIdx('Delta')).toBe('3');

            fireEvent.click(chip('Admitted 1'));
            expect(rowIdx('Delta')).toBe('3');

            fireEvent.click(chip('Submitted 2'));
            expect(rowIdx('Gamma')).toBe('2');
            expect(rowIdx('Delta')).toBe('3');
        });

        // Alpha is undecided, Beta decided-but-unsubmitted, Gamma submitted,
        // Delta admitted — so only Beta is still in flight.
        it('filters to the decided-but-unsubmitted working set', () => {
            renderWithApplications();
            expect(chip('Not submitted yet 1')).toBeInTheDocument();

            fireEvent.click(chip('Not submitted yet 1'));

            expect(screen.getAllByTestId(/^row-/)).toHaveLength(1);
            expect(screen.getByTestId('row-Beta')).toBeInTheDocument();
            // Undecided is not "in progress", it is waiting on the decision.
            expect(screen.queryByTestId('row-Alpha')).not.toBeInTheDocument();
            expect(screen.queryByTestId('row-Gamma')).not.toBeInTheDocument();
        });

        it('marks the active chip as pressed for assistive tech', () => {
            renderWithApplications();
            expect(chip('All 4')).toHaveAttribute('aria-pressed', 'true');
            expect(chip('Submitted 2')).toHaveAttribute(
                'aria-pressed',
                'false'
            );

            fireEvent.click(chip('Submitted 2'));
            expect(chip('Submitted 2')).toHaveAttribute('aria-pressed', 'true');
            expect(chip('All 4')).toHaveAttribute('aria-pressed', 'false');
        });

        it('clicking the active status chip clears the filter', () => {
            renderWithApplications();
            fireEvent.click(chip('Submitted 2'));
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(2);

            fireEvent.click(chip('Submitted 2'));
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(4);
        });

        it('filters by school or program name via search', () => {
            renderWithApplications();
            fireEvent.change(screen.getByLabelText('search applications'), {
                target: { value: 'gamma' }
            });

            expect(screen.getAllByTestId(/^row-/)).toHaveLength(1);
            expect(rowIdx('Gamma')).toBe('2');
        });

        it('explains an empty result instead of showing a blank table', () => {
            renderWithApplications();
            fireEvent.change(screen.getByLabelText('search applications'), {
                target: { value: 'no-such-program' }
            });

            expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
            expect(
                screen.getByText('No applications match the current filter.')
            ).toBeInTheDocument();
            // The empty-list placeholder must not appear — there ARE
            // applications, they are just filtered out.
            expect(screen.queryByText('No University')).not.toBeInTheDocument();
        });

        it('restores every row via Clear filters', () => {
            renderWithApplications();
            fireEvent.click(chip('Admitted 1'));
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(1);

            fireEvent.click(chip('Clear filters'));
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(4);
        });

        it('hides the toolbar when there are no applications at all', () => {
            renderTemplate();
            expect(screen.queryByText('All 0')).not.toBeInTheDocument();
            expect(screen.getByText('No University')).toBeInTheDocument();
        });
    });

    // The surrounding mocks put is_TaiGer_role at false and is_TaiGer_Student
    // at true, so this whole block runs as the student view.
    describe('details comparison toggle (student view)', () => {
        const program = (name: string) => ({
            _id: `p-${name}`,
            school: `${name} University`,
            program_name: name,
            degree: 'M. Sc.',
            semester: 'WS'
        });

        const applications = [
            {
                _id: 'a0',
                decided: '-',
                closed: '-',
                admission: '-',
                programId: program('Alpha')
            },
            {
                _id: 'a1',
                decided: 'O',
                closed: 'O',
                admission: '-',
                programId: program('Beta')
            }
        ];

        const renderWithApplications = () =>
            renderTemplate({ student: { ...mockStudent, applications } });

        const toggle = () =>
            screen.getByRole('button', { name: /Details View|Simple View/ });

        it('offers the toggle to a student', () => {
            renderWithApplications();
            expect(
                screen.getByRole('button', { name: /Details View/ })
            ).toBeInTheDocument();
        });

        it('swaps the status table for the comparison table', () => {
            renderWithApplications();
            expect(
                screen.queryByTestId('comparison-table')
            ).not.toBeInTheDocument();
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(2);

            fireEvent.click(toggle());

            expect(screen.getByTestId('comparison-table')).toBeInTheDocument();
            expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
        });

        it('returns to the status table when toggled back', () => {
            renderWithApplications();
            fireEvent.click(toggle());
            expect(screen.getByTestId('comparison-table')).toBeInTheDocument();

            fireEvent.click(toggle());
            expect(
                screen.queryByTestId('comparison-table')
            ).not.toBeInTheDocument();
            expect(screen.getAllByTestId(/^row-/)).toHaveLength(2);
        });

        it('passes only the filtered applications to the comparison table', () => {
            renderWithApplications();
            fireEvent.change(screen.getByLabelText('search applications'), {
                target: { value: 'beta' }
            });
            fireEvent.click(toggle());

            expect(screen.getByTestId('comparison-table')).toHaveTextContent(
                'Beta'
            );
            expect(
                screen.getByTestId('comparison-table')
            ).not.toHaveTextContent('Alpha');
        });

        it('explains an empty filter result instead of an empty comparison', () => {
            renderWithApplications();
            fireEvent.change(screen.getByLabelText('search applications'), {
                target: { value: 'no-such-program' }
            });
            fireEvent.click(toggle());

            expect(
                screen.queryByTestId('comparison-table')
            ).not.toBeInTheDocument();
            expect(
                screen.getByText('No applications match the current filter.')
            ).toBeInTheDocument();
        });

        it('hides the toggle when the student has no applications', () => {
            renderTemplate();
            expect(
                screen.queryByRole('button', { name: /Details View/ })
            ).not.toBeInTheDocument();
        });
    });

    describe('simple view presentation by role', () => {
        const applications = [
            {
                _id: 'a0',
                decided: 'O',
                closed: '-',
                admission: '-',
                programId: {
                    _id: 'p0',
                    school: 'Alpha University',
                    program_name: 'Alpha',
                    degree: 'M. Sc.',
                    semester: 'WS'
                }
            }
        ];

        const renderWithApplications = () =>
            renderTemplate({ student: { ...mockStudent, applications } });

        it('gives students action-item cards instead of the wide table', async () => {
            const { is_TaiGer_Student } = await import('@taiger-common/core');
            (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(
                true
            );

            renderWithApplications();
            expect(screen.getByTestId('row-Alpha')).toHaveAttribute(
                'data-variant',
                'card'
            );
        });

        it('keeps the table for staff, who still need delete/edit per row', async () => {
            const { is_TaiGer_Student } = await import('@taiger-common/core');
            (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(
                false
            );

            renderWithApplications();
            expect(screen.getByTestId('row-Alpha')).toHaveAttribute(
                'data-variant',
                'table'
            );

            // Restore for any later test in this file.
            (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(
                true
            );
        });
    });
});
