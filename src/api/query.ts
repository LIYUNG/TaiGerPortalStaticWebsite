import { UseQueryOptions } from '@tanstack/react-query';
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
    getStudent,
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
    getUsersOverview,
    getActiveThreads,
    getSameProgramStudents,
    getArchivStudents,
    getTeamMembers,
    getExpense,
    getApplicationConflicts,
    getMycourses,
    getStudentMeetings,
    getEvents,
    getBookedEvents
} from '.';
import type { DocumentThreadResponse, IStudentResponse, QueryString, StudentId, UserId } from './types';

export const getMessagThreadQuery = (threadId: string) => ({
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

export const getActiveThreadsQuery = (queryString: QueryString): UseQueryOptions => ({
    queryKey: ['active-threads', queryString],
    queryFn: () => getActiveThreads(queryString),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: unknown) => (data as { data?: DocumentThreadResponse[] })?.data || []
});

export const getProgramQuery = ({ programId }: { programId: string }) => ({
    queryKey: ['programs', programId],
    queryFn: () => getProgramV2(programId),
    staleTime: 1000 * 60 // 1 minutes
});

export const getStudentUniAssistQuery = ({
    studentId
}: {
    studentId: StudentId;
}) => ({
    queryKey: ['uniassist', studentId],
    queryFn: () => getStudentUniAssistV2({ studentId }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getProgramTicketsQuery = ({
    type,
    status
}: {
    type: string;
    status: string;
}) => ({
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

export const getIsManagerQuery = ({ userId }: { userId: UserId }) => ({
    queryKey: ['is-manager', userId],
    queryFn: getIsManager,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getUsersQuery = (queryString: QueryString) => ({
    queryKey: ['users', queryString],
    queryFn: () => getUsers(queryString),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: { data?: { data?: unknown[] } }) => data.data?.data || []
});

export const getUsersCountQuery = () => ({
    queryKey: ['users/count'],
    queryFn: () => getUsersCount(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: { data?: { data?: unknown[] } }) => data.data?.data || []
});

export const getUsersOverviewQuery = () => ({
    queryKey: ['users', 'overview'],
    queryFn: getUsersOverview,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getActiveStudentsQuery = (queryString: QueryString): UseQueryOptions => ({
    queryKey: ['students/active', queryString],
    queryFn: () => getActiveStudents(queryString),
    staleTime: 1000 * 60 * 1, // 1 minutes
    select: (data: unknown) => (data as { data?: IStudentResponse[] })?.data || []
});

export const getStudentsV3Query = (queryString: QueryString) => ({
    queryKey: ['students/v3', queryString],
    queryFn: () => getStudentsV3(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentQuery = (studentId: StudentId) => ({
    queryKey: ['student', studentId],
    queryFn: () => getStudent(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAllCoursessQuery = () => ({
    queryKey: ['all-courses/all'],
    queryFn: () => getAllCourses(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCoursessQuery = (courseId: string) => ({
    queryKey: ['all-courses/all', courseId],
    queryFn: () => getCourse({ courseId }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCommunicationQuery = (studentId: StudentId) => ({
    queryKey: ['communications', studentId],
    queryFn: () => getCommunicationThreadV2({ studentId }),
    staleTime: 1000 * 50 // 50 seconds
});

export const getInterviewsByStudentIdQuery = (studentId: StudentId) => ({
    queryKey: ['interviews/student', studentId],
    queryFn: () => getInterviewsByStudentId(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getInterviewsByProgramIdQuery = (programId: string) => ({
    queryKey: ['interviews/program', programId],
    queryFn: () => getInterviewsByProgramId(programId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMyCommunicationQuery = () => ({
    queryKey: ['communications', 'my'],
    queryFn: () => getMyCommunicationThreadV2(),
    staleTime: 1000 * 30 // 30 seconds
});

export const getPDFQuery = (apiPath: string) => ({
    queryKey: ['get-pdf', apiPath],
    queryFn: () => getPdfV2({ apiPath }),
    staleTime: 1000 * 60 * 1 // 50 seconds
});

export const getProgramRequirementsQuery = () => ({
    queryKey: ['program-requirements/all'],
    queryFn: () => getProgramRequirementsV2(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getSameProgramStudentsQuery = ({
    programId,
    enabled
}: {
    programId: string;
    enabled?: boolean;
}) => ({
    queryKey: ['same-program-students', programId],
    queryFn: () => getSameProgramStudents({ programId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: { data?: unknown[] } | undefined) => data?.data || [],
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

export const getApplicationsQuery = (queryString: QueryString) => ({
    queryKey: ['applications', queryString],
    queryFn: () => getApplications(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getApplicationStudentV2Query = ({
    studentId
}: {
    studentId: StudentId;
}) => ({
    queryKey: ['applications/student', studentId],
    queryFn: () => getApplicationStudentV2(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentAndDocLinksQuery = ({
    studentId
}: {
    studentId: StudentId;
}) => ({
    queryKey: ['students/doc-links', studentId],
    queryFn: () => getStudentAndDocLinks(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getActiveStudentsApplicationsV2Query = () => ({
    queryKey: ['applications/all/active/applications'],
    queryFn: () => getActiveStudentsApplications(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMyStudentsApplicationsV2Query = ({
    userId,
    queryString
}: {
    userId: UserId;
    queryString: QueryString;
}) => ({
    queryKey: ['applications/taiger-user', userId, queryString],
    queryFn: () => getMyStudentsApplications({ userId, queryString }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMyStudentsThreadsQuery = ({
    userId,
    queryString
}: {
    userId: UserId;
    queryString: QueryString;
}) => ({
    queryKey: ['document-threads/overview/taiger-user', userId, queryString],
    queryFn: () => getMyStudentsThreads({ userId, queryString }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response: { data?: unknown } | null) => response?.data || null
});

export const getStudentsAndDocLinks2Query = (queryString: QueryString) => ({
    queryKey: ['students/doc-links', queryString],
    queryFn: () => getStudentsAndDocLinks2(queryString),
    staleTime: 1000 * 60 * 1 // 1 minutes
});

export const getAdmissionsQuery = (queryString: QueryString) => ({
    queryKey: ['admissions', queryString],
    queryFn: () => getAdmissions(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAdmissionsOverviewQuery = () => ({
    queryKey: ['admissions'],
    queryFn: () => getAdmissionsOverview(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getInterviewsQuery = (queryString: QueryString) => ({
    queryKey: ['interviews', queryString],
    queryFn: () => getInterviews(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAuditLogQuery = (queryString: QueryString) => ({
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

export const getCRMLeadQuery = (leadId: string) => ({
    queryKey: ['crm/lead', leadId],
    queryFn: () => getCRMLead(leadId),
    gcTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMMeetingsQuery = () => ({
    queryKey: ['crm/meetings'],
    queryFn: getCRMMeetings,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMMeetingQuery = (meetingId: string) => ({
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

export const getInterviewQuery = (interviewId: string) => ({
    queryKey: ['interviews', interviewId],
    queryFn: () => getInterview(interviewId),
    staleTime: 1000 * 60 * 1 // 1 minute
});

export const getArchivStudentsQuery = (TaiGerStaffId: string) => ({
    queryKey: ['archiv-students', TaiGerStaffId],
    queryFn: () => getArchivStudents(TaiGerStaffId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getTeamMembersQuery = () => ({
    queryKey: ['team-members'],
    queryFn: getTeamMembers,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getExpenseQuery = (taigerUserId: UserId) => ({
    queryKey: ['expenses', 'user', taigerUserId],
    queryFn: () => getExpense(taigerUserId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getApplicationConflictsQuery = () => ({
    queryKey: ['application-conflicts'],
    queryFn: getApplicationConflicts,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMycoursesQuery = (studentId: StudentId) => ({
    queryKey: ['mycourses', studentId],
    queryFn: () => getMycourses(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentMeetingsQuery = (studentId: StudentId) => ({
    queryKey: ['student-meetings', studentId],
    queryFn: () => getStudentMeetings(studentId),
    staleTime: 1000 * 60 * 2 // 2 minutes
});

export const getEventsQuery = (queryString: QueryString) => ({
    queryKey: ['events', queryString],
    queryFn: () => getEvents(queryString),
    staleTime: 1000 * 60 * 2 // 2 minutes
});

export const getBookedEventsQuery = ({
    startTime,
    endTime
}: {
    startTime: string;
    endTime: string;
}) => ({
    queryKey: ['events', 'booked', { startTime, endTime }],
    queryFn: () => getBookedEvents({ startTime, endTime }),
    staleTime: 1000 * 60 * 2 // 2 minutes
});
