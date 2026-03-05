import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationOverviewTabs from './ApplicationOverviewTabs';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));
vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false)
}));
vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: (_id: string, _hash: string) =>
            `/student/${_id}`,
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`,
        PROFILE_HASH: '#profile'
    }
}));
vi.mock('@hooks/useStudents', () => ({
    default: vi.fn(() => ({
        res_modal_status: 0,
        res_modal_message: '',
        ConfirmError: vi.fn(),
        students: [],
        submitUpdateAgentlist: vi.fn(),
        submitUpdateEditorlist: vi.fn(),
        submitUpdateAttributeslist: vi.fn(),
        updateStudentArchivStatus: vi.fn()
    }))
}));
vi.mock(
    '@components/ApplicationProgressCard/ApplicationProgressCardBody',
    () => ({
        default: () => <div data-testid="app-progress-card-body" />
    })
);
vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({ children, index, value }: any) =>
        index === value ? <div>{children}</div> : null,
    a11yProps: (_value: number, index: number) => ({
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`
    })
}));
vi.mock('./ProgramUpdateStatusTable', () => ({
    default: () => <div data-testid="program-update-status-table" />
}));
vi.mock('@components/MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="mui-data-grid" />
}));
vi.mock('@components/Charts/TasksDistributionBarChart', () => ({
    default: () => <div data-testid="tasks-distribution-bar-chart" />
}));
vi.mock('../StudentDatabase/StudentsTable', () => ({
    StudentsTable: () => <div data-testid="students-table" />
}));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));
vi.mock('../Utils/util_functions', () => ({
    frequencyDistribution: vi.fn(() => ({})),
    programs_refactor_v2: vi.fn(() => []),
    student_transform: vi.fn(() => [])
}));
vi.mock('@utils/contants', () => ({
    DECISION_STATUS_E: {
        UNKNOWN_SYMBOL: '?',
        OK_SYMBOL: 'OK',
        NOT_OK_SYMBOL: 'X'
    },
    SUBMISSION_STATUS_E: {
        UNKNOWN_SYMBOL: '?',
        OK_SYMBOL: 'OK',
        NOT_OK_SYMBOL: 'X'
    }
}));

describe('ApplicationOverviewTabs', () => {
    test('renders tabs', () => {
        render(
            <MemoryRouter>
                <ApplicationOverviewTabs applications={[]} students={[]} />
            </MemoryRouter>
        );
        expect(
            screen.getByTestId(
                'application_overview_component_active_student_list_tab'
            )
        ).toBeInTheDocument();
    });

    test('renders bar chart', () => {
        render(
            <MemoryRouter>
                <ApplicationOverviewTabs applications={[]} students={[]} />
            </MemoryRouter>
        );
        expect(
            screen.getByTestId('tasks-distribution-bar-chart')
        ).toBeInTheDocument();
    });
});
