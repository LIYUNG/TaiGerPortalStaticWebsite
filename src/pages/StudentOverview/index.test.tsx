import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import StudentOverviewPage from '.';
import { useAuth } from '@components/AuthProvider/index';
import { getActiveStudents } from '@/api';
import type { AuthContextValue } from '@/api/types';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

import { mockSingleData } from '../../test/testingStudentData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('axios');
vi.mock('@/api');
vi.mock('@components/AuthProvider');
vi.mock('@components/StudentOverviewTable', () => ({
    default: () => <div data-testid="student-overview-table">Table</div>
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false // Disable retries for faster tests
            }
        }
    });

const renderWithQueryClient = (ui: ReactElement) => {
    const testQueryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
    );
};

class ResizeObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
}

const routes = [
    {
        path: '/students-overview/all',
        element: <StudentOverviewPage />,
        errorElement: <div>Error</div>,
        loader: () => {
            return { data: mockSingleData, essays: { data: [] } };
        }
    }
];

describe('StudentOverviewPage', () => {
    window.ResizeObserver = ResizeObserver;
    test('StudentOverview page not crash', async () => {
        vi.mocked(getActiveStudents).mockResolvedValue({
            data: mockSingleData
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);
        const router = createMemoryRouter(routes, {
            initialEntries: ['/students-overview/all']
        });
        renderWithQueryClient(<RouterProvider router={router} />);

        await waitFor(
            () => {
                expect(
                    screen.getByTestId('student_overview')
                ).toBeInTheDocument();
            },
            { timeout: 5000 }
        );
    });
});
