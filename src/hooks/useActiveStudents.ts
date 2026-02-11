import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveStudentsQuery } from '@api/query';

export type ActiveStudentsParams = Record<
    string,
    string | number | boolean | undefined
>;

/**
 * Fetches active students with optional filter params.
 * Unifies getActiveStudentsQuery usage across StudentOverview, MyStudentsOverview, StudentAdmissionTables.
 */
export function useActiveStudents(params: ActiveStudentsParams = {}) {
    const queryStringValue = queryString.stringify(params);
    const query = getActiveStudentsQuery(queryStringValue);

    const result = useQuery(query);

    return {
        ...result,
        data: result.data ?? [],
        queryKey: query.queryKey
    };
}
