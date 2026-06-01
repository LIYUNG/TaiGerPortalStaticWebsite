import { useQuery } from '@tanstack/react-query';

import { getApplicationProgramsUpdateStatus } from '@/api';
import type {
    ApplicationProgramUpdateStatusRow,
    GetApplicationProgramsUpdateStatusResponse
} from '@/api/types';

export interface UseApplicationProgramsUpdateStatusParams {
    /**
     * When set, scope to the programs of the students this TaiGer user
     * supervises (agent or editor). Omit for all active students.
     */
    userId?: string;
    /** When 'O', only programs with a decided application are returned. */
    decided?: string;
    enabled?: boolean;
}

/**
 * Distinct programs (with update metadata) for the "Programs Update Status"
 * tabs, computed in the DB (returns only the small program list).
 */
export function useApplicationProgramsUpdateStatus({
    userId,
    decided,
    enabled
}: UseApplicationProgramsUpdateStatusParams = {}) {
    const result = useQuery<
        GetApplicationProgramsUpdateStatusResponse,
        Error,
        ApplicationProgramUpdateStatusRow[]
    >({
        queryKey: [
            'applications/program-update-status',
            userId ?? null,
            decided ?? null
        ],
        queryFn: () => getApplicationProgramsUpdateStatus({ userId, decided }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? [],
        enabled: enabled ?? true
    });

    return {
        ...result,
        rows: result.data ?? []
    };
}
