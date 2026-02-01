import type { AxiosInstance } from 'axios';
import type { ApplicationProps } from '@taiger-common/core';

/** Program reference as nested in Application */
export interface ApplicationProgramId {
    _id?: unknown;
    uni_assist?: string | string[];
    allowOnlyGraduatedApplicant?: boolean;
    lang?: string;
    school?: string;
    program_name?: string;
    degree?: string;
    semester?: string;
    [key: string]: unknown;
}

/** Application object as returned by API / used in student.applications.
 * decided, closed, admission are optional so API responses that omit them still match. */
export type Application = Omit<
    ApplicationProps,
    'decided' | 'closed' | 'admission'
> & {
    decided?: string;
    closed?: string;
    admission?: string;
    _id?: string | { toString: () => string };
    programId?: ApplicationProgramId;
    application_year?: unknown;
    doc_modification_thread?: unknown[];
    uni_assist?: unknown;
    isLocked?: boolean;
    admission_letter?: { status?: string; admission_file_path?: string };
    interview_id?: string;
    interview_status?: string;
    interview_training_event?: { start?: string; [key: string]: unknown };
};

/** Generic API response wrapper used by the backend */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

/** Auth verify response data shape */
export interface AuthUserData {
    _id?: string;
    email?: string;
    role?: string;
    firstname?: string;
    lastname?: string;
    [key: string]: unknown;
}

export interface AuthVerifyResponse {
    success: boolean;
    data?: AuthUserData;
}

/** Typed request helpers - use generic getData<T>(url) for typed responses */
export type RequestInstance = AxiosInstance;

/** Auth context userdata state shape */
export interface AuthUserdataState {
    error: unknown;
    success: boolean;
    data: AuthUserData | null;
    isLoaded: boolean;
    res_modal_message: string;
    res_modal_status: number;
}

/** Auth context value (used by useAuth) */
export interface AuthContextValue {
    user: AuthUserData | null;
    isAuthenticated: boolean;
    isLoaded: boolean;
    login: (data: AuthUserData) => void;
    logout: () => void;
}

// --- API parameter types (for api/index.ts, api/query.ts, api/dataLoader.ts) ---

export interface LoginCredentials {
    email?: string;
    password?: string;
}

export interface ResetPasswordPayload {
    email?: string;
    password?: string;
    token?: string;
}

export interface ForgotPasswordPayload {
    email?: string;
}

export interface ActivationPayload {
    email?: string;
    token?: string;
}

/** Generic payload for PUT/PATCH - use Record<string, unknown> when shape varies */
export type ApiPayload = Record<string, unknown>;

/** Query string (e.g. for list filters) */
export type QueryString = string;

/** Common ID types - use string for API path params */
export type StudentId = string;
export type ApplicationId = string;
export type UserId = string;
export type ProgramId = string;
export type DocumentThreadId = string;
export type MessageId = string;
export type SurveyId = string;
export type EventId = string;
export type TicketId = string;
export type MeetingId = string;
export type InterviewId = string;
export type LeadId = string;
export type CourseId = string;
export type KeywordsSetId = string;
