import { useQuery } from '@tanstack/react-query';

import { getUsersPaginatedQuery } from '@/api/query';
import type { GetUsersPaginatedParams } from '@/api/apis';

export type UsersPaginatedResult = {
    users: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
};

export type UseUsersPaginatedOptions = GetUsersPaginatedParams & {
    enabled?: boolean;
};

/**
 * Fetches a paginated page of users (User List tabs).
 */
export function useUsersPaginated(options: UseUsersPaginatedOptions) {
    const { enabled = true, ...params } = options;

    const result = useQuery({
        ...getUsersPaginatedQuery(params),
        enabled
    });

    return {
        ...result,
        data: result.data as UsersPaginatedResult | undefined,
        queryKey: ['users', 'paginated', params] as const
    };
}
