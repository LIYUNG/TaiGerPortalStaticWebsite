import { useQuery } from '@tanstack/react-query';

import { getProgramV2 } from '@/api';
import type { GetProgramV2Response } from '@/api';

/**
 * Fetches one program with related metadata by id.
 */
export function useProgram(programId: string) {
    const result = useQuery<GetProgramV2Response>({
        queryKey: ['programs', programId],
        queryFn: () => getProgramV2(programId),
        enabled: !!programId,
        staleTime: 1000 * 60 // 1 minute
    });

    return {
        ...result,
        queryKey: ['programs', programId] as const
    };
}
