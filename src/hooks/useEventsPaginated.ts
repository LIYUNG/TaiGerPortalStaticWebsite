import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import { getEventsPaginated } from '@/api';
import type { GetEventsPaginatedResponse } from '@/api/types';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

export type SortOrder = 'asc' | 'desc';

export interface UseEventsPaginatedParams {
    /** 0-based page index. */
    page: number;
    /** Page size. Grow this for a "load more" accumulator. */
    pageSize: number;
    /** ISO upper bound on `end` (defaults server-side to now → the Past window). */
    before?: string;
    /** ISO lower bound on `end`. */
    after?: string;
    /** Optional receiver filter (staff agent-filter dropdown). */
    receiver_id?: string;
    sortOrder?: SortOrder;
    enabled?: boolean;
}

export const buildEventsPaginatedQueryString = ({
    page,
    pageSize,
    before,
    after,
    receiver_id,
    sortOrder
}: UseEventsPaginatedParams): string =>
    queryString.stringify(
        {
            // Backend pagination is 1-based; the grid/list is 0-based.
            page: page + 1,
            limit: pageSize,
            before,
            after,
            receiver_id,
            sortOrder
        },
        { skipNull: true, skipEmptyString: true }
    );

/**
 * Server-side paginated, role-scoped events for the office-hours "Past" list.
 * Returns one page plus the total match count. Use a growing `pageSize` for a
 * "Load more" accumulator (keepPreviousData keeps the list visible between
 * fetches).
 */
export function useEventsPaginated(params: UseEventsPaginatedParams) {
    const queryStringValue = buildEventsPaginatedQueryString(params);

    const result = useQuery<
        GetEventsPaginatedResponse,
        Error,
        { events: EventConfirmationCardEvent[]; total: number }
    >({
        queryKey: ['events/paginated', queryStringValue],
        queryFn: () => getEventsPaginated(queryStringValue),
        staleTime: 1000 * 60 * 2,
        placeholderData: keepPreviousData,
        select: (response) => ({
            events: response.data?.events ?? [],
            total: response.data?.total ?? 0
        }),
        enabled: params.enabled ?? true
    });

    return {
        ...result,
        rows: result.data?.events ?? [],
        rowCount: result.data?.total ?? 0
    };
}

export default useEventsPaginated;
