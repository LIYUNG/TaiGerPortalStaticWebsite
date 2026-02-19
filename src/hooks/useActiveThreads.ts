import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveThreadsQuery } from '@/api/query';

export type ActiveThreadsParams = Record<
    string,
    string | number | boolean | undefined
>;

/**
 * Fetches active document threads with optional filter params.
 * Unifies getActiveThreadsQuery usage across CVMLRLCenter, AssignEssayWriters, EssayDashboard.
 */
export function useActiveThreads(params: ActiveThreadsParams = {}) {
    const queryStringValue = queryString.stringify(params);
    const query = getActiveThreadsQuery(queryStringValue);

    const result = useQuery(query);

    return {
        ...result,
        data: result.data ?? [],
        queryKey: query.queryKey
    };
}
