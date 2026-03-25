import { useQuery } from '@tanstack/react-query';

import { getCourseKeywordSets } from '@/api';
import type { GetCourseKeywordsetsResponse } from '@taiger-common/model';

export type CourseKeywordSetRow = NonNullable<
    GetCourseKeywordsetsResponse['data']
>[number];

/**
 * Fetches all course keyword sets.
 */
export function useCourseKeywordSets() {
    const result = useQuery<
        GetCourseKeywordsetsResponse,
        Error,
        CourseKeywordSetRow[]
    >({
        queryKey: ['course-keywords'],
        queryFn: () => getCourseKeywordSets(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => data.data ?? []
    });

    return {
        ...result,
        queryKey: ['course-keywords'] as const
    };
}
