import { useQuery } from '@tanstack/react-query';

import { getProgramsV2 } from '@/api';
import type { GetProgramsResponse } from '@taiger-common/model';
import type { ProgramResponse } from '@/api/types';
import type { ProgramListFilters } from '@/pages/Program/programListFilters';

export type UseProgramsOptions = {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: ProgramListFilters;
    enabled?: boolean;
};

export type ProgramsQueryResult = {
    programs: ProgramResponse[];
    total: number;
    page: number;
    limit: number;
};

/**
 * Fetches a paginated page of programs.
 */
export function usePrograms(options?: UseProgramsOptions) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const search = options?.search?.trim() ?? '';
    const sortBy = options?.sortBy;
    const sortOrder = options?.sortOrder;
    const filters = options?.filters ?? {};

    const result = useQuery<GetProgramsResponse, Error, ProgramsQueryResult>({
        queryKey: ['programs', page, limit, search, sortBy, sortOrder, filters],
        queryFn: () =>
            getProgramsV2({ page, limit, search, sortBy, sortOrder, filters }),
        staleTime: 1000 * 60,
        enabled: options?.enabled ?? true,
        select: (response) => ({
            programs: response.data ?? [],
            total: response.total ?? 0,
            page: response.page ?? page,
            limit: response.limit ?? limit
        })
    });

    return {
        ...result,
        queryKey: [
            'programs',
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            filters
        ] as const
    };
}
