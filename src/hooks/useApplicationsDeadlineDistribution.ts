import { useQuery } from '@tanstack/react-query';

import { getApplicationsDeadlineDistribution } from '@/api';
import type {
    ApplicationsDeadlineDistributionBucket,
    GetApplicationsDeadlineDistributionResponse
} from '@/api/types';

export interface UseApplicationsDeadlineDistributionParams {
    /**
     * When set, scope to the applications of the students this TaiGer user
     * supervises (agent or editor). Omit for all active students.
     */
    userId?: string;
    enabled?: boolean;
}

/**
 * Open-applications deadline distribution for the bar chart, computed in the DB
 * (returns only the {name, active, potentials} buckets).
 */
export function useApplicationsDeadlineDistribution({
    userId,
    enabled
}: UseApplicationsDeadlineDistributionParams = {}) {
    const result = useQuery<
        GetApplicationsDeadlineDistributionResponse,
        Error,
        ApplicationsDeadlineDistributionBucket[]
    >({
        queryKey: ['applications/distribution', userId ?? null],
        queryFn: () => getApplicationsDeadlineDistribution(userId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? [],
        enabled: enabled ?? true
    });

    return {
        ...result,
        buckets: result.data ?? []
    };
}
