import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditAgentsSubpage from './EditAgentsSubpage';

vi.mock('@/api', () => ({
    getUsers: vi.fn().mockResolvedValue({
        data: { data: [], success: true }
    })
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

    it('shows loading spinner before data is loaded', () => {
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
        // Initially isLoaded=false so spinner should show
        expect(
            screen.getByRole('progressbar')
        ).toBeInTheDocument();
    });
});
