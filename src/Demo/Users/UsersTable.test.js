import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UsersTable from './UsersTable';
import 'react-i18next';
import { getUsers } from '../../api';
import { useAuth } from '../../components/AuthProvider';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { testingUsersData } from '../../test/testingUsersData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('axios');
jest.mock('../../api');
jest.mock('react-i18next', () => ({
    useTranslation: () => {
        return {
            t: (str) => str,
            i18n: { changeLanguage: () => new Promise(() => {}) }
        };
    },
    initReactI18next: { type: '3rdParty', init: () => {} }
}));

jest.mock('../../components/AuthProvider');

jest.mock('../../contexts/use-snack-bar', () => ({
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
        getUsers.mockResolvedValue({ data: testingUsersData.data });

        useAuth.mockReturnValue({
            user: { role: 'Admin', _id: '639baebf8b84944b872cf648' }
        });

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
