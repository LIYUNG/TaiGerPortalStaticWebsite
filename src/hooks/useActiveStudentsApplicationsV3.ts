import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import {
    getActiveStudentsApplicationsV3,
    getMyStudentsApplicationsV3
} from '@/api';
import type { GetActiveStudentsApplicationsPaginatedResponse } from '@/api/types';
import type { IApplicationPopulated } from '@taiger-common/model';

export type SortOrder = 'asc' | 'desc';

export interface UseActiveStudentsApplicationsV3Params {
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
     * user supervises (as agent or editor) instead of all active students.
     */
    userId?: string;
    enabled?: boolean;
}

const buildQueryString = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    filters
}: UseActiveStudentsApplicationsV3Params): string =>
    queryString.stringify(
        {
            // Backend pagination is 1-based; MUI DataGrid is 0-based.
            page: page + 1,
            limit: pageSize,
            sortBy,
            sortOrder,
            search,
            ...filters
        },
        { skipNull: true, skipEmptyString: true }
    );

/**
 * Server-side paginated/sorted/searchable active students' applications.
 * Returns one page plus the total match count for the grid's rowCount.
 */
export function useActiveStudentsApplicationsV3(
    params: UseActiveStudentsApplicationsV3Params
) {
    const queryStringValue = buildQueryString(params);
    const { userId } = params;

    const result = useQuery<
        GetActiveStudentsApplicationsPaginatedResponse,
        Error,
        { applications: IApplicationPopulated[]; total: number }
    >({
        queryKey: userId
            ? ['applications/taiger-user/paginated', userId, queryStringValue]
            : [
                  'applications/all/active/applications/paginated',
                  queryStringValue
              ],
        queryFn: () =>
            userId
                ? getMyStudentsApplicationsV3({
                      userId,
                      queryString: queryStringValue
                  })
                : getActiveStudentsApplicationsV3(queryStringValue),
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
