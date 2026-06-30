// API client for the AI-Assist CV first-draft skill.
// Calls POST /api/ai-assist/students/:studentId/cv-draft which returns a
// structured CVDraft plus a reviewer checklist (no docx yet). Mirrors the
// backend contract in services/ai-assist/cv/types.ts.

import { postData } from './request';

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
