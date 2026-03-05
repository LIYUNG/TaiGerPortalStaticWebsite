import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => true),
    is_TaiGer_role: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@hooks/useApplicationStudent', () => ({
    useApplicationStudent: vi.fn(() => ({
        data: {
            _id: 'std1',
            firstname: 'John',
            lastname: 'Doe',
            agents: [],
            applications: [],
            notification: {
                isRead_survey_not_complete: true,
                isRead_new_agent_assigned: true,
                isRead_new_editor_assigned: true,
                isRead_new_cvmlrl_messsage: true,
                isRead_new_cvmlrl_tasks_created: true,
                isRead_new_programs_assigned: true,
                isRead_base_documents_missing: true,
                isRead_base_documents_rejected: true,
                isRead_uni_assist_task_assigned: true
            },
            academic_background: {}
        },
        archiv: false,
        isLoading: false
    }))
}));

vi.mock('@/api', () => ({
    updateBanner: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 }))
}));

vi.mock('../../Utils/util_functions', () => ({
    check_academic_background_filled: vi.fn(() => true),
    check_applications_to_decided: vi.fn(() => true),
    is_all_uni_assist_vpd_uploaded: vi.fn(() => true),
    are_base_documents_missing: vi.fn(() => false),
    isBaseDocumentsRejected: vi.fn(() => false),
    needGraduatedApplicantsButStudentNotGraduated: vi.fn(() => false),
    needGraduatedApplicantsPrograms: vi.fn(() => [])
}));

vi.mock('../MainViewTab/RespondedThreads/RespondedThreads', () => ({
    default: () => <tr data-testid="responded-threads"><td /></tr>
}));

vi.mock('../MainViewTab/StudentTasks/StudentTasksResponsive', () => ({
    default: () => <tr data-testid="student-tasks-responsive"><td /></tr>
}));

vi.mock('../../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/ApplicationProgressCard/ApplicationProgressCard', () => ({
    default: () => <div data-testid="application-progress-card" />
}));

vi.mock('@components/Banner/ProgramLanguageNotMatchedBanner', () => ({
    default: () => <div data-testid="program-language-not-matched-banner" />
}));

vi.mock('@components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner', () => ({
    default: () => <div data-testid="english-cert-expired-banner" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../../config', () => ({
    appConfig: { vpdEnable: false, companyName: 'TaiGer', meetingEnable: false }
}));

vi.mock('@store/constant', () => ({
    default: {
        SURVEY_LINK: '/survey',
        UNI_ASSIST_LINK: '/uni-assist',
        STUDENT_APPLICATIONS_LINK: '/student-applications',
        BASE_DOCUMENTS_LINK: '/base-documents',
        CV_ML_RL_CENTER_LINK_TAB: vi.fn((tab: string) => `/cv-ml-rl/${tab}`),
        SINGLE_PROGRAM_LINK: vi.fn((id: string) => `/program/${id}`),
        EVENT_STUDENT_STUDENTID_LINK: vi.fn((id: string) => `/event/${id}`)
    }
}));

import StudentDashboard from './StudentDashboard';

const mockStudent = {
    _id: 'std1',
    firstname: 'John',
    lastname: 'Doe',
    agents: [],
    applications: [],
    notification: {}
} as unknown;

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/dashboard/std1']}>
        <Routes>
            <Route path="/dashboard/:studentId" element={children} />
        </Routes>
    </MemoryRouter>
);

describe('StudentDashboard', () => {
    it('renders without crashing', () => {
        render(<StudentDashboard isCoursesFilled={true} student={mockStudent as never} />, { wrapper });
        expect(screen.getByTestId('program-language-not-matched-banner')).toBeTruthy();
    });

    it('renders the english cert expired banner', () => {
        render(<StudentDashboard isCoursesFilled={true} student={mockStudent as never} />, { wrapper });
        expect(screen.getByTestId('english-cert-expired-banner')).toBeTruthy();
    });

    it('renders student tasks table', () => {
        render(<StudentDashboard isCoursesFilled={true} student={mockStudent as never} />, { wrapper });
        expect(screen.getByTestId('student-tasks-responsive')).toBeTruthy();
    });
});
