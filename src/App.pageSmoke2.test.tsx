/**
 * Page smoke tests (Tier 1 & 2): Core application pages and team/admin pages.
 * Each page component renders without crashing.
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

// ─── react-router-dom ───────────────────────────────────────────────────────
const mockLoaderData = {
    data: {
        data: {
            academic_background: {},
            application_preference: {},
            school: '',
            program_name: '',
            degree: '',
            semester: '',
            country: ''
        },
        survey_link: ''
    },
    complaintTickets: Promise.resolve([]),
    schools: Promise.resolve([]),
    program: Promise.resolve({ data: {} }),
    courses: Promise.resolve([]),
    courseKeywordSets: Promise.resolve([]),
    programRequirements: Promise.resolve([]),
    interviews: Promise.resolve([])
};

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        Navigate: () => null,
        Link: forwardRef((props: any, ref: any) =>
            createElement(
                'a',
                { href: props.to ?? '', ref, ...props },
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
        useParams: () => ({
            student_id: 'test-student',
            studentId: 'test-student',
            programId: 'test-program',
            user_id: 'test-user',
            taiger_user_id: 'test-user',
            distributionType: 'country'
        }),
        useLoaderData: () => mockLoaderData,
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
        useRevalidator: () => ({ revalidate: vi.fn(), state: 'idle' }),
        Await: ({ children }: { children: (data: unknown) => ReactNode }) =>
            createElement(
                'div',
                null,
                typeof children === 'function' ? children([]) : children
            )
    };
});

// ─── Auth ────────────────────────────────────────────────────────────────────
vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            _id: 'test-user-id',
            role: 'Admin',
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

// ─── API mocks ───────────────────────────────────────────────────────────────
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
    getUsersCount: vi
        .fn()
        .mockResolvedValue({
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
    getProgramsAndCourseKeywordSetsLoader: vi.fn().mockResolvedValue({}),
    getApplicationStudentV2: vi.fn().mockResolvedValue({ data: null }),
    getComplaintsTickets: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getComplaintsTicket: vi
        .fn()
        .mockResolvedValue({ data: { data: {} }, status: 200 }),
    getMyAcademicBackground: vi.fn().mockResolvedValue({ data: {} }),
    getProgram: vi.fn().mockResolvedValue({ data: {} }),
    getAllOpenInterviews: vi.fn().mockResolvedValue({ data: [] }),
    getMyStudentsThreads: vi
        .fn()
        .mockResolvedValue({
            data: { threads: [] },
            success: true,
            status: 200
        }),
    getThreadsByStudent: vi
        .fn()
        .mockResolvedValue({
            data: { threads: [] },
            success: true,
            status: 200
        }),
    updateCredentials: vi
        .fn()
        .mockResolvedValue({ data: { success: true }, status: 200 }),
    // Team/Admin APIs
    getTeamMembers: vi
        .fn()
        .mockResolvedValue({ data: { data: [], success: true } }),
    updateUserPermission: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    getAgentProfile: vi
        .fn()
        .mockResolvedValue({ data: { data: {}, success: true }, status: 200 }),
    // Program APIs
    getProgramsV2: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getProgramsOverview: vi
        .fn()
        .mockResolvedValue({ data: { data: {}, success: true } }),
    getSchoolsDistribution: vi
        .fn()
        .mockResolvedValue({ data: { data: [], success: true } }),
    getProgramV2: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getProgramTicketsV2: vi.fn().mockResolvedValue({ data: { data: [] } }),
    deleteProgramV2: vi.fn().mockResolvedValue({ data: { success: true } }),
    processProgramList: vi.fn().mockResolvedValue({ data: { success: true } }),
    refreshProgram: vi.fn().mockResolvedValue({ data: { success: true } }),
    createProgramV2: vi.fn().mockResolvedValue({ data: { success: true } }),
    updateProgramV2: vi.fn().mockResolvedValue({ data: { success: true } }),
    getProgramChangeRequests: vi.fn().mockResolvedValue({ data: { data: [] } }),
    // Application task delta / conflict
    getApplicationTaskDeltas: vi
        .fn()
        .mockResolvedValue({ data: { data: [], success: true }, status: 200 }),
    getApplicationConflicts: vi
        .fn()
        .mockResolvedValue({ data: { data: [], success: true }, status: 200 }),
    // Thread / student
    putThreadFavorite: vi.fn().mockResolvedValue({ data: { success: true } }),
    getActiveStudents: vi.fn().mockResolvedValue({ data: [] }),
    getActiveStudentsApplications: vi
        .fn()
        .mockResolvedValue({ data: { data: [] } }),
    getActiveThreads: vi.fn().mockResolvedValue({ data: [] }),
    getStudentsV3: vi.fn().mockResolvedValue({ data: [] }),
    getStudent: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getLeadIdByUserId: vi.fn().mockResolvedValue({ data: { data: null } }),
    createLeadFromStudent: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    getMyStudentsApplications: vi
        .fn()
        .mockResolvedValue({ data: { data: [] } }),
    // Expense
    getExpense: vi.fn().mockResolvedValue({ data: { data: [] } }),
    // Statistics
    getStatisticsOverviewV2: vi.fn().mockResolvedValue({ data: {} }),
    getStatisticsAgentsV2: vi.fn().mockResolvedValue({ data: {} }),
    getStatisticsKPIV2: vi.fn().mockResolvedValue({ data: {} }),
    getStatisticsResponseTimeV2: vi.fn().mockResolvedValue({ data: {} }),
    createComplaintTicket: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    // queryClient
    queryClient: {
        invalidateQueries: vi.fn().mockResolvedValue(undefined),
        setQueryData: vi.fn()
    }
}));

// ─── MUI Charts ──────────────────────────────────────────────────────────────
vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: ReactNode }) => children ?? null
}));
vi.mock('@mui/x-charts/ChartsAxis', () => ({ axisClasses: {} }));
vi.mock('@mui/x-charts/PieChart', () => ({ PieChart: () => null }));
vi.mock('@mui/x-charts/LineChart', () => ({ LineChart: () => null }));
vi.mock('@mui/x-charts/Gauge', () => ({ Gauge: () => null }));

// ─── Heavy component stubs ──────────────────────────────────────────────────
vi.mock('material-react-table', () => ({
    MaterialReactTable: () =>
        createElement('div', { 'data-testid': 'mrt-table' }, 'Table'),
    useMaterialReactTable: () => ({})
}));

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

vi.mock('@pages/Notes/index', async () => {
    const { createElement: ce } = await import('react');
    return { default: () => ce('div', { 'data-testid': 'notes' }, 'Notes') };
});

vi.mock('react-timezone-select', () => ({
    __esModule: true,
    default: () => createElement('select', { 'data-testid': 'timezone-select' })
}));

vi.mock('react-select', () => ({
    __esModule: true,
    default: () => createElement('select', { 'data-testid': 'react-select' })
}));

// ─── useQuery / useMutation / React Query ────────────────────────────────────
vi.mock('@tanstack/react-query', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn((options: { queryKey?: unknown[] }) => {
        const key = options?.queryKey?.[0];
        if (key === 'users/count') {
            return {
                data: {
                    studentCount: 0,
                    agentCount: 0,
                    editorCount: 0,
                    externalCount: 0,
                    adminCount: 0
                },
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn()
            };
        }
        return {
            data: { data: [], success: true, base_docs_link: [], result: [] },
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn()
        };
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

// ─── Query factories ─────────────────────────────────────────────────────────
vi.mock('@/api/query', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/api/query')>();
    return {
        ...actual,
        getStudentsAndDocLinks2Query: (qs: string) => ({
            queryKey: ['students/doc-links', qs],
            queryFn: () => Promise.resolve({ data: [], base_docs_link: [] }),
            staleTime: 60000
        }),
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
            staleTime: 300000
        }),
        getUsersQuery: () => ({
            queryKey: ['users'],
            queryFn: () => Promise.resolve({ data: { data: [] } }),
            staleTime: 300000
        }),
        getTeamMembersQuery: () => ({
            queryKey: ['team-members'],
            queryFn: () =>
                Promise.resolve({ data: { data: [], success: true } }),
            staleTime: 300000
        }),
        getApplicationConflictsQuery: () => ({
            queryKey: ['application-conflicts'],
            queryFn: () =>
                Promise.resolve({ data: { data: [], success: true } }),
            staleTime: 300000
        }),
        getActiveStudentsQuery: (qs: string) => ({
            queryKey: ['students/active', qs],
            queryFn: () => Promise.resolve({ data: [] }),
            staleTime: 60000
        }),
        getActiveThreadsQuery: (qs: string) => ({
            queryKey: ['active-threads', qs],
            queryFn: () => Promise.resolve({ data: [] }),
            staleTime: 300000
        }),
        getProgramQuery: () => ({
            queryKey: ['programs', 'test-program'],
            queryFn: () => Promise.resolve({ data: { data: {} } }),
            staleTime: 60000
        }),
        getProgramsOverviewQuery: () => ({
            queryKey: ['programs', 'overview'],
            queryFn: () => Promise.resolve({ data: { data: {} } }),
            staleTime: 300000
        }),
        getSchoolsDistributionQuery: () => ({
            queryKey: ['programs', 'schools-distribution'],
            queryFn: () => Promise.resolve({ data: { data: [] } }),
            staleTime: 300000
        }),
        getExpenseQuery: () => ({
            queryKey: ['expenses', 'user', 'test-user'],
            queryFn: () => Promise.resolve({ data: { data: [] } }),
            staleTime: 300000
        }),
        getStatisticsOverviewQuery: () => ({
            queryKey: ['statistics', 'overview'],
            queryFn: () => Promise.resolve({ data: {} }),
            staleTime: 300000,
            enabled: false
        }),
        getStatisticsAgentsQuery: () => ({
            queryKey: ['statistics', 'agents'],
            queryFn: () => Promise.resolve({ data: {} }),
            staleTime: 300000,
            enabled: false
        }),
        getStatisticsKPIQuery: () => ({
            queryKey: ['statistics', 'kpi'],
            queryFn: () => Promise.resolve({ data: {} }),
            staleTime: 300000,
            enabled: false
        }),
        getStatisticsResponseTimeQuery: () => ({
            queryKey: ['statistics', 'response-time'],
            queryFn: () => Promise.resolve({ data: {} }),
            staleTime: 300000,
            enabled: false
        }),
        getMyStudentsThreadsQuery: () => ({
            queryKey: [
                'document-threads/overview/taiger-user',
                'test-user',
                ''
            ],
            queryFn: () => Promise.resolve({ data: null }),
            staleTime: 300000
        }),
        getApplicationStudentV2Query: () => ({
            queryKey: ['applications/student', 'test-student'],
            queryFn: () => Promise.resolve({ data: null }),
            staleTime: 300000
        }),
        getStudentAndDocLinksQuery: () => ({
            queryKey: ['students/doc-links', 'test-student'],
            queryFn: () => Promise.resolve({ data: {} }),
            staleTime: 300000
        }),
        getMessagThreadQuery: () => ({
            queryKey: ['MessageThread', 'test-thread'],
            queryFn: () => Promise.resolve({ data: { data: {} } }),
            staleTime: 60000
        }),
        getLeadIdByUserIdQuery: () => ({
            queryKey: ['lead-id', 'test-user'],
            queryFn: () => Promise.resolve({ data: { data: null } }),
            staleTime: 300000
        })
    };
});

// ─── Custom hook mocks ───────────────────────────────────────────────────────
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

vi.mock('@hooks/useActiveStudents', () => ({
    useActiveStudents: () => ({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useActiveThreads', () => ({
    useActiveThreads: () => ({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useApplicationStudent', () => ({
    useApplicationStudent: () => ({
        data: null,
        isLoading: false,
        isError: false,
        archiv: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useMyStudentsApplicationsV2', () => ({
    useMyStudentsApplicationsV2: () => ({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: () => ({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useProgramsOverview', () => ({
    useProgramsOverview: () => ({
        data: { data: {} },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useSchoolsDistribution', () => ({
    useSchoolsDistribution: () => ({
        data: { data: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

vi.mock('@hooks/useLead', () => ({
    useLead: () => ({
        data: null,
        isLoading: false,
        isError: false,
        error: null
    })
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════════════════════
// Tier 1 – Core Application Pages
// ═════════════════════════════════════════════════════════════════════════════
describe('Tier 1 – Core Application Pages smoke tests', () => {
    test('StudentApplications page renders', async () => {
        const C = lazy(
            () =>
                import(
                    '@pages/StudentApplications/StudentApplicationsIndividual'
                )
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('StudentApplicationsAssignPage renders', async () => {
        const C = lazy(() => import('@pages/StudentApplications/assignPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('SingleStudentPage renders', async () => {
        const C = lazy(
            () => import('@pages/StudentDatabase/SingleStudentPage')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    }, 10000);

    test('ContactUs page renders', async () => {
        const C = lazy(() => import('@pages/Contact/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('AllBaseDocuments page renders', async () => {
        const C = lazy(() => import('@pages/BaseDocuments/AllBaseDocuments'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('AgentSupportDocuments page renders', async () => {
        const C = lazy(() => import('@pages/AgentSupportDocuments/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('PortalCredentialPage renders', async () => {
        const C = lazy(() => import('@pages/PortalCredentialPage/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('MyStudentOverviewPage renders', async () => {
        const C = lazy(
            () => import('@pages/StudentOverview/MyStudentsOverview')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('StudentOverviewPage renders', async () => {
        const C = lazy(() => import('@pages/StudentOverview/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ProgramsOverviewPage renders', async () => {
        const C = lazy(() => import('@pages/Program/ProgramsOverviewPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('SingleProgram page renders', async () => {
        const C = lazy(() => import('@pages/Program/SingleProgram'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ProgramEditPage renders', async () => {
        const C = lazy(() => import('@pages/Program/ProgramEditPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ProgramCreatePage renders', async () => {
        const C = lazy(() => import('@pages/Program/ProgramCreatePage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ProgramChangeRequestPage renders', async () => {
        const C = lazy(() => import('@pages/Program/ProgramChangeRequestPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('SchoolConfig page renders', async () => {
        const C = lazy(() => import('@pages/Program/SchoolConfig'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CreateComplaintTicket page renders', async () => {
        const C = lazy(() => import('@pages/CustomerSupport/CreateTicket'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CustomerTicketDetailPage renders', async () => {
        const C = lazy(
            () => import('@pages/CustomerSupport/CustomerTicketDetailPage')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Tier 2 – Team / Admin Pages
// ═════════════════════════════════════════════════════════════════════════════
describe('Tier 2 – Team / Admin Pages smoke tests', () => {
    test('TaiGerOrg (Members) page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerOrg/TaiGerMember/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('TaiGerOrgAgent page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerOrg/AgentPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('TaiGerOrgEditor page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerOrg/EditorPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('TaiGerOrgAdmin page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerOrg/AdminPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('TaiGerPermissions page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerOrg/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('TaiGerMemberProfile page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerPublicProfile/AgentProfile'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('EssayWritersAssignment page renders', async () => {
        const C = lazy(
            () =>
                import(
                    '@pages/AssignmentAgentsEditors/AssignEssayWriters/index'
                )
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
    // TODO: Uncomment this test when the InterviewTrainersAssignment page is implemented
    // test('InterviewTrainersAssignment page renders', async () => {
    //     const C = lazy(
    //         () =>
    //             import(
    //                 '@pages/AssignmentAgentsEditors/AssignInterviewTrainers/index'
    //             )
    //     );
    //     await renderPageAsync(wrapWithSuspense(C));
    //     expect(document.body).toBeTruthy();
    // });

    test('Accounting page renders', async () => {
        const C = lazy(() => import('@pages/Accounting/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('SingleBalanceSheetOverview page renders', async () => {
        const C = lazy(
            () => import('@pages/Accounting/SingleBalanceSheetOverview')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
    // TODO: slow
    // test('ProgramConflict page renders', async () => {
    //     const C = lazy(() => import('@pages/TaiGerOrg/ProgramConflict/index'));
    //     await renderPageAsync(wrapWithSuspense(C));
    //     expect(document.body).toBeTruthy();
    // });

    test('ProgramTaskDelta page renders', async () => {
        const C = lazy(() => import('@pages/TaiGerOrg/ProgramTaskDelta/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CVMLRLDashboard page renders', async () => {
        const C = lazy(() => import('@pages/CVMLRLCenter/indexAll'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('EssayDashboard page renders', async () => {
        const C = lazy(() => import('@pages/EssayDashboard/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('InternalDashboard page renders', async () => {
        const C = lazy(
            () => import('@pages/TaiGerOrg/InternalDashboard/index')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ProgramDistributionDetailPage renders', async () => {
        const C = lazy(
            () => import('@pages/Program/ProgramDistributionDetailPage')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('SchoolDistributionPage renders', async () => {
        const C = lazy(() => import('@pages/Program/SchoolDistributionPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});
