import { useQuery } from '@tanstack/react-query';

import { getProgramsOverview } from '@/api';
import type { GetProgramsOverviewResponse } from '@taiger-common/model';

/**
 * Fetches programs overview (totals, byCountry, byDegree, etc.).
 */
export function useProgramsOverview() {
    const result = useQuery<
        GetProgramsOverviewResponse,
        Error,
        Record<string, unknown>
    >({
        queryKey: ['programs', 'overview'],
        queryFn: getProgramsOverview,
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? {}
    });

    return {
        ...result,
        data: result.data ?? {},
        queryKey: ['programs', 'overview'] as const
    };
}
