import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditInterviewTrainersSubpage from './EditInterviewTrainersSubpage';

vi.mock('@/api', () => ({
    getEssayWriters: vi.fn().mockResolvedValue({
        data: { data: [], success: true }
    })
}));

const makeInterview = () => ({
    _id: 'i1',
    program_id: {
        school: 'LMU',
        program_name: 'Physics',
        degree: 'Master',
        semester: 'SS'
    },
    student_id: { _id: 's1', firstname: 'Kate', lastname: 'Wang' },
    trainer_id: []
});

describe('EditInterviewTrainersSubpage', () => {
    it('renders dialog when show=true', () => {
        render(
            <MemoryRouter>
                <EditInterviewTrainersSubpage
                    actor="Interview Trainer"
                    interview={makeInterview() as never}
                    onHide={vi.fn()}
                    show={true}
                    submitUpdateInterviewTrainerlist={vi.fn()}
                />
            </MemoryRouter>
        );
        // Initially loading spinner is shown
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render dialog when show=false', () => {
        const { container } = render(
            <MemoryRouter>
                <EditInterviewTrainersSubpage
                    actor="Interview Trainer"
                    interview={makeInterview() as never}
                    onHide={vi.fn()}
                    show={false}
                    submitUpdateInterviewTrainerlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            container.querySelector('[role="dialog"]')
        ).not.toBeInTheDocument();
    });

    it('renders with empty trainer_id list', () => {
        render(
            <MemoryRouter>
                <EditInterviewTrainersSubpage
                    actor="Trainer"
                    interview={{ ...makeInterview(), trainer_id: [] } as never}
                    onHide={vi.fn()}
                    show={true}
                    submitUpdateInterviewTrainerlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
