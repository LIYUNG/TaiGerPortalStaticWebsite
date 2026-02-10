import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { AxiosResponse } from 'axios';
import ArchivStudents from '.';
import { getArchivStudents } from '@api';
import { useAuth } from '@components/AuthProvider/index';
import type { AuthContextValue } from '@api/types';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockSingleArchivStudentData } from '../../test/testingArchivStudentData';

vi.mock('axios');
vi.mock('@api', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@api')>()),
    getArchivStudents: vi.fn(),
    updateArchivStudents: vi.fn()
}));
vi.mock('@components/AuthProvider');

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

describe('ArchivStudents', () => {
    window.ResizeObserver = ResizeObserver;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Agent: archiv student page not crash', async () => {
        vi.mocked(getArchivStudents).mockResolvedValue({
            data: mockSingleArchivStudentData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as import('axios').InternalAxiosRequestConfig
        } as AxiosResponse);
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);

        renderWithQueryClient(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );

        await waitFor(
            () => {
                expect(
                    screen.getByTestId('archiv_student_component')
                ).toBeInTheDocument();
            },
            { timeout: 2000 }
        );

        expect(
            screen.getByTestId('archiv_student_component')
        ).toHaveTextContent('Testing-Student');
    });

    test('Shows loading state initially', () => {
        vi.mocked(getArchivStudents).mockImplementation(() => new Promise(() => {})); // Never resolves
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);

        renderWithQueryClient(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );

        // Should show loading component
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('Redirects non-TaiGer users', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Student', _id: '639baebf8b84944b872cf648' },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);

        renderWithQueryClient(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );

        // Should redirect, so the main content shouldn't be visible
        expect(
            screen.queryByTestId('archiv_student_component')
        ).not.toBeInTheDocument();
    });
});
