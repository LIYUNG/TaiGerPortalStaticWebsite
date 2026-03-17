import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveStudents } from '@/api';
import type { GetActiveStudentsResponse, IStudentResponse } from '@taiger-common/model';

export type ActiveStudentsParams = Record<
    string,
    string | number | boolean | undefined
>;

/**
 * Fetches active students with optional filter params.
 */
export function useActiveStudents(params: ActiveStudentsParams = {}) {
    const queryStringValue = queryString.stringify(params);

    const result = useQuery<GetActiveStudentsResponse, Error, IStudentResponse[]>({
        queryKey: ['students/active', queryStringValue],
        queryFn: () => getActiveStudents(queryStringValue),
        staleTime: 1000 * 60 * 1, // 1 minute
        select: (response) => response.data ?? []
    });

    return {
        ...result,
        data: result.data ?? [],
        queryKey: ['students/active', queryStringValue] as const
    };
}
