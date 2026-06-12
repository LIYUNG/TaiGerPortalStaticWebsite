import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import { getInterviewsPaginated, getMyInterviewsPaginated } from '@/api';
import type {
    GetInterviewsPaginatedResponse,
    GetMyInterviewsPaginatedResponse,
    PaginatedInterview
} from '@/api/types';
import type { IStudentResponse } from '@taiger-common/model';

export type SortOrder = 'asc' | 'desc';

/** 'all' = staff All-Interviews table; 'my' = student My-Interviews view. */
export type InterviewsScope = 'all' | 'my';

export interface UseInterviewsPaginatedParams {
    /** 0-based page index (matches MRT paginationModel.page). */
    page: number;
    /** Page size. */
    pageSize: number;
    /** Backend sort field (e.g. status, firstname_lastname, program_name). */
    sortBy?: string;
    sortOrder?: SortOrder;
    /** Free-text search across student / program / trainer names. */
    search?: string;
    /** Per-column filters keyed by backend filter query key. */
    filters?: Record<string, string>;
    /** Which endpoint to hit. */
    scope: InterviewsScope;
    enabled?: boolean;
}

const buildQueryString = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    filters
}: UseInterviewsPaginatedParams): string =>
    queryString.stringify(
        {
            // Backend pagination is 1-based; the grid is 0-based.
            page: page + 1,
            limit: pageSize,
            sortBy,
            sortOrder,
            search,
            ...filters
        },
        { skipNull: true, skipEmptyString: true }
    );

interface InterviewsSelected {
    interviews: PaginatedInterview[];
    total: number;
    student?: IStudentResponse;
    existingInterviewProgramIds: string[];
}

/**
 * Server-side paginated/sorted/searchable interviews. Returns one page plus the
 * total match count for the grid's rowCount. For the 'my' scope it also surfaces
 * the student (with applications) and the program ids already interviewed, used
 * to build the student "Add interview" list.
 */
export function useInterviewsPaginated(params: UseInterviewsPaginatedParams) {
    const queryStringValue = buildQueryString(params);

    const result = useQuery<
        GetInterviewsPaginatedResponse | GetMyInterviewsPaginatedResponse,
        Error,
        InterviewsSelected
    >({
        queryKey: ['interviews/paginated', params.scope, queryStringValue],
        queryFn: () =>
            params.scope === 'my'
                ? getMyInterviewsPaginated(queryStringValue)
                : getInterviewsPaginated(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Keep the previous page visible while the next one loads (no flicker).
        placeholderData: keepPreviousData,
        select: (response) => ({
            interviews: response.data?.interviews ?? [],
            total: response.data?.total ?? 0,
            student: (response as GetMyInterviewsPaginatedResponse).student,
            existingInterviewProgramIds:
                (response as GetMyInterviewsPaginatedResponse)
                    .existingInterviewProgramIds ?? []
        }),
        enabled: params.enabled ?? true
    });

    return {
        ...result,
        rows: result.data?.interviews ?? [],
        rowCount: result.data?.total ?? 0,
        student: result.data?.student,
        existingInterviewProgramIds:
            result.data?.existingInterviewProgramIds ?? []
    };
}
