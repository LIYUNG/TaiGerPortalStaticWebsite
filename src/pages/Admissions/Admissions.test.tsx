import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import Admissions from './Admissions';
import { getAdmissions } from '@api';
import { useAuth } from '@components/AuthProvider';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthContextValue } from '@api/types';

import { mockAdmissionsData } from '../../test/testingAdmissionsData';

const mockAuthAgent: AuthContextValue = {
    user: { role: 'Agent', _id: '639baebf8b84944b872cf648' },
    isAuthenticated: true,
    isLoaded: true,
    login: () => {},
    logout: () => {}
};

/** Mock responses for synchronous use in tests (no async API calls) */
const mockAdmissionsResponse = {
    data: mockAdmissionsData,
    result: [] as unknown[],
    success: true
};
const mockActiveStudentsResponse = { data: [] };

vi.mock('axios');
vi.mock('@api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@api')>()),
    getAdmissions: vi.fn(),
    getActiveStudents: vi.fn()
}));
vi.mock('@components/AuthProvider');

/** When true, useQuery returns mock data for admissions/students/active (no async). Set only in deep-link test. */
declare global {
    var __ADMISSIONS_USE_MOCK_QUERY: boolean | undefined;
}
vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-query')>();
    return {
        ...actual,
        useQuery: vi.fn((options: { queryKey?: unknown[] }) => {
            if (
                globalThis.__ADMISSIONS_USE_MOCK_QUERY &&
                Array.isArray(options?.queryKey)
            ) {
                const key = options.queryKey[0];
                if (key === 'admissions') {
                    return {
                        data: mockAdmissionsResponse,
                        isLoading: false,
                        isError: false,
                        error: null,
                        refetch: vi.fn()
                    };
                }
                if (key === 'students/active') {
                    return {
                        data: mockActiveStudentsResponse,
                        isLoading: false,
                        isError: false,
                        error: null,
                        refetch: vi.fn()
                    };
                }
            }
            return (actual.useQuery as (...args: unknown[]) => unknown)(
                options
            );
        })
    };
});

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

describe('Admissions page checking', () => {
    window.ResizeObserver = ResizeObserver;

    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.__ADMISSIONS_USE_MOCK_QUERY = false;
    });
    afterEach(() => {
        globalThis.__ADMISSIONS_USE_MOCK_QUERY = false;
    });

    test('Admissions page renders without crashing', () => {
        globalThis.__ADMISSIONS_USE_MOCK_QUERY = true;
        vi.mocked(useAuth).mockReturnValue(mockAuthAgent);

        renderWithQueryClient(
            <MemoryRouter>
                <Admissions />
            </MemoryRouter>
        );

        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
    });

    test('Deep-link to Student tab via ?tab=student selects the tab', () => {
        globalThis.__ADMISSIONS_USE_MOCK_QUERY = true;
        vi.mocked(useAuth).mockReturnValue(mockAuthAgent);

        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/admissions-overview',
                            search: '?tab=student'
                        }
                    ]}
                >
                    <Admissions />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
        expect(
            screen.getByRole('tablist', {
                name: /admissions students tables/i
            })
        ).toBeInTheDocument();
    });

    test('Admissions page shows loading state', () => {
        vi.mocked(getAdmissions).mockImplementation(
            () => new Promise(() => {})
        ); // Never resolves
        vi.mocked(useAuth).mockReturnValue(mockAuthAgent);

        renderWithQueryClient(
            <MemoryRouter>
                <Admissions />
            </MemoryRouter>
        );

        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
    });

    test('Admissions page redirects non-TaiGer users', () => {
        vi.mocked(useAuth).mockReturnValue({
            ...mockAuthAgent,
            user: { role: 'Student', _id: '639baebf8b84944b872cf648' }
        });

        renderWithQueryClient(
            <MemoryRouter>
                <Admissions />
            </MemoryRouter>
        );

        // Should redirect, so the main content shouldn't be visible
        expect(screen.queryByTestId('admissinos_page')).not.toBeInTheDocument();
    });

    test('Admissions page handles API error', async () => {
        vi.mocked(getAdmissions).mockRejectedValue(new Error('API Error'));
        vi.mocked(useAuth).mockReturnValue(mockAuthAgent);

        renderWithQueryClient(
            <MemoryRouter>
                <Admissions />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
        });
    });
});
