import { file_category_const } from './checking-functions';

const createDocumentEntry = ({ docKey, docType, status, scope, counts }) => ({
    docKey,
    docType,
    status,
    scope,
    ...(counts ? { counts } : {})
});

const createRecommendationLetterEntry = ({
    required,
    provided,
    status,
    scope
}) =>
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

export const getProgramDocumentStatus = (application) => {
    if (!application) {
        return { missing: [], extra: [] };
    }

    const missing = [];
    const extra = [];
    const program = application?.programId;
    const docThread = application?.doc_modification_thread;

    for (const docKey of Object.keys(file_category_const)) {
        const docType = file_category_const[docKey];
        const isRequired = program?.[docKey] === 'yes';
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

    const rlRequiredRaw = program?.rl_required;
    const nrRLNeeded = Number.parseInt(rlRequiredRaw, 10);
    const specificRLThreads =
        docThread?.filter((thread) =>
            thread.doc_thread_id?.file_type?.startsWith('RL_')
        ) || [];
    const nrSpecificRL = specificRLThreads.length;
    const isRLSpecific = program?.is_rl_specific;
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

const getRLMaxCount = (applications = []) => {
    return applications.reduce((max, { programId }) => {
        const required = Number.parseInt(programId?.rl_required, 10);
        if (programId?.is_rl_specific || Number.isNaN(required)) {
            return max;
        }
        return Math.max(max, required);
    }, 0);
};

const getGeneralRLCount = (generalDocs) => {
    if (!generalDocs) {
        return 0;
    }
    return generalDocs.filter((doc) =>
        doc?.doc_thread_id?.file_type?.includes('Recommendation_Letter_')
    ).length;
};

export const getGeneralDocumentStatus = (generalDocs, applications) => {
    if (!applications) {
        return { missing: [], extra: [] };
    }

    const generalRLcount = getGeneralRLCount(generalDocs);
    const generalRLrequired = getRLMaxCount(applications);
    const missingRLCount = generalRLrequired - generalRLcount;
    const extraRLCount = generalRLcount - generalRLrequired;

    const missing = [];
    const extra = [];

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

    return { missing, extra };
};

export const checkGeneralDocs = (student) => {
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
