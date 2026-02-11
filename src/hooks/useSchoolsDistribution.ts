import { useQuery } from '@tanstack/react-query';

import { getSchoolsDistributionQuery } from '@api/query';

/**
 * Fetches schools distribution (list of schools with program counts).
 * Unifies getSchoolsDistributionQuery usage across SchoolDistributionPage.
 */
export function useSchoolsDistribution() {
    const query = getSchoolsDistributionQuery();

    const result = useQuery(query);

    return {
        ...result,
        data: (result.data as { data?: unknown[] } | undefined)?.data ?? [],
        queryKey: query.queryKey
    };
}
