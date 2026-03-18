import { useQuery } from '@tanstack/react-query';

import { getSchoolsDistribution } from '@/api';
import type { GetSchoolsDistributionResponse } from '@taiger-common/model';

/**
 * Fetches schools distribution (list of schools with program counts).
 */
export function useSchoolsDistribution() {
    const result = useQuery<GetSchoolsDistributionResponse, Error, unknown[]>({
        queryKey: ['programs', 'schools-distribution'],
        queryFn: getSchoolsDistribution,
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? []
    });

    return {
        ...result,
        data: result.data ?? [],
        queryKey: ['programs', 'schools-distribution'] as const
    };
}
