import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Manager',
            _id: 'u1',
            agent_notification: { isRead_new_base_docs_uploaded: [] }
        }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@/api', () => ({
    updateAgentBanner: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 }))
}));

vi.mock('../../Utils/util_functions', () => ({
    anyStudentWithoutApplicationSelection: vi.fn(() => false),
    isAnyCVNotAssigned: vi.fn(() => false),
    is_any_base_documents_uploaded: vi.fn(() => false),
    is_any_programs_ready_to_submit: vi.fn(() => false),
    is_any_vpd_missing: vi.fn(() => false),
    programs_refactor: vi.fn(() => []),
    progressBarCounter: vi.fn(() => 0)
}));

vi.mock('@utils/contants', () => ({
    academic_background_header: {}
}));

vi.mock('../../Program/ProgramReportCard', () => ({
    default: () => <div data-testid="program-report-card" />
}));

vi.mock('../MainViewTab/AgentTasks/CVAssignTasksCard', () => ({
    default: () => <div data-testid="cv-assign-tasks-card" />
}));

vi.mock('../MainViewTab/AgentTasks/ReadyToSubmitTasksCard', () => ({
    default: () => <div data-testid="ready-to-submit-tasks-card" />
}));

vi.mock('../MainViewTab/AgentTasks/NoEnoughDecidedProgramsTasksCard', () => ({
    default: () => <div data-testid="no-enough-decided-programs-tasks-card" />
}));

vi.mock('../MainViewTab/AgentTasks/VPDToSubmitTasksCard', () => ({
    default: () => <div data-testid="vpd-to-submit-tasks-card" />
}));

vi.mock('../MainViewTab/AgentTasks/BaseDocumentCheckingTasks', () => ({
    default: () => <tr data-testid="base-document-checking-tasks"><td /></tr>
}));

vi.mock('../MainViewTab/AgentTasks/NoProgramStudentTask', () => ({
    default: () => <tr data-testid="no-program-student-task"><td /></tr>
}));

vi.mock('../MainViewTab/StudentsAgentEditor/StudentsAgentEditor', () => ({
    default: () => <tr data-testid="students-agent-editor"><td /></tr>
}));

vi.mock('@components/Banner/Banner', () => ({
    default: () => <div data-testid="banner" />
}));

vi.mock('@components/ApplicationProgressCard/ApplicationProgressCardBody', () => ({
    default: () => <div data-testid="app-progress-body" />
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/123'),
        PROFILE_HASH: '#profile'
    }
}));

import ManagerMainView from './ManagerMainView';

const defaultProps = {
    notification: { isRead_new_base_docs_uploaded: [] } as unknown as Notification[],
    students: [],
    documentslist: [],
    isDashboard: true,
    submitUpdateAgentlist: vi.fn(),
    updateAgentList: vi.fn()
};

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('ManagerMainView', () => {
    it('renders without crashing', () => {
        render(<ManagerMainView {...defaultProps} />, { wrapper });
        expect(screen.getByTestId('no-enough-decided-programs-tasks-card')).toBeTruthy();
    });

    it('renders the ProgramReportCard', () => {
        render(<ManagerMainView {...defaultProps} />, { wrapper });
        expect(screen.getByTestId('program-report-card')).toBeTruthy();
    });

    it('renders the upcoming applications section', () => {
        render(<ManagerMainView {...defaultProps} />, { wrapper });
        // The text is split across elements: "Upcoming Applications" + " (Decided):"
        const matches = screen.getAllByText((content) =>
            content.includes('Upcoming Applications')
        );
        expect(matches.length).toBeGreaterThan(0);
    });
});
