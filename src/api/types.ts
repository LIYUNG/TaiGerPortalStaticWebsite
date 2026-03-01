import type { AxiosInstance } from 'axios';
import type { IUser, IApplication, IDocumentthread } from '@taiger-common/model';

// ---------------------------------------------------------------------------
// Frontend-specific types (no equivalent in @taiger-common/model)
// ---------------------------------------------------------------------------

import type { IProgramWithId, IUserWithId, IStudentResponse, IApplicationWithId } from '@taiger-common/model';

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

/** Application object as returned by API / used in student.applications. */
export type Application = Omit<
    IApplication,
    'decided' | 'closed' | 'admission'
> & {
    decided?: string;
    closed?: string;
    admission?: string;
    _id?: string | { toString: () => string };
    programId?: IProgramWithId;
    application_year?: unknown;
    doc_modification_thread?: unknown[];
    uni_assist?: { status?: string; vpd_file_path?: string; vpd_paid_confirmation_file_path?: string; isPaid?: boolean };
    isLocked?: boolean;
    admission_letter?: { status?: string; admission_file_path?: string };
    interview_id?: string;
    interview_status?: string;
    interview_training_event?: { start?: string;[key: string]: unknown };
};

/** Typed request helpers */
export type RequestInstance = AxiosInstance;

/** Auth context userdata state shape */
export interface AuthUserdataState {
    error: unknown;
    success: boolean;
    data: IUserWithId;
    isLoaded: boolean;
    res_modal_message: string;
    res_modal_status: number;
}

/** Auth context value (used by useAuth) */
export interface AuthContextValue {
    user: IUser;
    isAuthenticated: boolean;
    isLoaded: boolean;
    login: (data: IUser) => void;
    logout: () => void;
}

// --- API parameter types ---

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

/** Generic payload for PUT/PATCH */
export type ApiPayload = Record<string, unknown>;

/** Query string (e.g. for list filters) */
export type QueryString = string;

// --- Extended frontend response/display types ---

/** Program response from API (includes string _id; API may return date as string) */
export interface ProgramResponse
    extends Omit<IProgramWithId, 'updatedAt' | 'createdAt'> {
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
    student_id?: string & IStudentResponse;
    application_id?: string;
    doc_thread_id: IDocumentthread;
    user_id?: string;
    flag_by_user_id: string[];
    isFinalVersion?: boolean;
    latest_message_left_by_id?: string;
    messages?: Array<{
        _id?: string;
        user_id?:
        | string
        | { firstname?: string; lastname?: string;[key: string]: unknown };
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

/** Document thread message with optional file attachments */
export interface DocumentThreadMessage {
    _id?: string;
    user_id?: { firstname?: string; lastname?: string;[key: string]: unknown };
    message?: string;
    file_path?: string;
    file?: Array<{ name: string; path: string }>;
    createdAt?: string | Date;
}

/** Admissions stat table row */
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

/** Tasks overview (admin/editor dashboard counts) */
export interface TasksOverview {
    noEditorsStudents?: number;
    noEssayWritersEssays?: number;
    noTrainerInInterviewsStudents?: number;
    [key: string]: unknown;
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
