import { useEffect, useRef, useState } from 'react';
import type { Application } from '@/api/types';
import { getApplicationStudentV2, updateStudentApplications } from '@/api';
import { queryClient } from '@/api';
import { useAutosaveState, type AutosaveState } from '@/hooks/useAutosaveState';

type ApplicationPatch = Partial<
    Pick<Application, 'decided' | 'closed' | 'admission' | 'finalEnrolment'>
>;

type PendingChanges = {
    applicationsById: Record<string, ApplicationPatch>;
    applyingProgramCount?: number | string;
};

type StudentApplicationsDraftSource = {
    _id?: string;
    applications?: Application[];
    applying_program_count?: number | string;
    [key: string]: unknown;
};

const createEmptyPendingChanges = (): PendingChanges => ({
    applicationsById: {}
});

const hasPendingChanges = (pending: PendingChanges): boolean =>
    Object.keys(pending.applicationsById).length > 0 ||
    pending.applyingProgramCount !== undefined;

const mergeApplicationsWithPatches = (
    applications: Application[],
    patchesById: Record<string, ApplicationPatch>
): Application[] =>
    applications.map((application) => {
        const applicationId = String(application._id ?? '');
        const patch = patchesById[applicationId];
        return patch
            ? ({ ...application, ...patch } as Application)
            : application;
    });

const arePatchesEqual = (
    left: Record<string, ApplicationPatch>,
    right: Record<string, ApplicationPatch>
): boolean => {
    const leftIds = Object.keys(left);
    const rightIds = Object.keys(right);

    if (leftIds.length !== rightIds.length) {
        return false;
    }

    for (const id of leftIds) {
        const leftPatch = left[id] ?? {};
        const rightPatch = right[id] ?? {};
        const leftEntries = Object.entries(leftPatch);
        const rightEntries = Object.entries(rightPatch);

        if (leftEntries.length !== rightEntries.length) {
            return false;
        }

        for (const [key, value] of leftEntries) {
            if ((rightPatch as Record<string, unknown>)[key] !== value) {
                return false;
            }
        }
    }

    return true;
};

const arePendingChangesEqual = (
    left: PendingChanges,
    right: PendingChanges
): boolean =>
    left.applyingProgramCount === right.applyingProgramCount &&
    arePatchesEqual(left.applicationsById, right.applicationsById);

const pruneSyncedPendingChanges = (
    pending: PendingChanges,
    studentApplications: Application[],
    studentApplyingProgramCount: number | string | undefined
): PendingChanges => {
    const nextApplicationsById: Record<string, ApplicationPatch> = {};

    Object.entries(pending.applicationsById).forEach(
        ([applicationId, patch]) => {
            const studentApp = studentApplications.find(
                (app) => String(app._id ?? '') === applicationId
            );

            if (!studentApp) {
                nextApplicationsById[applicationId] = patch;
                return;
            }

            const unsyncedPatchEntries = Object.entries(patch).filter(
                ([key, value]) =>
                    (studentApp as unknown as Record<string, unknown>)[key] !==
                    value
            );

            if (unsyncedPatchEntries.length > 0) {
                nextApplicationsById[applicationId] =
                    Object.fromEntries(unsyncedPatchEntries);
            }
        }
    );

    const isProgramCountSynced =
        pending.applyingProgramCount === undefined ||
        Number(pending.applyingProgramCount) ===
            Number(studentApplyingProgramCount ?? 0);

    return {
        applicationsById: nextApplicationsById,
        applyingProgramCount: isProgramCountSynced
            ? undefined
            : pending.applyingProgramCount
    };
};

const buildApplicationsPayload = (applications: Application[]) =>
    applications.map((application) => ({
        _id: application._id,
        programId: application.programId?._id,
        decided: application.decided,
        closed: application.closed,
        admission: application.admission,
        finalEnrolment: application.finalEnrolment
    }));

export const useStudentApplicationsAutosave = <
    TStudent extends StudentApplicationsDraftSource
>({
    student,
    onStateChange
}: {
    student: TStudent;
    onStateChange?: (state: AutosaveState) => void;
}) => {
    const [pendingChanges, setPendingChanges] = useState<PendingChanges>(
        createEmptyPendingChanges
    );
    const pendingChangesRef = useRef<PendingChanges>(
        createEmptyPendingChanges()
    );
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const isSubmittingUpdateRef = useRef(false);
    const { saveState, setSaving, setSuccess, setError } = useAutosaveState({
        onStateChange
    });
    const updateTimerRef = useRef<number | null>(null);
    const hasQueuedUpdateRef = useRef(false);

    const updatePendingChanges = (
        updater: (prev: PendingChanges) => PendingChanges
    ) => {
        setPendingChanges((prev) => {
            const next = updater(prev);
            pendingChangesRef.current = next;
            return next;
        });
    };

    const studentToShow: TStudent & {
        applications: Application[];
        applying_program_count?: number | string;
    } = {
        ...student,
        applications: mergeApplicationsWithPatches(
            (student.applications ?? []) as Application[],
            pendingChanges.applicationsById
        ),
        applying_program_count:
            pendingChanges.applyingProgramCount ??
            student.applying_program_count
    };

    const queueStudentApplicationsUpdate = () => {
        hasQueuedUpdateRef.current = true;

        if (updateTimerRef.current) {
            window.clearTimeout(updateTimerRef.current);
        }

        updateTimerRef.current = window.setTimeout(() => {
            updateTimerRef.current = null;
            void flushQueuedStudentApplicationsUpdate();
        }, 250);
    };

    const updatePendingProgramCount = (value: number) => {
        updatePendingChanges((prev) => ({
            ...prev,
            applyingProgramCount: value
        }));
        queueStudentApplicationsUpdate();
    };

    const updatePendingApplicationPatch = (
        applicationId: string,
        patch: ApplicationPatch,
        shouldQueue = false
    ) => {
        if (!applicationId) {
            return;
        }

        updatePendingChanges((prev) => ({
            ...prev,
            applicationsById: {
                ...prev.applicationsById,
                [applicationId]: {
                    ...(prev.applicationsById[applicationId] ?? {}),
                    ...patch
                }
            }
        }));

        if (shouldQueue) {
            queueStudentApplicationsUpdate();
        }
    };

    const clearPendingChanges = () => {
        updatePendingChanges(createEmptyPendingChanges);
    };

    const persistStudentApplicationsUpdate = async () => {
        if (isSubmittingUpdateRef.current) {
            return;
        }

        const studentId = String(studentToShow._id ?? '');
        if (!studentId) {
            setError('Missing student id.');
            return;
        }

        const pending = pendingChangesRef.current;
        if (!hasPendingChanges(pending)) {
            return;
        }

        let latestApplications = (student.applications ?? []) as Application[];
        let latestApplyingProgramCount: number | string =
            student.applying_program_count ?? 0;

        try {
            const latestStudentResp = await getApplicationStudentV2(studentId);
            const latestStudent = (
                latestStudentResp as {
                    data?: {
                        applications?: Application[];
                        applying_program_count?: number | string;
                    };
                }
            ).data;
            latestApplications =
                latestStudent?.applications ?? latestApplications;
            latestApplyingProgramCount =
                latestStudent?.applying_program_count ??
                latestApplyingProgramCount;
        } catch {
            // Fall back to local snapshot when latest fetch fails.
        }

        const mergedApplicationsForSubmit =
            latestApplications.length > 0
                ? mergeApplicationsWithPatches(
                      latestApplications,
                      pending.applicationsById
                  )
                : latestApplications;

        const applicationsPayload = buildApplicationsPayload(
            mergedApplicationsForSubmit
        );
        const applyingProgramCount = Number(
            pending.applyingProgramCount ?? latestApplyingProgramCount ?? 0
        );

        isSubmittingUpdateRef.current = true;
        setIsSubmittingUpdate(true);
        setSaving();

        try {
            const resp = await updateStudentApplications(
                studentId,
                applicationsPayload as unknown as Record<string, unknown>,
                applyingProgramCount
            );

            const { success, message } = resp.data;
            if (success) {
                queryClient.invalidateQueries({
                    queryKey: ['applications/student', studentId]
                });
                setSuccess();
                return;
            }

            setError(message ?? 'Failed to update applications.');
        } catch (error) {
            setError(
                (error as { message?: string }).message ||
                    'An error occurred. Please try again.'
            );
        } finally {
            isSubmittingUpdateRef.current = false;
            setIsSubmittingUpdate(false);

            if (hasQueuedUpdateRef.current && !updateTimerRef.current) {
                updateTimerRef.current = window.setTimeout(() => {
                    updateTimerRef.current = null;
                    void flushQueuedStudentApplicationsUpdate();
                }, 0);
            }
        }
    };

    const flushQueuedStudentApplicationsUpdate = async () => {
        if (isSubmittingUpdateRef.current) {
            return;
        }

        if (!hasQueuedUpdateRef.current) {
            return;
        }

        hasQueuedUpdateRef.current = false;
        await persistStudentApplicationsUpdate();
    };

    useEffect(() => {
        isSubmittingUpdateRef.current = isSubmittingUpdate;
    }, [isSubmittingUpdate]);

    useEffect(() => {
        const currentPending = pendingChangesRef.current;
        const nextPending = pruneSyncedPendingChanges(
            currentPending,
            (student.applications ?? []) as Application[],
            student.applying_program_count
        );

        if (!arePendingChangesEqual(currentPending, nextPending)) {
            updatePendingChanges(() => nextPending);
        }
    }, [student]);

    useEffect(() => {
        return () => {
            if (updateTimerRef.current) {
                window.clearTimeout(updateTimerRef.current);
            }
        };
    }, []);

    return {
        studentToShow,
        isSubmittingUpdate,
        saveState,
        updatePendingProgramCount,
        updatePendingApplicationPatch,
        queueStudentApplicationsUpdate,
        clearPendingChanges
    };
};
