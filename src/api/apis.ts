import {
    BASE_URL,
    deleteData,
    getData,
    getDataBlob,
    postData,
    putData,
    request
} from './request';
import type {
    LoginCredentials,
    ResetPasswordPayload,
    ForgotPasswordPayload,
    ApiPayload,
    QueryString
} from './types';
import {
    // Model types
    type IUserWithId,
    type StudentId,
    type ApplicationId,
    type UserId,
    type ProgramId,
    type DocumentThreadId,
    type MessageId,
    type SurveyId,
    type TicketId,
    type MeetingId,
    type InterviewId,
    type LeadId,
    // Auth
    type AuthVerifyResponse,
    type AuthLoginResponse,
    type AuthOAuthCallbackResponse,
    type AuthRegisterResponse,
    type ForgotPasswordResponse,
    type ResetPasswordResponse,
    type ActivationResponse,
    type ResendActivationResponse,
    type LogoutResponse,
    // Audit
    type GetAuditLogResponse,
    // Search
    type GetQueryStudentsResultsResponse,
    type GetQueryResultsResponse,
    type GetQueryPublicResultsResponse,
    type GetQueryStudentResultsResponse,
    // Users
    type GetUsersResponse,
    type GetUsersCountResponse,
    type GetUsersOverviewResponse,
    type GetUserResponse,
    type AddUserResponse,
    type UpdateUserResponse,
    type DeleteUserResponse,
    type UpdateArchivUserResponse,
    // Students
    type GetStudentsResponse,
    type GetStudentResponse,
    type GetActiveStudentsResponse,
    type GetStudentDocLinksResponse,
    type GetStudentsAndDocLinksResponse,
    type UpdateArchivStudentsResponse,
    type UpdateStudentAgentsResponse,
    type UpdateStudentEditorsResponse,
    type UpdateStudentAttributesResponse,
    type UpdateDocumentationHelperLinkResponse,
    type UploadStudentFileResponse,
    type DeleteStudentFileResponse,
    type UploadVPDFileResponse,
    type DeleteVPDFileResponse,
    type SetAsNotNeededResponse,
    type SetUniAssistPaidResponse,
    type UpdateProfileDocStatusResponse,
    type GetStudentUniAssistResponse,
    type GetArchivStudentsResponse,
    type GetSameProgramStudentsResponse,
    // Applications
    type GetApplicationsResponse,
    type GetMyStudentsApplicationsResponse,
    type GetActiveStudentsApplicationsResponse,
    type GetStudentApplicationsResponse,
    type CreateApplicationResponse,
    type UpdateStudentApplicationsResponse,
    type UpdateApplicationResponse,
    type DeleteApplicationResponse,
    type RefreshApplicationResponse,
    type GetApplicationConflictsResponse,
    type GetApplicationTaskDeltasResponse,
    type UpdateStudentApplicationResultResponse,
    type GetAdmissionsResponse,
    type GetAdmissionsOverviewResponse,
    // Programs
    type GetProgramsResponse,
    type GetProgramsOverviewResponse,
    type GetSchoolsDistributionResponse,
    type GetDistinctSchoolsResponse,
    type UpdateSchoolAttributesResponse,
    type CreateProgramResponse,
    type UpdateProgramResponse,
    type DeleteProgramResponse,
    type GetProgramChangeRequestsResponse,
    type ReviewProgramChangeRequestsResponse,
    type RefreshProgramResponse,
    // Program Requirements
    type GetProgramRequirementsResponse,
    type GetProgramRequirementResponse,
    type GetProgramsAndKeywordSetsResponse,
    type CreateProgramRequirementResponse,
    type UpdateProgramRequirementResponse,
    type DeleteProgramRequirementResponse,
    // Courses / Keywords
    type GetAllCoursesResponse,
    type GetAllCourseResponse,
    type CreateAllCourseResponse,
    type UpdateAllCourseResponse,
    type DeleteAllCourseResponse,
    type GetCourseKeywordsetsResponse,
    type GetCourseKeywordsetResponse,
    type CreateKeywordsetResponse,
    type UpdateKeywordsetResponse,
    type DeleteKeywordsetResponse,
    GetCourseKeywordsetsResponseSchema,
    type GetStudentCoursesResponse,
    type UpdateStudentCoursesResponse,
    // Account
    type UpdateBannerResponse,
    type UpdateAgentBannerResponse,
    type UpdateAcademicBackgroundResponse,
    type UpdateLanguageSkillResponse,
    type UpdateApplicationPreferenceResponse,
    type GetMyAcademicBackgroundResponse,
    type GetTemplatesResponse,
    type UploadTemplateResponse,
    type DeleteTemplateFileResponse,
    type UpdatePersonalDataResponse,
    type UpdateCredentialsResponse,
    type UpdateOfficehoursResponse,
    // Documentations
    type GetCategorizedDocumentationResponse,
    type GetAllDocumentationsResponse,
    type GetDocumentationResponse,
    type CreateDocumentationResponse,
    type UpdateDocumentationResponse,
    type DeleteDocumentationResponse,
    type GetDocspageResponse,
    type UpdateDocspageResponse,
    type GetAllInternalDocumentationsResponse,
    type GetInternaldocResponse,
    type GetInternalDocumentationPageResponse,
    type UpdateInternalDocumentationPageResponse,
    type CreateInternaldocResponse,
    type UpdateInternaldocResponse,
    type DeleteInternaldocResponse,
    type UploadDocImageResponse,
    type UploadDocDocsResponse,
    // Document threads
    type GetActiveThreadsResponse,
    type GetThreadsByStudentResponse,
    type GetMyStudentThreadsResponse,
    type GetMyStudentThreadMetricsResponse,
    type GetCheckDocumentPatternResponse,
    type GetMessagesThreadResponse,
    type SetFileFinalResponse,
    type InitGeneralThreadResponse,
    type InitApplicationThreadResponse,
    type SubmitMessageResponse,
    type DeleteGeneralFileThreadResponse,
    type DeleteProgramSpecificFileThreadResponse,
    type DeleteMessageInThreadResponse,
    type UpdateEssayWriterResponse,
    type UploadDocumentThreadImageResponse,
    type PutOriginAuthorConfirmedResponse,
    type IgnoreMessageThreadResponse,
    type PutThreadFavoriteResponse,
    type GetSurveyInputsResponse,
    type PostSurveyInputResponse,
    type PutSurveyInputResponse,
    type DeleteSurveyInputResponse,
    // Portals
    type GetPortalCredentialsResponse,
    type CreatePortalCredentialsResponse,
    // Communications
    type GetCommunicationThreadResponse,
    type GetMyCommunicationThreadResponse,
    type GetCommunicationUnreadNumberResponse,
    type LoadCommunicationThreadResponse,
    type PostCommunicationResponse,
    type UpdateCommunicationMessageResponse,
    type DeleteCommunicationMessageResponse,
    type IgnoreCommunicationMessageResponse,
    // Events
    type GetActiveEventsNumberResponse,
    type GetEventsResponse,
    type GetBookedEventsResponse,
    type PostEventResponse,
    type ConfirmEventResponse,
    type UpdateEventResponse,
    type DeleteEventResponse,
    // Teams / Stats
    type GetTeamMembersResponse,
    type GetStatisticsOverviewResponse,
    type GetStatisticsAgentsResponse,
    type GetStatisticsKPIResponse,
    type GetStatisticsResponseTimeResponse,
    type GetTasksOverviewResponse,
    type GetIsManagerResponse,
    type GetResponseIntervalByStudentResponse,
    type GetAgentProfileResponse,
    type GetExpenseResponse,
    // Notes
    type GetStudentNotesResponse,
    type UpdateStudentNotesResponse,
    // Interviews
    type GetInterviewsResponse,
    type GetInterviewResponse,
    type GetMyInterviewsResponse,
    type GetInterviewsByProgramIdResponse,
    type GetInterviewsByStudentIdResponse,
    type GetInterviewSurveyResponse,
    type UpdateInterviewSurveyResponse,
    type CreateInterviewResponse,
    type DeleteInterviewResponse,
    type UpdateInterviewResponse,
    type AddInterviewTrainingDateTimeResponse,
    // Tickets & Complaints
    type GetProgramTicketsResponse,
    type GetProgramTicketResponse,
    type CreateTicketResponse,
    type UpdateTicketResponse,
    type DeleteTicketResponse,
    type GetComplaintsResponse,
    type GetComplaintResponse,
    type CreateComplaintResponse,
    type UpdateComplaintResponse,
    type DeleteComplaintResponse,
    type PostMessageInComplaintResponse,
    type DeleteMessageInComplaintResponse,
    // CRM
    type GetCRMStatsResponse,
    type GetCRMLeadsResponse,
    type GetCRMLeadResponse,
    type GetCRMMeetingsResponse,
    type GetCRMMeetingResponse,
    type UpdateCRMMeetingResponse,
    type GetCRMDealsResponse,
    type CreateCRMDealResponse,
    type UpdateCRMDealResponse,
    type GetCRMSalesRepsResponse,
    type InstantInviteResponse,
    // Permissions
    type UpdateUserPermissionResponse,
    // Widgets / AI
    type WidgetTranscriptResponse,
    type WidgetDownloadJsonResponse,
    type TranscriptAnalyserResponse,
    type AnalyzedFileDownloadResponse,
    type ProcessProgramListResponse,
    type TaigerAiResponse,
    type CvmlrlAiResponse,
    type GetProgramResponse,
    GetAllCoursesResponseSchema,
    GetProgramResponseSchema
} from '@taiger-common/model';

export const login = (credentials: LoginCredentials) =>
    request.post<AuthLoginResponse>('/auth/login', credentials);

export const googleOAuthCallback = (code: string) =>
    postData<AuthOAuthCallbackResponse>('/auth/oauth/google/callback', {
        code
    });

export const logout = () => request.get<LogoutResponse>('/auth/logout');

export const register = (credentials: LoginCredentials) =>
    request.post<AuthRegisterResponse>('/auth/signup', credentials);

export const forgotPassword = ({ email }: ForgotPasswordPayload) =>
    request.post<ForgotPasswordResponse>('/auth/forgot-password', { email });

export const resetPassword = ({
    email,
    password,
    token
}: ResetPasswordPayload) =>
    request.post<ResetPasswordResponse>('/auth/reset-password', {
        email,
        password,
        token
    });

export const activation = (email: string, token: string) =>
    request.post<ActivationResponse>('/auth/activation', { email, token });

// TODO: make resendActivation works
export const resendActivation = ({ email }: ForgotPasswordPayload) =>
    request.post<ResendActivationResponse>('/auth/resend-activation', {
        email
    });

export const verify = () => request.get('/auth/verify');
export const verifyV2 = () => getData<AuthVerifyResponse>('/auth/verify');

// Audit Log APIs
export const getAuditLog = (queryString: QueryString) =>
    getData<GetAuditLogResponse>(`/api/audit?${queryString}`);

// Search API
export const getQueryStudentsResults = (keywords: string) =>
    request.get<GetQueryStudentsResultsResponse>(
        `/api/search/students?q=${keywords}`
    );
export const getQueryResults = (keywords: string) =>
    request.get<GetQueryResultsResponse>(`/api/search?q=${keywords}`);
export const getQueryPublicResults = (keywords: string) =>
    request.get<GetQueryPublicResultsResponse>(
        `/api/search/public?q=${keywords}`
    );
export const getQueryStudentResults = (keywords: string) =>
    request.get<GetQueryStudentResultsResponse>(
        `/api/communications?q=${keywords}`
    );
// User APIs
export const getUsers = (queryString: QueryString) =>
    request.get<GetUsersResponse>(`/api/users?${queryString}`);
export const getUsersCount = () =>
    getData<GetUsersCountResponse>('/api/users/count');
export const getUsersOverview = () =>
    getData<GetUsersOverviewResponse>('/api/users/overview');
export const getUser = (user_id: UserId) =>
    request.get<GetUserResponse>(`/api/users/${user_id}`);
export const addUser = (user_information: ApiPayload) =>
    request.post<AddUserResponse>('/api/users', user_information);

export const deleteUser = ({ id }: { id: string }) =>
    deleteData<DeleteUserResponse>(`/api/users/${id}`);

export const updateUser = (user: IUserWithId) =>
    postData<UpdateUserResponse>(`/api/users/${user._id}`, user);

export const changeUserRole = ({ id, role }: { id: string; role: string }) =>
    updateUser({ _id: id, role } as IUserWithId);

export const getStudents = () =>
    request.get<GetStudentsResponse>(`/api/students`);

export const getStudentsV3 = (queryString: QueryString) =>
    getData<GetStudentsResponse>(`/api/students/v3?${queryString}`);

export const getStudent = (studentId: string) =>
    request.get<GetStudentResponse>(`/api/students/${studentId}`);

export const getApplications = (queryString: QueryString) =>
    getData<GetApplicationsResponse>(`/api/applications?${queryString}`);

export const getMyStudentsApplications = ({
    userId,
    queryString
}: {
    userId: UserId;
    queryString: QueryString;
}) =>
    getData<GetMyStudentsApplicationsResponse>(
        `/api/applications/taiger-user/${userId}?${queryString}`
    );

export const getActiveStudentsApplications = () =>
    getData<GetActiveStudentsApplicationsResponse>(
        `/api/applications/all/active/applications`
    );

export const getActiveStudents = (queryString: QueryString) =>
    getData<GetActiveStudentsResponse>(`/api/students/active?${queryString}`);

export const getAdmissions = (queryString: QueryString) =>
    getData<GetAdmissionsResponse>(`/api/admissions?${queryString}`);

export const getAdmissionsOverview = () =>
    getData<GetAdmissionsOverviewResponse>(`/api/admissions/overview`);

export const getApplicationConflicts = () =>
    request.get<GetApplicationConflictsResponse>(
        `/api/student-applications/conflicts`
    );

export const getApplicationTaskDeltas = () =>
    request.get<GetApplicationTaskDeltasResponse>(
        `/api/student-applications/deltas`
    );

// TODO: thread creation attached to application problem. (thread creation is ok))
export const createApplicationV2 = ({
    studentId,
    program_ids
}: {
    studentId: StudentId;
    program_ids: string[];
}) =>
    postData<CreateApplicationResponse>(
        `/api/applications/student/${studentId}`,
        {
            program_id_set: program_ids
        }
    );

// Tested manually OK.
export const getApplicationStudentV2 = (studentId: StudentId) =>
    getData<GetStudentApplicationsResponse>(
        `/api/applications/student/${studentId}`
    );

// TODO:
export const updateStudentApplications = (
    studentId: StudentId,
    applications: ApiPayload,
    applying_program_count: number
) =>
    request.put<UpdateStudentApplicationsResponse>(
        `/api/applications/student/${studentId}`,
        {
            applications,
            applying_program_count
        }
    );

export const updateStudentApplication = (
    studentId: StudentId,
    application_id: string,
    payload: ApiPayload
) =>
    request.put<UpdateApplicationResponse>(
        `/api/applications/student/${studentId}/${application_id}`,
        payload
    );

// TODO: thread is empty!! application delete ok.
export const deleteApplicationStudentV2 = (applicationId: ApplicationId) =>
    request.delete<DeleteApplicationResponse>(
        `/api/applications/application/${applicationId}`
    );

export const refreshApplication = (applicationId: string) =>
    postData<RefreshApplicationResponse>(
        `/api/applications/${applicationId}/refresh`,
        {}
    );

export const getStudentUniAssistV2 = ({ studentId }: { studentId: string }) =>
    getData<GetStudentUniAssistResponse>(`/api/uniassist/${studentId}`);

export const getArchivStudents = (TaiGerStaffId?: string) =>
    request.get<GetArchivStudentsResponse>(
        `/api/teams/archiv/${TaiGerStaffId ?? ''}`
    );

export const updateArchivStudents = (
    studentId: StudentId,
    isArchived: boolean,
    shouldInform: boolean
) =>
    request.post<UpdateArchivStudentsResponse>(
        `/api/students/archiv/${studentId}`,
        {
            isArchived,
            shouldInform
        }
    );

export const updateArchivUser = ({
    user_id,
    isArchived
}: {
    user_id: UserId;
    isArchived: boolean;
}) =>
    postData<UpdateArchivUserResponse>(`/api/users/archiv/${user_id}`, {
        isArchived: isArchived
    });

// Student APIs
export const updateAgents = (agentsId: string[], studentId: StudentId) =>
    request.post<UpdateStudentAgentsResponse>(
        `/api/students/${studentId}/agents`,
        agentsId
    );

export const updateEditors = (editorsId: string[], studentId: StudentId) =>
    request.post<UpdateStudentEditorsResponse>(
        `/api/students/${studentId}/editors`,
        editorsId
    );

export const updateAttributes = (
    attributesId: string[],
    studentId: StudentId
) =>
    request.post<UpdateStudentAttributesResponse>(
        `/api/students/${studentId}/attributes`,
        attributesId
    );

export const downloadProfile = (category: string, studentId: StudentId) =>
    request.get(`/api/students/${studentId}/files/${category}`, {
        responseType: 'blob'
    });

export const getPdfV2 = ({ apiPath }: { apiPath: string }) =>
    getDataBlob(apiPath, {
        responseType: 'blob'
    });

export const uploadforstudentV2 = ({
    category,
    studentId,
    formData
}: {
    category: string;
    studentId: StudentId;
    formData: FormData;
}) =>
    postData<UploadStudentFileResponse>(
        `/api/students/${studentId}/files/${category}`,
        formData
    );

export const getStudentAndDocLinks = (studentId: StudentId) =>
    request.get<GetStudentDocLinksResponse>(
        `/api/students/doc-links/${studentId}`
    );

export const getStudentsAndDocLinks2 = (queryString: QueryString) =>
    getData<GetStudentsAndDocLinksResponse>(
        `/api/students/doc-links?${queryString}`
    );

export const updateDocumentationHelperLink = (
    link: string,
    key: string,
    category: string
) =>
    request.post<UpdateDocumentationHelperLinkResponse>(
        `/api/students/doc-links`,
        { link, key, category }
    );

export const deleteFileV2 = ({
    category,
    studentId
}: {
    category: string;
    studentId: StudentId;
}) =>
    deleteData<DeleteStudentFileResponse>(
        `/api/students/${studentId}/files/${category}`
    );

export const uploadVPDforstudentV2 = ({
    studentId,
    applicationId,
    data,
    fileType
}: {
    studentId: StudentId;
    applicationId: ApplicationId;
    data: ApiPayload;
    fileType: string;
}) =>
    postData<UploadVPDFileResponse>(
        `/api/students/${studentId}/vpd/${applicationId}/${fileType}`,
        data
    );

export const deleteVPDFileV2 = ({
    studentId,
    applicationId,
    fileType
}: {
    studentId: StudentId;
    applicationId: ApplicationId;
    fileType: string;
}) =>
    deleteData<DeleteVPDFileResponse>(
        `/api/students/${studentId}/vpd/${applicationId}/${fileType}`
    );

export const SetAsNotNeededV2 = ({
    studentId,
    applicationId
}: {
    studentId: StudentId;
    applicationId: ApplicationId;
}) =>
    putData<SetAsNotNeededResponse>(
        `/api/students/${studentId}/vpd/${applicationId}/VPD`,
        {}
    );

export const SetUniAssistPaidV2 = ({
    studentId,
    applicationId,
    isPaid
}: {
    studentId: StudentId;
    applicationId: ApplicationId;
    isPaid: boolean;
}) =>
    postData<SetUniAssistPaidResponse>(
        `/api/students/${studentId}/vpd/${applicationId}/payments`,
        {
            isPaid
        }
    );

export const updateProfileDocumentStatus = (
    category: string,
    studentId: StudentId,
    status: string,
    message: string
) =>
    request.post<UpdateProfileDocStatusResponse>(
        `/api/students/${studentId}/${category}/status`,
        {
            status: status,
            feedback: message
        }
    );

export const updateProfileDocumentStatusV2 = ({
    category,
    student_id,
    status,
    feedback
}: {
    category: string;
    student_id: string;
    status: string;
    feedback: string;
}) =>
    postData<UpdateProfileDocStatusResponse>(
        `/api/students/${student_id}/${category}/status`,
        {
            status,
            feedback
        }
    );

// Account APIs
export const getTemplates = () =>
    request.get<GetTemplatesResponse>(`/api/account/files/template`);
export const uploadtemplate = (category: string, data: ApiPayload) =>
    request.post<UploadTemplateResponse>(
        `/api/account/files/template/${category}`,
        data
    );
export const deleteTemplateFile = (category: string) =>
    request.delete<DeleteTemplateFileResponse>(
        `/api/account/files/template/${category}`
    );
export const getTemplateDownload = (category: string) =>
    request.get(`/api/account/files/template/${category}`, {
        responseType: 'blob'
    });

export const WidgetTranscriptanalyserV2 = (
    language: string,
    courses: ApiPayload,
    requirementIds: ApiPayload,
    factor: ApiPayload
) =>
    request.post<WidgetTranscriptResponse>(
        `/api/widgets/transcript/engine/v2/${language}`,
        {
            courses,
            requirementIds,
            factor
        }
    );

export const WidgetanalyzedFileV2Download = (adminId: string) =>
    request.get<WidgetDownloadJsonResponse>(
        `/api/widgets/transcript/v2/${adminId}`
    );

export const WidgetExportMessagePDF = (student_id: string) =>
    request.get(`/api/widgets/messages/export/${student_id}`, {
        responseType: 'blob'
    });

export const transcriptanalyser_testV2 = ({
    language,
    studentId,
    requirementIds,
    factor
}: {
    language: string;
    studentId: string;
    requirementIds: string[];
    factor: number;
}) =>
    request.post<TranscriptAnalyserResponse>(
        `/api/courses/transcript/v2/${studentId}/${language}`,
        {
            requirementIds,
            factor
        }
    );

export const analyzedFileV2Download = (user_id: UserId) =>
    request.get<AnalyzedFileDownloadResponse>(
        `/api/courses/transcript/v2/${user_id}`
    );

export async function getCourseKeywordSets(): Promise<GetCourseKeywordsetsResponse> {
    const data = await getData<unknown>(`/api/course-keywords`);
    return GetCourseKeywordsetsResponseSchema.parse(
        data
    ) as GetCourseKeywordsetsResponse;
}
export const getCourseKeywordSet = (keywordsSetId: string) =>
    request.get<GetCourseKeywordsetResponse>(
        `/api/course-keywords/${keywordsSetId}`
    );
export const postKeywordSet = (keywordsSet: ApiPayload) =>
    request.post<CreateKeywordsetResponse>(
        '/api/course-keywords/new',
        keywordsSet
    );
export const putKeywordSet = (keywordsSetId: string, keywordsSet: ApiPayload) =>
    request.put<UpdateKeywordsetResponse>(
        `/api/course-keywords/${keywordsSetId}`,
        keywordsSet
    );
export const deleteKeywordSet = (keywordsSetId: string) =>
    request.delete<DeleteKeywordsetResponse>(
        `/api/course-keywords/${keywordsSetId}`
    );

// Courses DB
export async function getAllCourses(): Promise<GetAllCoursesResponse> {
    const data = await getData<GetAllCoursesResponse>(`/api/all-courses`);
    return GetAllCoursesResponseSchema.parse(data) as GetAllCoursesResponse;
}
export const getCourse = ({ courseId }: { courseId: string }) =>
    getData<GetAllCourseResponse>(`/api/all-courses/${courseId}`);
export const updateCourse = ({
    courseId,
    payload
}: {
    courseId: string;
    payload: ApiPayload;
}) => putData<UpdateAllCourseResponse>(`/api/all-courses/${courseId}`, payload);
export const deleteCourse = ({ courseId }: { courseId: string }) =>
    deleteData<DeleteAllCourseResponse>(`/api/all-courses/${courseId}`);
export const createCourse = ({ payload }: { payload: ApiPayload }) =>
    postData<CreateAllCourseResponse>(`/api/all-courses`, payload);

export const getProgramRequirements = () =>
    request.get<GetProgramRequirementsResponse>(`/api/program-requirements`);

export const getProgramRequirementsV2 = () =>
    getData<GetProgramRequirementsResponse>(`/api/program-requirements`);

export const getSameProgramStudents = ({ programId }: { programId: string }) =>
    getData<GetSameProgramStudentsResponse>(
        `/api/programs/same-program-students/${programId}`
    );

export const postProgramRequirements = (payload: ApiPayload) =>
    request.post<CreateProgramRequirementResponse>(
        `/api/program-requirements/new`,
        payload
    );
export const getProgramsAndCourseKeywordSets = () =>
    getData<GetProgramsAndKeywordSetsResponse>(
        `/api/program-requirements/programs-and-keywords`
    );
export const getProgramRequirement = (programRequirementId: string) =>
    request.get<GetProgramRequirementResponse>(
        `/api/program-requirements/${programRequirementId}`
    );
export const putProgramRequirement = (
    programRequirementId: string,
    payload: ApiPayload
) =>
    request.put<UpdateProgramRequirementResponse>(
        `/api/program-requirements/${programRequirementId}`,
        payload
    );
export const deleteProgramRequirement = (programRequirementId: string) =>
    request.delete<DeleteProgramRequirementResponse>(
        `/api/program-requirements/${programRequirementId}`
    );

export const updateStudentApplicationResult = (
    studentId: StudentId,
    applicationId: ApplicationId,
    programId: string,
    result: string,
    data: FormData | ApiPayload
) =>
    request.post<UpdateStudentApplicationResultResponse>(
        `/api/account/applications/result/${studentId}/${applicationId}/${programId}/${result}`,
        data
    );

export const deleteGenralFileThread = (
    documentsthreadId: string,
    studentId: StudentId
) =>
    request.delete<DeleteGeneralFileThreadResponse>(
        `/api/document-threads/${documentsthreadId}/${studentId}`
    );

export const deleteProgramSpecificFileThread = (
    documentsthreadId: string,
    application_id: string,
    studentId: StudentId
) =>
    request.delete<DeleteProgramSpecificFileThreadResponse>(
        `/api/document-threads/${documentsthreadId}/${application_id}/${studentId}`
    );

export const getCheckDocumentPatternIsPassed = (
    thread_id: string,
    file_type: string
) =>
    request.get<GetCheckDocumentPatternResponse>(
        `/api/document-threads/pattern/check/${thread_id}/${file_type}`
    );

export const getActiveThreads = (queryString: QueryString) =>
    getData<GetActiveThreadsResponse>(
        `/api/document-threads/overview/all?${queryString}`
    );

export const getMyStudentThreadMetrics = () =>
    request.get<GetMyStudentThreadMetricsResponse>(
        `/api/document-threads/overview/my-student-metrics`
    );

export const getThreadsByStudent = (studentId: StudentId) =>
    getData<GetThreadsByStudentResponse>(
        `/api/document-threads/student-threads/${studentId}`
    );

export const getMyStudentsThreads = ({
    userId,
    queryString
}: {
    userId: UserId;
    queryString: QueryString;
}) =>
    getData<GetMyStudentThreadsResponse>(
        `/api/document-threads/overview/taiger-user/${userId}?${queryString}`
    );

export const SetFileAsFinal = (
    documentsthreadId: string,
    studentId: StudentId,
    application_id: string
) =>
    request.put<SetFileFinalResponse>(
        `/api/document-threads/${documentsthreadId}/${studentId}`,
        {
            application_id
        }
    );

export const updateEssayWriter = (
    editor_id: Record<string, boolean>,
    documentsthreadId: string
) =>
    request.post<UpdateEssayWriterResponse>(
        `/api/document-threads/${documentsthreadId}/essay`,
        editor_id
    );

export const putThreadFavorite = (documentsthreadId: string) =>
    request.put<PutThreadFavoriteResponse>(
        `/api/document-threads/${documentsthreadId}/favorite`
    );

// Portal Informations APIs
export const getPortalCredentials = (student_id: string) =>
    getData<GetPortalCredentialsResponse>(
        `/api/portal-informations/${student_id}`
    );
export const postPortalCredentials = (
    student_id: string,
    applicationId: ApplicationId,
    credentials: ApiPayload
) =>
    request.post<CreatePortalCredentialsResponse>(
        `/api/portal-informations/${student_id}/${applicationId}`,
        credentials
    );

// Course, Transcript APIs
export const getMycourses = (student_id: string) =>
    request.get<GetStudentCoursesResponse>(`/api/courses/${student_id}`);
export const putMycourses = (student_id: string, locked: ApiPayload) =>
    request.put<UpdateStudentCoursesResponse>(
        `/api/courses/${student_id}`,
        locked
    );

// Documentation APIs
// Internal docs
export const getInternalDocumentationPage = () =>
    request.get<GetInternalDocumentationPageResponse>(
        `/api/docs/taiger/internal/confidential`
    );
export const updateInternalDocumentationPage = (doc: ApiPayload) =>
    request.put<UpdateInternalDocumentationPageResponse>(
        `/api/docs/taiger/internal/confidential`,
        doc
    );
// External docs
export const uploadImage = (formData: FormData) =>
    request.post<UploadDocImageResponse>(`/api/docs/upload/image`, formData);
export const uploadDocDocs = (formData: FormData) =>
    request.post<UploadDocDocsResponse>(`/api/docs/upload/docs`, formData);
export const getCategorizedDocumentationPage = (category: string) =>
    request.get<GetDocspageResponse>(`/api/docs/pages/${category}`);
export const updateDocumentationPage = (category: string, doc: ApiPayload) =>
    request.put<UpdateDocspageResponse>(`/api/docs/pages/${category}`, doc);
export const getCategorizedDocumentation = (category: string) =>
    request.get<GetCategorizedDocumentationResponse>(`/api/docs/${category}`);
export const deleteDocumentation = (doc_id: string) =>
    request.delete<DeleteDocumentationResponse>(`/api/docs/${doc_id}`);
export const getDocumentation = (doc_id: string) =>
    request.get<GetDocumentationResponse>(`/api/docs/search/${doc_id}`);
export const getAllDocumentations = () =>
    request.get<GetAllDocumentationsResponse>(`/api/docs/all`);

export const updateDocumentation = (doc_id: string, doc: ApiPayload) =>
    request.put<UpdateDocumentationResponse>(`/api/docs/${doc_id}`, doc);
export const createDocumentation = (doc: ApiPayload) =>
    request.post<CreateDocumentationResponse>(`/api/docs`, doc);

export const getInternalDocumentation = (doc_id: string) =>
    request.get<GetInternaldocResponse>(`/api/docs/internal/search/${doc_id}`);
export const getAllInternalDocumentations = () =>
    request.get<GetAllInternalDocumentationsResponse>(`/api/docs/internal/all`);
export const updateInternalDocumentation = (doc_id: string, doc: ApiPayload) =>
    request.put<UpdateInternaldocResponse>(`/api/docs/internal/${doc_id}`, doc);
export const createInternalDocumentation = (doc: ApiPayload) =>
    request.post<CreateInternaldocResponse>(`/api/docs/internal`, doc);
export const deleteInternalDocumentation = (doc_id: string) =>
    request.delete<DeleteInternaldocResponse>(`/api/docs/internal/${doc_id}`);

// Program APIs
export const getProgramsV2 = () =>
    getData<GetProgramsResponse>('/api/programs');
export const getProgramsOverview = () =>
    getData<GetProgramsOverviewResponse>('/api/programs/overview');
export const getSchoolsDistribution = () =>
    getData<GetSchoolsDistributionResponse>(
        '/api/programs/schools-distribution'
    );
export const getDistinctSchools = () =>
    request.get<GetDistinctSchoolsResponse>('/api/programs/schools');
export const updateSchoolAttributes = (schoolAttributes: ApiPayload) =>
    request.put<UpdateSchoolAttributesResponse>(
        '/api/programs/schools',
        schoolAttributes
    );

export const getProgramV2 = async (
    programId: string
): Promise<GetProgramResponse> => {
    const data = await getData<GetProgramResponse>(
        `/api/programs/${programId}`
    );
    return GetProgramResponseSchema.parse(data) as GetProgramResponse;
};

export const deleteProgramV2 = ({ program_id }: { program_id: string }) =>
    deleteData<DeleteProgramResponse>(`/api/programs/${program_id}`);

export const createProgramV2 = ({ program }: { program: ApiPayload }) =>
    postData<CreateProgramResponse>('/api/programs', program);

export const updateProgram = (program: {
    _id: string;
    [key: string]: unknown;
}) =>
    request.put<UpdateProgramResponse>(`/api/programs/${program._id}`, program);

export const updateProgramV2 = ({
    program
}: {
    program: { _id: string; [key: string]: unknown };
}) => putData(`/api/programs/${program._id}`, program);

export const getProgramChangeRequests = (programId: string) =>
    request.get<GetProgramChangeRequestsResponse>(
        `/api/programs/${programId}/change-requests`
    );

export const reviewProgramChangeRequests = (requestId: string) =>
    request.post<ReviewProgramChangeRequestsResponse>(
        `/api/programs/review-changes/${requestId}`
    );

export const refreshProgram = (programId: ProgramId) =>
    postData<RefreshProgramResponse>(`/api/programs/${programId}/refresh`, {});

// Docs APIs
export const uploadDocumentThreadImage = (
    documentsthreadId: string,
    studentId: StudentId,
    formData: FormData
) =>
    request.post<UploadDocumentThreadImageResponse>(
        `/api/document-threads/image/${documentsthreadId}/${studentId}`,
        formData
    );

export const putOriginAuthorConfirmedByStudent = (
    documentsthreadId: string,
    studentId: StudentId,
    checked: boolean
) =>
    request.put<PutOriginAuthorConfirmedResponse>(
        `/api/document-threads/${documentsthreadId}/${studentId}/origin-author`,
        {
            checked
        }
    );

export const SubmitMessageWithAttachment = (
    documentsthreadId: DocumentThreadId,
    studentId: StudentId,
    newFile: File | FormData
) =>
    postData<SubmitMessageResponse>(
        `/api/document-threads/${documentsthreadId}/${studentId}`,
        newFile
    );

export const getMessageFileDownload = (
    documentsthreadId: DocumentThreadId,
    messageId: MessageId,
    fileId: string
) =>
    request.get(
        `/api/document-threads/${documentsthreadId}/${messageId}/${fileId}`,
        {
            responseType: 'blob'
        }
    );

export const getMyCommunicationUnreadNumber = () =>
    request.get<GetCommunicationUnreadNumberResponse>(
        '/api/communications/ping/all'
    );
export const getMyCommunicationThread = () =>
    request.get<GetMyCommunicationThreadResponse>('/api/communications/all');
export const getMyCommunicationThreadV2 = () =>
    getData<GetMyCommunicationThreadResponse>('/api/communications/all');
export const getCommunicationThread = (studentId: StudentId) =>
    request.get<GetCommunicationThreadResponse>(
        `/api/communications/${studentId}`
    );
export const getCommunicationThreadV2 = ({
    studentId
}: {
    studentId: StudentId;
}) =>
    getData<GetCommunicationThreadResponse>(`/api/communications/${studentId}`);
export const loadCommunicationThread = (
    studentId: StudentId,
    pageNumber: number
) =>
    request.get<LoadCommunicationThreadResponse>(
        `/api/communications/${studentId}/pages/${pageNumber}`
    );
export const postCommunicationThreadV2 = ({
    studentId,
    formData
}: {
    studentId: StudentId;
    formData: FormData | ApiPayload;
}) =>
    postData<PostCommunicationResponse>(
        `/api/communications/${studentId}`,
        formData
    );
export const updateAMessageInCommunicationThreadV2 = ({
    communication_id,
    communication_messageId,
    message
}: {
    communication_id: string;
    communication_messageId: string;
    message: ApiPayload;
}) =>
    putData<UpdateCommunicationMessageResponse>(
        `/api/communications/${communication_id}/${communication_messageId}`,
        { message }
    );

export const deleteAMessageInCommunicationThreadV2 = ({
    student_id,
    communication_messageId
}: {
    student_id: StudentId;
    communication_messageId: string;
}) =>
    deleteData<DeleteCommunicationMessageResponse>(
        `/api/communications/${student_id}/${communication_messageId}`
    );

export const IgnoreMessageV2 = ({
    student_id,
    communication_messageId,
    message,
    ignoreMessageState
}: {
    student_id: StudentId;
    communication_messageId: string;
    message: ApiPayload;
    ignoreMessageState: boolean | string;
}) =>
    putData<IgnoreCommunicationMessageResponse>(
        `/api/communications/${student_id}/${communication_messageId}/${ignoreMessageState}/ignore`,
        message
    );

export const getSurveyInputs = (documentsthreadId: string) =>
    request.get<GetSurveyInputsResponse>(
        `/api/document-threads/${documentsthreadId}/survey-inputs`
    );

export const putSurveyInput = (
    surveyId: string,
    input: ApiPayload,
    informEditor: boolean
) =>
    request.put<PutSurveyInputResponse>(
        `/api/document-threads/survey-input/${surveyId}`,
        {
            input,
            informEditor
        }
    );

export const postSurveyInput = (input: ApiPayload, informEditor: boolean) =>
    request.post<PostSurveyInputResponse>(
        `/api/document-threads/survey-input/`,
        {
            input,
            informEditor
        }
    );

export const resetSurveyInput = (surveyId: SurveyId) =>
    request.delete<DeleteSurveyInputResponse>(
        `/api/document-threads/survey-input/${surveyId}`
    );

export const getMessagThread = (documentsthreadId: DocumentThreadId) =>
    request.get<GetMessagesThreadResponse>(
        `/api/document-threads/${documentsthreadId}`
    );
export const deleteAMessageInThread = (
    documentsthreadId: DocumentThreadId,
    messageId: MessageId
) =>
    request.delete<DeleteMessageInThreadResponse>(
        `/api/document-threads/delete/${documentsthreadId}/${messageId}`
    );

export const initGeneralMessageThread = (
    studentId: StudentId,
    document_catgory: string
) =>
    request.post<InitGeneralThreadResponse>(
        `/api/document-threads/init/general/${studentId}/${document_catgory}`
    );

export const IgnoreMessageThread = (
    documentThreadId: DocumentThreadId,
    documentsthreadMessageId: MessageId,
    documentsthreadMessage: ApiPayload,
    ignoreMessageState: boolean | string
) =>
    request.put<IgnoreMessageThreadResponse>(
        `/api/document-threads/${documentThreadId}/${documentsthreadMessageId}/${ignoreMessageState}/ignored`,
        documentsthreadMessage
    );

export const initApplicationMessageThread = (
    studentId: StudentId,
    applicationId: ApplicationId,
    document_catgory: string
) =>
    request.post<InitApplicationThreadResponse>(
        `/api/document-threads/init/application/${studentId}/${applicationId}/${document_catgory}`
    );

// remove Banner/notification
export const updateBanner = (notification_key: string) =>
    request.post<UpdateBannerResponse>(`/api/account/student/notifications`, {
        notification_key
    });

export const updateAgentBanner = (
    notification_key: string,
    student_id: string
) =>
    request.post<UpdateAgentBannerResponse>(
        `/api/account/agent/notifications`,
        {
            notification_key,
            student_id
        }
    );

//Survey:
export const updateAcademicBackground = (
    university: string,
    student_id: string
) =>
    request.post<UpdateAcademicBackgroundResponse>(
        `/api/account/survey/university/${student_id}`,
        {
            university
        }
    );
export const updateLanguageSkill = (language: string, student_id: string) =>
    request.post<UpdateLanguageSkillResponse>(
        `/api/account/survey/language/${student_id}`,
        { language }
    );
export const updateApplicationPreference = (
    application_preference: ApiPayload,
    student_id: StudentId
) =>
    request.post<UpdateApplicationPreferenceResponse>(
        `/api/account/survey/preferences/${student_id}`,
        {
            application_preference
        }
    );

export const getMyAcademicBackground = () =>
    request.get<GetMyAcademicBackgroundResponse>('/api/account/survey');

export const getStudentNotes = (student_id: string) =>
    request.get<GetStudentNotesResponse>(`/api/notes/${student_id}`);
export const updateStudentNotes = (student_id: string, notes: ApiPayload) =>
    request.put<UpdateStudentNotesResponse>(`/api/notes/${student_id}`, {
        notes
    });

// Time Slot events:
export const getActiveEventsNumber = () =>
    request.get<GetActiveEventsNumberResponse>(`/api/events/ping`);
export const getEvents = (queryString: QueryString) =>
    request.get<GetEventsResponse>(`/api/events?${queryString}`);
export const getBookedEvents = ({
    startTime,
    endTime
}: {
    startTime: string;
    endTime: string;
}) =>
    request.get<GetBookedEventsResponse>(
        `/api/events/booked?startTime=${startTime}&endTime=${endTime}`
    );
export const postEvent = (event: ApiPayload) =>
    postData<PostEventResponse>(`/api/events`, event);
export const confirmEvent = (event_id: string, updated_event: ApiPayload) =>
    request.put<ConfirmEventResponse>(
        `/api/events/${event_id}/confirm`,
        updated_event
    );
export const updateEvent = (event_id: string, updated_event: ApiPayload) =>
    request.put<UpdateEventResponse>(`/api/events/${event_id}`, updated_event);
export const deleteEvent = (event_id: string) =>
    request.delete<DeleteEventResponse>(`/api/events/${event_id}`);
export const updateOfficehours = (
    user_id: string,
    officehours: ApiPayload,
    timezone: string
) =>
    request.put<UpdateOfficehoursResponse>(
        `/api/account/profile/officehours/${user_id}`,
        {
            officehours,
            timezone
        }
    );

// Teams
export const getTeamMembers = () =>
    request.get<GetTeamMembersResponse>('/api/teams');
export const getStatisticsOverviewV2 = () =>
    getData<GetStatisticsOverviewResponse>('/api/teams/statistics/overview');
export const getStatisticsAgentsV2 = () =>
    getData<GetStatisticsAgentsResponse>('/api/teams/statistics/agents');
export const getStatisticsKPIV2 = () =>
    getData<GetStatisticsKPIResponse>('/api/teams/statistics/kpi');
export const getStatisticsResponseTimeV2 = () =>
    getData<GetStatisticsResponseTimeResponse>(
        '/api/teams/statistics/response-time'
    );
export const getTasksOverview = () =>
    getData<GetTasksOverviewResponse>('/api/teams/tasks-overview');
export const getIsManager = () =>
    getData<GetIsManagerResponse>('/api/teams/is-manager');
export const getResponseIntervalByStudent = (studentId: string) =>
    request.get<GetResponseIntervalByStudentResponse>(
        `/api/teams/response-interval/${studentId}`
    );

export const getAgentProfile = (agent_id: string) =>
    request.get<GetAgentProfileResponse>(`/api/agents/profile/${agent_id}`);
export const getExpense = (taiger_user_id: string) =>
    request.get<GetExpenseResponse>(`/api/expenses/users/${taiger_user_id}`);
export const updateUserPermission = (
    taiger_user_id: string,
    permissions: ApiPayload
) =>
    request.post<UpdateUserPermissionResponse>(
        `/api/permissions/${taiger_user_id}`,
        permissions
    );

//Personal Data:
export const updatePersonalData = (user_id: string, personaldata: ApiPayload) =>
    request.post<UpdatePersonalDataResponse>(
        `/api/account/profile/${user_id}`,
        { personaldata }
    );

export const updateCredentials = (
    credentials: ApiPayload,
    email: string,
    password: string
) =>
    request.post<UpdateCredentialsResponse>(`/api/account/credentials`, {
        credentials,
        email,
        password
    });

//TaiGer AI:
export const processProgramList = (programId: ProgramId) =>
    request.get<ProcessProgramListResponse>(
        `/api/taigerai/program/${programId}`
    );
export const TaiGerAiGeneral = (prompt: string) =>
    request.post<TaigerAiResponse>(`/api/taigerai/general`, {
        prompt
    });
export const TaiGerAiGeneral2 = (prompt: string) =>
    fetch(`${BASE_URL}/api/taigerai/general`, {
        method: 'post', // HTTP POST to send query to server
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'text/event-stream' // indicates what the server actually sent
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }) // server is expecting JSON
    });

export const TaiGerChatAssistant = (prompt: string, studentId: StudentId) =>
    fetch(`${BASE_URL}/api/taigerai/chat/${studentId}`, {
        method: 'post', // HTTP POST to send query to server
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'text/event-stream' // indicates what the server actually sent
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }) // server is expecting JSON
    });

export const cvmlrlAi2 = (prompt: string) =>
    fetch(`${BASE_URL}/api/taigerai/cvmlrl`, {
        method: 'post', // HTTP POST to send query to server
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'text/event-stream' // indicates what the server actually sent
        },
        credentials: 'include',
        body: JSON.stringify(prompt) // server is expecting JSON
    });
// export const cvmlrlAi2 = (
//   student_input,
//   document_requirements = '',
//   editor_requirements = '',
//   student_id = '',
//   program_full_name = '',
//   file_type = ''
// ) =>
//   request.post(`/api/taigerai/cvmlrl`, {
//     student_input,
//     document_requirements,
//     editor_requirements,
//     student_id,
//     program_full_name,
//     file_type
//   });
export const cvmlrlAi = (
    student_input: string,
    document_requirements = '',
    editor_requirements = '',
    student_id = '',
    program_full_name = '',
    file_type = ''
) =>
    request.post<CvmlrlAiResponse>(`/api/taigerai/cvmlrl`, {
        student_input,
        document_requirements,
        editor_requirements,
        student_id,
        program_full_name,
        file_type
    });

//Interview:
export const getAllInterviews = () =>
    request.get<GetInterviewsResponse>('/api/interviews');
export const getInterviews = (queryString: QueryString) =>
    getData<GetInterviewsResponse>(`/api/interviews?${queryString}`);
export const getAllOpenInterviews = () =>
    request.get<GetInterviewsResponse>('/api/interviews/open');
export const getInterview = (interview_id: InterviewId) =>
    request.get<GetInterviewResponse>(`/api/interviews/${interview_id}`);
export const deleteInterview = (interview_id: InterviewId) =>
    request.delete<DeleteInterviewResponse>(`/api/interviews/${interview_id}`);
export const updateInterview = (
    interview_id: InterviewId,
    payload: ApiPayload
) =>
    request.put<UpdateInterviewResponse>(
        `/api/interviews/${interview_id}`,
        payload
    );
export const updateInterviewSurvey = (
    interview_id: InterviewId,
    payload: ApiPayload
) =>
    request.put<UpdateInterviewSurveyResponse>(
        `/api/interviews/${interview_id}/survey`,
        payload
    );
export const getInterviewSurvey = (interview_id: InterviewId) =>
    request.get<GetInterviewSurveyResponse>(
        `/api/interviews/${interview_id}/survey`
    );
export const getMyInterviews = () =>
    request.get<GetMyInterviewsResponse>(`/api/interviews/my-interviews`);
export const createInterview = (
    program_id: ProgramId,
    student_id: StudentId,
    payload: ApiPayload
) =>
    request.post<CreateInterviewResponse>(
        `/api/interviews/create/${program_id}/${student_id}`,
        payload
    );
export const addInterviewTrainingDateTime = (
    interview_id: InterviewId,
    payload: ApiPayload
) =>
    request.post<AddInterviewTrainingDateTimeResponse>(
        `/api/interviews/time/${interview_id}`,
        payload
    );

export const getInterviewsByProgramId = (program_id: ProgramId) =>
    getData<GetInterviewsByProgramIdResponse>(
        `/api/interviews/interview/${program_id}`
    );
export const getInterviewsByStudentId = (student_id: StudentId) =>
    getData<GetInterviewsByStudentIdResponse>(
        `/api/interviews/interviews/${student_id}`
    );

// Program feedback Ticket
export const createProgramReport = (
    program_id: ProgramId,
    description: string,
    type: string
) =>
    request.post<CreateTicketResponse>(`/api/tickets/`, {
        program_id,
        description,
        type
    });
export const getProgramTicket = (type: string, program_id: ProgramId) =>
    request.get<GetProgramTicketResponse>(
        `/api/tickets?type=${type}&program_id=${program_id}`
    );
export const updateProgramTicket = (
    ticket_id: TicketId,
    updatedTicket: ApiPayload
) =>
    request.put<UpdateTicketResponse>(
        `/api/tickets/${ticket_id}`,
        updatedTicket
    );
export const deleteProgramTicket = (ticket_id: TicketId) =>
    request.delete<DeleteTicketResponse>(`/api/tickets/${ticket_id}`);
export const getProgramTickets = (type: string, status: string) =>
    request.get<GetProgramTicketsResponse>(
        `/api/tickets?type=${type}&status=${status}`
    );
export const getProgramTicketsV2 = ({
    type,
    status
}: {
    type: string;
    status: string;
}) =>
    getData<GetProgramTicketsResponse>(
        `/api/tickets?type=${type}&status=${status}`
    );

// Complaint
export const createComplaintTicket = (ticket: ApiPayload) =>
    request.post<CreateComplaintResponse>(`/api/complaints/`, { ticket });
export const getComplaintsTicket = (ticketId: TicketId) =>
    request.get<GetComplaintResponse>(`/api/complaints/${ticketId}`);
export const getComplaintsTickets = (type?: string) =>
    request.get<GetComplaintsResponse>(`/api/complaints?type=${type ?? ''}`);
export const updateComplaintsTicket = (
    ticketId: TicketId,
    updatedTicket: ApiPayload
) =>
    request.put<UpdateComplaintResponse>(
        `/api/complaints/${ticketId}`,
        updatedTicket
    );
export const deleteComplaintsTicket = (ticketId: TicketId) =>
    request.delete<DeleteComplaintResponse>(`/api/complaints/${ticketId}`);
export const submitMessageInTicketWithAttachment = (
    ticketId: TicketId,
    studentId: StudentId,
    newFile: File | FormData
) =>
    request.post<PostMessageInComplaintResponse>(
        `/api/complaints/new-message/${ticketId}/${studentId}`,
        newFile
    );
export const deleteAMessageinTicket = (
    ticketId: TicketId,
    message_id: string
) =>
    request.delete<DeleteMessageInComplaintResponse>(
        `/api/complaints/${ticketId}/${message_id}`
    );

// CRM
export const getCRMStats = () =>
    request.get<GetCRMStatsResponse>(`/api/crm/stats`);
export const getCRMLeads = () =>
    request.get<GetCRMLeadsResponse>(`/api/crm/leads`);
export const getCRMLead = (leadId: LeadId) =>
    getData<GetCRMLeadResponse>(`/api/crm/leads/${leadId}`);
export const updateCRMLead = (leadId: LeadId, payload: ApiPayload) =>
    request.put(`/api/crm/leads/${leadId}`, payload);
export const getLeadIdByUserId = (userId: UserId) =>
    request.get(`/api/crm/students/${userId}/lead`);
export const createLeadFromStudent = (userId: UserId) =>
    request.post(`/api/crm/students/${userId}/lead`);
export const getCRMLeadTags = (leadId: LeadId) =>
    request.get(`/api/crm/leads/${leadId}/tags`);
export const updateCRMLeadTags = (leadId: LeadId, tags: string[]) =>
    request.put(`/api/crm/leads/${leadId}/tags`, { tags });
export const appendCRMLeadTags = (leadId: LeadId, tags: string[]) =>
    request.post(`/api/crm/leads/${leadId}/tags`, { tags });
export const deleteCRMLeadTags = (leadId: LeadId, tagIds: string[]) =>
    request.delete(`/api/crm/leads/${leadId}/tags`, { data: { tagIds } });
export const getCRMLeadNotes = (leadId: LeadId) =>
    request.get(`/api/crm/leads/${leadId}/notes`);
export const createCRMLeadNote = (leadId: LeadId, payload: ApiPayload) =>
    request.post(`/api/crm/leads/${leadId}/notes`, payload);
export const replaceCRMLeadNotes = (leadId: LeadId, notes: string[]) =>
    request.put(`/api/crm/leads/${leadId}/notes`, { notes });
export const updateCRMLeadNote = (
    leadId: LeadId,
    noteId: string,
    payload: ApiPayload
) => request.patch(`/api/crm/leads/${leadId}/notes/${noteId}`, payload);
export const deleteCRMLeadNote = (leadId: LeadId, noteId: string) =>
    request.delete(`/api/crm/leads/${leadId}/notes/${noteId}`);
export const getCRMMeetings = () =>
    request.get<GetCRMMeetingsResponse>(`/api/crm/meetings`);
export const getCRMMeeting = (meetingId: MeetingId) =>
    request.get<GetCRMMeetingResponse>(`/api/crm/meetings/${meetingId}`);
export const updateCRMMeeting = (meetingId: MeetingId, payload: ApiPayload) =>
    request.put<UpdateCRMMeetingResponse>(
        `/api/crm/meetings/${meetingId}`,
        payload
    );
export const getCRMDeals = () =>
    request.get<GetCRMDealsResponse>(`/api/crm/deals`);
export const createCRMDeal = (payload: ApiPayload) =>
    request.post<CreateCRMDealResponse>(`/api/crm/deals`, payload);
export const updateCRMDeal = (dealId: string, payload: ApiPayload) =>
    request.put<UpdateCRMDealResponse>(`/api/crm/deals/${dealId}`, payload);
export const getCRMSalesReps = () =>
    request.get<GetCRMSalesRepsResponse>(`/api/crm/sales-reps`);
export const instantInviteTA = (meetingSummary: string, meetingLink: string) =>
    request.post<InstantInviteResponse>(`/api/crm/instant-invite`, {
        meetingSummary,
        meetingLink
    });
