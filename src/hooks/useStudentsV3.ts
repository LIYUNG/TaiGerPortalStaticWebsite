import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getStudentsV3Query } from '@api/query';
import type { IStudentResponse } from '@/api/types';

export type StudentsV3Params = Record<
    string,
    string | number | boolean | string[] | undefined
>;

export type UseStudentsV3Options = {
    enabled?: boolean;
};

/**
 * Fetches students v3 with optional filter params.
 * Unifies getStudentsV3Query usage across dashboards, assignment pages, and dialogs.
 */
export function useStudentsV3(
    params: StudentsV3Params = {},
    options?: UseStudentsV3Options
) {
    const queryStringValue = queryString.stringify(params);
    const query = getStudentsV3Query(queryStringValue);

    const result = useQuery({
        ...query,
        queryFn: async () => {
            const res = await query.queryFn();
            return res as { data?: IStudentResponse[] };
        },
        select: (data: { data?: IStudentResponse[] } | undefined) =>
            data?.data ?? [],
        enabled: options?.enabled ?? true
    });

    return {
        ...result,
        data: result.data ?? [],
        queryKey: query.queryKey
    };
}
