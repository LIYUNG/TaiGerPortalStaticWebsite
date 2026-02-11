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
    programId?: IProgramWithId;
    application_year?: unknown;
    doc_modification_thread?: unknown[];
    uni_assist?: { status?: string; vpd_file_path?: string, isPaid?: boolean };
    isLocked?: boolean;
    admission_letter?: { status?: string; admission_file_path?: string };
    interview_id?: string;
    interview_status?: string;
    interview_training_event?: { start?: string;[key: string]: unknown };
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

// --- Extended Response Types (frontend-friendly with string IDs) ---

/** Import extended types from taiger-common */
import type {
    IApplicationWithId,
    IProgramWithId,
    IUserWithId,
    IStudentResponse
} from '../types/taiger-common';

/** Re-export for convenience */
export type {
    IApplicationWithId,
    IProgramWithId,
    IUserWithId,
    IStudentResponse
};

/** Program response from API (includes string _id) */
export interface ProgramResponse extends IProgramWithId {
    _id: string;
    updatedAt?: string | Date;
    createdAt?: string | Date;
}

/** Agent/Editor user response */
export interface AgentResponse extends IUserWithId {
    _id: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
}

/** Communication message response */
export interface CommunicationResponse {
    _id: string;
    student_id?: string | IStudentResponse;
    user_id?: string | AgentResponse;
    message?: string;
    readBy?: string[];
    timeStampReadBy?: Record<string, string | Date>;
    files?: Array<{ name: string; path: string }>;
    createdAt?: string | Date;
    ignore_message?: boolean;
    ignoredMessageUpdatedAt?: string | Date;
    ignoredMessageBy?: string;
}

/** Event response */
export interface EventResponse {
    _id: string;
    requester_id?: string[];
    receiver_id?: string[];
    isConfirmedRequester?: boolean;
    isConfirmedReceiver?: boolean;
    meetingLink?: string;
    event_type?: string;
    title?: string;
    description?: string;
    start?: string | Date;
    end?: string | Date;
}

/** Interview response */
export interface InterviewResponse {
    _id: string;
    student_id?: string | IStudentResponse;
    trainer_id?: string[];
    thread_id?: string;
    program_id?: string | ProgramResponse;
    event_id?: string | EventResponse;
    interview_description?: string;
    interviewer?: string;
    interview_duration?: string;
    interview_date?: string | Date;
    isClosed?: boolean;
    start?: string | Date;
    end?: string | Date;
}

/** Document thread response */
export interface DocumentThreadResponse {
    _id: string;
    student_id?: string | IStudentResponse;
    application_id?: string;
    user_id?: string;
    flag_by_user_id: string[],
    isFinalVersion?: boolean;
    latest_message_left_by_id?: string;
    messages?: Array<{
        _id?: string;
        user_id?: string | { firstname?: string; lastname?: string;[key: string]: unknown };
        message?: string;
        file_path?: string;
        file?: Array<{ name: string; path: string }>;
        createdAt?: string | Date;
    }>;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

/** Student response with all populated fields */
export interface StudentResponseFull extends IStudentResponse {
    _id: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    role?: string;
    applications?: IApplicationWithId[];
    agents?: AgentResponse[];
    editors?: AgentResponse[];
    archiv?: boolean;
    [key: string]: unknown;
}

// --- API Response types (backend returns ApiResponse<T> or similar) ---

/** getProgram response: { success, data, students?, vc? } */
export interface GetProgramResponse {
    success: boolean;
    data: ProgramResponse & Record<string, unknown>;
    students?: IStudentResponse[];
    vc?: unknown[];
}

/** getProgramTicket response */
export interface GetProgramTicketResponse {
    success: boolean;
    data?: unknown[];
}

/** getStudents / getStudentsV3 response */
export type GetStudentsResponse = ApiResponse<IStudentResponse[]>;

/** getStudent response */
export type GetStudentResponse = ApiResponse<IStudentResponse>;

/** getApplications response */
export type GetApplicationsResponse = ApiResponse<IApplicationWithId[]>;

/** getAdmissions response */
export type GetAdmissionsResponse = ApiResponse<unknown[]>;

/** getAdmissionsOverview response */
export type GetAdmissionsOverviewResponse = ApiResponse<Record<string, unknown>>;

/** getUsers response */
export type GetUsersResponse = ApiResponse<AgentResponse[]>;

/** getUsersOverview response */
export type GetUsersOverviewResponse = ApiResponse<Record<string, unknown>>;

/** getPrograms response */
export type GetProgramsResponse = ApiResponse<ProgramResponse[]>;

/** getProgramsOverview response */
export type GetProgramsOverviewResponse =
    ApiResponse<Record<string, unknown>>;

/** getSchoolsDistribution response */
export type GetSchoolsDistributionResponse = ApiResponse<unknown[]>;

/** getCommunicationThread / getCommunicationThreadV2 response */
export type GetCommunicationThreadResponse = ApiResponse<CommunicationResponse[]>;

/** getMyCommunicationThreadV2 response */
export type GetMyCommunicationThreadResponse = ApiResponse<CommunicationResponse[]>;

/** Meeting item (student meetings) */
export interface MeetingResponse {
    _id: string;
    title?: string;
    dateTime?: string;
    location?: string;
    description?: string;
    notes?: string;
    isConfirmed?: boolean;
    isConfirmedReceiver?: boolean;
    isConfirmedRequester?: boolean;
    attended?: boolean;
    meetingLink?: string;
    requester_id?: string[];
    receiver_id?: string[];
    [key: string]: unknown;
}

/** getStudentMeetings response */
export type GetStudentMeetingsResponse = ApiResponse<MeetingResponse[]>;

/** getStudentMeeting response */
export type GetStudentMeetingResponse = ApiResponse<MeetingResponse>;

/** getActiveThreads response */
export type GetActiveThreadsResponse = ApiResponse<DocumentThreadResponse[]>;

/** getThreadsByStudent response */
export type GetThreadsByStudentResponse = ApiResponse<DocumentThreadResponse[]>;

/** getInterviews response */
export type GetInterviewsResponse = ApiResponse<InterviewResponse[]>;

/** getInterview response */
export type GetInterviewResponse = ApiResponse<InterviewResponse>;

/** getUsersCount response */
export interface GetUsersCountResponse {
    success?: boolean;
    studentCount?: number;
    agentCount?: number;
    editorCount?: number;
    externalCount?: number;
    adminCount?: number;
    [key: string]: unknown;
}

/** getProgramTicketsV2 response */
export type GetProgramTicketsResponse = ApiResponse<unknown[]>;

/** Paginated list response (many APIs return { data: T[], total?: number }) */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total?: number;
}

// --- Component-shared types (for props / display) ---

/** Document thread message with optional file attachments (FileItem, FilesList) */
export interface DocumentThreadMessage {
    _id?: string;
    user_id?: { firstname?: string; lastname?: string;[key: string]: unknown };
    message?: string;
    file_path?: string;
    file?: Array<{ name: string; path: string }>;
    createdAt?: string | Date;
}

/** Admissions stat table row (AdmissionsStat) */
export interface AdmissionsStatRow {
    id: string;
    school?: string;
    program_name?: string;
    degree?: string;
    semester?: string;
    applicationCount?: number;
    finalEnrolmentCount?: number;
    admissionCount?: number;
    rejectionCount?: number;
    pendingResultCount?: number;
}

/** Open task row (CVMLRL Overview/Dashboard, Essay Overview) */
export interface OpenTaskRow {
    student_id?: string | IStudentResponse;
    application_id?: string;
    user_id?: string;
    id: string;
    show?: boolean;
    isFinalVersion?: boolean;
    flag_by_user_id?: string[];
    file_type?: string;
    latest_message_left_by_id?: string;
    [key: string]: unknown;
}
