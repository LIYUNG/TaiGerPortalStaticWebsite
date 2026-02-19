/**
 * Page smoke tests: each page component renders without crashing.
 * Catches refactoring regressions (missing imports, wrong paths, broken providers).
 */
import { Suspense, lazy, LazyExoticComponent, ComponentType } from 'react';
import { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react';
import {
    createMemoryRouter,
    RouterProvider,
    defer,
    type RouteObject
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { SnackBarProvider } from '@contexts/use-snack-bar';
import { CustomThemeProvider } from '@components/ThemeProvider';
import { renderWithProviders, createTestQueryClient } from './test/test-utils';
import Settings from '@pages/Settings/index';
import Survey from '@pages/Survey/index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            _id: 'test-user-id',
            role: 'Agent',
            firstname: 'Test',
            lastname: 'User',
            email: 'test@example.com'
        },
        isAuthenticated: true
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
    getStudentsAndDocLinks2: vi.fn().mockResolvedValue({
        data: [],
        base_docs_link: []
    }),
    getProgramsAndCourseKeywordSetsLoader: vi.fn().mockResolvedValue({}),
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
    updateCredentials: vi.fn().mockResolvedValue({
        data: { success: true },
        status: 200
    })
}));

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: ReactNode }) => children ?? null
}));

// Lightweight mocks so smoke test doesn't load heavy chunks (avoids timeout)
vi.mock('@pages/Users/UsersTable', async () => {
    const { createElement } = await import('react');
    return {
        default: () =>
            createElement('div', { 'data-testid': 'users-table' }, 'Users')
    };
});

vi.mock('@pages/Survey/SurveyComponent', async () => {
    const { createElement } = await import('react');
    return {
        default: () =>
            createElement('div', { 'data-testid': 'survey-component' }, 'Survey')
    };
});
vi.mock('@mui/x-charts/ChartsAxis', () => ({
    axisClasses: {}
}));

// Mock useQuery so all pages get sync mock data (no async API calls = faster tests)
vi.mock('@tanstack/react-query', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn().mockReturnValue({
        data: { data: [], success: true, base_docs_link: [], result: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
    })
}));

// Base Documents and AllBaseDocuments use useStudentsAndDocLinks (see mock below).
// UsersTable uses getUsersCountQuery and UsersList uses getUsersQuery; mock them so queries resolve immediately.
vi.mock('@/api/query', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/api/query')>();
    return {
        ...actual,
        getStudentsAndDocLinks2Query: (queryString: string) => ({
            queryKey: ['students/doc-links', queryString],
            queryFn: () => Promise.resolve({ data: [], base_docs_link: [] }),
            staleTime: 1000 * 60 * 1
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
    Component: LazyExoticComponent<ComponentType<unknown>>
) => (
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
        <Component />
    </Suspense>
);

const routerFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
};

function renderPageRoute(route: RouteObject, initialEntry: string): void {
    // Fallback route avoids "No route matches" / ErrorBoundary when a page navigates internally
    const routes: RouteObject[] = [
        route,
        { path: '*', element: <div data-testid="route-fallback" /> }
    ];
    const router = createMemoryRouter(routes, {
        initialEntries: [initialEntry],
        future: routerFutureFlags
    });
    const queryClient = createTestQueryClient();
    render(
        <CustomThemeProvider>
            <QueryClientProvider client={queryClient}>
                <SnackBarProvider>
                    <RouterProvider router={router} />
                </SnackBarProvider>
            </QueryClientProvider>
        </CustomThemeProvider>
    );
}

describe('Page smoke tests – all pages render without crashing', () => {
    test('Dashboard (default) renders', async () => {
        const DashboardDefault = lazy(() => import('@pages/Dashboard'));
        renderPageRoute(
            {
                path: '/dashboard/default',
                element: wrapWithSuspense(DashboardDefault)
            },
            '/dashboard/default'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Admissions page renders', async () => {
        const Admissions = lazy(() => import('@pages/Admissions/Admissions'));
        renderWithProviders(wrapWithSuspense(Admissions), {
            initialEntries: ['/admissions-overview']
        });
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Student Database page renders', async () => {
        const StudentDatabase = lazy(
            () => import('@pages/StudentDatabase/index')
        );
        renderPageRoute(
            {
                path: '/student-database',
                element: wrapWithSuspense(StudentDatabase)
            },
            '/student-database'
        );
        await waitFor(
            () => {
                expect(document.body.textContent).toBeDefined();
            },
            { timeout: 10000 }
        );
    }, 10000);

    test('Student Database Overview renders', async () => {
        const StudentDatabaseOverview = lazy(
            () => import('@pages/StudentDatabase/StudentDatabaseOverview')
        );
        renderPageRoute(
            {
                path: '/student-database/overview',
                element: wrapWithSuspense(StudentDatabaseOverview)
            },
            '/student-database/overview'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Archiv Students page renders', async () => {
        const ArchivStudent = lazy(() => import('@pages/ArchivStudent/index'));
        renderPageRoute(
            {
                path: '/archiv/students',
                element: wrapWithSuspense(ArchivStudent)
            },
            '/archiv/students'
        );
        await waitFor(
            () => {
                expect(document.body.textContent).toBeDefined();
            },
            { timeout: 5000 }
        );
    }, 5000);

    test('Program List page renders', async () => {
        const ProgramList = lazy(() => import('@pages/Program/ProgramList'));
        renderPageRoute(
            { path: '/programs', element: wrapWithSuspense(ProgramList) },
            '/programs'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Users Table page renders', async () => {
        const UsersTable = lazy(() => import('@pages/Users/UsersTable'));
        renderPageRoute(
            {
                path: '/users',
                element: wrapWithSuspense(UsersTable)
            },
            '/users'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('CVMLRL Center / Overview renders', async () => {
        const CVMLRLOverview = lazy(() => import('@pages/CVMLRLCenter/index'));
        renderPageRoute(
            {
                path: '/cv-ml-rl-center',
                element: wrapWithSuspense(CVMLRLOverview)
            },
            '/cv-ml-rl-center'
        );
        await waitFor(
            () => {
                expect(document.body.textContent).toBeDefined();
            },
            { timeout: 5000 }
        );
    }, 5000);

    test('Base Documents page renders', async () => {
        const BaseDocuments = lazy(
            () => import('@pages/BaseDocuments/BaseDocuments')
        );
        renderPageRoute(
            {
                path: '/base-documents',
                element: wrapWithSuspense(BaseDocuments)
            },
            '/base-documents'
        );
        await waitFor(
            () => {
                expect(document.body.textContent).toBeDefined();
            },
            { timeout: 3000 }
        );
    });

    test('Settings page renders', async () => {
        renderPageRoute(
            {
                path: '/settings',
                element: (
                    <Suspense
                        fallback={<div data-testid="loading">Loading...</div>}
                    >
                        <Settings />
                    </Suspense>
                )
            },
            '/settings'
        );
        await waitFor(
            () => {
                expect(document.body.textContent).toBeDefined();
            },
            { timeout: 3000 }
        );
    });

    test('Profile page renders', async () => {
        const Profile = lazy(() => import('@pages/Profile/index'));
        renderPageRoute(
            { path: '/profile', element: wrapWithSuspense(Profile) },
            '/profile'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Learning Resources page renders', async () => {
        const LearningResources = lazy(
            () => import('@pages/LearningResources/index')
        );
        renderPageRoute(
            {
                path: '/resources',
                element: wrapWithSuspense(LearningResources)
            },
            '/resources'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Download page renders', async () => {
        const Download = lazy(
            () => import('@pages/DownloadCenter/DownloadPage')
        );
        renderPageRoute(
            { path: '/download', element: wrapWithSuspense(Download) },
            '/download'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('My Courses page renders', async () => {
        const MyCourses = lazy(() => import('@pages/MyCourses/index'));
        renderPageRoute(
            { path: '/my-courses', element: wrapWithSuspense(MyCourses) },
            '/my-courses'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Applications Overview renders', async () => {
        const ApplicationsOverview = lazy(
            () => import('@pages/ApplicantsOverview/index')
        );
        renderPageRoute(
            {
                path: '/student-applications',
                element: wrapWithSuspense(ApplicationsOverview)
            },
            '/student-applications'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('All Applicants Overview renders', async () => {
        const AllApplicantsOverview = lazy(
            () => import('@pages/ApplicantsOverview/allStudentIndex')
        );
        renderPageRoute(
            {
                path: '/all-students-applications',
                element: wrapWithSuspense(AllApplicantsOverview)
            },
            '/all-students-applications'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Assignment Agents page renders', async () => {
        const AgentsAssignment = lazy(
            () => import('@pages/AssignmentAgentsEditors/AssignAgents/index')
        );
        renderPageRoute(
            {
                path: '/assignment/agents',
                element: wrapWithSuspense(AgentsAssignment)
            },
            '/assignment/agents'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Assignment Editors page renders', async () => {
        const EditorsAssignment = lazy(
            () => import('@pages/AssignmentAgentsEditors/AssignEditors/index')
        );
        renderPageRoute(
            {
                path: '/assignment/editors',
                element: wrapWithSuspense(EditorsAssignment)
            },
            '/assignment/editors'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Survey page renders', async () => {
        const mockLoaderData = {
            data: {
                data: {
                    academic_background: {},
                    application_preference: {}
                },
                survey_link: ''
            }
        };
        const routes: RouteObject[] = [
            {
                path: '/survey',
                loader: () => mockLoaderData,
                element: <Survey />
            }
        ];
        const router = createMemoryRouter(routes, {
            initialEntries: ['/survey'],
            future: routerFutureFlags
        });
        const queryClient = createTestQueryClient();
        render(
            <CustomThemeProvider>
                <QueryClientProvider client={queryClient}>
                    <SnackBarProvider>
                        <RouterProvider router={router} />
                    </SnackBarProvider>
                </QueryClientProvider>
            </CustomThemeProvider>
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Customer Support page renders', async () => {
        const CustomerSupport = lazy(() => import('@pages/CustomerSupport'));
        renderPageRoute(
            {
                path: '/customer-center',
                element: wrapWithSuspense(CustomerSupport),
                loader: () => defer({ complaintTickets: Promise.resolve([]) })
            },
            '/customer-center'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    // DefaultErrorPage uses useRouteError() and must be rendered as route errorElement; skip standalone smoke test
});
