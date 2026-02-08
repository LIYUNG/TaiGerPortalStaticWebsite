import { render, screen, waitFor } from '@testing-library/react';
import UsersTable from './UsersTable';
import { getUsers, getUsersCount } from '../../api';
import { useAuth } from '../../components/AuthProvider';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { testingUsersData } from '../../test/testingUsersData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextValue } from '../../api/types';
import { AxiosResponse } from 'axios';

vi.mock('axios');
vi.mock('../../api');
vi.mock('../../components/AuthProvider');

vi.mock('../../contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: () => {},
        setSeverity: () => {},
        setOpenSnackbar: () => {}
    })
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false // Disable retries for faster tests
            }
        }
    });

class ResizeObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
}

const routes = [
    {
        path: '/users',
        element: <UsersTable />
    }
];

describe('Users Table page checking', () => {
    window.ResizeObserver = ResizeObserver;
    test('Users Table page not crash', async () => {
        vi.mocked(getUsers).mockResolvedValue({
            data: testingUsersData.data
        } as AxiosResponse<typeof testingUsersData.data>);
        vi.mocked(getUsersCount).mockResolvedValue({ data: { count: 0 } });

        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: '639baebf8b84944b872cf648' },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);

        const testQueryClient = createTestQueryClient();
        const router = createMemoryRouter(routes, {
            initialEntries: ['/users']
        });

        render(
            <QueryClientProvider client={testQueryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('users_table_page')).toHaveTextContent(
                'User List'
            );
            // expect(1).toBe(1);
        });
    });
});
