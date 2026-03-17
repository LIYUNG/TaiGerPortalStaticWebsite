import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveThreads } from '@/api';
import type {
    GetActiveThreadsResponse,
    IDocumentthreadPopulated
} from '@taiger-common/model';

export type ActiveThreadsParams = Record<
    string,
    string | number | boolean | undefined
>;

/**
 * Fetches active document threads with optional filter params.
 */
export function useActiveThreads(params: ActiveThreadsParams = {}) {
    const queryStringValue = queryString.stringify(params);

    const result = useQuery<
        GetActiveThreadsResponse,
        Error,
        IDocumentthreadPopulated[]
    >({
        queryKey: ['active-threads', queryStringValue],
        queryFn: () => getActiveThreads(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? []
    });

    return {
        ...result,
        data: result.data ?? [],
        queryKey: ['active-threads', queryStringValue] as const
    };
}
