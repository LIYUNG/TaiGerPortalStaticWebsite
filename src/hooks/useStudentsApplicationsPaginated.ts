import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import { getStudentsApplicationsPaginated } from '@/api';
import type { GetActiveStudentsApplicationsPaginatedResponse } from '@/api/types';
import type { IApplicationPopulated } from '@taiger-common/model';

export type SortOrder = 'asc' | 'desc';

export interface UseStudentsApplicationsPaginatedParams {
    /** 0-based page index (matches MUI DataGrid paginationModel.page). */
    page: number;
    /** Page size. */
    pageSize: number;
    /** Backend sort field (e.g. program_name, school, deadline, application_year). */
    sortBy?: string;
    sortOrder?: SortOrder;
    /** Free-text search across program/school/student name/etc. */
    search?: string;
    /** Exact/contains filters keyed by backend field name. */
    filters?: Record<string, string>;
    /**
     * When set, scope results to the applications of the students this TaiGer
     * user supervises (as agent or editor).
     */
    userId?: string;
    /**
     * Archive scoping: `false` -> active (non-archived) students only; `true` ->
     * archived only; omitted -> all students (e.g. the admissions overview, which
     * spans archived students too).
     */
    archiv?: boolean;
    enabled?: boolean;
}

const buildQueryString = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    userId,
    archiv,
    filters
}: UseStudentsApplicationsPaginatedParams): string =>
    queryString.stringify(
        {
            // Backend pagination is 1-based; MUI DataGrid is 0-based.
            page: page + 1,
            limit: pageSize,
            sortBy,
            sortOrder,
            search,
            // Scope to a TaiGer user's supervised students (omit for all students).
            userId,
            // Omitted -> all students; `false` -> active only.
            archiv,
            ...filters
        },
        { skipNull: true, skipEmptyString: true }
    );

/**
 * Server-side paginated/sorted/searchable students' applications.
 * Returns one page plus the total match count for the grid's rowCount.
 */
export function useStudentsApplicationsPaginated(
    params: UseStudentsApplicationsPaginatedParams
) {
    const queryStringValue = buildQueryString(params);

    const result = useQuery<
        GetActiveStudentsApplicationsPaginatedResponse,
        Error,
        { applications: IApplicationPopulated[]; total: number }
    >({
        queryKey: ['students/applications/paginated', queryStringValue],
        queryFn: () => getStudentsApplicationsPaginated(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Keep the previous page visible while the next one loads (no flicker).
        placeholderData: keepPreviousData,
        select: (response) => ({
            applications: response.data?.applications ?? [],
            total: response.data?.total ?? 0
        }),
        enabled: params.enabled ?? true
    });

    return {
        ...result,
        rows: result.data?.applications ?? [],
        rowCount: result.data?.total ?? 0
    };
}
