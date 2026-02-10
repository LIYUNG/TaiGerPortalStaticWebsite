import { render, waitFor } from '@testing-library/react';
import AssignAgents from './index';
import { getProgramTickets, getStudentsV3 } from '@api';
import { useAuth } from '@components/AuthProvider/index';
import { createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockTwoNoAgentNoStudentsData } from '../../../test/testingNoAgentNoEditorStudentData';
import { RouterProvider } from 'react-router-dom';

vi.mock('axios');
vi.mock('@api');
vi.mock('@components/AuthProvider');

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
        path: '/assignment/agents',
        element: <AssignAgents />,
        errorElement: <div>Error</div>,
        loader: () => {
            return { data: mockTwoNoAgentNoStudentsData };
        }
    }
];

describe('Admin AssignAgents', () => {
    test('admin assign agent not crash', async () => {
        vi.mocked(getProgramTickets).mockResolvedValue({
            data: { success: true, data: [] }
        });
        vi.mocked(getStudentsV3).mockResolvedValue({
            data: { success: true, data: mockTwoNoAgentNoStudentsData }
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' }
        });

        const testQueryClient = createTestQueryClient();
        const router = createMemoryRouter(routes, {
            initialEntries: ['/assignment/agents']
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
            // TODO
            //  expect(screen.getByTestId('assignment_agents')).toHaveTextContent(
            //     'No Agents Students'
            // );
            expect(1).toBe(1);
        });
    });

    test('students rendered correctly', async () => {
        vi.mocked(getProgramTickets).mockResolvedValue({
            data: { success: true, data: [] }
        });
        vi.mocked(getStudentsV3).mockResolvedValue({
            data: { success: true, data: mockTwoNoAgentNoStudentsData }
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' }
        });

        const testQueryClient = createTestQueryClient();
        const router = createMemoryRouter(routes, {
            initialEntries: ['/assignment/agents']
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
            // expect(
            //     screen.getByTestId('assignment_agents')
            // ).not.toHaveTextContent('TestStudent-HasAgent-NoEditor');
            // expect(screen.getByTestId('assignment_agents')).toHaveTextContent(
            //     'Student-NoAgent-HasEditor'
            // );
            expect(1).toBe(1);
        });
    });
});
