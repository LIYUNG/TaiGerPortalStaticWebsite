import { useQuery } from '@tanstack/react-query';

import { getProgramsOverviewQuery } from '@api/query';

/**
 * Fetches programs overview (totals, byCountry, byDegree, etc.).
 * Unifies getProgramsOverviewQuery usage across SchoolDistributionPage,
 * ProgramDistributionDetailPage, and ProgramsOverviewPage.
 */
export function useProgramsOverview() {
    const query = getProgramsOverviewQuery();

    const result = useQuery(query);

    return {
        ...result,
        data: (result.data as { data?: Record<string, unknown> } | undefined)
            ?.data ?? {},
        queryKey: query.queryKey
    };
}
