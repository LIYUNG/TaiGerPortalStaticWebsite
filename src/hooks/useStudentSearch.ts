import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { StudentSearchResult } from '@taiger-common/model';

import { getQueryStudentsResultsQuery } from '@/api/query';

export type UseStudentSearchOptions = {
    /** Debounce delay in ms before running the search. Default 300. */
    debounceMs?: number;
};

/** Axios response: .data is ApiResponse<StudentSearchResult[]> from GET /api/search/students?q= */
type StudentSearchApiResponse = {
    data?: {
        success?: boolean;
        data?: StudentSearchResult[];
    };
};

/**
 * Debounced student search by name/email.
 * Unifies getQueryStudentsResultsQuery usage and returns a stable results array for dropdowns.
 */
export function useStudentSearch(
    searchTerm: string,
    options?: UseStudentSearchOptions
) {
    const debounceMs = options?.debounceMs ?? 300;
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const t = setTimeout(
            () => setDebouncedSearchTerm(searchTerm),
            debounceMs
        );
        return () => clearTimeout(t);
    }, [searchTerm, debounceMs]);

    const query = getQueryStudentsResultsQuery(debouncedSearchTerm);
    const result = useQuery({
        ...query,
        enabled: query.enabled as boolean
    });

    const results = useMemo((): StudentSearchResult[] => {
        if (!debouncedSearchTerm.trim()) return [];
        const response = result.data as StudentSearchApiResponse | undefined;
        const body = response?.data;
        if (result.isSuccess && body?.success && Array.isArray(body.data)) {
            return body.data;
        }
        return [];
    }, [debouncedSearchTerm, result.isSuccess, result.data]);

    return {
        ...result,
        results,
        queryKey: query.queryKey
    };
}
