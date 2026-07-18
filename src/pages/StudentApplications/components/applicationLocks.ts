import { isProgramSubmitted } from '@taiger-common/core';

import {
    is_program_ml_rl_essay_ready,
    is_the_uni_assist_vpd_uploaded,
    isCVFinished
} from '../../Utils/util_functions';
import { appConfig } from '../../../config';
import type { Application } from '@/api/types';
import type { IStudentResponse } from '@taiger-common/model';

/**
 * Which of an application's status dropdowns may still be edited.
 *
 * Shared by the desktop table row and the student card so the two can never
 * disagree about what is editable — the rules encode a one-way lifecycle:
 * decided -> submitted -> offer result -> final enrolment. Reopening an earlier
 * step after a later one is recorded would strand the later value on a control
 * that no longer renders.
 */
export interface ApplicationLocks {
    isFinalEnrolment: boolean;
    hasAdmissionResult: boolean;
    canUpdateSubmission: boolean;
    canUpdateAdmission: boolean;
    /** Untranslated reason, or '' when the control is editable. */
    submissionLockReason: string;
    admissionLockReason: string;
}

export const FINAL_ENROLMENT_LOCK_REASON =
    'Final enrolment is confirmed for this program.';
export const ADMISSION_RESULT_LOCK_REASON =
    'An offer result is already recorded for this program.';

export const getApplicationLocks = (
    application: Application
): ApplicationLocks => {
    const isFinalEnrolment = application.finalEnrolment ?? false;
    const hasAdmissionResult =
        application.admission === 'O' || application.admission === 'X';

    return {
        isFinalEnrolment,
        hasAdmissionResult,
        canUpdateSubmission: !hasAdmissionResult && !isFinalEnrolment,
        canUpdateAdmission:
            application.closed !== '-' &&
            application.closed !== 'X' &&
            !isFinalEnrolment,
        submissionLockReason: isFinalEnrolment
            ? FINAL_ENROLMENT_LOCK_REASON
            : hasAdmissionResult
              ? ADMISSION_RESULT_LOCK_REASON
              : '',
        admissionLockReason: isFinalEnrolment ? FINAL_ENROLMENT_LOCK_REASON : ''
    };
};

/**
 * May the student mark this application submitted yet? Everything the agency
 * needs finished first — CV, ML/RL/essays, and (where enabled) the uni-assist
 * VPD. Already-submitted applications stay unlocked so the value can be seen.
 */
export const isReadyToSubmit = (
    application: Application,
    student: IStudentResponse
): boolean =>
    isProgramSubmitted(application) ||
    (is_program_ml_rl_essay_ready(application) &&
        isCVFinished(student) &&
        (!appConfig.vpdEnable || is_the_uni_assist_vpd_uploaded(application)));

/** The blockers behind a locked submission control, for an explanatory message. */
export const getSubmitBlockers = (
    application: Application,
    student: IStudentResponse
): string[] => {
    const blockers: string[] = [];
    if (!isCVFinished(student)) blockers.push('CV');
    if (!is_program_ml_rl_essay_ready(application))
        blockers.push('ML/RL/Essay');
    if (appConfig.vpdEnable && !is_the_uni_assist_vpd_uploaded(application)) {
        blockers.push('Uni-Assist');
    }
    return blockers;
};
