import { file_category_const } from './checking-functions';

interface DocumentEntryCounts {
    required?: number;
    provided?: number;
    delta?: number;
}

interface DocumentEntry {
    docKey: string;
    docType: string;
    status: string;
    scope: string;
    counts?: DocumentEntryCounts;
}

interface CreateDocumentEntryParams {
    docKey: string;
    docType: string;
    status: string;
    scope: string;
    counts?: DocumentEntryCounts;
}

const createDocumentEntry = ({
    docKey,
    docType,
    status,
    scope,
    counts
}: CreateDocumentEntryParams): DocumentEntry => ({
    docKey,
    docType,
    status,
    scope,
    ...(counts ? { counts } : {})
});

interface CreateRecommendationLetterParams {
    required: number;
    provided: number;
    status: string;
    scope: string;
}

const createRecommendationLetterEntry = ({
    required,
    provided,
    status,
    scope
}: CreateRecommendationLetterParams): DocumentEntry =>
    createDocumentEntry({
        docKey: 'rl_required',
        docType: file_category_const.rl_required,
        status,
        scope,
        counts: {
            required,
            provided,
            delta: Math.abs(required - provided)
        }
    });

export const getProgramDocumentStatus = (
    application: Record<string, unknown> | null
): { missing: DocumentEntry[]; extra: DocumentEntry[] } => {
    if (!application) {
        return { missing: [], extra: [] };
    }

    const missing: DocumentEntry[] = [];
    const extra: DocumentEntry[] = [];
    const program = application?.programId as
        | Record<string, unknown>
        | undefined;
    const docThread = application?.doc_modification_thread as
        | Array<{ doc_thread_id?: { file_type?: string } }>
        | undefined;

    for (const docKey of Object.keys(file_category_const)) {
        const docType = (file_category_const as Record<string, string>)[docKey];
        const isRequired = (program?.[docKey] as string) === 'yes';
        const hasThread = docThread?.some(
            (thread) => thread.doc_thread_id?.file_type === docType
        );

        if (isRequired && !hasThread) {
            missing.push(
                createDocumentEntry({
                    docKey,
                    docType,
                    status: 'missing',
                    scope: 'program'
                })
            );
        }

        if (!isRequired && hasThread) {
            extra.push(
                createDocumentEntry({
                    docKey,
                    docType,
                    status: 'extra',
                    scope: 'program'
                })
            );
        }
    }

    const rlRequiredRaw = program?.rl_required as string | undefined;
    const nrRLNeeded = Number.parseInt(rlRequiredRaw ?? '', 10);
    const specificRLThreads =
        docThread?.filter((thread) =>
            thread.doc_thread_id?.file_type?.startsWith('RL_')
        ) || [];
    const nrSpecificRL = specificRLThreads.length;
    const isRLSpecific = program?.is_rl_specific as boolean | undefined;
    const nrSpecRLNeeded = isRLSpecific ? nrRLNeeded : 0;

    if (
        isRLSpecific &&
        Number.isFinite(nrRLNeeded) &&
        nrRLNeeded > 0 &&
        nrSpecificRL < nrRLNeeded
    ) {
        missing.push(
            createRecommendationLetterEntry({
                required: nrRLNeeded,
                provided: nrSpecificRL,
                status: 'missing',
                scope: 'program'
            })
        );
    }

    if (
        Number.isFinite(nrSpecificRL) &&
        Number.isFinite(nrSpecRLNeeded) &&
        nrSpecificRL > nrSpecRLNeeded
    ) {
        extra.push(
            createRecommendationLetterEntry({
                required: nrSpecRLNeeded,
                provided: nrSpecificRL,
                status: 'extra',
                scope: 'program'
            })
        );
    }

    return { missing, extra };
};

const getGeneralRLMaxCount = (
    applications: Array<{ programId?: Record<string, unknown> }> = []
): number => {
    return applications.reduce((max, { programId }) => {
        const required = Number.parseInt(
            (programId?.rl_required as string) ?? '',
            10
        );
        if ((programId?.is_rl_specific as boolean) || Number.isNaN(required)) {
            return max;
        }
        return Math.max(max, required);
    }, 0);
};

const getGeneralRLCount = (
    generalDocs:
        | Array<{ doc_thread_id?: { file_type?: string } }>
        | null
        | undefined
): number => {
    if (!generalDocs) {
        return 0;
    }
    return generalDocs.filter((doc) =>
        doc?.doc_thread_id?.file_type?.includes('Recommendation_Letter_')
    ).length;
};

interface RLApplication {
    programId: string;
    programLabel: string;
    required: number;
}

export const getGeneralDocumentStatus = (
    generalDocs:
        | Array<{ doc_thread_id?: { file_type?: string } }>
        | null
        | undefined,
    applications:
        | Array<{ programId?: Record<string, unknown> }>
        | null
        | undefined
): {
    missing: DocumentEntry[];
    extra: DocumentEntry[];
    rlApplications: RLApplication[];
} => {
    if (!applications) {
        return { missing: [], extra: [], rlApplications: [] };
    }

    const generalRLcount = getGeneralRLCount(generalDocs);
    const generalRLrequired = getGeneralRLMaxCount(applications);
    const missingRLCount = generalRLrequired - generalRLcount;
    const extraRLCount = generalRLcount - generalRLrequired;

    const missing: DocumentEntry[] = [];
    const extra: DocumentEntry[] = [];

    const rlApplications: RLApplication[] = applications
        .map(({ programId }) => {
            const required = Number.parseInt(
                (programId?.rl_required as string) ?? '',
                10
            );
            if (
                (programId?.is_rl_specific as boolean) ||
                !Number.isFinite(required) ||
                required <= 0
            ) {
                return null;
            }
            const school = (programId?.school as string)?.trim();
            const programName = (programId?.program_name as string)?.trim();
            const labelParts = [school, programName].filter(Boolean);
            const label =
                labelParts.join(' - ') || programName || school || 'Program';
            const programKey =
                programId?._id !== undefined && programId?._id !== null
                    ? `${programId._id}`
                    : label;
            return {
                programId: programKey,
                programLabel: label,
                required
            };
        })
        .filter((entry): entry is RLApplication => entry !== null);

    if (missingRLCount > 0) {
        missing.push(
            createRecommendationLetterEntry({
                required: generalRLrequired,
                provided: generalRLcount,
                status: 'missing',
                scope: 'general'
            })
        );
    }

    if (extraRLCount > 0) {
        extra.push(
            createRecommendationLetterEntry({
                required: generalRLrequired,
                provided: generalRLcount,
                status: 'extra',
                scope: 'general'
            })
        );
    }

    return { missing, extra, rlApplications };
};

export const checkGeneralDocs = (student: {
    generaldocs_threads?: Array<{ doc_thread_id?: { file_type?: string } }>;
}): boolean => {
    if (!student.generaldocs_threads) {
        return false;
    }
    const hasCV =
        student.generaldocs_threads.findIndex(
            (thread) => thread.doc_thread_id?.file_type === 'CV'
        ) >= 0;
    const hasUSCV =
        student.generaldocs_threads.findIndex(
            (thread) => thread.doc_thread_id?.file_type === 'CV_US'
        ) >= 0;

    return !(hasCV || hasUSCV);
};
