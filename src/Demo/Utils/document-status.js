export const file_category_const = {
    rl_required: 'RL',
    ml_required: 'ML',
    sop_required: 'SOP',
    phs_required: 'PHS',
    essay_required: 'Essay',
    portfolio_required: 'Portfolio',
    supplementary_form_required: 'Supplementary_Form',
    scholarship_form_required: 'Scholarship_Form',
    curriculum_analysis_required: 'Curriculum_Analysis'
};

export const FILE_TYPE_E = {
    ...file_category_const,
    others: 'Others'
};

export const AGENT_SUPPORT_DOCUMENTS_A = [
    FILE_TYPE_E.curriculum_analysis_required,
    FILE_TYPE_E.supplementary_form_required,
    FILE_TYPE_E.others
];

export const checkIsRLspecific = (program) => {
    const isRLSpecific = program?.is_rl_specific;
    const noExplicitFlag = isRLSpecific === undefined || isRLSpecific === null;
    return isRLSpecific || (noExplicitFlag && program?.rl_requirements);
};

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

const buildProgramDocumentStatus = (application) => {
    if (!application) {
        return { missing: [], extra: [] };
    }

    const missing = [];
    const extra = [];

    for (const docKey of Object.keys(file_category_const)) {
        const docType = file_category_const[docKey];
        const isRequired = application?.programId?.[docKey] === 'yes';
        const hasThread = application?.doc_modification_thread?.some(
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

    const rlRequiredRaw = application?.programId?.rl_required;
    const nrRLNeeded = Number.parseInt(rlRequiredRaw, 10);
    const specificRLThreads =
        application?.doc_modification_thread?.filter((thread) =>
            thread.doc_thread_id?.file_type?.startsWith('RL_')
        ) || [];
    const nrSpecificRL = specificRLThreads.length;
    const rlIsSpecific = checkIsRLspecific(application?.programId);
    const nrSpecRLNeeded = rlIsSpecific ? nrRLNeeded : 0;

    if (
        rlIsSpecific &&
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

export const getProgramDocumentStatus = (application) =>
    buildProgramDocumentStatus(application);

export const getRLMinCount = (applications = []) =>
    applications.reduce((max, { programId }) => {
        const required = Number.parseInt(programId?.rl_required, 10);
        if (programId?.is_rl_specific || Number.isNaN(required)) {
            return max;
        }
        return Math.max(max, required);
    }, 0);

export const getGeneralRLCount = (generalDocs) => {
    if (!generalDocs) {
        return 0;
    }
    return generalDocs.filter((doc) =>
        doc?.doc_thread_id?.file_type?.includes('Recommendation_Letter_')
    ).length;
};

const buildGeneralDocumentStatus = (generalDocs, applications) => {
    if (!applications) {
        return { missing: [], extra: [] };
    }

    const generalRLcount = getGeneralRLCount(generalDocs);
    const generalRLrequired = getRLMinCount(applications);
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

export const getGeneralDocumentStatus = (generalDocs, applications) =>
    buildGeneralDocumentStatus(generalDocs, applications);

export const check_generaldocs = (student) => {
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

export const isDocumentsMissingAssign = (application) => {
    if (!application) {
        return false;
    }
    return getProgramDocumentStatus(application).missing.length > 0;
};
