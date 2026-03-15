import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditAgentsSubpage from './EditAgentsSubpage';

vi.mock('@/api/query', () => ({
    getUsersQuery: vi.fn(() => ({
        queryKey: ['users', 'role=Agent&archiv=false'],
        queryFn: vi.fn().mockResolvedValue({ data: { data: [] } })
    }))
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: [], isLoading: false }))
}));

const mockStudent = {
    _id: 's1',
    firstname: 'Grace',
    lastname: 'Park',
    agents: []
} as never;

describe('EditAgentsSubpage', () => {
    it('renders dialog when show=true', () => {
        render(
            <MemoryRouter>
                <EditAgentsSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateAgentlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/Agent for Grace - Park/i)
        ).toBeInTheDocument();
    });

    it('does not show dialog content when show=false', () => {
        render(
            <MemoryRouter>
                <EditAgentsSubpage
                    onHide={vi.fn()}
                    show={false}
                    student={mockStudent}
                    submitUpdateAgentlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.queryByText(/Agent for Grace - Park/i)
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
                <EditAgentsSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateAgentlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
