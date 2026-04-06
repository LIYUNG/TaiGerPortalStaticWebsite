import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { Application } from '@/api/types';
import { getApplicationStudentV2, updateStudentApplications } from '@/api';
import { queryClient } from '@/api';

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

type AutosaveStatus = 'idle' | 'saving' | 'success' | 'error';

type AutosaveState = {
    status: AutosaveStatus;
    errorMessage?: string;
    resultId: number;
};

type StudentApplicationsQueryData = {
    _id?: string;
    applications?: Application[];
    applying_program_count?: number | string;
    [key: string]: unknown;
};

type StudentApplicationsResponseEnvelope = {
    success?: boolean;
    data?: StudentApplicationsQueryData;
};

const toStudentResponseEnvelope = (
    student: StudentApplicationsQueryData
): StudentApplicationsResponseEnvelope => ({
    success: true,
    data: student
});

type AutosaveMutationVars = {
    studentId: string;
    queryKey: readonly ['applications/student', string];
    optimisticStudent: StudentApplicationsQueryData;
    applicationsPayload: Array<{
        _id: unknown;
        programId: unknown;
        decided: unknown;
        closed: unknown;
        admission: unknown;
        finalEnrolment: unknown;
    }>;
    applyingProgramCount: number;
};

type AutosaveMutationContext = {
    previousStudent: unknown;
    queryKey: readonly ['applications/student', string];
};

const STUDENT_APPLICATIONS_SYNC_KEY = 'taiger:sync:applications:student';

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

const applyPendingChangesToStudent = <
    TStudent extends StudentApplicationsDraftSource
>(
    baseStudent: TStudent,
    pending: PendingChanges
): TStudent => ({
    ...baseStudent,
    applications: mergeApplicationsWithPatches(
        (baseStudent.applications ?? []) as Application[],
        pending.applicationsById
    ),
    applying_program_count:
        pending.applyingProgramCount ?? baseStudent.applying_program_count
});

const normalizeStudentQueryData = (
    source: unknown
): StudentApplicationsQueryData | null => {
    if (!source || typeof source !== 'object') {
        return null;
    }

    const raw = source as StudentApplicationsQueryData;
    if (
        Array.isArray(raw.applications) ||
        raw._id !== undefined ||
        raw.applying_program_count !== undefined
    ) {
        return raw;
    }

    const envelope = source as StudentApplicationsResponseEnvelope;
    if (envelope.data && typeof envelope.data === 'object') {
        return envelope.data;
    }

    return null;
};

const emitStudentApplicationsSync = (studentId: string) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(
            STUDENT_APPLICATIONS_SYNC_KEY,
            JSON.stringify({
                studentId,
                ts: Date.now(),
                id: Math.random().toString(36).slice(2)
            })
        );
    } catch {
        // Ignore sync failures in restricted environments.
    }
};

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
    const [saveState, setSaveState] = useState<AutosaveState>({
        status: 'idle',
        resultId: 0
    });
    const saveStateResultIdRef = useRef(0);
    const updateTimerRef = useRef<number | null>(null);
    const hasQueuedUpdateRef = useRef(false);

    const updateSaveState = (
        next: AutosaveState | ((prev: AutosaveState) => AutosaveState)
    ) => {
        setSaveState((prev) => {
            const resolved = typeof next === 'function' ? next(prev) : next;
            onStateChange?.(resolved);
            return resolved;
        });
    };

    const setSaving = () => {
        updateSaveState((prev) => ({
            status: 'saving',
            errorMessage: undefined,
            resultId: prev.resultId
        }));
    };

    const setSuccess = () => {
        saveStateResultIdRef.current += 1;
        updateSaveState({
            status: 'success',
            errorMessage: undefined,
            resultId: saveStateResultIdRef.current
        });
    };

    const setError = (errorMessage: string) => {
        saveStateResultIdRef.current += 1;
        updateSaveState({
            status: 'error',
            errorMessage,
            resultId: saveStateResultIdRef.current
        });
    };

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

    const updateMutation = useMutation<
        unknown,
        Error,
        AutosaveMutationVars,
        AutosaveMutationContext
    >({
        mutationKey: ['autosave-student-applications'],
        mutationFn: async (variables) => {
            const resp = await updateStudentApplications(
                variables.studentId,
                variables.applicationsPayload as unknown as Record<
                    string,
                    unknown
                >,
                variables.applyingProgramCount
            );

            const { success, message } = resp.data;
            if (!success) {
                throw new Error(message ?? 'Failed to update applications.');
            }

            return resp.data;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: variables.queryKey });

            const previousStudent = queryClient.getQueryData(
                variables.queryKey
            );

            queryClient.setQueryData(
                variables.queryKey,
                toStudentResponseEnvelope(variables.optimisticStudent)
            );

            return {
                previousStudent,
                queryKey: variables.queryKey
            };
        },
        onError: (error, _variables, context) => {
            if (context?.previousStudent !== undefined) {
                queryClient.setQueryData(
                    context.queryKey,
                    context.previousStudent
                );
            }
            setError(error.message || 'An error occurred. Please try again.');
        },
        onSuccess: (_data, variables) => {
            queryClient.setQueryData(
                variables.queryKey,
                toStudentResponseEnvelope(variables.optimisticStudent)
            );
            setSuccess();
            emitStudentApplicationsSync(variables.studentId);
        }
    });

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
        if (isSubmittingUpdateRef.current || updateMutation.isPending) {
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

        const queryKey = ['applications/student', studentId] as const;
        let latestStudent: StudentApplicationsQueryData =
            normalizeStudentQueryData(
                queryClient.getQueryData<StudentApplicationsQueryData>(queryKey)
            ) ?? (student as StudentApplicationsQueryData);

        try {
            const fetched = await getApplicationStudentV2(studentId);
            latestStudent = normalizeStudentQueryData(fetched) ?? latestStudent;
        } catch {
            // Fall back to cached/local snapshot when latest fetch fails.
        }

        const optimisticStudent = applyPendingChangesToStudent(
            latestStudent,
            pending
        );
        const applicationsPayload = buildApplicationsPayload(
            (optimisticStudent.applications ?? []) as Application[]
        );
        const applyingProgramCount = Number(
            optimisticStudent.applying_program_count ?? 0
        );

        isSubmittingUpdateRef.current = true;
        setIsSubmittingUpdate(true);
        setSaving();

        try {
            await updateMutation.mutateAsync({
                studentId,
                queryKey,
                optimisticStudent,
                applicationsPayload,
                applyingProgramCount
            });
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
        if (typeof window === 'undefined') {
            return;
        }

        const currentStudentId = String(student._id ?? '');
        if (!currentStudentId) {
            return;
        }

        const onStorage = (event: StorageEvent) => {
            if (
                event.key !== STUDENT_APPLICATIONS_SYNC_KEY ||
                !event.newValue
            ) {
                return;
            }

            try {
                const payload = JSON.parse(event.newValue) as {
                    studentId?: string;
                };

                if (String(payload.studentId ?? '') !== currentStudentId) {
                    return;
                }

                void queryClient.invalidateQueries({
                    queryKey: ['applications/student', currentStudentId]
                });
            } catch {
                // Ignore malformed sync payloads.
            }
        };

        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
        };
    }, [student._id]);

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
