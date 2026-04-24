import { useQuery } from '@tanstack/react-query';

import { getProgramV2 } from '@/api';
import { GetProgramResponse } from '@taiger-common/model/dist/types';

/**
 * Fetches one program with related metadata by id.
 */
export function useProgram(programId: string) {
    const result = useQuery<GetProgramResponse>({
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
