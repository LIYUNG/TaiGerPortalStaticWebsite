import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditEditorsSubpage from './EditEditorsSubpage';

vi.mock('@/api/query', () => ({
    getUsersQuery: vi.fn(() => ({
        queryKey: ['users', 'role=Editor&archiv=false'],
        queryFn: vi.fn().mockResolvedValue({ data: { data: [] } })
    }))
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: [], isLoading: false }))
}));

const mockStudent = {
    _id: 's1',
    firstname: 'Ivan',
    lastname: 'Zhao',
    editors: []
} as never;

describe('EditEditorsSubpage', () => {
    it('renders dialog when show=true', () => {
        render(
            <MemoryRouter>
                <EditEditorsSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/Editor for Ivan - Zhao/i)
        ).toBeInTheDocument();
    });

    it('does not render dialog content when show=false', () => {
        render(
            <MemoryRouter>
                <EditEditorsSubpage
                    onHide={vi.fn()}
                    show={false}
                    student={mockStudent}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.queryByText(/Editor for Ivan - Zhao/i)
        ).not.toBeInTheDocument();
    });

    it('shows loading spinner before data is loaded', async () => {
        const { useQuery } = await import('@tanstack/react-query');
        vi.mocked(useQuery).mockReturnValueOnce({
            data: undefined,
            isLoading: true
        } as ReturnType<typeof useQuery>);
        render(
            <MemoryRouter>
                <EditEditorsSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
