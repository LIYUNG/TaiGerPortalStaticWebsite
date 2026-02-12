import { useQuery } from '@tanstack/react-query';

import { getApplicationStudentV2Query } from '@api/query';
import type { StudentId } from '@/api/types';

/** API response body from getData: { data: { data: student }, archiv? } */
type ApplicationStudentBody = {
    data?: { data?: unknown };
    archiv?: boolean;
};

export type UseApplicationStudentOptions = {
    enabled?: boolean;
};

/**
 * Fetches a student's application data by studentId.
 * Unifies getApplicationStudentV2Query usage across StudentDashboard.
 * getApplicationStudentV2 uses getData, so result is the API body directly.
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

    const body = result.data as ApplicationStudentBody | undefined;
    return {
        ...result,
        data: body,
        archiv: body?.archiv,
        queryKey: query.queryKey
    };
}
