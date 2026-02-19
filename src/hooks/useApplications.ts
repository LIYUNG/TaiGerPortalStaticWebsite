import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getApplicationsQuery } from '@/api/query';
import type { IApplicationWithId } from '@/api/types';

export type ApplicationsParams = Record<
    string,
    string | number | boolean | undefined
>;

export type UseApplicationsOptions = {
    enabled?: boolean;
};

/**
 * Fetches applications with optional filter params.
 * Unifies getApplicationsQuery usage across Admissions Overview and other consumers.
 */
export function useApplications(
    params: ApplicationsParams = {},
    options?: UseApplicationsOptions
) {
    const queryStringValue = queryString.stringify(params);
    const query = getApplicationsQuery(queryStringValue);

    const result = useQuery({
        ...query,
        queryFn: async () => {
            const res = await query.queryFn();
            return res as {
                data?: IApplicationWithId[];
                result?: IApplicationWithId[];
            };
        },
        select: (
            data:
                | {
                      data?: IApplicationWithId[];
                      result?: IApplicationWithId[];
                  }
                | undefined
        ) => data?.data ?? data?.result ?? [],
        enabled: options?.enabled ?? true
    });

    return {
        ...result,
        data: result.data ?? [],
        queryKey: query.queryKey
    };
}
