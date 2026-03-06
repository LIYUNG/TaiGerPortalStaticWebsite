import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true)
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false }))
}));

vi.mock('@/api/query', () => ({
    getInterviewsByProgramIdQuery: vi.fn(() => ({ queryKey: ['programInterviews'], queryFn: vi.fn() })),
    getInterviewsByStudentIdQuery: vi.fn(() => ({ queryKey: ['studentInterviews'], queryFn: vi.fn() }))
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="child-loading" />
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d: string) => d),
    showTimezoneOffset: vi.fn(() => '+00:00')
}));

vi.mock('@store/constant', () => ({
    default: {
        INTERVIEW_SINGLE_SURVEY_LINK: (id: string) => `/interviews/${id}/survey`,
        INTERVIEW_SINGLE_LINK: (id: string) => `/interviews/${id}`
    }
}));

import { InterviewFeedback } from './InterviewFeedback';

const mockInterview = {
    _id: 'iv1',
    student_id: { _id: 's1', firstname: 'Jane', lastname: 'Doe' },
    program_id: { _id: 'p1', school: 'MIT', program_name: 'CS', degree: 'MS', semester: 'WS2025' },
    interview_date: '2025-01-01T10:00:00Z',
    surveyResponses: []
};

describe('InterviewFeedback', () => {
    it('renders Previous Interview Questionnaire section for TaiGer role', () => {
        render(
            <MemoryRouter>
                <InterviewFeedback interview={mockInterview} />
            </MemoryRouter>
        );
        expect(screen.getByText('Previous Interview Questionnaire')).toBeTruthy();
    });

    it('renders Student Interview Records section for TaiGer role', () => {
        render(
            <MemoryRouter>
                <InterviewFeedback interview={mockInterview} />
            </MemoryRouter>
        );
        expect(screen.getByText('Student Interview Records')).toBeTruthy();
    });
});
