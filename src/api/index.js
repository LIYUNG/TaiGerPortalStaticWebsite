import {
    BASE_URL,
    deleteData,
    getData,
    getDataBlob,
    postData,
    putData,
    request
} from './request';

export const login = (credentials) => request.post('/auth/login', credentials);

export const googleOAuthCallback = (code) =>
    postData('/auth/oauth/google/callback', { code });

export const logout = () => request.get('/auth/logout');

export const register = (credentials) =>
    request.post('/auth/signup', credentials);

export const forgotPassword = ({ email }) =>
    request.post('/auth/forgot-password', { email });

export const resetPassword = ({ email, password, token }) =>
    request.post('/auth/reset-password', { email, password, token });

export const activation = (email, token) =>
    request.post('/auth/activation', { email, token });

// TODO: make resendActivation works
export const resendActivation = ({ email }) =>
    request.post('/auth/resend-activation', { email });

export const verify = () => request.get('/auth/verify');
export const verifyV2 = () => getData('/auth/verify');

// Audit Log APIs
export const getAuditLog = (queryString) =>
    getData(`/api/audit?${queryString}`);

// Search API
export const getQueryStudentsResults = (keywords) =>
    request.get(`/api/search/students?q=${keywords}`);
export const getQueryResults = (keywords) =>
    request.get(`/api/search?q=${keywords}`);
export const getQueryPublicResults = (keywords) =>
    request.get(`/api/search/public?q=${keywords}`);
export const getQueryStudentResults = (keywords) =>
    request.get(`/api/communications?q=${keywords}`);
// User APIs
export const getUsers = (queryString) =>
    request.get(`/api/users?${queryString}`);
export const getUsersCount = () => request.get(`/api/users/count`);
export const getUser = (user_id) => request.get(`/api/users/${user_id}`);
export const addUser = (user_information) =>
    request.post('/api/users', user_information);

export const deleteUser = ({ id }) => deleteData(`/api/users/${id}`);

export const updateUser = (user) => postData(`/api/users/${user._id}`, user);

export const changeUserRole = ({ id, role }) => updateUser({ _id: id, role });

export const getEssayWriters = () => request.get('/api/essay-writers');

export const getStudents = () => request.get(`/api/students`);

export const getStudentsV3 = (queryString) =>
    getData(`/api/students/v3?${queryString}`);

export const getApplications = (queryString) =>
    getData(`/api/applications?${queryString}`);

export const getMyStudentsApplications = ({ userId, queryString }) =>
    getData(`/api/applications/taiger-user/${userId}?${queryString}`);

export const getActiveStudentsApplications = () =>
    getData(`/api/applications/all/active/applications`);

export const getActiveStudents = (queryString) =>
    getData(`/api/students/active?${queryString}`);

export const getAdmissions = (queryString) =>
    getData(`/api/admissions?${queryString}`);

export const getAdmissionsOverview = () => getData(`/api/admissions/overview`);

export const getApplicationConflicts = () =>
    request.get(`/api/student-applications/conflicts`);

export const getApplicationTaskDeltas = () =>
    request.get(`/api/student-applications/deltas`);

// TODO: thread creation attached to application problem. (thread creation is ok))
export const createApplicationV2 = ({ studentId, program_ids }) =>
    postData(`/api/applications/student/${studentId}`, {
        program_id_set: program_ids
    });

// Tested manually OK.
export const getApplicationStudentV2 = (studentId) =>
    request.get(`/api/applications/student/${studentId}`);

// TODO:
export const updateStudentApplications = (
    studentId,
    applications,
    applying_program_count
) =>
    request.put(`/api/applications/student/${studentId}`, {
        applications,
        applying_program_count
    });

export const updateStudentApplication = (studentId, application_id, payload) =>
    request.put(
        `/api/applications/student/${studentId}/${application_id}`,
        payload
    );

// TODO: thread is empty!! application delete ok.
export const deleteApplicationStudentV2 = (applicationId) =>
    request.delete(`/api/applications/application/${applicationId}`);

export const getStudentUniAssistV2 = ({ studentId }) =>
    getData(`/api/uniassist/${studentId}`);

export const getArchivStudents = (TaiGerStaffId) =>
    request.get(`/api/teams/archiv/${TaiGerStaffId}`);

export const updateArchivStudents = (studentId, isArchived, shouldInform) =>
    request.post(`/api/students/archiv/${studentId}`, {
        isArchived,
        shouldInform
    });

export const updateArchivUser = ({ user_id, isArchived }) =>
    postData(`/api/users/archiv/${user_id}`, {
        isArchived: isArchived
    });

// Student APIs
export const updateAgents = (agentsId, studentId) =>
    request.post(`/api/students/${studentId}/agents`, agentsId);

export const updateEditors = (editorsId, studentId) =>
    request.post(`/api/students/${studentId}/editors`, editorsId);

export const updateAttributes = (attributesId, studentId) =>
    request.post(`/api/students/${studentId}/attributes`, attributesId);

export const downloadProfile = (category, studentId) =>
    request.get(`/api/students/${studentId}/files/${category}`, {
        responseType: 'blob'
    });

export const getPdfV2 = ({ apiPath }) =>
    getDataBlob(apiPath, {
        responseType: 'blob'
    });

export const uploadforstudentV2 = ({ category, studentId, formData }) =>
    postData(`/api/students/${studentId}/files/${category}`, formData);

export const getStudentAndDocLinks = (studentId) =>
    request.get(`/api/students/doc-links/${studentId}`);

export const getStudentsAndDocLinks2 = (queryString) =>
    getData(`/api/students/doc-links?${queryString}`);

export const updateDocumentationHelperLink = (link, key, category) =>
    request.post(`/api/students/doc-links`, { link, key, category });

export const deleteFileV2 = ({ category, studentId }) =>
    deleteData(`/api/students/${studentId}/files/${category}`);

export const uploadVPDforstudentV2 = ({
    studentId,
    applicationId,
    data,
    fileType
}) =>
    postData(
        `/api/students/${studentId}/vpd/${applicationId}/${fileType}`,
        data
    );

export const deleteVPDFileV2 = ({ studentId, applicationId, fileType }) =>
    deleteData(`/api/students/${studentId}/vpd/${applicationId}/${fileType}`);

export const SetAsNotNeededV2 = ({ studentId, applicationId }) =>
    putData(`/api/students/${studentId}/vpd/${applicationId}/VPD`);

export const SetUniAssistPaidV2 = ({ studentId, applicationId, isPaid }) =>
    postData(`/api/students/${studentId}/vpd/${applicationId}/payments`, {
        isPaid
    });

export const updateProfileDocumentStatus = (
    category,
    studentId,
    status,
    message
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
}) =>
    postData(`/api/students/${student_id}/${category}/status`, {
        status,
        feedback
    });

// Account APIs
export const getTemplates = () => request.get(`/api/account/files/template`);
export const uploadtemplate = (category, data) =>
    request.post(`/api/account/files/template/${category}`, data);
export const deleteTemplateFile = (category) =>
    request.delete(`/api/account/files/template/${category}`);
export const getTemplateDownload = (category) =>
    request.get(`/api/account/files/template/${category}`, {
        responseType: 'blob'
    });

export const WidgetTranscriptanalyserV2 = (
    language,
    courses,
    requirementIds,
    factor
) =>
    request.post(`/api/widgets/transcript/engine/v2/${language}`, {
        courses,
        requirementIds,
        factor
    });

export const WidgetanalyzedFileV2Download = (adminId) =>
    request.get(`/api/widgets/transcript/v2/${adminId}`);

export const WidgetExportMessagePDF = (student_id) =>
    request.get(`/api/widgets/messages/export/${student_id}`, {
        responseType: 'blob'
    });

export const transcriptanalyser_testV2 = ({
    language,
    studentId,
    requirementIds,
    factor
}) =>
    request.post(`/api/courses/transcript/v2/${studentId}/${language}`, {
        requirementIds,
        factor
    });

export const analyzedFileV2Download = (user_id) =>
    request.get(`/api/courses/transcript/v2/${user_id}`);

export const getCourseKeywordSets = () => request.get(`/api/course-keywords`);
export const getCourseKeywordSet = (keywordsSetId) =>
    request.get(`/api/course-keywords/${keywordsSetId}`);
export const postKeywordSet = (keywordsSet) =>
    request.post('/api/course-keywords/new', keywordsSet);
export const putKeywordSet = (keywordsSetId, keywordsSet) =>
    request.put(`/api/course-keywords/${keywordsSetId}`, keywordsSet);
export const deleteKeywordSet = (keywordsSetId) =>
    request.delete(`/api/course-keywords/${keywordsSetId}`);

// Courses DB
export const getAllCourses = () => getData(`/api/all-courses`);
export const getCourse = ({ courseId }) =>
    getData(`/api/all-courses/${courseId}`);
export const updateCourse = ({ courseId, payload }) =>
    putData(`/api/all-courses/${courseId}`, payload);
export const deleteCourse = ({ courseId }) =>
    deleteData(`/api/all-courses/${courseId}`);
export const createCourse = ({ payload }) =>
    postData(`/api/all-courses`, payload);

export const getProgramRequirements = () =>
    request.get(`/api/program-requirements`);

export const getProgramRequirementsV2 = () =>
    getData(`/api/program-requirements`);

export const getSameProgramStudents = ({ programId }) =>
    getData(`/api/programs/same-program-students/${programId}`);

export const postProgramRequirements = (payload) =>
    request.post(`/api/program-requirements/new`, payload);
export const getProgramsAndCourseKeywordSets = () =>
    request.get(`/api/program-requirements/programs-and-keywords`);
export const getProgramRequirement = (programRequirementId) =>
    request.get(`/api/program-requirements/${programRequirementId}`);
export const putProgramRequirement = (programRequirementId, payload) =>
    request.put(`/api/program-requirements/${programRequirementId}`, payload);
export const deleteProgramRequirement = (programRequirementId) =>
    request.delete(`/api/program-requirements/${programRequirementId}`);

export const updateStudentApplicationResult = (
    studentId,
    applicationId,
    programId,
    result,
    data
) =>
    request.post(
        `/api/account/applications/result/${studentId}/${applicationId}/${programId}/${result}`,
        data
    );

export const deleteGenralFileThread = (documentsthreadId, studentId) =>
    request.delete(`/api/document-threads/${documentsthreadId}/${studentId}`);

export const deleteProgramSpecificFileThread = (
    documentsthreadId,
    application_id,
    studentId
) =>
    request.delete(
        `/api/document-threads/${documentsthreadId}/${application_id}/${studentId}`
    );

export const getCheckDocumentPatternIsPassed = (thread_id, file_type) =>
    request.get(
        `/api/document-threads/pattern/check/${thread_id}/${file_type}`
    );

export const getActiveThreads = (queryString) =>
    getData(`/api/document-threads/overview/all?${queryString}`);

export const getMyStudentThreadMetrics = () =>
    request.get(`/api/document-threads/overview/my-student-metrics`);

export const getThreadsByStudent = (studentId) =>
    getData(`/api/document-threads/student-threads/${studentId}`);

export const getMyStudentsThreads = ({ userId, queryString }) =>
    getData(
        `/api/document-threads/overview/taiger-user/${userId}?${queryString}`
    );

export const SetFileAsFinal = (documentsthreadId, studentId, application_id) =>
    request.put(`/api/document-threads/${documentsthreadId}/${studentId}`, {
        application_id
    });

export const updateEssayWriter = (editor_id, documentsthreadId) =>
    request.post(`/api/document-threads/${documentsthreadId}/essay`, editor_id);

export const putThreadFavorite = (documentsthreadId) =>
    request.put(`/api/document-threads/${documentsthreadId}/favorite`);

// Portal Informations APIs
export const getPortalCredentials = (student_id) =>
    request.get(`/api/portal-informations/${student_id}`);
export const postPortalCredentials = (student_id, applicationId, credentials) =>
    request.post(
        `/api/portal-informations/${student_id}/${applicationId}`,
        credentials
    );

// Course, Transcript APIs
export const getMycourses = (student_id) =>
    request.get(`/api/courses/${student_id}`);
export const putMycourses = (student_id, locked) =>
    request.put(`/api/courses/${student_id}`, locked);

// Documentation APIs
// Internal docs
export const getInternalDocumentationPage = () =>
    request.get(`/api/docs/taiger/internal/confidential`);
export const updateInternalDocumentationPage = (doc) =>
    request.put(`/api/docs/taiger/internal/confidential`, doc);
// External docs
export const uploadImage = (file) =>
    request.post(`/api/docs/upload/image`, file);
export const uploadDocDocs = (file) =>
    request.post(`/api/docs/upload/docs`, file);
export const getCategorizedDocumentationPage = (category) =>
    request.get(`/api/docs/pages/${category}`);
export const updateDocumentationPage = (category, doc) =>
    request.put(`/api/docs/pages/${category}`, doc);
export const getCategorizedDocumentation = (category) =>
    request.get(`/api/docs/${category}`);
export const deleteDocumentation = (doc_id) =>
    request.delete(`/api/docs/${doc_id}`);
export const getDocumentation = (doc_id) =>
    request.get(`/api/docs/search/${doc_id}`);
export const getAllDocumentations = () => request.get(`/api/docs/all`);

export const updateDocumentation = (doc_id, doc) =>
    request.put(`/api/docs/${doc_id}`, doc);
export const createDocumentation = (doc) => request.post(`/api/docs`, doc);

export const getInternalDocumentation = (doc_id) =>
    request.get(`/api/docs/internal/search/${doc_id}`);
export const getAllInternalDocumentations = () =>
    request.get(`/api/docs/internal/all`);
export const updateInternalDocumentation = (doc_id, doc) =>
    request.put(`/api/docs/internal/${doc_id}`, doc);
export const createInternalDocumentation = (doc) =>
    request.post(`/api/docs/internal`, doc);
export const deleteInternalDocumentation = (doc_id) =>
    request.delete(`/api/docs/internal/${doc_id}`);

// Program APIs
export const getProgramsV2 = () => getData('/api/programs');
export const getProgramsOverview = () => getData('/api/programs/overview');
export const getSchoolsDistribution = () =>
    getData('/api/programs/schools-distribution');
export const getDistinctSchools = () => request.get('/api/programs/schools');
export const updateSchoolAttributes = (schoolAttributes) =>
    request.put('/api/programs/schools', schoolAttributes);

export const getProgram = (programId) =>
    request.get(`/api/programs/${programId}`);

export const getProgramV2 = (programId) =>
    getData(`/api/programs/${programId}`);

export const deleteProgramV2 = ({ program_id }) =>
    deleteData(`/api/programs/${program_id}`);

export const createProgramV2 = ({ program }) =>
    postData('/api/programs', program);

export const updateProgram = (program) =>
    request.put(`/api/programs/${program._id}`, program);

export const updateProgramV2 = ({ program }) =>
    putData(`/api/programs/${program._id}`, program);

export const getProgramChangeRequests = (programId) =>
    request.get(`/api/programs/${programId}/change-requests`);

export const reviewProgramChangeRequests = (requestId) =>
    request.post(`/api/programs/review-changes/${requestId}`);

export const refreshProgram = (programId) =>
    postData(`/api/programs/${programId}/refresh`, {});

// Docs APIs
export const deleteDoc = (id) => request.delete(`/api/docs/${id}`);
export const addDoc = (id) => request.post(`/api/docs/${id}`);
export const updateDoc = (id, doc_temp) =>
    request.post(`/api/docs/${id}`, doc_temp);

export const createArticle = (article) => request.post('/api/docs', article);

export const updateArticle = (id, article) =>
    request.post(`/api/docs/${id}`, article);

const getArticle = (type) => request.get(`/api/docs/${type}`);

export const getApplicationArticle = () => getArticle('application');

export const uploadDocumentThreadImage = (documentsthreadId, studentId, file) =>
    request.post(
        `/api/document-threads/image/${documentsthreadId}/${studentId}`,
        file
    );

export const putOriginAuthorConfirmedByStudent = (
    documentsthreadId,
    studentId,
    checked
) =>
    request.put(
        `/api/document-threads/${documentsthreadId}/${studentId}/origin-author`,
        {
            checked
        }
    );

export const SubmitMessageWithAttachment = (
    documentsthreadId,
    studentId,
    newFile
) =>
    request.post(
        `/api/document-threads/${documentsthreadId}/${studentId}`,
        newFile
    );

export const getMessageFileDownload = (documentsthreadId, messageId, fileId) =>
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
    getData('/api/communications/all');
export const getCommunicationThread = (studentId) =>
    request.get(`/api/communications/${studentId}`);
export const getCommunicationThreadV2 = ({ studentId }) =>
    getData(`/api/communications/${studentId}`);
export const loadCommunicationThread = (studentId, pageNumber) =>
    request.get(`/api/communications/${studentId}/pages/${pageNumber}`);
export const postCommunicationThreadV2 = ({ studentId, formData }) =>
    postData(`/api/communications/${studentId}`, formData);
export const updateAMessageInCommunicationThreadV2 = ({
    communication_id,
    communication_messageId,
    message
}) =>
    putData(
        `/api/communications/${communication_id}/${communication_messageId}`,
        { message }
    );
export const deleteAMessageInCommunicationThread = (
    student_id,
    communication_messageId
) =>
    request.delete(
        `/api/communications/${student_id}/${communication_messageId}`
    );

export const deleteAMessageInCommunicationThreadV2 = ({
    student_id,
    communication_messageId
}) =>
    deleteData(`/api/communications/${student_id}/${communication_messageId}`);

export const IgnoreMessageV2 = ({
    student_id,
    communication_messageId,
    message,
    ignoreMessageState
}) =>
    putData(
        `/api/communications/${student_id}/${communication_messageId}/${ignoreMessageState}/ignore`,
        message
    );

export const getSurveyInputs = (documentsthreadId) =>
    request.get(`/api/document-threads/${documentsthreadId}/survey-inputs`);

export const putSurveyInput = (surveyId, input, informEditor) =>
    request.put(`/api/document-threads/survey-input/${surveyId}`, {
        input,
        informEditor
    });

export const postSurveyInput = (input, informEditor) =>
    request.post(`/api/document-threads/survey-input/`, {
        input,
        informEditor
    });

export const resetSurveyInput = (surveyId) =>
    request.delete(`/api/document-threads/survey-input/${surveyId}`);

export const getMessagThread = (documentsthreadId) =>
    request.get(`/api/document-threads/${documentsthreadId}`);
export const deleteAMessageInThread = (documentsthreadId, messageId) =>
    request.delete(
        `/api/document-threads/delete/${documentsthreadId}/${messageId}`
    );

export const initGeneralMessageThread = (studentId, document_catgory) =>
    request.post(
        `/api/document-threads/init/general/${studentId}/${document_catgory}`
    );

export const IgnoreMessageThread = (
    documentThreadId,
    documentsthreadMessageId,
    documentsthreadMessage,
    ignoreMessageState
) =>
    request.put(
        `/api/document-threads/${documentThreadId}/${documentsthreadMessageId}/${ignoreMessageState}/ignored`,
        documentsthreadMessage
    );

export const initApplicationMessageThread = (
    studentId,
    applicationId,
    document_catgory
) =>
    request.post(
        `/api/document-threads/init/application/${studentId}/${applicationId}/${document_catgory}`
    );

// remove Banner/notification
export const updateBanner = (notification_key) =>
    request.post(`/api/account/student/notifications`, {
        notification_key
    });

export const updateAgentBanner = (notification_key, student_id) =>
    request.post(`/api/account/agent/notifications`, {
        notification_key,
        student_id
    });

//Survey:
export const updateAcademicBackground = (university, student_id) =>
    request.post(`/api/account/survey/university/${student_id}`, {
        university
    });
export const updateLanguageSkill = (language, student_id) =>
    request.post(`/api/account/survey/language/${student_id}`, { language });
export const updateApplicationPreference = (
    application_preference,
    student_id
) =>
    request.post(`/api/account/survey/preferences/${student_id}`, {
        application_preference
    });

export const getMyAcademicBackground = () => request.get('/api/account/survey');

export const getStudentNotes = (student_id) =>
    request.get(`/api/notes/${student_id}`);
export const updateStudentNotes = (student_id, notes) =>
    request.put(`/api/notes/${student_id}`, { notes });

// Time Slot events:
export const getActiveEventsNumber = () => request.get(`/api/events/ping`);
export const getAllEvents = () => request.get(`/api/events/all`);
export const getEvents = ({ startTime, endTime }) =>
    request.get(`/api/events?startTime=${startTime}&endTime=${endTime}`);
export const postEvent = (event) => request.post(`/api/events`, event);
export const confirmEvent = (event_id, updated_event) =>
    request.put(`/api/events/${event_id}/confirm`, updated_event);
export const updateEvent = (event_id, updated_event) =>
    request.put(`/api/events/${event_id}`, updated_event);
export const deleteEvent = (event_id) =>
    request.delete(`/api/events/${event_id}`);
export const updateOfficehours = (user_id, officehours, timezone) =>
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
export const getResponseIntervalByStudent = (studentId) =>
    request.get(`/api/teams/response-interval/${studentId}`);

export const getAgentProfile = (agent_id) =>
    request.get(`/api/agents/profile/${agent_id}`);
export const getExpense = (taiger_user_id) =>
    request.get(`/api/expenses/users/${taiger_user_id}`);
export const updateUserPermission = (taiger_user_id, permissions) =>
    request.post(`/api/permissions/${taiger_user_id}`, permissions);

//Personal Data:
export const updatePersonalData = (user_id, personaldata) =>
    request.post(`/api/account/profile/${user_id}`, { personaldata });

export const updateCredentials = (credentials, email, password) =>
    request.post(`/api/account/credentials`, { credentials, email, password });

//TaiGer AI:
export const processProgramList = (programId) =>
    request.get(`/api/taigerai/program/${programId}`);
export const TaiGerAiGeneral = (prompt) =>
    request.post(`/api/taigerai/general`, {
        prompt
    });
export const TaiGerAiGeneral2 = (prompt) =>
    fetch(`${BASE_URL}/api/taigerai/general`, {
        method: 'post', // HTTP POST to send query to server
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'text/event-stream' // indicates what the server actually sent
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }) // server is expecting JSON
    });

export const TaiGerChatAssistant = (prompt, studentId) =>
    fetch(`${BASE_URL}/api/taigerai/chat/${studentId}`, {
        method: 'post', // HTTP POST to send query to server
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'text/event-stream' // indicates what the server actually sent
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }) // server is expecting JSON
    });

export const cvmlrlAi2 = (prompt) =>
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
    student_input,
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
export const getInterviews = (queryString) =>
    getData(`/api/interviews?${queryString}`);
export const getAllOpenInterviews = () => request.get('/api/interviews/open');
export const getInterview = (interview_id) =>
    request.get(`/api/interviews/${interview_id}`);
export const deleteInterview = (interview_id) =>
    request.delete(`/api/interviews/${interview_id}`);
export const updateInterview = (interview_id, payload) =>
    request.put(`/api/interviews/${interview_id}`, payload);
export const updateInterviewSurvey = (interview_id, payload) =>
    request.put(`/api/interviews/${interview_id}/survey`, payload);
export const getInterviewSurvey = (interview_id) =>
    request.get(`/api/interviews/${interview_id}/survey`);
export const getMyInterviews = () =>
    request.get(`/api/interviews/my-interviews`);
export const createInterview = (program_id, student_id, payload) =>
    request.post(`/api/interviews/create/${program_id}/${student_id}`, payload);
export const addInterviewTrainingDateTime = (interview_id, payload) =>
    request.post(`/api/interviews/time/${interview_id}`, payload);

export const getInterviewsByProgramId = (program_id) =>
    getData(`/api/interviews/interview/${program_id}`);
export const getInterviewsByStudentId = (student_id) =>
    getData(`/api/interviews/interviews/${student_id}`);

// Program feedback Ticket
export const createProgramReport = (program_id, description, type) =>
    request.post(`/api/tickets/`, { program_id, description, type });
export const getProgramTicket = (type, program_id) =>
    request.get(`/api/tickets?type=${type}&program_id=${program_id}`);
export const updateProgramTicket = (ticket_id, updatedTicket) =>
    request.put(`/api/tickets/${ticket_id}`, updatedTicket);
export const deleteProgramTicket = (ticket_id) =>
    request.delete(`/api/tickets/${ticket_id}`);
export const getProgramTickets = (type, status) =>
    request.get(`/api/tickets?type=${type}&status=${status}`);
export const getProgramTicketsV2 = ({ type, status }) =>
    getData(`/api/tickets?type=${type}&status=${status}`);

// Complaint
export const createComplaintTicket = (ticket) =>
    request.post(`/api/complaints/`, { ticket });
export const getComplaintsTicket = (ticketId) =>
    request.get(`/api/complaints/${ticketId}`);
export const getComplaintsTickets = (type) =>
    request.get(`/api/complaints?type=${type}`);
export const updateComplaintsTicket = (ticketId, updatedTicket) =>
    request.put(`/api/complaints/${ticketId}`, updatedTicket);
export const deleteComplaintsTicket = (ticketId) =>
    request.delete(`/api/complaints/${ticketId}`);
export const submitMessageInTicketWithAttachment = (
    ticketId,
    studentId,
    newFile
) =>
    request.post(
        `/api/complaints/new-message/${ticketId}/${studentId}`,
        newFile
    );
export const deleteAMessageinTicket = (ticketId, message_id) =>
    request.delete(`/api/complaints/${ticketId}/${message_id}`);

// CRM
export const getCRMStats = () => request.get(`/api/crm/stats`);
export const getCRMLeads = () => request.get(`/api/crm/leads`);
export const getCRMLead = (leadId) => request.get(`/api/crm/leads/${leadId}`);
export const getLeadIdByUserId = (userId) =>
    request.get(`/api/crm/students/${userId}/lead`);
export const getCRMMeetings = () => request.get(`/api/crm/meetings`);
export const getCRMMeeting = (meetingId) =>
    request.get(`/api/crm/meetings/${meetingId}`);
export const updateCRMMeeting = (meetingId, payload) =>
    request.put(`/api/crm/meetings/${meetingId}`, payload);
export const getCRMDeals = () => request.get(`/api/crm/deals`);
export const createCRMDeal = (payload) =>
    request.post(`/api/crm/deals`, payload);
export const updateCRMDeal = (dealId, payload) =>
    request.put(`/api/crm/deals/${dealId}`, payload);
export const getCRMSalesReps = () => request.get(`/api/crm/sales-reps`);
