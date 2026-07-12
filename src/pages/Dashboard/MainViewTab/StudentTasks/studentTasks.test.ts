import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TFunction } from 'i18next';
import type { IStudentResponse } from '@taiger-common/model';

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        SURVEY_LINK: '/survey',
        BASE_DOCUMENTS_LINK: '/base-documents',
        PROFILE: '/profile',
        COURSES_LINK: '/courses',
        STUDENT_APPLICATIONS_LINK: '/applications',
        PORTALS_MANAGEMENT_LINK: '/portals',
        UNI_ASSIST_LINK: '/uni-assist',
        VISA_DOCS_LINK: '/visa',
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/doc/${id}`
    }
}));

vi.mock('../../../../config', () => ({
    appConfig: { vpdEnable: false }
}));

// Each predicate is individually controllable so we can drive the task list.
// `vi.hoisted` lets the (hoisted) vi.mock factory reference these.
const mocks = vi.hoisted(() => ({
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
}));
vi.mock('../../../Utils/util_functions', () => mocks);

import { buildStudentTasks } from './studentTasks';

const t = ((key: string) => key) as unknown as TFunction;

const baseStudent = {
    _id: 'u1',
    application_preference: {},
    academic_background: { university: { isGraduated: 'Yes' } },
    generaldocs_threads: [],
    applications: []
} as unknown as IStudentResponse;

beforeEach(() => {
    Object.values(mocks).forEach((m) => m.mockClear());
    mocks.check_academic_background_filled.mockReturnValue(true);
    mocks.check_application_preference_filled.mockReturnValue(true);
    mocks.check_languages_filled.mockReturnValue(true);
    mocks.check_applications_to_decided.mockReturnValue(true);
    mocks.is_all_uni_assist_vpd_uploaded.mockReturnValue(true);
    mocks.are_base_documents_missing.mockReturnValue(false);
    mocks.to_register_application_portals.mockReturnValue(false);
    mocks.is_personal_data_filled.mockReturnValue(true);
    mocks.all_applications_results_updated.mockReturnValue(true);
    mocks.has_admissions.mockReturnValue(false);
});

describe('buildStudentTasks', () => {
    it('returns no tasks and full progress when everything is complete', () => {
        const { tasks, progress } = buildStudentTasks(baseStudent, true, t);
        expect(tasks).toHaveLength(0);
        expect(progress).toEqual({ done: 5, total: 5 });
    });

    it('surfaces the profile task first as urgent when the survey is incomplete', () => {
        mocks.check_academic_background_filled.mockReturnValue(false);
        const { tasks, progress } = buildStudentTasks(baseStudent, true, t);
        expect(tasks[0].id).toBe('profile');
        expect(tasks[0].priority).toBe('urgent');
        expect(tasks[0].to).toBe('/survey');
        // profile is one of 5 core steps -> now 4/5 done.
        expect(progress).toEqual({ done: 4, total: 5 });
    });

    it('orders editor-feedback threads ahead of onboarding tasks', () => {
        mocks.check_academic_background_filled.mockReturnValue(false); // profile task too
        const student = {
            ...baseStudent,
            generaldocs_threads: [
                {
                    isFinalVersion: false,
                    latest_message_left_by_id: 'editor-x',
                    doc_thread_id: { _id: 'th1', file_type: 'CV' }
                }
            ]
        } as unknown as IStudentResponse;
        const { tasks } = buildStudentTasks(student, true, t);
        expect(tasks[0].category).toBe('feedback');
        expect(tasks[0].to).toBe('/doc/th1');
        expect(tasks.some((task) => task.id === 'profile')).toBe(true);
    });

    it('does not raise a feedback task when the student replied last', () => {
        const student = {
            ...baseStudent,
            generaldocs_threads: [
                {
                    isFinalVersion: false,
                    latest_message_left_by_id: 'u1', // student is last -> their turn is done
                    doc_thread_id: { _id: 'th1', file_type: 'CV' }
                }
            ]
        } as unknown as IStudentResponse;
        const { tasks } = buildStudentTasks(student, true, t);
        expect(tasks.some((task) => task.category === 'feedback')).toBe(false);
    });

    it('excludes courses from progress when the student is not graduated', () => {
        // isGraduated 'No' -> courses step does not apply; total core steps = 4.
        const notGraduated = {
            ...baseStudent,
            academic_background: { university: { isGraduated: 'No' } }
        } as unknown as IStudentResponse;
        const { progress } = buildStudentTasks(notGraduated, false, t);
        expect(progress.total).toBe(4);
    });
});
