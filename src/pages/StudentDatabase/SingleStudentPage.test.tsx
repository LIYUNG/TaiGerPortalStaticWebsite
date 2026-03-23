import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({
        data: undefined,
        isLoading: false,
        refetch: vi.fn()
    })),
    useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
        isLoading: false
    })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        refetchQueries: vi.fn()
    }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => true),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    getLeadIdByUserId: vi.fn(() => Promise.resolve({ data: { data: null } })),
    createLeadFromStudent: vi.fn(),
    updateArchivStudents: vi.fn()
}));

vi.mock('@/api/query', () => ({
    getStudentAndDocLinksQuery: vi.fn(() => ({
        queryKey: ['student-doc-links'],
        queryFn: vi.fn()
    }))
}));

vi.mock('../Utils/util_functions', () => ({
    needGraduatedApplicantsButStudentNotGraduated: vi.fn(() => false),
    needGraduatedApplicantsPrograms: vi.fn(() => [])
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn(() => '2024-01-01'),
    programstatuslist: [],
    SINGLE_STUDENT_TABS: {},
    SINGLE_STUDENT_REVERSED_TABS: {},
    TENFOLD_AI_DOMAIN: 'https://tenfold.ai'
}));

vi.mock('../BaseDocuments/BaseDocumentStudentView', () => ({
    default: () => <div data-testid="base-document-student-view" />
}));

vi.mock('../CVMLRLCenter/EditorDocsProgress', () => ({
    default: () => <div data-testid="editor-docs-progress" />
}));

vi.mock('../UniAssist/UniAssistListCard', () => ({
    default: () => <div data-testid="uni-assist-list-card" />
}));

vi.mock('../Survey/SurveyComponent', () => ({
    default: () => <div data-testid="survey-component" />
}));

vi.mock('../Notes/index', () => ({
    default: () => <div data-testid="notes" />
}));

vi.mock(
    '@pages/Dashboard/MainViewTab/ApplicationProgress/ApplicationProgress',
    () => ({
        default: () => (
            <tr data-testid="application-progress">
                <td />
            </tr>
        )
    })
);

vi.mock('@pages/Dashboard/StudentDashboard/StudentDashboard', () => ({
    default: () => <div data-testid="student-dashboard" />
}));

vi.mock('../PortalCredentialPage', () => ({
    default: () => <div data-testid="portal-credential-page" />
}));

vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div data-testid="top-bar" />
}));

vi.mock('@components/Banner/ProgramLanguageNotMatchedBanner', () => ({
    default: () => <div data-testid="program-language-not-matched-banner" />
}));

vi.mock(
    '@components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner',
    () => ({
        default: () => <div data-testid="english-cert-expired-banner" />
    })
);

vi.mock(
    '@pages/Dashboard/MainViewTab/StudentBriefOverview/StudentBriefOverview',
    () => ({
        default: () => <div data-testid="student-brief-overview" />
    })
);

vi.mock('../Program/ProgramDetailsComparisonTable', () => ({
    default: () => <div data-testid="program-details-comparison-table" />
}));

vi.mock('../Audit', () => ({
    default: () => <div data-testid="audit" />
}));

vi.mock('./MeetingTab', () => ({
    MeetingTab: () => <div data-testid="meeting-tab" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({
        children,
        index,
        value
    }: {
        children: ReactNode;
        index: number;
        value: number;
    }) =>
        index === value ? (
            <div data-testid={`tab-panel-${index}`}>{children}</div>
        ) : null,
    a11yProps: vi.fn(() => ({}))
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        STUDENT_DATABASE_LINK: '/student-database',
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/123'),
        PROFILE_HASH: '#profile',
        PROFILE_STUDENT_LINK: vi.fn((id: string) => `/profile/${id}`),
        STUDENT_APPLICATIONS_ID_LINK: vi.fn(
            (id: string) => `/applications/${id}`
        ),
        COMMUNICATIONS_TAIGER_MODE_LINK: vi.fn((id: string) => `/comms/${id}`),
        CRM_LEAD_LINK: vi.fn((id: string) => `/crm/${id}`),
        COURSES_INPUT_LINK: vi.fn((id: string) => `/courses/${id}`),
        SINGLE_PROGRAM_LINK: vi.fn((id: string) => `/program/${id}`)
    }
}));

vi.mock('../../config', () => ({
    appConfig: { vpdEnable: false, companyName: 'TaiGer', meetingEnable: false }
}));

import { SingleStudentPageMainContent } from './SingleStudentPage';

const mockStudent = {
    _id: 'std1',
    firstname: 'John',
    lastname: 'Doe',
    firstname_chinese: '約翰',
    lastname_chinese: '道',
    agents: [],
    editors: [],
    applications: [],
    applying_program_count: 0,
    archiv: false,
    lastLoginAt: '2024-01-01',
    notification: {},
    academic_background: {},
    application_preference: {}
} as unknown;

const defaultProps = {
    survey_link: [],
    base_docs_link: '',
    data: mockStudent as never,
    audit: [],
    refetch: vi.fn()
};

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/#profile']}>
        <Routes>
            <Route path="/" element={children} />
        </Routes>
    </MemoryRouter>
);

describe('SingleStudentPageMainContent', () => {
    it('renders without crashing', () => {
        render(<SingleStudentPageMainContent {...defaultProps} />, { wrapper });
        expect(screen.getByTestId('student-brief-overview')).toBeTruthy();
    });

    it('renders breadcrumbs with student name', () => {
        render(<SingleStudentPageMainContent {...defaultProps} />, { wrapper });
        expect(screen.getByText(/John/)).toBeTruthy();
    });

    it('renders the program language not matched banner', () => {
        render(<SingleStudentPageMainContent {...defaultProps} />, { wrapper });
        expect(
            screen.getByTestId('program-language-not-matched-banner')
        ).toBeTruthy();
    });
});
