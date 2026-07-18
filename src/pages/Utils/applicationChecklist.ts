import { isProgramSubmitted } from '@taiger-common/core';
import {
    DocumentStatusType,
    type IDocumentthreadWithId,
    type IProgramWithId,
    type IUserWithId
} from '@taiger-common/model';

import DEMO from '@store/constant';
import type { Application } from '@/api/types';

/**
 * One row of an application's checklist.
 *
 * This is the single source of truth for "what does this student still owe for
 * this application": ApplicationProgressCardBody renders these rows, and
 * progressBarCounter sums them. Previously the two were written out separately
 * — a hand-built JSX list and a pair of index-aligned number arrays — so adding
 * a requirement meant editing both, and they had already drifted apart (see the
 * QUIRK notes below).
 */
export interface ApplicationChecklistItem {
    /** React key; unique within one checklist. */
    id: string;
    /** Row label, as shown to the student. */
    label: string;
    /** Icon shown on the row. `warning` = supplied but doesn't meet the bar. */
    state: 'ok' | 'missing' | 'warning';
    /** Where the row navigates. */
    href: string;
    /** Trailing text after the label, e.g. "TOEFL - 100". */
    detail?: string;
    /** Rendered as a relative time after the label ("3 days ago"). */
    updatedAt?: string | Date;
    /** Hover text explaining a `warning` row. */
    title?: string;
    /** Contribution to the progress bar's denominator. */
    points: number;
    /** Contribution to the progress bar's numerator. */
    earned: number;
}

const isPassed = (value?: string) => value === 'O';

/** A program requirement is "not applicable" when unset or explicitly '-'. */
const isRequired = (requirement?: string | null): boolean =>
    Boolean(requirement) && requirement !== '-';

/**
 * Does the student's English certificate meet every section minimum the program
 * asks for? A missing or non-numeric score fails closed.
 */
export const isEnglishOK = (
    program: IProgramWithId,
    student: IUserWithId
): boolean => {
    const lang = student?.academic_background?.language || {};
    const {
        english_certificate,
        english_score,
        english_score_reading,
        english_score_listening,
        english_score_writing,
        english_score_speaking
    } = lang;
    // in case not number string
    if (
        ![
            english_score,
            english_score_reading,
            english_score_listening,
            english_score_writing,
            english_score_speaking
        ].every((score) => parseFloat(score ?? ''))
    ) {
        return false;
    }

    if (english_certificate === 'TOEFL') {
        if (
            parseFloat(program.toefl ?? '0') >
                parseFloat(english_score ?? '') ||
            (program.toefl_reading ?? 0) >
                parseFloat(english_score_reading ?? '') ||
            (program.toefl_listening ?? 0) >
                parseFloat(english_score_listening ?? '') ||
            (program.toefl_writing ?? 0) >
                parseFloat(english_score_writing ?? '') ||
            (program.toefl_speaking ?? 0) >
                parseFloat(english_score_speaking ?? '')
        ) {
            return false;
        }
    }
    if (english_certificate === 'IELTS') {
        if (
            parseFloat(program.ielts ?? '0') >
                parseFloat(english_score ?? '') ||
            (program.ielts_reading ?? 0) >
                parseFloat(english_score_reading ?? '') ||
            (program.ielts_listening ?? 0) >
                parseFloat(english_score_listening ?? '') ||
            (program.ielts_writing ?? 0) >
                parseFloat(english_score_writing ?? '') ||
            (program.ielts_speaking ?? 0) >
                parseFloat(english_score_speaking ?? '')
        ) {
            return false;
        }
    }

    return true;
};

/**
 * Do this program's requirements call for the student's *general* recommendation
 * letters?
 *
 * Two ways they don't: the program asks for no RLs at all (`rl_required` is a
 * count string — "0", "1", "2" — so unset or "0" means none), or it wants
 * program-specific letters (`is_rl_specific`), which live in the application's
 * own doc_modification_thread rather than the student's general docs. Mirrors
 * the `generalRLNotRequired` rule in GeneralRLRequirementsTab.
 */
export const isGeneralRLApplicable = (program?: IProgramWithId): boolean =>
    Boolean(program?.rl_required) &&
    program?.rl_required !== '0' &&
    !program?.is_rl_specific;

/**
 * Matches on the `Recommendation_Letter_` prefix rather than listing A and B, so
 * a third letter (Recommendation_Letter_C exists elsewhere in the app) is
 * covered too.
 */
const isRecommendationLetterThread = (thread: {
    doc_thread_id?: unknown;
}): boolean => {
    const docThread = thread.doc_thread_id as IDocumentthreadWithId | undefined;
    return Boolean(docThread?.file_type?.startsWith('Recommendation_Letter_'));
};

/** Row for a document thread, used for both general and program-specific docs. */
const threadItem = (
    idPrefix: string,
    thread: { doc_thread_id?: unknown; isFinalVersion?: boolean },
    formatLabel: (fileType: string) => string
): ApplicationChecklistItem | null => {
    const docThread = thread.doc_thread_id as IDocumentthreadWithId | undefined;
    const threadId = docThread?._id?.toString();
    if (!threadId) {
        return null;
    }
    const done = thread.isFinalVersion === true;
    return {
        id: `${idPrefix}-${threadId}`,
        label: formatLabel(docThread?.file_type ?? ''),
        state: done ? 'ok' : 'missing',
        href: DEMO.DOCUMENT_MODIFICATION_LINK(threadId),
        updatedAt: docThread?.updatedAt,
        points: 1,
        earned: done ? 1 : 0
    };
};

/** Row for a standardised test the program requires (German, GRE, GMAT). */
const testItem = (
    id: string,
    label: string,
    requirement: string | undefined,
    passed: string | undefined
): ApplicationChecklistItem | null => {
    if (!isRequired(requirement)) {
        return null;
    }
    const done = isPassed(passed);
    return {
        id,
        label,
        state: done ? 'ok' : 'missing',
        href: DEMO.SURVEY_LINK,
        points: 1,
        earned: done ? 1 : 0
    };
};

const englishItem = (
    program: IProgramWithId,
    student: IUserWithId
): ApplicationChecklistItem | null => {
    if (!program?.ielts && !program?.toefl) {
        return null;
    }
    const language = student?.academic_background?.language;
    const base = {
        id: 'english',
        label: 'English',
        href: DEMO.SURVEY_LINK,
        points: 1
    };

    if (!isPassed(language?.english_isPassed)) {
        return {
            ...base,
            state: 'missing',
            detail: language?.english_test_date,
            earned: 0
        };
    }

    const detail = [language?.english_certificate, language?.english_score]
        .filter(Boolean)
        .join(' - ');

    // Passed the test, but the score is below what this program asks for.
    if (!isEnglishOK(program, student)) {
        return {
            ...base,
            state: 'warning',
            detail,
            title: 'English Requirements not met with your input in Profile',
            earned: 0
        };
    }

    return { ...base, state: 'ok', detail, earned: 1 };
};

const portalItem = (
    program: IProgramWithId,
    application: Application,
    studentId: string
): ApplicationChecklistItem | null => {
    const { application_portal_a: portalA, application_portal_b: portalB } =
        program ?? {};
    if (!portalA && !portalB) {
        return null;
    }
    const missingCredential =
        (portalA && !application.credential_a_filled) ||
        (portalB && !application.credential_b_filled);
    return {
        id: 'portal',
        label: 'Register University Portal',
        state: missingCredential ? 'missing' : 'ok',
        href: DEMO.PORTALS_MANAGEMENT_STUDENTID_LINK(studentId),
        points: 1,
        earned: missingCredential ? 0 : 1
    };
};

const uniAssistItem = (
    program: IProgramWithId,
    application: Application
): ApplicationChecklistItem | null => {
    if (!(program?.uni_assist as string[] | undefined)?.includes('VPD')) {
        return null;
    }
    const status = application?.uni_assist?.status;
    return {
        id: 'uni-assist',
        label: 'Uni-Assist VPD',
        state: status === 'notstarted' ? 'missing' : 'ok',
        href: DEMO.UNI_ASSIST_LINK,
        updatedAt: application?.uni_assist?.updatedAt,
        points: 1,
        // QUIRK (pre-existing): the bar counts any status other than NotNeeded
        // as earned — including 'notstarted', which the row itself shows as
        // missing. Kept as-is so percentages don't move; see the module docs.
        earned: status === DocumentStatusType.NotNeeded ? 0 : 1
    };
};

/**
 * Every checklist row for one application, in display order.
 */
export const buildApplicationChecklist = (
    student: IUserWithId,
    application: Application
): ApplicationChecklistItem[] => {
    const program = application?.programId as unknown as IProgramWithId;
    const language = student?.academic_background?.language;
    const studentId = student?._id?.toString() ?? '';

    const generalRLApplicable = isGeneralRLApplicable(program);

    const items: (ApplicationChecklistItem | null)[] = [
        ...(student?.generaldocs_threads ?? [])
            // A general RL is only this application's business when the program
            // actually wants generic letters; otherwise it is noise on the
            // checklist and a phantom point on the progress bar.
            .filter(
                (thread) =>
                    generalRLApplicable || !isRecommendationLetterThread(thread)
            )
            .map((thread) =>
                threadItem('general', thread, (fileType) => fileType)
            ),
        englishItem(program, student),
        testItem(
            'german',
            'German',
            program?.testdaf,
            language?.german_isPassed
        ),
        testItem('gre', 'GRE', program?.gre, language?.gre_isPassed),
        testItem('gmat', 'GMAT', program?.gmat, language?.gmat_isPassed),
        portalItem(program, application, studentId),
        ...(application?.doc_modification_thread ?? []).map((thread) =>
            threadItem('program', thread, (fileType) =>
                fileType.replace(/_/g, ' ')
            )
        ),
        uniAssistItem(program, application),
        {
            id: 'submit',
            label: 'Submit',
            state: isProgramSubmitted(application) ? 'ok' : 'missing',
            href: DEMO.STUDENT_APPLICATIONS_ID_LINK(studentId),
            points: 1,
            earned: isProgramSubmitted(application) ? 1 : 0
        }
    ];

    return items.filter((item): item is ApplicationChecklistItem =>
        Boolean(item)
    );
};

/**
 * Completion percentage (0-100, floored) for one application — the number
 * behind the card's progress bar. Derived from the same checklist the student
 * sees, so the bar and the rows can no longer disagree about what's required.
 */
export const progressBarCounter = (
    student: IUserWithId,
    application: Application
): number => {
    const items = buildApplicationChecklist(student, application);
    const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
    const earnedPoints = items.reduce((sum, item) => sum + item.earned, 0);

    // QUIRK (pre-existing): a program with no application portal still scores a
    // free point, because the old counter's portal expression fell through to 1
    // when there was no portal to check. Kept so percentages don't move.
    const program = application?.programId;
    const hasPortal = Boolean(
        program?.application_portal_a || program?.application_portal_b
    );
    const freePortalPoint = hasPortal ? 0 : 1;

    if (totalPoints === 0) {
        return 0;
    }
    return Math.floor(((earnedPoints + freePortalPoint) / totalPoints) * 100);
};
