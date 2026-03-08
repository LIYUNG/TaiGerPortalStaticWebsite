import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SingleProgramView from './SingleProgramView';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_AdminAgent: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Manager: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        PROGRAMS: '/programs',
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`,
        PROGRAM_EDIT: (id: string) => `/program/${id}/edit`,
        BASE_DOCUMENTS_LINK: '/base-docs',
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/student/${id}/applications`
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ programId: 'prog1' })
    };
});

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: () => ({
            data: [],
            isLoading: false
        })
    };
});

vi.mock('@/api/query', () => ({
    getSameProgramStudentsQuery: vi.fn(() => ({
        queryKey: ['same-program-students'],
        queryFn: vi.fn()
    }))
}));

vi.mock('../Utils/util_functions', () => ({
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false, reason: null }))
}));

vi.mock('./ProgramReport', () => ({
    default: () => <div data-testid="program-report" />
}));

vi.mock('./components/ProgramInfoTabs', () => ({
    default: () => <div data-testid="program-info-tabs" />
}));

vi.mock('./components/SameProgramStudentsCard', () => ({
    default: () => <div data-testid="same-program-students-card" />
}));

vi.mock('./components/ProgramUnlockDialog', () => ({
    default: () => <div data-testid="program-unlock-dialog" />
}));

const defaultProps = {
    program: {
        _id: 'prog1',
        school: 'TU Berlin',
        program_name: 'Computer Science',
        country: 'Germany',
        degree: 'Master'
    },
    versions: {},
    students: [],
    isRefreshing: false,
    onRefreshProgram: vi.fn(),
    programListAssistant: vi.fn(),
    setDeleteProgramWarningOpen: vi.fn(),
    setDiffModalShow: vi.fn(),
    setModalShowAssignWindow: vi.fn()
};

describe('SingleProgramView', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SingleProgramView {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText(/TU Berlin-Computer Science/)).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
        expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    });

    it('renders ProgramInfoTabs', () => {
        expect(screen.getByTestId('program-info-tabs')).toBeInTheDocument();
    });

    it('renders ProgramReport', () => {
        expect(screen.getByTestId('program-report')).toBeInTheDocument();
    });
});
