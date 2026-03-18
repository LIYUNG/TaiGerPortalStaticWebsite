import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/api', () => ({
    request: vi.fn(() => Promise.resolve({ data: { students: [] } }))
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string) => `/student/${id}`,
        SINGLE_PROGRAM_LINK: (school: string, program: string) =>
            `/program/${school}/${program}`
    }
}));

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(() => ({
            data: null,
            isLoading: false,
            isFetching: false,
            isError: false,
            error: null,
            refetch: vi.fn()
        }))
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: { defaultValue?: string }) =>
            opts?.defaultValue || key
    })
}));

import SimilarStudents from './SimilarStudents';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('SimilarStudents - with leadId', () => {
    beforeEach(() => {
        render(<SimilarStudents leadId="lead123" />, {
            wrapper: createWrapper()
        });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders similar students header', () => {
        expect(screen.getByText('common.similarStudents')).toBeTruthy();
    });

    it('renders the manual fetch CTA text', () => {
        expect(
            screen.getByText(
                'No similar students loaded. Click the button below to fetch suggestions for this lead.'
            )
        ).toBeTruthy();
    });

    it('renders fetch suggestions button', () => {
        expect(document.querySelector('button')).toBeTruthy();
    });
});

describe('SimilarStudents - without leadId', () => {
    beforeEach(() => {
        render(<SimilarStudents />, { wrapper: createWrapper() });
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });
});
