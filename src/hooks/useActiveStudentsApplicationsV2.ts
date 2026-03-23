import { useQuery } from '@tanstack/react-query';

import { getActiveStudentsApplications } from '@/api';
import type {
    GetActiveStudentsApplicationsResponse,
    IApplicationPopulated
} from '@taiger-common/model';

export type UseActiveStudentsApplicationsV2Options = {
    enabled?: boolean;
};

/**
 * Fetches active students' applications (all applicants overview).
 */
export function useActiveStudentsApplicationsV2(
    options?: UseActiveStudentsApplicationsV2Options
) {
    const result = useQuery<
        GetActiveStudentsApplicationsResponse,
        Error,
        IApplicationPopulated[]
    >({
        queryKey: ['applications/all/active/applications'],
        queryFn: getActiveStudentsApplications,
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? [],
        enabled: options?.enabled ?? true
    });

    return {
        ...result,
        queryKey: ['applications/all/active/applications'] as const
    };
}
