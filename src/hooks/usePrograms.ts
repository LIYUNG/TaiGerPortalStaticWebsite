import { useQuery } from '@tanstack/react-query';

import { getProgramsQuery } from '@api/query';
import type { ProgramResponse } from '@/api/types';

/**
 * Fetches all programs.
 * Unifies getProgramsQuery usage across ProgramList and other consumers.
 */
export function usePrograms() {
    const query = getProgramsQuery();

    const result = useQuery({
        ...query,
        queryFn: async () => {
            const res = await query.queryFn();
            return res as { data?: ProgramResponse[] };
        },
        select: (data: { data?: ProgramResponse[] } | undefined) =>
            data?.data ?? []
    });

    return {
        ...result,
        data: result.data ?? [],
        queryKey: query.queryKey
    };
}
