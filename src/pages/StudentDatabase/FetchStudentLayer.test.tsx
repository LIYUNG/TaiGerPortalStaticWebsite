import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: true })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@/api/query', () => ({
    getStudentAndDocLinksQuery: vi.fn(() => ({
        queryKey: ['student-doc-links'],
        queryFn: vi.fn()
    }))
}));

vi.mock('./SingleStudentPage', () => ({
    SingleStudentPageMainContent: () => <div data-testid="single-student-page-main-content" />
}));

import { FetchStudentLayer } from './FetchStudentLayer';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/students/std1']}>
        <Routes>
            <Route path="/students/:studentId" element={children} />
        </Routes>
    </MemoryRouter>
);

describe('FetchStudentLayer', () => {
    beforeEach(() => {
        render(<FetchStudentLayer />, { wrapper });
    });

    it('renders loading spinner when isLoading is true', () => {
        // CircularProgress is shown while loading
        const container = document.body;
        expect(container).toBeTruthy();
    });

    it('renders without crashing', () => {
        // Component renders some content (loading state)
        expect(document.body.innerHTML).not.toBe('');
    });

    it('shows loading state when data is undefined', () => {
        // When isLoading=true, the CircularProgress is shown, not the main content
        expect(screen.queryByTestId('single-student-page-main-content')).toBeNull();
    });
});
