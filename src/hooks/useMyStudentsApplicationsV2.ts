import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getMyStudentsApplicationsV2Query } from '@api/query';
import type { IApplicationWithId, IUserWithId } from '@api/types';

export type MyStudentsApplicationsV2Params = {
    userId: string;
} & Record<string, string | number | boolean | undefined>;

export type UseMyStudentsApplicationsV2Options = {
    enabled?: boolean;
};

export type MyStudentsApplicationsV2Data = {
    applications: IApplicationWithId[];
    user?: IUserWithId;
};

/**
 * Fetches my students applications (v2) for a user with optional query params.
 * Unifies getMyStudentsApplicationsV2Query usage across ApplicantsOverview, AgentMainView, AgentPage.
 */
export function useMyStudentsApplicationsV2(
    params: MyStudentsApplicationsV2Params,
    options?: UseMyStudentsApplicationsV2Options
) {
    const { userId, ...rest } = params;
    const queryStringValue = queryString.stringify(rest);
    const query = getMyStudentsApplicationsV2Query({
        userId,
        queryString: queryStringValue
    });

    const result = useQuery({
        ...query,
        enabled: options?.enabled ?? true
    });

    const data: MyStudentsApplicationsV2Data =
        (result.data as { data?: MyStudentsApplicationsV2Data } | undefined)
            ?.data ?? { applications: [] };

    return {
        ...result,
        data,
        queryKey: query.queryKey
    };
}
