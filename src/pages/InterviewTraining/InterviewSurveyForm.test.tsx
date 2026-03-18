import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false)
}));

vi.mock('@/api', () => ({
    getInterview: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: {
                    student_id: { firstname: 'Jane', lastname: 'Doe' },
                    program_id: {
                        school: 'MIT',
                        program_name: 'CS',
                        degree: 'MS',
                        semester: 'WS2025'
                    }
                }
            },
            status: 200
        })
    ),
    getInterviewSurvey: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: {
                    responses: [],
                    interviewQuestions: '',
                    interviewFeedback: '',
                    isFinal: false
                }
            },
            status: 200
        })
    ),
    updateInterviewSurvey: vi.fn(() =>
        Promise.resolve({ data: { success: true } })
    )
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: ({ res_status }: { res_status: number }) => (
        <div data-testid="error-page">{res_status}</div>
    )
}));

vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div data-testid="top-bar" />
}));

vi.mock('@components/Modal/ConfirmationModal', () => ({
    ConfirmationModal: () => <div data-testid="confirmation-modal" />
}));

vi.mock('@components/SurveyProvider/SurveyHeader', () => ({
    default: ({ title }: { title: string }) => (
        <div data-testid="survey-header">{title}</div>
    )
}));

vi.mock('@components/SurveyProvider/StepIndicators', () => ({
    default: () => <div data-testid="step-indicators" />
}));

vi.mock('@components/SurveyProvider/StepNavigation', () => ({
    default: () => <div data-testid="step-navigation" />
}));

vi.mock('@components/SurveyProvider/InterviewExperienceStep', () => ({
    default: () => <div data-testid="interview-experience-step" />
}));

vi.mock('@components/SurveyProvider/ProgramFeedbackStep', () => ({
    default: () => <div data-testid="program-feedback-step" />
}));

vi.mock('@components/SurveyProvider/FinalThoughtsStep', () => ({
    default: () => <div data-testid="final-thoughts-step" />
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        INTERVIEW_LINK: '/interviews',
        INTERVIEW_SINGLE_LINK: (id: string) => `/interviews/${id}`,
        INTERVIEW_SINGLE_SURVEY_LINK: (id: string) => `/interviews/${id}/survey`
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

import InterviewSurveyForm from './InterviewSurveyForm';

describe('InterviewSurveyForm', () => {
    it('renders Loading while data is being fetched', () => {
        render(
            <MemoryRouter initialEntries={['/interviews/iv1/survey']}>
                <Routes>
                    <Route
                        path="/interviews/:interview_id/survey"
                        element={<InterviewSurveyForm />}
                    />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeTruthy();
    });
});
