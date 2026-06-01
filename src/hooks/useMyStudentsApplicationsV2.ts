import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveStudentsApplications } from '@/api';
import type {
    GetMyStudentsApplicationsResponse,
    IApplicationPopulated,
    IUserWithId
} from '@taiger-common/model';

export type MyStudentsApplicationsV2Params = {
    userId: string;
} & Record<string, string | number | boolean | undefined>;

export type UseMyStudentsApplicationsV2Options = {
    enabled?: boolean;
};

export type MyStudentsApplicationsV2Data = {
    applications: IApplicationPopulated[];
    user?: IUserWithId;
};

/**
 * Fetches my students applications (v2) for a user with optional query params.
 */
export function useMyStudentsApplicationsV2(
    params: MyStudentsApplicationsV2Params,
    options?: UseMyStudentsApplicationsV2Options
) {
    const { userId, ...rest } = params;
    // The merged endpoint scopes to a TaiGer user's students via the `userId`
    // query param (omit it for all active students).
    const queryStringValue = queryString.stringify({ userId, ...rest });
    const queryKey = [
        'applications/taiger-user',
        userId,
        queryStringValue
    ] as const;

    const result = useQuery<
        GetMyStudentsApplicationsResponse,
        Error,
        MyStudentsApplicationsV2Data
    >({
        queryKey,
        queryFn: () => getActiveStudentsApplications(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? { applications: [] },
        enabled: options?.enabled ?? true
    });

    return {
        ...result,
        data: result.data ?? { applications: [] },
        queryKey
    };
}
