import type { TFunction } from 'i18next';
import { isProgramDecided } from '@taiger-common/core';

import DEMO from '@store/constant';
import { appConfig } from '../../../../config';
import {
    check_academic_background_filled,
    check_application_preference_filled,
    check_languages_filled,
    check_applications_to_decided,
    is_all_uni_assist_vpd_uploaded,
    are_base_documents_missing,
    to_register_application_portals,
    is_personal_data_filled,
    all_applications_results_updated,
    has_admissions,
    calculateApplicationLockStatus
} from '../../../Utils/util_functions';
import type {
    IDocumentthreadWithId,
    IProgramWithId,
    IStudentResponse,
    IUserWithId
} from '@taiger-common/model';

export type TaskPriority = 'urgent' | 'recommended' | 'optional';

export type TaskCategory =
    | 'feedback'
    | 'profile'
    | 'documents'
    | 'personal'
    | 'courses'
    | 'applications'
    | 'portals'
    | 'uniassist'
    | 'results'
    | 'visa';

export interface StudentTask {
    id: string;
    title: string;
    description: string;
    to: string;
    actionLabel: string;
    priority: TaskPriority;
    category: TaskCategory;
    locked: boolean;
}

export interface StudentTasksResult {
    tasks: StudentTask[];
    /** Core onboarding milestones — drives the progress bar. */
    progress: { done: number; total: number };
}

/**
 * Turns the scattered `check_*` task heuristics into a single ordered, priority-
 * tagged task list plus an onboarding-progress count. The order is the journey a
 * student is meant to follow, so `tasks[0]` is always "what to start next".
 *
 * Behaviour mirrors the previous StudentTasksResponsive checks 1:1 — this only
 * restructures the data so the UI can prioritise and guide.
 */
export function buildStudentTasks(
    student: IStudentResponse,
    isCoursesFilled: boolean,
    t: TFunction
): StudentTasksResult {
    const tasks: StudentTask[] = [];
    const studentIdStr = String((student as IUserWithId)._id ?? '');
    const startLabel = t('Start', { ns: 'common' });
    const replyLabel = t('Reply', { ns: 'common' });
    const feedbackDescription = t('New feedback from your Editor');

    // --- Editor feedback threads — someone is waiting on the student, so these
    // are the most time-sensitive items. ---
    (student.generaldocs_threads ?? []).forEach((thread) => {
        const docThread = thread.doc_thread_id as
            | IDocumentthreadWithId
            | undefined;
        if (
            !thread.isFinalVersion &&
            thread.latest_message_left_by_id !== studentIdStr &&
            docThread?._id
        ) {
            tasks.push({
                id: `thread-${docThread._id}`,
                title: docThread.file_type ?? t('Document', { ns: 'common' }),
                description: feedbackDescription,
                to: DEMO.DOCUMENT_MODIFICATION_LINK(docThread._id.toString()),
                actionLabel: replyLabel,
                priority: 'urgent',
                category: 'feedback',
                locked: false
            });
        }
    });

    (student.applications ?? [])
        .filter((application) => isProgramDecided(application))
        .forEach((application) => {
            const program = application.programId as IProgramWithId | undefined;
            const locked = calculateApplicationLockStatus(application).isLocked;
            (application.doc_modification_thread ?? []).forEach((appThread) => {
                const docThread = appThread.doc_thread_id as
                    | IDocumentthreadWithId
                    | undefined;
                if (
                    !appThread.isFinalVersion &&
                    appThread.latest_message_left_by_id !== studentIdStr &&
                    docThread?._id
                ) {
                    tasks.push({
                        id: `app-thread-${docThread._id}`,
                        title: `${docThread.file_type ?? ''} · ${program?.school ?? ''}`.trim(),
                        description: feedbackDescription,
                        to: DEMO.DOCUMENT_MODIFICATION_LINK(
                            docThread._id.toString()
                        ),
                        actionLabel: replyLabel,
                        priority: 'urgent',
                        category: 'feedback',
                        locked
                    });
                }
            });
        });

    // --- Core onboarding milestones (count toward progress) ---
    const profileDone =
        check_academic_background_filled(student.academic_background) &&
        Boolean(
            student.application_preference &&
                check_application_preference_filled(
                    student.application_preference
                )
        ) &&
        check_languages_filled(student.academic_background);
    const personalDone = is_personal_data_filled(student);
    const documentsDone = !are_base_documents_missing(student);
    const coursesApplies =
        student.academic_background?.university?.isGraduated === 'pending' ||
        student.academic_background?.university?.isGraduated === 'Yes';
    const coursesDone = isCoursesFilled;
    const schoolSelectionDone = check_applications_to_decided(student);

    if (!profileDone) {
        tasks.push({
            id: 'profile',
            title: t('Profile', { ns: 'common' }),
            description: t(
                'Please complete Profile so that your agent can understand your situation',
                { ns: 'dashboard' }
            ),
            to: DEMO.SURVEY_LINK,
            actionLabel: startLabel,
            priority: 'urgent',
            category: 'profile',
            locked: false
        });
    }
    if (!documentsDone) {
        tasks.push({
            id: 'documents',
            title: t('My Documents', { ns: 'common' }),
            description: t(
                'Please upload documents as soon as possible. The agent needs them to understand your academic background.',
                { ns: 'courses' }
            ),
            to: DEMO.BASE_DOCUMENTS_LINK,
            actionLabel: startLabel,
            priority: 'urgent',
            category: 'documents',
            locked: false
        });
    }
    if (!personalDone) {
        tasks.push({
            id: 'personal-data',
            title: t('Personal Data', { ns: 'common' }),
            description: t(
                'Please be sure to update your Chinese and English names, as well as your date of birth information. This will affect the preparation of formal documents by the editor for you.',
                { ns: 'courses' }
            ),
            to: DEMO.PROFILE,
            actionLabel: startLabel,
            priority: 'urgent',
            category: 'personal',
            locked: false
        });
    }
    if (coursesApplies && !coursesDone) {
        tasks.push({
            id: 'courses',
            title: t('My Courses', { ns: 'common' }),
            description: t(
                'Please complete My Courses table. The agent will provide you with course analysis and courses suggestion.',
                { ns: 'courses' }
            ),
            to: DEMO.COURSES_LINK,
            actionLabel: startLabel,
            priority: 'recommended',
            category: 'courses',
            locked: false
        });
    }
    if (!schoolSelectionDone) {
        tasks.push({
            id: 'school-selection',
            title: t('My Applications', { ns: 'common' }),
            description: t(
                "Please refer to the programs provided by the agent and visit the school's program website for detailed information. Complete the school selection before the start of the application season.",
                { ns: 'courses' }
            ),
            to: DEMO.STUDENT_APPLICATIONS_LINK,
            actionLabel: startLabel,
            priority: 'recommended',
            category: 'applications',
            locked: false
        });
    }

    // --- Later-stage tasks (shown when relevant; not part of onboarding %) ---
    if (to_register_application_portals(student as IUserWithId)) {
        tasks.push({
            id: 'portals',
            title: t('Portals Management', { ns: 'common' }),
            description: t(
                "Please go to each school's website to create an account and provide your login credentials. This will facilitate the agent in conducting pre-submission checks for you in the future.",
                { ns: 'courses' }
            ),
            to: DEMO.PORTALS_MANAGEMENT_LINK,
            actionLabel: startLabel,
            priority: 'recommended',
            category: 'portals',
            locked: false
        });
    }
    if (appConfig.vpdEnable && !is_all_uni_assist_vpd_uploaded(student)) {
        tasks.push({
            id: 'uni-assist',
            title: 'Uni-Assist',
            description: t(
                'Please go to the Uni-Assist section, follow the instructions to complete',
                { ns: 'courses' }
            ),
            to: DEMO.UNI_ASSIST_LINK,
            actionLabel: startLabel,
            priority: 'recommended',
            category: 'uniassist',
            locked: false
        });
    }
    if (!all_applications_results_updated(student)) {
        tasks.push({
            id: 'results',
            title: t('Application Results', { ns: 'common' }),
            description: t(
                'Please update your applications results to the corresponding program in this page below',
                { ns: 'common' }
            ),
            to: DEMO.STUDENT_APPLICATIONS_LINK,
            actionLabel: startLabel,
            priority: 'recommended',
            category: 'results',
            locked: false
        });
    }
    if (has_admissions(student)) {
        tasks.push({
            id: 'visa',
            title: t('Visa', { ns: 'common' }),
            description: t(
                'Please consider working on visa, if you decide the offer.',
                { ns: 'visa' }
            ),
            to: DEMO.VISA_DOCS_LINK,
            actionLabel: startLabel,
            priority: 'optional',
            category: 'visa',
            locked: false
        });
    }

    const coreSteps = [
        { applies: true, done: profileDone },
        { applies: true, done: personalDone },
        { applies: true, done: documentsDone },
        { applies: coursesApplies, done: coursesDone },
        { applies: true, done: schoolSelectionDone }
    ];
    const total = coreSteps.filter((step) => step.applies).length;
    const done = coreSteps.filter((step) => step.applies && step.done).length;

    return { tasks, progress: { done, total } };
}
