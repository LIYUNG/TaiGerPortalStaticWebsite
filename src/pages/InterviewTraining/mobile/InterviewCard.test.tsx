import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InterviewCard } from './InterviewCard';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/student/${id}${hash}`,
        PROFILE_HASH: '#profile',
        INTERVIEW_SINGLE_LINK: (id: string) => `/interview/${id}`
    }
}));

const interview = {
    id: 'i1',
    _id: 'i1',
    student_id: 's1',
    firstname_lastname: 'John Doe',
    program_name: 'MIT - CS',
    status: 'Scheduled',
    trainer_name: 'Alice',
    start: '2025-06-01 10:00',
    interview_date: '2025-06-10 09:00',
    isDuplicate: false
};

const renderCard = (props = {}) => {
    const onAssign = vi.fn();
    render(
        <MemoryRouter>
            <InterviewCard
                canAssign={false}
                interview={interview}
                onAssign={onAssign}
                {...props}
            />
        </MemoryRouter>
    );
    return { onAssign };
};

describe('InterviewCard', () => {
    it('renders student + program links, status and the times', () => {
        renderCard();
        const student = screen.getByRole('link', { name: 'John Doe' });
        expect(student).toHaveAttribute('href', '/student/s1#profile');
        const program = screen.getByRole('link', { name: 'MIT - CS' });
        expect(program).toHaveAttribute('href', '/interview/i1');
        expect(screen.getByText('Scheduled')).toBeInTheDocument();
        expect(screen.getByText('2025-06-01 10:00')).toBeInTheDocument();
        expect(screen.getByText('2025-06-10 09:00')).toBeInTheDocument();
    });

    it('does not render an Assign button when canAssign is false', () => {
        renderCard();
        expect(
            screen.queryByRole('button', { name: /Assign/ })
        ).not.toBeInTheDocument();
    });

    it('fires onAssign with the interview when staff clicks Assign', () => {
        const { onAssign } = renderCard({ canAssign: true });
        fireEvent.click(screen.getByRole('button', { name: /Assign/ }));
        expect(onAssign).toHaveBeenCalledWith(interview);
    });
});
