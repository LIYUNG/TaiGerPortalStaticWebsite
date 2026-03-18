import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getStudentsV3 } from '@/api';
import type {
    GetStudentsResponse,
    IStudentResponse
} from '@taiger-common/model';

export type StudentsV3Params = Record<
    string,
    string | number | boolean | string[] | undefined
>;

export type UseStudentsV3Options = {
    enabled?: boolean;
};

/**
 * Fetches students v3 with optional filter params.
 */
export function useStudentsV3(
    params: StudentsV3Params = {},
    options?: UseStudentsV3Options
) {
    const queryStringValue = queryString.stringify(params);

    const result = useQuery<GetStudentsResponse, Error, IStudentResponse[]>({
        queryKey: ['students/v3', queryStringValue],
        queryFn: () => getStudentsV3(queryStringValue),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? [],
        enabled: options?.enabled ?? true
    });

    return {
        ...result,
        queryKey: ['students/v3', queryStringValue]
    };
}
