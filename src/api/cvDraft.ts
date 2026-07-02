// API client for the AI-Assist CV first-draft skill.
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
        generatedAt: string;
    };
}

export interface GenerateCVDraftPayload {
    fileType?: string;
    programId?: string;
    programFullName?: string;
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
    data: { name: string; path: string };
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

export interface SavedCvDraftResponse {
    success: boolean;
    data: CVDraftResult | null;
}

// Load the persisted CVDraft for a thread (restores the AI Draft tab on refresh).
export const getSavedCvDraft = (documentsthreadId: string) =>
    getData<SavedCvDraftResponse>(
        `/api/ai-assist/threads/${documentsthreadId}/cv-draft`
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
