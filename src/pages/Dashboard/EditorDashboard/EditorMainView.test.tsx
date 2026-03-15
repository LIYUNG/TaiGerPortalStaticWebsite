import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({
        data: { threads: [], data: { isManager: false } },
        isLoading: false
    })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Editor', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => true),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: vi.fn(() => ({ data: [], isLoading: false }))
}));

vi.mock('@hooks/useTasksOverview', () => ({
    useTasksOverview: vi.fn(() => ({ data: undefined }))
}));

vi.mock('@hooks/useMyStudentsThreads', () => ({
    useMyStudentsThreads: vi.fn(() => ({
        data: { threads: [], success: false, status: 0 },
        isLoading: false
    }))
}));

vi.mock('@/api/query', () => ({
    getIsManagerQuery: vi.fn(() => ({
        queryKey: ['isManager'],
        queryFn: vi.fn()
    }))
}));

vi.mock('../../Utils/util_functions', () => ({
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'essay_required' },
    open_tasks_v2: vi.fn(() => []),
    frequencyDistribution: vi.fn(() => ({}))
}));

vi.mock('@utils/contants', () => ({
    is_new_message_status: vi.fn(() => false),
    is_pending_status: vi.fn(() => false)
}));

vi.mock('@components/Charts/TasksDistributionBarChart', () => ({
    default: () => <div data-testid="tasks-distribution-bar-chart" />
}));

vi.mock('../MainViewTab/Common/AssignEssayWriterRow', () => ({
    default: () => (
        <tr data-testid="assign-essay-writer-row">
            <td />
        </tr>
    )
}));

vi.mock('../MainViewTab/Common/AssignEditorRow', () => ({
    default: () => (
        <tr data-testid="assign-editor-row">
            <td />
        </tr>
    )
}));

vi.mock('../MainViewTab/Common/AssignInterviewTrainerRow', () => ({
    default: () => (
        <tr data-testid="assign-interview-trainer-row">
            <td />
        </tr>
    )
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@store/constant', () => ({
    default: {
        CV_ML_RL_CENTER_LINK_TAB: vi.fn((tab: string) => `/cv-ml-rl/${tab}`),
        STUDENT_APPLICATIONS_LINK: '/student-applications',
        CV_ML_RL_DASHBOARD_LINK: '/cv-ml-rl-dashboard'
    }
}));

import EditorMainView from './EditorMainView';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('EditorMainView', () => {
    it('renders without crashing', () => {
        render(<EditorMainView />, { wrapper });
        expect(screen.getByTestId('tasks-distribution-bar-chart')).toBeTruthy();
    });

    it('renders the workload chart section', () => {
        render(<EditorMainView />, { wrapper });
        expect(screen.getByText('My workload over time')).toBeTruthy();
    });

    it('renders action required card', () => {
        render(<EditorMainView />, { wrapper });
        expect(screen.getByText('Action required')).toBeTruthy();
    });
});
