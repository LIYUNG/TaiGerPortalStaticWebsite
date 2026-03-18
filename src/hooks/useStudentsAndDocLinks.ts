import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getStudentsAndDocLinks2 } from '@/api';
import type { GetStudentsAndDocLinksResponse } from '@taiger-common/model';

export type StudentsAndDocLinksParams = Record<
    string,
    string | number | boolean | undefined
>;

export type UseStudentsAndDocLinksOptions = {
    enabled?: boolean;
};

/**
 * Fetches students and base document links with optional filter params.
 */
export function useStudentsAndDocLinks(
    params: StudentsAndDocLinksParams = {},
    options?: UseStudentsAndDocLinksOptions
) {
    const queryStringValue = queryString.stringify(params);
    const queryKey = ['students/doc-links', queryStringValue] as const;

    const result = useQuery({
        queryKey,
        queryFn: () => getStudentsAndDocLinks2(queryStringValue),
        staleTime: 1000 * 60 * 1, // 1 minute
        enabled: options?.enabled ?? true
    });

    const raw = result.data as GetStudentsAndDocLinksResponse | undefined;
    const students = raw?.data;
    const base_docs_link = (raw as { base_docs_link?: unknown })
        ?.base_docs_link;

    return {
        ...result,
        students,
        base_docs_link,
        queryKey
    };
}
