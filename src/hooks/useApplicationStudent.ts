import { useQuery } from '@tanstack/react-query';

import { getApplicationStudentV2Query } from '@/api/query';
import type { IStudentResponse, StudentId } from '@taiger-common/model';

export type UseApplicationStudentOptions = {
    enabled?: boolean;
};

/**
 * Fetches a student's application data by studentId.
 * Unifies getApplicationStudentV2Query usage across StudentDashboard.
 * Returns IStudentResponse (GET /api/applications/student/:studentId) with archiv from the student payload.
 */
export function useApplicationStudent(
    studentId: StudentId | undefined,
    options?: UseApplicationStudentOptions
) {
    const query = getApplicationStudentV2Query({ studentId: studentId ?? '' });

    const result = useQuery({
        ...query,
        enabled: (options?.enabled ?? true) && !!studentId
    });

    const data = result.data as IStudentResponse | null | undefined;
    return {
        ...result,
        data: data,
        archiv: data?.archiv,
        queryKey: query.queryKey
    };
}
