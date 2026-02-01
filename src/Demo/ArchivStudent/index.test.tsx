import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ArchivStudents from '.';
import { getArchivStudents } from '../../api';
import { useAuth } from '../../components/AuthProvider/index';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockSingleArchivStudentData } from '../../test/testingArchivStudentData';

jest.mock('axios');
jest.mock('../../api', () => ({
    ...jest.requireActual('../../api'),
    getArchivStudents: jest.fn(),
    updateArchivStudents: jest.fn()
}));
jest.mock('../../components/AuthProvider');

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

describe('ArchivStudents', () => {
    window.ResizeObserver = ResizeObserver;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Agent: archiv student page not crash', async () => {
        getArchivStudents.mockResolvedValue({
            data: mockSingleArchivStudentData,
            status: 200
        });
        useAuth.mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        });

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
            { timeout: 3000 }
        );

        expect(
            screen.getByTestId('archiv_student_component')
        ).toHaveTextContent('Testing-Student');
    });

    test('Shows loading state initially', () => {
        getArchivStudents.mockImplementation(() => new Promise(() => {})); // Never resolves
        useAuth.mockReturnValue({
            user: { role: 'Agent', _id: '639baebf8b84944b872cf648' }
        });

        renderWithQueryClient(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );

        // Should show loading component
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('Redirects non-TaiGer users', () => {
        useAuth.mockReturnValue({
            user: { role: 'Student', _id: '639baebf8b84944b872cf648' }
        });

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
