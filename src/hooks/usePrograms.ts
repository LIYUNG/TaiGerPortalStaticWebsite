import { useQuery } from '@tanstack/react-query';

import { getProgramsV2 } from '@/api';
import type { GetProgramsResponse } from '@taiger-common/model';
import type { ProgramResponse } from '@/api/types';

/**
 * Fetches all programs.
 */
export function usePrograms() {
    const result = useQuery<GetProgramsResponse, Error, ProgramResponse[]>({
        queryKey: ['programs'],
        queryFn: getProgramsV2,
        staleTime: 1000 * 60, // 1 minute
        select: (response) => response.data ?? []
    });

    return {
        ...result,
        queryKey: ['programs'] as const
    };
}
