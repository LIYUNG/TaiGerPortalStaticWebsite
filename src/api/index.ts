import { IUser } from '@taiger-common/model';
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
    QueryString,
    StudentId,
    ApplicationId,
    UserId,
    ProgramId,
    DocumentThreadId,
    MessageId,
    SurveyId,
    TicketId,
    MeetingId,
    InterviewId,
    LeadId,
    AuthVerifyResponse,
    GetProgramResponse,
    GetProgramsResponse,
    GetProgramsOverviewResponse,
    GetStudentsResponse,
    GetApplicationsResponse,
    GetAdmissionsResponse,
    GetAdmissionsOverviewResponse,
    GetUsersOverviewResponse,
    GetStudentMeetingsResponse,
    GetStudentMeetingResponse,
    GetCommunicationThreadResponse,
    GetMyCommunicationThreadResponse,
    GetUsersCountResponse
} from './types';

export const login = (credentials: LoginCredentials) =>
    request.post('/auth/login', credentials);

export const googleOAuthCallback = (code: string) =>
    postData('/auth/oauth/google/callback', { code });

export const logout = () => request.get('/auth/logout');

export const register = (credentials: LoginCredentials) =>
    request.post('/auth/signup', credentials);

export const forgotPassword = ({ email }: ForgotPasswordPayload) =>
    request.post('/auth/forgot-password', { email });

export const resetPassword = ({
    email,
    password,
    token
}: ResetPasswordPayload) =>
    request.post('/auth/reset-password', { email, password, token });

export const activation = (email: string, token: string) =>
    request.post('/auth/activation', { email, token });

// TODO: make resendActivation works
export const resendActivation = ({ email }: ForgotPasswordPayload) =>
    request.post('/auth/resend-activation', { email });

export const verify = () => request.get('/auth/verify');
export const verifyV2 = () => getData<AuthVerifyResponse>('/auth/verify');

// Audit Log APIs
export const getAuditLog = (queryString: QueryString) =>
    getData(`/api/audit?${queryString}`);

// Search API
export const getQueryStudentsResults = (keywords: string) =>
    request.get(`/api/search/students?q=${keywords}`);
export const getQueryResults = (keywords: string) =>
    request.get(`/api/search?q=${keywords}`);
export const getQueryPublicResults = (keywords: string) =>
    request.get(`/api/search/public?q=${keywords}`);
export const getQueryStudentResults = (keywords: string) =>
    request.get(`/api/communications?q=${keywords}`);
// User APIs
export const getUsers = (queryString: QueryString) =>
    request.get(`/api/users?${queryString}`);
export const getUsersCount = () =>
    getData<GetUsersCountResponse>('/api/users/count');
export const getUsersOverview = () =>
    getData<GetUsersOverviewResponse>('/api/users/overview');
export const getUser = (user_id: UserId) =>
    request.get(`/api/users/${user_id}`);
export const addUser = (user_information: ApiPayload) =>
    request.post('/api/users', user_information);

export const deleteUser = ({ id }: { id: string }) =>
    deleteData(`/api/users/${id}`);

export const updateUser = (user: IUser) =>
    postData(`/api/users/${user._id}`, user);

export const changeUserRole = ({ id, role }: { id: string; role: string }) =>
    updateUser({ _id: id, role } as IUser);

export const getEssayWriters = () => request.get('/api/essay-writers');

export const getStudents = () => request.get(`/api/students`);

export const getStudentsV3 = (queryString: QueryString) =>
    getData<GetStudentsResponse>(`/api/students/v3?${queryString}`);

export const getStudent = (studentId: string) =>
    request.get(`/api/students/${studentId}`);

export const getApplications = (queryString: QueryString) =>
    getData<GetApplicationsResponse>(`/api/applications?${queryString}`);

export const getMyStudentsApplications = ({
    userId,
    queryString
}: {
    userId: UserId;
    queryString: QueryString;
}) => getData(`/api/applications/taiger-user/${userId}?${queryString}`);

export const getActiveStudentsApplications = () =>
    getData(`/api/applications/all/active/applications`);

export const getActiveStudents = (queryString: QueryString) =>
    getData(`/api/students/active?${queryString}`);

export const getAdmissions = (queryString: QueryString) =>
    getData<GetAdmissionsResponse>(`/api/admissions?${queryString}`);

export const getAdmissionsOverview = () =>
    getData<GetAdmissionsOverviewResponse>(`/api/admissions/overview`);

export const getApplicationConflicts = () =>
    request.get(`/api/student-applications/conflicts`);

export const getApplicationTaskDeltas = () =>
    request.get(`/api/student-applications/deltas`);

// TODO: thread creation attached to application problem. (thread creation is ok))
export const createApplicationV2 = ({
    studentId,
    program_ids
}: {
    studentId: StudentId;
    program_ids: string[];
}) =>
    postData(`/api/applications/student/${studentId}`, {
        program_id_set: program_ids
    });

// Tested manually OK.
export const getApplicationStudentV2 = (studentId: StudentId) =>
    getData(`/api/applications/student/${studentId}`);

// TODO:
export const updateStudentApplications = (
    studentId: StudentId,
    applications: ApiPayload,
    applying_program_count: number
) =>
    request.put(`/api/applications/student/${studentId}`, {
        applications,
        applying_program_count
    });

export const updateStudentApplication = (
    studentId: StudentId,
    application_id: string,
    payload: ApiPayload
) =>
    request.put(
        `/api/applications/student/${studentId}/${application_id}`,
        payload
    );

// TODO: thread is empty!! application delete ok.
export const deleteApplicationStudentV2 = (applicationId: ApplicationId) =>
    request.delete(`/api/applications/application/${applicationId}`);

export const refreshApplication = (applicationId: string) =>
    postData(`/api/applications/${applicationId}/refresh`, {});

export const getStudentUniAssistV2 = ({ studentId }: { studentId: string }) =>
    getData(`/api/uniassist/${studentId}`);

export const getArchivStudents = (TaiGerStaffId?: string) =>
    request.get(`/api/teams/archiv/${TaiGerStaffId ?? ''}`);

export const updateArchivStudents = (
    studentId: StudentId,
    isArchived: boolean,
    shouldInform: boolean
) =>
    request.post(`/api/students/archiv/${studentId}`, {
        isArchived,
        shouldInform
    });

export const updateArchivUser = ({
    user_id,
    isArchived
}: {
    user_id: UserId;
    isArchived: boolean;
}) =>
    postData(`/api/users/archiv/${user_id}`, {
        isArchived: isArchived
    });

// Student APIs
export const updateAgents = (agentsId: string[], studentId: StudentId) =>
    request.post(`/api/students/${studentId}/agents`, agentsId);

export const updateEditors = (editorsId: string[], studentId: StudentId) =>
    request.post(`/api/students/${studentId}/editors`, editorsId);

export const updateAttributes = (
    attributesId: string[],
    studentId: StudentId
) => request.post(`/api/students/${studentId}/attributes`, attributesId);

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
}) => postData(`/api/students/${studentId}/files/${category}`, formData);

export const getStudentAndDocLinks = (studentId: StudentId) =>
    request.get(`/api/students/doc-links/${studentId}`);

export const getStudentsAndDocLinks2 = (queryString: QueryString) =>
    getData(`/api/students/doc-links?${queryString}`);

export const updateDocumentationHelperLink = (
    link: string,
    key: string,
    category: string
) => request.post(`/api/students/doc-links`, { link, key, category });

export const deleteFileV2 = ({
    category,
    studentId
}: {
    category: string;
    studentId: StudentId;
}) => deleteData(`/api/students/${studentId}/files/${category}`);

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
    postData(
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
}) => deleteData(`/api/students/${studentId}/vpd/${applicationId}/${fileType}`);

export const SetAsNotNeededV2 = ({
    studentId,
    applicationId
}: {
    studentId: StudentId;
    applicationId: ApplicationId;
}) => putData(`/api/students/${studentId}/vpd/${applicationId}/VPD`, {});

export const SetUniAssistPaidV2 = ({
    studentId,
    applicationId,
    isPaid
}: {
    studentId: StudentId;
    applicationId: ApplicationId;
    isPaid: boolean;
}) =>
    postData(`/api/students/${studentId}/vpd/${applicationId}/payments`, {
        isPaid
    });

export const updateProfileDocumentStatus = (
    category: string,
    studentId: StudentId,
    status: string,
    message: string
) =>
    request.post(`/api/students/${studentId}/${category}/status`, {
        status: status,
        feedback: message
    });

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
    postData(`/api/students/${student_id}/${category}/status`, {
        status,
        feedback
    });

// Account APIs
export const getTemplates = () => request.get(`/api/account/files/template`);
export const uploadtemplate = (category: string, data: ApiPayload) =>
    request.post(`/api/account/files/template/${category}`, data);
export const deleteTemplateFile = (category: string) =>
    request.delete(`/api/account/files/template/${category}`);
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
    request.post(`/api/widgets/transcript/engine/v2/${language}`, {
        courses,
        requirementIds,
        factor
    });

export const WidgetanalyzedFileV2Download = (adminId: string) =>
    request.get(`/api/widgets/transcript/v2/${adminId}`);

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
    studentId: StudentId;
    requirementIds: ApiPayload;
    factor: ApiPayload;
}) =>
    request.post(`/api/courses/transcript/v2/${studentId}/${language}`, {
        requirementIds,
        factor
    });

export const analyzedFileV2Download = (user_id: UserId) =>
    request.get(`/api/courses/transcript/v2/${user_id}`);

export const getCourseKeywordSets = () => request.get(`/api/course-keywords`);
export const getCourseKeywordSet = (keywordsSetId: string) =>
    request.get(`/api/course-keywords/${keywordsSetId}`);
export const postKeywordSet = (keywordsSet: ApiPayload) =>
    request.post('/api/course-keywords/new', keywordsSet);
export const putKeywordSet = (keywordsSetId: string, keywordsSet: ApiPayload) =>
    request.put(`/api/course-keywords/${keywordsSetId}`, keywordsSet);
export const deleteKeywordSet = (keywordsSetId: string) =>
    request.delete(`/api/course-keywords/${keywordsSetId}`);

// Courses DB
export const getAllCourses = () => getData(`/api/all-courses`);
export const getCourse = ({ courseId }: { courseId: string }) =>
    getData(`/api/all-courses/${courseId}`);
export const updateCourse = ({
    courseId,
    payload
}: {
    courseId: string;
    payload: ApiPayload;
}) => putData(`/api/all-courses/${courseId}`, payload);
export const deleteCourse = ({ courseId }: { courseId: string }) =>
    deleteData(`/api/all-courses/${courseId}`);
export const createCourse = ({ payload }: { payload: ApiPayload }) =>
    postData(`/api/all-courses`, payload);

export const getProgramRequirements = () =>
    request.get(`/api/program-requirements`);

export const getProgramRequirementsV2 = () =>
    getData(`/api/program-requirements`);

export const getSameProgramStudents = ({ programId }: { programId: string }) =>
    getData(`/api/programs/same-program-students/${programId}`);

export const postProgramRequirements = (payload: ApiPayload) =>
    request.post(`/api/program-requirements/new`, payload);
export const getProgramsAndCourseKeywordSets = () =>
    request.get(`/api/program-requirements/programs-and-keywords`);
export const getProgramRequirement = (programRequirementId: string) =>
    request.get(`/api/program-requirements/${programRequirementId}`);
export const putProgramRequirement = (
    programRequirementId: string,
    payload: ApiPayload
) => request.put(`/api/program-requirements/${programRequirementId}`, payload);
export const deleteProgramRequirement = (programRequirementId: string) =>
    request.delete(`/api/program-requirements/${programRequirementId}`);

export const updateStudentApplicationResult = (
    studentId: StudentId,
    applicationId: ApplicationId,
    programId: string,
    result: string,
    data: FormData | ApiPayload
) =>
    request.post(
        `/api/account/applications/result/${studentId}/${applicationId}/${programId}/${result}`,
        data
    );

export const deleteGenralFileThread = (
    documentsthreadId: string,
    studentId: StudentId
) => request.delete(`/api/document-threads/${documentsthreadId}/${studentId}`);

export const deleteProgramSpecificFileThread = (
    documentsthreadId: string,
    application_id: string,
    studentId: StudentId
) =>
    request.delete(
        `/api/document-threads/${documentsthreadId}/${application_id}/${studentId}`
    );

export const getCheckDocumentPatternIsPassed = (
    thread_id: string,
    file_type: string
) =>
    request.get(
        `/api/document-threads/pattern/check/${thread_id}/${file_type}`
    );

export const getActiveThreads = (queryString: QueryString) =>
    getData(`/api/document-threads/overview/all?${queryString}`);

export const getMyStudentThreadMetrics = () =>
    request.get(`/api/document-threads/overview/my-student-metrics`);

export const getThreadsByStudent = (studentId: StudentId) =>
    getData(`/api/document-threads/student-threads/${studentId}`);

export const getMyStudentsThreads = ({
    userId,
    queryString
}: {
    userId: UserId;
    queryString: QueryString;
}) =>
    getData(
        `/api/document-threads/overview/taiger-user/${userId}?${queryString}`
    );

export const SetFileAsFinal = (
    documentsthreadId: string,
    studentId: StudentId,
    application_id: string
) =>
    request.put(`/api/document-threads/${documentsthreadId}/${studentId}`, {
        application_id
    });

export const updateEssayWriter = (
    editor_id: string,
    documentsthreadId: string
) =>
    request.post(`/api/document-threads/${documentsthreadId}/essay`, editor_id);

export const putThreadFavorite = (documentsthreadId: string) =>
    request.put(`/api/document-threads/${documentsthreadId}/favorite`);

// Portal Informations APIs
export const getPortalCredentials = (student_id: string) =>
    request.get(`/api/portal-informations/${student_id}`);
export const postPortalCredentials = (
    student_id: string,
    applicationId: ApplicationId,
    credentials: ApiPayload
) =>
    request.post(
        `/api/portal-informations/${student_id}/${applicationId}`,
        credentials
    );

// Course, Transcript APIs
export const getMycourses = (student_id: string) =>
    request.get(`/api/courses/${student_id}`);
export const putMycourses = (student_id: string, locked: ApiPayload) =>
    request.put(`/api/courses/${student_id}`, locked);

// Documentation APIs
// Internal docs
export const getInternalDocumentationPage = () =>
    request.get(`/api/docs/taiger/internal/confidential`);
export const updateInternalDocumentationPage = (doc: ApiPayload) =>
    request.put(`/api/docs/taiger/internal/confidential`, doc);
// External docs
export const uploadImage = (formData: FormData) =>
    request.post(`/api/docs/upload/image`, formData);
export const uploadDocDocs = (formData: FormData) =>
    request.post(`/api/docs/upload/docs`, formData);
export const getCategorizedDocumentationPage = (category: string) =>
    request.get(`/api/docs/pages/${category}`);
export const updateDocumentationPage = (category: string, doc: ApiPayload) =>
    request.put(`/api/docs/pages/${category}`, doc);
export const getCategorizedDocumentation = (category: string) =>
    request.get(`/api/docs/${category}`);
export const deleteDocumentation = (doc_id: string) =>
    request.delete(`/api/docs/${doc_id}`);
export const getDocumentation = (doc_id: string) =>
    request.get(`/api/docs/search/${doc_id}`);
export const getAllDocumentations = () => request.get(`/api/docs/all`);

export const updateDocumentation = (doc_id: string, doc: ApiPayload) =>
    request.put(`/api/docs/${doc_id}`, doc);
export const createDocumentation = (doc: ApiPayload) =>
    request.post(`/api/docs`, doc);

export const getInternalDocumentation = (doc_id: string) =>
    request.get(`/api/docs/internal/search/${doc_id}`);
export const getAllInternalDocumentations = () =>
    request.get(`/api/docs/internal/all`);
export const updateInternalDocumentation = (doc_id: string, doc: ApiPayload) =>
    request.put(`/api/docs/internal/${doc_id}`, doc);
export const createInternalDocumentation = (doc: ApiPayload) =>
    request.post(`/api/docs/internal`, doc);
export const deleteInternalDocumentation = (doc_id: string) =>
    request.delete(`/api/docs/internal/${doc_id}`);

// Program APIs
export const getProgramsV2 = () =>
    getData<GetProgramsResponse>('/api/programs');
export const getProgramsOverview = () =>
    getData<GetProgramsOverviewResponse>('/api/programs/overview');
export const getSchoolsDistribution = () =>
    getData('/api/programs/schools-distribution');
export const getDistinctSchools = () => request.get('/api/programs/schools');
export const updateSchoolAttributes = (schoolAttributes: ApiPayload) =>
    request.put('/api/programs/schools', schoolAttributes);

export const getProgram = (programId: string) =>
    request.get(`/api/programs/${programId}`);

export const getProgramV2 = (programId: string) =>
    getData<GetProgramResponse>(`/api/programs/${programId}`);

export const deleteProgramV2 = ({ program_id }: { program_id: string }) =>
    deleteData(`/api/programs/${program_id}`);

export const createProgramV2 = ({ program }: { program: ApiPayload }) =>
    postData('/api/programs', program);

export const updateProgram = (program: {
    _id: string;
    [key: string]: unknown;
}) => request.put(`/api/programs/${program._id}`, program);

export const updateProgramV2 = ({
    program
}: {
    program: { _id: string; [key: string]: unknown };
}) => putData(`/api/programs/${program._id}`, program);

export const getProgramChangeRequests = (programId: string) =>
    request.get(`/api/programs/${programId}/change-requests`);

export const reviewProgramChangeRequests = (requestId: string) =>
    request.post(`/api/programs/review-changes/${requestId}`);

export const refreshProgram = (programId: ProgramId) =>
    postData(`/api/programs/${programId}/refresh`, {});

// Docs APIs
export const deleteDoc = (id: string) => request.delete(`/api/docs/${id}`);
export const addDoc = (id: string) => request.post(`/api/docs/${id}`);
export const updateDoc = (id: string, doc_temp: ApiPayload) =>
    request.post(`/api/docs/${id}`, doc_temp);

export const createArticle = (article: ApiPayload) =>
    request.post('/api/docs', article);

export const updateArticle = (id: string, article: ApiPayload) =>
    request.post(`/api/docs/${id}`, article);

const getArticle = (type: string) => request.get(`/api/docs/${type}`);

export const getApplicationArticle = () => getArticle('application');

export const uploadDocumentThreadImage = (
    documentsthreadId: string,
    studentId: StudentId,
    formData: FormData
) =>
    request.post(
        `/api/document-threads/image/${documentsthreadId}/${studentId}`,
        formData
    );

export const putOriginAuthorConfirmedByStudent = (
    documentsthreadId: string,
    studentId: StudentId,
    checked: boolean
) =>
    request.put(
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
    request.post(
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
    request.get('/api/communications/ping/all');
export const getMyCommunicationThread = () =>
    request.get('/api/communications/all');
export const getMyCommunicationThreadV2 = () =>
    getData<GetMyCommunicationThreadResponse>('/api/communications/all');
export const getCommunicationThread = (studentId: StudentId) =>
    request.get(`/api/communications/${studentId}`);
export const getCommunicationThreadV2 = ({
    studentId
}: {
    studentId: StudentId;
}) =>
    getData<GetCommunicationThreadResponse>(`/api/communications/${studentId}`);
export const loadCommunicationThread = (
    studentId: StudentId,
    pageNumber: number
) => request.get(`/api/communications/${studentId}/pages/${pageNumber}`);
export const postCommunicationThreadV2 = ({
    studentId,
    formData
}: {
    studentId: StudentId;
    formData: FormData | ApiPayload;
}) => postData(`/api/communications/${studentId}`, formData);
export const updateAMessageInCommunicationThreadV2 = ({
    communication_id,
    communication_messageId,
    message
}: {
    communication_id: string;
    communication_messageId: string;
    message: ApiPayload;
}) =>
    putData(
        `/api/communications/${communication_id}/${communication_messageId}`,
        { message }
    );
export const deleteAMessageInCommunicationThread = (
    student_id: StudentId,
    communication_messageId: string
) =>
    request.delete(
        `/api/communications/${student_id}/${communication_messageId}`
    );

export const deleteAMessageInCommunicationThreadV2 = ({
    student_id,
    communication_messageId
}: {
    student_id: StudentId;
    communication_messageId: string;
}) =>
    deleteData(`/api/communications/${student_id}/${communication_messageId}`);

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
    putData(
        `/api/communications/${student_id}/${communication_messageId}/${ignoreMessageState}/ignore`,
        message
    );

export const getSurveyInputs = (documentsthreadId: string) =>
    request.get(`/api/document-threads/${documentsthreadId}/survey-inputs`);

export const putSurveyInput = (
    surveyId: string,
    input: ApiPayload,
    informEditor: boolean
) =>
    request.put(`/api/document-threads/survey-input/${surveyId}`, {
        input,
        informEditor
    });

export const postSurveyInput = (input: ApiPayload, informEditor: boolean) =>
    request.post(`/api/document-threads/survey-input/`, {
        input,
        informEditor
    });

export const resetSurveyInput = (surveyId: SurveyId) =>
    request.delete(`/api/document-threads/survey-input/${surveyId}`);

export const getMessagThread = (documentsthreadId: DocumentThreadId) =>
    request.get(`/api/document-threads/${documentsthreadId}`);
export const deleteAMessageInThread = (
    documentsthreadId: DocumentThreadId,
    messageId: MessageId
) =>
    request.delete(
        `/api/document-threads/delete/${documentsthreadId}/${messageId}`
    );

export const initGeneralMessageThread = (
    studentId: StudentId,
    document_catgory: string
) =>
    request.post(
        `/api/document-threads/init/general/${studentId}/${document_catgory}`
    );

export const IgnoreMessageThread = (
    documentThreadId: DocumentThreadId,
    documentsthreadMessageId: MessageId,
    documentsthreadMessage: ApiPayload,
    ignoreMessageState: boolean | string
) =>
    request.put(
        `/api/document-threads/${documentThreadId}/${documentsthreadMessageId}/${ignoreMessageState}/ignored`,
        documentsthreadMessage
    );

export const initApplicationMessageThread = (
    studentId: StudentId,
    applicationId: ApplicationId,
    document_catgory: string
) =>
    request.post(
        `/api/document-threads/init/application/${studentId}/${applicationId}/${document_catgory}`
    );

// remove Banner/notification
export const updateBanner = (notification_key: string) =>
    request.post(`/api/account/student/notifications`, {
        notification_key
    });

export const updateAgentBanner = (
    notification_key: string,
    student_id: string
) =>
    request.post(`/api/account/agent/notifications`, {
        notification_key,
        student_id
    });

//Survey:
export const updateAcademicBackground = (
    university: string,
    student_id: string
) =>
    request.post(`/api/account/survey/university/${student_id}`, {
        university
    });
export const updateLanguageSkill = (language: string, student_id: string) =>
    request.post(`/api/account/survey/language/${student_id}`, { language });
export const updateApplicationPreference = (
    application_preference: ApiPayload,
    student_id: StudentId
) =>
    request.post(`/api/account/survey/preferences/${student_id}`, {
        application_preference
    });

export const getMyAcademicBackground = () => request.get('/api/account/survey');

export const getStudentNotes = (student_id: string) =>
    request.get(`/api/notes/${student_id}`);
export const updateStudentNotes = (student_id: string, notes: ApiPayload) =>
    request.put(`/api/notes/${student_id}`, { notes });

// Time Slot events:
export const getActiveEventsNumber = () => request.get(`/api/events/ping`);
export const getEvents = (queryString: QueryString) =>
    request.get(`/api/events?${queryString}`);
export const getBookedEvents = ({
    startTime,
    endTime
}: {
    startTime: string;
    endTime: string;
}) =>
    request.get(`/api/events/booked?startTime=${startTime}&endTime=${endTime}`);
export const postEvent = (event: ApiPayload) => postData(`/api/events`, event);
export const confirmEvent = (event_id: string, updated_event: ApiPayload) =>
    request.put(`/api/events/${event_id}/confirm`, updated_event);
export const updateEvent = (event_id: string, updated_event: ApiPayload) =>
    request.put(`/api/events/${event_id}`, updated_event);
export const deleteEvent = (event_id: string) =>
    request.delete(`/api/events/${event_id}`);
export const updateOfficehours = (
    user_id: string,
    officehours: ApiPayload,
    timezone: string
) =>
    request.put(`/api/account/profile/officehours/${user_id}`, {
        officehours,
        timezone
    });

// Teams
export const getTeamMembers = () => request.get('/api/teams');
export const getStatisticsV2 = () => getData('/api/teams/statistics');
export const getStatisticsOverviewV2 = () =>
    getData('/api/teams/statistics/overview');
export const getStatisticsAgentsV2 = () =>
    getData('/api/teams/statistics/agents');
export const getStatisticsKPIV2 = () => getData('/api/teams/statistics/kpi');
export const getStatisticsResponseTimeV2 = () =>
    getData('/api/teams/statistics/response-time');
export const getTasksOverview = () => getData('/api/teams/tasks-overview');
export const getIsManager = () => getData('/api/teams/is-manager');
export const getResponseIntervalByStudent = (studentId: string) =>
    request.get(`/api/teams/response-interval/${studentId}`);

export const getAgentProfile = (agent_id: string) =>
    request.get(`/api/agents/profile/${agent_id}`);
export const getExpense = (taiger_user_id: string) =>
    request.get(`/api/expenses/users/${taiger_user_id}`);
export const updateUserPermission = (
    taiger_user_id: string,
    permissions: ApiPayload
) => request.post(`/api/permissions/${taiger_user_id}`, permissions);

//Personal Data:
export const updatePersonalData = (user_id: string, personaldata: ApiPayload) =>
    request.post(`/api/account/profile/${user_id}`, { personaldata });

export const updateCredentials = (
    credentials: ApiPayload,
    email: string,
    password: string
) => request.post(`/api/account/credentials`, { credentials, email, password });

//TaiGer AI:
export const processProgramList = (programId: ProgramId) =>
    request.get(`/api/taigerai/program/${programId}`);
export const TaiGerAiGeneral = (prompt: string) =>
    request.post(`/api/taigerai/general`, {
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
    request.post(`/api/taigerai/cvmlrl`, {
        student_input,
        document_requirements,
        editor_requirements,
        student_id,
        program_full_name,
        file_type
    });

//Interview:
export const getAllInterviews = () => request.get('/api/interviews');
export const getInterviews = (queryString: QueryString) =>
    getData(`/api/interviews?${queryString}`);
export const getAllOpenInterviews = () => request.get('/api/interviews/open');
export const getInterview = (interview_id: InterviewId) =>
    request.get(`/api/interviews/${interview_id}`);
export const deleteInterview = (interview_id: InterviewId) =>
    request.delete(`/api/interviews/${interview_id}`);
export const updateInterview = (
    interview_id: InterviewId,
    payload: ApiPayload
) => request.put(`/api/interviews/${interview_id}`, payload);
export const updateInterviewSurvey = (
    interview_id: InterviewId,
    payload: ApiPayload
) => request.put(`/api/interviews/${interview_id}/survey`, payload);
export const getInterviewSurvey = (interview_id: InterviewId) =>
    request.get(`/api/interviews/${interview_id}/survey`);
export const getMyInterviews = () =>
    request.get(`/api/interviews/my-interviews`);
export const createInterview = (
    program_id: ProgramId,
    student_id: StudentId,
    payload: ApiPayload
) =>
    request.post(`/api/interviews/create/${program_id}/${student_id}`, payload);
export const addInterviewTrainingDateTime = (
    interview_id: InterviewId,
    payload: ApiPayload
) => request.post(`/api/interviews/time/${interview_id}`, payload);

export const getInterviewsByProgramId = (program_id: ProgramId) =>
    getData(`/api/interviews/interview/${program_id}`);
export const getInterviewsByStudentId = (student_id: StudentId) =>
    getData(`/api/interviews/interviews/${student_id}`);

// Program feedback Ticket
export const createProgramReport = (
    program_id: ProgramId,
    description: string,
    type: string
) => request.post(`/api/tickets/`, { program_id, description, type });
export const getProgramTicket = (type: string, program_id: ProgramId) =>
    request.get(`/api/tickets?type=${type}&program_id=${program_id}`);
export const updateProgramTicket = (
    ticket_id: TicketId,
    updatedTicket: ApiPayload
) => request.put(`/api/tickets/${ticket_id}`, updatedTicket);
export const deleteProgramTicket = (ticket_id: TicketId) =>
    request.delete(`/api/tickets/${ticket_id}`);
export const getProgramTickets = (type: string, status: string) =>
    request.get(`/api/tickets?type=${type}&status=${status}`);
export const getProgramTicketsV2 = ({
    type,
    status
}: {
    type: string;
    status: string;
}) => getData(`/api/tickets?type=${type}&status=${status}`);

// Complaint
export const createComplaintTicket = (ticket: ApiPayload) =>
    request.post(`/api/complaints/`, { ticket });
export const getComplaintsTicket = (ticketId: TicketId) =>
    request.get(`/api/complaints/${ticketId}`);
export const getComplaintsTickets = (type?: string) =>
    request.get(`/api/complaints?type=${type ?? ''}`);
export const updateComplaintsTicket = (
    ticketId: TicketId,
    updatedTicket: ApiPayload
) => request.put(`/api/complaints/${ticketId}`, updatedTicket);
export const deleteComplaintsTicket = (ticketId: TicketId) =>
    request.delete(`/api/complaints/${ticketId}`);
export const submitMessageInTicketWithAttachment = (
    ticketId: TicketId,
    studentId: StudentId,
    newFile: File | FormData
) =>
    request.post(
        `/api/complaints/new-message/${ticketId}/${studentId}`,
        newFile
    );
export const deleteAMessageinTicket = (
    ticketId: TicketId,
    message_id: string
) => request.delete(`/api/complaints/${ticketId}/${message_id}`);

// CRM
export const getCRMStats = () => request.get(`/api/crm/stats`);
export const getCRMLeads = () => request.get(`/api/crm/leads`);
export const getCRMLead = (leadId: LeadId) =>
    request.get(`/api/crm/leads/${leadId}`);
export const getLeadIdByUserId = (userId: UserId) =>
    request.get(`/api/crm/students/${userId}/lead`);
export const createLeadFromStudent = (userId: UserId) =>
    request.post(`/api/crm/students/${userId}/lead`);
export const getCRMMeetings = () => request.get(`/api/crm/meetings`);
export const getCRMMeeting = (meetingId: MeetingId) =>
    request.get(`/api/crm/meetings/${meetingId}`);
export const updateCRMMeeting = (meetingId: MeetingId, payload: ApiPayload) =>
    request.put(`/api/crm/meetings/${meetingId}`, payload);
export const getCRMDeals = () => request.get(`/api/crm/deals`);
export const createCRMDeal = (payload: ApiPayload) =>
    request.post(`/api/crm/deals`, payload);
export const updateCRMDeal = (dealId: string, payload: ApiPayload) =>
    request.put(`/api/crm/deals/${dealId}`, payload);
export const getCRMSalesReps = () => request.get(`/api/crm/sales-reps`);
export const instantInviteTA = (meetingSummary: string, meetingLink: string) =>
    request.post(`/api/crm/instant-invite`, {
        meetingSummary,
        meetingLink
    });

// Student Meetings APIs
export const getStudentMeetings = (studentId: StudentId) =>
    getData<GetStudentMeetingsResponse>(`/api/students/${studentId}/meetings`);
export const getStudentMeeting = (studentId: StudentId, meetingId: MeetingId) =>
    getData<GetStudentMeetingResponse>(
        `/api/students/${studentId}/meetings/${meetingId}`
    );
export const createStudentMeeting = (
    studentId: StudentId,
    payload: ApiPayload
) => postData(`/api/students/${studentId}/meetings`, payload);
export const updateStudentMeeting = (
    studentId: StudentId,
    meetingId: MeetingId,
    payload: ApiPayload
) => putData(`/api/students/${studentId}/meetings/${meetingId}`, payload);
export const deleteStudentMeeting = (
    studentId: StudentId,
    meetingId: MeetingId
) => deleteData(`/api/students/${studentId}/meetings/${meetingId}`);
