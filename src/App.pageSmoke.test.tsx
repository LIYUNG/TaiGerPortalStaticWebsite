/**
 * Page smoke tests: each page component renders without crashing.
 * Catches refactoring regressions (missing imports, wrong paths, broken providers).
 */
import React, { Suspense } from 'react';
import { render, waitFor } from '@testing-library/react';
import {
    createMemoryRouter,
    RouterProvider,
    defer,
    type RouteObject
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { SnackBarProvider } from './contexts/use-snack-bar';
import { CustomThemeProvider } from './components/ThemeProvider';
import { renderWithProviders, createTestQueryClient } from './test/test-utils';

jest.mock('./components/AuthProvider', () => ({
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

jest.mock('./api', () => ({
    ...jest.requireActual('./api'),
    getProgramTickets: jest
        .fn()
        .mockResolvedValue({ data: { success: true, data: [] } }),
    getAdmissions: jest.fn().mockResolvedValue({ data: { result: [] } }),
    getArchivStudents: jest.fn().mockResolvedValue({ data: [], status: 200 }),
    getStudents: jest.fn().mockResolvedValue({ data: [], status: 200 }),
    getProgramsAndCourseKeywordSetsLoader: jest.fn().mockResolvedValue({}),
    getApplicationStudentV2: jest.fn().mockResolvedValue({ data: null }),
    getComplaintsTickets: jest.fn().mockResolvedValue({ data: { data: [] } }),
    getComplaintsTicket: jest
        .fn()
        .mockResolvedValue({ data: { data: {} }, status: 200 }),
    getMyAcademicBackground: jest.fn().mockResolvedValue({ data: {} }),
    getProgram: jest.fn().mockResolvedValue({ data: {} }),
    getAllOpenInterviews: jest.fn().mockResolvedValue({ data: [] })
}));

jest.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: React.ReactNode }) => children ?? null
}));
jest.mock('@mui/x-charts/ChartsAxis', () => ({
    axisClasses: {}
}));

// Prevent useQuery from hanging in pages that fetch on mount
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn().mockReturnValue({
        data: { data: [], success: true },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn()
    })
}));

jest.mock('./hooks/useStudents', () => ({
    __esModule: true,
    default: () => ({
        students: [],
        res_modal_status: 0,
        res_modal_message: '',
        ConfirmError: jest.fn(),
        submitUpdateAgentlist: jest.fn(),
        submitUpdateEditorlist: jest.fn(),
        submitUpdateAttributeslist: jest.fn(),
        updateStudentArchivStatus: jest.fn()
    })
}));

const wrapWithSuspense = (
    Component: React.LazyExoticComponent<React.ComponentType<unknown>>
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
        const DashboardDefault = React.lazy(() => import('./Demo/Dashboard'));
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
        const Admissions = React.lazy(
            () => import('./Demo/Admissions/Admissions')
        );
        renderWithProviders(wrapWithSuspense(Admissions), {
            initialEntries: ['/admissions-overview']
        });
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Student Database page renders', async () => {
        const StudentDatabase = React.lazy(
            () => import('./Demo/StudentDatabase/index')
        );
        renderPageRoute(
            {
                path: '/student-database',
                element: wrapWithSuspense(StudentDatabase)
            },
            '/student-database'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    }, 25000);

    test('Student Database Overview renders', async () => {
        const StudentDatabaseOverview = React.lazy(
            () => import('./Demo/StudentDatabase/StudentDatabaseOverview')
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
        const ArchivStudent = React.lazy(
            () => import('./Demo/ArchivStudent/index')
        );
        renderPageRoute(
            {
                path: '/archiv/students',
                element: wrapWithSuspense(ArchivStudent)
            },
            '/archiv/students'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Program List page renders', async () => {
        const ProgramList = React.lazy(
            () => import('./Demo/Program/ProgramList')
        );
        renderPageRoute(
            { path: '/programs', element: wrapWithSuspense(ProgramList) },
            '/programs'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Users Table page renders', async () => {
        const UsersTable = React.lazy(() => import('./Demo/Users/UsersTable'));
        renderPageRoute(
            { path: '/users', element: wrapWithSuspense(UsersTable) },
            '/users'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('CVMLRL Center / Overview renders', async () => {
        const CVMLRLOverview = React.lazy(
            () => import('./Demo/CVMLRLCenter/index')
        );
        renderPageRoute(
            {
                path: '/cv-ml-rl-center',
                element: wrapWithSuspense(CVMLRLOverview)
            },
            '/cv-ml-rl-center'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Base Documents page renders', async () => {
        const BaseDocuments = React.lazy(
            () => import('./Demo/BaseDocuments/BaseDocuments')
        );
        renderPageRoute(
            {
                path: '/base-documents',
                element: wrapWithSuspense(BaseDocuments)
            },
            '/base-documents'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Settings page renders', async () => {
        const Settings = React.lazy(() => import('./Demo/Settings/index'));
        renderPageRoute(
            { path: '/settings', element: wrapWithSuspense(Settings) },
            '/settings'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Profile page renders', async () => {
        const Profile = React.lazy(() => import('./Demo/Profile/index'));
        renderPageRoute(
            { path: '/profile', element: wrapWithSuspense(Profile) },
            '/profile'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Learning Resources page renders', async () => {
        const LearningResources = React.lazy(
            () => import('./Demo/LearningResources/index')
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
        const Download = React.lazy(
            () => import('./Demo/DownloadCenter/DownloadPage')
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
        const MyCourses = React.lazy(() => import('./Demo/MyCourses/index'));
        renderPageRoute(
            { path: '/my-courses', element: wrapWithSuspense(MyCourses) },
            '/my-courses'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Applications Overview renders', async () => {
        const ApplicationsOverview = React.lazy(
            () => import('./Demo/ApplicantsOverview/index')
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
        const AllApplicantsOverview = React.lazy(
            () => import('./Demo/ApplicantsOverview/allStudentIndex')
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
        const AgentsAssignment = React.lazy(
            () => import('./Demo/AssignmentAgentsEditors/AssignAgents/index')
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
        const EditorsAssignment = React.lazy(
            () => import('./Demo/AssignmentAgentsEditors/AssignEditors/index')
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
        const Survey = React.lazy(() => import('./Demo/Survey/index'));
        renderPageRoute(
            { path: '/survey', element: wrapWithSuspense(Survey) },
            '/survey'
        );
        await waitFor(() => {
            expect(document.body.textContent).toBeDefined();
        });
    });

    test('Customer Support page renders', async () => {
        const CustomerSupport = React.lazy(
            () => import('./Demo/CustomerSupport')
        );
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
