import {
    getAdmissions,
    verifyV2,
    getProgramsV2,
    getProgramTicketsV2,
    getProgramV2,
    getStudentsAndDocLinks2,
    getStatisticsV2,
    getStudentUniAssistV2,
    getProgramRequirementsV2,
    getAllCourses,
    getCourse,
    getCommunicationThreadV2,
    getPdfV2,
    getMyCommunicationThreadV2,
    getMessagThread,
    getStudentsV3,
    getMyStudentsApplications,
    getMyStudentsThreads,
    getApplicationStudentV2,
    getStudentAndDocLinks,
    getActiveStudents,
    getActiveStudentsApplications,
    getInterviews,
    getAuditLog,
    getTasksOverview,
    getIsManager,
    getCRMStats,
    getCRMLeads,
    getCRMLead,
    getCRMMeetings,
    getCRMMeeting
} from '.';

export const getMessagThreadQuery = (threadId) => ({
    queryKey: ['MessageThread', threadId],
    queryFn: async () => {
        try {
            const response = await getMessagThread(threadId);
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    staleTime: 1000 * 60, // 1 minutes
    cacheTime: 60 * 1000 // 1 minutes
});

export const getProgramQuery = ({ programId }) => ({
    queryKey: ['programs', programId],
    queryFn: () => getProgramV2(programId),
    staleTime: 1000 * 60 // 1 minutes
});

export const getStudentUniAssistQuery = ({ studentId }) => ({
    queryKey: ['uniassist', studentId],
    queryFn: () => getStudentUniAssistV2({ studentId }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getProgramTicketsQuery = ({ type, status }) => ({
    queryKey: ['tickets', { type, status }],
    queryFn: () => getProgramTicketsV2({ type, status }),
    staleTime: 1000 * 60 // 1 minutes
});

export const getStatisticsQuery = () => ({
    queryKey: ['statistics'],
    queryFn: getStatisticsV2,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getTasksOverviewQuery = () => ({
    queryKey: ['tasks-overview'],
    queryFn: getTasksOverview,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getIsManagerQuery = ({ userId }) => ({
    queryKey: ['is-manager', userId],
    queryFn: getIsManager,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getActiveStudentsQuery = (queryString) => ({
    queryKey: ['students/active', queryString],
    queryFn: () => getActiveStudents(queryString),
    staleTime: 1000 * 60 * 1 // 1 minutes
});

export const getStudentsV3Query = (queryString) => ({
    queryKey: ['students/v3', queryString],
    queryFn: () => getStudentsV3(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAllCoursessQuery = () => ({
    queryKey: ['all-courses/all'],
    queryFn: () => getAllCourses(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCoursessQuery = (courseId) => ({
    queryKey: ['all-courses/all', courseId],
    queryFn: () => getCourse({ courseId }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCommunicationQuery = (studentId) => ({
    queryKey: ['communications', studentId],
    queryFn: () => getCommunicationThreadV2({ studentId }),
    staleTime: 1000 * 50 // 50 seconds
});

export const getMyCommunicationQuery = () => ({
    queryKey: ['communications', 'my'],
    queryFn: () => getMyCommunicationThreadV2(),
    staleTime: 1000 * 30 // 30 seconds
});

export const getPDFQuery = (apiPath) => ({
    queryKey: ['get-pdf', apiPath],
    queryFn: () => getPdfV2({ apiPath }),
    staleTime: 1000 * 60 * 1 // 50 seconds
});

export const getProgramRequirementsQuery = () => ({
    queryKey: ['students/all'],
    queryFn: () => getProgramRequirementsV2(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getProgramsQuery = () => ({
    queryKey: ['programs'],
    queryFn: getProgramsV2,
    staleTime: 1000 * 60 // 1 minutes
});

export const getVerifyQuery = () => ({
    queryKey: ['verify'],
    queryFn: verifyV2,
    staleTime: 1000 * 60 * 10 // 10 minutes
});

export const getApplicationStudentV2Query = ({ studentId }) => ({
    queryKey: ['applications/student', studentId],
    queryFn: () => getApplicationStudentV2(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentAndDocLinksQuery = ({ studentId }) => ({
    queryKey: ['students/doc-links', studentId],
    queryFn: () => getStudentAndDocLinks(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getActiveStudentsApplicationsV2Query = () => ({
    queryKey: ['applications/all/active/applications'],
    queryFn: () => getActiveStudentsApplications(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMyStudentsApplicationsV2Query = ({ userId, queryString }) => ({
    queryKey: ['applications/taiger-user', userId, queryString],
    queryFn: () => getMyStudentsApplications({ userId, queryString }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMyStudentsThreadsQuery = ({ userId, queryString }) => ({
    queryKey: ['document-threads/overview/taiger-user', userId, queryString],
    queryFn: () => getMyStudentsThreads({ userId, queryString }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentsAndDocLinks2Query = (queryString) => ({
    queryKey: ['students/doc-links', queryString],
    queryFn: () => getStudentsAndDocLinks2(queryString),
    staleTime: 1000 * 60 * 1 // 1 minutes
});

export const getAdmissionsQuery = () => ({
    queryKey: ['admissions'],
    queryFn: getAdmissions,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getInterviewsQuery = (queryString) => ({
    queryKey: ['interviews', queryString],
    queryFn: () => getInterviews(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAuditLogQuery = (queryString) => ({
    queryKey: ['audit-log', queryString],
    queryFn: () => getAuditLog(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMStatsQuery = () => ({
    queryKey: ['crm/stats'],
    queryFn: () => getCRMStats(),
    staleTime: 1000 * 60 * 5 // 15 minutes
});

export const getCRMLeadsQuery = () => ({
    queryKey: ['crm/leads'],
    queryFn: getCRMLeads,
    staleTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMLeadQuery = (leadId) => ({
    queryKey: ['crm/leads', leadId],
    queryFn: () => getCRMLead(leadId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMMeetingsQuery = () => ({
    queryKey: ['crm/meetings'],
    queryFn: getCRMMeetings,
    staleTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMMeetingQuery = (meetingId) => ({
    queryKey: ['crm/meetings', meetingId],
    queryFn: () => getCRMMeeting(meetingId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});
