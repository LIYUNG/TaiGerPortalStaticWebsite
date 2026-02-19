import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getStudentsAndDocLinks2Query } from '@/api/query';

export type StudentsAndDocLinksParams = Record<
    string,
    string | number | boolean | undefined
>;

export type UseStudentsAndDocLinksOptions = {
    enabled?: boolean;
};

/**
 * Fetches students and base document links with optional filter params.
 * Unifies getStudentsAndDocLinks2Query usage across BaseDocuments and AllBaseDocuments.
 */
export function useStudentsAndDocLinks(
    params: StudentsAndDocLinksParams = {},
    options?: UseStudentsAndDocLinksOptions
) {
    const queryStringValue = queryString.stringify(params);
    const query = getStudentsAndDocLinks2Query(queryStringValue);

    const result = useQuery({
        ...query,
        enabled: options?.enabled ?? true
    });

    const students = result.data?.data;
    const base_docs_link = result.data?.base_docs_link;

    return {
        ...result,
        students,
        base_docs_link,
        queryKey: query.queryKey
    };
}
