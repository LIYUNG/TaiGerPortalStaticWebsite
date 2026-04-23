import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('./components/ApplicationTableRow', () => ({
    default: () => (
        <tr>
            <td>Row</td>
        </tr>
    )
}));

vi.mock('./components/ApplicationsTableBanners', () => ({
    default: () => <div>Banners</div>
}));

vi.mock('@components/ConfirmDialog', () => ({
    ConfirmDialog: () => null
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false)
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
});
