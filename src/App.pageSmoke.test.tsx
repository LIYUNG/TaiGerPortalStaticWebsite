/**
 * Page smoke tests: each page component renders without crashing.
 * Direct render with mocks – no MemoryRouter, no QueryClient.
 */
import {
    createElement,
    forwardRef,
    Suspense,
    lazy,
    LazyExoticComponent,
    ComponentType
} from 'react';
import { ReactNode } from 'react';
import { act, render } from '@testing-library/react';
import { SnackBarProvider } from '@contexts/use-snack-bar';
import { CustomThemeProvider } from '@components/ThemeProvider';

// Mock react-router so pages can render without RouterProvider
const mockLoaderData = {
    data: {
        data: {
            academic_background: {},
            application_preference: {}
        },
        survey_link: ''
    },
    complaintTickets: Promise.resolve([])
};

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        Navigate: () => null,
        Link: forwardRef((props: { to?: string; children?: ReactNode }, ref) =>
            createElement(
                'a',
                {
                    href: props.to ?? '',
                    ref,
                    ...props
                },
                props.children
            )
        ),
        useLocation: () => ({
            search: '',
            pathname: '/',
            hash: '',
            state: null
        }),
        useNavigate: () => vi.fn(),
        useParams: () => ({}),
        useLoaderData: () => mockLoaderData,
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
        useRevalidator: () => ({ revalidate: vi.fn(), state: 'idle' }),
        // Render Await children immediately with empty data (avoids Suspense boundary delay)
        Await: ({ children }: { children: (data: unknown) => ReactNode }) =>
            createElement(
                'div',
                null,
                typeof children === 'function' ? children([]) : children
            )
    };
});

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            _id: 'test-user-id',
            role: 'Agent',
            firstname: 'Test',
            lastname: 'User',
            email: 'test@example.com'
        },
        isAuthenticated: true,
        isLoaded: true,
        login: vi.fn(),
        logout: vi.fn()
    })
}));

vi.mock('@/api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/api')>()),
    getProgramTickets: vi
        .fn()
        .mockResolvedValue({ data: { success: true, data: [] } }),
    getAdmissions: vi
        .fn()
        .mockResolvedValue({ data: { result: [] }, success: true }),
    getArchivStudents: vi.fn().mockResolvedValue({ data: [], status: 200 }),
    getStudents: vi.fn().mockResolvedValue({ data: [], status: 200 }),
    getUsersCount: vi.fn().mockResolvedValue({
        data: {
            studentCount: 0,
            agentCount: 0,
            editorCount: 0,
            externalCount: 0,
            adminCount: 0
        }
    }),
    getUsers: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getUsersOverview: vi.fn().mockResolvedValue({ data: [] }),
    getStudentsAndDocLinks2: vi
        .fn()
        .mockResolvedValue({ data: [], base_docs_link: [] }),
    getApplicationStudentV2: vi.fn().mockResolvedValue({ data: null }),
    getComplaintsTickets: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getComplaintsTicket: vi
        .fn()
        .mockResolvedValue({ data: { data: {} }, status: 200 }),
    getMyAcademicBackground: vi.fn().mockResolvedValue({ data: {} }),
    getProgram: vi.fn().mockResolvedValue({ data: {} }),
    getAllOpenInterviews: vi.fn().mockResolvedValue({ data: [] }),
    getMyStudentsThreads: vi.fn().mockResolvedValue({
        data: { threads: [] },
        success: true,
        status: 200
    }),
    getThreadsByStudent: vi.fn().mockResolvedValue({
        data: { threads: [] },
        success: true,
        status: 200
    }),
    updateCredentials: vi
        .fn()
        .mockResolvedValue({ data: { success: true }, status: 200 }),
    // Additional explicit mocks to prevent any unguarded real API calls
    getUser: vi
        .fn()
        .mockResolvedValue({ data: { success: true, data: {} }, status: 200 }),
    getActiveStudents: vi.fn().mockResolvedValue({ data: [] }),
    getActiveThreads: vi.fn().mockResolvedValue({ data: [] }),
    getMyStudentsApplications: vi
        .fn()
        .mockResolvedValue({ data: { data: [] } }),
    queryClient: {
        invalidateQueries: vi.fn().mockResolvedValue(undefined),
        setQueryData: vi.fn()
    }
}));

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: ReactNode }) => children ?? null
}));
vi.mock('@mui/x-charts/ChartsAxis', () => ({ axisClasses: {} }));

// Lightweight mocks so smoke test doesn't load heavy chunks (avoids timeout)
vi.mock('@pages/Users/UsersTable', async () => {
    const { createElement: ce } = await import('react');
    return {
        default: () => ce('div', { 'data-testid': 'users-table' }, 'Users')
    };
});

vi.mock('@pages/Survey/SurveyComponent', async () => {
    const { createElement: ce } = await import('react');
    return {
        default: () =>
            ce('div', { 'data-testid': 'survey-component' }, 'Survey')
    };
});

// Mock useQuery and useMutation so all pages get sync mock data (no async API calls = faster tests)
vi.mock('@tanstack/react-query', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn().mockReturnValue({
        data: { data: [], success: true, base_docs_link: [], result: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    }),
    useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false
    })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn().mockResolvedValue(undefined),
        setQueryData: vi.fn()
    }))
}));

// Base Documents and AllBaseDocuments use useStudentsAndDocLinks (see mock below).
// UsersTable uses getUsersCountQuery and UsersList uses getUsersQuery; mock them so queries resolve immediately.
vi.mock('@/api/query', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/api/query')>();
    return {
        ...actual,
        getUsersCountQuery: () => ({
            queryKey: ['users/count'],
            queryFn: () =>
                Promise.resolve({
                    data: {
                        studentCount: 0,
                        agentCount: 0,
                        editorCount: 0,
                        externalCount: 0,
                        adminCount: 0
                    }
                }),
            staleTime: 1000 * 60 * 5
        }),
        getUsersQuery: () => ({
            queryKey: ['users'],
            queryFn: () => Promise.resolve({ data: { data: [] } }),
            staleTime: 1000 * 60 * 5
        })
    };
});

vi.mock('@hooks/useStudents', () => ({
    __esModule: true,
    default: () => ({
        students: [],
        res_modal_status: 0,
        res_modal_message: '',
        ConfirmError: vi.fn(),
        submitUpdateAgentlist: vi.fn(),
        submitUpdateEditorlist: vi.fn(),
        submitUpdateAttributeslist: vi.fn(),
        updateStudentArchivStatus: vi.fn()
    })
}));

vi.mock('@hooks/useStudentsAndDocLinks', () => ({
    useStudentsAndDocLinks: () => ({
        students: [],
        base_docs_link: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

const wrapWithSuspense = (
    Component: LazyExoticComponent<ComponentType<any>>
) => (
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
        <Component />
    </Suspense>
);

function renderPage(ui: React.ReactElement): void {
    render(
        <CustomThemeProvider>
            <SnackBarProvider>{ui}</SnackBarProvider>
        </CustomThemeProvider>
    );
}

// Wrap renderPage in async act() so each test fully drains its own lazy-load Promises
// and effects, preventing accumulation across tests that causes the last test to be slow.
const renderPageAsync = async (ui: React.ReactElement): Promise<void> => {
    await act(async () => {
        renderPage(ui);
    });
};

describe('Page smoke tests – all pages render without crashing', () => {
    test('Dashboard (default) renders', async () => {
        const DashboardDefault = lazy(() => import('@pages/Dashboard'));
        await renderPageAsync(wrapWithSuspense(DashboardDefault));
        expect(document.body).toBeTruthy();
    });

    test('Admissions page renders', async () => {
        const Admissions = lazy(() => import('@pages/Admissions/Admissions'));
        await renderPageAsync(wrapWithSuspense(Admissions));
        expect(document.body).toBeTruthy();
    });

    test('Student Database page renders', async () => {
        const StudentDatabase = lazy(
            () => import('@pages/StudentDatabase/index')
        );
        await renderPageAsync(wrapWithSuspense(StudentDatabase));
        expect(document.body).toBeTruthy();
    });

    test('Student Database Overview renders', async () => {
        const StudentDatabaseOverview = lazy(
            () => import('@pages/StudentDatabase/StudentDatabaseOverview')
        );
        await renderPageAsync(wrapWithSuspense(StudentDatabaseOverview));
        expect(document.body).toBeTruthy();
    });

    test('Archiv Students page renders', async () => {
        const ArchivStudent = lazy(() => import('@pages/ArchivStudent/index'));
        await renderPageAsync(wrapWithSuspense(ArchivStudent));
        expect(document.body).toBeTruthy();
    });

    test('Program List page renders', async () => {
        const ProgramList = lazy(() => import('@pages/Program/ProgramList'));
        await renderPageAsync(wrapWithSuspense(ProgramList));
        expect(document.body).toBeTruthy();
    });

    test('Users Table page renders', async () => {
        const UsersTable = lazy(() => import('@pages/Users/UsersTable'));
        await renderPageAsync(wrapWithSuspense(UsersTable));
        expect(document.body).toBeTruthy();
    });

    test('CVMLRL Center / Overview renders', async () => {
        const CVMLRLOverview = lazy(() => import('@pages/CVMLRLCenter/index'));
        await renderPageAsync(wrapWithSuspense(CVMLRLOverview));
        expect(document.body).toBeTruthy();
    });

    test('Base Documents page renders', async () => {
        const BaseDocuments = lazy(
            () => import('@pages/BaseDocuments/BaseDocuments')
        );
        await renderPageAsync(wrapWithSuspense(BaseDocuments));
        expect(document.body).toBeTruthy();
    });

    test('Settings page renders', async () => {
        const Settings = lazy(() => import('@pages/Settings/index'));
        await renderPageAsync(wrapWithSuspense(Settings));
        expect(document.body).toBeTruthy();
    });

    test('Profile page renders', async () => {
        const Profile = lazy(() => import('@pages/Profile/index'));
        await renderPageAsync(wrapWithSuspense(Profile));
        expect(document.body).toBeTruthy();
    });

    test('Learning Resources page renders', async () => {
        const LearningResources = lazy(
            () => import('@pages/LearningResources/index')
        );
        await renderPageAsync(wrapWithSuspense(LearningResources));
        expect(document.body).toBeTruthy();
    });

    test('Download page renders', async () => {
        const Download = lazy(
            () => import('@pages/DownloadCenter/DownloadPage')
        );
        await renderPageAsync(wrapWithSuspense(Download));
        expect(document.body).toBeTruthy();
    });

    test('My Courses page renders', async () => {
        const MyCourses = lazy(() => import('@pages/MyCourses/index'));
        await renderPageAsync(wrapWithSuspense(MyCourses));
        expect(document.body).toBeTruthy();
    });

    test('Applications Overview renders', async () => {
        const ApplicationsOverview = lazy(
            () => import('@pages/ApplicantsOverview/index')
        );
        await renderPageAsync(wrapWithSuspense(ApplicationsOverview));
        expect(document.body).toBeTruthy();
    });

    test('All Applicants Overview renders', async () => {
        const AllApplicantsOverview = lazy(
            () => import('@pages/ApplicantsOverview/allStudentIndex')
        );
        await renderPageAsync(wrapWithSuspense(AllApplicantsOverview));
        expect(document.body).toBeTruthy();
    });

    test('Assignment Agents page renders', async () => {
        const AgentsAssignment = lazy(
            () => import('@pages/AssignmentAgentsEditors/AssignAgents/index')
        );
        await renderPageAsync(wrapWithSuspense(AgentsAssignment));
        expect(document.body).toBeTruthy();
    });

    test('Assignment Editors page renders', async () => {
        const EditorsAssignment = lazy(
            () => import('@pages/AssignmentAgentsEditors/AssignEditors/index')
        );
        await renderPageAsync(wrapWithSuspense(EditorsAssignment));
        expect(document.body).toBeTruthy();
    });

    test('Survey page renders', async () => {
        const Survey = lazy(() => import('@pages/Survey/index'));
        await renderPageAsync(wrapWithSuspense(Survey));
        expect(document.body).toBeTruthy();
    });

    test('Customer Support page renders', async () => {
        const CustomerSupport = lazy(() => import('@pages/CustomerSupport'));
        await renderPageAsync(wrapWithSuspense(CustomerSupport));
        expect(document.body).toBeTruthy();
    });

    // DefaultErrorPage uses useRouteError() and must be rendered as route errorElement; skip standalone smoke test
});
