import { useQuery } from '@tanstack/react-query';

import { getActiveStudentsApplicationsV2Query } from '@/api/query';

export type UseActiveStudentsApplicationsV2Options = {
    enabled?: boolean;
};

/**
 * Fetches active students' applications (all applicants overview).
 * Unifies getActiveStudentsApplicationsV2Query usage.
 */
export function useActiveStudentsApplicationsV2(
    options?: UseActiveStudentsApplicationsV2Options
) {
    const query = getActiveStudentsApplicationsV2Query();

    const result = useQuery({
        ...query,
        enabled: options?.enabled ?? true
    });

    const applications = result.data?.data ?? [];

    return {
        ...result,
        applications,
        queryKey: query.queryKey
    };
}
