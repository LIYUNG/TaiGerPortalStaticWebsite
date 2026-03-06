import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import StudentTasksResponsive from './StudentTasksResponsive';

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        check_academic_background_filled: vi.fn(() => true),
        check_application_preference_filled: vi.fn(() => true),
        check_languages_filled: vi.fn(() => true),
        check_applications_to_decided: vi.fn(() => true),
        is_all_uni_assist_vpd_uploaded: vi.fn(() => true),
        are_base_documents_missing: vi.fn(() => false),
        to_register_application_portals: vi.fn(() => false),
        is_personal_data_filled: vi.fn(() => true),
        all_applications_results_updated: vi.fn(() => true),
        has_admissions: vi.fn(() => false),
        calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false }))
    };
});

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d: string) => d),
    isInTheFuture: vi.fn(() => true),
    COLORS: {},
    ATTRIBUTES: []
}));

vi.mock('@store/constant', () => ({
    default: {
        SURVEY_LINK: '/survey',
        COURSES_LINK: '/courses',
        STUDENT_APPLICATIONS_LINK: '/applications',
        UNI_ASSIST_LINK: '/uni-assist',
        BASE_DOCUMENTS_LINK: '/base-documents',
        PORTALS_MANAGEMENT_LINK: '/portals',
        VISA_DOCS_LINK: '/visa',
        DOCUMENT_MODIFICATION_LINK: vi.fn(() => '/document/d1'),
        PROFILE: '/profile'
    }
}));

vi.mock('../../../../config', () => ({
    appConfig: { vpdEnable: false }
}));

const makeStudent = () => ({
    _id: 'st1',
    firstname: 'Mary',
    lastname: 'Wu',
    applications: [],
    generaldocs_threads: [],
    academic_background: {
        university: {
            isGraduated: 'No'
        },
        language: {}
    },
    application_preference: {
        expected_application_date: '2025',
        expected_application_semester: 'WS'
    }
});

describe('StudentTasksResponsive', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StudentTasksResponsive
                            student={makeStudent() as never}
                            isCoursesFilled={true}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(container).toBeInTheDocument();
    });

    it('shows profile task when academic background is not filled', async () => {
        const {
            check_academic_background_filled
        } = await import('../../../Utils/util_functions');
        vi.mocked(check_academic_background_filled).mockReturnValue(false);

        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StudentTasksResponsive
                            student={makeStudent() as never}
                            isCoursesFilled={true}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('shows base document task when docs are missing', async () => {
        const {
            are_base_documents_missing
        } = await import('../../../Utils/util_functions');
        vi.mocked(are_base_documents_missing).mockReturnValue(true);

        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StudentTasksResponsive
                            student={makeStudent() as never}
                            isCoursesFilled={true}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText('My Documents')).toBeInTheDocument();
    });
});
