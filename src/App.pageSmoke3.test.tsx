/**
 * Page smoke tests (Tier 3 & 4): Feature-flagged pages and authentication/public pages.
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
import { useAuth } from '@components/AuthProvider';

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
        NavLink: forwardRef((props: any, ref: any) =>
            createElement(
                'a',
                { href: props.to ?? '', ref, ...props },
                props.children
            )
        ),
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
            interview_id: 'test-interview',
            leadId: 'test-lead',
            meetingId: 'test-meeting',
            documentsthreadId: 'test-thread',
            documentation_id: 'test-doc',
            category: 'general',
            courseId: 'test-course',
            requirementId: 'test-requirement',
            complaintTicketId: 'test-ticket'
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

// ─── Auth (default: authenticated Admin) ─────────────────────────────────────
vi.mock('@components/AuthProvider', () => ({
    useAuth: vi.fn(() => ({
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
    }))
}));

// ─── API mocks ───────────────────────────────────────────────────────────────
vi.mock('@/api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/api')>()),
    // General
    getProgramTickets: vi
        .fn()
        .mockResolvedValue({ data: { success: true, data: [] } }),
    getStudents: vi.fn().mockResolvedValue({ data: [], status: 200 }),
    getActiveStudents: vi.fn().mockResolvedValue({ data: [] }),
    getActiveStudentsApplications: vi
        .fn()
        .mockResolvedValue({ data: { data: [] } }),
    getActiveThreads: vi.fn().mockResolvedValue({ data: [] }),
    getMyStudentsThreads: vi
        .fn()
        .mockResolvedValue({
            data: { threads: [] },
            success: true,
            status: 200
        }),
    putThreadFavorite: vi.fn().mockResolvedValue({ data: { success: true } }),
    getApplicationStudentV2: vi.fn().mockResolvedValue({ data: null }),
    // CRM
    getCRMStats: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getCRMLeads: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getCRMLead: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getCRMMeetings: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getCRMMeeting: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getCRMDeals: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getCRMSalesReps: vi.fn().mockResolvedValue({ data: { data: [] } }),
    // Interview
    getMyInterviews: vi
        .fn()
        .mockResolvedValue({ data: { data: [], success: true }, status: 200 }),
    getAllInterviews: vi
        .fn()
        .mockResolvedValue({ data: { data: [], success: true }, status: 200 }),
    getInterview: vi
        .fn()
        .mockResolvedValue({ data: { data: {}, success: true } }),
    getInterviews: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getInterviewsByStudentId: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getInterviewsByProgramId: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getAllOpenInterviews: vi.fn().mockResolvedValue({ data: [] }),
    // UniAssist
    getStudentUniAssistV2: vi.fn().mockResolvedValue({ data: { data: {} } }),
    // Communication
    getCommunicationThreadV2: vi
        .fn()
        .mockResolvedValue({ data: { data: { messages: [] }, success: true } }),
    getMyCommunicationThreadV2: vi
        .fn()
        .mockResolvedValue({ data: { data: [] } }),
    getMessagThread: vi
        .fn()
        .mockResolvedValue({
            data: {
                data: {
                    student_id: { firstname: 'Test', lastname: 'Student' }
                },
                success: true,
                agents: [],
                editors: [],
                conflict_list: [],
                deadline: null,
                threadAuditLog: [],
                similarThreads: []
            }
        }),
    // Documentation
    getCategorizedDocumentationPage: vi
        .fn()
        .mockResolvedValue({
            data: { data: { text: null, author: '' }, success: true },
            status: 200
        }),
    updateDocumentationPage: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    // Calendar
    getEvents: vi
        .fn()
        .mockResolvedValue({
            data: {
                data: [],
                success: true,
                agents: {},
                editors: [],
                hasEvents: false
            },
            status: 200
        }),
    getBookedEvents: vi.fn().mockResolvedValue({ data: { data: [] } }),
    postEvent: vi.fn().mockResolvedValue({ data: { success: true } }),
    updateEvent: vi.fn().mockResolvedValue({ data: { success: true } }),
    deleteEvent: vi.fn().mockResolvedValue({ data: { success: true } }),
    confirmEvent: vi.fn().mockResolvedValue({ data: { success: true } }),
    // Course
    getAllCourses: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getCourse: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getProgramRequirementsV2: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getMycourses: vi.fn().mockResolvedValue({ data: { data: [] } }),
    // AI
    cvmlrlAi2: vi.fn().mockResolvedValue({ data: { data: '' } }),
    TaiGerAiGeneral2: vi.fn().mockResolvedValue({ data: { data: '' } }),
    getSurveyInputs: vi
        .fn()
        .mockResolvedValue({ data: { data: {}, success: true }, status: 200 }),
    // Auth APIs
    login: vi.fn().mockResolvedValue({ data: { data: {} }, status: 200 }),
    activation: vi.fn().mockResolvedValue({ data: { success: true } }),
    resendActivation: vi.fn().mockResolvedValue({ data: { success: true } }),
    forgotPassword: vi.fn().mockResolvedValue({ data: { success: true } }),
    resetPassword: vi.fn().mockResolvedValue({ data: { success: true } }),
    googleOAuthCallback: vi.fn().mockResolvedValue({ data: {} }),
    // Misc
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

vi.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) =>
        createElement('div', { 'data-testid': 'markdown' }, children)
}));

vi.mock('react-datasheet-grid', () => ({
    DataSheetGrid: () =>
        createElement('div', { 'data-testid': 'datasheet-grid' }, 'DataSheet'),
    textColumn: {},
    keyColumn: () => ({}),
    floatColumn: {},
    intColumn: {},
    checkboxColumn: {}
}));

// EditorJS stubs
vi.mock('@components/EditorJs/EditorNew', () => ({
    __esModule: true,
    default: () =>
        createElement('div', { 'data-testid': 'editor-new' }, 'Editor')
}));
vi.mock('@components/EditorJs/EditorSimple', () => ({
    __esModule: true,
    default: () =>
        createElement('div', { 'data-testid': 'editor-simple' }, 'Editor')
}));
// Calendar stub
vi.mock('@components/Calendar/components/Calendar', () => ({
    __esModule: true,
    default: () =>
        createElement('div', { 'data-testid': 'calendar' }, 'Calendar')
}));

// ChatList stub (covers both dropdown and embedded modes)
vi.mock('@components/ChatList', () => ({
    __esModule: true,
    default: () =>
        createElement(
            'div',
            { 'data-testid': 'embedded-chat-list' },
            'ChatList'
        )
}));

// PDFViewer stub
vi.mock('@components/PDFViewer', () => ({
    __esModule: true,
    default: () =>
        createElement('div', { 'data-testid': 'pdf-viewer' }, 'PDFViewer')
}));

// ─── useQuery / useMutation / React Query ────────────────────────────────────
vi.mock('@tanstack/react-query', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn(() => ({
        data: { data: [], success: true, base_docs_link: [], result: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })),
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
    const factory = (queryKey: unknown[], data: unknown = { data: [] }) => ({
        queryKey,
        queryFn: () => Promise.resolve(data),
        staleTime: 300000
    });
    return {
        ...actual,
        getCRMStatsQuery: () => factory(['crm/stats'], { data: { data: {} } }),
        getCRMLeadsQuery: () => factory(['crm/leads'], { data: { data: [] } }),
        getCRMLeadQuery: () =>
            factory(['crm/lead', 'test'], { data: { data: {} } }),
        getCRMMeetingsQuery: () =>
            factory(['crm/meetings'], { data: { data: [] } }),
        getCRMMeetingQuery: () =>
            factory(['crm/meeting', 'test'], { data: { data: {} } }),
        getCRMDealsQuery: () => factory(['crm/deals'], { data: { data: [] } }),
        getCRMSalesRepsQuery: () =>
            factory(['crm/sales-reps'], { data: { data: [] } }),
        getInterviewsQuery: () =>
            factory(['interviews', ''], { data: { data: [] } }),
        getInterviewQuery: () =>
            factory(['interviews', 'test'], { data: { data: {} } }),
        getStudentUniAssistQuery: () =>
            factory(['uniassist', 'test'], { data: { data: {} } }),
        getCommunicationQuery: () =>
            factory(['communications', 'test'], {
                data: { data: { messages: [] } }
            }),
        getMyCommunicationQuery: () =>
            factory(['communications', 'my'], { data: { data: [] } }),
        getMessagThreadQuery: () =>
            factory(['MessageThread', 'test'], { data: { data: {} } }),
        getActiveThreadsQuery: (qs: string) =>
            factory(['active-threads', qs], { data: [] }),
        getActiveStudentsQuery: (qs: string) =>
            factory(['students/active', qs], { data: [] }),
        getAllCoursessQuery: () =>
            factory(['all-courses/all'], { data: { data: [] } }),
        getCoursessQuery: () =>
            factory(['all-courses/all', 'test'], { data: { data: {} } }),
        getProgramRequirementsQuery: () =>
            factory(['program-requirements/all'], { data: { data: [] } }),
        getEventsQuery: () =>
            factory(['events', ''], {
                data: {
                    data: [],
                    success: true,
                    agents: {},
                    editors: [],
                    hasEvents: false
                }
            }),
        getBookedEventsQuery: () =>
            factory(['events', 'booked'], { data: { data: [] } }),
        getMycoursesQuery: () =>
            factory(['mycourses', 'test'], { data: { data: [] } }),
        getStudentsAndDocLinks2Query: (qs: string) =>
            factory(['students/doc-links', qs], {
                data: [],
                base_docs_link: []
            }),
        getUsersCountQuery: () =>
            factory(['users/count'], {
                data: {
                    studentCount: 0,
                    agentCount: 0,
                    editorCount: 0,
                    externalCount: 0,
                    adminCount: 0
                }
            }),
        getUsersQuery: () => factory(['users'], { data: { data: [] } }),
        getTeamMembersQuery: () =>
            factory(['team-members'], { data: { data: [], success: true } }),
        getApplicationStudentV2Query: () =>
            factory(['applications/student', 'test'], { data: null }),
        getProgramsOverviewQuery: () =>
            factory(['programs', 'overview'], { data: { data: {} } }),
        getSchoolsDistributionQuery: () =>
            factory(['programs', 'schools-distribution'], {
                data: { data: [] }
            }),
        getInterviewsByStudentIdQuery: () =>
            factory(['interviews/student', 'test'], { data: { data: [] } }),
        getInterviewsByProgramIdQuery: () =>
            factory(['interviews/program', 'test'], { data: { data: [] } }),
        getMyStudentsThreadsQuery: () =>
            factory(['document-threads/overview/taiger-user', 'test', ''], {
                data: null
            }),
        getMyStudentsApplicationsV2Query: () =>
            factory(['applications/taiger-user', 'test', ''], {
                data: { data: [] }
            }),
        getStudentsV3Query: () => factory(['students/v3', ''], { data: [] }),
        getProgramsAndCourseKeywordSetsLoader: vi.fn().mockResolvedValue({})
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

vi.mock('@hooks/useCalendarEvents', () => ({
    __esModule: true,
    default: () => ({
        events: [],
        agents: {},
        editors: [],
        hasEvents: false,
        isLoaded: true,
        isLoading: false,
        error: null,
        res_status: 200,
        success: true,
        students: [],
        handleSelectSlot: vi.fn(),
        handleSelectEvent: vi.fn(),
        handleDeleteEvent: vi.fn(),
        handleConfirmEvent: vi.fn(),
        handleUpdateEvent: vi.fn()
    })
}));

vi.mock('@hooks/useCommunications', () => ({
    useCommunications: () => ({
        data: { messages: [] },
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
// Tier 3 – Feature-Flagged Pages
// ═════════════════════════════════════════════════════════════════════════════
describe('Tier 3 – CRM pages smoke tests', () => {
    test('CRMDashboard renders', async () => {
        const C = lazy(() => import('@pages/CRM/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CRMLeadDashboard renders', async () => {
        const C = lazy(() => import('@pages/CRM/LeadDashboard'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CRMLeadPage renders', async () => {
        const C = lazy(() => import('@pages/CRM/LeadPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CRMMeetingDashboard renders', async () => {
        const C = lazy(() => import('@pages/CRM/MeetingDashboard'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CRMMeetingPage renders', async () => {
        const C = lazy(() => import('@pages/CRM/MeetingPage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CRMDealDashboard renders', async () => {
        const C = lazy(() => import('@pages/CRM/DealDashboard'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – Interview pages smoke tests', () => {
    test('InterviewTraining renders', async () => {
        const C = lazy(() => import('@pages/InterviewTraining/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('AddInterview renders', async () => {
        const C = lazy(() => import('@pages/InterviewTraining/AddInterview'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('SingleInterview renders', async () => {
        const C = lazy(
            () => import('@pages/InterviewTraining/SingleInterview')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('Questionnaire (InterviewSurveyForm) renders', async () => {
        const C = lazy(
            () => import('@pages/InterviewTraining/InterviewSurveyForm')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – UniAssist smoke test', () => {
    test('UniAssist page renders', async () => {
        // UniAssist requires Student role
        vi.mocked(useAuth).mockReturnValueOnce({
            user: {
                _id: 'test-student-id',
                role: 'Student',
                firstname: 'Test',
                lastname: 'Student',
                email: 'student@example.com'
            },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(() => import('@pages/UniAssist/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – Communications pages smoke tests', () => {
    test('CommunicationSinglePage renders', async () => {
        const C = lazy(
            () => import('@pages/Communications/CommunicationSinglePage')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CommunicationExpandPage renders', async () => {
        const C = lazy(
            () => import('@pages/Communications/CommunicationExpandPage')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('DocumentCommunicationExpandPage renders', async () => {
        const C = lazy(
            () =>
                import(
                    '@pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/DocumentCommunicatiomExpandPage'
                )
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – Documentation pages smoke tests', () => {
    test('DocsApplication renders', async () => {
        const C = lazy(() => import('@pages/Documentation/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('InternaldocsPage renders', async () => {
        const C = lazy(() => import('@pages/Documentation/internal_index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('DocsPage renders', async () => {
        const C = lazy(() => import('@pages/Documentation/SingleDoc'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('DocsInternalPage renders', async () => {
        const C = lazy(() => import('@pages/Documentation/SingleInternalDoc'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('DocCreatePage renders', async () => {
        const C = lazy(() => import('@pages/Documentation/DocCreatePage'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('InternalDocCreatePage renders', async () => {
        const C = lazy(
            () => import('@pages/Documentation/InternalDocCreatePage')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – Office Hours pages smoke tests', () => {
    test('AllOfficeHours renders', async () => {
        const C = lazy(() => import('@pages/OfficeHours/all_index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('TaiGerOfficeHours renders', async () => {
        const C = lazy(() => import('@pages/OfficeHours/taiger_index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('OfficeHours renders', async () => {
        const C = lazy(() => import('@pages/OfficeHours/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – Course Analysis pages smoke tests', () => {
    test('AllCourses renders', async () => {
        const C = lazy(
            () => import('@pages/CourseAnalysis/AllCourses/AllCourses')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CourseForm (create) renders', async () => {
        const C = lazy(async () => {
            const { default: CourseForm } = await import(
                '@pages/CourseAnalysis/AllCourses/CourseForm'
            );
            return { default: () => <CourseForm mode="create" /> };
        });
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CourseForm (edit) renders', async () => {
        const C = lazy(async () => {
            const { default: CourseForm } = await import(
                '@pages/CourseAnalysis/AllCourses/CourseForm'
            );
            return { default: () => <CourseForm mode="edit" /> };
        });
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CourseKeywordsEdit renders', async () => {
        const C = lazy(
            () => import('@pages/CourseAnalysis/CourseKeywordsEdit')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ProgramRequirements renders', async () => {
        const C = lazy(
            () => import('@pages/CourseAnalysis/ProgramRequirements')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

describe('Tier 3 – AI / Widget pages smoke tests', () => {
    test('CVMLRLGenerator renders', async () => {
        const C = lazy(() => import('@pages/TaiGerAI/CVMLRLGenerator'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CVMLRL_Modification_Thread renders', async () => {
        const C = lazy(
            () =>
                import(
                    '@pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/SingleThreadPage'
                )
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('MyCoursesAnalysisV2 renders', async () => {
        const C = lazy(() => import('@pages/MyCourses/CourseAnalysisV2'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('CoursesAnalysisWidget renders', async () => {
        const C = lazy(() => import('@pages/MyCourses/CourseWidget'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Tier 4 – Authentication / Public Pages
// ═════════════════════════════════════════════════════════════════════════════
describe('Tier 4 – Authentication / Public Pages smoke tests', () => {
    test('SignIn page renders', async () => {
        vi.mocked(useAuth).mockReturnValueOnce({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(() => import('@pages/Authentication/SignIn/SignIn'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('LandingPage renders', async () => {
        vi.mocked(useAuth).mockReturnValueOnce({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(() => import('@pages/Authentication/LandingPage/index'));
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('AccountActivation page renders', async () => {
        vi.mocked(useAuth).mockReturnValueOnce({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(
            () => import('@pages/Authentication/Activation/Activation')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ResetPasswordRequest page renders', async () => {
        vi.mocked(useAuth).mockReturnValueOnce({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(
            () =>
                import(
                    '@pages/Authentication/ResetPasswordRequest/ResetPasswordRequest'
                )
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('ResetPassword page renders', async () => {
        vi.mocked(useAuth).mockReturnValueOnce({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(
            () => import('@pages/Authentication/ResetPassword/ResetPassword')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });

    test('GoogleOAuthCallback page renders', async () => {
        vi.mocked(useAuth).mockReturnValueOnce({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        const C = lazy(
            () => import('@pages/Authentication/GoogleOauthCallback/index')
        );
        await renderPageAsync(wrapWithSuspense(C));
        expect(document.body).toBeTruthy();
    });
});
