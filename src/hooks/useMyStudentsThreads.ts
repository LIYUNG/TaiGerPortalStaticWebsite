import { useQuery } from '@tanstack/react-query';

import { getMyStudentsThreadsQuery } from '@/api/query';
import type { QueryString } from '@/api/types';
import type { UserId } from '@taiger-common/model';

export type UseMyStudentsThreadsParams = {
    userId: UserId;
    queryString: QueryString;
};

export type MyStudentsThreadsData = {
    threads: unknown[];
    success: boolean;
    status: number;
    /** Present when API returns user (e.g. EditorPage for a specific editor). */
    user?: unknown;
};

/**
 * Fetches my students threads (document-threads overview) for the given user and query.
 * Unifies getMyStudentsThreadsQuery usage across AgentSupportDocuments, AgentMainView, EditorMainView.
 */
export function useMyStudentsThreads(params: UseMyStudentsThreadsParams | null) {
    const query =
        params != null
            ? getMyStudentsThreadsQuery({
                  userId: params.userId,
                  queryString: params.queryString
              })
            : null;

    const result = useQuery({
        ...(query ?? {
            queryKey: ['document-threads/overview/taiger-user', 'disabled'],
            queryFn: () => Promise.resolve(null)
        }),
        enabled: params != null,
        select: (response: unknown): MyStudentsThreadsData => {
            const res = response as {
                data?: { threads?: unknown[]; success?: boolean; user?: unknown };
                status?: number;
            } | null;
            return {
                threads: res?.data?.threads ?? [],
                success: res?.data?.success ?? false,
                status: res?.status ?? 0,
                user: res?.data?.user
            };
        }
    });

    return {
        ...result,
        data: result.data ?? { threads: [], success: false, status: 0, user: undefined },
        queryKey: query?.queryKey
    };
}
