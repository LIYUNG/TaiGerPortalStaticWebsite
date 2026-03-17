import { useQuery } from '@tanstack/react-query';

import { getMyStudentsThreads } from '@/api';
import type { QueryString } from '@/api/types';
import type { GetMyStudentThreadsResponse, UserId } from '@taiger-common/model';

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
 */
export function useMyStudentsThreads(params: UseMyStudentsThreadsParams | null) {
    const queryKey =
        params != null
            ? (['document-threads/overview/taiger-user', params.userId, params.queryString] as const)
            : (['document-threads/overview/taiger-user', 'disabled'] as const);

    const result = useQuery<
        GetMyStudentThreadsResponse | null,
        Error,
        MyStudentsThreadsData
    >({
        queryKey,
        queryFn: () =>
            params != null
                ? getMyStudentsThreads({
                      userId: params.userId,
                      queryString: params.queryString
                  })
                : Promise.resolve(null),
        enabled: params != null,
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response): MyStudentsThreadsData => {
            if (response == null) {
                return { threads: [], success: false, status: 0, user: undefined };
            }
            const res = response as {
                data?: { threads?: unknown[]; success?: boolean; user?: unknown };
                status?: number;
            };
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
        queryKey
    };
}
