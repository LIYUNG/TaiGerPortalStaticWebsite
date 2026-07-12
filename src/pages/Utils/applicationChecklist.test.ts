import { describe, it, expect, vi } from 'vitest';

vi.mock('@taiger-common/core', () => ({
    // Fixtures opt in explicitly; keeps these cases independent of how
    // submission is derived elsewhere.
    isProgramSubmitted: vi.fn(
        (application: { submitted?: boolean }) => application.submitted === true
    )
}));

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/docs/${id}`,
        SURVEY_LINK: '/survey',
        UNI_ASSIST_LINK: '/uni-assist',
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/student/${id}/apps`,
        PORTALS_MANAGEMENT_STUDENTID_LINK: (id: string) => `/portals/${id}`
    }
}));

import {
    buildApplicationChecklist,
    progressBarCounter
} from './applicationChecklist';

const thread = (id: string, isFinalVersion: boolean, file_type = 'CV') => ({
    doc_thread_id: { _id: { toString: () => id }, file_type },
    isFinalVersion
});

const build = (student: unknown, application: unknown) =>
    buildApplicationChecklist(student as never, application as never);

const progress = (student: unknown, application: unknown) =>
    progressBarCounter(student as never, application as never);

describe('buildApplicationChecklist', () => {
    it('always ends with a Submit row', () => {
        const items = build({}, { programId: {} });
        expect(items.at(-1)).toMatchObject({
            id: 'submit',
            label: 'Submit',
            state: 'missing'
        });
    });

    it('omits requirements the program does not ask for', () => {
        const items = build({}, { programId: { gre: '-', testdaf: '' } });
        expect(items.map((item) => item.id)).toEqual(['submit']);
    });

    it('includes a row per document thread, done when it is the final version', () => {
        const items = build(
            { generaldocs_threads: [thread('t1', true), thread('t2', false)] },
            {
                programId: {},
                doc_modification_thread: [thread('t3', false, 'ML_essay')]
            }
        );
        expect(items.map((item) => [item.id, item.state])).toEqual([
            ['general-t1', 'ok'],
            ['general-t2', 'missing'],
            ['program-t3', 'missing'],
            ['submit', 'missing']
        ]);
        // Underscores in the file type are humanised for program docs.
        expect(items[2].label).toBe('ML essay');
    });

    it('flags an English score that is below the program requirement', () => {
        const student = {
            academic_background: {
                language: {
                    english_isPassed: 'O',
                    english_certificate: 'TOEFL',
                    english_score: '80',
                    english_score_reading: '20',
                    english_score_listening: '20',
                    english_score_writing: '20',
                    english_score_speaking: '20'
                }
            }
        };
        const items = build(student, { programId: { toefl: '100' } });
        expect(items[0]).toMatchObject({
            id: 'english',
            state: 'warning',
            detail: 'TOEFL - 80'
        });
    });

    it('marks English ok when the score clears the requirement', () => {
        const student = {
            academic_background: {
                language: {
                    english_isPassed: 'O',
                    english_certificate: 'TOEFL',
                    english_score: '100',
                    english_score_reading: '25',
                    english_score_listening: '25',
                    english_score_writing: '25',
                    english_score_speaking: '25'
                }
            }
        };
        const items = build(student, { programId: { toefl: '90' } });
        expect(items[0]).toMatchObject({ id: 'english', state: 'ok' });
    });
});

// These lock the exact percentages the previous two-array implementation
// produced, quirks included, so the refactor is provably behaviour-preserving.
describe('progressBarCounter', () => {
    it('scores a bare application with nothing to do at 100%', () => {
        // Pre-existing quirk: the absent-portal branch awards a free point, so
        // an unsubmitted application with no requirements still reads 100%.
        expect(progress({}, { programId: {} })).toBe(100);
    });

    it('scores a typical in-progress application', () => {
        const student = {
            generaldocs_threads: [thread('t1', true), thread('t2', false)],
            academic_background: {
                language: {
                    english_isPassed: 'O',
                    english_certificate: 'TOEFL',
                    english_score: '100',
                    english_score_reading: '25',
                    english_score_listening: '25',
                    english_score_writing: '25',
                    english_score_speaking: '25'
                }
            }
        };
        const application = {
            programId: { toefl: '90', application_portal_a: 'portal-a' },
            credential_a_filled: true,
            doc_modification_thread: [thread('t3', false)],
            submitted: false
        };
        // 6 points: 2 general docs + English + portal + 1 program doc + submit.
        // 3 earned: t1, English, portal.
        expect(progress(student, application)).toBe(50);
    });

    it('counts a not-started Uni-Assist VPD as earned even though the row shows missing', () => {
        const application = {
            programId: { uni_assist: ['VPD'] },
            uni_assist: { status: 'notstarted' }
        };
        const items = build({}, application);
        expect(items[0]).toMatchObject({ id: 'uni-assist', state: 'missing' });
        // Pre-existing quirk preserved: earned anyway (only 'notneeded' scores 0).
        expect(progress({}, application)).toBe(100);
    });

    it('reaches 100% once everything is done and submitted', () => {
        const student = { generaldocs_threads: [thread('t1', true)] };
        const application = {
            programId: { application_portal_a: 'portal-a' },
            credential_a_filled: true,
            doc_modification_thread: [thread('t2', true)],
            submitted: true
        };
        expect(progress(student, application)).toBe(100);
    });
});
