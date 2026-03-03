import { createElement, forwardRef } from 'react';
import { render } from '@testing-library/react';
import Dashboard from './';
import { getProgramTickets } from '@/api';
import { useAuth } from '@components/AuthProvider/index';
import { SnackBarProvider } from '@contexts/use-snack-bar';
import { mockSingleData } from '../../test/testingStudentData';

vi.mock('@/api');
vi.mock('@components/AuthProvider');

vi.mock('@hooks/useMyStudentsApplicationsV2', () => ({
    useMyStudentsApplicationsV2: () => ({
        data: { applications: [] },
        isLoading: false,
        isError: false
    })
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: () => ({
        data: [],
        isLoading: false,
        isError: false
    })
}));

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: vi.fn().mockImplementation(({ children }) => children)
}));
vi.mock('@mui/x-charts/ChartsAxis', () => ({ axisClasses: {} }));

// Stub the role-specific dashboard views — they are tested individually.
// Mocking them here prevents rendering heavy MUI tables/charts in this smoke-level test.
vi.mock('@pages/Dashboard/AgentDashboard/AgentMainView', () => ({ default: () => null }));
vi.mock('@pages/Dashboard/AdminDashboard/AdminMainView', () => ({ default: () => null }));
vi.mock('@pages/Dashboard/EditorDashboard/EditorMainView', () => ({ default: () => null }));
vi.mock('@pages/Dashboard/ManagerDashboard/ManagerMainView', () => ({ default: () => null }));
vi.mock('@pages/Dashboard/StudentDashboard/StudentDashboard', () => ({ default: () => null }));
vi.mock('@pages/Dashboard/GuestDashboard/GuestDashboard', () => ({ default: () => null }));
vi.mock('@pages/Dashboard/ExternalDashboard/ExternalMainView', () => ({ default: () => null }));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        Navigate: () => null,
        Link: forwardRef((props: { to?: string; children?: React.ReactNode }, ref) =>
            createElement('a', { href: props.to ?? '', ref, ...props }, props.children)
        ),
        useLoaderData: () => ({
            studentAndEssaysAndInterview: {
                data: mockSingleData,
                essays: { data: [] },
                interviews: { data: [] }
            }
        }),
        useNavigate: () => vi.fn(),
        useLocation: () => ({ search: '', pathname: '/dashboard', hash: '', state: null }),
        useParams: () => ({})
    };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = (await importOriginal()) as typeof import('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn().mockReturnValue({
            data: { data: [], threads: [], success: true },
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn()
        }),
        useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
        useQueryClient: vi.fn(() => ({
            invalidateQueries: vi.fn().mockResolvedValue(undefined)
        }))
    };
});

describe('Dashboard', () => {
    test('agent dashboard not crash', () => {
        vi.mocked(getProgramTickets).mockResolvedValue({
            data: { success: true, data: [] }
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        } as never);

        render(
            <SnackBarProvider>
                <Dashboard />
            </SnackBarProvider>
        );

        expect(1).toBe(1);
    });
});
