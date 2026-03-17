import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getApplications } from '@/api';
import type { GetApplicationsResponse, IApplicationPopulated } from '@taiger-common/model';

export type ApplicationsParams = Record<
    string,
    string | number | boolean | undefined
>;

export type UseApplicationsOptions = {
    enabled?: boolean;
};

/**
 * Fetches applications with optional filter params.
 */
export function useApplications(
    params: ApplicationsParams = {},
    options?: UseApplicationsOptions
) {
    const queryStringValue = queryString.stringify(params);

    const result = useQuery<GetApplicationsResponse, Error, IApplicationPopulated[]>({
        queryKey: ['applications', queryStringValue],
        queryFn: () => getApplications(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) =>
            response.data ?? [],
        enabled: options?.enabled ?? true
    });

    return result;
}
