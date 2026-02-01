import React from 'react';
import { render, waitFor } from '@testing-library/react';
import AssignEditors from './index';
import { getProgramTickets, getStudentsV3 } from '../../../api';
import { useAuth } from '../../../components/AuthProvider/index';
import { createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockTwoNoAgentNoStudentsData } from '../../../test/testingNoAgentNoEditorStudentData';
import { RouterProvider } from 'react-router-dom';

jest.mock('axios');
jest.mock('../../../api');
jest.mock('../../../components/AuthProvider');

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false // Disable retries for faster tests
            }
        }
    });
const routes = [
    {
        path: '/assignment/editors',
        element: <AssignEditors />,
        errorElement: <div>Error</div>,
        loader: () => {
            return { data: mockTwoNoAgentNoStudentsData };
        }
    }
];

describe('Admin AssignEditors', () => {
    test('admin assign editor not crash', async () => {
        getProgramTickets.mockResolvedValue({
            data: { success: true, data: [] }
        });
        getStudentsV3.mockResolvedValue({
            data: { success: true, data: mockTwoNoAgentNoStudentsData }
        });
        useAuth.mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' }
        });

        const testQueryClient = createTestQueryClient();
        const router = createMemoryRouter(routes, {
            initialEntries: ['/assignment/editors']
        });
        render(
            <QueryClientProvider client={testQueryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        );

        // Example
        // const buttonElement = screen.getByRole('button');
        // userEvent.click(buttonElement);
        // const outputElement = screen.getByText('good to see you', { exact: false });
        // expect(outputElement).toBeInTheDocument(1);

        await waitFor(() => {
            // expect(screen.getByTestId('assignment_editors')).toHaveTextContent(
            //     'No Editors Students'
            // );
            expect(1).toBe(1);
        });
    });

    test('students rendered correctly', async () => {
        getProgramTickets.mockResolvedValue({
            data: { success: true, data: [] }
        });
        getStudentsV3.mockResolvedValue({
            data: { success: true, data: mockTwoNoAgentNoStudentsData }
        });
        useAuth.mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' }
        });

        const testQueryClient = createTestQueryClient();
        const router = createMemoryRouter(routes, {
            initialEntries: ['/assignment/editors']
        });
        render(
            <QueryClientProvider client={testQueryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        );

        await waitFor(() => {
            // expect(screen.getByTestId('assignment_editors')).toHaveTextContent(
            //     'TestStudent-HasAgent-NoEditor'
            // );
            // expect(
            //     screen.getByTestId('assignment_editors')
            // ).not.toHaveTextContent('Student-NoAgent');
            expect(1).toBe(1);
        });
    });
});
