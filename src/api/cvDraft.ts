// API client for the AI-Assist CV draft skill.
// Calls POST /api/ai-assist/students/:studentId/cv-draft which returns a
// structured CVDraft plus a reviewer checklist (no docx yet). Mirrors the
// backend contract in services/ai-assist/cv/types.ts.

import { BASE_URL, getData, postData, putData } from './request';

export interface CVPersonal {
    fullName: string;
    birthday: string;
    birthplace: string;
    nationality: string;
    address: string;
    phone: string;
    email: string;
}

export interface CVEducation {
    period: string;
    institution: string;
    city: string;
    country: string;
    major: string;
    minor: string;
    gpa: string;
    gsat: string;
    courses: string;
    specialActivities: string;
}

export interface CVExperience {
    period: string;
    jobTitle: string;
    company: string;
    city: string;
    country: string;
    bullets: string[];
}

export interface CVAward {
    date: string;
    title: string;
    description: string;
}

export interface CVLanguage {
    name: string;
    level: string;
    testScore: string;
}

export interface CVComputerSkill {
    name: string;
    level: string;
}

export interface CVDraft {
    personal: CVPersonal;
    universities: CVEducation[];
    seniorHighSchools: CVEducation[];
    juniorHighSchools: CVEducation[];
    experience: CVExperience[];
    awards: CVAward[];
    languages: CVLanguage[];
    computer: CVComputerSkill[];
    otherSkills: string;
    socialEngagement: string;
    competitiveSports: string;
    hobbies: string;
    anythingElse: string;
}

export type CVChecklistLevel = 'error' | 'warning';

export interface CVChecklistItem {
    section: string;
    level: CVChecklistLevel;
    code: string;
    message: string;
}

export interface CVValidationResult {
    ok: boolean;
    errorCount: number;
    warningCount: number;
    items: CVChecklistItem[];
}

export interface CVDraftResult {
    draft: CVDraft;
    validation: CVValidationResult;
    meta: {
        fileType: string;
        model: string;
        studentId: string;
        programId?: string;
        degree?: string;
        generatedAt: string;
        // Set when the AI returned an unparseable draft — the draft is empty and
        // the UI should show a retry state (not a checklist of spurious errors).
        parseError?: string;
        // Editor notes that fed this draft (provenance) — used to restore the
        // notes box after a refresh / tab switch.
        editorNotes?: string;
    };
    // True when the student has a passport photo on file (AI Draft coverage).
    hasPhoto?: boolean;
    // Restored by getSavedCvDraft: whether the persisted rendered .docx is still
    // current for this draft, and the file to attach (so the AI Draft tab can
    // re-enable Attach after a refresh / tab switch without re-rendering).
    renderedCurrent?: boolean;
    rendered?: { name: string; path: string; photoEmbedded?: boolean } | null;
    // Set by getSavedCvDraft when the generation inputs (CV Details / photo)
    // changed since this draft was made — the UI prompts a regenerate (W3).
    inputsChanged?: boolean;
    // Bounded history of previous drafts (newest first) — powers the regenerate
    // diff and undo.
    history?: Array<{
        draft: CVDraft;
        meta?: {
            generatedAt?: string;
            editedAt?: string;
            model?: string;
            // How that version was made: 'generate' | 'edit' | 'restore'.
            source?: string;
        };
        savedAt?: string;
    }>;
}

export interface GenerateCVDraftPayload {
    fileType?: string;
    programId?: string;
    programFullName?: string;
    degree?: string;
    editorRequirements?: string;
    documentsthreadId?: string;
}

export interface GenerateCVDraftResponse {
    success: boolean;
    data: CVDraftResult;
}

export const generateCvDraft = (
    studentId: string,
    payload: GenerateCVDraftPayload
) =>
    postData<GenerateCVDraftResponse>(
        `/api/ai-assist/students/${studentId}/cv-draft`,
        payload
    );

export interface UpdateAdditionalInformationResponse {
    success: boolean;
    data: { additionalInformation: string };
}

// Persist the thread-scoped CV "additional information" (student + editor
// editable). PUT /api/document-threads/:threadId/additional-information
export const updateCvAdditionalInformation = (
    threadId: string,
    additionalInformation: string
) =>
    putData<UpdateAdditionalInformationResponse>(
        `/api/document-threads/${threadId}/additional-information`,
        { additionalInformation }
    );

// --- Reusable CV profile (lives on the student User; shared between the CV
// thread "CV Details" tab and the student-database survey tab) ---
export interface CvProfilePersonalInformation {
    nationality?: string;
    birthplace?: string;
    address?: string;
    phone?: string;
}
export interface CvProfileExperience {
    period?: string;
    job_title?: string;
    company?: string;
    city?: string;
    country?: string;
    bullets?: string[];
}
export interface CvProfileAward {
    date?: string;
    title?: string;
    description?: string;
}
export interface CvProfileComputerSkill {
    name?: string;
    level?: string;
}
export interface CvProfileSkills {
    computer?: CvProfileComputerSkill[];
    other?: string[];
}
export interface CvProfileInterests {
    hobbies?: string;
    social_engagement?: string;
    competitive_sports?: string;
}
export interface CvProfileData {
    personal_information: CvProfilePersonalInformation;
    professional_experience: CvProfileExperience[];
    awards: CvProfileAward[];
    skills: CvProfileSkills;
    interests: CvProfileInterests;
}
export interface CvProfileResponse {
    success: boolean;
    data: CvProfileData;
}

export const getStudentCvProfile = (studentId: string) =>
    getData<CvProfileResponse>(`/api/account/survey/cv-profile/${studentId}`);

export const updateStudentCvProfile = (
    studentId: string,
    payload: Partial<CvProfileData>
) =>
    postData<CvProfileResponse>(
        `/api/account/survey/cv-profile/${studentId}`,
        payload
    );

export interface RenderCvDraftResponse {
    success: boolean;
    // `hash` fingerprints the rendered draft; `reused` is true when the server
    // skipped re-rendering because the draft was unchanged.
    data: {
        name: string;
        path: string;
        hash?: string;
        reused?: boolean;
        // False when a passport photo existed but could not be embedded
        // (unsupported format); undefined when no photo was on file.
        photoEmbedded?: boolean;
    };
}

// Stage B: render the reviewed CVDraft into a docx and attach it to the thread.
export const renderCvDraft = (
    studentId: string,
    payload: { draft: CVDraft; documentsthreadId?: string }
) =>
    postData<RenderCvDraftResponse>(
        `/api/ai-assist/students/${studentId}/cv-draft/render`,
        payload
    );

export interface AttachCvDraftResponse {
    success: boolean;
    data: { name: string; path: string };
}

// Attach the already-rendered docx to the thread as a student-visible message
// with an editor-supplied note. Rejects (409) if the draft changed since the
// last render — regenerate first.
export const attachCvDraftToThread = (
    documentsthreadId: string,
    payload: { draft: CVDraft; message: string }
) =>
    postData<AttachCvDraftResponse>(
        `/api/ai-assist/threads/${documentsthreadId}/cv-draft/attach`,
        payload
    );

export interface SavedCvDraftResponse {
    success: boolean;
    data: CVDraftResult | null;
}

// Load the persisted CVDraft for a thread (restores the AI Draft tab on refresh).
export const getSavedCvDraft = (documentsthreadId: string) =>
    getData<SavedCvDraftResponse>(
        `/api/ai-assist/threads/${documentsthreadId}/cv-draft`
    );

export interface ValidateCvDraftResponse {
    success: boolean;
    data: { validation: CVValidationResult };
}

// Re-run the deterministic checklist over an editor-edited draft (no LLM, no
// persistence) so the checklist stays honest after inline edits.
export const validateCvDraft = (
    studentId: string,
    payload: { draft: CVDraft; fileType?: string; degree?: string }
) =>
    postData<ValidateCvDraftResponse>(
        `/api/ai-assist/students/${studentId}/cv-draft/validate`,
        payload
    );

export interface CvReadinessItem {
    key: string;
    ok: boolean;
}
export interface CvReadinessResponse {
    success: boolean;
    data: { readiness: CvReadinessItem[] };
}

export interface AiQuotaResponse {
    success: boolean;
    data: { quota: number | null; canUse: boolean };
}

// The current user's remaining TaiGer AI quota (for the "uses 1 credit" microcopy).
export const getMyAiQuota = () =>
    getData<AiQuotaResponse>(`/api/ai-assist/ai-quota`);

// Pre-generation readiness: which CV sections the profile can already fill,
// computed server-side from the same knownFacts the generator uses. Lets the AI
// Draft tab show gaps BEFORE spending an AI credit.
export const getCvReadiness = (studentId: string) =>
    getData<CvReadinessResponse>(
        `/api/ai-assist/students/${studentId}/cv-draft/readiness`
    );

// Persist editor inline edits to the reviewed draft. Re-validates server-side and
// drops any rendered .docx (the edited draft must be re-created before attaching).
export const updateCvDraft = (
    documentsthreadId: string,
    payload: { draft: CVDraft; degree?: string; source?: string }
) =>
    putData<SavedCvDraftResponse>(
        `/api/ai-assist/threads/${documentsthreadId}/cv-draft`,
        payload
    );

// Render + stream the docx straight back as a download (no S3 needed).
export const downloadCvDraft = async (
    studentId: string,
    draft: CVDraft
): Promise<Blob> => {
    const resp = await fetch(
        `${BASE_URL}/api/ai-assist/students/${studentId}/cv-draft/render/download`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ draft })
        }
    );
    if (!resp.ok) {
        throw new Error(`Download failed (${resp.status})`);
    }
    return resp.blob();
};

// --- CV Details: passport photo (profile doc "Passport_Photo") ---

// Fetch the student's passport photo as a Blob for preview. Throws on 404 (none).
export const getCvPassportPhoto = async (studentId: string): Promise<Blob> => {
    const resp = await fetch(
        `${BASE_URL}/api/ai-assist/students/${studentId}/cv-photo`,
        { credentials: 'include' }
    );
    if (!resp.ok) {
        throw new Error(`No passport photo (${resp.status})`);
    }
    return resp.blob();
};

export interface UploadPassportPhotoResponse {
    success: boolean;
    data: unknown;
}

// Upload / replace the student's passport photo (multipart, field "file").
export const uploadPassportPhoto = (studentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return postData<UploadPassportPhotoResponse>(
        `/api/students/${studentId}/files/Passport_Photo`,
        formData
    );
};
