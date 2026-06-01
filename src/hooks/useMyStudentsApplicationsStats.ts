import { useQuery } from '@tanstack/react-query';

import { getMyStudentsApplicationsStats } from '@/api';
import type { GetMyStudentsApplicationsStatsResponse } from '@/api/types';

export interface UseMyStudentsApplicationsStatsOptions {
    enabled?: boolean;
}

/**
 * Aggregated application stats + the agent's user record for the AgentPage,
 * computed in the DB (returns only the counts, not the full applications).
 */
export function useMyStudentsApplicationsStats(
    userId: string,
    options?: UseMyStudentsApplicationsStatsOptions
) {
    return useQuery<
        GetMyStudentsApplicationsStatsResponse,
        Error,
        GetMyStudentsApplicationsStatsResponse['data']
    >({
        queryKey: ['applications/taiger-user/stats', userId],
        queryFn: () => getMyStudentsApplicationsStats(userId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data,
        enabled: (options?.enabled ?? true) && Boolean(userId)
    });
}
