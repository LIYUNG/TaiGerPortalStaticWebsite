import { render, screen, waitFor } from '@testing-library/react';
import Admissions from './Admissions';
import { getAdmissions, getActiveStudents } from '../../api';
import { useAuth } from '../../components/AuthProvider';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockAdmissionsData } from '../../test/testingAdmissionsData';

vi.mock('axios');
vi.mock('../../api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../api')>()),
    getAdmissions: vi.fn(),
    getActiveStudents: vi.fn()
}));
vi.mock('../../components/AuthProvider');

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false // Disable retries for faster tests
            }
        }
    });

const renderWithQueryClient = (ui) => {
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
    });

    test('Admissions page renders without crashing', async () => {
        vi.mocked(getAdmissions).mockResolvedValue({
            data: mockAdmissionsData,
            result: [
                {
                    applicationCount: 10,
                    admissionCount: 3,
                    rejectionCount: 2,
                    pendingResultCount: 5,
                    id: '2532fde46751651537926662',
                    school: 'ETH Zurich',
                    program_name: 'Mechanical Engineering',
                    semester: 'WS',
                    degree: 'M. Sc.',
                    lang: 'English'
                }
            ]
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        });

        renderWithQueryClient(
            <MemoryRouter>
                <Admissions />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
        });
    });

    test(
        'Deep-link to Student tab via ?tab=student selects the tab',
        async () => {
            vi.mocked(getAdmissions).mockResolvedValue({
                data: mockAdmissionsData,
                result: []
            });
            vi.mocked(getActiveStudents).mockResolvedValue({ data: [] });
            vi.mocked(useAuth).mockReturnValue({
                user: { role: 'Agent', _id: '639baebf8b84944b872cf648' },
                isAuthenticated: true,
                isLoaded: true,
                login: () => {},
                logout: () => {}
            } as import('../../api/types').AuthContextValue);

            renderWithQueryClient(
                <MemoryRouter
                    initialEntries={[
                        { pathname: '/admissions-overview', search: '?tab=student' }
                    ]}
                >
                    <Admissions />
                </MemoryRouter>
            );

            await waitFor(
                () => {
                    expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
                },
                { timeout: 15000 }
            );

            // The Student tab panel renders its nested tablist
            expect(
                await screen.findByRole('tablist', {
                    name: /admissions students tables/i
                })
            ).toBeInTheDocument();
        },
        15000
    );

    test('Admissions page shows loading state', () => {
        vi.mocked(getAdmissions).mockImplementation(() => new Promise(() => {})); // Never resolves
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        });

        renderWithQueryClient(
            <MemoryRouter>
                <Admissions />
            </MemoryRouter>
        );

        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
    });

    test('Admissions page redirects non-TaiGer users', () => {
        vi.mocked(useAuth).mockReturnValue({
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
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        });

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
