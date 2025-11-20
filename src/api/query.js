import {
    getAdmissions,
    getAdmissionsOverview,
    verifyV2,
    getProgramsV2,
    getProgramsOverview,
    getSchoolsDistribution,
    getProgramTicketsV2,
    getProgramV2,
    getStudentsAndDocLinks2,
    getStatisticsV2,
    getStatisticsOverviewV2,
    getStatisticsAgentsV2,
    getStatisticsKPIV2,
    getStatisticsResponseTimeV2,
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
    getApplications,
    getApplicationStudentV2,
    getStudentAndDocLinks,
    getActiveStudents,
    getActiveStudentsApplications,
    getInterviews,
    getInterview,
    getAuditLog,
    getTasksOverview,
    getIsManager,
    getCRMStats,
    getCRMLeads,
    getCRMLead,
    getCRMMeetings,
    getCRMMeeting,
    getCRMDeals,
    getCRMSalesReps,
    getInterviewsByStudentId,
    getInterviewsByProgramId,
    getUsers,
    getUsersCount,
    getActiveThreads,
    getSameProgramStudents,
    getArchivStudents,
    getTeamMembers,
    getExpense,
    getApplicationConflicts,
    getMycourses,
    getStudentMeetings,
    getAllEvents,
    getEvents,
    getBookedEvents
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

export const getActiveThreadsQuery = (queryString) => ({
    queryKey: ['active-threads', queryString],
    queryFn: () => getActiveThreads(queryString),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data?.data || []
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

export const getStatisticsOverviewQuery = () => ({
    queryKey: ['statistics', 'overview'],
    queryFn: getStatisticsOverviewV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getStatisticsAgentsQuery = () => ({
    queryKey: ['statistics', 'agents'],
    queryFn: getStatisticsAgentsV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getStatisticsKPIQuery = () => ({
    queryKey: ['statistics', 'kpi'],
    queryFn: getStatisticsKPIV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getStatisticsResponseTimeQuery = () => ({
    queryKey: ['statistics', 'response-time'],
    queryFn: getStatisticsResponseTimeV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
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

export const getUsersQuery = (queryString) => ({
    queryKey: ['users', queryString],
    queryFn: () => getUsers(queryString),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data?.data || []
});

export const getUsersCountQuery = () => ({
    queryKey: ['users/count'],
    queryFn: () => getUsersCount(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data?.data || []
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

export const getInterviewsByStudentIdQuery = (studentId) => ({
    queryKey: ['interviews/student', studentId],
    queryFn: () => getInterviewsByStudentId(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getInterviewsByProgramIdQuery = (programId) => ({
    queryKey: ['interviews/program', programId],
    queryFn: () => getInterviewsByProgramId(programId),
    staleTime: 1000 * 60 * 5 // 5 minutes
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
    queryKey: ['program-requirements/all'],
    queryFn: () => getProgramRequirementsV2(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getSameProgramStudentsQuery = ({ programId, enabled }) => ({
    queryKey: ['same-program-students', programId],
    queryFn: () => getSameProgramStudents({ programId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data?.data || [],
    enabled: enabled ?? false
});

export const getProgramsQuery = () => ({
    queryKey: ['programs'],
    queryFn: getProgramsV2,
    staleTime: 1000 * 60 // 1 minutes
});

export const getProgramsOverviewQuery = () => ({
    queryKey: ['programs', 'overview'],
    queryFn: getProgramsOverview,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getSchoolsDistributionQuery = () => ({
    queryKey: ['programs', 'schools-distribution'],
    queryFn: getSchoolsDistribution,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getVerifyQuery = () => ({
    queryKey: ['verify'],
    queryFn: verifyV2,
    staleTime: 1000 * 60 * 10 // 10 minutes
});

export const getApplicationsQuery = (queryString) => ({
    queryKey: ['applications', queryString],
    queryFn: () => getApplications(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response?.data || null
});

export const getStudentsAndDocLinks2Query = (queryString) => ({
    queryKey: ['students/doc-links', queryString],
    queryFn: () => getStudentsAndDocLinks2(queryString),
    staleTime: 1000 * 60 * 1 // 1 minutes
});

export const getAdmissionsQuery = (queryString) => ({
    queryKey: ['admissions', queryString],
    queryFn: () => getAdmissions(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAdmissionsOverviewQuery = () => ({
    queryKey: ['admissions'],
    queryFn: () => getAdmissionsOverview(),
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
    gcTime: 1000 * 60 * 5 // 15 minutes
});

export const getCRMLeadsQuery = () => ({
    queryKey: ['crm/leads'],
    queryFn: getCRMLeads,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMLeadQuery = (leadId) => ({
    queryKey: ['crm/lead', leadId],
    queryFn: () => getCRMLead(leadId),
    gcTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMMeetingsQuery = () => ({
    queryKey: ['crm/meetings'],
    queryFn: getCRMMeetings,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMMeetingQuery = (meetingId) => ({
    queryKey: ['crm/meeting', meetingId],
    queryFn: () => getCRMMeeting(meetingId),
    gcTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMDealsQuery = () => ({
    queryKey: ['crm/deals'],
    queryFn: getCRMDeals,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMSalesRepsQuery = () => ({
    queryKey: ['crm/sales-reps'],
    queryFn: getCRMSalesReps,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getInterviewQuery = (interviewId) => ({
    queryKey: ['interviews', interviewId],
    queryFn: () => getInterview(interviewId),
    staleTime: 1000 * 60 * 1 // 1 minute
});

export const getArchivStudentsQuery = (TaiGerStaffId) => ({
    queryKey: ['archiv-students', TaiGerStaffId],
    queryFn: () => getArchivStudents(TaiGerStaffId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getTeamMembersQuery = () => ({
    queryKey: ['team-members'],
    queryFn: getTeamMembers,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getExpenseQuery = (taigerUserId) => ({
    queryKey: ['expenses', 'user', taigerUserId],
    queryFn: () => getExpense(taigerUserId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getApplicationConflictsQuery = () => ({
    queryKey: ['application-conflicts'],
    queryFn: getApplicationConflicts,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMycoursesQuery = (studentId) => ({
    queryKey: ['mycourses', studentId],
    queryFn: () => getMycourses(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentMeetingsQuery = (studentId) => ({
    queryKey: ['student-meetings', studentId],
    queryFn: () => getStudentMeetings(studentId),
    staleTime: 1000 * 60 * 2 // 2 minutes
});

export const getAllEventsQuery = () => ({
    queryKey: ['events', 'all'],
    queryFn: () => getAllEvents(),
    staleTime: 1000 * 60 * 2 // 2 minutes
});

export const getEventsQuery = ({ startTime, endTime }) => ({
    queryKey: ['events', { startTime, endTime }],
    queryFn: () => getEvents({ startTime, endTime }),
    staleTime: 1000 * 60 * 2 // 2 minutes
});

export const getBookedEventsQuery = ({ startTime, endTime }) => ({
    queryKey: ['events', 'booked', { startTime, endTime }],
    queryFn: () => getBookedEvents({ startTime, endTime }),
    staleTime: 1000 * 60 * 2 // 2 minutes
});
