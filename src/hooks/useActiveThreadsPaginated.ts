import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveThreadsV2, getMyStudentsThreadsV2 } from '@/api';
import type {
    GetActiveThreadsPaginatedResponse,
    OpenTaskRow
} from '@/api/types';

export type SortOrder = 'asc' | 'desc';
export type ThreadCategory =
    | 'all'
    | 'in_progress'
    | 'no_input'
    | 'withdraw'
    | 'closed'
    | 'no_writer'
    | 'new_message'
    | 'fav'
    | 'followup'
    | 'pending_progress';

export interface UseActiveThreadsPaginatedParams {
    /** 0-based page index (matches MRT paginationModel.page). */
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: SortOrder;
    search?: string;
    /** Tab partition. */
    category?: ThreadCategory;
    /** Logged-in user id, for the viewer-dependent tabs (fav/new/followup). */
    viewerId?: string;
    /**
     * When set, scope to this TaiGer user's supervised students (+ essays
     * outsourced to them) — the "My Students" view. Omit for all active students.
     */
    userId?: string;
    /** High-value column filters keyed by backend param name. */
    filters?: Record<string, string>;
    enabled?: boolean;
}

const buildQueryString = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    category,
    viewerId,
    filters
}: UseActiveThreadsPaginatedParams): string =>
    queryString.stringify(
        {
            page: page + 1, // backend is 1-based
            limit: pageSize,
            sortBy,
            sortOrder,
            search,
            category,
            viewerId,
            ...filters
        },
        { skipNull: true, skipEmptyString: true }
    );

/**
 * Server-side paginated/sorted/filtered active document threads for the CVMLRL
 * center. Returns one slim page plus the total match count.
 */
export function useActiveThreadsPaginated(
    params: UseActiveThreadsPaginatedParams
) {
    const queryStringValue = buildQueryString(params);
    const { userId } = params;

    const result = useQuery<
        GetActiveThreadsPaginatedResponse,
        Error,
        { threads: OpenTaskRow[]; total: number }
    >({
        queryKey: userId
            ? ['active-threads/paginated', userId, queryStringValue]
            : ['active-threads/paginated', queryStringValue],
        queryFn: () =>
            userId
                ? getMyStudentsThreadsV2({
                      userId,
                      queryString: queryStringValue
                  })
                : getActiveThreadsV2(queryStringValue),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
        select: (response) => ({
            threads: response.data?.threads ?? [],
            total: response.data?.total ?? 0
        }),
        enabled: params.enabled ?? true
    });

    return {
        ...result,
        rows: result.data?.threads ?? [],
        rowCount: result.data?.total ?? 0
    };
}
