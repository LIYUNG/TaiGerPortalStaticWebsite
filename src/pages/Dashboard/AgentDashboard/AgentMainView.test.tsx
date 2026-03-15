import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'u1',
        }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@hooks/useMyStudentsApplicationsV2', () => ({
    useMyStudentsApplicationsV2: vi.fn(() => ({
        data: { applications: [] },
        isLoading: false
    }))
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: vi.fn(() => ({ data: [], isLoading: false }))
}));

vi.mock('@hooks/useMyStudentsThreads', () => ({
    useMyStudentsThreads: vi.fn(() => ({
        data: { threads: [], success: false, status: 0 },
        isLoading: false
    }))
}));

vi.mock('@/api', () => ({
    updateAgentBanner: vi.fn(() =>
        Promise.resolve({ data: { success: true }, status: 200 })
    )
}));

vi.mock('../../Utils/util_functions', () => ({
    AGENT_SUPPORT_DOCUMENTS_A: [],
    isAnyCVNotAssigned: vi.fn(() => false),
    is_any_base_documents_uploaded: vi.fn(() => false),
    is_any_programs_ready_to_submit: vi.fn(() => false),
    is_any_vpd_missing_v2: vi.fn(() => false),
    open_tasks_v2: vi.fn(() => []),
    programs_refactor_v2: vi.fn(() => []),
    progressBarCounter: vi.fn(() => 0)
}));

vi.mock('@utils/contants', () => ({
    is_new_message_status: vi.fn(() => false),
    is_pending_status: vi.fn(() => false)
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

vi.mock('../MainViewTab/AgentTasks/NoProgramStudentTable', () => ({
    default: () => <div data-testid="no-program-student-table" />
}));

vi.mock('../MainViewTab/AgentTasks/BaseDocumentCheckingTable', () => ({
    default: () => <div data-testid="base-document-checking-table" />
}));

vi.mock('../MainViewTab/AgentTasks/ProgramSpecificDocumentCheckCard', () => ({
    default: () => <div data-testid="program-specific-document-check-card" />
}));

vi.mock(
    '@components/ApplicationProgressCard/ApplicationProgressCardBody',
    () => ({
        default: () => <div data-testid="app-progress-body" />
    })
);

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@store/constant', () => ({
    default: {
        AGENT_SUPPORT_DOCUMENTS: vi.fn(
            (tab: string) => `/agent-support/${tab}`
        ),
        STUDENT_APPLICATIONS_LINK: '/student-applications',
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/123'),
        PROFILE_HASH: '#profile'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { vpdEnable: false, companyName: 'TaiGer' }
}));

import AgentMainView from './AgentMainView';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('AgentMainView', () => {
    it('renders without crashing', () => {
        render(<AgentMainView />, { wrapper });
        expect(screen.getByTestId('program-report-card')).toBeTruthy();
    });

    it('renders the ProgramSpecificDocumentCheckCard', () => {
        render(<AgentMainView />, { wrapper });
        expect(
            screen.getByTestId('program-specific-document-check-card')
        ).toBeTruthy();
    });

    // it('renders the NoEnoughDecidedProgramsTasksCard', () => {
    //     render(<AgentMainView />, { wrapper });
    //     expect(
    //         screen.getByTestId('no-enough-decided-programs-tasks-card')
    //     ).toBeTruthy();
    // });
});
