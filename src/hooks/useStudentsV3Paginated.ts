import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import { getStudentsV3Paginated } from '@/api';
import type { GetStudentsV3PaginatedResponse } from '@/api/types';
import type { IStudentResponse } from '@taiger-common/model';

export type SortOrder = 'asc' | 'desc';

export interface UseStudentsV3PaginatedParams {
    /** 0-based page index (matches MUI DataGrid / MRT paginationModel.page). */
    page: number;
    /** Page size. */
    pageSize: number;
    /** Backend sort field (e.g. name_en, agentNames, application_year). */
    sortBy?: string;
    sortOrder?: SortOrder;
    /** Free-text search across name / agent-editor names / university / etc. */
    search?: string;
    /**
     * Base scoping params (same as getStudentsV3): archiv flag and agent/editor
     * id filters.
     */
    archiv?: boolean;
    agents?: string;
    editors?: string;
    /** Per-column contains filters keyed by table column id. */
    filters?: Record<string, string>;
    enabled?: boolean;
}

const buildQueryString = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    archiv,
    agents,
    editors,
    filters
}: UseStudentsV3PaginatedParams): string =>
    queryString.stringify(
        {
            // Backend pagination is 1-based; the grid is 0-based.
            page: page + 1,
            limit: pageSize,
            sortBy,
            sortOrder,
            search,
            archiv,
            agents,
            editors,
            ...filters
        },
        { skipNull: true, skipEmptyString: true }
    );

/**
 * Server-side paginated/sorted/searchable students list.
 * Returns one page plus the total match count for the grid's rowCount.
 */
export function useStudentsV3Paginated(params: UseStudentsV3PaginatedParams) {
    const queryStringValue = buildQueryString(params);

    const result = useQuery<
        GetStudentsV3PaginatedResponse,
        Error,
        { students: IStudentResponse[]; total: number }
    >({
        queryKey: ['students/v3/paginated', queryStringValue],
        queryFn: () => getStudentsV3Paginated(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Keep the previous page visible while the next one loads (no flicker).
        placeholderData: keepPreviousData,
        select: (response) => ({
            students: response.data?.students ?? [],
            total: response.data?.total ?? 0
        }),
        enabled: params.enabled ?? true
    });

    return {
        ...result,
        rows: result.data?.students ?? [],
        rowCount: result.data?.total ?? 0
    };
}
