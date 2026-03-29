import { UseQueryOptions } from '@tanstack/react-query';
import {
    getAdmissions,
    getAdmissionsOverview,
    verifyV2,
    getProgramTicketsV2,
    getStatisticsOverviewV2,
    getStatisticsAgentsV2,
    getStatisticsKPIV2,
    getStatisticsResponseTimeV2,
    getStudentUniAssistV2,
    getProgramRequirementsV2,
    getCourse,
    getCommunicationThreadV2,
    getPdfV2,
    getMyCommunicationThreadV2,
    getMessagThread,
    getStudent,
    getApplicationStudentV2,
    getQueryStudentsResults,
    getStudentAndDocLinks,
    getInterviews,
    getInterview,
    getAuditLog,
    getIsManager,
    getCRMStats,
    getCRMLeads,
    getCRMMeetings,
    getCRMMeeting,
    getCRMDeals,
    getCRMSalesReps,
    getInterviewsByStudentId,
    getInterviewsByProgramId,
    getUsers,
    getUsersCount,
    getUsersOverview,
    getSameProgramStudents,
    getArchivStudents,
    getExpense,
    getApplicationConflicts,
    getMycourses
} from '.';
import type { QueryString } from './types';
import type { StudentId, UserId } from '@taiger-common/model';

export const getMessagThreadQuery = (threadId: string): UseQueryOptions => ({
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
    staleTime: 1000 * 60 // 1 minutes
});

export const getStudentUniAssistQuery = ({
    studentId
}: {
    studentId: StudentId;
}): UseQueryOptions => ({
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
}): UseQueryOptions => ({
    queryKey: ['tickets', { type, status }],
    queryFn: () => getProgramTicketsV2({ type, status }),
    staleTime: 1000 * 60 // 1 minutes
});

export const getStatisticsOverviewQuery = (): UseQueryOptions => ({
    queryKey: ['statistics', 'overview'],
    queryFn: getStatisticsOverviewV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getStatisticsAgentsQuery = (): UseQueryOptions => ({
    queryKey: ['statistics', 'agents'],
    queryFn: getStatisticsAgentsV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getStatisticsKPIQuery = (): UseQueryOptions => ({
    queryKey: ['statistics', 'kpi'],
    queryFn: getStatisticsKPIV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getStatisticsResponseTimeQuery = (): UseQueryOptions => ({
    queryKey: ['statistics', 'response-time'],
    queryFn: getStatisticsResponseTimeV2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false // will be enabled only when the tab is active
});

export const getIsManagerQuery = ({
    userId
}: {
    userId: UserId;
}): UseQueryOptions => ({
    queryKey: ['is-manager', userId],
    queryFn: getIsManager,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getUsersQuery = (queryString: QueryString): UseQueryOptions => ({
    queryKey: ['users', queryString],
    queryFn: () => getUsers(queryString),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: unknown) =>
        (data as { data?: { data?: unknown[] } })?.data?.data ?? []
});

export const getUsersCountQuery = (): UseQueryOptions => ({
    queryKey: ['users/count'],
    queryFn: () => getUsersCount(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: unknown) => (data as { data?: unknown[] })?.data ?? []
});

export const getUsersOverviewQuery = (): UseQueryOptions => ({
    queryKey: ['users', 'overview'],
    queryFn: getUsersOverview,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getStudentQuery = (studentId: StudentId): UseQueryOptions => ({
    queryKey: ['student', studentId],
    queryFn: () => getStudent(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCoursessQuery = (courseId: string): UseQueryOptions => ({
    queryKey: ['all-courses/all', courseId],
    queryFn: () => getCourse({ courseId }),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCommunicationQuery = (
    studentId: StudentId
): UseQueryOptions => ({
    queryKey: ['communications', studentId],
    queryFn: () => getCommunicationThreadV2({ studentId }),
    staleTime: 1000 * 50 // 50 seconds
});

export const getInterviewsByStudentIdQuery = (
    studentId: StudentId
): UseQueryOptions => ({
    queryKey: ['interviews/student', studentId],
    queryFn: () => getInterviewsByStudentId(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getInterviewsByProgramIdQuery = (
    programId: string
): UseQueryOptions => ({
    queryKey: ['interviews/program', programId],
    queryFn: () => getInterviewsByProgramId(programId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMyCommunicationQuery = (): UseQueryOptions => ({
    queryKey: ['communications', 'my'],
    queryFn: () => getMyCommunicationThreadV2(),
    staleTime: 1000 * 30 // 30 seconds
});

export const getPDFQuery = (apiPath: string): UseQueryOptions => ({
    queryKey: ['get-pdf', apiPath],
    queryFn: () => getPdfV2({ apiPath }),
    staleTime: 1000 * 60 * 1 // 50 seconds
});

export const getProgramRequirementsQuery = (): UseQueryOptions => ({
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
}): UseQueryOptions => ({
    queryKey: ['same-program-students', programId],
    queryFn: () => getSameProgramStudents({ programId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: unknown) =>
        (data as { data?: unknown[] } | undefined)?.data ?? [],
    enabled: enabled ?? false
});

export const getVerifyQuery = (): UseQueryOptions => ({
    queryKey: ['verify'],
    queryFn: verifyV2,
    staleTime: 1000 * 60 * 10 // 10 minutes
});

export const getApplicationStudentV2Query = ({
    studentId
}: {
    studentId: StudentId;
}): UseQueryOptions => ({
    queryKey: ['applications/student', studentId],
    queryFn: () => getApplicationStudentV2(studentId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: unknown) => (data as { data?: unknown })?.data ?? null
});

export const getQueryStudentsResultsQuery = (
    keywords: string
): UseQueryOptions => ({
    queryKey: ['search/students', keywords],
    queryFn: () => getQueryStudentsResults(keywords),
    enabled: !!keywords.trim(),
    staleTime: 1000 * 60 * 2 // 2 minutes
});

export const getStudentAndDocLinksQuery = ({
    studentId
}: {
    studentId: StudentId;
}): UseQueryOptions => ({
    queryKey: ['students/doc-links', studentId],
    queryFn: () => getStudentAndDocLinks(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAdmissionsQuery = (
    queryString: QueryString
): UseQueryOptions => ({
    queryKey: ['admissions', queryString],
    queryFn: () => getAdmissions(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAdmissionsOverviewQuery = (): UseQueryOptions => ({
    queryKey: ['admissions'],
    queryFn: () => getAdmissionsOverview(),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getInterviewsQuery = (
    queryString: QueryString
): UseQueryOptions => ({
    queryKey: ['interviews', queryString],
    queryFn: () => getInterviews(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getAuditLogQuery = (
    queryString: QueryString
): UseQueryOptions => ({
    queryKey: ['audit-log', queryString],
    queryFn: () => getAuditLog(queryString),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMStatsQuery = (): UseQueryOptions => ({
    queryKey: ['crm/stats'],
    queryFn: () => getCRMStats(),
    gcTime: 1000 * 60 * 5 // 15 minutes
});

export const getCRMLeadsQuery = (): UseQueryOptions => ({
    queryKey: ['crm/leads'],
    queryFn: getCRMLeads,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMMeetingsQuery = (): UseQueryOptions => ({
    queryKey: ['crm/meetings'],
    queryFn: getCRMMeetings,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMMeetingQuery = (meetingId: string): UseQueryOptions => ({
    queryKey: ['crm/meeting', meetingId],
    queryFn: () => getCRMMeeting(meetingId),
    gcTime: 1000 * 60 * 5 // 5 minutes
});

export const getCRMDealsQuery = (): UseQueryOptions => ({
    queryKey: ['crm/deals'],
    queryFn: getCRMDeals,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getCRMSalesRepsQuery = (): UseQueryOptions => ({
    queryKey: ['crm/sales-reps'],
    queryFn: getCRMSalesReps,
    gcTime: 1000 * 60 * 15 // 15 minutes
});

export const getInterviewQuery = (interviewId: string): UseQueryOptions => ({
    queryKey: ['interviews', interviewId],
    queryFn: () => getInterview(interviewId),
    staleTime: 1000 * 60 * 1 // 1 minute
});

export const getArchivStudentsQuery = (
    TaiGerStaffId: string
): UseQueryOptions => ({
    queryKey: ['archiv-students', TaiGerStaffId],
    queryFn: () => getArchivStudents(TaiGerStaffId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getExpenseQuery = (taigerUserId: UserId): UseQueryOptions => ({
    queryKey: ['expenses', 'user', taigerUserId],
    queryFn: () => getExpense(taigerUserId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getApplicationConflictsQuery = (): UseQueryOptions => ({
    queryKey: ['application-conflicts'],
    queryFn: getApplicationConflicts,
    staleTime: 1000 * 60 * 5 // 5 minutes
});

export const getMycoursesQuery = (studentId: StudentId): UseQueryOptions => ({
    queryKey: ['mycourses', studentId],
    queryFn: () => getMycourses(studentId),
    staleTime: 1000 * 60 * 5 // 5 minutes
});
