import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
    default: { t: (k: string) => k }
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

vi.mock('@/api', () => ({
    updateInterview: vi.fn()
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@pages/Dashboard/MainViewTab/NoTrainersInterviewsCard/NoTrainersInterviewsCard', () => ({
    default: () => <tr data-testid="no-trainers-card"><td /></tr>
}));

import AssignInterviewTrainersPage from './AssignInterviewTrainersPage';

const mockInterviews = [
    {
        _id: 'i1',
        trainer_id: [],
        student_id: { _id: 's1', firstname: 'Jane', lastname: 'Doe' },
        program_id: { school: 'MIT', program_name: 'CS' }
    }
] as any;

describe('AssignInterviewTrainersPage', () => {
    it('renders without crashing with empty interviews', () => {
        render(
            <MemoryRouter>
                <AssignInterviewTrainersPage interviews={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No Interview Trainer/i)).toBeTruthy();
    });

    it('renders interview trainer cards', () => {
        render(
            <MemoryRouter>
                <AssignInterviewTrainersPage interviews={mockInterviews} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('no-trainers-card')).toBeTruthy();
    });

    it('does not render modal by default', () => {
        render(
            <MemoryRouter>
                <AssignInterviewTrainersPage interviews={[]} />
            </MemoryRouter>
        );
        expect(screen.queryByTestId('modal-main')).toBeNull();
    });
});
