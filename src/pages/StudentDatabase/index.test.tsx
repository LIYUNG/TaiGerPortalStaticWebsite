import { render, waitFor } from '@testing-library/react';
import StudentDatabase from '.';
import { getProgramTickets } from '@api';
import { useAuth } from '@components/AuthProvider/index';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { mockSingleData } from '../../test/testingStudentData';
import {
    useQuery,
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query';

vi.mock('axios');
vi.mock('@api');
vi.mock('@components/AuthProvider');
vi.mock('@tanstack/react-query', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn()
}));

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

const routes = [
    {
        path: '/student-database',
        element: <StudentDatabase />,
        errorElement: <div>Error</div>,
        loader: () => {
            return { data: mockSingleData, essays: { data: [] } };
        }
    }
];

describe('StudentDatabase', () => {
    window.ResizeObserver = ResizeObserver;
    test('Student dashboard not crash', async () => {
        vi.mocked(getProgramTickets).mockResolvedValue({
            data: { success: true, data: [] }
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        });

        vi.mocked(useQuery).mockImplementation(() => ({
            data: mockSingleData,
            isLoading: false,
            isError: false
        }));

        const router = createMemoryRouter(routes, {
            initialEntries: ['/student-database']
        });
        renderWithQueryClient(<RouterProvider router={router} />);

        // Example
        // const buttonElement = screen.getByRole('button');
        // userEvent.click(buttonElement);
        // const outputElement = screen.getByText('good to see you', { exact: false });
        // expect(outputElement).toBeInTheDocument(1);

        await waitFor(() => {
            // TODO
            // expect(screen.getByTestId('student_datdabase')).toHaveTextContent(
            //     'Agents'
            // );
            expect(1).toBe(1);
        });
    });
});
