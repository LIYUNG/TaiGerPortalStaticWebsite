import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="mui-data-grid" />
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string) => `/students/${id}`,
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/students/${id}/apps`,
        PORTALS_MANAGEMENT_STUDENTID_LINK: (id: string) => `/portals/${id}`,
        COURSES_INPUT_LINK: (id: string) => `/courses/${id}`,
        TEAM_AGENT_LINK: (id: string) => `/agents/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editors/${id}`,
        PROFILE_HASH: '#profile',
        CVMLRL_HASH: '#cvmlrl',
        SURVEY_HASH: '#survey',
        UNIASSIST_HASH: '#uniassist'
    }
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false),
    ProfileNameType: { CV: 'CV', ML: 'ML', RL: 'RL' }
}));

vi.mock('@taiger-common/model', () => ({
    DocumentStatusType: { Missing: 'Missing', NotNeeded: 'NotNeeded', Accepted: 'Accepted' }
}));

vi.mock('@pages/Utils/util_functions', () => ({
    areProgramsDecidedMoreThanContract: vi.fn(() => false),
    check_academic_background_filled: vi.fn(() => false),
    check_all_decided_applications_submitted: vi.fn(() => false),
    check_english_language_Notneeded: vi.fn(() => false),
    check_english_language_passed: vi.fn(() => false),
    check_german_language_Notneeded: vi.fn(() => false),
    check_german_language_passed: vi.fn(() => false),
    check_if_there_is_german_language_info: vi.fn(() => false),
    check_student_needs_uni_assist: vi.fn(() => false),
    getNextProgramDayleft: vi.fn(() => 30),
    getNextProgramDeadline: vi.fn(() => '2024-06-01'),
    getNextProgramName: vi.fn(() => 'TU Munich CS'),
    getNextProgramStatus: vi.fn(() => 'pending'),
    isCVFinished: vi.fn(() => false),
    isEnglishLanguageInfoComplete: vi.fn(() => false),
    isLanguageInfoComplete: vi.fn(() => false),
    is_all_uni_assist_vpd_uploaded: vi.fn(() => false),
    is_cv_assigned: vi.fn(() => false),
    needUpdateCourseSelection: vi.fn(() => 'no'),
    numApplicationsDecided: vi.fn(() => 0),
    numApplicationsSubmitted: vi.fn(() => 0),
    num_uni_assist_vpd_needed: vi.fn(() => 0),
    num_uni_assist_vpd_uploaded: vi.fn(() => 0),
    prepTaskStudent: vi.fn((s: any) => ({ firstname_lastname: `${s.firstname} ${s.lastname}` })),
    to_register_application_portals: vi.fn(() => false),
    has_admissions: vi.fn(() => false)
}));

vi.mock('@utils/contants', () => ({
    COLORS: {},
    FILE_MISSING_SYMBOL: '✗',
    FILE_OK_SYMBOL: '✓'
}));

import StudentOverviewTable from './index';

describe('StudentOverviewTable', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <StudentOverviewTable students={[]} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('mui-data-grid')).toBeDefined();
    });
});

describe('StudentOverviewTable with loading', () => {
    it('renders in loading state', () => {
        render(
            <MemoryRouter>
                <StudentOverviewTable isLoading={true} students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeDefined();
    });

    it('renders with null students', () => {
        render(
            <MemoryRouter>
                <StudentOverviewTable students={null} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeDefined();
    });
});
