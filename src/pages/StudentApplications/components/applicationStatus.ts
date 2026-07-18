import {
    isProgramAdmitted,
    isProgramDecided,
    isProgramRejected,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';
import type { Application } from '@/api/types';

/**
 * Application states, as a funnel rather than a set of exclusive buckets: an
 * admitted application is still a decided and a submitted one, so filtering by
 * "Decided" must include everything that progressed past it. Counts therefore
 * overlap by design — `decided` >= `submitted` >= `admitted` — and only "All"
 * equals the row count.
 */
export type ApplicationStatus =
    | 'pending'
    | 'decided'
    | 'inProgress'
    | 'submitted'
    | 'admitted'
    | 'rejected'
    | 'enrolled'
    | 'withdrawn';

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
    'pending',
    'decided',
    'inProgress',
    'submitted',
    'admitted',
    'rejected',
    'enrolled',
    'withdrawn'
];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
    pending: 'Not decided',
    decided: 'Decided',
    inProgress: 'Not submitted yet',
    submitted: 'Submitted',
    admitted: 'Admitted',
    rejected: 'Rejected',
    enrolled: 'Enrolled',
    withdrawn: 'Withdrawn'
};

export const APPLICATION_STATUS_COLOR: Record<
    ApplicationStatus,
    | 'default'
    | 'info'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
> = {
    pending: 'default',
    decided: 'info',
    inProgress: 'secondary',
    submitted: 'primary',
    admitted: 'success',
    rejected: 'error',
    enrolled: 'success',
    withdrawn: 'warning'
};

/**
 * Inclusive membership tests — each asks only "did it reach this state?", never
 * "is this its furthest state?".
 */
const APPLICATION_STATUS_PREDICATE: Record<
    ApplicationStatus,
    (application: Application) => boolean
> = {
    pending: (application) => !isProgramDecided(application),
    decided: (application) => isProgramDecided(application),
    // The actionable working set: committed to, still being worked on. Decided
    // is a prerequisite — an undecided program is not "in progress", it is
    // waiting on the decision itself. Unlike its neighbours this one is a
    // current-stage test rather than a cumulative one, since an application
    // that reached submission has left it.
    inProgress: (application) =>
        isProgramDecided(application) &&
        !isProgramSubmitted(application) &&
        !isProgramWithdraw(application),
    submitted: (application) => isProgramSubmitted(application),
    admitted: (application) => isProgramAdmitted(application),
    rejected: (application) => isProgramRejected(application),
    enrolled: (application) => Boolean(application.finalEnrolment),
    withdrawn: (application) => isProgramWithdraw(application)
};

export const matchesApplicationStatus = (
    application: Application,
    status: ApplicationStatus
): boolean => APPLICATION_STATUS_PREDICATE[status](application);

/**
 * The single furthest stage an application reached — for a one-chip summary,
 * where the funnel predicates above would light up several at once. Resolved
 * most-advanced-first; withdrawn wins outright because it takes the application
 * out of play regardless of how far it had progressed.
 */
export const getApplicationStage = (
    application: Application
): ApplicationStatus => {
    if (isProgramWithdraw(application)) return 'withdrawn';
    if (application.finalEnrolment) return 'enrolled';
    if (isProgramAdmitted(application)) return 'admitted';
    if (isProgramRejected(application)) return 'rejected';
    if (isProgramSubmitted(application)) return 'submitted';
    if (isProgramDecided(application)) return 'decided';
    return 'pending';
};

export const countApplicationStatuses = (
    applications: Application[]
): Record<ApplicationStatus, number> => {
    const counts = {
        pending: 0,
        decided: 0,
        inProgress: 0,
        submitted: 0,
        admitted: 0,
        rejected: 0,
        enrolled: 0,
        withdrawn: 0
    } as Record<ApplicationStatus, number>;

    for (const application of applications) {
        for (const status of APPLICATION_STATUS_ORDER) {
            if (matchesApplicationStatus(application, status)) {
                counts[status] += 1;
            }
        }
    }
    return counts;
};

/** Free-text match over the fields an agent would actually search by. */
export const matchesApplicationSearch = (
    application: Application,
    term: string
): boolean => {
    const needle = term.trim().toLowerCase();
    if (!needle) return true;
    return [
        application.programId?.school,
        application.programId?.program_name,
        application.programId?.degree,
        application.programId?.semester
    ].some((field) =>
        String(field ?? '')
            .toLowerCase()
            .includes(needle)
    );
};
